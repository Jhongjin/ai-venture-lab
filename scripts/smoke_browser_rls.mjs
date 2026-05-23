import { chromium } from "@playwright/test";

import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const preflightOnly = process.argv.includes("--preflight");
const baseUrl = process.env.BROWSER_RLS_SMOKE_URL || process.env.RLS_SMOKE_URL;
const headless = (process.env.BROWSER_RLS_SMOKE_HEADLESS || process.env.RLS_SMOKE_HEADLESS || process.env.BROWSER_SMOKE_HEADLESS) !== "0";
const timeout = Number.parseInt(process.env.BROWSER_RLS_SMOKE_TIMEOUT_MS || process.env.RLS_SMOKE_TIMEOUT_MS || process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);
const expectBlocked = preflightOnly;
const extractActionPattern = /이 내용으로 아이디어 정리하기|이 후보들 중 하나로 정리하기|AI가 아이디어 도출하기|AI로 아이디어 구체화|AI로 후보 찾기|AI 후보 발굴/;
const authEntryLinkPattern = /실행 보드 열기|로그인\s*\/\s*회원가입|로그인하기|로그인/;
const passwordSignInPattern = /비밀번호로 로그인|^로그인$/;

const fixtures = {
  emailA: process.env.BROWSER_RLS_SMOKE_EMAIL_A || process.env.RLS_SMOKE_USER_A_EMAIL,
  passwordA: process.env.BROWSER_RLS_SMOKE_PASSWORD_A || process.env.RLS_SMOKE_USER_A_PASSWORD,
  workspaceA: process.env.BROWSER_RLS_SMOKE_WORKSPACE_A_LABEL || process.env.RLS_SMOKE_WORKSPACE_A_LABEL,
  emailB: process.env.BROWSER_RLS_SMOKE_EMAIL_B || process.env.RLS_SMOKE_USER_B_EMAIL,
  passwordB: process.env.BROWSER_RLS_SMOKE_PASSWORD_B || process.env.RLS_SMOKE_USER_B_PASSWORD,
  workspaceB: process.env.BROWSER_RLS_SMOKE_WORKSPACE_B_LABEL || process.env.RLS_SMOKE_WORKSPACE_B_LABEL,
};

const forbiddenFlags = [
  "BROWSER_SMOKE_ALLOW_WRITE",
  "BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE",
  "BROWSER_SMOKE_SCREENSHOT",
  "BROWSER_RLS_SMOKE_SCREENSHOT",
  "RLS_SMOKE_SCREENSHOT",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const forbiddenEnabledFlags = new Set(["BROWSER_SMOKE_ALLOW_WRITE", "BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE"]);

const ignoredConsoleErrors = [
  "favicon",
  "ResizeObserver loop completed",
  "ResizeObserver loop limit exceeded",
];

function fail(message) {
  throw new Error(`RLS browser smoke failed: ${message}`);
}

function blocked(reason, missing = []) {
  console.log("RLS allowed/denied smoke blocked before browser execution.");
  console.log(`Reason: ${reason}`);
  if (missing.length > 0) {
    console.log(`Missing fixture fields: ${missing.join(", ")}`);
  }
  console.log("Smoke class: rls_allowed_denied_smoke");
  console.log("Writes performed: no");
  console.log("Secrets printed: no");
  console.log("Screenshots stored: no");
  console.log("Telemetry smoke: not_run");
  console.log("Production mutation: no");

  if (expectBlocked) {
    console.log(
      preflightOnly
        ? "Blocked preflight matched --preflight expectation."
        : "Blocked preflight matched BROWSER_RLS_SMOKE_EXPECT_BLOCKED=1.",
    );
    return;
  }

  process.exitCode = 2;
}

function isForbiddenFlagSet(name) {
  const value = process.env[name];

  if (!value) {
    return false;
  }

  if (forbiddenEnabledFlags.has(name)) {
    return value === "1" || value.toLowerCase() === "true";
  }

  return true;
}

function validatePreflight() {
  const setForbiddenFlags = forbiddenFlags.filter((name) => isForbiddenFlagSet(name));
  if (setForbiddenFlags.length > 0) {
    blocked("forbidden smoke flags are set", setForbiddenFlags);
    return false;
  }

  const missing = [];
  if (!baseUrl) missing.push("BROWSER_RLS_SMOKE_URL or RLS_SMOKE_URL");
  if (!fixtures.emailA) missing.push("BROWSER_RLS_SMOKE_EMAIL_A");
  if (!fixtures.passwordA) missing.push("BROWSER_RLS_SMOKE_PASSWORD_A");
  if (!fixtures.workspaceA) missing.push("BROWSER_RLS_SMOKE_WORKSPACE_A_LABEL");
  if (!fixtures.emailB) missing.push("BROWSER_RLS_SMOKE_EMAIL_B");
  if (!fixtures.passwordB) missing.push("BROWSER_RLS_SMOKE_PASSWORD_B");
  if (!fixtures.workspaceB) missing.push("BROWSER_RLS_SMOKE_WORKSPACE_B_LABEL");

  if (missing.length > 0) {
    blocked("disposable account/workspace pair is incomplete", missing);
    return false;
  }

  if (preflightOnly) {
    console.log("RLS allowed/denied smoke preflight ready.");
    console.log("Smoke class: rls_allowed_denied_smoke");
    console.log("Browser execution: not_run");
    console.log("Writes performed: no");
    console.log("Secrets printed: no");
    console.log("Screenshots stored: no");
    console.log("Telemetry smoke: not_run");
    console.log("Production mutation: no");
    return false;
  }

  return true;
}

async function waitForVisible(locator, label, waitMs = 15000) {
  try {
    await locator.first().waitFor({ state: "visible", timeout: waitMs });
  } catch (error) {
    fail(`missing visible UI: ${label}. ${error instanceof Error ? error.message : ""}`);
  }
}

async function waitForAnyVisible(candidates, label, waitMs = 15000) {
  const deadline = Date.now() + waitMs;
  const lastErrors = [];

  while (Date.now() < deadline) {
    for (const candidate of candidates) {
      try {
        if (await candidate.locator.first().isVisible({ timeout: 500 })) {
          return candidate.name;
        }
      } catch (error) {
        lastErrors.push(error instanceof Error ? error.message : String(error));
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  fail(`missing visible UI: ${label}. ${lastErrors.slice(-2).join(" | ")}`);
}

async function clickFirst(locator, label) {
  await waitForVisible(locator, label);
  try {
    await locator.first().click({ timeout: 10000 });
  } catch (error) {
    fail(`could not click ${label}. ${error instanceof Error ? error.message : ""}`);
  }
}

async function fillFirst(locator, value, label) {
  await waitForVisible(locator, label);
  try {
    await locator.first().fill(value, { timeout: 10000 });
  } catch (error) {
    fail(`could not fill ${label}. ${error instanceof Error ? error.message : ""}`);
  }
}

async function hasVisibleText(page, text) {
  if (!text) {
    return false;
  }

  try {
    return await page.getByText(text).first().isVisible({ timeout: 1000 });
  } catch {
    return false;
  }
}

async function assertHiddenText(page, text, label) {
  if (await hasVisibleText(page, text)) {
    fail(`cross-workspace private data was visible: ${label}`);
  }
}

function isExpectedDeniedError(error) {
  const text = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`.toLowerCase();
  return text.includes("permission denied") || text.includes("row-level security") || text.includes("jwt");
}

async function createCheckedContext(browser, label) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const organizationNames = new Set();
  const organizationResponseErrors = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();
    if (!ignoredConsoleErrors.some((ignored) => text.includes(ignored))) {
      consoleErrors.push(text);
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("response", (response) => {
    const url = response.url();

    if (!url.includes("/rest/v1/organizations")) {
      return;
    }

    void response
      .json()
      .then((body) => {
        if (!Array.isArray(body)) {
          return;
        }

        body.forEach((row) => {
          if (row && typeof row.name === "string") {
            organizationNames.add(row.name);
          }
        });
      })
      .catch((error) => {
        if (!isExpectedDeniedError(error)) {
          organizationResponseErrors.push(error instanceof Error ? error.message : String(error));
        }
      });
  });

  return {
    context,
    page,
    async assertWorkspaceBoundary(expectedWorkspace, deniedWorkspace, actorLabel, waitMs = 20000) {
      const deadline = Date.now() + waitMs;

      while (Date.now() < deadline) {
        const names = Array.from(organizationNames);

        if (names.includes(deniedWorkspace)) {
          fail(`${actorLabel} could read denied workspace "${deniedWorkspace}". Available: ${names.join(", ")}`);
        }

        if (names.includes(expectedWorkspace)) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      const names = Array.from(organizationNames);
      fail(
        `${actorLabel} could not read allowed workspace "${expectedWorkspace}". Available: ${
          names.length > 0 ? names.join(", ") : "none"
        }`,
      );
    },
    assertNoWorkspaceLeak(deniedWorkspaces, actorLabel) {
      const names = Array.from(organizationNames);
      const leaked = deniedWorkspaces.filter((workspace) => names.includes(workspace));

      if (leaked.length > 0) {
        fail(`${actorLabel} could read denied workspace names: ${leaked.join(", ")}`);
      }
    },
    async assertClean() {
      if (pageErrors.length > 0) {
        fail(`${label} page errors: ${pageErrors.join(" | ")}`);
      }

      if (consoleErrors.length > 0) {
        fail(`${label} console errors: ${consoleErrors.join(" | ")}`);
      }

      if (organizationResponseErrors.length > 0) {
        fail(`${label} organization response errors: ${organizationResponseErrors.join(" | ")}`);
      }
    },
  };
}

async function openWorkspace(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout });
  await waitForAnyVisible(
    [
      { name: "brand heading", locator: page.getByRole("heading", { name: /^AI Venture Lab$/ }) },
      { name: "hero copy", locator: page.getByText(/흩어진 아이디어를 실행 후보로/i) },
      { name: "workspace heading", locator: page.getByRole("heading", { name: /실행 보드/ }) },
    ],
    "app shell",
  );

  if (!page.url().includes("/workspace")) {
    await clickFirst(page.getByRole("link", { name: authEntryLinkPattern }), "auth or workspace cta");
  }

  await waitForAnyVisible(
    [
      { name: "workspace heading", locator: page.getByRole("heading", { name: /실행 보드/ }) },
      { name: "login heading", locator: page.getByRole("heading", { name: /^로그인$/ }) },
      { name: "password sign-in", locator: page.getByRole("button", { name: passwordSignInPattern }) },
    ],
    "auth or workspace entry",
    20000,
  );
}

async function loginAndCheck(session, credentials, expectedWorkspace, deniedWorkspace, actorLabel) {
  const { page } = session;

  await openWorkspace(page);
  await fillFirst(page.getByLabel(/이메일/), credentials.email, `${actorLabel} email input`);
  await fillFirst(page.getByLabel(/비밀번호/), credentials.password, `${actorLabel} password input`);
  await clickFirst(page.getByRole("button", { name: passwordSignInPattern }), `${actorLabel} password sign-in button`);

  await waitForAnyVisible(
    [
      { name: "signed-in state", locator: page.getByText(/로그인됨/) },
      { name: "login success message", locator: page.getByText(/로그인되었습니다/) },
      { name: "workspace heading", locator: page.getByRole("heading", { name: /실행 보드/ }) },
      { name: "score heading", locator: page.getByRole("heading", { name: /사업성 평가|후보 선택/ }) },
      { name: "extract action", locator: page.getByRole("button", { name: extractActionPattern }) },
    ],
    `${actorLabel} post-login state`,
    25000,
  );

  await waitForAnyVisible(
    [
      { name: "active", locator: page.getByLabel(/활성 워크스페이스/) },
      { name: "extract-ready", locator: page.getByRole("button", { name: extractActionPattern }) },
      { name: "score-ready", locator: page.getByRole("heading", { name: /사업성 평가|후보 선택/ }) },
    ],
    `${actorLabel} authenticated workspace state`,
    20000,
  );

  await session.assertWorkspaceBoundary(expectedWorkspace, deniedWorkspace, actorLabel);
}

async function main() {
  if (!validatePreflight()) {
    return;
  }

  const browser = await chromium.launch({ headless });

  try {
    const anonymous = await createCheckedContext(browser, "anonymous");
    await openWorkspace(anonymous.page);
    await waitForAnyVisible(
      [
        { name: "login required", locator: anonymous.page.getByText(/워크스페이스 멤버십을 불러오려면 로그인하세요/) },
        { name: "login form", locator: anonymous.page.getByRole("button", { name: passwordSignInPattern }) },
      ],
      "anonymous private-read denied state",
      15000,
    );
    await assertHiddenText(anonymous.page, fixtures.workspaceA, "anonymous denied workspace A");
    await assertHiddenText(anonymous.page, fixtures.workspaceB, "anonymous denied workspace B");
    anonymous.assertNoWorkspaceLeak([fixtures.workspaceA, fixtures.workspaceB], "anonymous");
    await anonymous.assertClean();
    await anonymous.context.close();

    const actorA = await createCheckedContext(browser, "disposable account A");
    await loginAndCheck(
      actorA,
      { email: fixtures.emailA, password: fixtures.passwordA },
      fixtures.workspaceA,
      fixtures.workspaceB,
      "disposable account A",
    );
    await actorA.assertClean();
    await actorA.context.close();

    const actorB = await createCheckedContext(browser, "disposable account B");
    await loginAndCheck(
      actorB,
      { email: fixtures.emailB, password: fixtures.passwordB },
      fixtures.workspaceB,
      fixtures.workspaceA,
      "disposable account B",
    );
    await actorB.assertClean();
    await actorB.context.close();

    console.log("Smoke class: rls_allowed_denied_smoke");
    console.log(`Target URL: ${baseUrl}`);
    console.log("Accounts: disposable_pair_confirmed");
    console.log("Workspace pair: disposable_pair_confirmed");
    console.log("Anonymous denied check: pass");
    console.log("Allowed check A: pass");
    console.log("Allowed check B: pass");
    console.log("Cross-workspace denied check A->B: pass");
    console.log("Cross-workspace denied check B->A: pass");
    console.log("Direct private-record probe: not_run");
    console.log("Writes performed: no");
    console.log("Secrets printed: no");
    console.log("Screenshots stored: no");
    console.log("Telemetry smoke: not_run");
    console.log("Production mutation: no");
    console.log("RLS allowed/denied browser smoke passed.");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
