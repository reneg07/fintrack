import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(process.cwd(), "docs", "screenshots");

const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
  { name: "360x800", width: 360, height: 800 },
];

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

const SCREENSHOT_TARGETS = [
  { file: "phase-02-landing-desktop.png", route: "/", width: 1440, height: 900, fullPage: true },
  { file: "phase-02-landing-mobile.png", route: "/", width: 390, height: 844, fullPage: true },
  { file: "phase-02-login.png", route: "/login", width: 1440, height: 900, fullPage: false },
  { file: "phase-02-register.png", route: "/register", width: 1440, height: 900, fullPage: false },
  { file: "phase-02-dashboard-desktop.png", route: "/dashboard", width: 1440, height: 900, fullPage: true },
  { file: "phase-02-dashboard-mobile.png", route: "/dashboard", width: 390, height: 844, fullPage: true },
  { file: "phase-02-transactions.png", route: "/transactions", width: 1440, height: 900, fullPage: true },
  { file: "phase-02-categories.png", route: "/categories", width: 1440, height: 900, fullPage: true },
  { file: "phase-02-budgets.png", route: "/budgets", width: 1440, height: 900, fullPage: true },
  { file: "phase-02-reports.png", route: "/reports", width: 1440, height: 900, fullPage: true },
  { file: "phase-02-settings.png", route: "/settings", width: 1440, height: 900, fullPage: true },
];

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
  const { browser, channel } = await launchIsolatedBrowser();
  const report = {
    browserChannel: channel,
    baseUrl: BASE_URL,
    routeChecks: [],
    overflowChecks: [],
    interactiveChecks: [],
    screenshots: [],
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

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        report.consoleErrors.push({ url: page.url(), text: msg.text() });
      }
    });
    page.on("pageerror", (err) => {
      report.pageErrors.push({ url: page.url(), text: err.message });
    });

    // 1. Verify all 9 routes render cleanly with HTTP 200
    for (const route of ALL_ROUTES) {
      const response = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(400);
      const status = response?.status() ?? 0;
      const title = await page.title();
      const h1Count = await page.locator("h1").count();
      report.routeChecks.push({ route, status, title, h1Count });
    }

    // 2. Capture all 11 Phase 02 screenshots
    for (const target of SCREENSHOT_TARGETS) {
      await page.setViewportSize({ width: target.width, height: target.height });
      await page.goto(`${BASE_URL}${target.route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const outPath = path.join(SCREENSHOTS_DIR, target.file);
      await page.screenshot({ path: outPath, fullPage: target.fullPage });
      report.screenshots.push({
        file: `docs/screenshots/${target.file}`,
        route: target.route,
        viewport: `${target.width}x${target.height}`,
      });
    }

    // 3. Multi-resolution horizontal overflow check across all 7 required viewports
    const overflowRoutes = ["/", "/login", "/dashboard", "/transactions", "/budgets", "/reports"];
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of overflowRoutes) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(250);
        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        report.overflowChecks.push({
          viewport: vp.name,
          route,
          scrollWidth: metrics.scrollWidth,
          innerWidth: metrics.innerWidth,
          overflow: metrics.scrollWidth > metrics.innerWidth,
        });
      }
    }

    // 4. Interactive checks: forms, password toggle, mobile drawer, transactions search & modal
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    const loginEmailErrorVisible = await page
      .getByText("Ingresa tu correo electrónico.")
      .isVisible();
    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    const passwordTypeAfterToggle = await page
      .locator("#login-password")
      .getAttribute("type");
    report.interactiveChecks.push({
      check: "login-validation-and-toggle",
      passed: loginEmailErrorVisible && passwordTypeAfterToggle === "text",
      detail: `emailError=${loginEmailErrorVisible}, type=${passwordTypeAfterToggle}`,
    });

    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
    await page.fill("#register-name", "María José Demo");
    await page.fill("#register-email", "maria.demo@example.com");
    await page.fill("#register-password", "ClaveSegura2026");
    await page.fill("#register-confirm-password", "OtraClave2026");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    const mismatchVisible = await page
      .getByText("Las contraseñas no coinciden.")
      .isVisible();
    report.interactiveChecks.push({
      check: "register-password-mismatch",
      passed: mismatchVisible,
      detail: `mismatchError=${mismatchVisible}`,
    });

    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await page.fill('input[type="search"]', "Supermercado");
    await page.waitForTimeout(200);
    const filteredText = await page.getByText("Mostrando").textContent();
    await page.getByRole("button", { name: "Nueva transacción" }).click();
    const modalVisible = await page
      .getByRole("heading", { name: "Registrar transacción" })
      .isVisible();
    await page.keyboard.press("Escape");
    report.interactiveChecks.push({
      check: "transactions-search-and-modal",
      passed: Boolean(filteredText?.includes("Mostrando")) && modalVisible,
      detail: `filter="${filteredText?.trim()}", modalVisible=${modalVisible}`,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Abrir menú lateral" }).click();
    await page.waitForTimeout(300);
    const mobileNavVisible = await page
      .getByRole("link", { name: "Presupuestos" })
      .isVisible();
    await page.keyboard.press("Escape");
    report.interactiveChecks.push({
      check: "mobile-drawer-navigation",
      passed: mobileNavVisible,
      detail: `mobileNavVisible=${mobileNavVisible}`,
    });

    // Check SVG charts rendered on dashboard
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const chartSvgCount = await page.locator(".recharts-surface").count();
    report.interactiveChecks.push({
      check: "dashboard-recharts-rendered",
      passed: chartSvgCount >= 2,
      detail: `rechartsSvgCount=${chartSvgCount}`,
    });

    await context.close();
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));

  const overflowFailures = report.overflowChecks.filter((c) => c.overflow);
  const routeFailures = report.routeChecks.filter((c) => c.status !== 200);
  const interactiveFailures = report.interactiveChecks.filter((c) => !c.passed);

  if (
    routeFailures.length > 0 ||
    overflowFailures.length > 0 ||
    interactiveFailures.length > 0 ||
    report.consoleErrors.length > 0 ||
    report.pageErrors.length > 0
  ) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
