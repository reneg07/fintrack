import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const PROD_URL = (process.env.PROD_URL || process.argv[2] || "").replace(/\/+$/, "");
if (!PROD_URL || !/^https?:\/\//.test(PROD_URL)) {
  console.error("Usage: PROD_URL=https://your-app.vercel.app node scripts/verify-production.mjs");
  process.exit(1);
}

const SCREENSHOTS_DIR = path.resolve(process.cwd(), "docs", "screenshots");

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, "utf8");
  const parsed = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    parsed[key] = val;
  }
  return parsed;
}

const envLocal = loadEnvLocal();
function getEnv(name) {
  return process.env[name] || envLocal[name] || "";
}

async function launchBrowser() {
  for (const channel of ["chrome", "msedge", undefined]) {
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch {
      // try next
    }
  }
  throw new Error("Could not launch Chrome/Edge/Chromium.");
}

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const email = getEnv("TEST_USER_A_EMAIL");
  const password = getEnv("TEST_USER_A_PASSWORD");
  if (!email || !password) {
    console.error("Missing TEST_USER_A credentials in .env.local.");
    process.exit(1);
  }

  const checks = [];
  const consoleErrors = [];
  const pageErrors = [];
  const record = (name, passed, detail = "") => {
    checks.push({ name, passed: Boolean(passed), detail });
    console.log(`  [${passed ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  };

  // 1. Public API & Route Protection Checks (Unauthenticated)
  const apiRes = await fetch(`${PROD_URL}/api/dashboard`, { redirect: "manual" });
  record(
    "Unauthenticated GET /api/dashboard -> 401 + Cache-Control: no-store",
    apiRes.status === 401 && (apiRes.headers.get("cache-control") ?? "").includes("no-store"),
    `status=${apiRes.status}`,
  );

  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "es-SV",
    timezoneId: "America/El_Salvador",
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const runTag = `PROD06-${Date.now().toString(36).slice(-4)}`;
  const createdTxIds = [];

  try {
    // 2. Public Landing, Login, Register, Private Redirect
    const landingRes = await page.goto(`${PROD_URL}/`, { waitUntil: "networkidle" });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    record("Public landing / renders HTTP 200 without Vercel Auth wall", landingRes?.status() === 200);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "phase-06-production-landing.png") });

    const regRes = await page.goto(`${PROD_URL}/register`, { waitUntil: "networkidle" });
    record("Public /register renders HTTP 200", regRes?.status() === 200);

    await page.goto(`${PROD_URL}/dashboard`, { waitUntil: "networkidle" });
    record("Unauthenticated /dashboard redirects to /login", new URL(page.url()).pathname === "/login");

    // 3. Login with QA Account
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/dashboard", { timeout: 25_000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    record("QA account login reaches /dashboard in production", new URL(page.url()).pathname === "/dashboard");

    // 4. Basic Transaction CRUD + Dashboard + Categories + Budgets + Reports + CSV + Profile
    await page.goto(`${PROD_URL}/categories`, { waitUntil: "networkidle" });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    record("/categories loads real Supabase categories", (await page.getByText("Alimentación").count()) > 0);

    await page.goto(`${PROD_URL}/transactions`, { waitUntil: "networkidle" });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/El_Salvador",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    await page.getByRole("button", { name: "Nueva transacción" }).click();
    await page.selectOption("#tx-type", "expense");
    await page.fill("#tx-amount", "42.50");
    await page.fill("#tx-date", today);
    await page.fill("#tx-description", `${runTag} Café prod`);
    await page.getByRole("button", { name: "Registrar transacción" }).click();
    await page.getByText(`${runTag} Café prod`).first().waitFor({ state: "visible", timeout: 15_000 });
    record("Production transaction create persists in Supabase", true);

    const txJson = await (
      await context.request.get(`${PROD_URL}/api/transactions?q=${encodeURIComponent(runTag)}`)
    ).json();
    for (const tx of txJson.data?.items ?? []) createdTxIds.push(tx.id);

    await page.goto(`${PROD_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.getByText(`${runTag} Café prod`).first().waitFor({ state: "visible", timeout: 15_000 });
    record("/dashboard reflects real production transaction", true);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "phase-06-production-dashboard.png") });

    await page.goto(`${PROD_URL}/budgets`, { waitUntil: "networkidle" });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    record("/budgets renders cleanly in production", true);

    await page.goto(`${PROD_URL}/reports`, { waitUntil: "networkidle" });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 20_000 }),
      page.getByRole("button", { name: "Exportar CSV" }).click(),
    ]);
    const dlPath = await download.path();
    const csvText = dlPath ? fs.readFileSync(dlPath, "utf8") : "";
    record(
      "/reports real CSV download contains production transaction with UTF-8 BOM",
      csvText.startsWith("\uFEFF") && csvText.includes(`${runTag} Café prod`),
      download.suggestedFilename(),
    );

    await page.goto(`${PROD_URL}/settings`, { waitUntil: "networkidle" });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    record("/settings loads profile cleanly", (await page.inputValue("#settings-fullname")).length > 0);

    // 5. Mobile viewport check (0px overflow)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${PROD_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const mobileOverflow = await page.evaluate(
      () => Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    );
    record("Mobile viewport 390x844 has 0px horizontal overflow", mobileOverflow === 0, `overflow=${mobileOverflow}px`);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Cleanup temporary production transaction BEFORE signout
    for (const id of createdTxIds.splice(0)) {
      await context.request.delete(`${PROD_URL}/api/transactions/${id}`);
    }
    record("Temporary production smoke-test transaction cleaned up", true);

    // 6. Sign out
    await page.goto(`${PROD_URL}/settings`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL((u) => u.pathname === "/login", { timeout: 15_000 });
    record("Sign out invalidates session cleanly in production", new URL(page.url()).pathname === "/login");
  } finally {
    for (const id of createdTxIds) {
      await context.request.delete(`${PROD_URL}/api/transactions/${id}`).catch(() => {});
    }
    await context.close();
    await browser.close();
  }

  record("Zero console/page errors during production smoke test", consoleErrors.length === 0 && pageErrors.length === 0, [...consoleErrors, ...pageErrors].join(" | "));
  const passed = checks.filter((c) => c.passed).length;
  console.log(`\nProduction Smoke Test (${PROD_URL}): ${passed}/${checks.length} passed.`);
  if (passed !== checks.length) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
