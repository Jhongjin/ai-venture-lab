import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.BROWSER_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const headless = process.env.BROWSER_SMOKE_HEADLESS !== "0";
const timeout = Number.parseInt(process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);
const screenshotPath = process.env.BROWSER_SMOKE_SCREENSHOT;

const ignoredConsoleErrors = [
  "favicon",
  "ResizeObserver loop completed",
  "ResizeObserver loop limit exceeded",
];

function fail(message) {
  throw new Error(`Browser smoke failed: ${message}`);
}

async function waitForVisible(locator, label, waitMs = 15000) {
  try {
    await locator.first().waitFor({ state: "visible", timeout: waitMs });
  } catch (error) {
    fail(`missing visible UI: ${label}. ${error instanceof Error ? error.message : ""}`);
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

async function main() {
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

    await waitForVisible(page.getByRole("heading", { name: /^AI Venture Lab$/ }), "homepage hero heading");
    await waitForVisible(page.getByRole("link", { name: /로그인(?: \/ |·)회원가입/ }), "anonymous account cta");
    const anonymousWorkspaceLinks = await page.getByRole("link", { name: /실행 보드 열기/ }).count();
    if (anonymousWorkspaceLinks > 0) {
      fail("anonymous homepage exposes workspace cta");
    }
    await waitForVisible(page.locator("#flow"), "homepage flow content");
    await waitForVisible(page.getByRole("link", { name: /가이드|guide/i }).first(), "guide link");

    await page.goto(`${baseUrl}/workspace`, { waitUntil: "networkidle", timeout });

    await waitForVisible(page.getByRole("heading", { name: /실행 보드/ }), "workspace heading");
    await waitForVisible(page.getByText(/지금 할 일|검토할 아이디어를 먼저 저장|회의 내용, 아이디어/).first(), "stage guidance");
    await waitForVisible(page.getByText(/진행 순서|로그인/).first(), "workflow rail");

    const loginHeading = page.getByRole("heading", { name: /^로그인$/ }).first();
    const extractHeading = page.getByRole("heading", { name: /^메모에서 검토할 아이디어 정리$/ }).first();
    const loginButton = page.getByRole("button", { name: /비밀번호로 로그인/ }).first();
    const extractButton = page.getByRole("button", { name: /이 내용으로 아이디어 정리하기|이 후보들 중 하나로 정리하기|먼저 내용을 입력하세요|AI가 아이디어 도출하기|AI로 아이디어 구체화|AI 후보 발굴/ }).first();

    const stageVisible = await Promise.race([
      loginHeading
        .waitFor({ state: "visible", timeout: 8000 })
        .then(() => "login")
        .catch(() => null),
      extractHeading
        .waitFor({ state: "visible", timeout: 8000 })
        .then(() => "extract")
        .catch(() => null),
    ]);

    if (stageVisible === "login") {
      await waitForVisible(loginButton, "password sign-in button");
    } else if (stageVisible === "extract") {
      await waitForVisible(extractButton, "ai extraction button");
    } else {
      fail("unable to detect either login or extract stage");
    }

    if (resolvedScreenshotPath) {
      await page.screenshot({ path: resolvedScreenshotPath, fullPage: true });
      console.log(`Browser smoke screenshot saved to ${resolvedScreenshotPath}`);
    }

    if (pageErrors.length > 0) {
      fail(`page errors: ${pageErrors.join(" | ")}`);
    }

    if (consoleErrors.length > 0) {
      fail(`console errors: ${consoleErrors.join(" | ")}`);
    }

    console.log(`Browser smoke passed for ${baseUrl}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
