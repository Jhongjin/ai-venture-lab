import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const implementationMetadataUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/implementation-task-metadata.ts"),
).href;
const modulePath = path.join(process.cwd(), "src/lib/step6-execution-bridge-state.ts");
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/implementation-task-metadata";',
  `from ${JSON.stringify(implementationMetadataUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildStep6ExecutionBridgeDisplayState } = await import(moduleUrl);

const externalEmptyState = buildStep6ExecutionBridgeDisplayState({
  buildDeliveryMode: "external_tool",
  externalToolLabel: "Cursor",
  implementationTasks: [],
  runs: [],
});
assert.equal(externalEmptyState.finalExecutionDetail, "Cursor 연결 파일과 START 파일");
assert.equal(externalEmptyState.firstTaskAcceptanceCriteria, null);
assert.equal(externalEmptyState.firstTaskTitle, null);
assert.equal(externalEmptyState.firstTaskTypeLabel, null);
assert.equal(externalEmptyState.hasGeneratedWorkOrder, false);

const taskState = buildStep6ExecutionBridgeDisplayState({
  buildDeliveryMode: "internal",
  externalToolLabel: "Codex",
  implementationTasks: [
    {
      acceptance_criteria: "첫 화면과 저장 버튼 확인",
      task_type: "frontend",
      title: "첫 화면 제작",
    },
  ],
  runs: [],
});
assert.equal(taskState.finalExecutionDetail, "내부 개발 시작 자료와 완료 기준");
assert.equal(taskState.firstTaskAcceptanceCriteria, "첫 화면과 저장 버튼 확인");
assert.equal(taskState.firstTaskTitle, "첫 화면 제작");
assert.equal(taskState.firstTaskTypeLabel, "프론트");
assert.equal(taskState.hasGeneratedWorkOrder, true);

const runOnlyState = buildStep6ExecutionBridgeDisplayState({
  buildDeliveryMode: "external_tool",
  externalToolLabel: "Claude Code",
  implementationTasks: [],
  runs: [{ id: "run-1" }],
});
assert.equal(runOnlyState.finalExecutionDetail, "Claude Code 연결 파일과 START 파일");
assert.equal(runOnlyState.firstTaskTitle, null);
assert.equal(runOnlyState.hasGeneratedWorkOrder, true);

console.log("Step 6 execution bridge state smoke passed.");
