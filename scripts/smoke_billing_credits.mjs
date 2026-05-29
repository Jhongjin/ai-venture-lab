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

async function isVisible(locator, waitMs = 1000) {
  try {
    return await locator.first().isVisible({ timeout: waitMs });
  } catch {
    return false;
  }
}

async function openDevelopmentRoute(page) {
  const developmentUrl = new URL("/workspace", baseUrl);
  developmentUrl.searchParams.set("task", "development");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(developmentUrl.toString(), { waitUntil: "networkidle", timeout: timeoutMs });

    if (!(await isVisible(page.getByRole("heading", { name: "먼저 로그인해 주세요." }), 2500))) {
      return;
    }

    await page.waitForFunction(() => document.cookie.includes("-auth-token"), undefined, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
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

    if (!Array.isArray(summary.ledgerEntries)) {
      fail("authenticated credit summary did not include ledgerEntries array.");
    }

    await page.goto(new URL("/profile", baseUrl).toString(), { waitUntil: "networkidle", timeout: timeoutMs });
    await page.locator('[data-smoke="profile-credit-summary"]').waitFor({ state: "visible", timeout: timeoutMs });
    await page.getByText(/Venture Credits/).first().waitFor({ state: "visible", timeout: timeoutMs });
    await page.getByText(/잔여 크레딧/).first().waitFor({ state: "visible", timeout: timeoutMs });
    await page.locator('[data-smoke="profile-credit-build-pass-capacity"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    const creditNextAction = page.locator('[data-smoke="profile-credit-next-action"]');
    await creditNextAction.getByText("지금 할 일", { exact: true }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    const creditNextActionText = await creditNextAction.innerText({ timeout: timeoutMs });
    if (!/STEP 5|Pro 관심|로그인 후/.test(creditNextActionText)) {
      fail(`profile credit next action did not explain the next step: ${creditNextActionText}`);
    }
    if (typeof summary.balance === "number" && summary.balance < summary.buildPassCost) {
      await page.locator('[data-smoke="profile-credit-shortfall"]').waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
    }
    await page.locator('[data-smoke="profile-credit-ledger"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.getByText("제작 패스를 쓰면 열리는 가치", { exact: true }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-credit-execution-package-value"]').getByText("실행 패키지를 여는 비용", {
      exact: false,
    }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-credit-execution-package-value"]').getByText("제품 기획서, 화면 구조", {
      exact: false,
    }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    const staleProfilePrdCopy = await page
      .locator('[data-smoke="profile-credit-execution-package-value"]')
      .getByText("PRD, 화면 구조", { exact: false })
      .count();
    if (staleProfilePrdCopy > 0) {
      fail("profile credit value copy still uses PRD abbreviation");
    }
    await page.locator('[data-smoke="profile-upgrade-signals"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-pro-conversion-boundary"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-pro-plan-fit"]').getByText("내 플랜 판단", { exact: true }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-pro-plan-fit"]').getByText("제작 패스 최대", { exact: false }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="upgrade-interest-button"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-interest-summary"]').waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-interest-summary"]').getByText("내 Pro 관심 기록", { exact: true }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-interest-summary"]').getByText("결제 없이", { exact: false }).first().waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-interest-quality"]').getByText("신호 품질", { exact: true }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-interest-quality"]').getByText(/^기준:/).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await page.locator('[data-smoke="profile-upgrade-interest-dedupe-rule"]').getByText("24시간", { exact: false }).waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    const pausedPaymentReadinessCount = await page.locator('[data-smoke="profile-payment-readiness"]').count();
    if (pausedPaymentReadinessCount > 0) {
      fail("profile still exposes payment readiness while checkout is paused");
    }

    await openDevelopmentRoute(page);
    const productionCreditPanel = page.locator('[data-smoke="production-credit-panel"]');
    const hasProductionCreditPanel = await productionCreditPanel
      .first()
      .isVisible({ timeout: 15000 })
      .catch(() => false);

    if (hasProductionCreditPanel) {
      await page.locator('[data-smoke="step5-package-current-action"]').getByText("지금 할 일", { exact: true }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await page.locator('[data-smoke="step5-package-current-action"]').getByText("요약만 확인하고 저장합니다.", { exact: false }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await page.locator('[data-smoke="step5-save-to-execution-path"]').getByText("STEP 6 작업 순서 확인 후, STEP 7에서 연결 파일", {
        exact: false,
      }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await productionCreditPanel.locator('[data-smoke="production-credit-package-clarity"]').waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      const productionCreditProPathDetails = productionCreditPanel.locator('[data-smoke="production-credit-pro-path-details"]');
      await productionCreditProPathDetails.getByText("Free/Pro 기준 보기", { exact: true }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await productionCreditProPathDetails.locator("summary").click();
      await productionCreditProPathDetails.locator('[data-smoke="production-credit-pro-path"]').getByText("Pro가 필요한 순간", {
        exact: true,
      }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await productionCreditPanel.locator('[data-smoke="production-credit-execution-package-value"]').getByText("제품 기획서, 화면 구조", {
        exact: false,
      }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      const staleStep5PrdCopy = await productionCreditPanel
        .locator('[data-smoke="production-credit-execution-package-value"]')
        .getByText("PRD, 화면 구조", { exact: false })
        .count();
      if (staleStep5PrdCopy > 0) {
        fail("STEP 5 credit value copy still uses PRD abbreviation");
      }
      const productionCreditSpendConfidenceDetails = productionCreditPanel.locator('[data-smoke="production-credit-spend-confidence-details"]');
      await productionCreditSpendConfidenceDetails.getByText("차감 전 확인 보기", { exact: true }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await productionCreditSpendConfidenceDetails.locator("summary").click();
      await productionCreditSpendConfidenceDetails.locator('[data-smoke="production-credit-spend-confidence"]').waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      if (typeof summary.balance === "number" && summary.balance < summary.buildPassCost) {
        const step5ProReasons = productionCreditPanel.locator('[data-smoke="step5-pro-interest-reasons"]');
        for (const label of ["반복 제작", "외부 도구", "시장 근거"]) {
          await step5ProReasons.getByText(label, { exact: true }).waitFor({
            state: "visible",
            timeout: timeoutMs,
          });
        }
      }
      await page.locator('[data-smoke="step5-execution-package-brief"]').getByText("제작 시작 패키지", { exact: true }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await page.locator('[data-smoke="step5-execution-package-brief"]').getByText("첫 메시지", { exact: true }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      await page.locator('[data-smoke="step5-execution-package-brief"]').getByText("첫 작업", { exact: true }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      const savedPackageUsage = page.locator('[data-smoke="step5-saved-package-usage"]');
      for (const label of ["STEP 6", "STEP 7", "STEP 8"]) {
        await savedPackageUsage.getByText(label, { exact: true }).waitFor({
          state: "visible",
          timeout: timeoutMs,
        });
      }
      await savedPackageUsage.getByText("성과 확인 기준", { exact: false }).waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
    } else if (
      await page
        .getByRole("heading", { name: /메모에서 검토할 아이디어 정리|아이디어 찾기/ })
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false)
    ) {
      console.log("STEP 5 credit panel check skipped because the authenticated smoke account has no active ideas.");
    } else {
      const visibleText = (await page.locator("body").innerText({ timeout: timeoutMs })).replace(/\s+/g, " ").slice(0, 240);
      fail(`STEP 5 credit panel was not visible from direct development route. Visible text: ${visibleText}`);
    }

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
