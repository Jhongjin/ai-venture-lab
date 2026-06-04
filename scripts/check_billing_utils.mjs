import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/billing.ts");
const recordUtilsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/record-utils.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/record-utils";',
  `from ${JSON.stringify(recordUtilsUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildBuildPassAlreadyUnlockedMessage,
  buildBuildPassUnlockState,
  buildBuildPassUnlockedTelemetryProperties,
  buildBuildPassUnlockFailedMessage,
  buildBuildPassUnlockLoginRequiredMessage,
  buildBuildPassUnlockRequestPayload,
  buildBuildPassUnlockRetryMessage,
  buildBuildPassUnlockSuccessMessage,
  buildCreditSummaryLoadFailedMessage,
  buildCreditSummaryLoadRetryMessage,
  buildCreditSummaryReadFailedMessage,
  buildCreditSummaryReadState,
  getBuildPassUnlockUrl,
  getBuildPassRequirementMessage,
  getBuildPassUnlockResult,
  getCreditSummaryUrl,
  getProductionCreditExecutionValuePathItems,
  getProductionCreditNextAction,
  getProductionCreditPackageClarityItems,
  getProductionCreditProInterestReasonItems,
  getProductionCreditProPathItems,
  getProductionCreditShortfallCopy,
  getProductionCreditSpendConfidenceItems,
  getProductionCreditSystemNotice,
} = await import(moduleUrl);

assert.equal(buildBuildPassUnlockLoginRequiredMessage(), "제작 패스를 열려면 먼저 로그인하세요.");
assert.equal(buildBuildPassAlreadyUnlockedMessage(), "이 아이디어는 이미 전체 제작 패키지가 열려 있습니다.");
assert.equal(buildBuildPassUnlockFailedMessage(), "제작 패스를 열지 못했습니다.");
assert.equal(buildBuildPassUnlockRetryMessage(), "제작 패스를 열지 못했습니다. 잠시 후 다시 시도하세요.");
assert.equal(
  buildBuildPassUnlockSuccessMessage(),
  "전체 제작 패키지가 열렸습니다. 이제 AI 제작 패키지를 만들고 저장할 수 있습니다.",
);
assert.deepEqual(buildBuildPassUnlockRequestPayload("idea-1"), { ideaId: "idea-1" });
assert.equal(getCreditSummaryUrl(), "/api/billing/credits");
assert.equal(getBuildPassUnlockUrl(), "/api/billing/build-pass");
assert.equal(buildCreditSummaryReadFailedMessage(), "크레딧 상태를 읽지 못했습니다.");
assert.equal(buildCreditSummaryLoadFailedMessage(), "크레딧 상태를 불러오지 못했습니다.");
assert.equal(buildCreditSummaryLoadRetryMessage(), "크레딧 상태를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");

const readyCreditSummary = {
  balance: 70,
  buildPassCost: 30,
  buildPasses: [],
  freeArtifactLimit: 4,
  fullArtifactCount: 10,
  ledgerEntries: [],
  message: "크레딧 상태를 확인했습니다.",
  monthlyGrant: 100,
  periodKey: "2026-06",
  plan: "free",
  status: "ready",
};
assert.deepEqual(buildCreditSummaryReadState({ payload: readyCreditSummary, responseOk: true }), {
  creditMessage: "크레딧 상태를 확인했습니다.",
  creditSummary: readyCreditSummary,
  ok: true,
});
assert.deepEqual(buildCreditSummaryReadState({ payload: { message: "필드가 부족합니다." }, responseOk: true }), {
  creditMessage: "필드가 부족합니다.",
  creditSummary: null,
  ok: false,
});
assert.deepEqual(buildCreditSummaryReadState({ payload: { error: "크레딧 API 오류" }, responseOk: false }), {
  creditMessage: "크레딧 API 오류",
  creditSummary: null,
  ok: false,
});
assert.deepEqual(
  buildBuildPassUnlockState({
    fallbackBuildPassCost: 30,
    payload: { ...readyCreditSummary, chargedCredits: 30 },
    responseOk: true,
  }),
  {
    alreadyUnlocked: false,
    chargedCredits: 30,
    creditMessage: "30크레딧을 사용해 전체 제작 패키지를 열었습니다.",
    creditSummary: { ...readyCreditSummary, chargedCredits: 30 },
    ok: true,
  },
);
assert.deepEqual(
  buildBuildPassUnlockState({
    fallbackBuildPassCost: 30,
    payload: { error: "제작 패스 차감 실패" },
    responseOk: false,
  }),
  {
    alreadyUnlocked: false,
    chargedCredits: null,
    creditMessage: "제작 패스 차감 실패",
    creditSummary: null,
    ok: false,
  },
);

assert.equal(
  getBuildPassRequirementMessage({ buildPassCost: 30, isChecking: true, mode: "delivery_bundle" }),
  "크레딧 상태를 확인한 뒤 제작 전달 묶음을 만들 수 있습니다.",
);
assert.equal(
  getBuildPassRequirementMessage({ buildPassCost: 30, isChecking: false, mode: "ai_package_start" }),
  "30크레딧 제작 패스를 열면 AI 제작 패키지와 외부 개발 도구 연결을 이어갈 수 있습니다.",
);

const baseProductionCreditNextActionInput = {
  creditStatus: null,
  hasEnoughCreditsForBuildPass: false,
  hasSelectedIdeaBuildPass: false,
  isCreditSummaryLoading: false,
  isCreditSystemMissing: false,
  isCreditSystemReady: false,
  needsSelectedIdeaBuildPass: false,
};
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    isCreditSummaryLoading: true,
  }),
  "크레딧 상태를 확인하는 중입니다.",
);
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    hasSelectedIdeaBuildPass: true,
  }),
  "제작 패스가 열렸습니다. 아래 AI 제작 패키지 만들기를 누르세요.",
);
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    hasEnoughCreditsForBuildPass: true,
    needsSelectedIdeaBuildPass: true,
  }),
  "먼저 제작 패스를 여세요. 그다음 AI 제작 패키지 만들기가 열립니다.",
);
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    needsSelectedIdeaBuildPass: true,
  }),
  "잔여 크레딧이 부족해 제작 패스를 열 수 없습니다.",
);
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    isCreditSystemMissing: true,
  }),
  "크레딧 DB 준비 전이라 아래 제작 흐름을 그대로 진행하세요.",
);
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    creditStatus: "unavailable",
  }),
  "크레딧 확인 실패 상태라 이번 세션은 아래 제작 흐름을 그대로 진행하세요.",
);
assert.equal(
  getProductionCreditNextAction({
    ...baseProductionCreditNextActionInput,
    isCreditSystemReady: true,
  }),
  "아이디어를 선택하면 제작 패스를 열 수 있습니다.",
);
assert.equal(getProductionCreditNextAction(baseProductionCreditNextActionInput), "아래 제작 흐름을 진행하세요.");

const productionCreditPanelSource = readFileSync(
  path.join(process.cwd(), "src/components/production-credit-panel.tsx"),
  "utf8",
);
assert.ok(
  !productionCreditPanelSource.includes("function getNextCreditAction"),
  "ProductionCreditPanel should use the shared billing next-action helper.",
);
assert.ok(
  !productionCreditPanelSource.includes("balanceAfterBuildPass"),
  "ProductionCreditPanel should use the shared billing spend-confidence helper.",
);
assert.ok(
  !productionCreditPanelSource.includes("freeMonthlyPassCapacity"),
  "ProductionCreditPanel should use the shared billing Pro path helper.",
);
assert.ok(
  !productionCreditPanelSource.includes("const proInterestReasonItems = ["),
  "ProductionCreditPanel should use the shared billing Pro interest reason helper.",
);
assert.ok(
  !productionCreditPanelSource.includes("buildPassShortfall"),
  "ProductionCreditPanel should use the shared billing shortfall copy helper.",
);
assert.ok(
  !productionCreditPanelSource.includes("formatKoreanNumber"),
  "ProductionCreditPanel should not format shortfall idle messages directly.",
);
assert.ok(
  !productionCreditPanelSource.includes("크레딧 DB 준비 전이라 지금 배포"),
  "ProductionCreditPanel should use the shared billing system notice helper.",
);
assert.ok(
  !productionCreditPanelSource.includes('creditStatus === "unavailable"'),
  "ProductionCreditPanel should not branch on unavailable credit status copy directly.",
);

assert.deepEqual(
  getProductionCreditPackageClarityItems({
    buildPassCost: 30,
    freeArtifactLimit: 4,
    fullArtifactCount: 10,
  }),
  [
    ["Free", "기본 4/10단계로 판단 자료 확보"],
    ["제작 패스", "30크레딧으로 전체 10단계 실행 패키지 저장"],
    ["최종 실행", "작업 순서와 외부 개발 도구 연결 파일로 이어짐"],
  ],
);
assert.deepEqual(
  getProductionCreditExecutionValuePathItems({
    freeArtifactLimit: 4,
    fullArtifactCount: 10,
  }),
  [
    ["1. 전체 자료 열기", "Free 4/10에서 전체 10단계로 확장"],
    ["2. AI 패키지 저장", "기획서, 화면 구조, 기술 방향을 한 번에 묶어 저장"],
    ["3. 최종 실행 연결", "Cursor, Codex, Claude Code, Antigravity 전달 파일 받기"],
  ],
);
assert.deepEqual(
  getProductionCreditProPathItems({
    buildPassCost: 30,
    hasEnoughCreditsForBuildPass: true,
    monthlyCreditGrant: 100,
    needsSelectedIdeaBuildPass: true,
  }),
  [
    ["Free 기준", "월 100크레딧으로 제작 패스 최대 3개"],
    ["Pro가 필요한 순간", "반복 제작 패키지, 외부 개발 도구 자동 반영, 출처 기반 시장 점검이 계속 필요할 때"],
    ["지금 행동", "충분하면 제작 패스를 열고 실행 패키지로 이동"],
  ],
);
assert.deepEqual(
  getProductionCreditProPathItems({
    buildPassCost: 30,
    hasEnoughCreditsForBuildPass: false,
    monthlyCreditGrant: 100,
    needsSelectedIdeaBuildPass: true,
  }),
  [
    ["Free 기준", "월 100크레딧으로 제작 패스 최대 3개"],
    ["Pro가 필요한 순간", "반복 제작 패키지, 외부 개발 도구 자동 반영, 출처 기반 시장 점검이 계속 필요할 때"],
    ["지금 행동", "부족하면 결제 없이 Pro 관심 기록으로 남김"],
  ],
);
assert.deepEqual(getProductionCreditProInterestReasonItems(), [
  ["반복 제작", "이번 달 제작 패스를 더 열어야 할 때"],
  ["외부 도구", "작업 상태 자동 반영을 계속 써야 할 때"],
  ["시장 근거", "출처 기반 시장 점검을 반복해야 할 때"],
]);
assert.deepEqual(
  getProductionCreditShortfallCopy({
    buildPassCost: 30,
    creditBalance: 12,
  }),
  {
    shortfallCredits: 18,
    shortfallMessage: "다음 제작 패스까지 18크레딧 부족합니다.",
    upgradeInterestIdleMessage: "18크레딧 부족한 상태를 Pro 관심 기록으로 남깁니다.",
  },
);
assert.deepEqual(
  getProductionCreditShortfallCopy({
    buildPassCost: 30,
    creditBalance: 70,
  }),
  {
    shortfallCredits: null,
    shortfallMessage: null,
    upgradeInterestIdleMessage: "부족한 크레딧 상태를 Pro 관심 기록으로 남깁니다.",
  },
);
assert.deepEqual(
  getProductionCreditShortfallCopy({
    buildPassCost: 30,
    creditBalance: null,
  }),
  {
    shortfallCredits: null,
    shortfallMessage: null,
    upgradeInterestIdleMessage: "부족한 크레딧 상태를 Pro 관심 기록으로 남깁니다.",
  },
);
assert.deepEqual(
  getProductionCreditSystemNotice({
    creditMessage: "크레딧 상태를 확인했습니다.",
    creditStatus: "ready",
    isCreditSystemMissing: false,
  }),
  {
    message: "크레딧 상태를 확인했습니다.",
    tone: "neutral",
  },
);
assert.deepEqual(
  getProductionCreditSystemNotice({
    creditMessage: "크레딧 상태를 확인했습니다.",
    creditStatus: "missing",
    isCreditSystemMissing: true,
  }),
  {
    message: "크레딧 DB 준비 전이라 지금 배포에서는 기존 제작 흐름을 그대로 유지합니다.",
    tone: "warning",
  },
);
assert.deepEqual(
  getProductionCreditSystemNotice({
    creditMessage: "크레딧 상태를 확인했습니다.",
    creditStatus: "unavailable",
    isCreditSystemMissing: false,
  }),
  {
    message: "크레딧 상태를 확인하지 못해 이번 세션에서는 제작 흐름을 막지 않습니다.",
    tone: "warning",
  },
);
assert.equal(
  getProductionCreditSystemNotice({
    creditMessage: null,
    creditStatus: "ready",
    isCreditSystemMissing: false,
  }),
  null,
);

assert.deepEqual(
  getProductionCreditSpendConfidenceItems({
    buildPassCost: 30,
    creditBalance: 70,
    hasSelectedIdeaBuildPass: false,
  }),
  [
    ["사용 범위", "현재 선택한 아이디어에만 제작 패스를 기록합니다."],
    ["쓴 뒤 잔여", "40크레딧 남음"],
    ["다시 이어가기", "저장 후 작업 순서와 최종 실행에서 같은 패키지를 계속 씁니다."],
  ],
);
assert.deepEqual(
  getProductionCreditSpendConfidenceItems({
    buildPassCost: 30,
    creditBalance: 70,
    hasSelectedIdeaBuildPass: true,
  }),
  [
    ["사용 범위", "이미 이 아이디어에 제작 패스가 열렸습니다."],
    ["쓴 뒤 잔여", "추가 차감 없음"],
    ["다시 이어가기", "저장 후 작업 순서와 최종 실행에서 같은 패키지를 계속 씁니다."],
  ],
);
assert.deepEqual(
  getProductionCreditSpendConfidenceItems({
    buildPassCost: 30,
    creditBalance: null,
    hasSelectedIdeaBuildPass: false,
  }),
  [
    ["사용 범위", "현재 선택한 아이디어에만 제작 패스를 기록합니다."],
    ["쓴 뒤 잔여", "잔여 크레딧 보충 필요"],
    ["다시 이어가기", "저장 후 작업 순서와 최종 실행에서 같은 패키지를 계속 씁니다."],
  ],
);

assert.deepEqual(
  getBuildPassUnlockResult(
    {
      balance: 70,
      buildPassCost: 30,
      buildPasses: [],
      freeArtifactLimit: 4,
      fullArtifactCount: 10,
      ledgerEntries: [],
      message: null,
      monthlyGrant: 100,
      periodKey: "2026-06",
      plan: "free",
      status: "ready",
      chargedCredits: 30,
    },
    30,
  ),
  {
    alreadyUnlocked: false,
    chargedCredits: 30,
    creditMessage: "30크레딧을 사용해 전체 제작 패키지를 열었습니다.",
  },
);
assert.deepEqual(
  buildBuildPassUnlockedTelemetryProperties({
    chargedCredits: 30,
    ideaId: "idea-1",
  }),
  {
    idea_id: "idea-1",
    charged_credits: 30,
  },
);

console.log("Billing utils smoke passed.");
