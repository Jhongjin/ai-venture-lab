import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/orchestration-run-rows.ts")).href;
const {
  buildManualOrchestrationRunCreatedMessage,
  buildManualOrchestrationRunLoginRequiredMessage,
  buildManualOrchestrationRunRow,
  buildMissingOrchestrationRunRows,
  buildOrchestrationRunbookAlreadyExistsMessage,
  buildOrchestrationRunbookTelemetryProperties,
  buildOrchestrationRunCreatedTelemetryProperties,
  buildOrchestrationRunDeletedTelemetryProperties,
  buildOrchestrationRunDeletedMessage,
  buildOrchestrationRunDeleteConfirmMessage,
  buildOrchestrationRunDeletePermissionDeniedMessage,
  buildOrchestrationRunOutputMap,
  buildOrchestrationRunOutputPatch,
  buildOrchestrationRunOutputSavePermissionDeniedMessage,
  buildOrchestrationRunOutputSavedMessage,
  buildOrchestrationRunOutputTelemetryProperties,
  buildOrchestrationRunStatusPatch,
  buildOrchestrationRunStatusChangedMessage,
  buildOrchestrationRunStatusTelemetryProperties,
  buildOrchestrationRunUpdatePermissionDeniedMessage,
  buildOrchestrationRunbookCreatedMessage,
  buildOrchestrationRunbookLoginRequiredMessage,
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
assert.deepEqual(
  buildOrchestrationRunCreatedTelemetryProperties({
    owner_role: "",
    phase: "product",
    status: "planned",
  }),
  {
    phase: "product",
    status: "planned",
    owner_role: "미정",
  },
);
assert.deepEqual(buildOrchestrationRunbookTelemetryProperties({ missingPhaseCount: 2, runCount: 1 }), {
  run_count: 1,
  missing_phase_count: 2,
});
assert.deepEqual(
  buildOrchestrationRunStatusTelemetryProperties({
    previousStatus: "planned",
    run: {
      phase: "build",
      status: "running",
    },
  }),
  {
    phase: "build",
    status: "running",
    previous_status: "planned",
  },
);
assert.deepEqual(
  buildOrchestrationRunDeletedTelemetryProperties({
    phase: "qa",
    status: "blocked",
  }),
  {
    phase: "qa",
    previous_status: "blocked",
  },
);
assert.deepEqual(
  buildOrchestrationRunOutputTelemetryProperties({
    output: "handoff ready",
    phase: "launch",
  }),
  {
    phase: "launch",
    output_length: 13,
  },
);
assert.equal(buildManualOrchestrationRunCreatedMessage(), "실행 단계를 추가했습니다.");
assert.equal(buildManualOrchestrationRunLoginRequiredMessage(), "실행 단계를 추가하려면 먼저 로그인하세요.");
assert.equal(buildOrchestrationRunbookCreatedMessage(), "전체 실행 순서 묶음을 만들었습니다.");
assert.equal(buildOrchestrationRunbookLoginRequiredMessage(), "실행 순서 묶음을 만들려면 먼저 로그인하세요.");
assert.equal(buildOrchestrationRunbookAlreadyExistsMessage(), "이 아이디어에는 이미 전체 실행 순서 묶음이 있습니다.");
assert.equal(
  buildOrchestrationRunStatusChangedMessage({ phaseLabel: "제작", statusLabel: "진행 중" }),
  "제작 상태를 진행 중(으)로 변경했습니다.",
);
assert.equal(buildOrchestrationRunDeletedMessage(), "실행 단계를 삭제했습니다.");
assert.equal(
  buildOrchestrationRunUpdatePermissionDeniedMessage(),
  "단계 작성자 또는 워크스페이스 관리자만 이 실행 단계를 수정할 수 있습니다.",
);
assert.equal(
  buildOrchestrationRunDeletePermissionDeniedMessage(),
  "단계 작성자 또는 워크스페이스 관리자만 이 실행 단계를 삭제할 수 있습니다.",
);
assert.equal(
  buildOrchestrationRunDeleteConfirmMessage("제작"),
  "제작 실행 단계를 삭제할까요? 저장된 단계 결과도 함께 사라집니다.",
);
assert.equal(buildOrchestrationRunOutputSavedMessage({ phaseLabel: "제작" }), "제작 결과를 저장했습니다.");
assert.equal(
  buildOrchestrationRunOutputSavePermissionDeniedMessage(),
  "단계 작성자 또는 협업 공간 관리자만 이 결과를 저장할 수 있습니다.",
);

console.log("Orchestration run rows smoke passed.");
