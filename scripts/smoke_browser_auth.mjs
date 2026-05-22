import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const baseUrl = process.env.BROWSER_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const email = process.env.BROWSER_SMOKE_EMAIL;
const password = process.env.BROWSER_SMOKE_PASSWORD;
const allowWrite = process.env.BROWSER_SMOKE_ALLOW_WRITE === "1";
const allowWorkspaceCreate = process.env.BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE === "1";
const headless = process.env.BROWSER_SMOKE_HEADLESS !== "0";
const timeout = Number.parseInt(process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);
const workspaceSettleTimeout = Number.parseInt(process.env.BROWSER_SMOKE_WORKSPACE_SETTLE_MS || "15000", 10);
const screenshotPath = process.env.BROWSER_SMOKE_SCREENSHOT;
const extractActionPattern = /아이디어 자동 정리|AI로 아이디어 구체화|AI로 후보 찾기|AI 후보 발굴/;
const ideaSourcePlaceholderPattern = /예\).*아이디어|회의 내용|LLM/i;

const ignoredConsoleErrors = [
  "favicon",
  "ResizeObserver loop completed",
  "ResizeObserver loop limit exceeded",
];
const genericResourceLoadErrorPattern = /^Failed to load resource: the server responded with a status of \d{3}/;

function fail(message) {
  throw new Error(`Authenticated browser smoke failed: ${message}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requireEnv(name, value) {
  if (!value) {
    fail(`missing ${name}. Set BROWSER_SMOKE_EMAIL and BROWSER_SMOKE_PASSWORD for an existing Supabase Auth user.`);
  }
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

async function getWorkspaceState(page, waitMs = 20000) {
  return waitForAnyVisible(
    [
      { name: "active", locator: page.getByLabel(/활성 워크스페이스/) },
      { name: "empty", locator: page.getByText(/연결된 워크스페이스가 없습니다/) },
      { name: "create-available", locator: page.getByRole("button", { name: /워크스페이스 만들기/ }) },
      { name: "login-required", locator: page.getByText(/워크스페이스 멤버십을 불러오려면 로그인하세요/) },
      ...(!allowWrite && !allowWorkspaceCreate
        ? [
            { name: "extract-ready", locator: page.getByRole("button", { name: extractActionPattern }) },
            { name: "score-ready", locator: page.getByRole("heading", { name: /사업성 평가|후보 선택/ }) },
          ]
        : []),
    ],
    "authenticated session state",
    waitMs,
  );
}

async function clickFirst(locator, label, waitMs = 15000) {
  await waitForVisible(locator, label, waitMs);
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

async function isFirstVisible(locator, waitMs = 750) {
  try {
    return await locator.first().isVisible({ timeout: waitMs });
  } catch {
    return false;
  }
}

async function visibleText(locator, waitMs = 750) {
  try {
    if (!(await locator.first().isVisible({ timeout: waitMs }))) {
      return "";
    }

    return (await locator.first().innerText({ timeout: waitMs })).replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

async function prepareScreenshotPath(targetPath) {
  if (!targetPath) {
    return null;
  }

  const resolvedPath = path.resolve(targetPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });

  return resolvedPath;
}

function makeSmokeIdea() {
  const stamp = new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14);

  return {
    name: `브라우저 인증 스모크 ${stamp}`,
    buyer: "베타 테스트 운영자",
    oneLiner: "인증된 운영자가 아이디어를 저장하고 실행 보드 갱신을 확인하는 스모크 기록",
    targetUser: "AI Venture Lab 베타 검수 담당자",
    signal: "비밀번호 로그인, 워크스페이스 경계, 아이디어 저장, 목록 반영을 한 번에 검증합니다.",
    riskSummary: "쓰기 스모크는 BROWSER_SMOKE_ALLOW_WRITE=1일 때만 실행하고 베타 전용 계정에서 수행합니다.",
    nextEvidence: "저장 직후 실행 보드에 생성된 아이디어 이름이 표시되는지 확인합니다.",
  };
}

function buildSmokeIdeaSource(idea) {
  return [
    `아이디어: ${idea.name}`,
    `구매자: ${idea.buyer}`,
    `타깃: ${idea.targetUser}`,
    `한 줄 설명: ${idea.oneLiner}`,
    `수요 신호: ${idea.signal}`,
    `리스크: ${idea.riskSummary}`,
    `다음 검증 질문: ${idea.nextEvidence}`,
  ].join("\n");
}

async function openOptionalTaskList(page) {
  const optionalSummary = page.getByText(/^선택 기능$/);

  if (await isFirstVisible(optionalSummary)) {
    await optionalSummary.first().click({ timeout: 10000 });
  }
}

async function openWorkspaceTask(page) {
  if (await isFirstVisible(page.getByRole("heading", { name: /협업 공간 상태/ }))) {
    return true;
  }

  let workspaceNav = page.getByRole("button", { name: /협업 설정|팀 연결|협업 공간|워크스페이스/ });
  if (!(await isFirstVisible(workspaceNav))) {
    await openOptionalTaskList(page);
    workspaceNav = page.getByRole("button", { name: /협업 설정|팀 연결|협업 공간|워크스페이스/ });
  }

  if (!(await isFirstVisible(workspaceNav))) {
    return false;
  }

  await clickFirst(workspaceNav, "workspace navigation");
  await waitForVisible(page.getByRole("heading", { name: /협업 공간 상태/ }), "workspace panel", 15000);
  return true;
}

async function resolveWorkspaceState(page) {
  let workspaceState = await getWorkspaceState(page, 20000);

  if (workspaceState === "login-required") {
    fail("login succeeded visually, but workspace panel still sees an anonymous session.");
  }

  if (workspaceState === "empty" || workspaceState === "create-available") {
    const activeAppeared = await isFirstVisible(page.getByLabel(/활성 워크스페이스/), workspaceSettleTimeout);

    if (activeAppeared) {
      return "active";
    }
  }

  if ((workspaceState === "empty" || workspaceState === "create-available") && allowWrite) {
    await page.reload({ waitUntil: "networkidle", timeout });
    await waitForVisible(page.getByRole("heading", { name: /실행 보드/ }), "workspace heading after refresh", 20000);
    await openWorkspaceTask(page);
    workspaceState = await getWorkspaceState(page, 20000);

    if (workspaceState === "login-required") {
      fail("login succeeded after refresh, but workspace panel still sees an anonymous session.");
    }

    if (workspaceState === "empty" || workspaceState === "create-available") {
      const activeAppearedAfterRefresh = await isFirstVisible(
        page.getByLabel(/활성 워크스페이스/),
        workspaceSettleTimeout,
      );

      if (activeAppearedAfterRefresh) {
        return "active";
      }
    }
  }

  if ((workspaceState === "empty" || workspaceState === "create-available") && allowWorkspaceCreate) {
    await clickFirst(page.getByRole("button", { name: /워크스페이스 만들기|협업 공간 만들기/ }), "create workspace button");
    await waitForVisible(page.getByLabel(/활성 워크스페이스/), "created active workspace", 25000);
    workspaceState = "active";
  }

  return workspaceState;
}

async function summarizeWorkspaceDiagnostics(page, workspaceApiEvents) {
  const workspaceResources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => name.includes("/rest/v1/organizations") || name.includes("/rest/v1/organization_members"))
      .slice(-6),
  );
  const [activeVisible, emptyVisible, createVisible, loginRequiredVisible, messageText] = await Promise.all([
    isFirstVisible(page.getByLabel(/활성 워크스페이스/)),
    isFirstVisible(page.getByText(/연결된 워크스페이스가 없습니다|연결된 협업 공간이 없습니다/)),
    isFirstVisible(page.getByRole("button", { name: /워크스페이스 만들기|협업 공간 만들기/ })),
    isFirstVisible(page.getByText(/워크스페이스 멤버십을 불러오려면 로그인하세요/)),
    visibleText(page.getByText(/워크스페이스|협업 공간|row-level security|permission denied/i)),
  ]);

  return [
    `active=${activeVisible}`,
    `empty=${emptyVisible}`,
    `createButton=${createVisible}`,
    `loginRequired=${loginRequiredVisible}`,
    messageText ? `visibleText="${messageText.slice(0, 180)}"` : "visibleText=none",
    workspaceApiEvents.length > 0 ? `workspaceApi=${workspaceApiEvents.slice(-6).join("; ")}` : "workspaceApi=none",
    workspaceResources.length > 0 ? `workspaceResources=${workspaceResources.join("; ")}` : "workspaceResources=none",
  ].join(" | ");
}

async function waitForWorkspaceApiRows(workspaceApiEvents, waitMs = 15000) {
  const deadline = Date.now() + waitMs;

  while (Date.now() < deadline) {
    const hasOrganizationRows = workspaceApiEvents.some((event) => {
      const match = event.match(/organizations rows=(\d+)/);
      return match ? Number.parseInt(match[1], 10) > 0 : false;
    });
    const hasMembershipRows = workspaceApiEvents.some((event) => {
      const match = event.match(/organization_members rows=(\d+)/);
      return match ? Number.parseInt(match[1], 10) > 0 : false;
    });

    if (hasOrganizationRows || hasMembershipRows) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return false;
}

async function openExtractTask(page) {
  const sourceInput = page.getByPlaceholder(ideaSourcePlaceholderPattern);

  if (await isFirstVisible(sourceInput)) {
    return;
  }

  const focusCta = page.getByRole("button", { name: /아이디어 자동 정리|아이디어 구체화|후보 찾기/ });
  if (await isFirstVisible(focusCta)) {
    await focusCta.first().click({ timeout: 10000 });
  } else if (await isFirstVisible(page.getByRole("button", { name: /아이디어 찾기/ }))) {
    const extractNav = page.getByRole("button", { name: /아이디어 찾기/ });
    await clickFirst(extractNav, "extract navigation");
  } else {
    for (let step = 0; step < 4; step += 1) {
      const previousButton = page.getByRole("button", { name: /이전 단계/ });

      if (!(await isFirstVisible(previousButton))) {
        break;
      }

      await previousButton.first().click({ timeout: 10000 });

      if (await isFirstVisible(sourceInput, 5000)) {
        return;
      }
    }
  }

  await waitForVisible(sourceInput, "idea source input", 15000);
}

async function openAuthEntry(page) {
  await clickFirst(
    page.getByRole("link", { name: /실행 보드 열기|로그인\s*\/\s*회원가입|로그인하기|로그인/ }),
    "auth or workspace cta",
  );
  await waitForAnyVisible(
    [
      { name: "workspace heading", locator: page.getByRole("heading", { name: /실행 보드/ }) },
      { name: "login heading", locator: page.getByRole("heading", { name: /^로그인$/ }) },
      { name: "password sign-in", locator: page.getByRole("button", { name: /비밀번호로 로그인|^로그인$/ }) },
    ],
    "auth entry",
    20000,
  );
}

async function main() {
  requireEnv("BROWSER_SMOKE_EMAIL", email);
  requireEnv("BROWSER_SMOKE_PASSWORD", password);

  const resolvedScreenshotPath = await prepareScreenshotPath(screenshotPath);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const httpErrors = [];
  const workspaceApiEvents = [];

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
    pageErrors.push(`${error.message} at ${page.url()}`);
  });
  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();

    if (url.includes("/rest/v1/organizations") || url.includes("/rest/v1/organization_members")) {
      const table = url.includes("/rest/v1/organization_members") ? "organization_members" : "organizations";
      workspaceApiEvents.push(`${status} ${table} rows=pending`);
      void response
        .json()
        .then((body) => {
          const rows = Array.isArray(body) ? body.length : "n/a";
          workspaceApiEvents.push(`${status} ${table} rows=${rows}`);
        })
        .catch(() => {
          workspaceApiEvents.push(`${status} ${table} rows=unreadable`);
        });
    }

    if (status >= 400) {
      httpErrors.push(`${status} ${url}`);
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle", timeout });
    await waitForAnyVisible(
      [
        { name: "brand heading", locator: page.getByRole("heading", { name: /^AI Venture Lab$/ }) },
        { name: "hero supporting copy", locator: page.getByText(/흩어진 아이디어를 실행 후보로/i) },
        { name: "legacy hero heading", locator: page.getByRole("heading", { name: /아이디어를 검증하고/i }) },
      ],
      "homepage hero heading",
    );

    await openAuthEntry(page);
    await fillFirst(page.getByLabel(/이메일/), email, "email input");
    await fillFirst(page.getByLabel(/비밀번호/), password, "password input");
    await clickFirst(page.getByRole("button", { name: /비밀번호로 로그인|^로그인$/ }), "password sign-in button");
    const postLoginState = await waitForAnyVisible(
      [
        { name: "signed-in state", locator: page.getByText(/로그인됨/) },
        { name: "login success message", locator: page.getByText(/로그인되었습니다/) },
        { name: "workspace heading", locator: page.getByRole("heading", { name: /실행 보드/ }) },
        { name: "next extract stage", locator: page.getByRole("heading", { name: /아이디어 찾기/ }) },
        { name: "score heading", locator: page.getByRole("heading", { name: /사업성 평가|후보 선택/ }) },
        { name: "extract action", locator: page.getByRole("button", { name: extractActionPattern }) },
      ],
      "post-login state",
      25000,
    );

    if (postLoginState === "signed-in state" || postLoginState === "login success message") {
      await waitForVisible(page.getByText(new RegExp(escapeRegExp(email))), "signed-in email", 10000);
    }

    const workspacePanelOpened = allowWrite || allowWorkspaceCreate ? await openWorkspaceTask(page) : false;

    let workspaceState = workspacePanelOpened ? await resolveWorkspaceState(page) : "unknown";

    if (allowWrite && workspaceState !== "active") {
      const hasWorkspaceRows = await waitForWorkspaceApiRows(workspaceApiEvents, workspaceSettleTimeout);

      if (hasWorkspaceRows) {
        workspaceState = "active";
      }
    }

    if (workspaceState !== "active" && allowWrite) {
      const diagnostics = await summarizeWorkspaceDiagnostics(page, workspaceApiEvents);
      fail(
        `write smoke requires an active workspace. Create one first or set BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE=1 for disposable beta accounts. Diagnostics: ${diagnostics}`,
      );
    }

    if (allowWrite) {
      const idea = makeSmokeIdea();

      await openExtractTask(page);
      await fillFirst(page.getByPlaceholder(ideaSourcePlaceholderPattern), buildSmokeIdeaSource(idea), "idea source");
      await clickFirst(page.getByRole("button", { name: extractActionPattern }), "extract ideas button");
      await clickFirst(page.getByRole("button", { name: /이 아이디어 저장하고 검증 시작|이 후보 저장하고 검증 시작|검증 자료 저장|검증 패키지 저장/ }), "save validation package button", 45000);
      const saveResult = await waitForAnyVisible(
        [
          { name: "package saved", locator: page.getByText(/패키지로 저장했습니다/) },
          {
            name: "package status",
            locator: page
              .getByRole("status")
              .filter({ hasText: /패키지로 저장했습니다|아이디어는 저장했지만 연결 기록 일부가 실패했습니다/ }),
          },
          { name: "partial package saved", locator: page.getByText(/아이디어는 저장했지만 연결 기록 일부가 실패했습니다/) },
          { name: "workbench added idea", locator: page.getByText(/새 아이디어를 실행 보드에 바로 추가하고 선택했습니다|새 아이디어를 워크벤치에 바로 추가하고 선택했습니다/) },
          { name: "selected smoke idea", locator: page.getByText(/브라우저 인증 스모크/) },
          { name: "workbench result", locator: page.getByRole("heading", { name: /후보 선택|사업성 평가/ }) },
          { name: "package save failed", locator: page.getByText(/후보 패키지를 저장하지 못했습니다|아이디어를 저장하지 못했습니다|row-level security|permission denied/i) },
        ],
        "write smoke package save result",
        45000,
      );
      if (saveResult === "package save failed") {
        fail("validation package save returned an error in the UI.");
      }
      console.log(`Authenticated browser write smoke saved validation package from source: ${idea.name}`);
    } else {
      console.log("Authenticated browser smoke passed login/workspace visibility. Set BROWSER_SMOKE_ALLOW_WRITE=1 to create a disposable idea.");
    }

    if (resolvedScreenshotPath) {
      await page.screenshot({ path: resolvedScreenshotPath, fullPage: true });
      console.log(`Authenticated browser smoke screenshot saved to ${resolvedScreenshotPath}`);
    }

    if (pageErrors.length > 0) {
      fail(`page errors: ${pageErrors.join(" | ")}`);
    }

    const relevantHttpErrors = httpErrors.filter(
      (entry) => !(allowWorkspaceCreate && entry.includes("/rest/v1/organizations") && entry.startsWith("409 ")),
    );
    const relevantConsoleErrors = consoleErrors.filter(
      (entry) => !(genericResourceLoadErrorPattern.test(entry) && httpErrors.length > relevantHttpErrors.length),
    );

    if (relevantHttpErrors.length > 0) {
      fail(`http errors: ${relevantHttpErrors.join(" | ")}`);
    }

    if (relevantConsoleErrors.length > 0) {
      fail(`console errors: ${relevantConsoleErrors.join(" | ")}`);
    }

    console.log(`Authenticated browser smoke passed for ${baseUrl}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
