import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const SCREENSHOTS_DIR = path.resolve(process.cwd(), "docs", "screenshots");

const PROTECTED_ROUTES = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/budgets",
  "/reports",
  "/settings",
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
      // Try next available channel
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
    routeProtectionChecks: [],
    apiProtectionChecks: [],
    openRedirectCheck: null,
    formChecks: [],
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

    // 1. Verify all 6 private routes redirect unauthenticated requests to /login
    for (const route of PROTECTED_ROUTES) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      const finalPath = new URL(page.url()).pathname;
      report.routeProtectionChecks.push({
        route,
        redirectedToLogin: finalPath === "/login",
        finalUrl: page.url(),
      });
    }

    // 2. Verify private API returns JSON (401 or 503 if unconfigured) — NEVER HTML redirect
    const profileRes = await fetch(`${BASE_URL}/api/profile`, {
      redirect: "manual",
    });
    const profileContentType = profileRes.headers.get("content-type") ?? "";
    const profileCacheControl = profileRes.headers.get("cache-control") ?? "";
    report.apiProtectionChecks.push({
      endpoint: "GET /api/profile",
      status: profileRes.status,
      isJson: profileContentType.includes("application/json"),
      hasNoStore: profileCacheControl.includes("no-store"),
      passed:
        (profileRes.status === 401 || profileRes.status === 503) &&
        profileContentType.includes("application/json") &&
        profileCacheControl.includes("no-store"),
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

    // 3. Verify /auth/callback blocks open redirects
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

    // 4. Capture Phase 03 Auth UI screenshots & check forms/overflow
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-03-login.png"),
      fullPage: false,
    });
    report.screenshots.push("docs/screenshots/phase-03-login.png");

    // Trigger Zod validation errors and capture validation state
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForTimeout(200);
    const loginValidationVisible = await page
      .getByText("Ingresa tu correo electrónico.")
      .isVisible();
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-03-login-validation.png"),
      fullPage: false,
    });
    report.screenshots.push("docs/screenshots/phase-03-login-validation.png");
    report.formChecks.push({
      check: "phase03-login-zod-validation",
      passed: loginValidationVisible,
    });

    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-03-register.png"),
      fullPage: false,
    });
    report.screenshots.push("docs/screenshots/phase-03-register.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "phase-03-mobile-login.png"),
      fullPage: true,
    });
    report.screenshots.push("docs/screenshots/phase-03-mobile-login.png");
    report.formChecks.push({
      check: "phase03-mobile-login-no-overflow",
      passed: !mobileOverflow,
    });

    await context.close();
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));

  const failed =
    report.routeProtectionChecks.some((c) => !c.redirectedToLogin) ||
    report.apiProtectionChecks.some((c) => !c.passed) ||
    !report.openRedirectCheck?.passed ||
    report.formChecks.some((c) => !c.passed) ||
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
