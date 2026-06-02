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
  buildCursorProgressEmptyInputMessage,
  buildCursorProgressEmptyInputInlineMessage,
  buildCursorProgressFileLoadedMessage,
  buildCursorProgressImportFailedMessage,
  buildCursorProgressImportDrafts,
  buildCursorProgressImportDisplayItems,
  buildCursorProgressImportedMessage,
  buildCursorProgressLoginRetryInlineMessage,
  buildCursorProgressLoginRequiredMessage,
  buildCursorProgressNoChangeMessage,
  buildCursorProgressParseFailedInlineMessage,
  buildCursorProgressParseFailedMessage,
  buildCursorProgressPersistencePlan,
  buildCursorProgressPreviewDisplayState,
  buildCursorProgressPreviewItems,
  buildCursorProgressReadingMessage,
  buildCursorProgressSavingMessage,
  buildCursorProgressSetupRequiredInlineMessage,
  buildCursorProgressSetupRequiredMessage,
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
assert.equal(
  buildCursorProgressFileLoadedMessage("progress.json"),
  "progress.json 내용을 가져왔습니다. 진행 결과 반영을 눌러 작업 목록에 저장하세요.",
);
assert.equal(buildCursorProgressReadingMessage("Cursor"), "Cursor 진행 결과를 읽는 중입니다...");
assert.equal(buildCursorProgressLoginRetryInlineMessage(), "로그인 후 다시 시도하세요.");
assert.equal(buildCursorProgressLoginRequiredMessage("Cursor"), "Cursor 진행 결과를 반영하려면 먼저 로그인하세요.");
assert.equal(buildCursorProgressEmptyInputInlineMessage(), "붙여넣은 내용이 없습니다.");
assert.equal(
  buildCursorProgressEmptyInputMessage({ toolLabel: "Cursor", toolProgressPath: ".cursor/venture-lab-progress.json" }),
  "Cursor 완료 보고나 .cursor/venture-lab-progress.json 내용을 붙여넣으세요.",
);
assert.equal(buildCursorProgressSetupRequiredInlineMessage(), "제작 패키지와 작업 순서 초안이 먼저 필요합니다.");
assert.equal(
  buildCursorProgressSetupRequiredMessage("Cursor"),
  "먼저 제작 패키지와 작업 순서 초안을 준비해야 Cursor 진행 결과를 반영할 수 있습니다.",
);
assert.equal(buildCursorProgressParseFailedInlineMessage(), "T-001 같은 작업 번호나 progress JSON 기록을 찾지 못했습니다.");
assert.equal(buildCursorProgressParseFailedMessage(), "Cursor 결과에서 T-001 같은 작업 번호나 progress JSON 기록을 찾지 못했습니다.");
assert.equal(buildCursorProgressNoChangeMessage(0), "반영할 새 작업이나 변경된 상태가 없습니다.");
assert.equal(
  buildCursorProgressNoChangeMessage(2),
  "반영할 수 있는 작업이 없습니다. 권한 때문에 2개 작업을 건너뛰었습니다.",
);
assert.equal(
  buildCursorProgressSavingMessage({ insertCount: 1, updateCount: 2 }),
  "작업을 저장하는 중입니다. 새 작업 1개, 상태 업데이트 2개를 준비했습니다.",
);
assert.equal(
  buildCursorProgressImportedMessage({
    completedCount: 3,
    insertedTaskCount: 1,
    toolLabel: "Cursor",
    updatedTaskCount: 2,
  }),
  "Cursor 진행 결과를 반영했습니다. 새 작업 1개, 상태 업데이트 2개, 완료 인식 3개입니다.",
);
assert.equal(buildCursorProgressImportFailedMessage("Cursor"), "Cursor 진행 결과를 반영하지 못했습니다.");

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
const previewDisplayState = buildCursorProgressPreviewDisplayState({
  fallbackTasks,
  importedItems: [],
  sourceText,
});
assert.deepEqual(
  previewDisplayState.cursorProgressPreviewItems.map((item) => item.taskCode),
  ["T-001", "T-002"],
);
assert.deepEqual(
  previewDisplayState.visibleCursorProgressImportItems.map((item) => item.taskCode),
  ["T-001", "T-002"],
);
const importedPreviewDisplayState = buildCursorProgressPreviewDisplayState({
  fallbackTasks,
  importedItems: [{ detail: "already imported", status: "done", taskCode: "T-999", title: "Imported" }],
  sourceText,
});
assert.deepEqual(
  importedPreviewDisplayState.visibleCursorProgressImportItems.map((item) => item.taskCode),
  ["T-999"],
);

console.log("External progress import smoke passed.");
