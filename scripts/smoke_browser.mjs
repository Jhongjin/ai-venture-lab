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

    await waitForVisible(page.getByRole("heading", { name: /아이디어 실행 보드/ }), "main heading");
    await waitForVisible(page.getByText(/저장소/), "data source card");
    await waitForVisible(page.getByRole("heading", { name: /^로그인$/ }).first(), "login step heading");
    await waitForVisible(page.getByText(/뒤 단계는 잠겨 있습니다/), "locked future steps");
    await waitForVisible(
      page.getByText(/이 화면 안에서 로그인하면 다음 단계가 자동으로 열립니다/),
      "auth blocker guidance",
    );
    await waitForVisible(page.getByRole("button", { name: /비밀번호로 로그인/ }), "password sign-in button");

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
