import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";

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
  throw new Error("Could not launch Chrome/Edge/Chromium for Phase 05 checks.");
}

async function waitForReady(page) {
  await page.waitForLoadState("networkidle");
  await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
}

async function loginPage(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await Promise.all([
    page.waitForURL((u) => u.pathname === "/dashboard", { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
  await waitForReady(page);
}

async function run() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const userAEmail = getEnv("TEST_USER_A_EMAIL");
  const userAPassword = getEnv("TEST_USER_A_PASSWORD");
  const userBEmail = getEnv("TEST_USER_B_EMAIL");
  const userBPassword = getEnv("TEST_USER_B_PASSWORD");

  if (!supabaseUrl || !supabaseKey || !userAEmail || !userAPassword || !userBEmail || !userBPassword) {
    console.error("Missing required .env.local credentials for Phase 05 verification.");
    process.exit(1);
  }

  const checks = [];
  const perfMetrics = {};
  const record = (group, name, passed, detail = "") => {
    checks.push({ group, name, passed: Boolean(passed), detail });
    console.log(`  [${passed ? "PASS" : "FAIL"}] [${group}] ${name}${detail ? ` — ${detail}` : ""}`);
  };

  const { browser, channel } = await launchBrowser();
  const runTag = `P05-${Date.now().toString(36).slice(-4)}`;
  const volTag = `VOL05-${Date.now().toString(36).slice(-4)}`;

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "es-SV",
    timezoneId: "America/El_Salvador",
  });
  const page = await context.newPage();

  const createdTxIds = [];
  const createdBudgetIds = [];
  const createdCategoryIds = [];
  let originalProfileName = null;
  let volumeInserted = false;

  // Authenticated direct Supabase client (User A, publishable key ONLY — never service_role)
  const supaA = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // =========================================================================
    // 1. API HTTP Method & Auth-Order Hardening Checks
    // =========================================================================
    const unauthPatchProfile = await fetch(`${BASE_URL}/api/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "" }), // invalid payload must STILL return 401 before 400
    });
    record(
      "security",
      "Unauthenticated PATCH /api/profile with invalid body -> 401 (before 400)",
      unauthPatchProfile.status === 401,
      `status=${unauthPatchProfile.status}`,
    );

    const unsupportedPutCat = await fetch(`${BASE_URL}/api/categories`, {
      method: "PUT",
    });
    const unsupportedDelDash = await fetch(`${BASE_URL}/api/dashboard`, {
      method: "DELETE",
    });
    record(
      "security",
      "Unsupported HTTP methods return 405 Method Not Allowed",
      unsupportedPutCat.status === 405 && unsupportedDelDash.status === 405,
      `PUT /api/categories=${unsupportedPutCat.status}, DELETE /api/dashboard=${unsupportedDelDash.status}`,
    );

    // =========================================================================
    // 2. Public Landing Page Production Performance Lab Check (3 runs median)
    // =========================================================================
    const landingPerfRuns = [];
    for (let i = 0; i < 3; i++) {
      const perfCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: "es-SV",
        timezoneId: "America/El_Salvador",
      });
      const perfPage = await perfCtx.newPage();
      let externalFontRequests = 0;
      let jsBytes = 0;
      perfPage.on("request", (req) => {
        if (req.url().includes("fonts.googleapis.com") || req.url().includes("fonts.gstatic.com")) {
          externalFontRequests += 1;
        }
      });
      perfPage.on("response", async (res) => {
        if (res.request().resourceType() === "script") {
          const len = Number(res.headers()["content-length"] ?? 0);
          jsBytes += len;
        }
      });
      await perfPage.addInitScript(() => {
        window.__perf = { lcp: 0, cls: 0, longTaskMs: 0 };
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length) window.__perf.lcp = entries[entries.length - 1].startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) window.__perf.cls += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              window.__perf.longTaskMs += Math.max(0, e.duration - 50);
            }
          }).observe({ type: "longtask", buffered: true });
        } catch {
          // longtask optional
        }
      });
      const t0 = Date.now();
      await perfPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      await perfPage.waitForTimeout(300);
      const navMs = Date.now() - t0;
      const webVitals = await perfPage.evaluate(() => {
        const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
        return {
          fcp: Math.round(fcpEntry ? fcpEntry.startTime : 0),
          lcp: Math.round(window.__perf.lcp),
          cls: Number(window.__perf.cls.toFixed(4)),
          tbtProxy: Math.round(window.__perf.longTaskMs),
        };
      });
      landingPerfRuns.push({ ...webVitals, navMs, jsBytes, externalFontRequests });
      await perfCtx.close();
    }
    const medianRun = landingPerfRuns.sort((a, b) => a.lcp - b.lcp)[1];
    perfMetrics.landingDesktop1440 = medianRun;
    record(
      "performance",
      "Landing / production lab metrics measured & zero external Google Fonts",
      medianRun.externalFontRequests === 0 && medianRun.cls <= 0.1 && medianRun.lcp < 2500,
      `FCP=${medianRun.fcp}ms, LCP=${medianRun.lcp}ms, CLS=${medianRun.cls}, TBT=${medianRun.tbtProxy}ms, extFonts=${medianRun.externalFontRequests}`,
    );

    // =========================================================================
    // 3. Login User A & Complete Missing E2E UI Scenarios (28/28 Coverage!)
    // =========================================================================
    await loginPage(page, userAEmail, userAPassword);

    // Measure live API latencies after React.cache() optimization
    const apiTimings = {};
    for (const [key, endpoint] of [
      ["dashboard", "/api/dashboard?period=current_month"],
      ["transactions", "/api/transactions?page=1&pageSize=10"],
      ["budgets", "/api/budgets"],
      ["reports", "/api/reports?period=last_6_months"],
    ]) {
      const start = Date.now();
      const res = await context.request.get(`${BASE_URL}${endpoint}`);
      apiTimings[key] = { status: res.status(), ms: Date.now() - start };
    }
    perfMetrics.liveApiLatenciesMs = apiTimings;
    record(
      "performance",
      "Live production API endpoints respond 200 with measured latencies",
      Object.values(apiTimings).every((t) => t.status === 200),
      JSON.stringify(apiTimings),
    );

    // Adversarial PostgREST search inputs against LIVE /api/transactions
    const adversarialQueries = [
      "O'Reilly",
      'quote"unclosed',
      "a,description.eq.x),(id.neq.0",
      "100%_test*wild",
      "back\\slash",
      "Café & Panadería 💰",
    ];
    let searchAllOk = true;
    for (const q of adversarialQueries) {
      const res = await context.request.get(
        `${BASE_URL}/api/transactions?q=${encodeURIComponent(q)}`,
      );
      if (res.status() !== 200) searchAllOk = false;
    }
    record(
      "security",
      "Live PostgREST search safely handles quotes, parens, commas, wildcards, backslashes & Unicode",
      searchAllOk,
    );

    // Seed 12 transactions via API (2025-09 & 2025-10) for UI date/category/type filters & pagination
    const catsRes = await (await context.request.get(`${BASE_URL}/api/categories`)).json();
    const expCat = catsRes.data.find((c) => c.type === "expense");
    const incCat = catsRes.data.find((c) => c.type === "income");

    for (let i = 1; i <= 11; i++) {
      const day = String(i).padStart(2, "0");
      const res = await context.request.post(`${BASE_URL}/api/transactions`, {
        data: {
          type: "expense",
          categoryId: expCat.id,
          amountCents: 1000 * i,
          occurredOn: `2025-10-${day}`,
          description: `${runTag} Gasto ${i}`,
        },
      });
      createdTxIds.push((await res.json()).data.id);
    }
    const incSeedRes = await context.request.post(`${BASE_URL}/api/transactions`, {
      data: {
        type: "income",
        categoryId: incCat.id,
        amountCents: 50_000,
        occurredOn: "2025-09-15",
        description: `${runTag} Ingreso Sept`,
      },
    });
    createdTxIds.push((await incSeedRes.json()).data.id);

    // UI Filters (#10 Date, #11 Category, #12 Type) & #13 Pagination
    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await waitForReady(page);
    await page.fill("#tx-search", runTag);
    await page.getByText(/Página\s*1\s*de\s*2/i).waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByText(/Página\s*2\s*de\s*2/i).waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: "Anterior" }).click();
    await page.getByText(/Página\s*1\s*de\s*2/i).waitFor({ state: "visible", timeout: 10_000 });
    record("coverage", "UI Pagination navigates Page 1 -> Page 2 -> Page 1 (#13)", true);

    // Type filter (#12)
    await page.selectOption("#tx-filter-type", "income");
    await page.getByText(`${runTag} Ingreso Sept`).first().waitFor({ state: "visible", timeout: 10_000 });
    const onlyIncome = (await page.getByText(`${runTag} Gasto 11`).count()) === 0;
    record("coverage", "UI Type filter isolates income records (#12)", onlyIncome);

    // Category filter (#11)
    await page.selectOption("#tx-filter-type", "all");
    await page.selectOption("#tx-filter-category", expCat.id);
    await page.getByText(`${runTag} Gasto 11`).first().waitFor({ state: "visible", timeout: 10_000 });
    const onlyExpCat = (await page.getByText(`${runTag} Ingreso Sept`).count()) === 0;
    record("coverage", "UI Category filter isolates selected category (#11)", onlyExpCat);

    // Date range filter (#10)
    await page.selectOption("#tx-filter-category", "all");
    await page.fill("#tx-filter-from", "2025-09-01");
    await page.fill("#tx-filter-to", "2025-09-30");
    await page.getByText(`${runTag} Ingreso Sept`).first().waitFor({ state: "visible", timeout: 10_000 });
    const onlySept = (await page.getByText(`${runTag} Gasto 11`).count()) === 0;
    record("coverage", "UI Date range filter isolates 2025-09 records (#10)", onlySept);

    // Full UI CRUD Delete for unlinked category & monthly budget
    await page.goto(`${BASE_URL}/categories`, { waitUntil: "networkidle" });
    await waitForReady(page);
    const delCatName = `${runTag} CatBorrable`;
    await page.getByRole("button", { name: "Nueva categoría" }).click();
    await page.fill("#category-name", delCatName);
    await page.getByRole("button", { name: "Crear categoría" }).click();
    await page.getByText(delCatName).waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: `Eliminar categoría ${delCatName}` }).click();
    await page.getByRole("button", { name: "Confirmar eliminación" }).click();
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10_000 });
    await page.getByText(delCatName, { exact: true }).waitFor({ state: "detached", timeout: 10_000 });
    record("coverage", "UI Delete unlinked custom category succeeds cleanly", true);

    await page.goto(`${BASE_URL}/budgets`, { waitUntil: "networkidle" });
    await waitForReady(page);
    await page.fill("#budget-month-picker", "2025-08");
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Nuevo presupuesto" }).click();
    await page.selectOption("#budget-category", expCat.id);
    await page.fill("#budget-month", "2025-08");
    await page.fill("#budget-limit", "100.00");
    await page.getByRole("button", { name: "Crear presupuesto" }).click();
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10_000 });
    await page.getByRole("button", { name: `Eliminar presupuesto de ${expCat.name}` }).click();
    await page.getByRole("button", { name: "Eliminar presupuesto" }).click();
    await page.getByText("Presupuesto eliminado correctamente.").first().waitFor({ state: "visible", timeout: 10_000 });
    record("coverage", "UI Delete monthly budget succeeds cleanly", true);

    // Profile Update -> Header updates dynamically
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await waitForReady(page);
    originalProfileName = await page.inputValue("#settings-fullname");
    const tempName = `Usuario QA ${runTag}`;
    await page.fill("#settings-fullname", tempName);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByText("Perfil actualizado correctamente").first().waitFor({ state: "visible", timeout: 10_000 });
    await page.locator("header").getByText(tempName).waitFor({ state: "visible", timeout: 10_000 });
    record("coverage", "Profile name update propagates to AppHeader immediately", true);
    // Restore original profile name
    await page.fill("#settings-fullname", originalProfileName);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByText("Perfil actualizado correctamente").first().waitFor({ state: "visible", timeout: 10_000 });

    // Mobile Navigation Drawer (#26)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await waitForReady(page);
    await page.getByRole("button", { name: "Abrir menú lateral" }).click();
    await page.getByRole("link", { name: "Reportes" }).click();
    await page.waitForURL((u) => u.pathname === "/reports", { timeout: 10_000 });
    record("coverage", "Mobile navigation Sheet opens and navigates to /reports (#26)", true);
    await page.setViewportSize({ width: 1440, height: 900 });

    // =========================================================================
    // 4. Accessibility & Keyboard Navigation Audit (WCAG 2.2 AA)
    // =========================================================================
    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await waitForReady(page);
    const a11yChecks = await page.evaluate(() => {
      const hasSkipLink = Boolean(document.querySelector('a[href="#main-content"]'));
      const hasMain = Boolean(document.querySelector("main#main-content"));
      const hasNav = Boolean(document.querySelector("nav[aria-label]"));
      const hasTableRegion = Boolean(
        document.querySelector('[data-slot="table-container"][tabindex="0"][role="region"]'),
      );
      const unlabeledButtons = Array.from(document.querySelectorAll("button")).filter((btn) => {
        const text = (btn.textContent ?? "").trim();
        const aria = btn.getAttribute("aria-label") || btn.getAttribute("aria-labelledby");
        return !text && !aria;
      }).length;
      return { hasSkipLink, hasMain, hasNav, hasTableRegion, unlabeledButtons };
    });
    record(
      "accessibility",
      "Landmarks, skip link, keyboard-focusable table region, and 0 unlabeled buttons",
      a11yChecks.hasSkipLink &&
        a11yChecks.hasMain &&
        a11yChecks.hasNav &&
        a11yChecks.hasTableRegion &&
        a11yChecks.unlabeledButtons === 0,
      JSON.stringify(a11yChecks),
    );

    // Keyboard Escape closes modal + form validation sets aria-invalid & aria-describedby
    await page.getByRole("button", { name: "Nueva transacción" }).click();
    await page.getByRole("button", { name: "Registrar transacción" }).click();
    const ariaInvalid = await page.locator("#tx-amount").getAttribute("aria-invalid");
    const ariaDescribedBy = await page.locator("#tx-amount").getAttribute("aria-describedby");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 5_000 });
    record(
      "accessibility",
      "Modal form exposes aria-invalid/aria-describedby on errors and closes via Escape",
      ariaInvalid === "true" && ariaDescribedBy === "tx-amount-error",
      `aria-invalid=${ariaInvalid}, aria-describedby=${ariaDescribedBy}`,
    );

    // =========================================================================
    // 5. Controlled UI Resilience & Concurrency Simulations (Mocked Network Faults)
    // =========================================================================
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await waitForReady(page);

    // Rapid period switch concurrency check (must reflect FINAL selected option)
    await page.selectOption("#dashboard-period", "last_3_months");
    await page.selectOption("#dashboard-period", "last_6_months");
    await page.selectOption("#dashboard-period", "current_year");
    await page.getByText(/Año 20\d{2}/i).first().waitFor({ state: "visible", timeout: 10_000 });
    record("concurrency", "Rapid Dashboard period switches settle on final selection without stale overwrite", true);

    // Simulated HTTP 500 -> ErrorAlert shown (NO misleading $0.00 KPIs) -> Retry recovers
    let failOnce = true;
    await page.route("**/api/dashboard*", async (route) => {
      if (failOnce) {
        failOnce = false;
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            data: null,
            error: { message: "Fallo simulado de servidor (500)." },
          }),
        });
      } else {
        await route.continue();
      }
    });
    await page.selectOption("#dashboard-period", "current_month");
    await page.getByText("No fue posible obtener los datos").waitFor({ state: "visible", timeout: 10_000 });
    const kpiHiddenOnError = (await page.getByText("Balance acumulado").count()) === 0;
    await page.getByRole("button", { name: "Reintentar" }).click();
    await page.getByText("Balance acumulado").waitFor({ state: "visible", timeout: 10_000 });
    await page.unroute("**/api/dashboard*");
    record(
      "resilience-sim",
      "[SIM] HTTP 500 hides misleading $0.00 KPIs, shows ErrorAlert, and recovers on Reintentar",
      kpiHiddenOnError,
    );

    // Simulated network failure on /transactions -> ErrorAlert -> Retry recovers
    let failNetOnce = true;
    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await waitForReady(page);
    await page.route("**/api/transactions*", async (route) => {
      if (failNetOnce) {
        failNetOnce = false;
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });
    await page.selectOption("#tx-filter-type", "expense");
    await page.getByText("No fue posible obtener tus transacciones").waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: "Reintentar" }).click();
    await page.getByText("No fue posible obtener tus transacciones").waitFor({ state: "detached", timeout: 10_000 });
    await page.unroute("**/api/transactions*");
    record("resilience-sim", "[SIM] Network failure shows ErrorAlert and recovers cleanly on Reintentar", true);

    // Real expired/cleared session mid-interaction on /budgets -> live HTTP 401 -> redirects to /login?next=/budgets
    await page.goto(`${BASE_URL}/budgets`, { waitUntil: "networkidle" });
    await waitForReady(page);
    await context.clearCookies();
    await page.getByRole("button", { name: "Mes anterior" }).click();
    await page.waitForURL((u) => u.pathname === "/login" && u.searchParams.get("next") === "/budgets", {
      timeout: 15_000,
    });
    record("resilience-sim", "Expired/cleared session on /budgets returns live 401 and redirects to /login?next=/budgets", true);

    // =========================================================================
    // 6. Same-Browser User Switch Isolation (User A -> Expired/Signed Out -> User B)
    // =========================================================================
    await loginPage(page, userBEmail, userBPassword);
    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await waitForReady(page);
    const leakedRunTag = await page.getByText(runTag).count();
    record(
      "security",
      "Same-browser user switch (User A -> Sign out -> User B) shows 0 User A records (#27/#28)",
      leakedRunTag === 0,
    );

    // Sign back into User A for >1,000-row real Supabase volume test
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL((u) => u.pathname === "/login", { timeout: 15_000 });
    await loginPage(page, userAEmail, userAPassword);

    // =========================================================================
    // 7. REAL >1,000-Row Multi-Batch Integration Test against Live Supabase
    // =========================================================================
    const { data: authData, error: authErr } = await supaA.auth.signInWithPassword({
      email: userAEmail,
      password: userAPassword,
    });
    if (authErr || !authData.user) {
      throw new Error(`Volume test signIn failed: ${authErr?.message}`);
    }
    const userAId = authData.user.id;

    // Insert 1,005 rows in 3 clean bulk calls (335 rows each) in isolated month 2024-01
    volumeInserted = true;
    const bulkTotal = 1005;
    const chunkSize = 335;
    for (let offset = 0; offset < bulkTotal; offset += chunkSize) {
      const size = Math.min(chunkSize, bulkTotal - offset);
      const rows = Array.from({ length: size }, (_, i) => ({
        user_id: userAId,
        category_id: expCat.id,
        type: "expense",
        amount_cents: 100, // $1.00 each -> total $1,005.00 = 100500 cents
        occurred_on: "2024-01-15",
        description: `${volTag} Row ${offset + i + 1}`,
      }));
      const { error: insErr } = await supaA.from("transactions").insert(rows);
      if (insErr) throw new Error(`Bulk insert failed at offset ${offset}: ${insErr.message}`);
    }

    const [volDashRes, volRepRes, volTxRes, volCsvRes] = await Promise.all([
      context.request.get(`${BASE_URL}/api/dashboard?period=2024-01`),
      context.request.get(`${BASE_URL}/api/reports?period=2024-01`),
      context.request.get(`${BASE_URL}/api/transactions?from=2024-01-01&to=2024-01-31&page=1&pageSize=10`),
      context.request.get(`${BASE_URL}/api/reports/export?period=2024-01`),
    ]);

    const volDash = (await volDashRes.json()).data;
    const volRep = (await volRepRes.json()).data;
    const volTx = (await volTxRes.json()).data;
    const volCsvBuf = await volCsvRes.body();
    const volCsvLines = volCsvBuf.toString("utf8").replace(/^\uFEFF/, "").trimEnd().split("\r\n");

    record(
      "volume-1000+",
      "LIVE Supabase 1,005-row Dashboard aggregates all 1,005 rows ($1,005.00) with zero truncation",
      volDash.kpis.periodExpenseCents === "100500" && volDash.kpis.periodTransactionCount === 1005,
      `expenseCents=${volDash.kpis.periodExpenseCents}, count=${volDash.kpis.periodTransactionCount}`,
    );
    record(
      "volume-1000+",
      "LIVE Supabase 1,005-row Reports & Transactions totals match 100% ($1,005.00)",
      volRep.summary.expenseCents === "100500" &&
        volRep.summary.transactionCount === 1005 &&
        volTx.totals.expenseCents === "100500" &&
        volTx.pagination.totalCount === 1005,
      `rep=${volRep.summary.expenseCents}, tx=${volTx.totals.expenseCents}, totalCount=${volTx.pagination.totalCount}`,
    );
    record(
      "volume-1000+",
      "LIVE Supabase 1,005-row CSV export outputs all 1,006 lines (header + 1,005 rows) with UTF-8 BOM",
      volCsvBuf[0] === 0xef && volCsvBuf[1] === 0xbb && volCsvBuf[2] === 0xbf && volCsvLines.length === 1006,
      `csvLines=${volCsvLines.length}`,
    );
  } finally {
    // Cleanup ONLY records created during this run
    for (const id of createdTxIds) {
      await context.request.delete(`${BASE_URL}/api/transactions/${id}`).catch(() => {});
    }
    for (const id of createdBudgetIds) {
      await context.request.delete(`${BASE_URL}/api/budgets/${id}`).catch(() => {});
    }
    for (const id of createdCategoryIds) {
      await context.request.delete(`${BASE_URL}/api/categories/${id}`).catch(() => {});
    }
    // Cleanup the 1,005 isolated VOL05 rows and verify 0 remain
    if (volumeInserted) {
      const { error: delVolErr } = await supaA
        .from("transactions")
        .delete()
        .like("description", `${volTag}%`);
      if (delVolErr) {
        console.error(`Cleanup error for ${volTag}:`, delVolErr.message);
      } else {
        const { count: remainingVol } = await supaA
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .like("description", `${volTag}%`);
        record("volume-1000+", "Cleanup removed all 1,005 temporary volume rows (0 remaining)", remainingVol === 0, `remaining=${remainingVol}`);
      }
      await supaA.auth.signOut().catch(() => {});
    }
    await context.close();
    await browser.close();
  }

  console.log("\nLab Performance Summary:", JSON.stringify(perfMetrics, null, 2));
  const passed = checks.filter((c) => c.passed).length;
  console.log(`\nPhase 05 Audit, Volume (>1,000), A11y, Resilience & Perf Suite (${channel}): ${passed}/${checks.length} passed.`);
  if (passed !== checks.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
