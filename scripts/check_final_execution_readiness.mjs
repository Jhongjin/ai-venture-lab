import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/final-execution-readiness.ts");
const telemetryFormatUrl = pathToFileURL(path.join(process.cwd(), "src/lib/telemetry-format.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/telemetry-format";',
  `from ${JSON.stringify(telemetryFormatUrl)};`,
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
  buildFinalExecutionConnectionHealth,
  buildFinalExecutionReadiness,
  buildFinalExecutionTaskPreview,
} = await import(moduleUrl);

const readiness = buildFinalExecutionReadiness({
  activeBuildDeliveryLabel: "Cursor",
  buildDeliveryMode: "external_tool",
  externalToolLabel: "Cursor",
  hasFinalExecutionPackage: true,
  hasFinalExecutionWorkOrder: true,
  hasIdeaContext: true,
  implementationTaskCount: 4,
  runCount: 3,
});
assert.equal(readiness.canEnterLaunch, true);
assert.equal(readiness.score, 100);

const connections = [
  {
    createdAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-06-02T00:00:00.000Z",
    id: "older-active",
    lastUsedAt: "2026-06-01T01:00:00.000Z",
    revokedAt: null,
    status: "active",
    tool: "cursor",
  },
  {
    createdAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-06-02T00:00:00.000Z",
    id: "newer-active",
    lastUsedAt: "2026-06-01T03:00:00.000Z",
    revokedAt: null,
    status: "active",
    tool: "cursor",
  },
  {
    createdAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-06-02T00:00:00.000Z",
    id: "codex-active",
    lastUsedAt: "2026-06-01T04:00:00.000Z",
    revokedAt: null,
    status: "active",
    tool: "codex",
  },
];
const health = buildFinalExecutionConnectionHealth({
  connections,
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
});
assert.deepEqual(
  health.visibleConnections.map((connection) => connection.id),
  ["older-active", "newer-active"],
);
assert.equal(health.activeConnections.length, 2);
assert.equal(health.latestUsedAt, "2026-06-01T03:00:00.000Z");
assert.match(health.title, /^최근 자동 반영 /);
assert.match(health.detail, /자동 반영됩니다/);

const emptyHealth = buildFinalExecutionConnectionHealth({
  connections: [],
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
});
assert.equal(emptyHealth.title, "연결 파일을 받으면 자동 반영이 준비됩니다");
assert.match(emptyHealth.detail, /Cursor 연결 파일/);

const implementationTasks = Array.from({ length: 7 }, (_, index) => ({ id: `task-${index + 1}` }));
const fallbackTasks = Array.from({ length: 7 }, (_, index) => ({ title: `fallback-${index + 1}` }));
const livePreview = buildFinalExecutionTaskPreview({
  buildDeliveryMode: "external_tool",
  externalToolLabel: "Cursor",
  fallbackTasks,
  implementationTasks,
  isLiveExternalDelivery: true,
});
assert.equal(livePreview.taskPreview.length, 6);
assert.equal(livePreview.fallbackTaskPreview.length, 0);
assert.equal(livePreview.visibleTaskCount, 6);
assert.match(livePreview.taskListDescription, /Cursor 연결 파일/);

const fallbackPreview = buildFinalExecutionTaskPreview({
  buildDeliveryMode: "venture_lab",
  externalToolLabel: "Cursor",
  fallbackTasks,
  implementationTasks: [],
  isLiveExternalDelivery: false,
});
assert.equal(fallbackPreview.taskPreview.length, 0);
assert.equal(fallbackPreview.fallbackTaskPreview.length, 6);
assert.equal(fallbackPreview.visibleTaskCount, 6);
assert.match(fallbackPreview.taskListDescription, /내부 개발 패키지/);

console.log("Final execution readiness smoke passed.");
