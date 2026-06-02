import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;
const {
  decisionLabels,
  decisionOptions,
  evidenceConfidenceLabels,
  evidenceConfidenceSelectOptions,
  experimentStatusGuides,
  experimentStatusLabels,
  experimentStatusOptions,
  orchestrationStatusOptions,
  riskSeverityLabels,
  riskSeverityOptions,
  riskStatusLabels,
  riskStatusOptions,
  runStatusLabels,
} = await import(moduleUrl);

assert.deepEqual(decisionOptions, ["pending", "research_more", "ship", "pivot", "kill"]);
assert.deepEqual(
  decisionOptions.map((decision) => decisionLabels[decision]),
  ["아직 정하지 않음", "근거 더 확인", "진행", "방향 수정", "중단"],
);

assert.deepEqual(riskSeverityOptions, ["low", "medium", "high", "critical"]);
assert.deepEqual(
  riskSeverityOptions.map((severity) => riskSeverityLabels[severity]),
  ["낮음", "보통", "높음", "매우 높음"],
);

assert.deepEqual([...riskStatusOptions], ["open", "mitigating", "closed"]);
assert.deepEqual(
  riskStatusOptions.map((status) => riskStatusLabels[status]),
  ["열려 있음", "완화 중", "종료"],
);

assert.deepEqual([...experimentStatusOptions], ["planned", "running", "done"]);
assert.deepEqual(
  experimentStatusOptions.map((status) => experimentStatusLabels[status]),
  ["계획", "진행 중", "완료"],
);
assert.equal(experimentStatusGuides.running, "인터뷰, 랜딩, 직접 테스트처럼 실제 확인을 시작했을 때 바꿉니다.");

assert.deepEqual(orchestrationStatusOptions, ["planned", "running", "blocked", "done", "skipped"]);
assert.deepEqual(
  orchestrationStatusOptions.map((status) => runStatusLabels[status]),
  ["계획", "진행 중", "막힘", "완료", "건너뜀"],
);

assert.deepEqual(evidenceConfidenceSelectOptions, ["low", "medium", "high"]);
assert.deepEqual(
  evidenceConfidenceSelectOptions.map((confidence) => evidenceConfidenceLabels[confidence]),
  ["낮음", "보통", "높음"],
);

console.log("Workbench labels smoke passed.");
