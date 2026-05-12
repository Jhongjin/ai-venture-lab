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

async function clickFirst(locator, label) {
  await waitForVisible(locator, label);
  try {
    await locator.first().click({ timeout: 10000 });
  } catch (error) {
    fail(`could not click ${label}. ${error instanceof Error ? error.message : ""}`);
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
    await waitForVisible(page.getByRole("button", { name: /아이디어 찾기/ }), "idea extraction navigation");

    await clickFirst(page.getByRole("button", { name: /아이디어 찾기/ }), "idea extraction navigation");
    await waitForVisible(page.getByRole("heading", { name: /아이디어 찾기/ }), "idea extraction panel");
    await clickFirst(page.getByRole("button", { name: /샘플 넣기/ }), "sample source button");
    await clickFirst(page.getByRole("button", { name: /규칙 기반/ }), "rules extraction button");
    await waitForVisible(page.getByText(/후보 비교 매트릭스/), "candidate comparison matrix", 20000);
    await waitForVisible(page.getByText(/검증 패키지/), "validation package result", 20000);

    await clickFirst(page.getByRole("button", { name: /아이디어 접수/ }), "new idea navigation");
    await waitForVisible(page.getByRole("heading", { name: /아이디어 접수/ }), "new idea form");
    await waitForVisible(page.getByLabel(/이름/), "idea name input");

    await clickFirst(page.getByRole("button", { name: /제작 준비/ }), "app development navigation");
    const developmentResult = await waitForAnyVisible(
      [
        { name: "development-panel", locator: page.getByRole("heading", { name: /제작 준비 프로세스/ }) },
        { name: "empty-workbench", locator: page.getByText(/아직 검토할 아이디어가 없습니다/) },
      ],
      "development panel or empty workbench state",
    );

    if (developmentResult === "development-panel") {
      await waitForVisible(page.getByText(/개발 킥오프 브리프/), "development kickoff brief");
      await waitForVisible(page.getByText(/구현 실행 패키지/), "implementation run package");
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
