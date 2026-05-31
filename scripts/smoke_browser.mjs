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
    await waitForVisible(page.getByText("AI 우선 제품 OS", { exact: true }).first(), "homepage Korean hero product OS label");
    await waitForVisible(page.getByText("제작 패키지 OS", { exact: true }), "homepage Korean package OS label");
    await waitForVisible(page.getByText("메모에서 패키지", { exact: true }), "homepage Korean source-to-package label");
    await waitForVisible(page.getByText("전달 완성도", { exact: true }), "homepage Korean handoff label");
    const staleHeroEnglishLabels = await page
      .getByText(/automation-first product OS|Package OS|Raw memo|source to package|handoff integrity/)
      .count();
    if (staleHeroEnglishLabels > 0) {
      fail("homepage hero still exposes stale English micro-labels");
    }
    await waitForVisible(page.getByRole("link", { name: /로그인(?: \/ |·)회원가입/ }), "anonymous account cta");
    const anonymousWorkspaceLinks = await page.getByRole("link", { name: /실행 보드 열기/ }).count();
    if (anonymousWorkspaceLinks > 0) {
      fail("anonymous homepage exposes workspace cta");
    }
    await waitForVisible(page.locator("#flow"), "homepage flow content");
    await waitForVisible(page.getByRole("link", { name: /가이드|guide/i }).first(), "guide link");
    await waitForVisible(page.locator('[data-smoke="landing-credit-model"]'), "homepage credit model");
    await waitForVisible(page.getByText("30크레딧 / 아이디어", { exact: true }), "homepage build pass cost");
    await waitForVisible(
      page.locator('[data-smoke="landing-credit-model"]').getByText("제품 기획서, 화면 구조", { exact: false }),
      "homepage product-term package value copy",
    );
    const staleHomepagePrdCopy = await page
      .locator('[data-smoke="landing-credit-model"]')
      .getByText("PRD, 화면 구조", { exact: false })
      .count();
    if (staleHomepagePrdCopy > 0) {
      fail("homepage credit model still uses PRD abbreviation in user-facing value copy");
    }
    await waitForVisible(page.locator('[data-smoke="landing-plan-boundary"]'), "homepage plan boundary");
    await waitForVisible(page.getByText("Free로 시작하기", { exact: true }), "homepage free start CTA");
    await waitForVisible(page.getByText("반복 제작과 외부 개발 실행", { exact: true }), "homepage pro boundary");
    await waitForVisible(page.getByText("결제 없이 기록", { exact: true }), "homepage pro interest record label");
    await waitForVisible(page.getByText("결과물 형태와 개발 방식", { exact: false }).first(), "homepage result type and development method wording");

    await page.goto(`${baseUrl}/workspace`, { waitUntil: "networkidle", timeout });

    await waitForVisible(page.getByRole("heading", { name: /실행 보드/ }), "workspace heading");
    await waitForVisible(page.locator('[data-smoke="workspace-credit-summary"]'), "workspace credit summary");
    await waitForVisible(page.getByText("제작 크레딧", { exact: true }), "workspace credit summary label");
    await waitForVisible(page.getByText(/지금 할 일|검토할 아이디어를 먼저 저장|회의 내용, 아이디어/).first(), "stage guidance");
    await waitForVisible(page.getByText(/진행 순서|로그인/).first(), "workflow rail");
    const staleIntakeRedirectButton = await page.getByRole("button", { name: "메모 붙여넣기 화면 열기" }).count();
    if (staleIntakeRedirectButton > 0) {
      fail("workspace empty-state still shows a no-op paste-screen redirect button");
    }

    const loginHeading = page.getByRole("heading", { name: /^로그인$/ }).first();
    const extractHeading = page.getByRole("heading", { name: /^메모에서 검토할 아이디어 정리$/ }).first();
    const loginButton = page.getByRole("button", { name: /비밀번호로 로그인/ }).first();
    const extractButton = page
      .getByRole("button", {
        name: /이 내용으로 아이디어 정리하기|킵한 후보로 아이디어 정리하기|이 후보들 중 하나로 정리하기|먼저 내용을 입력하세요|AI가 아이디어 도출하기|AI로 아이디어 구체화|AI 후보 발굴/,
      })
      .first();

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
      await waitForVisible(page.locator('[data-smoke="first-use-one-sentence"]'), "first-use one-sentence guidance");
      await waitForVisible(
        page.getByText("처음이라면 메모를 그대로 붙이고 AI 정리만 누르세요.", { exact: true }),
        "first-use primary instruction",
      );
      await waitForVisible(
        page.getByText("받는 것: 후보 3개, 결과물 형태, 개발 방식.", { exact: false }),
        "first-use immediate output promise",
      );
      await waitForVisible(page.locator('[data-smoke="first-use-fast-path"]'), "first-use fast path");
      await waitForVisible(page.getByText("1. 붙여넣기", { exact: true }), "first-use paste step");
      await waitForVisible(page.getByText("2. AI 정리", { exact: true }), "first-use ai organize step");
      await waitForVisible(page.getByText("3. 저장 후 열림", { exact: true }), "first-use saved output step");
      await waitForVisible(
        page.getByText("하단 다음 단계 버튼이 열리고 사업성 평가부터 이어짐", { exact: true }),
        "first-use saved next-step button cue",
      );
      await waitForVisible(page.locator('[data-smoke="first-use-current-action"]'), "first-use current action");
      await waitForVisible(page.getByText("아래 입력칸에 생각나는 말을 그대로 붙입니다.", { exact: false }), "first-use paste current action");
      await waitForVisible(page.locator('[data-smoke="first-use-input-examples"]'), "first-use input examples");
      await waitForVisible(
        page.getByText("입력칸만 채우고 단계는 이동하지 않습니다.", { exact: true }).first(),
        "first-use example no auto-step cue",
      );
      const firstUseExampleFill = page.locator('[data-smoke="first-use-example-fill"]').first();
      await waitForVisible(firstUseExampleFill, "first-use example fill action");
      await firstUseExampleFill.click({ timeout: 10000 });
      const firstUseRawSourceValue = await page.locator('[data-smoke="first-use-raw-source"]').inputValue({ timeout: 10000 });
      if (!firstUseRawSourceValue.includes("고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만들고 있어요.")) {
        fail("first-use example action did not fill the raw source textarea");
      }
      await waitForVisible(page.locator('[data-smoke="first-use-input-ready"]'), "first-use input ready cue");
      await waitForVisible(
        page.getByText("회의 메모 예시가 입력됐습니다.", { exact: false }),
        "first-use selected example cue",
      );
      await waitForVisible(page.locator('[data-smoke="first-use-more-context"]'), "first-use folded context");
      await page.getByText("AI가 만들 결과와 저장 후 흐름 보기", { exact: true }).click({ timeout: 10000 });
      await waitForVisible(page.locator('[data-smoke="first-use-ai-output-preview"]'), "first-use AI output preview");
      await waitForVisible(page.getByText("AI 정리 결과:", { exact: false }), "first-use AI output preview label");
      await waitForVisible(page.getByText("아이디어 후보 3개", { exact: false }), "first-use AI output preview candidates");
      await waitForVisible(page.locator('[data-smoke="first-use-operator-role"]'), "first-use operator role split");
      await waitForVisible(page.getByText("AI가 먼저", { exact: true }), "first-use AI role label");
      await waitForVisible(page.getByText("사용자는", { exact: true }), "first-use operator role label");
      await waitForVisible(page.getByText("하단 다음 단계만 누르기", { exact: true }), "first-use next-step role");
      await waitForVisible(page.locator('[data-smoke="first-use-build-choice-split"]'), "first-use build choice split");
      await waitForVisible(page.getByText("무엇을 만들지", { exact: true }), "first-use result type split label");
      await waitForVisible(page.getByText("어떻게 만들지", { exact: true }), "first-use development method split label");
      await waitForVisible(page.getByText("회의 메모", { exact: true }), "first-use meeting memo example");
      await waitForVisible(page.getByText("GPT 대화", { exact: true }), "first-use GPT conversation example");
      await waitForVisible(page.getByText("자동화 업무", { exact: true }), "first-use automation task example");
      await waitForVisible(page.locator('[data-smoke="first-use-build-contract"]'), "first-use build contract");
      await waitForVisible(
        page.getByText("모바일 앱으로 만들고, Cursor로 개발합니다.", { exact: true }),
        "first-use result type and development method example",
      );
      await waitForVisible(page.locator('[data-smoke="first-use-output-path"]'), "first-use downstream output path");
      await waitForVisible(
        page.getByText("사업성 평가, 리스크, 검증 계획, 제작 패키지, 외부 개발 도구 전달 자료", { exact: false }),
        "first-use downstream artifacts",
      );
      await waitForVisible(page.getByText("완료 0/8", { exact: true }), "first step zero-complete progress");
      const staleInProgressCounter = await page.getByText("진행 1/8", { exact: true }).count();
      if (staleInProgressCounter > 0) {
        fail("first step progress still uses in-progress 1/8 instead of completed 0/8");
      }
    } else {
      fail("unable to detect either login or extract stage");
    }

    await page.goto(`${baseUrl}/guide`, { waitUntil: "networkidle", timeout });
    await waitForVisible(page.getByRole("heading", { name: /AI Venture Lab 이용 가이드/ }), "guide heading");
    await waitForVisible(
      page.getByRole("heading", { name: /외부 제작 도구로 제작을 시작하는 법/ }),
      "guide external tool heading",
    );
    await waitForVisible(
      page.getByText("작업 순서 확인 후 최종 실행", { exact: true }),
      "guide work-order before final execution step",
    );
    await waitForVisible(
      page.getByText("STEP 7에서 선택한 외부 개발 도구의 연결 파일", { exact: false }),
      "guide final execution connection file sequence",
    );
    await waitForVisible(
      page.getByText("결과물 형태는 웹 서비스, 모바일 앱, 랜딩/웹사이트처럼 정하고 개발 방식은", { exact: false }),
      "guide result type and development method separation",
    );
    await waitForVisible(
      page.getByText("모바일 앱으로 만들고 Cursor로 개발합니다", { exact: false }),
      "guide concrete development method example",
    );
    for (const toolName of ["Cursor", "Codex", "Claude Code", "Google Antigravity"]) {
      await waitForVisible(page.getByText(toolName, { exact: true }).first(), `guide named tool ${toolName}`);
    }
    await waitForVisible(
      page.getByText("node .*/venture-lab-cli.mjs next-task", { exact: false }),
      "guide named tool CLI check",
    );
    await waitForVisible(page.getByText("터미널 에이전트형", { exact: true }).first(), "guide terminal agent mode");
    await waitForVisible(page.getByText("설치 명령과 확인 명령은 각각 복사할 수 있습니다", { exact: false }), "guide command copy wording");
    await waitForVisible(page.getByText("붙여넣기는 실패 시 백업", { exact: false }), "guide backup wording");
    await waitForVisible(page.getByText("언제 크레딧을 쓰나요", { exact: true }), "guide credit FAQ");
    await waitForVisible(page.getByText("30크레딧 제작 패스", { exact: false }), "guide build pass FAQ");
    await waitForVisible(
      page.getByText("제품 기획서, 화면 구조, 디자인 기준", { exact: false }),
      "guide product-term package value copy",
    );
    const staleGuidePrdCopy = await page.getByText("PRD, 화면 구조", { exact: false }).count();
    if (staleGuidePrdCopy > 0) {
      fail("guide still uses PRD abbreviation in user-facing value copy");
    }
    await waitForVisible(page.locator('[data-smoke="guide-credit-plan-ladder"]'), "guide credit plan ladder");
    await waitForVisible(page.getByText("결제 없이 Pro 관심 기록", { exact: false }), "guide pro interest record wording");
    await waitForVisible(page.getByText("Pro 관심 등록은 어디서 하나요", { exact: true }), "guide upgrade interest FAQ");

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
