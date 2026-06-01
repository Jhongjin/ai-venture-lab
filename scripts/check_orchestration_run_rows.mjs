import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/orchestration-run-rows.ts")).href;
const { buildManualOrchestrationRunRow, buildMissingOrchestrationRunRows, buildOrchestrationRunOutputMap } =
  await import(moduleUrl);

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

console.log("Orchestration run rows smoke passed.");
