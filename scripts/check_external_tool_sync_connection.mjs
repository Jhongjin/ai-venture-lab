import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-sync-connection.ts")).href;
const {
  compareCursorSyncConnectionsByCreatedAt,
  getCursorSyncConnectionCreatedAtTime,
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
];

assert.deepEqual(sortCursorSyncConnectionsByCreatedAt(connections).map((item) => item.id), ["newer", "middle", "older"]);
assert.deepEqual(connections.map((item) => item.id), ["older", "newer", "middle"]);
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

const upsertedNew = upsertCursorSyncConnection(
  connections,
  connection({ createdAt: "2026-06-04T00:00:00.000Z", id: "newest", tool: "codex" }),
);
assert.deepEqual(upsertedNew.map((item) => item.id), ["newest", "newer", "middle", "older"]);

const upsertedExisting = upsertCursorSyncConnection(
  connections,
  connection({ createdAt: "2026-06-02T12:00:00.000Z", id: "older", status: "revoked" }),
);
assert.deepEqual(upsertedExisting.map((item) => item.id), ["newer", "older", "middle"]);
assert.equal(upsertedExisting.find((item) => item.id === "older")?.status, "revoked");

console.log("External tool sync connection smoke passed.");
