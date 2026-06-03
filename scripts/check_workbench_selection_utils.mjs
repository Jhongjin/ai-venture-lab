import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/workbench-selection-utils.ts");
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/workbench-labels";',
  `from ${JSON.stringify(workbenchLabelsUrl)};`,
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
  compareWorkbenchArtifactsByCreatedAtDesc,
  compareWorkbenchImplementationTasksByCreatedAtAsc,
  compareWorkbenchImplementationTasksByOrder,
  compareWorkbenchRunsByPhaseOrder,
  compareWorkbenchTelemetryEventsByOccurredAtDesc,
  getWorkbenchArtifactCreatedAtTime,
  getWorkbenchImplementationTaskCreatedAtTime,
  getWorkbenchTelemetryEventOccurredAtTime,
  getOpenIdeaRisks,
  getSelectedArtifactRecords,
  getSelectedDecisions,
  getSelectedExperiments,
  getSelectedIdeaRisks,
  getSelectedImplementationTasks,
  getSelectedRisks,
  getSelectedRuns,
  getSelectedTelemetryEvents,
  getSelectedWorkbenchCollections,
} = await import(moduleUrl);

const ideaId = "idea-1";
const otherIdeaId = "idea-2";

const risks = [
  { id: "global-open", idea_id: null, status: "open" },
  { id: "selected-closed", idea_id: ideaId, status: "closed" },
  { id: "selected-mitigating", idea_id: ideaId, status: "mitigating" },
  { id: "other-open", idea_id: otherIdeaId, status: "open" },
];
assert.deepEqual(
  getSelectedRisks(risks, ideaId).map((risk) => risk.id),
  ["global-open", "selected-closed", "selected-mitigating"],
);
assert.deepEqual(
  getSelectedIdeaRisks(risks, ideaId).map((risk) => risk.id),
  ["selected-closed", "selected-mitigating"],
);
assert.deepEqual(
  getOpenIdeaRisks(getSelectedIdeaRisks(risks, ideaId)).map((risk) => risk.id),
  ["selected-mitigating"],
);

const decisions = Array.from({ length: 5 }, (_, index) => ({ id: `decision-${index + 1}`, idea_id: ideaId }));
assert.deepEqual(
  getSelectedDecisions([...decisions, { id: "other-decision", idea_id: otherIdeaId }], ideaId).map((entry) => entry.id),
  ["decision-1", "decision-2", "decision-3", "decision-4"],
);

const experiments = Array.from({ length: 6 }, (_, index) => ({ id: `experiment-${index + 1}`, idea_id: ideaId }));
assert.deepEqual(
  getSelectedExperiments(experiments, ideaId).map((entry) => entry.id),
  ["experiment-1", "experiment-2", "experiment-3", "experiment-4", "experiment-5"],
);

const runs = [
  { id: "build", idea_id: ideaId, phase: "build" },
  { id: "strategy", idea_id: ideaId, phase: "strategy" },
  { id: "product", idea_id: ideaId, phase: "product" },
  { id: "other", idea_id: otherIdeaId, phase: "strategy" },
];
assert.deepEqual(
  getSelectedRuns(runs, ideaId).map((run) => run.id),
  ["strategy", "product", "build"],
);
assert.equal(compareWorkbenchRunsByPhaseOrder(runs[1], runs[0]) < 0, true);

const artifacts = [
  { id: "older", idea_id: ideaId, created_at: "2026-06-01T00:00:00.000Z" },
  { id: "newer", idea_id: ideaId, created_at: "2026-06-01T02:00:00.000Z" },
  { id: "other", idea_id: otherIdeaId, created_at: "2026-06-01T03:00:00.000Z" },
];
assert.deepEqual(
  getSelectedArtifactRecords(artifacts, ideaId).map((artifact) => artifact.id),
  ["newer", "older"],
);
assert.equal(getWorkbenchArtifactCreatedAtTime(artifacts[1]), 1780279200000);
assert.equal(compareWorkbenchArtifactsByCreatedAtDesc(artifacts[1], artifacts[0]) < 0, true);

const tasks = [
  { id: "late-created", idea_id: ideaId, sort_order: 1, created_at: "2026-06-01T02:00:00.000Z", title: "B" },
  { id: "early-created", idea_id: ideaId, sort_order: 1, created_at: "2026-06-01T01:00:00.000Z", title: "C" },
  { id: "first-order", idea_id: ideaId, sort_order: 0, created_at: "2026-06-01T03:00:00.000Z", title: "A" },
  { id: "other", idea_id: otherIdeaId, sort_order: 0, created_at: "2026-06-01T00:00:00.000Z", title: "A" },
];
assert.deepEqual(
  getSelectedImplementationTasks(tasks, ideaId).map((task) => task.id),
  ["first-order", "early-created", "late-created"],
);
assert.equal(getWorkbenchImplementationTaskCreatedAtTime(tasks[1]), 1780275600000);
assert.equal(compareWorkbenchImplementationTasksByCreatedAtAsc(tasks[1], tasks[0]) < 0, true);
assert.equal(compareWorkbenchImplementationTasksByOrder(tasks[2], tasks[1]) < 0, true);
assert.equal(compareWorkbenchImplementationTasksByOrder(tasks[1], tasks[0]) < 0, true);

const events = [
  { id: "older", idea_id: ideaId, occurred_at: "2026-06-01T00:00:00.000Z" },
  { id: "newer", idea_id: ideaId, occurred_at: "2026-06-01T01:00:00.000Z" },
  { id: "other", idea_id: otherIdeaId, occurred_at: "2026-06-01T02:00:00.000Z" },
];
assert.deepEqual(
  getSelectedTelemetryEvents(events, ideaId).map((event) => event.id),
  ["newer", "older"],
);
assert.equal(getWorkbenchTelemetryEventOccurredAtTime(events[1]), 1780275600000);
assert.equal(compareWorkbenchTelemetryEventsByOccurredAtDesc(events[1], events[0]) < 0, true);

const selectedCollections = getSelectedWorkbenchCollections({
  artifacts,
  decisions: [...decisions, { id: "other-decision", idea_id: otherIdeaId }],
  experiments,
  implementationTasks: tasks,
  ideaId,
  risks,
  runs,
  telemetryEvents: events,
});

assert.deepEqual(
  Object.fromEntries(
    Object.entries({
      selectedRisks: selectedCollections.selectedRisks,
      selectedIdeaRisks: selectedCollections.selectedIdeaRisks,
      openSelectedIdeaRisks: selectedCollections.openSelectedIdeaRisks,
      selectedDecisions: selectedCollections.selectedDecisions,
      selectedExperiments: selectedCollections.selectedExperiments,
      selectedRuns: selectedCollections.selectedRuns,
      selectedArtifactRecords: selectedCollections.selectedArtifactRecords,
      selectedImplementationTasks: selectedCollections.selectedImplementationTasks,
      selectedTelemetryEvents: selectedCollections.selectedTelemetryEvents,
    }).map(([key, records]) => [key, records.map((record) => record.id)]),
  ),
  {
    selectedRisks: ["global-open", "selected-closed", "selected-mitigating"],
    selectedIdeaRisks: ["selected-closed", "selected-mitigating"],
    openSelectedIdeaRisks: ["selected-mitigating"],
    selectedDecisions: ["decision-1", "decision-2", "decision-3", "decision-4"],
    selectedExperiments: ["experiment-1", "experiment-2", "experiment-3", "experiment-4", "experiment-5"],
    selectedRuns: ["strategy", "product", "build"],
    selectedArtifactRecords: ["newer", "older"],
    selectedImplementationTasks: ["first-order", "early-created", "late-created"],
    selectedTelemetryEvents: ["newer", "older"],
  },
);

console.log("Workbench selection utils smoke passed.");
