import { chromium } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const execFileAsync = promisify(execFile);

const baseUrl = process.env.BUILD_SYNC_SMOKE_URL || process.env.BROWSER_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const email = process.env.BUILD_SYNC_SMOKE_EMAIL || process.env.BROWSER_SMOKE_EMAIL;
const password = process.env.BUILD_SYNC_SMOKE_PASSWORD || process.env.BROWSER_SMOKE_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configuredIdeaId = process.env.BUILD_SYNC_SMOKE_IDEA_ID || process.env.TELEMETRY_SMOKE_IDEA_ID;
const headless = (process.env.BUILD_SYNC_SMOKE_HEADLESS || process.env.BROWSER_SMOKE_HEADLESS) !== "0";
const keepData = process.env.BUILD_SYNC_SMOKE_KEEP_DATA === "1";
const allowProgressWrite = process.env.BUILD_SYNC_SMOKE_ALLOW_PROGRESS_WRITE === "1";
const allowBuildPassSpend = process.env.BUILD_SYNC_SMOKE_ALLOW_BUILD_PASS_SPEND === "1";
const timeout = Number.parseInt(process.env.BUILD_SYNC_SMOKE_TIMEOUT_MS || process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);

function fail(message) {
  throw new Error(`Build sync token smoke failed: ${message}`);
}

function requireEnv(name, value) {
  if (!value) {
    fail(`missing ${name}. Set BUILD_SYNC_SMOKE_EMAIL/PASSWORD or BROWSER_SMOKE_EMAIL/PASSWORD.`);
  }
}

function makeStamp() {
  return new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14);
}

function hasConfigValue(value) {
  return Boolean(value && value.trim());
}

function tamperBuildSyncTokenPayload(token, overrides) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    fail("could not tamper malformed build sync token for denied-case smoke.");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, ...overrides })).toString("base64url");

  return `${tamperedPayload}.${signature}`;
}

async function loginInBrowser(page) {
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle", timeout });
  await page.getByLabel(/이메일/).fill(email, { timeout });
  await page.getByLabel(/비밀번호/).fill(password, { timeout });
  await page.getByRole("button", { name: /비밀번호로 로그인|^로그인$/ }).click({ timeout });
  await page.getByRole("heading", { name: /실행 보드|아이디어 찾기|사업성 평가|후보 선택/ }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.waitForFunction(() => document.cookie.includes("-auth-token"), undefined, { timeout });
}

async function callAppApi(page, path, init = {}) {
  return page.evaluate(
    async ({ path: requestPath, init: requestInit }) => {
      const response = await fetch(requestPath, { credentials: "include", ...requestInit });
      const body = await response.json().catch(() => ({}));
      return {
        status: response.status,
        ok: response.ok,
        headers: {
          cacheControl: response.headers.get("cache-control") || "",
        },
        body,
      };
    },
    { path, init },
  );
}

function assertNoStore(result, label) {
  if (!/\bno-store\b/i.test(result.headers?.cacheControl || "")) {
    fail(`${label} did not return Cache-Control: no-store.`);
  }
}

async function waitForVisibleDecisionSentence(page) {
  await page.locator("p:visible", { hasText: "결정:" }).first().waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyLearningTaskBoard(page, ideaId) {
  const learningUrl = new URL("/workspace", baseUrl);
  learningUrl.searchParams.set("task", "learning");
  learningUrl.searchParams.set("idea", ideaId);

  await page.goto(learningUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "성과 확인" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("먼저 세 가지만 확인합니다: 완료된 것, 이어 할 것, 지금 결정할 것.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("리포트는 필요할 때만 엽니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("여기서는 리포트를 먼저 읽지 않습니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("지금 할 일", { exact: true }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page
    .locator('[data-smoke="step8-primary-cta"]')
    .getByText(/^(다음 작업은 STEP 7에서 이어갑니다|최종 실행은 STEP 7에서 확인합니다|리포트 복사)$/)
    .waitFor({
    state: "visible",
    timeout,
  });
  await page.locator('[data-smoke="step8-primary-action-now"]').getByText("오늘 실제로 할 일", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await page.locator('[data-smoke="step8-one-sentence-outcome"]').getByText("한 줄 결론", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  const currentDecisionStrip = page.locator('[data-smoke="step8-current-decision-strip"]');
  for (const label of ["완료 상태", "다음 행동", "오늘 판단"]) {
    await currentDecisionStrip.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await waitForVisibleDecisionSentence(page);
  const singleDecisionRule = page.locator('[data-smoke="step8-single-decision-rule"]');
  await singleDecisionRule.getByText("판단 후보 중 하나만", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await singleDecisionRule.getByText("상세 리포트는 필요할 때만", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await singleDecisionRule.getByText("완료 근거가 없으면 다음 작업 하나만 유지", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const actionLadderDetails = page.locator('[data-smoke="step8-action-ladder-details"]');
  await actionLadderDetails.getByText("확인 순서 보기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await actionLadderDetails.locator("summary").click();
  const actionLadder = actionLadderDetails.locator('[data-smoke="step8-action-ladder"]');
  for (const label of ["1. 완료 확인", "2. 다음 하나", "3. 판단 하나"]) {
    await actionLadder.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  const decisionOptions = page.locator('[data-smoke="step8-decision-options"]');
  await decisionOptions.getByText("오늘 고를 판단 후보", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  const decisionOptionsText = await decisionOptions.innerText({ timeout });
  const hasExpectedDecisionOption = [
    "작업 계속",
    "첫 버전 배포",
    "다음 빌드 승인",
    "리스크 보완",
  ].some((label) => decisionOptionsText.includes(label));
  if (!hasExpectedDecisionOption) {
    fail(`STEP 8 decision options did not include an expected current-state option: ${decisionOptionsText}`);
  }
  const simpleReview = page.locator('[data-smoke="step8-simple-review"]');
  for (const label of ["완료", "다음", "판단"]) {
    await simpleReview.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await simpleReview.getByText("완료 보고가 저장된 제작 작업입니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const completionBridge = page.locator('[data-smoke="step8-external-completion-bridge"]');
  await completionBridge.getByText("외부 도구 완료 보고 후", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  for (const label of ["완료된 것", "다음 작업", "오늘 판단"]) {
    await completionBridge.getByText(label, { exact: false }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await completionBridge.getByText("자세한 진행표는 필요할 때만", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const nextJudgmentBrief = page.locator('[data-smoke="step8-next-judgment-brief"]');
  await nextJudgmentBrief.getByText("오늘 답할 질문", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await nextJudgmentBrief.getByText("?", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await nextJudgmentBrief.getByText("리포트", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const syncBrief = page.locator('[data-smoke="step8-sync-brief"]');
  await syncBrief.getByText("자동 반영 요약", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await syncBrief
    .locator("p")
    .filter({ hasText: /자동 반영 기준으로 완료|아직 반영할 제작 작업/ })
    .first()
    .waitFor({
      state: "visible",
      timeout,
    });
  await syncBrief.getByText("다음은", { exact: false }).first().waitFor({
    state: "visible",
    timeout,
  });
  const syncReviewDetails = syncBrief.locator('[data-smoke="step8-sync-review-details"]');
  await syncReviewDetails.getByText("자동 반영 세부 보기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await syncReviewDetails.locator("summary").click();
  const syncReview = syncReviewDetails.locator('[data-smoke="step8-sync-review"]');
  for (const label of ["반영 결과", "다음 작업", "최근 확인"]) {
    await syncReview.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  const progressSection = page.locator('[data-smoke="step8-progress-section"]');
  await progressSection
    .getByRole("heading", { name: /다음 작업 하나만 확인|완료된 것만 훑어보기|진행표 대기/ })
    .waitFor({
      state: "visible",
      timeout,
    });
  const outcomeDetails = page.locator('[data-smoke="step8-outcome-details"]');
  await outcomeDetails.getByText("판단 근거 자세히 보기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await outcomeDetails.locator("summary").click();
  await outcomeDetails.getByText("처음에는 위의 한눈 요약만 보면 됩니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await outcomeDetails.locator('[data-smoke="step8-outcome-summary"]').waitFor({
    state: "visible",
    timeout,
  });
  const outcomeSummary = outcomeDetails.locator('[data-smoke="step8-outcome-summary"]');
  for (const label of ["완료된 것", "남은 것", "지금 판단할 것"]) {
    await outcomeSummary.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await progressSection.getByText("진행 신호", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await progressSection
    .getByText(/전체 목록은 진행 순서 확인용|한눈 요약에서 정합니다|최종 실행에서 첫 제작 작업/)
    .waitFor({
      state: "visible",
      timeout,
    });
  const progressDetails = progressSection.locator('[data-smoke="step8-progress-details"]');
  await progressDetails.getByText("전체 진행표 보기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await progressDetails.locator("summary").click();
  await progressDetails.locator("span", { hasText: "build sync smoke registry verification" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await progressDetails.locator("span.avl-pill-success:visible", { hasText: "완료" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("필요할 때만 여는 운영자용 리포트", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyWorkOrderCurrentAction(page, ideaId) {
  const workOrderUrl = new URL("/workspace", baseUrl);
  workOrderUrl.searchParams.set("task", "orchestration");
  workOrderUrl.searchParams.set("idea", ideaId);

  await page.goto(workOrderUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "작업 순서 보드" }).waitFor({
    state: "visible",
    timeout,
  });

  const currentAction = page.locator('[data-smoke="step6-current-action"]');
  for (const label of ["지금 할 일", "첫 작업", "다음 단계"]) {
    await currentAction.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await currentAction.getByText("T-001", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const firstTaskFocus = page.locator('[data-smoke="step6-first-task-focus"]');
  await firstTaskFocus.getByText("처음에는 전체 작업표를 다 읽지 않고", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await firstTaskFocus.getByText("T-001 이름과 완료 기준만 확인", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const firstTaskLock = page.locator('[data-smoke="step6-first-task-lock"]');
  await firstTaskLock.getByText("첫 제작 범위 잠금", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  for (const label of ["작업 번호", "작업 이름", "완료 기준"]) {
    await firstTaskLock.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await firstTaskLock.getByText("T-001", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });

  const executionBridge = page.locator('[data-smoke="step6-execution-bridge"]');
  await executionBridge.getByText("제작 패키지 연결", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  for (const label of ["1. 제작 패키지", "2. 작업 순서", "3. 최종 실행"]) {
    await executionBridge.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await executionBridge.getByText("연결 파일과 START 파일", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const manualRunForm = page.locator('[data-smoke="step6-manual-run-form"]');
  await manualRunForm.getByText("필요할 때만 직접 단계 추가", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await manualRunForm.getByText("보조 추가는 작업표에만 반영되고", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyFinalExecutionActionBanner(page, toolLabel) {
  const actionBanner = page.locator('[data-smoke="final-execution-action-banner"]');
  await actionBanner.getByText(`${toolLabel} 연결 파일을 실제 프로젝트 루트에서 실행하세요.`, { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await actionBanner.getByText("설치 명령과 확인 명령만 차례로 실행하면 됩니다", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const runPlaceOneLiner = actionBanner.locator('[data-smoke="final-execution-run-place-one-liner"]');
  await runPlaceOneLiner.getByText("이 화면에서는 연결 파일을 받기만 합니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await runPlaceOneLiner.getByText("다운로드 폴더에서는 실행하지 않습니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await runPlaceOneLiner.getByText("AI Venture Lab 폴더에서도 실행하지 않습니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.locator('[data-smoke="final-execution-simple-mode-note"]').getByText("실행만 하기", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const runLocationSummary = page.locator('[data-smoke="final-execution-run-location-summary"]');
  for (const label of ["실행할 곳", "아닌 곳", "5초 확인"]) {
    await runLocationSummary.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await runLocationSummary.getByText("실제 앱 폴더 최상단", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await runLocationSummary.getByText("다운로드 폴더", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await runLocationSummary.getByText("AI Venture Lab 폴더", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const simplePath = page.locator('[data-smoke="final-execution-simple-path"]');
  await simplePath.getByText("1. 연결 파일 받기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("2. 실행 위치", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("4. 첫 작업 시작", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("T-001 첫 작업", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("복사한 명령은 연결 파일을 옮긴 프로젝트 루트 터미널", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const expectedFirstTaskStart =
    toolLabel === "Cursor" || toolLabel === "Google Antigravity"
      ? `${toolLabel} 안의 첫 메시지`
      : `같은 프로젝트 루트에서 ${toolLabel}를 열고`;
  await simplePath.getByText(expectedFirstTaskStart, { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("외부 프로젝트 루트", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("다운로드 폴더가 아닙니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await simplePath.getByText("AI Venture Lab 폴더가 아닙니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const installResult = page.locator('[data-smoke="final-execution-install-result"]');
  await installResult.getByText("설치 후 생기는 파일 보기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await installResult.locator("summary").click();
  await installResult.getByText("처음에는 설치 명령과 확인 명령만 실행하면 됩니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  for (const label of ["START 파일", "작업 목록", "진행 기록"]) {
    await installResult.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  const rootCheck = page.locator('[data-smoke="final-execution-root-check"]');
  await rootCheck.getByText("실행 위치 확인", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await rootCheck.getByText("실행할 곳", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await rootCheck.getByText("아닌 곳", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await rootCheck.getByText("실제 앱 파일", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await rootCheck.getByText("AI Venture Lab 폴더", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await rootCheck.getByText("package.json, app, src가 보이는 곳", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  const folderCheckQuestion = page.locator('[data-smoke="final-execution-folder-check-question"]');
  await folderCheckQuestion.getByText("실행 전 5초 확인", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await folderCheckQuestion.getByText("package.json, app 또는 src", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await folderCheckQuestion.getByText("현재 폴더가 AI Venture Lab 프로젝트라면", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const toolStartMode = page.locator('[data-smoke="final-execution-tool-start-mode"]');
  const expectedStartMode =
    toolLabel === "Cursor" || toolLabel === "Google Antigravity" ? "IDE에서 시작" : "터미널 에이전트에서 시작";
  await toolStartMode.getByText("도구 시작 방식", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await toolStartMode.getByText(expectedStartMode, { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await toolStartMode.getByText("START 파일을 첫 메시지로 넣습니다", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const afterFirstTask = page.locator('[data-smoke="final-execution-after-first-task"]');
  await afterFirstTask.getByText("첫 작업 뒤에는 STEP 8만 확인", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await afterFirstTask.getByText("완료된 것", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await afterFirstTask.getByText("다음 작업", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await afterFirstTask.getByText("오늘 판단", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await afterFirstTask.getByText("자동 반영이 안 될 때만", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const commandPath = page.locator('[data-smoke="final-execution-command-path"]');
  await commandPath.getByText("1. 파일 받기", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await commandPath.getByText("3. 설치와 확인", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await commandPath.getByText("4. 첫 작업 시작", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  const successCriterion = page.locator('[data-smoke="final-execution-success-criterion"]');
  await successCriterion.getByText("성공 기준", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await successCriterion.getByText("확인 명령 결과에 T-001이 보이면 설치 완료입니다", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const commandSequence = page.locator('[data-smoke="final-execution-command-sequence"]');
  await commandSequence.getByText("같은 프로젝트 루트 터미널", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await commandSequence.getByText("1. 설치 명령, 2. 확인 명령", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await commandSequence.getByText("현재 터미널이 다운로드 폴더나 AI Venture Lab 폴더라면", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await commandSequence.getByText("복사 버튼은 명령을 클립보드에 넣는 역할만 합니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await commandSequence.getByText("붙여넣기는 연결 파일을 옮긴 그 프로젝트 루트 터미널", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const primaryDownloadCue = page.locator('[data-smoke="final-execution-primary-download-cue"]');
  await primaryDownloadCue.getByText(`${toolLabel} 연결 파일 받기`, { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await primaryDownloadCue.getByText("시작 지시문 복사는 설치 확인 뒤", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await primaryDownloadCue.getByText("처음에는 연결 파일 받기만 누르세요.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await primaryDownloadCue.getByText("설치 확인 뒤 쓰는 보조 버튼", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await primaryDownloadCue.getByText("받을 파일명:", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await primaryDownloadCue.getByText("실제 앱 폴더 최상단으로 옮긴 뒤", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await primaryDownloadCue.getByText("보관용 문서는 연결 없이 자료만", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "설치 후 시작 지시문 복사" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "보관용 문서 받기" }).waitFor({
    state: "visible",
    timeout,
  });
  const connectionHealth = page.locator('[data-smoke="final-execution-connection-health"]');
  await connectionHealth.getByText("자동 반영 상태", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await connectionHealth.getByText("확인 명령을 먼저 실행하세요", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await connectionHealth.getByText("연결 파일 받기와 설치/확인 명령", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  const syncResult = page.locator('[data-smoke="final-execution-sync-result"]');
  for (const label of ["반영 결과", "다음 작업", "최근 확인"]) {
    await syncResult.getByText(label, { exact: true }).waitFor({
      state: "visible",
      timeout,
    });
  }
  await waitForVisibleDecisionSentence(page);
}

async function openFinalExecutionDetailGuide(page, toolLabel) {
  const detailGuide = page.locator('[data-smoke="final-execution-detail-guide"]');
  await detailGuide.getByText(`${toolLabel}에서 시작하는 순서 자세히 보기`, { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await detailGuide.locator("summary").click({ timeout });
}

async function verifyFinalExecutionCursorGuide(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("heading", { name: "Cursor 프로젝트에 연결 파일을 설치합니다" }).waitFor({
    state: "visible",
    timeout,
  });
  await verifyFinalExecutionActionBanner(page, "Cursor");
  await openFinalExecutionDetailGuide(page, "Cursor");
  await page.getByText("먼저 실행할 설치 명령", { exact: true }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("설치 후 확인 명령", { exact: true }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "설치 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "확인 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText(/Workspace MCP Servers/).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText(/처음 1회는 토글을 직접 켜야 할 수 있습니다/).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("node .cursor/venture-lab-cli.mjs next-task", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyFinalExecutionCodexGuide(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: /^Codex$/ }).click({ timeout });
  await page.getByRole("heading", { name: "Codex 프로젝트에 연결 파일을 설치합니다" }).waitFor({
    state: "visible",
    timeout,
  });
  await verifyFinalExecutionActionBanner(page, "Codex");
  await openFinalExecutionDetailGuide(page, "Codex");
  await page.getByText("Codex를 그 프로젝트 루트에서 엽니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("node .codex/venture-lab-cli.mjs next-task", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "설치 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "확인 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "Codex 연결 파일 받기" }).waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyFinalExecutionClaudeGuide(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: /^Claude Code$/ }).click({ timeout });
  await page.getByRole("heading", { name: "Claude Code 프로젝트에 연결 파일을 설치합니다" }).waitFor({
    state: "visible",
    timeout,
  });
  await verifyFinalExecutionActionBanner(page, "Claude Code");
  await openFinalExecutionDetailGuide(page, "Claude Code");
  await page.getByText("Windows Terminal 또는 PowerShell에서 그 프로젝트 루트를 엽니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("node .claude/venture-lab-cli.mjs next-task", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "설치 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "확인 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "Claude Code 연결 파일 받기" }).waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyFinalExecutionAntigravityGuide(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: /^Google Antigravity$/ }).click({ timeout });
  await page.getByRole("heading", { name: "Google Antigravity 프로젝트에 연결 파일을 설치합니다" }).waitFor({
    state: "visible",
    timeout,
  });
  await verifyFinalExecutionActionBanner(page, "Google Antigravity");
  await openFinalExecutionDetailGuide(page, "Google Antigravity");
  await page.getByText("Antigravity에서 그 프로젝트 폴더를 엽니다.", { exact: false }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("node .antigravity/venture-lab-cli.mjs next-task", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "설치 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "확인 명령 복사" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("button", { name: "Google Antigravity 연결 파일 받기" }).waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyLiveConnectorDownload(page, ideaId, tool) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });

  if (tool.buttonLabel !== "Cursor") {
    await page.getByRole("button", { name: new RegExp(`^${tool.buttonLabel}$`) }).click({ timeout });
  }

  await page.getByRole("heading", { name: `${tool.buttonLabel} 프로젝트에 연결 파일을 설치합니다` }).waitFor({
    state: "visible",
    timeout,
  });

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout }),
    page.getByRole("button", { name: `${tool.buttonLabel} 연결 파일 받기` }).click({ timeout }),
  ]);

  const suggestedFilename = download.suggestedFilename();
  if (!suggestedFilename.endsWith(".ps1") || !suggestedFilename.includes(tool.filenamePart)) {
    fail(`${tool.buttonLabel} setup download used unexpected filename: ${suggestedFilename}`);
  }

  const downloadPath = await download.path();
  if (!downloadPath) {
    fail(`${tool.buttonLabel} setup download did not produce a readable file path.`);
  }

  const scriptBody = await readFile(downloadPath, "utf8");
  for (const expectedPath of tool.expectedPaths) {
    if (!scriptBody.includes(expectedPath)) {
      fail(`${tool.buttonLabel} setup download is missing ${expectedPath}.`);
    }
  }

  for (const syntaxPath of tool.syntaxPaths ?? []) {
    await verifyEmbeddedJavaScriptSyntax(scriptBody, syntaxPath, tool.buttonLabel);
  }

  if (tool.syncConfigPath) {
    verifyEmbeddedSyncEndpoint(scriptBody, tool.syncConfigPath, tool.buttonLabel);
  }
}

function findEmbeddedPowerShellFile(scriptBody, filePath) {
  const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = scriptBody.match(new RegExp(`@\\{ Path = '${escapedPath}'; Base64 = '([^']+)' \\}`));
  return match?.[1] ?? "";
}

async function verifyEmbeddedJavaScriptSyntax(scriptBody, filePath, toolLabel) {
  const encodedBody = findEmbeddedPowerShellFile(scriptBody, filePath);

  if (!encodedBody) {
    fail(`${toolLabel} setup download is missing embedded body for ${filePath}.`);
  }

  const tempDir = await mkdtemp(path.join(tmpdir(), "venture-build-sync-"));
  const tempFile = path.join(tempDir, path.basename(filePath));

  try {
    await writeFile(tempFile, Buffer.from(encodedBody, "base64").toString("utf8"), "utf8");
    await execFileAsync(process.execPath, ["--check", tempFile], { timeout: 15000 });
  } catch (error) {
    const detail =
      error && typeof error === "object" && "stderr" in error && typeof error.stderr === "string"
        ? error.stderr
        : error instanceof Error
          ? error.message
          : String(error);
    fail(`${toolLabel} setup download embedded ${filePath} is not valid JavaScript. ${detail}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function verifyEmbeddedSyncEndpoint(scriptBody, filePath, toolLabel) {
  const encodedBody = findEmbeddedPowerShellFile(scriptBody, filePath);

  if (!encodedBody) {
    fail(`${toolLabel} setup download is missing embedded body for ${filePath}.`);
  }

  let syncConfig;

  try {
    syncConfig = JSON.parse(Buffer.from(encodedBody, "base64").toString("utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`${toolLabel} setup download embedded ${filePath} is not valid JSON. ${detail}`);
  }

  const endpoint = typeof syncConfig.endpoint === "string" ? syncConfig.endpoint : "";
  if (!endpoint.startsWith("https://ai-venture-lab.vercel.app/api/build-sync/progress")) {
    fail(`${toolLabel} setup download uses a non-production sync endpoint: ${endpoint || "(empty)"}`);
  }
}

async function verifyLiveConnectorDownloads(page, ideaId) {
  const tools = [
    {
      buttonLabel: "Cursor",
      filenamePart: "cursor-setup",
      expectedPaths: [".cursor/venture-lab-cli.mjs", ".cursor/mcp.json", "AI_VENTURE_CURSOR_START.md"],
      syntaxPaths: [".cursor/venture-lab-cli.mjs", ".cursor/venture-lab-mcp-server.mjs"],
      syncConfigPath: ".cursor/venture-lab-sync.json",
    },
    {
      buttonLabel: "Codex",
      filenamePart: "codex-setup",
      expectedPaths: [".codex/venture-lab-cli.mjs", ".codex/venture-lab-sync.json", "AI_VENTURE_CODEX_START.md"],
      syntaxPaths: [".codex/venture-lab-cli.mjs"],
      syncConfigPath: ".codex/venture-lab-sync.json",
    },
    {
      buttonLabel: "Claude Code",
      filenamePart: "claude-code-setup",
      expectedPaths: [".claude/venture-lab-cli.mjs", ".mcp.json", "AI_VENTURE_CLAUDE_START.md"],
      syntaxPaths: [".claude/venture-lab-cli.mjs"],
      syncConfigPath: ".claude/venture-lab-sync.json",
    },
    {
      buttonLabel: "Google Antigravity",
      filenamePart: "antigravity-setup",
      expectedPaths: [
        ".antigravity/venture-lab-cli.mjs",
        ".antigravity/mcp_config.json",
        "AI_VENTURE_ANTIGRAVITY_START.md",
      ],
      syntaxPaths: [".antigravity/venture-lab-cli.mjs"],
      syncConfigPath: ".antigravity/venture-lab-sync.json",
    },
  ];

  for (const tool of tools) {
    await verifyLiveConnectorDownload(page, ideaId, tool);
  }
}

async function verifyNoDeferredGenericMcpTool(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });

  const exposesDeferredGenericMcp = await page
    .getByRole("button", { name: /^범용 MCP 전달$/ })
    .isVisible({ timeout: 1000 })
    .catch(() => false);

  if (exposesDeferredGenericMcp) {
    fail("Deferred generic MCP handoff appeared in the supported external tool selector.");
  }
}

async function resolveSupabasePublicConfigFromPage(page) {
  if (hasConfigValue(supabaseUrl) && hasConfigValue(supabaseAnonKey)) {
    return { url: supabaseUrl, anonKey: supabaseAnonKey };
  }

  return page.evaluate(async () => {
    const scriptUrls = [...document.scripts].map((script) => script.src).filter(Boolean);

    for (const scriptUrl of scriptUrls) {
      const source = await fetch(scriptUrl).then((response) => response.text()).catch(() => "");
      const match = source.match(
        /"(https:\/\/[a-z0-9-]+\.supabase\.co)","(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/,
      );

      if (match) {
        return { url: match[1], anonKey: match[2] };
      }
    }

    return null;
  });
}

async function readBrowserAccessToken(page) {
  return page.evaluate(() => {
    const authCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("sb-") && cookie.includes("-auth-token="));

    if (!authCookie) {
      return "";
    }

    const separatorIndex = authCookie.indexOf("=");
    const rawCookieValue = separatorIndex === -1 ? "" : authCookie.slice(separatorIndex + 1);
    const decodedCookie = decodeURIComponent(rawCookieValue);
    const jsonText = decodedCookie.startsWith("base64-")
      ? (() => {
          const encoded = decodedCookie.slice("base64-".length).replace(/-/g, "+").replace(/_/g, "/");
          const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
          return atob(padded);
        })()
      : decodedCookie;
    const session = JSON.parse(jsonText);
    return typeof session.access_token === "string" ? session.access_token : "";
  });
}

async function requireBrowserAccessToken(page) {
  const accessToken = await readBrowserAccessToken(page);

  if (!accessToken) {
    fail("Browser session access token was not available.");
  }

  return accessToken;
}

async function createDisposableIdea(page, config) {
  const stamp = makeStamp();
  const accessToken = await requireBrowserAccessToken(page);
  const result = await page.evaluate(
    async ({ accessToken: browserAccessToken, config: browserConfig, stamp: browserStamp }) => {
      const response = await fetch(`${browserConfig.url}/rest/v1/ideas?select=id,name,organization_id`, {
        method: "POST",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${browserAccessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name: `build-sync-smoke-${browserStamp}`,
          one_liner: "Disposable smoke idea for Cursor build sync token registry verification.",
          target_user: "AI Venture Lab operator",
          buyer: "AI Venture Lab operator",
          stage: "research",
          decision: "research_more",
          problem_intensity: 3,
          frequency: 3,
          reachability: 3,
          willingness_to_pay: 3,
          mvp_speed: 4,
          differentiation: 3,
          regulatory_risk: 1,
          signal: "Verifies Cursor token issuance, use, revoke, and rejection against production APIs.",
          risk_summary: "Disposable smoke data only. No secrets are printed.",
          next_evidence: "Token registry status should be ready after build_sync_tokens SQL migration.",
          product_surface: "web_app",
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          error: typeof body.message === "string" ? body.message : `HTTP ${response.status}`,
        };
      }

      return { ok: true, idea: Array.isArray(body) ? body[0] : null };
    },
    { accessToken, config, stamp },
  );

  if (!result.ok || !result.idea?.id) {
    fail(`could not create disposable smoke idea: ${result.error ?? "missing idea"}`);
  }

  return result.idea.id;
}

async function createDisposableLaunchPackage(page, config, ideaId) {
  const accessToken = await requireBrowserAccessToken(page);
  const result = await page.evaluate(
    async ({ accessToken: browserAccessToken, config: browserConfig, ideaId: browserIdeaId }) => {
      const body = [
        "# 제작 패키지",
        "",
        "Build sync smoke package for final execution guide verification.",
        "",
        "```yaml",
        "build_delivery_mode: external_tool",
        "external_tool: cursor",
        "external_tool_label: Cursor",
        "```",
      ].join("\n");
      const response = await fetch(`${browserConfig.url}/rest/v1/venture_artifacts?select=id`, {
        method: "POST",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${browserAccessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          idea_id: browserIdeaId,
          artifact_type: "dev_runbook",
          title: "build sync smoke 제작 패키지",
          body,
          source: "agent_run_package",
          status: "approved",
          status_note: "Disposable smoke package for Cursor final execution guide verification.",
        }),
      });
      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          error: typeof responseBody.message === "string" ? responseBody.message : `HTTP ${response.status}`,
        };
      }

      return { ok: true };
    },
    { accessToken, config, ideaId },
  );

  if (!result.ok) {
    fail(`could not create disposable launch package: ${result.error ?? "unknown error"}`);
  }
}

async function cleanupDisposableIdea(page, config, ideaId) {
  const accessToken = await readBrowserAccessToken(page);

  if (!accessToken) {
    return { ok: false, error: "Browser session access token was not available." };
  }

  return page.evaluate(
    async ({ accessToken: browserAccessToken, config: browserConfig, ideaId: browserIdeaId }) => {
      const response = await fetch(`${browserConfig.url}/rest/v1/ideas?id=eq.${encodeURIComponent(browserIdeaId)}`, {
        method: "DELETE",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${browserAccessToken}`,
        },
      });
      const body = await response.text().catch(() => "");

      return {
        ok: response.ok,
        error: response.ok ? "" : body || `HTTP ${response.status}`,
      };
    },
    { accessToken, config, ideaId },
  );
}

async function unlockDisposableBuildPass(page, ideaId) {
  const result = await callAppApi(page, "/api/billing/build-pass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ideaId }),
  });

  if (!result.ok) {
    fail(
      `could not unlock disposable build pass before build-sync token smoke: HTTP ${result.status}: ${
        result.body.error ?? "unknown error"
      }`,
    );
  }

  if (result.body.status !== "ready" || result.body.ideaId !== ideaId) {
    fail("build-pass unlock response did not confirm the disposable smoke idea.");
  }

  return result.body;
}

async function readCreditSummary(page) {
  const result = await callAppApi(page, "/api/billing/credits");

  if (!result.ok || result.body?.status !== "ready") {
    return null;
  }

  return result.body;
}

function getBuildPassCost(summary) {
  return typeof summary?.buildPassCost === "number" ? summary.buildPassCost : 30;
}

function getCreditBalance(summary) {
  return typeof summary?.balance === "number" ? summary.balance : null;
}

function hasBuildPassForIdea(summary, ideaId) {
  return Array.isArray(summary?.buildPasses) && summary.buildPasses.some((pass) => pass?.ideaId === ideaId);
}

function formatCreditGateHint(summary, ideaId) {
  if (!summary) {
    return "Credit summary was not available; run `BILLING_SMOKE_ALLOW_AUTH_GRANT=1 pnpm smoke:billing` to inspect the smoke account without spending credits.";
  }

  const cost = getBuildPassCost(summary);
  const balance = getCreditBalance(summary);
  const hasPass = hasBuildPassForIdea(summary, ideaId);

  if (hasPass) {
    return "The credit summary says this smoke idea already has a production build pass; retry build-sync smoke or verify the configured idea id.";
  }

  if (balance !== null) {
    const shortfall = Math.max(cost - balance, 0);
    return shortfall > 0
      ? `Smoke account has ${balance} credits, but a production build pass costs ${cost}; add at least ${shortfall} credits or use a pre-unlocked disposable smoke idea.`
      : `Smoke account has ${balance} credits and the production build pass costs ${cost}; the unlock route should be able to spend a disposable build pass.`;
  }

  return `Production build pass cost is ${cost}, but the smoke account balance was not returned.`;
}

async function issueBuildSyncToken(page, ideaId, tool, init = {}) {
  return callAppApi(page, "/api/build-sync/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ideaId, tool, ...init }),
  });
}

async function main() {
  requireEnv("BUILD_SYNC_SMOKE_EMAIL", email);
  requireEnv("BUILD_SYNC_SMOKE_PASSWORD", password);

  let ideaId = null;
  let resolvedSupabaseConfig = null;
  let spentDisposableBuildPass = false;
  let usedDisposableIdea = false;
  let creditSummary = null;

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  try {
    await loginInBrowser(page);
    const supabaseConfig = await resolveSupabasePublicConfigFromPage(page);

    if (supabaseConfig) {
      ideaId = await createDisposableIdea(page, supabaseConfig);
      resolvedSupabaseConfig = supabaseConfig;
      usedDisposableIdea = true;
    } else {
      ideaId = configuredIdeaId?.trim() || null;
    }

    if (!ideaId) {
      fail("missing BUILD_SYNC_SMOKE_IDEA_ID or TELEMETRY_SMOKE_IDEA_ID. Supabase public config could not be resolved from the app bundle.");
    }

    creditSummary = await readCreditSummary(page);

    if (usedDisposableIdea && allowBuildPassSpend && creditSummary && !hasBuildPassForIdea(creditSummary, ideaId)) {
      const balance = getCreditBalance(creditSummary);
      const cost = getBuildPassCost(creditSummary);

      if (balance !== null && balance < cost) {
        fail(
          `disposable build-pass spend was allowed, but the smoke account cannot afford it. ${formatCreditGateHint(
            creditSummary,
            ideaId,
          )}`,
        );
      }
    }

    const invalidTtlResult = await callAppApi(page, "/api/build-sync/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, tool: "cursor", expiresInSeconds: -1 }),
    });

    if (invalidTtlResult.status !== 400) {
      fail(`invalid token TTL was not rejected. Expected HTTP 400, received ${invalidTtlResult.status}`);
    }
    assertNoStore(invalidTtlResult, "invalid token TTL response");

    const unsupportedToolResult = await callAppApi(page, "/api/build-sync/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, tool: "generic_mcp" }),
    });

    if (unsupportedToolResult.status !== 400) {
      fail(`unsupported build sync tool was not rejected. Expected HTTP 400, received ${unsupportedToolResult.status}`);
    }
    assertNoStore(unsupportedToolResult, "unsupported tool response");

    let tokenResult = await issueBuildSyncToken(page, ideaId, "cursor");

    if (tokenResult.status === 402 && usedDisposableIdea && allowBuildPassSpend) {
      await unlockDisposableBuildPass(page, ideaId);
      spentDisposableBuildPass = true;
      tokenResult = await issueBuildSyncToken(page, ideaId, "cursor");
    } else if (tokenResult.status === 402 && !allowBuildPassSpend) {
      if (creditSummary && hasBuildPassForIdea(creditSummary, ideaId)) {
        fail("token issue returned HTTP 402 even though the credit summary says this idea already has a production build pass.");
      }

      console.log("Build sync credit gate smoke passed.");
      console.log("Registry/token issue: blocked by production build-pass requirement as expected.");
      console.log(creditSummary ? `Credit preflight: ${formatCreditGateHint(creditSummary, ideaId)}` : "Credit preflight: unavailable");
      console.log("Credit build pass: not spent by this smoke run");
      console.log("Invalid token TTL request: rejected");
      console.log("Unsupported build sync tool request: rejected");
      console.log(
        "Full connector lifecycle: skipped; use a pre-unlocked smoke idea or BUILD_SYNC_SMOKE_ALLOW_BUILD_PASS_SPEND=1 for STEP 7/8 write-back coverage.",
      );
      assertNoStore(tokenResult, "credit-gated token response");
      return;
    } else if (tokenResult.status === 402) {
      fail(
        `token issue returned HTTP 402 because this idea has no production build pass. ${formatCreditGateHint(
          creditSummary,
          ideaId,
        )} For ENFORCE_CREDIT_BUILD_PASS=1, either unlock the configured smoke idea first or run disposable smoke with BUILD_SYNC_SMOKE_ALLOW_BUILD_PASS_SPEND=1.`,
      );
    }

    if (!tokenResult.ok) {
      fail(`token issue returned HTTP ${tokenResult.status}: ${tokenResult.body.error ?? "unknown error"}`);
    }
    assertNoStore(tokenResult, "token issue response");

    if (tokenResult.body.registryStatus !== "ready") {
      fail(`expected registryStatus=ready after SQL migration, received ${tokenResult.body.registryStatus ?? "missing"}`);
    }

    if (!tokenResult.body.token || !tokenResult.body.connection?.id) {
      fail("token issue response did not include a bearer token and connection id.");
    }

    const token = tokenResult.body.token;
    const connectionId = tokenResult.body.connection.id;

    const listResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
    if (!listResult.ok || listResult.body.registryStatus !== "ready") {
      fail(`connection list was not ready: HTTP ${listResult.status}`);
    }
    assertNoStore(listResult, "connection list response");

    const activeConnection = (listResult.body.tokens ?? []).find(
      (connection) => connection.id === connectionId && connection.status === "active",
    );
    if (!activeConnection) {
      fail("issued Cursor connection was not visible as active in the connection list.");
    }

    if (usedDisposableIdea || allowProgressWrite) {
      const progressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-001 build sync smoke registry verification",
              status: "done",
              summary: "Verified that a registered Cursor connection can write progress before revocation.",
              files: ["scripts/smoke_build_sync_tokens.mjs"],
              verification: "Token registry status was ready and progress API accepted the active token.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!progressResult.ok || progressResult.body.registryStatus !== "ready") {
        fail(`active token progress write failed: HTTP ${progressResult.status}`);
      }
      assertNoStore(progressResult, "progress write response");

      const usedListResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
      const usedConnection = (usedListResult.body.tokens ?? []).find((connection) => connection.id === connectionId);
      if (!usedConnection?.lastUsedAt) {
        fail("active token progress write did not update lastUsedAt.");
      }

      const wrongIdeaToken = tamperBuildSyncTokenPayload(token, {
        ideaId: "00000000-0000-4000-8000-000000000000",
      });
      const wrongIdeaProgressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${wrongIdeaToken}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-999 wrong idea token should fail",
              status: "done",
              summary: "This write must be rejected because the token payload was altered to another idea.",
              verification: "Expected HTTP 401.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (wrongIdeaProgressResult.status !== 401) {
        fail(`tampered cross-idea token was not rejected. Expected HTTP 401, received ${wrongIdeaProgressResult.status}`);
      }

      const expiredTokenResult = await issueBuildSyncToken(page, ideaId, "cursor", { expiresInSeconds: 0 });

      if (!expiredTokenResult.ok) {
        fail(`expired token issue returned HTTP ${expiredTokenResult.status}: ${expiredTokenResult.body.error ?? "unknown error"}`);
      }

      if (expiredTokenResult.body.registryStatus !== "ready") {
        fail(
          `expected expired token registryStatus=ready after SQL migration, received ${
            expiredTokenResult.body.registryStatus ?? "missing"
          }`,
        );
      }

      if (!expiredTokenResult.body.token || !expiredTokenResult.body.connection?.id) {
        fail("expired token issue response did not include a bearer token and connection id.");
      }

      const expiredProgressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${expiredTokenResult.body.token}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-998 expired token should fail",
              status: "done",
              summary: "This write must be rejected because the build sync token expired immediately.",
              verification: "Expected HTTP 401.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (expiredProgressResult.status !== 401) {
        fail(`expired token was not rejected. Expected HTTP 401, received ${expiredProgressResult.status}`);
      }

      const expiredRevokeResult = await callAppApi(
        page,
        `/api/build-sync/tokens/${encodeURIComponent(expiredTokenResult.body.connection.id)}`,
        {
          method: "DELETE",
        },
      );

      if (!expiredRevokeResult.ok || expiredRevokeResult.body.connection?.status !== "revoked") {
        fail(`expired connection cleanup revoke failed: HTTP ${expiredRevokeResult.status}`);
      }

      if (usedDisposableIdea && resolvedSupabaseConfig) {
        await createDisposableLaunchPackage(page, resolvedSupabaseConfig, ideaId);
        await verifyWorkOrderCurrentAction(page, ideaId);
        await verifyFinalExecutionCursorGuide(page, ideaId);
        await verifyFinalExecutionCodexGuide(page, ideaId);
        await verifyFinalExecutionClaudeGuide(page, ideaId);
        await verifyFinalExecutionAntigravityGuide(page, ideaId);
        await verifyLiveConnectorDownloads(page, ideaId);
        await verifyNoDeferredGenericMcpTool(page, ideaId);
      }

      await verifyLearningTaskBoard(page, ideaId);
    }

    const revokeResult = await callAppApi(page, `/api/build-sync/tokens/${encodeURIComponent(connectionId)}`, {
      method: "DELETE",
    });

    if (!revokeResult.ok || revokeResult.body.connection?.status !== "revoked") {
      fail(`connection revoke failed: HTTP ${revokeResult.status}`);
    }

    const rejectedProgressResult = await callAppApi(page, "/api/build-sync/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        records: [
          {
            task: "T-002 revoked token should fail",
            status: "done",
            summary: "This write must be rejected because the connection was revoked.",
            verification: "Expected HTTP 401.",
            recordedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    if (rejectedProgressResult.status !== 401) {
      fail(`revoked token was not rejected. Expected HTTP 401, received ${rejectedProgressResult.status}`);
    }

    const codexTokenResult = await issueBuildSyncToken(page, ideaId, "codex");

    if (!codexTokenResult.ok) {
      fail(`Codex token issue returned HTTP ${codexTokenResult.status}: ${codexTokenResult.body.error ?? "unknown error"}`);
    }

    if (codexTokenResult.body.registryStatus !== "ready") {
      fail(`expected Codex registryStatus=ready after SQL migration, received ${codexTokenResult.body.registryStatus ?? "missing"}`);
    }

    if (!codexTokenResult.body.token || !codexTokenResult.body.connection?.id) {
      fail("Codex token issue response did not include a bearer token and connection id.");
    }

    const codexToken = codexTokenResult.body.token;
    const codexConnectionId = codexTokenResult.body.connection.id;
    const codexListResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
    const activeCodexConnection = (codexListResult.body.tokens ?? []).find(
      (connection) => connection.id === codexConnectionId && connection.status === "active" && connection.tool === "codex",
    );

    if (!activeCodexConnection) {
      fail("issued Codex connection was not visible as active in the connection list.");
    }

    if (usedDisposableIdea || allowProgressWrite) {
      const codexProgressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${codexToken}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-002 codex build sync smoke verification",
              status: "done",
              summary: "Verified that a registered Codex connection can write progress before revocation.",
              files: ["scripts/smoke_build_sync_tokens.mjs"],
              verification: "Codex token registry status was ready and progress API accepted the active token.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!codexProgressResult.ok || codexProgressResult.body.registryStatus !== "ready") {
        fail(`Codex active token progress write failed: HTTP ${codexProgressResult.status}`);
      }

      const usedCodexListResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
      const usedCodexConnection = (usedCodexListResult.body.tokens ?? []).find((connection) => connection.id === codexConnectionId);
      if (!usedCodexConnection?.lastUsedAt) {
        fail("Codex active token progress write did not update lastUsedAt.");
      }
    }

    const codexRevokeResult = await callAppApi(page, `/api/build-sync/tokens/${encodeURIComponent(codexConnectionId)}`, {
      method: "DELETE",
    });

    if (!codexRevokeResult.ok || codexRevokeResult.body.connection?.status !== "revoked") {
      fail(`Codex connection revoke failed: HTTP ${codexRevokeResult.status}`);
    }

    const codexRejectedProgressResult = await callAppApi(page, "/api/build-sync/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${codexToken}`,
      },
      body: JSON.stringify({
        records: [
          {
            task: "T-003 revoked Codex token should fail",
            status: "done",
            summary: "This write must be rejected because the Codex connection was revoked.",
            verification: "Expected HTTP 401.",
            recordedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    if (codexRejectedProgressResult.status !== 401) {
      fail(`revoked Codex token was not rejected. Expected HTTP 401, received ${codexRejectedProgressResult.status}`);
    }

    const claudeTokenResult = await issueBuildSyncToken(page, ideaId, "claude_code");

    if (!claudeTokenResult.ok) {
      fail(`Claude Code token issue returned HTTP ${claudeTokenResult.status}: ${claudeTokenResult.body.error ?? "unknown error"}`);
    }

    if (claudeTokenResult.body.registryStatus !== "ready") {
      fail(`expected Claude Code registryStatus=ready after SQL migration, received ${claudeTokenResult.body.registryStatus ?? "missing"}`);
    }

    if (!claudeTokenResult.body.token || !claudeTokenResult.body.connection?.id) {
      fail("Claude Code token issue response did not include a bearer token and connection id.");
    }

    const claudeToken = claudeTokenResult.body.token;
    const claudeConnectionId = claudeTokenResult.body.connection.id;
    const claudeListResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
    const activeClaudeConnection = (claudeListResult.body.tokens ?? []).find(
      (connection) => connection.id === claudeConnectionId && connection.status === "active" && connection.tool === "claude_code",
    );

    if (!activeClaudeConnection) {
      fail("issued Claude Code connection was not visible as active in the connection list.");
    }

    if (usedDisposableIdea || allowProgressWrite) {
      const claudeProgressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${claudeToken}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-003 claude build sync smoke verification",
              status: "done",
              summary: "Verified that a registered Claude Code connection can write progress before revocation.",
              files: ["scripts/smoke_build_sync_tokens.mjs"],
              verification: "Claude Code token registry status was ready and progress API accepted the active token.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!claudeProgressResult.ok || claudeProgressResult.body.registryStatus !== "ready") {
        fail(`Claude Code active token progress write failed: HTTP ${claudeProgressResult.status}`);
      }
    }

    const claudeRevokeResult = await callAppApi(page, `/api/build-sync/tokens/${encodeURIComponent(claudeConnectionId)}`, {
      method: "DELETE",
    });

    if (!claudeRevokeResult.ok || claudeRevokeResult.body.connection?.status !== "revoked") {
      fail(`Claude Code connection revoke failed: HTTP ${claudeRevokeResult.status}`);
    }

    const claudeRejectedProgressResult = await callAppApi(page, "/api/build-sync/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${claudeToken}`,
      },
      body: JSON.stringify({
        records: [
          {
            task: "T-004 revoked Claude Code token should fail",
            status: "done",
            summary: "This write must be rejected because the Claude Code connection was revoked.",
            verification: "Expected HTTP 401.",
            recordedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    if (claudeRejectedProgressResult.status !== 401) {
      fail(`revoked Claude Code token was not rejected. Expected HTTP 401, received ${claudeRejectedProgressResult.status}`);
    }

    const antigravityTokenResult = await issueBuildSyncToken(page, ideaId, "antigravity");

    if (!antigravityTokenResult.ok) {
      fail(
        `Google Antigravity token issue returned HTTP ${antigravityTokenResult.status}: ${
          antigravityTokenResult.body.error ?? "unknown error"
        }`,
      );
    }

    if (antigravityTokenResult.body.registryStatus !== "ready") {
      fail(
        `expected Google Antigravity registryStatus=ready after SQL migration, received ${
          antigravityTokenResult.body.registryStatus ?? "missing"
        }`,
      );
    }

    if (!antigravityTokenResult.body.token || !antigravityTokenResult.body.connection?.id) {
      fail("Google Antigravity token issue response did not include a bearer token and connection id.");
    }

    const antigravityToken = antigravityTokenResult.body.token;
    const antigravityConnectionId = antigravityTokenResult.body.connection.id;
    const antigravityListResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
    const activeAntigravityConnection = (antigravityListResult.body.tokens ?? []).find(
      (connection) => connection.id === antigravityConnectionId && connection.status === "active" && connection.tool === "antigravity",
    );

    if (!activeAntigravityConnection) {
      fail("issued Google Antigravity connection was not visible as active in the connection list.");
    }

    if (usedDisposableIdea || allowProgressWrite) {
      const antigravityProgressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${antigravityToken}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-004 antigravity build sync smoke verification",
              status: "done",
              summary: "Verified that a registered Google Antigravity connection can write progress before revocation.",
              files: ["scripts/smoke_build_sync_tokens.mjs"],
              verification: "Google Antigravity token registry status was ready and progress API accepted the active token.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!antigravityProgressResult.ok || antigravityProgressResult.body.registryStatus !== "ready") {
        fail(`Google Antigravity active token progress write failed: HTTP ${antigravityProgressResult.status}`);
      }
    }

    const antigravityRevokeResult = await callAppApi(page, `/api/build-sync/tokens/${encodeURIComponent(antigravityConnectionId)}`, {
      method: "DELETE",
    });

    if (!antigravityRevokeResult.ok || antigravityRevokeResult.body.connection?.status !== "revoked") {
      fail(`Google Antigravity connection revoke failed: HTTP ${antigravityRevokeResult.status}`);
    }

    const antigravityRejectedProgressResult = await callAppApi(page, "/api/build-sync/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${antigravityToken}`,
      },
      body: JSON.stringify({
        records: [
          {
            task: "T-005 revoked Google Antigravity token should fail",
            status: "done",
            summary: "This write must be rejected because the Google Antigravity connection was revoked.",
            verification: "Expected HTTP 401.",
            recordedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    if (antigravityRejectedProgressResult.status !== 401) {
      fail(
        `revoked Google Antigravity token was not rejected. Expected HTTP 401, received ${antigravityRejectedProgressResult.status}`,
      );
    }

    console.log("Build sync token smoke passed.");
    console.log("Registry status: ready");
    console.log("Issued connections: Cursor, Codex, Claude Code, and Google Antigravity active");
    console.log(
      spentDisposableBuildPass
        ? "Credit build pass: unlocked for disposable smoke idea"
        : "Credit build pass: not spent by this smoke run",
    );
    console.log(creditSummary ? `Credit preflight: ${formatCreditGateHint(creditSummary, ideaId)}` : "Credit preflight: unavailable");
    console.log(
      usedDisposableIdea || allowProgressWrite
        ? "Progress write: accepted before revoke"
        : "Progress write: skipped before revoke to avoid mutating an existing idea",
    );
    console.log(
      usedDisposableIdea || allowProgressWrite
        ? "Task board UI: synced task visible in STEP 8"
        : "Task board UI: skipped because progress write was skipped",
    );
    console.log(
      usedDisposableIdea && resolvedSupabaseConfig
        ? "Final execution UI: four named live connector checks visible in STEP 7"
        : "Final execution UI: skipped because disposable launch package was not available",
    );
    console.log(
      usedDisposableIdea && resolvedSupabaseConfig
        ? "Connector downloads: setup files verified for Cursor, Codex, Claude Code, and Google Antigravity"
        : "Connector downloads: skipped because disposable launch package was not available",
    );
    console.log(
      usedDisposableIdea && resolvedSupabaseConfig
        ? "Deferred generic MCP UI: hidden from supported tool selector"
        : "Package-only handoff UI: skipped because disposable launch package was not available",
    );
    console.log("Connection revoke: accepted");
    console.log("Invalid token TTL request: rejected");
    console.log("Unsupported build sync tool request: rejected");
    console.log("Tampered cross-idea token write: rejected");
    console.log("Expired token write: rejected");
    console.log("Revoked token write: rejected");
    console.log("Codex connection revoke: accepted");
    console.log("Codex revoked token write: rejected");
    console.log("Claude Code connection revoke: accepted");
    console.log("Claude Code revoked token write: rejected");
    console.log("Google Antigravity connection revoke: accepted");
    console.log("Google Antigravity revoked token write: rejected");
  } finally {
    if (ideaId && usedDisposableIdea && resolvedSupabaseConfig && !keepData) {
      const cleanupResult = await cleanupDisposableIdea(page, resolvedSupabaseConfig, ideaId).catch((error) => ({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }));

      if (!cleanupResult.ok) {
        console.log(`Cleanup warning: disposable smoke idea was not deleted (${cleanupResult.error}).`);
      } else {
        console.log("Cleanup: disposable smoke idea deleted.");
      }
    } else if (ideaId && usedDisposableIdea) {
      console.log(`Cleanup skipped by BUILD_SYNC_SMOKE_KEEP_DATA=1 for disposable idea ${ideaId}.`);
    }

    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
