import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-connector-config.ts")).href;
const {
  buildAntigravityMcpConfigJson,
  buildClaudeMcpConfigJson,
  buildCursorMcpConfigJson,
  buildCursorSyncConfigJson,
  buildExternalToolSyncConfigDraft,
} = await import(moduleUrl);

assert.match(buildCursorMcpConfigJson(), /\.cursor\/venture-lab-cli\.mjs/);
assert.match(buildClaudeMcpConfigJson(), /\.claude\/venture-lab-cli\.mjs/);
assert.match(buildAntigravityMcpConfigJson(), /\.antigravity\/venture-lab-cli\.mjs/);

const syncConfig = JSON.parse(
  buildExternalToolSyncConfigDraft({
    createdAt: "2026-06-01T00:00:00.000Z",
    idea: { id: "idea-1", name: "Operator OS" },
    payload: {
      endpoint: "https://example.test/api/build-sync/progress",
      expiresAt: "2026-06-02T00:00:00.000Z",
      token: "token.payload",
    },
    projectKey: "operator-os",
    tool: "codex",
  }),
);

assert.deepEqual(syncConfig, {
  createdAt: "2026-06-01T00:00:00.000Z",
  endpoint: "https://example.test/api/build-sync/progress",
  expiresAt: "2026-06-02T00:00:00.000Z",
  ideaId: "idea-1",
  ideaName: "Operator OS",
  projectKey: "operator-os",
  token: "token.payload",
  tool: "codex",
});

assert.equal(
  buildCursorSyncConfigJson(syncConfig),
  `${JSON.stringify(syncConfig, null, 2)}\n`,
);

console.log("External tool connector config smoke passed.");
