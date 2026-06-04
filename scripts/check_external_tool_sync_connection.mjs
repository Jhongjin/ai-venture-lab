import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-sync-connection.ts")).href;
const {
  buildExternalToolConnectionCreatedState,
  compareCursorSyncConnectionsByCreatedAt,
  filterCursorSyncConnectionsByTool,
  getCursorSyncConnectionCreatedAtTime,
  getExternalToolConnectionCreatedMessage,
  getExternalToolConnectionFallbackMessage,
  resolveExternalToolConnectionCreatedMessage,
  sortCursorSyncConnectionsByCreatedAt,
  upsertCursorSyncConnection,
} = await import(moduleUrl);

function connection({ createdAt, id, status = "active", tool = "cursor" }) {
  return {
    createdAt,
    expiresAt: "2026-06-04T00:00:00.000Z",
    id,
    lastUsedAt: null,
    revokedAt: null,
    status,
    tool,
  };
}

const connections = [
  connection({ createdAt: "2026-06-01T00:00:00.000Z", id: "older" }),
  connection({ createdAt: "2026-06-03T00:00:00.000Z", id: "newer" }),
  connection({ createdAt: "2026-06-02T00:00:00.000Z", id: "middle" }),
  connection({ createdAt: "2026-06-04T00:00:00.000Z", id: "codex", tool: "codex" }),
];

assert.deepEqual(sortCursorSyncConnectionsByCreatedAt(connections).map((item) => item.id), ["codex", "newer", "middle", "older"]);
assert.deepEqual(connections.map((item) => item.id), ["older", "newer", "middle", "codex"]);
assert.deepEqual(filterCursorSyncConnectionsByTool(connections, "cursor").map((item) => item.id), [
  "older",
  "newer",
  "middle",
]);
assert.deepEqual(filterCursorSyncConnectionsByTool(connections, "codex").map((item) => item.id), ["codex"]);
assert.deepEqual(filterCursorSyncConnectionsByTool(connections, "generic_mcp").map((item) => item.id), []);
assert.equal(
  getCursorSyncConnectionCreatedAtTime({ createdAt: "2026-06-03T00:00:00.000Z" }),
  Date.parse("2026-06-03T00:00:00.000Z"),
);
assert.equal(compareCursorSyncConnectionsByCreatedAt(connections[0], connections[1]) > 0, true);
assert.equal(compareCursorSyncConnectionsByCreatedAt(connections[1], connections[0]) < 0, true);
assert.equal(
  compareCursorSyncConnectionsByCreatedAt(
    { createdAt: "2026-06-02T00:00:00.000Z" },
    { createdAt: "2026-06-02T00:00:00.000Z" },
  ),
  0,
);
assert.equal(
  resolveExternalToolConnectionCreatedMessage({
    message: "서버 메시지",
    registryStatus: "missing",
    toolLabel: "Cursor",
  }),
  "서버 메시지",
);
assert.equal(
  resolveExternalToolConnectionCreatedMessage({
    registryStatus: "ready",
    toolLabel: "Cursor",
  }),
  getExternalToolConnectionCreatedMessage("Cursor"),
);
assert.equal(
  resolveExternalToolConnectionCreatedMessage({
    registryStatus: "missing",
    toolLabel: "Cursor",
  }),
  getExternalToolConnectionFallbackMessage("Cursor"),
);
const createdConnectionState = buildExternalToolConnectionCreatedState({
  payload: {
    connection: connections[1],
    registryStatus: "ready",
  },
  toolLabel: "Cursor",
});
assert.deepEqual(createdConnectionState, {
  connection: connections[1],
  message: getExternalToolConnectionCreatedMessage("Cursor"),
  registryStatus: "ready",
});
assert.deepEqual(
  buildExternalToolConnectionCreatedState({
    payload: {
      message: "서버가 만든 연결 메시지",
      registryStatus: "missing",
    },
    toolLabel: "Codex",
  }),
  {
    connection: null,
    message: "서버가 만든 연결 메시지",
    registryStatus: "missing",
  },
);

const upsertedNew = upsertCursorSyncConnection(
  connections,
  connection({ createdAt: "2026-06-04T00:00:00.000Z", id: "newest", tool: "codex" }),
);
assert.deepEqual(upsertedNew.map((item) => item.id), ["newest", "codex", "newer", "middle", "older"]);

const upsertedExisting = upsertCursorSyncConnection(
  connections,
  connection({ createdAt: "2026-06-02T12:00:00.000Z", id: "older", status: "revoked" }),
);
assert.deepEqual(upsertedExisting.map((item) => item.id), ["codex", "newer", "older", "middle"]);
assert.equal(upsertedExisting.find((item) => item.id === "older")?.status, "revoked");

console.log("External tool sync connection smoke passed.");
