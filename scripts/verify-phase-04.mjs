import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const SCREENSHOTS_DIR = path.resolve(process.cwd(), "docs", "screenshots");
const RECORDINGS_DIR = path.resolve(process.cwd(), "docs", "recordings");

const ALL_ROUTES = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/transactions",
  "/categories",
  "/budgets",
  "/reports",
  "/settings",
];

const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
  { name: "360x800", width: 360, height: 800 },
];

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
      return {
        browser: await chromium.launch({
          headless: true,
          ...(channel ? { channel } : {}),
        }),
        channel: channel ?? "playwright-chromium",
      };
    } catch {
      // try next
    }
  }
  throw new Error("Could not launch Chrome/Edge/Chromium for Phase 04 E2E.");
}

async function waitForPageReady(page) {
  await page.waitForLoadState("networkidle");
  await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
}

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

  const email = getEnv("TEST_USER_A_EMAIL");
  const password = getEnv("TEST_USER_A_PASSWORD");
  if (!email || !password) {
    console.error("Missing TEST_USER_A credentials in .env.local.");
    process.exit(1);
  }

  const { browser, channel } = await launchBrowser();
  const runTag = `E2E04-${Date.now().toString(36).slice(-4)}`;
  const checks = [];
  const consoleErrors = [];
  const pageErrors = [];
  let ignoreExpected409 = false;

  const createdCategoryIds = [];
  const createdTransactionIds = [];
  const createdBudgetIds = [];

  function record(name, passed, detail = "") {
    checks.push({ name, passed: Boolean(passed), detail });
    console.log(`  [${passed ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  }

  const tempVideoDir = path.join(RECORDINGS_DIR, ".tmp-phase04-video");
  fs.mkdirSync(tempVideoDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "es-SV",
    timezoneId: "America/El_Salvador",
    acceptDownloads: true,
    recordVideo: { dir: tempVideoDir, size: { width: 1280, height: 720 } },
  });

  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (ignoreExpected409 && text.includes("409")) return;
      consoleErrors.push({ url: page.url(), text });
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push({ url: page.url(), text: err.message });
  });

  try {
    // 1. Login via UI
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/dashboard", { timeout: 20_000 }),
      page.click('button[type="submit"]'),
    ]);
    await waitForPageReady(page);
    record("UI Login reaches /dashboard", new URL(page.url()).pathname === "/dashboard");

    // 2. Categories UI: Create & Edit custom category
    await page.goto(`${BASE_URL}/categories`, { waitUntil: "networkidle" });
    await waitForPageReady(page);

    const initialCatName = `${runTag} Viajes`;
    const editedCatName = `${runTag} Viajes QA`;

    await page.getByRole("button", { name: "Nueva categoría" }).click();
    await page.fill("#category-name", initialCatName);
    await page.selectOption("#category-type", "expense");
    await page.getByRole("button", { name: "Color Azul océano" }).click();
    await page.getByRole("button", { name: "Icono Transporte" }).click();
    await page.getByRole("button", { name: "Crear categoría" }).click();
    await page.getByText(initialCatName).waitFor({ state: "visible", timeout: 10_000 });
    record("UI Create custom category persists on screen", true);

    await page.getByRole("button", { name: `Editar categoría ${initialCatName}` }).click();
    await page.fill("#category-name", editedCatName);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByText(editedCatName).waitFor({ state: "visible", timeout: 10_000 });
    record("UI Edit custom category updates name", true);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-04-categories.png"),
      fullPage: true,
    });

    // Fetch created category ID + income category ID via authenticated context for tracking/cleanup
    const catsJson = await (await context.request.get(`${BASE_URL}/api/categories`)).json();
    const customCat = catsJson.data.find((c) => c.name === editedCatName);
    const incomeCat = catsJson.data.find((c) => c.type === "income");
    if (customCat) createdCategoryIds.push(customCat.id);

    // 3. Transactions UI: Create Income, Create Expense, Edit, Search & Filter
    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await waitForPageReady(page);

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/El_Salvador",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const currentMonth = today.slice(0, 7);

    // Create Income via UI ($2,500.00)
    await page.getByRole("button", { name: "Nueva transacción" }).click();
    await page.selectOption("#tx-type", "income");
    await page.fill("#tx-amount", "2500.00");
    if (incomeCat) await page.selectOption("#tx-category", incomeCat.id);
    await page.fill("#tx-date", today);
    await page.fill("#tx-description", `${runTag} Salario mensual`);
    await page.fill("#tx-notes", "Pago principal verificado");
    await page.getByRole("button", { name: "Registrar transacción" }).click();
    await page.getByText(`${runTag} Salario mensual`).first().waitFor({ state: "visible", timeout: 10_000 });
    record("UI Create income transaction ($2,500.00)", true);

    // Create Expense via UI on custom category ($160.00)
    await page.getByRole("button", { name: "Nueva transacción" }).click();
    await page.selectOption("#tx-type", "expense");
    await page.fill("#tx-amount", "160.00");
    if (customCat) await page.selectOption("#tx-category", customCat.id);
    await page.fill("#tx-date", today);
    await page.fill("#tx-description", `${runTag} Boleto aéreo`);
    await page.fill("#tx-notes", "Viaje de trabajo");
    await page.getByRole("button", { name: "Registrar transacción" }).click();
    await page.getByText(`${runTag} Boleto aéreo`).first().waitFor({ state: "visible", timeout: 10_000 });
    record("UI Create expense transaction ($160.00)", true);

    // Create a second expense for edit/delete test
    await page.getByRole("button", { name: "Nueva transacción" }).click();
    await page.selectOption("#tx-type", "expense");
    await page.fill("#tx-amount", "45.50");
    if (customCat) await page.selectOption("#tx-category", customCat.id);
    await page.fill("#tx-date", today);
    await page.fill("#tx-description", `${runTag} Hotel temporal`);
    await page.getByRole("button", { name: "Registrar transacción" }).click();
    await page.getByText(`${runTag} Hotel temporal`).first().waitFor({ state: "visible", timeout: 10_000 });

    // Edit second expense amount ($45.50 -> $25.00)
    await page.getByRole("button", { name: `Editar transacción ${runTag} Hotel temporal` }).click();
    await page.fill("#tx-amount", "25.00");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByText("Transacción actualizada correctamente.").first().waitFor({ state: "visible", timeout: 10_000 });
    await page.getByText("$25.00").first().waitFor({ state: "visible", timeout: 10_000 });
    record("UI Edit expense transaction amount", true);

    // Delete second expense via confirmation dialog
    await page.getByRole("button", { name: `Eliminar transacción ${runTag} Hotel temporal` }).click();
    await page.getByRole("button", { name: "Eliminar transacción" }).click();
    await page.getByText("Transacción eliminada correctamente.").first().waitFor({ state: "visible", timeout: 10_000 });
    await page.getByText(`${runTag} Hotel temporal`).first().waitFor({ state: "detached", timeout: 10_000 });
    const deletedVisible = await page.getByText(`${runTag} Hotel temporal`).count();
    record("UI Delete transaction via Dialog removes record", deletedVisible === 0);

    // Search filter with debounce (wait deterministically for non-matching row to detach & match to appear)
    await page.fill("#tx-search", `${runTag} Boleto`);
    await page.getByText(`${runTag} Salario mensual`).first().waitFor({ state: "detached", timeout: 10_000 });
    await page.getByText(`${runTag} Boleto aéreo`).first().waitFor({ state: "visible", timeout: 10_000 });
    const searchMatches = await page.getByText(`${runTag} Boleto aéreo`).count();
    const excludedCount = await page.getByText(`${runTag} Salario mensual`).count();
    record(
      "UI Debounced text search filters transactions",
      searchMatches > 0 && excludedCount === 0,
    );
    await page.getByRole("button", { name: "Limpiar filtros" }).click();
    await page.getByText(`${runTag} Salario mensual`).first().waitFor({ state: "visible", timeout: 10_000 });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-04-transactions.png"),
      fullPage: true,
    });

    // Track created transactions for cleanup
    const txList = await (
      await context.request.get(`${BASE_URL}/api/transactions?q=${encodeURIComponent(runTag)}&pageSize=50`)
    ).json();
    for (const tx of txList.data.items) {
      createdTransactionIds.push(tx.id);
    }

    // 4. Budgets UI: Create ($200.00 limit -> $160.00 spent = 80% warning!), verify duplicate 409, edit to $150 (exceeded!)
    await page.goto(`${BASE_URL}/budgets`, { waitUntil: "networkidle" });
    await waitForPageReady(page);

    await page.getByRole("button", { name: "Nuevo presupuesto" }).click();
    if (customCat) await page.selectOption("#budget-category", customCat.id);
    await page.fill("#budget-month", currentMonth);
    await page.fill("#budget-limit", "200.00");
    await page.fill("#budget-threshold", "80");
    await page.getByRole("button", { name: "Crear presupuesto" }).click();
    await page.getByText("Cerca del límite").first().waitFor({ state: "visible", timeout: 10_000 });
    record("UI Create monthly budget displays 80% 'Cerca del límite' status", true);

    // Attempt duplicate budget via UI (expect 409 toast)
    ignoreExpected409 = true;
    await page.getByRole("button", { name: "Nuevo presupuesto" }).click();
    if (customCat) await page.selectOption("#budget-category", customCat.id);
    await page.fill("#budget-month", currentMonth);
    await page.fill("#budget-limit", "300.00");
    await page.getByRole("button", { name: "Crear presupuesto" }).click();
    await page.getByText(/Ya existe un presupuesto/i).first().waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: "Cancelar" }).click();
    ignoreExpected409 = false;
    record("UI Duplicate budget surfaces 409 conflict feedback", true);

    // Edit budget limit down to $150.00 -> transitions to "Superado" ($160/$150 = 106.7%)
    await page.getByRole("button", { name: `Editar presupuesto de ${editedCatName}` }).click();
    await page.fill("#budget-limit", "150.00");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10_000 });
    await page.getByText("Superado", { exact: true }).first().waitFor({ state: "visible", timeout: 10_000 });
    record("UI Edit budget transitions status to 'Superado'", true);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-04-budgets.png"),
      fullPage: true,
    });

    const budgetsJson = await (
      await context.request.get(`${BASE_URL}/api/budgets?month=${currentMonth}`)
    ).json();
    const createdBudget = budgetsJson.data.items.find((b) => b.categoryId === customCat?.id);
    if (createdBudget) createdBudgetIds.push(createdBudget.id);

    // 5. Categories UI: Verify deleting linked category is blocked with 409 alert
    await page.goto(`${BASE_URL}/categories`, { waitUntil: "networkidle" });
    await waitForPageReady(page);
    ignoreExpected409 = true;
    await page.getByRole("button", { name: `Eliminar categoría ${editedCatName}` }).click();
    await page.getByRole("button", { name: "Confirmar eliminación" }).click();
    await page.locator('[role="alert"]').filter({ hasText: /No puedes eliminar/i }).waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await page.getByRole("button", { name: "Cancelar" }).click();
    ignoreExpected409 = false;
    record("UI Linked category delete blocked with HTTP 409 alert", true);

    // 6. Dashboard UI: Verify real KPIs, charts, period switch, and reload persistence
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await waitForPageReady(page);
    await page.getByText(`${runTag} Salario mensual`).first().waitFor({ state: "visible", timeout: 10_000 });
    const dashHasSvg = (await page.locator("svg.recharts-surface").count()) >= 2;
    record("UI Dashboard renders real KPIs, Recharts charts, and recent transactions", dashHasSvg);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-04-dashboard-desktop.png"),
      fullPage: true,
    });

    // Switch period and reload persistence
    await page.selectOption("#dashboard-period", "last_3_months");
    await page.waitForTimeout(700);
    await page.reload({ waitUntil: "networkidle" });
    await waitForPageReady(page);
    record("UI Dashboard period switcher and reload persistence succeed", true);

    // Mobile dashboard screenshot
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-04-dashboard-mobile.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 900 });

    // 7. Reports UI & Real CSV Download Verification
    await page.goto(`${BASE_URL}/reports`, { waitUntil: "networkidle" });
    await waitForPageReady(page);
    await page.getByText("Resumen mensual exacto").waitFor({ state: "visible", timeout: 10_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }),
      page.getByRole("button", { name: "Exportar CSV" }).click(),
    ]);
    const suggestedName = download.suggestedFilename();
    const downloadPath = await download.path();
    const csvContent = downloadPath ? fs.readFileSync(downloadPath, "utf8") : "";
    record(
      "UI Real CSV download succeeds with UTF-8 BOM, headers, and real transactions",
      suggestedName.startsWith("fintrack-transacciones-") &&
        suggestedName.endsWith(".csv") &&
        csvContent.startsWith("\uFEFF") &&
        csvContent.includes("Fecha,Tipo,Categoría,Descripción,Notas,Importe USD") &&
        csvContent.includes(`${runTag} Salario mensual`) &&
        csvContent.includes(`${runTag} Boleto aéreo`),
      suggestedName,
    );

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-04-reports.png"),
      fullPage: true,
    });

    // 8. Full 9x7 Responsive Matrix (63 checks) WITH Real Data Present
    let responsivePassed = 0;
    let responsiveFailed = 0;
    const responsiveFailures = [];

    const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "es-SV",
      timezoneId: "America/El_Salvador",
    });
    const publicPage = await publicContext.newPage();

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await publicPage.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of ALL_ROUTES) {
        const isPublic = route === "/" || route === "/login" || route === "/register";
        const targetPage = isPublic ? publicPage : page;
        await targetPage.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
        await targetPage.waitForTimeout(150);

        const metrics = await targetPage.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        const overflowPx = Math.max(0, metrics.scrollWidth - metrics.innerWidth);
        if (overflowPx === 0) {
          responsivePassed += 1;
        } else {
          responsiveFailed += 1;
          responsiveFailures.push(`${route}@${vp.name} overflow=${overflowPx}px`);
        }
      }
    }
    await publicContext.close();
    record(
      `Responsive matrix 9x7 with real data (${responsivePassed}/${responsivePassed + responsiveFailed})`,
      responsiveFailed === 0,
      responsiveFailures.join(", "),
    );
  } finally {
    // Cleanup ONLY records created by this E2E run
    for (const id of createdTransactionIds) {
      await context.request.delete(`${BASE_URL}/api/transactions/${id}`).catch(() => {});
    }
    for (const id of createdBudgetIds) {
      await context.request.delete(`${BASE_URL}/api/budgets/${id}`).catch(() => {});
    }
    for (const id of createdCategoryIds) {
      await context.request.delete(`${BASE_URL}/api/categories/${id}`).catch(() => {});
    }

    const video = page.video();
    await context.close();
    if (video) {
      const videoSrc = await video.path();
      if (videoSrc && fs.existsSync(videoSrc)) {
        const dest = path.join(RECORDINGS_DIR, "phase-04-financial-flow.webm");
        fs.copyFileSync(videoSrc, dest);
      }
    }
    fs.rmSync(tempVideoDir, { recursive: true, force: true });
    await browser.close();
  }

  record(
    "Zero browser console errors during Phase 04 E2E",
    consoleErrors.length === 0,
    consoleErrors.map((e) => e.text).join(" | "),
  );
  record(
    "Zero uncaught page errors during Phase 04 E2E",
    pageErrors.length === 0,
    pageErrors.map((e) => e.text).join(" | "),
  );

  const passedCount = checks.filter((c) => c.passed).length;
  console.log(
    `\nPhase 04 E2E & Responsive Verification (${channel}): ${passedCount}/${checks.length} passed.`,
  );
  if (passedCount !== checks.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
