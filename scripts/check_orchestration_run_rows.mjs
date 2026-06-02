import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/orchestration-run-rows.ts")).href;
const {
  buildManualOrchestrationRunCreatedMessage,
  buildManualOrchestrationRunRow,
  buildMissingOrchestrationRunRows,
  buildOrchestrationRunDeletedMessage,
  buildOrchestrationRunOutputMap,
  buildOrchestrationRunOutputPatch,
  buildOrchestrationRunOutputSavedMessage,
  buildOrchestrationRunStatusPatch,
  buildOrchestrationRunStatusChangedMessage,
  buildOrchestrationRunbookCreatedMessage,
} = await import(moduleUrl);

const manualRow = buildManualOrchestrationRunRow({
  ideaId: "idea-1",
  organizationId: "org-1",
  runDraft: {
    objective: "  첫 검증 계획 정리  ",
    owner_role: " product-lead ",
    phase: "product",
  },
});

assert.deepEqual(manualRow, {
  idea_id: "idea-1",
  objective: "첫 검증 계획 정리",
  organization_id: "org-1",
  owner_role: "product-lead",
  phase: "product",
  status: "planned",
});

const missingRows = buildMissingOrchestrationRunRows({
  existingRuns: [{ phase: "strategy" }, { phase: "qa" }],
  ideaId: "idea-2",
  organizationId: null,
  runConfigs: [
    { objective: "전략 판단", ownerRole: "strategy-reviewer", phase: "strategy" },
    { objective: "시장 검증", ownerRole: "researcher", phase: "research" },
    { objective: "품질 점검", ownerRole: "qa", phase: "qa" },
    { objective: "출시 준비", ownerRole: "launch", phase: "launch" },
  ],
});

assert.deepEqual(
  missingRows.map((row) => [row.phase, row.owner_role, row.objective, row.status, row.organization_id]),
  [
    ["research", "researcher", "시장 검증", "planned", null],
    ["launch", "launch", "출시 준비", "planned", null],
  ],
);

assert.deepEqual(
  buildMissingOrchestrationRunRows({
    existingRuns: [{ phase: "strategy" }, { phase: "research" }],
    ideaId: "idea-3",
    organizationId: "org-3",
    runConfigs: [
      { objective: "전략 판단", ownerRole: "strategy-reviewer", phase: "strategy" },
      { objective: "시장 검증", ownerRole: "researcher", phase: "research" },
    ],
  }),
  [],
);

assert.deepEqual(
  buildOrchestrationRunOutputMap([
    { id: "run-1", output: "strategy memo" },
    { id: "run-2", output: "" },
  ]),
  {
    "run-1": "strategy memo",
    "run-2": "",
  },
);

assert.deepEqual(buildOrchestrationRunStatusPatch("running"), { status: "running" });
assert.deepEqual(buildOrchestrationRunOutputPatch("handoff ready"), { output: "handoff ready" });
assert.deepEqual(buildOrchestrationRunOutputPatch(undefined), { output: "" });
assert.equal(buildManualOrchestrationRunCreatedMessage(), "실행 단계를 추가했습니다.");
assert.equal(buildOrchestrationRunbookCreatedMessage(), "전체 실행 순서 묶음을 만들었습니다.");
assert.equal(
  buildOrchestrationRunStatusChangedMessage({ phaseLabel: "제작", statusLabel: "진행 중" }),
  "제작 상태를 진행 중(으)로 변경했습니다.",
);
assert.equal(buildOrchestrationRunDeletedMessage(), "실행 단계를 삭제했습니다.");
assert.equal(buildOrchestrationRunOutputSavedMessage({ phaseLabel: "제작" }), "제작 결과를 저장했습니다.");

console.log("Orchestration run rows smoke passed.");
