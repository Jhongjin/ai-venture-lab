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
  buildBuildPassUnlockedTelemetryProperties,
  buildBuildPassUnlockFailedMessage,
  buildBuildPassUnlockLoginRequiredMessage,
  buildBuildPassUnlockRequestPayload,
  buildBuildPassUnlockRetryMessage,
  buildBuildPassUnlockSuccessMessage,
  buildCreditSummaryLoadFailedMessage,
  buildCreditSummaryLoadRetryMessage,
  buildCreditSummaryReadFailedMessage,
  getBuildPassRequirementMessage,
  getBuildPassUnlockResult,
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
assert.equal(buildCreditSummaryReadFailedMessage(), "크레딧 상태를 읽지 못했습니다.");
assert.equal(buildCreditSummaryLoadFailedMessage(), "크레딧 상태를 불러오지 못했습니다.");
assert.equal(buildCreditSummaryLoadRetryMessage(), "크레딧 상태를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");

assert.equal(
  getBuildPassRequirementMessage({ buildPassCost: 30, isChecking: true, mode: "delivery_bundle" }),
  "크레딧 상태를 확인한 뒤 제작 전달 묶음을 만들 수 있습니다.",
);
assert.equal(
  getBuildPassRequirementMessage({ buildPassCost: 30, isChecking: false, mode: "ai_package_start" }),
  "30크레딧 제작 패스를 열면 AI 제작 패키지와 외부 개발 도구 연결을 이어갈 수 있습니다.",
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
