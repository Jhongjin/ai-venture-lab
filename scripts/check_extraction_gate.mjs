import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-gate.ts");
const sourceRedactionUrl = pathToFileURL(path.join(process.cwd(), "src/lib/source-redaction.ts")).href;
const textMatchUrl = pathToFileURL(path.join(process.cwd(), "src/lib/text-match-utils.ts")).href;
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/source-redaction";', `from ${JSON.stringify(sourceRedactionUrl)};`)
  .replace('from "@/lib/text-match-utils";', `from ${JSON.stringify(textMatchUrl)};`);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildCandidateReadiness, buildExtractionGate, hasNumericSignal } = await import(moduleUrl);

const baseCandidate = {
  signal: "돌봄 일정과 기록이 흩어져 보호자와 센터가 매주 조율 시간을 낭비함",
  target_user: "가족 보호자",
  buyer: "케어센터 운영자",
  successMetric: "보호자 5명 중 3명 이상이 조율 시간이 줄었다고 답함",
  risk_summary: "개인정보와 돌봄 책임 소재를 초기에 확인해야 함",
  firstPrototypeScope: "가족 초대, 돌봄 일정, 일일 기록, 이슈 알림",
  sourceBlock: "보호자 인터뷰 메모와 케어센터 운영 기록",
  validationScore: 82,
  riskLevel: "낮음",
};

assert.equal(hasNumericSignal("5명 중 3명 이상 전환"), true);
assert.equal(hasNumericSignal("정성 반응만 확인"), false);

const readyChecks = buildCandidateReadiness(baseCandidate, null);
assert.equal(readyChecks.every((check) => check.passed), true);
assert.equal(buildExtractionGate(baseCandidate, readyChecks, null).id, "proceed");

const duplicate = { idea: { name: "기존 돌봄 운영 콘솔" }, score: 84, reason: "이름이 거의 같습니다." };
const duplicateChecks = buildCandidateReadiness(baseCandidate, duplicate);
assert.equal(duplicateChecks.find((check) => check.label === "중복 위험")?.passed, false);
assert.equal(buildExtractionGate(baseCandidate, duplicateChecks, duplicate).id, "pivot");

const sensitiveCandidate = {
  ...baseCandidate,
  sourceBlock: "보호자 연락처 test@example.com 포함",
};
const sensitiveChecks = buildCandidateReadiness(sensitiveCandidate, null);
assert.equal(sensitiveChecks.find((check) => check.label === "민감정보")?.passed, false);
assert.equal(buildExtractionGate(sensitiveCandidate, sensitiveChecks, null).id, "research");

const weakCandidate = {
  ...baseCandidate,
  signal: "불편함",
  target_user: "사용자",
  buyer: "사용자",
  successMetric: "좋아졌다고 느낌",
  risk_summary: "짧음",
  firstPrototypeScope: "앱",
  validationScore: 40,
};
const weakChecks = buildCandidateReadiness(weakCandidate, null);
assert.equal(buildExtractionGate(weakCandidate, weakChecks, null).id, "kill");

console.log("Extraction gate smoke passed.");
