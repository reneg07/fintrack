import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const SCREENSHOTS_DIR = path.resolve(process.cwd(), "docs", "screenshots");
const RECORDINGS_DIR = path.resolve(process.cwd(), "docs", "recordings");

const PROTECTED_ROUTES = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/budgets",
  "/reports",
  "/settings",
];

const EXTRA_RESPONSIVE_VIEWPORTS = [
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

async function launchIsolatedBrowser() {
  for (const channel of ["chrome", "msedge", undefined]) {
    try {
      const browser = await chromium.launch({
        headless: true,
        ...(channel ? { channel } : {}),
      });
      return { browser, channel: channel ?? "playwright-chromium" };
    } catch {
      // Try next channel
    }
  }
  throw new Error("Could not launch Chromium, Chrome, or Edge via Playwright.");
}

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

  let mailerAutoConfirm = false;
  if (supabaseConfigured) {
    try {
      const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseKey },
      });
      if (settingsRes.ok) {
        const json = await settingsRes.json();
        mailerAutoConfirm = Boolean(json.mailer_autoconfirm);
      }
    } catch {
      // keep default false
    }
  }

  const { browser, channel } = await launchIsolatedBrowser();

  const report = {
    browserChannel: channel,
    baseUrl: BASE_URL,
    supabaseConfigured,
    mailerAutoConfirm,
    routeProtectionChecks: [],
    apiProtectionChecks: [],
    openRedirectCheck: null,
    formChecks: [],
    authenticatedFlowChecks: [],
    responsiveSupplementChecks: [],
    screenshots: [],
    recording: null,
    consoleErrors: [],
    pageErrors: [],
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "es-SV",
      timezoneId: "America/El_Salvador",
    });
    const page = await context.newPage();

    let ignoreExpectedAuth400 = false;
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (ignoreExpectedAuth400 && text.includes("status of 400")) {
          return;
        }
        report.consoleErrors.push({ url: page.url(), text });
      }
    });
    page.on("pageerror", (err) => {
      report.pageErrors.push({ url: page.url(), text: err.message });
    });

    // 1. Unauthenticated access to all 6 private routes redirects to /login
    for (const route of PROTECTED_ROUTES) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      const finalUrl = new URL(page.url());
      const expectedNext = supabaseConfigured
        ? finalUrl.searchParams.get("next") === route
        : true;
      report.routeProtectionChecks.push({
        route,
        redirectedToLogin: finalUrl.pathname === "/login" && expectedNext,
        finalPath: `${finalUrl.pathname}${finalUrl.search}`,
      });
    }

    // 2. Private APIs return JSON (401 when Supabase configured, 503 otherwise) + no-store
    const profileRes = await fetch(`${BASE_URL}/api/profile`, {
      redirect: "manual",
    });
    const profileContentType = profileRes.headers.get("content-type") ?? "";
    const profileCacheControl = profileRes.headers.get("cache-control") ?? "";
    const expectedStatus = supabaseConfigured ? 401 : 503;
    report.apiProtectionChecks.push({
      endpoint: "GET /api/profile (unauthenticated)",
      status: profileRes.status,
      expectedStatus,
      isJson: profileContentType.includes("application/json"),
      hasNoStore: profileCacheControl.includes("no-store"),
      passed:
        profileRes.status === expectedStatus &&
        profileContentType.includes("application/json") &&
        profileCacheControl.includes("no-store"),
    });

    const patchUnauthRes = await fetch(`${BASE_URL}/api/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
      },
      body: JSON.stringify({ fullName: "No Autorizado" }),
      redirect: "manual",
    });
    report.apiProtectionChecks.push({
      endpoint: "PATCH /api/profile (unauthenticated)",
      status: patchUnauthRes.status,
      passed: patchUnauthRes.status === expectedStatus,
    });

    const signoutCrossOriginRes = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: "POST",
      headers: { Origin: "https://evil.example" },
      redirect: "manual",
    });
    report.apiProtectionChecks.push({
      endpoint: "POST /api/auth/signout (cross-origin)",
      status: signoutCrossOriginRes.status,
      passed: signoutCrossOriginRes.status === 403,
    });

    // 3. Open-redirect protection on /auth/callback
    const callbackRes = await fetch(
      `${BASE_URL}/auth/callback?next=//evil.example/phish`,
      { redirect: "manual" },
    );
    const location = callbackRes.headers.get("location") ?? "";
    report.openRedirectCheck = {
      status: callbackRes.status,
      location,
      passed:
        callbackRes.status >= 300 &&
        callbackRes.status < 400 &&
        !location.includes("evil.example") &&
        location.includes("/login"),
    };

    // 4. Auth UI checks + invalid credentials against real Supabase Auth
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForTimeout(200);
    const zodVisible = await page
      .getByText("Ingresa tu correo electrónico.")
      .isVisible();
    report.formChecks.push({
      check: "login-zod-validation",
      passed: zodVisible,
    });

    if (supabaseConfigured) {
      ignoreExpectedAuth400 = true;
      await page.fill("#login-email", "cuenta-inexistente-qa@example.com");
      await page.fill("#login-password", "ClaveIncorrecta99");
      await page.getByRole("button", { name: "Iniciar sesión" }).click();
      await page
        .getByText("Correo o contraseña incorrectos", { exact: false })
        .waitFor({ timeout: 10_000 });
      await page.waitForTimeout(300);
      ignoreExpectedAuth400 = false;
      report.formChecks.push({
        check: "login-real-supabase-invalid-credentials",
        passed: true,
      });
    }

    // 5. Complete missing public /register responsive checks across all 7 viewports
    for (const vp of EXTRA_RESPONSIVE_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
      await page.waitForTimeout(150);
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      report.responsiveSupplementChecks.push({
        viewport: vp.name,
        route: "/register",
        scrollWidth: metrics.scrollWidth,
        innerWidth: metrics.innerWidth,
        overflow: metrics.scrollWidth > metrics.innerWidth,
      });
    }

    await context.close();

    // 6. Live Authenticated Flow + Video Recording (when test user or autoconfirm is available)
    const testEmail = getEnv("TEST_USER_A_EMAIL");
    const testPassword = getEnv("TEST_USER_A_PASSWORD");
    const canRunAuthenticatedFlow =
      supabaseConfigured && (Boolean(testEmail && testPassword) || mailerAutoConfirm);

    if (canRunAuthenticatedFlow) {
      const authContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: "es-SV",
        timezoneId: "America/El_Salvador",
        recordVideo: {
          dir: RECORDINGS_DIR,
          size: { width: 1280, height: 720 },
        },
      });
      const authPage = await authContext.newPage();
      authPage.on("console", (msg) => {
        if (msg.type() === "error") {
          report.consoleErrors.push({ url: authPage.url(), text: msg.text() });
        }
      });
      authPage.on("pageerror", (err) => {
        report.pageErrors.push({ url: authPage.url(), text: err.message });
      });

      const runTag = Date.now();
      const activeEmail = testEmail || `fintrack.e2e.${runTag}@example.com`;
      const activePassword = testPassword || `FinTrackE2E#${runTag}`;
      const initialFullName = "Elena QA Verificación";
      let originalProfileName = initialFullName;

      if (!testEmail && mailerAutoConfirm) {
        // Real registration flow in UI
        await authPage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
        await authPage.fill("#register-name", initialFullName);
        await authPage.fill("#register-email", activeEmail);
        await authPage.fill("#register-password", activePassword);
        await authPage.fill("#register-confirm-password", activePassword);
        await authPage.getByRole("button", { name: "Crear cuenta" }).click();
        await authPage.waitForURL("**/dashboard", { timeout: 15_000 });
        report.authenticatedFlowChecks.push({
          check: "ui-register-real-user",
          passed: true,
        });
      } else {
        // Real login flow in UI with controlled confirmed test account
        await authPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
        await authPage.fill("#login-email", activeEmail);
        await authPage.fill("#login-password", activePassword);
        await authPage.getByRole("button", { name: "Iniciar sesión" }).click();
        await authPage.waitForURL("**/dashboard", { timeout: 15_000 });
        report.authenticatedFlowChecks.push({
          check: "ui-login-real-user",
          passed: true,
        });
      }

      // Wait until authenticated dashboard heading & sidebar finish streaming
      await authPage.getByRole("heading", { level: 1 }).waitFor({ timeout: 15_000 });
      await authPage.waitForLoadState("networkidle");
      await authPage.waitForTimeout(400);
      await authPage.screenshot({
        path: path.join(SCREENSHOTS_DIR, "phase-03-authenticated-dashboard.png"),
        fullPage: true,
      });
      await authPage.screenshot({
        path: path.join(SCREENSHOTS_DIR, "phase-03-empty-dashboard.png"),
        fullPage: true,
      });
      report.screenshots.push(
        "docs/screenshots/phase-03-authenticated-dashboard.png",
        "docs/screenshots/phase-03-empty-dashboard.png",
      );

      // Verify no demo user name/email or fake balance leaks into authenticated area
      const dashText = (await authPage.textContent("body")) ?? "";
      const noDemoLeak =
        !dashText.includes("Elena Morales") &&
        !dashText.includes("elena.demo@fintrack.local") &&
        !dashText.includes("$3,852.00") &&
        dashText.includes(activeEmail);
      report.authenticatedFlowChecks.push({
        check: "dashboard-real-user-no-demo-data",
        passed: noDemoLeak,
      });

      // Verify session persists on reload
      await authPage.reload({ waitUntil: "networkidle" });
      report.authenticatedFlowChecks.push({
        check: "session-persists-after-reload",
        passed: new URL(authPage.url()).pathname === "/dashboard",
      });

      // Verify authenticated redirect from /login and /register -> /dashboard
      await authPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      const loginRedirected = new URL(authPage.url()).pathname === "/dashboard";
      await authPage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
      const registerRedirected =
        new URL(authPage.url()).pathname === "/dashboard";
      report.authenticatedFlowChecks.push({
        check: "authenticated-redirect-away-from-auth-pages",
        passed: loginRedirected && registerRedirected,
      });

      // Verify all 6 private routes + 12 seeded categories on /categories
      for (const route of PROTECTED_ROUTES) {
        await authPage.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
        const pathNow = new URL(authPage.url()).pathname;
        report.authenticatedFlowChecks.push({
          check: `private-route-accessible:${route}`,
          passed: pathNow === route,
        });
      }

      await authPage.goto(`${BASE_URL}/categories`, { waitUntil: "networkidle" });
      const catBody = (await authPage.textContent("body")) ?? "";
      const has12Cats =
        catBody.includes("Categorías de gastos (8)") &&
        catBody.includes("Categorías de ingresos (4)");
      report.authenticatedFlowChecks.push({
        check: "categories-page-shows-12-real-seeded-categories",
        passed: has12Cats,
      });

      // Verify GET /api/profile returns 200 JSON + no-store inside authenticated browser context
      const apiProfileCheck = await authPage.evaluate(async () => {
        const res = await fetch("/api/profile");
        const json = await res.json();
        return {
          status: res.status,
          cacheControl: res.headers.get("cache-control") ?? "",
          fullName: json.data?.fullName ?? null,
          email: json.data?.email ?? null,
        };
      });
      if (apiProfileCheck.fullName) {
        originalProfileName = apiProfileCheck.fullName;
      }
      report.authenticatedFlowChecks.push({
        check: "api-profile-authenticated-200-no-store",
        passed:
          apiProfileCheck.status === 200 &&
          apiProfileCheck.cacheControl.includes("no-store") &&
          apiProfileCheck.email === activeEmail,
        detail: `status=${apiProfileCheck.status}`,
      });

      // Profile update via /settings UI + screenshot
      await authPage.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
      const updatedName = `QA Perfil ${String(runTag).slice(-4)}`;
      await authPage.fill("#settings-fullname", updatedName);
      await authPage.getByRole("button", { name: "Guardar cambios" }).click();
      await authPage
        .getByText("Perfil actualizado correctamente")
        .waitFor({ timeout: 10_000 });
      await authPage.reload({ waitUntil: "networkidle" });
      const persistedValue = await authPage
        .locator("#settings-fullname")
        .inputValue();
      await authPage.screenshot({
        path: path.join(SCREENSHOTS_DIR, "phase-03-profile.png"),
        fullPage: true,
      });
      report.screenshots.push("docs/screenshots/phase-03-profile.png");
      report.authenticatedFlowChecks.push({
        check: "profile-update-persists-after-reload",
        passed: persistedValue === updatedName,
      });

      // Restore original name so repeated runs stay clean
      if (testEmail) {
        await authPage.fill("#settings-fullname", originalProfileName);
        await authPage.getByRole("button", { name: "Guardar cambios" }).click();
        await authPage.waitForTimeout(1000);
      }

      // Complete missing authenticated responsive checks (/categories, /settings) + mobile dashboard screenshot
      for (const route of ["/categories", "/settings"]) {
        for (const vp of EXTRA_RESPONSIVE_VIEWPORTS) {
          await authPage.setViewportSize({ width: vp.width, height: vp.height });
          await authPage.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
          await authPage.waitForTimeout(150);
          const metrics = await authPage.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          }));
          report.responsiveSupplementChecks.push({
            viewport: vp.name,
            route,
            scrollWidth: metrics.scrollWidth,
            innerWidth: metrics.innerWidth,
            overflow: metrics.scrollWidth > metrics.innerWidth,
          });
        }
      }

      await authPage.setViewportSize({ width: 390, height: 844 });
      await authPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
      await authPage.waitForTimeout(300);
      const mobileDashOverflow = await authPage.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      await authPage.screenshot({
        path: path.join(SCREENSHOTS_DIR, "phase-03-mobile-dashboard.png"),
        fullPage: true,
      });
      report.screenshots.push("docs/screenshots/phase-03-mobile-dashboard.png");
      report.authenticatedFlowChecks.push({
        check: "mobile-authenticated-dashboard-no-overflow",
        passed: !mobileDashOverflow,
      });

      // Sign out from /settings + verify invalidation + browser back button behavior
      await authPage.setViewportSize({ width: 1440, height: 900 });
      await authPage.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
      await authPage.getByRole("button", { name: "Cerrar sesión" }).click();
      await authPage.waitForURL("**/login", { timeout: 15_000 });
      await authPage.waitForTimeout(300);
      await authPage.screenshot({
        path: path.join(SCREENSHOTS_DIR, "phase-03-signout.png"),
        fullPage: false,
      });
      report.screenshots.push("docs/screenshots/phase-03-signout.png");

      await authPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
      const blockedAfterSignout =
        new URL(authPage.url()).pathname === "/login";
      await authPage.goBack().catch(() => { });
      await authPage.waitForTimeout(300);
      const backBlocked =
        new URL(authPage.url()).pathname === "/login" ||
        (await authPage
          .goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" })
          .then(() => new URL(authPage.url()).pathname === "/login"));
      report.authenticatedFlowChecks.push({
        check: "signout-invalidates-private-routes-and-back-nav",
        passed: blockedAfterSignout && backBlocked,
      });

      const video = authPage.video();
      await authContext.close();
      if (video) {
        const rawPath = await video.path();
        const finalVideoPath = path.join(
          RECORDINGS_DIR,
          "phase-03-auth-flow.webm",
        );
        fs.copyFileSync(rawPath, finalVideoPath);
        fs.unlinkSync(rawPath);
        report.recording = "docs/recordings/phase-03-auth-flow.webm";
      }
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));

  const failed =
    report.routeProtectionChecks.some((c) => !c.redirectedToLogin) ||
    report.apiProtectionChecks.some((c) => !c.passed) ||
    !report.openRedirectCheck?.passed ||
    report.formChecks.some((c) => !c.passed) ||
    report.authenticatedFlowChecks.some((c) => !c.passed) ||
    report.responsiveSupplementChecks.some((c) => c.overflow) ||
    report.consoleErrors.length > 0 ||
    report.pageErrors.length > 0;

  if (failed) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
