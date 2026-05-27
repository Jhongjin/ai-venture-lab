import { chromium } from "@playwright/test";

import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const baseUrl = process.env.BILLING_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const timeoutMs = Number.parseInt(process.env.BILLING_SMOKE_TIMEOUT_MS || "30000", 10);
const allowAuthGrant = process.env.BILLING_SMOKE_ALLOW_AUTH_GRANT === "1";
const email = process.env.BILLING_SMOKE_EMAIL || process.env.BROWSER_SMOKE_EMAIL;
const password = process.env.BILLING_SMOKE_PASSWORD || process.env.BROWSER_SMOKE_PASSWORD;
const headless = (process.env.BILLING_SMOKE_HEADLESS || process.env.BROWSER_SMOKE_HEADLESS) !== "0";

function fail(message) {
  throw new Error(`Billing credit smoke failed: ${message}`);
}

async function fetchWithTimeout(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(new URL(path, baseUrl), {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function expectStatus(path, init, expectedStatus) {
  const response = await fetchWithTimeout(path, init);
  const body = await response.json().catch(() => ({}));

  if (response.status !== expectedStatus) {
    fail(`${path} returned HTTP ${response.status}; expected ${expectedStatus}. ${body.error ?? ""}`.trim());
  }

  return body;
}

function requireEnv(name, value) {
  if (!value) {
    fail(`missing ${name}. Set BILLING_SMOKE_EMAIL/PASSWORD or BROWSER_SMOKE_EMAIL/PASSWORD.`);
  }
}

async function loginInBrowser(page) {
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle", timeout: timeoutMs });
  await page.getByLabel(/이메일/).fill(email, { timeout: timeoutMs });
  await page.getByLabel(/비밀번호/).fill(password, { timeout: timeoutMs });
  await page.getByRole("button", { name: /비밀번호로 로그인|^로그인$/ }).click({ timeout: timeoutMs });
  await page.getByRole("heading", { name: /실행 보드|아이디어 찾기|사업성 평가|후보 선택/ }).first().waitFor({
    state: "visible",
    timeout: timeoutMs,
  });
  await page.waitForFunction(() => document.cookie.includes("-auth-token"), undefined, { timeout: timeoutMs });
}

async function callAppApi(page, path, init = {}) {
  return page.evaluate(
    async ({ path: requestPath, init: requestInit }) => {
      const response = await fetch(requestPath, { credentials: "include", ...requestInit });
      const body = await response.json().catch(() => ({}));
      return {
        status: response.status,
        ok: response.ok,
        body,
      };
    },
    { path, init },
  );
}

async function verifyAuthenticatedCreditSummary() {
  requireEnv("BILLING_SMOKE_EMAIL", email);
  requireEnv("BILLING_SMOKE_PASSWORD", password);

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  try {
    await loginInBrowser(page);

    const result = await callAppApi(page, "/api/billing/credits");
    if (!result.ok) {
      fail(`/api/billing/credits returned HTTP ${result.status}: ${result.body.error ?? result.body.message ?? "unknown error"}`);
    }

    const summary = result.body;
    if (summary.status !== "ready") {
      fail(`expected authenticated credit summary status=ready, received ${summary.status ?? "missing"}`);
    }

    if (summary.monthlyGrant !== 100 || summary.buildPassCost !== 30) {
      fail(
        `unexpected credit constants: monthlyGrant=${summary.monthlyGrant ?? "missing"}, buildPassCost=${
          summary.buildPassCost ?? "missing"
        }`,
      );
    }

    if (summary.freeArtifactLimit !== 4 || summary.fullArtifactCount !== 10) {
      fail(
        `unexpected package limits: freeArtifactLimit=${summary.freeArtifactLimit ?? "missing"}, fullArtifactCount=${
          summary.fullArtifactCount ?? "missing"
        }`,
      );
    }

    if (typeof summary.balance !== "number" || summary.balance < 0) {
      fail(`authenticated credit balance was not a non-negative number: ${summary.balance ?? "missing"}`);
    }

    if (!Array.isArray(summary.buildPasses)) {
      fail("authenticated credit summary did not include buildPasses array.");
    }

    await page.goto(new URL("/profile", baseUrl).toString(), { waitUntil: "networkidle", timeout: timeoutMs });
    await page.locator('[data-smoke="profile-credit-summary"]').waitFor({ state: "visible", timeout: timeoutMs });
    await page.getByText(/Venture Credits/).first().waitFor({ state: "visible", timeout: timeoutMs });
    await page.getByText(/잔여 크레딧/).first().waitFor({ state: "visible", timeout: timeoutMs });
    await page.locator('[data-smoke="profile-credit-build-pass-capacity"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.getByText("제작 패스를 쓰면 열리는 가치", { exact: true }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-signals"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="upgrade-interest-button"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });

    return summary;
  } finally {
    await browser.close();
  }
}

async function main() {
  const creditsBody = await expectStatus("/api/billing/credits", {}, 401);
  if (typeof creditsBody.error !== "string" || !creditsBody.error.includes("Login")) {
    fail("/api/billing/credits did not return the expected login-required error.");
  }

  const passBody = await expectStatus(
    "/api/billing/build-pass",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId: "00000000-0000-4000-8000-000000000000" }),
    },
    401,
  );
  if (typeof passBody.error !== "string" || !passBody.error.includes("Login")) {
    fail("/api/billing/build-pass did not return the expected login-required error.");
  }

  const authenticatedSummary = allowAuthGrant ? await verifyAuthenticatedCreditSummary() : null;

  console.log("Billing credit smoke passed.");
  console.log("Anonymous credit summary: rejected");
  console.log("Anonymous build-pass unlock: rejected");
  console.log(
    authenticatedSummary
      ? `Authenticated credit summary/profile panel: ready with ${authenticatedSummary.balance} credits`
      : "Authenticated credit summary: skipped; set BILLING_SMOKE_ALLOW_AUTH_GRANT=1 to verify without spending credits",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
