import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/external-progress-import.ts");
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
  buildCursorProgressImportDrafts,
  buildCursorProgressImportDisplayItems,
  buildCursorProgressPersistencePlan,
  buildCursorProgressPreviewItems,
  buildCursorProgressTaskUpdatePatch,
  getVisibleCursorProgressImportItems,
} = await import(moduleUrl);

const fallbackTasks = [
  {
    acceptance_criteria: "Ship first slice",
    owner_role: "prototype-builder",
    priority: "high",
    task_type: "frontend",
    title: "First slice",
  },
  {
    acceptance_criteria: "Run smoke",
    owner_role: "qa-runner",
    priority: "medium",
    task_type: "qa",
    title: "Smoke check",
  },
];

const sourceText = JSON.stringify({
  progress: [
    {
      files: ["src/app/page.tsx"],
      status: "done",
      summary: "First slice completed",
      task: "T-001: First slice",
      verification: "pnpm smoke:browser passed",
    },
    {
      status: "todo",
      summary: "",
      task: "T-002: Smoke check",
    },
  ],
});

const importPlan = buildCursorProgressImportDrafts({ fallbackTasks, sourceText });
assert.equal(importPlan.parsedCount, 2);
assert.equal(importPlan.completedCount, 1);
assert.equal(importPlan.drafts[0].taskCode, "T-001");
assert.equal(importPlan.drafts[0].status, "done");
assert.match(importPlan.drafts[0].evidence, /pnpm smoke:browser passed/);

const displayItems = buildCursorProgressImportDisplayItems({
  drafts: importPlan.drafts,
  toolLabel: "Cursor",
});
assert.deepEqual(
  displayItems.map((item) => ({ taskCode: item.taskCode, status: item.status })),
  [
    { taskCode: "T-001", status: "done" },
    { taskCode: "T-002", status: "todo" },
  ],
);
assert.match(displayItems[0].detail, /검증: pnpm smoke:browser passed|First slice completed/);

const previewItems = buildCursorProgressPreviewItems({ fallbackTasks, sourceText });
assert.deepEqual(
  previewItems.map((item) => ({ taskCode: item.taskCode, status: item.status })),
  [
    { taskCode: "T-001", status: "done" },
    { taskCode: "T-002", status: "todo" },
  ],
);
assert.match(previewItems[0].detail, /검증: pnpm smoke:browser passed|First slice completed/);

const persistenceSourceText = JSON.stringify({
  progress: [
    {
      status: "done",
      summary: "First slice completed",
      task: "T-001: First slice",
      verification: "pnpm smoke:browser passed",
    },
    {
      status: "done",
      summary: "Smoke completed",
      task: "T-002: Smoke check",
    },
    {
      status: "blocked",
      summary: "Needs env access",
      task: "T-003: Env setup",
    },
  ],
});
const persistencePlan = buildCursorProgressImportDrafts({
  fallbackTasks,
  sourceText: persistenceSourceText,
});
const existingTasks = [
  {
    acceptance_criteria: "Ship first slice",
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: "user-1",
    evidence: "기존 메모",
    id: "task-1",
    idea_id: "idea-1",
    organization_id: "org-1",
    owner_role: "prototype-builder",
    priority: "high",
    sort_order: 0,
    source_artifact_id: null,
    status: "todo",
    task_type: "frontend",
    title: "First slice",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    acceptance_criteria: "Run smoke",
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: "user-2",
    evidence: "",
    id: "task-2",
    idea_id: "idea-1",
    organization_id: "org-1",
    owner_role: "qa-runner",
    priority: "medium",
    sort_order: 1,
    source_artifact_id: null,
    status: "todo",
    task_type: "qa",
    title: "Smoke check",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const persistenceRows = buildCursorProgressPersistencePlan({
  canManageTask: (task) => task.id !== "task-2",
  drafts: persistencePlan.drafts,
  existingSortedTasks: existingTasks,
  existingTasks,
  ideaId: "idea-1",
  organizationId: "org-1",
  sourceArtifactId: "artifact-1",
});
assert.equal(persistenceRows.updateRows.length, 1);
assert.equal(persistenceRows.updateRows[0].task.id, "task-1");
assert.equal(persistenceRows.updateRows[0].status, "done");
assert.match(persistenceRows.updateRows[0].evidence, /기존 메모[\s\S]+First slice completed/);
assert.deepEqual(buildCursorProgressTaskUpdatePatch(persistenceRows.updateRows[0]), {
  evidence: persistenceRows.updateRows[0].evidence,
  status: "done",
});
assert.equal(persistenceRows.skippedTaskCount, 1);
assert.equal(persistenceRows.rowsToInsert.length, 1);
assert.equal(persistenceRows.rowsToInsert[0].title, "Env setup");
assert.equal(persistenceRows.rowsToInsert[0].status, "blocked");
assert.equal(persistenceRows.rowsToInsert[0].sort_order, 2);

assert.deepEqual(buildCursorProgressPreviewItems({ fallbackTasks, sourceText: "   " }), []);
assert.deepEqual(
  getVisibleCursorProgressImportItems({
    importedItems: [{ detail: "already imported", status: "done", taskCode: "T-999", title: "Imported" }],
    previewItems,
  }).map((item) => item.taskCode),
  ["T-999"],
);
assert.deepEqual(
  getVisibleCursorProgressImportItems({
    importedItems: [],
    previewItems,
  }).map((item) => item.taskCode),
  ["T-001", "T-002"],
);

console.log("External progress import smoke passed.");
