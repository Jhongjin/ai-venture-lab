import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.BROWSER_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const email = process.env.BROWSER_SMOKE_EMAIL;
const password = process.env.BROWSER_SMOKE_PASSWORD;
const allowWrite = process.env.BROWSER_SMOKE_ALLOW_WRITE === "1";
const allowWorkspaceCreate = process.env.BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE === "1";
const headless = process.env.BROWSER_SMOKE_HEADLESS !== "0";
const timeout = Number.parseInt(process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);
const screenshotPath = process.env.BROWSER_SMOKE_SCREENSHOT;

const ignoredConsoleErrors = [
  "favicon",
  "ResizeObserver loop completed",
  "ResizeObserver loop limit exceeded",
];

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
    oneLiner: "인증된 운영자가 아이디어를 저장하고 워크벤치 갱신을 확인하는 스모크 기록",
    targetUser: "AI Venture Lab 베타 검수 담당자",
    signal: "비밀번호 로그인, 워크스페이스 경계, 아이디어 저장, 목록 반영을 한 번에 검증합니다.",
    riskSummary: "쓰기 스모크는 BROWSER_SMOKE_ALLOW_WRITE=1일 때만 실행하고 베타 전용 계정에서 수행합니다.",
    nextEvidence: "저장 직후 워크벤치에 생성된 아이디어 이름이 표시되는지 확인합니다.",
  };
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

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle", timeout });
    await waitForVisible(page.getByRole("heading", { name: /아이디어-MVP 실행 센터/ }), "main heading");

    await clickFirst(page.getByRole("button", { name: /운영자 로그인/ }), "operator login navigation");
    await fillFirst(page.getByLabel(/이메일/), email, "email input");
    await fillFirst(page.getByLabel(/기존 계정 비밀번호/), password, "password input");
    await clickFirst(page.getByRole("button", { name: /기존 비밀번호로 로그인/ }), "password sign-in button");
    await waitForVisible(page.getByText(/로그인됨/), "signed-in state", 25000);
    await waitForVisible(page.getByText(new RegExp(escapeRegExp(email))), "signed-in email", 10000);

    await clickFirst(page.getByRole("button", { name: /워크스페이스/ }), "workspace navigation");
    let workspaceState = await waitForAnyVisible(
      [
        { name: "active", locator: page.getByLabel(/활성 워크스페이스/) },
        { name: "empty", locator: page.getByText(/연결된 워크스페이스가 없습니다/) },
        { name: "login-required", locator: page.getByText(/워크스페이스 멤버십을 불러오려면 로그인하세요/) },
      ],
      "workspace state",
      20000,
    );

    if (workspaceState === "login-required") {
      fail("login succeeded visually, but workspace panel still sees an anonymous session.");
    }

    if (workspaceState === "empty" && allowWorkspaceCreate) {
      await clickFirst(page.getByRole("button", { name: /워크스페이스 만들기/ }), "create workspace button");
      await waitForVisible(page.getByLabel(/활성 워크스페이스/), "created active workspace", 25000);
      workspaceState = "active";
    }

    if (workspaceState !== "active" && allowWrite) {
      fail(
        "write smoke requires an active workspace. Create one first or set BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE=1 for disposable beta accounts.",
      );
    }

    if (allowWrite) {
      const idea = makeSmokeIdea();

      await clickFirst(page.getByRole("button", { name: /새 아이디어/ }), "new idea navigation");
      await waitForVisible(page.getByRole("heading", { name: /새 아이디어 입력/ }), "new idea form");
      await fillFirst(page.getByLabel(/^이름$/), idea.name, "idea name");
      await fillFirst(page.getByLabel(/구매자/), idea.buyer, "buyer");
      await fillFirst(page.getByLabel(/한 줄 설명/), idea.oneLiner, "one-liner");
      await fillFirst(page.getByLabel(/대상 사용자/), idea.targetUser, "target user");
      await fillFirst(page.getByLabel(/수요 신호/), idea.signal, "signal");
      await fillFirst(page.getByLabel(/리스크 요약/), idea.riskSummary, "risk summary");
      await fillFirst(page.getByLabel(/다음 증거/), idea.nextEvidence, "next evidence");
      await clickFirst(page.getByRole("button", { name: /아이디어 저장/ }), "save idea button");
      await waitForVisible(page.getByText(/워크벤치에 바로 반영했습니다/), "save success message", 25000);
      await waitForVisible(page.getByText(idea.name), "created idea in workbench", 25000);
      console.log(`Authenticated browser write smoke created idea: ${idea.name}`);
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

    if (consoleErrors.length > 0) {
      fail(`console errors: ${consoleErrors.join(" | ")}`);
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
