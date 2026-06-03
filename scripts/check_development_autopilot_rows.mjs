import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/development-autopilot-rows.ts")).href;
const {
  buildDevelopmentAutopilotArtifactTelemetryProperties,
  buildDevelopmentAutopilotRows,
  buildDevelopmentAutopilotRunbookTelemetryProperties,
  buildDevelopmentAutopilotTaskTelemetryProperties,
  getDevelopmentAutopilotNextPanel,
} = await import(moduleUrl);

const rows = buildDevelopmentAutopilotRows({
  artifactDrafts: [
    {
      artifactType: "tech_spec",
      body: "new tech spec",
      source: "development_process",
      title: "Tech Spec",
    },
    {
      artifactType: "tech_spec",
      body: "second tech spec",
      source: "app_blueprint",
      title: "Blueprint",
    },
    {
      artifactType: "dev_runbook",
      body: " ",
      source: "development_process",
      title: "Empty Runbook",
    },
    {
      artifactType: "design_brief",
      body: "duplicate",
      source: "development_process",
      title: "Existing Design",
    },
  ],
  existingArtifacts: [
    { artifact_type: "tech_spec", title: "Old Tech", version: 2 },
    { artifact_type: "design_brief", title: "Existing Design", version: 1 },
  ],
  existingRuns: [{ phase: "product" }],
  existingTasks: [{ title: "Existing Task" }],
  ideaId: "idea-1",
  implementationTaskDrafts: [
    {
      acceptance_criteria: "Ship the slice",
      owner_role: "builder",
      priority: "high",
      task_type: "frontend",
      title: "Existing Task",
    },
    {
      acceptance_criteria: "Verify the slice",
      owner_role: "qa",
      priority: "medium",
      task_type: "qa",
      title: "New QA Task",
    },
  ],
  organizationId: "org-1",
  runConfigs: [
    { objective: "Product objective", ownerRole: "product", phase: "product" },
    { objective: "Design objective", ownerRole: "design", phase: "design" },
  ],
  sourceArtifactId: "artifact-source-1",
});

assert.deepEqual(
  rows.missingRuns.map((run) => [run.phase, run.status, run.owner_role, run.objective]),
  [["design", "planned", "design", "Design objective"]],
);
assert.deepEqual(
  rows.artifactRows.map((artifact) => [artifact.artifact_type, artifact.title, artifact.version, artifact.status]),
  [
    ["tech_spec", "Tech Spec", 3, "draft"],
    ["tech_spec", "Blueprint", 4, "draft"],
  ],
);
assert.equal(rows.artifactRows[0].status_note, "제작 전달 묶음에서 자동 생성한 초안입니다.");
assert.deepEqual(
  rows.taskRows.map((task) => [
    task.title,
    task.task_type,
    task.priority,
    task.status,
    task.source_artifact_id,
    task.sort_order,
  ]),
  [["New QA Task", "qa", "medium", "todo", "artifact-source-1", 1]],
);

const emptyRows = buildDevelopmentAutopilotRows({
  artifactDrafts: [{ artifactType: "tech_spec", body: "", source: "development_process", title: "Empty" }],
  existingArtifacts: [],
  existingRuns: [{ phase: "product" }],
  existingTasks: [{ title: "Only Task" }],
  ideaId: "idea-1",
  implementationTaskDrafts: [
    {
      acceptance_criteria: "Already present",
      owner_role: "builder",
      priority: "low",
      task_type: "planning",
      title: "Only Task",
    },
  ],
  organizationId: null,
  runConfigs: [{ objective: "Product objective", ownerRole: "product", phase: "product" }],
  sourceArtifactId: null,
});
assert.equal(emptyRows.missingRuns.length, 0);
assert.equal(emptyRows.artifactRows.length, 0);
assert.equal(emptyRows.taskRows.length, 0);
assert.equal(getDevelopmentAutopilotNextPanel({ existingTaskCount: 0, insertedTaskCount: 0 }), "setup");
assert.equal(getDevelopmentAutopilotNextPanel({ existingTaskCount: 1, insertedTaskCount: 0 }), "tasks");
assert.equal(getDevelopmentAutopilotNextPanel({ existingTaskCount: 0, insertedTaskCount: 1 }), "tasks");

assert.deepEqual(buildDevelopmentAutopilotRunbookTelemetryProperties(2), {
  run_count: 2,
  missing_phase_count: 2,
});
assert.deepEqual(buildDevelopmentAutopilotArtifactTelemetryProperties(3), {
  artifact_count: 3,
  source: "ai_execution_package",
});
assert.deepEqual(
  buildDevelopmentAutopilotTaskTelemetryProperties({
    hasSourceArtifact: true,
    taskCount: 4,
  }),
  {
    task_count: 4,
    source_artifact: "yes",
  },
);
assert.deepEqual(
  buildDevelopmentAutopilotTaskTelemetryProperties({
    hasSourceArtifact: false,
    taskCount: 1,
  }),
  {
    task_count: 1,
    source_artifact: "no",
  },
);

console.log("Development autopilot rows smoke passed.");
