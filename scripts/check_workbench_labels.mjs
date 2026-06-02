import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;
const {
  experimentStatusGuides,
  experimentStatusLabels,
  experimentStatusOptions,
  riskStatusLabels,
  riskStatusOptions,
} = await import(moduleUrl);

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

console.log("Workbench labels smoke passed.");
