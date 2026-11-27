import fs from "node:fs";
import path from "node:path";
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
      return await chromium.launch({
        headless: true,
        ...(channel ? { channel } : {}),
      });
    } catch {
      // try next
    }
  }
  throw new Error("Could not launch Chrome/Edge/Chromium for API security tests.");
}

async function loginContext(browser, email, password) {
  const context = await browser.newContext({
    locale: "es-SV",
    timezoneId: "America/El_Salvador",
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await Promise.all([
    page.waitForURL((u) => u.pathname === "/dashboard", { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.close();
  return context;
}

const results = [];
function assertCheck(name, condition, detail = "") {
  results.push({ name, passed: Boolean(condition), detail });
  if (!condition) {
    console.error(`  [FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    console.log(`  [PASS] ${name}`);
  }
}

async function run() {
  const userAEmail = getEnv("TEST_USER_A_EMAIL");
  const userAPassword = getEnv("TEST_USER_A_PASSWORD");
  const userBEmail = getEnv("TEST_USER_B_EMAIL");
  const userBPassword = getEnv("TEST_USER_B_PASSWORD");

  if (!userAEmail || !userAPassword || !userBEmail || !userBPassword) {
    console.error("Missing QA user credentials in .env.local.");
    process.exit(1);
  }

  const browser = await launchBrowser();
  const createdTxIds = [];
  const createdBudgetIds = [];
  const createdCategoryIds = [];

  let contextA;
  let contextB;

  try {
    // 1. Unauthenticated access checks across all Phase 04 APIs
    const unauthChecks = [
      { method: "GET", path: "/api/categories" },
      { method: "POST", path: "/api/categories", body: {} },
      { method: "GET", path: "/api/transactions" },
      { method: "POST", path: "/api/transactions", body: {} },
      { method: "GET", path: "/api/budgets" },
      { method: "POST", path: "/api/budgets", body: {} },
      { method: "GET", path: "/api/dashboard" },
      { method: "GET", path: "/api/reports" },
      { method: "GET", path: "/api/reports/export" },
    ];

    for (const check of unauthChecks) {
      const res = await fetch(`${BASE_URL}${check.path}`, {
        method: check.method,
        headers: check.body ? { "Content-Type": "application/json" } : {},
        body: check.body ? JSON.stringify(check.body) : undefined,
        redirect: "manual",
      });
      const cc = res.headers.get("cache-control") ?? "";
      assertCheck(
        `Unauthenticated ${check.method} ${check.path} -> 401 + no-store`,
        res.status === 401 && cc.includes("no-store"),
        `status=${res.status}, cache-control=${cc}`,
      );
    }

    // Authenticate User A and User B via real /login SSR cookie flow
    contextA = await loginContext(browser, userAEmail, userAPassword);
    contextB = await loginContext(browser, userBEmail, userBPassword);
    const reqA = contextA.request;
    const reqB = contextB.request;

    // 2. Invalid UUID -> 400 and non-existent UUID -> 404
    const fakeUuid = "00000000-0000-4000-8000-000000000099";
    for (const base of ["/api/categories", "/api/transactions", "/api/budgets"]) {
      const badIdRes = await reqA.delete(`${BASE_URL}${base}/not-a-uuid`);
      assertCheck(
        `Invalid UUID DELETE ${base}/not-a-uuid -> 400`,
        badIdRes.status() === 400,
        `status=${badIdRes.status()}`,
      );
      const missingRes = await reqA.delete(`${BASE_URL}${base}/${fakeUuid}`);
      assertCheck(
        `Missing UUID DELETE ${base}/${fakeUuid} -> 404`,
        missingRes.status() === 404,
        `status=${missingRes.status()}`,
      );
    }

    // 3. Cross-origin CSRF protection -> 403
    for (const endpoint of ["/api/categories", "/api/transactions", "/api/budgets"]) {
      const csrfRes = await reqA.post(`${BASE_URL}${endpoint}`, {
        headers: { Origin: "https://evil.example" },
        data: {},
      });
      assertCheck(
        `Cross-origin POST ${endpoint} -> 403`,
        csrfRes.status() === 403,
        `status=${csrfRes.status()}`,
      );
    }

    // Record baseline accumulated balance for User A
    const baseDashRes = await reqA.get(`${BASE_URL}/api/dashboard?period=2026-07`);
    const baseDashJson = await baseDashRes.json();
    const baselineBalance = BigInt(baseDashJson.data.kpis.accumulatedBalanceCents);
    assertCheck(
      "GET /api/dashboard returns 200 with Cache-Control: no-store",
      baseDashRes.status() === 200 &&
        (baseDashRes.headers()["cache-control"] ?? "").includes("no-store"),
    );

    // 4. Deterministic Financial Scenario (controlled months 2026-06 & 2026-07)
    const runTag = `QA04-${Date.now().toString(36).slice(-4)}`;

    const catExpRes = await reqA.post(`${BASE_URL}/api/categories`, {
      data: {
        name: `${runTag} Alimentos`,
        type: "expense",
        color: "#D97706",
        icon: "utensils",
      },
    });
    const catExpJson = await catExpRes.json();
    assertCheck(
      "POST /api/categories creates custom expense category (201)",
      catExpRes.status() === 201 && Boolean(catExpJson.data?.id),
    );
    const expCatId = catExpJson.data.id;
    createdCategoryIds.push(expCatId);

    const catIncRes = await reqA.post(`${BASE_URL}/api/categories`, {
      data: {
        name: `${runTag} Honorarios`,
        type: "income",
        color: "#059669",
        icon: "briefcase",
      },
    });
    const catIncJson = await catIncRes.json();
    assertCheck(
      "POST /api/categories creates custom income category (201)",
      catIncRes.status() === 201 && Boolean(catIncJson.data?.id),
    );
    const incCatId = catIncJson.data.id;
    createdCategoryIds.push(incCatId);

    // Duplicate category -> 409
    const dupCatRes = await reqA.post(`${BASE_URL}/api/categories`, {
      data: {
        name: `${runTag} Alimentos`,
        type: "expense",
        color: "#059669",
        icon: "tag",
      },
    });
    assertCheck(
      "Duplicate category name+type -> 409 Conflict",
      dupCatRes.status() === 409,
      `status=${dupCatRes.status()}`,
    );

    // Incompatible category type on transaction -> 400
    const mismatchTxRes = await reqA.post(`${BASE_URL}/api/transactions`, {
      data: {
        type: "expense",
        categoryId: incCatId,
        amountCents: 1000,
        occurredOn: "2026-07-02",
        description: "Mismatch test",
      },
    });
    assertCheck(
      "Expense transaction with income category -> 400",
      mismatchTxRes.status() === 400,
      `status=${mismatchTxRes.status()}`,
    );

    // Invalid amountCents <= 0 -> 400
    const zeroTxRes = await reqA.post(`${BASE_URL}/api/transactions`, {
      data: {
        type: "expense",
        categoryId: expCatId,
        amountCents: 0,
        occurredOn: "2026-07-02",
        description: "Zero test",
      },
    });
    assertCheck(
      "Transaction with amountCents=0 -> 400",
      zeroTxRes.status() === 400,
    );

    // Income category on budget -> 400
    const incBudgetRes = await reqA.post(`${BASE_URL}/api/budgets`, {
      data: {
        categoryId: incCatId,
        month: "2026-07",
        limitCents: 15000,
        alertThresholdPct: 80,
      },
    });
    assertCheck(
      "Budget on income category -> 400",
      incBudgetRes.status() === 400,
      `status=${incBudgetRes.status()}`,
    );

    // Create deterministic June & July 2026 transactions
    const seedTxs = [
      // June 2026: +$500.00 - $100.00 = +$400.00
      {
        type: "income",
        categoryId: incCatId,
        amountCents: 50_000,
        occurredOn: "2026-06-10",
        description: `${runTag} Ingreso junio`,
      },
      {
        type: "expense",
        categoryId: expCatId,
        amountCents: 10_000,
        occurredOn: "2026-06-15",
        description: `${runTag} Gasto junio`,
      },
      // July 2026: +$1,000.00 - $200.00 = +$800.00 ($120 on expCatId + $80 on another expense)
      {
        type: "income",
        categoryId: incCatId,
        amountCents: 100_000,
        occurredOn: "2026-07-05",
        description: `${runTag} Ingreso julio`,
      },
      {
        type: "expense",
        categoryId: expCatId,
        amountCents: 6_000,
        occurredOn: "2026-07-08",
        description: `${runTag} Compra A`,
      },
      {
        type: "expense",
        categoryId: expCatId,
        amountCents: 6_000,
        occurredOn: "2026-07-12",
        description: `=SUM(A1:A5) ${runTag} Formula`,
        notes: "  +cmd|' /C calc'!A0",
      },
      {
        type: "expense",
        categoryId: expCatId,
        amountCents: 5_000,
        occurredOn: "2026-07-18",
        description: `${runTag} Compra C`,
      },
      {
        type: "expense",
        categoryId: expCatId,
        amountCents: 3_000,
        occurredOn: "2026-07-22",
        description: `${runTag} Compra D`,
      },
    ];

    for (const payload of seedTxs) {
      const res = await reqA.post(`${BASE_URL}/api/transactions`, {
        data: { ...payload, user_id: fakeUuid }, // extra user_id must be ignored
      });
      const json = await res.json();
      if (res.status() !== 201 || !json.data?.id) {
        throw new Error(`Failed creating tx ${payload.description}: ${res.status()}`);
      }
      createdTxIds.push(json.data.id);
    }
    assertCheck(
      "Created 7 deterministic transactions (ignoring injected user_id)",
      createdTxIds.length === 7,
    );

    // 5. Verify Pagination & Non-Truncated Exact Totals on July
    const page1Res = await reqA.get(
      `${BASE_URL}/api/transactions?from=2026-07-01&to=2026-07-31&page=1&pageSize=3&q=${encodeURIComponent(runTag)}`,
    );
    const page1 = await page1Res.json();
    assertCheck(
      "Paginated transactions (pageSize=3) returns 3 items + full 5-row BigInt totals",
      page1Res.status() === 200 &&
        page1.data.items.length === 3 &&
        page1.data.pagination.totalCount === 5 &&
        page1.data.pagination.totalPages === 2 &&
        page1.data.totals.incomeCents === "100000" &&
        page1.data.totals.expenseCents === "20000" &&
        page1.data.totals.netCents === "80000",
      JSON.stringify(page1.data?.totals),
    );

    // 6. Create July Budget ($250.00 limit -> $200.00 spent = 80.0% warning!)
    const budgetRes = await reqA.post(`${BASE_URL}/api/budgets`, {
      data: {
        categoryId: expCatId,
        month: "2026-07",
        limitCents: 25_000,
        alertThresholdPct: 80,
      },
    });
    const budgetJson = await budgetRes.json();
    assertCheck(
      "POST /api/budgets creates budget and computes exact 80% warning ($200/$250)",
      budgetRes.status() === 201 &&
        budgetJson.data.spentCents === "20000" &&
        budgetJson.data.remainingCents === "5000" &&
        budgetJson.data.percentage === 80 &&
        budgetJson.data.status === "warning",
      JSON.stringify(budgetJson.data),
    );
    const budgetId = budgetJson.data.id;
    createdBudgetIds.push(budgetId);

    // Duplicate budget -> 409
    const dupBudgetRes = await reqA.post(`${BASE_URL}/api/budgets`, {
      data: {
        categoryId: expCatId,
        month: "2026-07",
        limitCents: 30_000,
        alertThresholdPct: 80,
      },
    });
    assertCheck(
      "Duplicate budget for same category + month -> 409 Conflict",
      dupBudgetRes.status() === 409,
    );

    // 7. Linked Category Protection (409 on DELETE and on type change)
    const delLinkedCatRes = await reqA.delete(`${BASE_URL}/api/categories/${expCatId}`);
    assertCheck(
      "DELETE linked category -> 409 Conflict",
      delLinkedCatRes.status() === 409,
      `status=${delLinkedCatRes.status()}`,
    );
    const changeTypeCatRes = await reqA.patch(`${BASE_URL}/api/categories/${expCatId}`, {
      data: { type: "income" },
    });
    assertCheck(
      "PATCH linked category type change -> 409 Conflict",
      changeTypeCatRes.status() === 409,
      `status=${changeTypeCatRes.status()}`,
    );

    // 8. Dashboard & Reports Consistency Check
    const dashRes = await reqA.get(`${BASE_URL}/api/dashboard?period=2026-07`);
    const dash = (await dashRes.json()).data;
    const expectedBalance = baselineBalance + BigInt(120_000);
    assertCheck(
      "Dashboard 2026-07 matches exact historical delta (+$1,200) and period KPIs (+$1,000 / -$200 / +$800)",
      BigInt(dash.kpis.accumulatedBalanceCents) === expectedBalance &&
        dash.kpis.periodIncomeCents === "100000" &&
        dash.kpis.periodExpenseCents === "20000" &&
        dash.kpis.periodNetCents === "80000",
      JSON.stringify(dash.kpis),
    );

    const repRes = await reqA.get(`${BASE_URL}/api/reports?period=2026-07`);
    const rep = (await repRes.json()).data;
    assertCheck(
      "Reports 2026-07 matches Dashboard exactly and computes +100% comparison vs June",
      rep.summary.incomeCents === dash.kpis.periodIncomeCents &&
        rep.summary.expenseCents === dash.kpis.periodExpenseCents &&
        rep.summary.netCents === dash.kpis.periodNetCents &&
        rep.comparisons.income?.changePct === 100 &&
        rep.comparisons.expense?.changePct === 100,
      JSON.stringify({ summary: rep.summary, comparisons: rep.comparisons }),
    );

    // 9. Secure CSV Export Check (BOM bytes, headers, Formula Injection neutralized, negative USD preserved)
    const csvRes = await reqA.get(
      `${BASE_URL}/api/reports/export?period=2026-07&q=${encodeURIComponent(runTag)}`,
    );
    const csvBuf = await csvRes.body();
    const hasUtf8Bom =
      csvBuf.length >= 3 &&
      csvBuf[0] === 0xef &&
      csvBuf[1] === 0xbb &&
      csvBuf[2] === 0xbf;
    const csvText = csvBuf.toString("utf8");
    const csvHeaders = csvRes.headers();
    assertCheck(
      "GET /api/reports/export returns text/csv UTF-8 BOM + no-store + neutralized formulas + negative USD",
      csvRes.status() === 200 &&
        (csvHeaders["content-type"] ?? "").includes("text/csv") &&
        (csvHeaders["cache-control"] ?? "").includes("no-store") &&
        hasUtf8Bom &&
        csvText.includes("Fecha,Tipo,Categoría,Descripción,Notas,Importe USD") &&
        csvText.includes(`'=SUM(A1:A5) ${runTag} Formula`) &&
        csvText.includes(`'+cmd|' /C calc'!A0`) &&
        csvText.includes(",-60.00") &&
        csvText.includes(",1000.00"),
      `bom=${hasUtf8Bom}, len=${csvBuf.length}`,
    );

    // 10. Cross-user Isolation (User B vs User A across all resources)
    const targetTxId = createdTxIds[2];
    const bGetTx = await reqB.get(`${BASE_URL}/api/transactions/${targetTxId}`);
    const bPatchTx = await reqB.patch(`${BASE_URL}/api/transactions/${targetTxId}`, {
      data: { description: "Hijack attempt" },
    });
    const bDelTx = await reqB.delete(`${BASE_URL}/api/transactions/${targetTxId}`);
    assertCheck(
      "User B cannot GET/PATCH/DELETE User A's transaction (404)",
      bGetTx.status() === 404 &&
        bPatchTx.status() === 404 &&
        bDelTx.status() === 404,
      `statuses=${bGetTx.status()}/${bPatchTx.status()}/${bDelTx.status()}`,
    );

    const bPatchCat = await reqB.patch(`${BASE_URL}/api/categories/${expCatId}`, {
      data: { name: "Hijack cat" },
    });
    const bDelCat = await reqB.delete(`${BASE_URL}/api/categories/${expCatId}`);
    assertCheck(
      "User B cannot PATCH/DELETE User A's category (404)",
      bPatchCat.status() === 404 && bDelCat.status() === 404,
    );

    const bPatchBudget = await reqB.patch(`${BASE_URL}/api/budgets/${budgetId}`, {
      data: { limitCents: 100 },
    });
    const bDelBudget = await reqB.delete(`${BASE_URL}/api/budgets/${budgetId}`);
    assertCheck(
      "User B cannot PATCH/DELETE User A's budget (404)",
      bPatchBudget.status() === 404 && bDelBudget.status() === 404,
    );

    const bForeignTx = await reqB.post(`${BASE_URL}/api/transactions`, {
      data: {
        type: "expense",
        categoryId: expCatId,
        amountCents: 500,
        occurredOn: "2026-07-10",
        description: "Foreign category tx",
      },
    });
    const bForeignBudget = await reqB.post(`${BASE_URL}/api/budgets`, {
      data: {
        categoryId: expCatId,
        month: "2026-07",
        limitCents: 5000,
        alertThresholdPct: 80,
      },
    });
    assertCheck(
      "User B cannot create transaction or budget using User A's category (400)",
      bForeignTx.status() === 400 && bForeignBudget.status() === 400,
    );

    const bExportText = await (
      await reqB.get(`${BASE_URL}/api/reports/export?period=2026-07`)
    ).text();
    assertCheck(
      "User B CSV export contains zero records from User A",
      !bExportText.includes(runTag),
    );

    // 11. Edit Transaction -> Budget Transitions from Warning to Limit Reached & Exceeded
    const editTxRes = await reqA.patch(`${BASE_URL}/api/transactions/${createdTxIds[3]}`, {
      data: { amountCents: 11_000 }, // +$50.00 -> total spent $250.00 / $250.00 = 100% limit_reached!
    });
    assertCheck("PATCH /api/transactions updates amount (200)", editTxRes.status() === 200);

    const budgetsReached = (
      await (await reqA.get(`${BASE_URL}/api/budgets?month=2026-07`)).json()
    ).data;
    const reachedItem = budgetsReached.items.find((b) => b.id === budgetId);
    assertCheck(
      "Budget transitions to exact 'limit_reached' at 100.0% ($250/$250)",
      reachedItem?.status === "limit_reached" && reachedItem?.percentage === 100,
      JSON.stringify(reachedItem),
    );

    await reqA.patch(`${BASE_URL}/api/transactions/${createdTxIds[3]}`, {
      data: { amountCents: 13_000 }, // total spent $270.00 / $250.00 = 108% exceeded!
    });
    const budgetsExceeded = (
      await (await reqA.get(`${BASE_URL}/api/budgets?month=2026-07`)).json()
    ).data;
    const exceededItem = budgetsExceeded.items.find((b) => b.id === budgetId);
    assertCheck(
      "Budget transitions to 'exceeded' above 100% ($270/$250, exceeded=$20)",
      exceededItem?.status === "exceeded" && exceededItem?.exceededCents === "2000",
      JSON.stringify(exceededItem),
    );
  } finally {
    // Cleanup ONLY records created during this test run
    if (contextA) {
      const reqA = contextA.request;
      for (const id of createdTxIds) {
        await reqA.delete(`${BASE_URL}/api/transactions/${id}`).catch(() => {});
      }
      for (const id of createdBudgetIds) {
        await reqA.delete(`${BASE_URL}/api/budgets/${id}`).catch(() => {});
      }
      for (const id of createdCategoryIds) {
        await reqA.delete(`${BASE_URL}/api/categories/${id}`).catch(() => {});
      }
    }
    if (contextA) await contextA.close();
    if (contextB) await contextB.close();
    await browser.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log(
    `\nAPI Security & Deterministic Financial Suite: ${passedCount}/${results.length} passed.`,
  );
  if (passedCount !== results.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
