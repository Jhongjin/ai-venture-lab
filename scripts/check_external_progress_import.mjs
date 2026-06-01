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
  buildCursorProgressPreviewItems,
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

const previewItems = buildCursorProgressPreviewItems({ fallbackTasks, sourceText });
assert.deepEqual(
  previewItems.map((item) => ({ taskCode: item.taskCode, status: item.status })),
  [
    { taskCode: "T-001", status: "done" },
    { taskCode: "T-002", status: "todo" },
  ],
);
assert.match(previewItems[0].detail, /검증: pnpm smoke:browser passed|First slice completed/);

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
