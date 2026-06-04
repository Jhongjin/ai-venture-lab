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
  getProductionCreditNextAction,
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
