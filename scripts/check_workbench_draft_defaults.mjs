import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-draft-defaults.ts")).href;
const {
  createDefaultEvidenceDraft,
  createDefaultExperimentDraft,
  createDefaultExperimentResultDraft,
  createDefaultImplementationTaskDraft,
  createDefaultRiskDraft,
  createDefaultRunDraft,
} = await import(moduleUrl);

assert.deepEqual(createDefaultRiskDraft(), {
  title: "",
  area: "",
  severity: "medium",
  mitigation: "",
});

assert.deepEqual(createDefaultExperimentDraft(), {
  name: "",
  success_metric: "",
});

assert.deepEqual(createDefaultRunDraft(), {
  phase: "strategy",
  owner_role: "strategy-reviewer",
  objective: "기회, 판단 기준, 제약 조건, 다음 실행 약속을 정의합니다.",
});

assert.deepEqual(createDefaultEvidenceDraft(), {
  title: "",
  source: "",
  evidence: "",
  implication: "",
  confidence: "medium",
});

assert.deepEqual(createDefaultExperimentResultDraft(), {
  experiment_id: "",
  result: "",
  learning: "",
  next_decision: "research_more",
  next_action: "",
});
assert.equal(createDefaultExperimentResultDraft("experiment-1").experiment_id, "experiment-1");

assert.deepEqual(createDefaultImplementationTaskDraft(), {
  title: "",
  task_type: "frontend",
  priority: "medium",
  owner_role: "prototype-builder",
  acceptance_criteria: "",
});

console.log("Workbench draft defaults smoke passed.");
