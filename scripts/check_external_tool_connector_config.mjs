import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function transpileToDataUrl(source, fileName) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName,
  });

  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const externalToolFilePathsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-file-paths.ts")).href;
const modulePath = path.join(process.cwd(), "src/lib/external-tool-connector-config.ts");
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/external-tool-file-paths";',
  `from ${JSON.stringify(externalToolFilePathsUrl)};`,
);
const moduleUrl = transpileToDataUrl(source, modulePath);
const {
  buildAntigravityMcpConfigJson,
  buildClaudeMcpConfigJson,
  buildCursorMcpConfigJson,
  buildCursorSyncConfigJson,
  buildExternalToolBuildSyncTokenRequestPayload,
  buildExternalToolConnectionCheckedMessage,
  buildExternalToolConnectionCheckFailedMessage,
  buildExternalToolConnectionCheckingMessage,
  buildExternalToolConnectionRevokeFailedMessage,
  buildExternalToolConnectionRevokeLoginRequiredMessage,
  buildExternalToolConnectionRevokedMessage,
  buildExternalToolConnectionRevokingMessage,
  buildExternalToolMcpConfigJson,
  buildExternalToolSyncConnectionRevokeUrl,
  buildExternalToolSyncConfigDraft,
  buildExternalToolSyncConnectionsUrl,
  getExternalToolBuildSyncTokenUrl,
  isExternalToolSyncConfigPayload,
} = await import(moduleUrl);

assert.match(buildCursorMcpConfigJson(), /\.cursor\/venture-lab-cli\.mjs/);
assert.match(buildClaudeMcpConfigJson(), /\.claude\/venture-lab-cli\.mjs/);
assert.match(buildAntigravityMcpConfigJson(), /\.antigravity\/venture-lab-cli\.mjs/);
assert.deepEqual(JSON.parse(buildExternalToolMcpConfigJson({ cliPath: ".tool/venture-lab-cli.mjs" })), {
  mcpServers: {
    "ai-venture-lab": {
      args: [".tool/venture-lab-cli.mjs", "mcp"],
      command: "node",
    },
  },
});
assert.deepEqual(
  JSON.parse(buildExternalToolMcpConfigJson({ cliPath: ".tool/venture-lab-cli.mjs", includeType: true })),
  {
    mcpServers: {
      "ai-venture-lab": {
        args: [".tool/venture-lab-cli.mjs", "mcp"],
        command: "node",
        type: "stdio",
      },
    },
  },
);
assert.equal(buildExternalToolConnectionCheckingMessage("Cursor"), "Cursor 연결 상태를 확인하는 중입니다...");
assert.equal(buildExternalToolConnectionCheckFailedMessage("Cursor"), "Cursor 연결 상태를 확인하지 못했습니다.");
assert.equal(buildExternalToolConnectionCheckedMessage("Cursor"), "Cursor 연결 상태를 확인했습니다.");
assert.equal(buildExternalToolConnectionRevokeLoginRequiredMessage("Cursor"), "Cursor 연결을 끊으려면 먼저 로그인하세요.");
assert.equal(buildExternalToolConnectionRevokingMessage("Cursor"), "Cursor 연결을 끊는 중입니다...");
assert.equal(buildExternalToolConnectionRevokeFailedMessage("Cursor"), "Cursor 연결을 끊지 못했습니다.");
assert.equal(
  buildExternalToolConnectionRevokedMessage("Cursor"),
  "Cursor 연결을 끊었습니다. 해당 연결 파일의 자동 반영은 더 이상 저장되지 않습니다.",
);
assert.deepEqual(
  buildExternalToolBuildSyncTokenRequestPayload({
    ideaId: "idea-1",
    tool: "codex",
  }),
  {
    ideaId: "idea-1",
    tool: "codex",
  },
);
assert.equal(getExternalToolBuildSyncTokenUrl(), "/api/build-sync/token");
assert.equal(buildExternalToolSyncConnectionsUrl("idea 1/2"), "/api/build-sync/tokens?ideaId=idea%201%2F2");
assert.equal(buildExternalToolSyncConnectionRevokeUrl("token 1/2"), "/api/build-sync/tokens/token%201%2F2");
assert.equal(
  isExternalToolSyncConfigPayload({
    endpoint: "https://example.test/api/build-sync/progress",
    expiresAt: "2026-06-02T00:00:00.000Z",
    token: "token.payload",
  }),
  true,
);
assert.equal(
  isExternalToolSyncConfigPayload({
    endpoint: "https://example.test/api/build-sync/progress",
    token: "token.payload",
  }),
  false,
);

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
