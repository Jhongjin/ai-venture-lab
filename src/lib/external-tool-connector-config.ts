import type { Idea } from "@/lib/venture-data";

export type CursorSyncConfig = {
  projectKey: string;
  ideaId: string;
  ideaName: string;
  tool: "cursor" | "codex" | "claude_code" | "antigravity";
  endpoint: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export type ExternalToolSyncConfigPayload = Pick<CursorSyncConfig, "endpoint" | "expiresAt" | "token">;

export type ExternalToolSyncConfigDraftInput = {
  createdAt?: string;
  idea: Pick<Idea, "id" | "name">;
  payload: ExternalToolSyncConfigPayload;
  projectKey: string;
  tool: CursorSyncConfig["tool"];
};

export function buildClaudeMcpConfigJson() {
  return `${JSON.stringify(
    {
      mcpServers: {
        "ai-venture-lab": {
          type: "stdio",
          command: "node",
          args: [".claude/venture-lab-cli.mjs", "mcp"],
        },
      },
    },
    null,
    2,
  )}
`;
}

export function buildAntigravityMcpConfigJson() {
  return `${JSON.stringify(
    {
      mcpServers: {
        "ai-venture-lab": {
          type: "stdio",
          command: "node",
          args: [".antigravity/venture-lab-cli.mjs", "mcp"],
        },
      },
    },
    null,
    2,
  )}
`;
}

export function buildCursorMcpConfigJson() {
  return `${JSON.stringify(
    {
      mcpServers: {
        "ai-venture-lab": {
          command: "node",
          args: [".cursor/venture-lab-cli.mjs", "mcp"],
        },
      },
    },
    null,
    2,
  )}
`;
}

export function buildCursorSyncConfigJson(config: CursorSyncConfig) {
  return `${JSON.stringify(config, null, 2)}
`;
}

export function buildExternalToolSyncConfigDraft({
  createdAt = new Date().toISOString(),
  idea,
  payload,
  projectKey,
  tool,
}: ExternalToolSyncConfigDraftInput) {
  return buildCursorSyncConfigJson({
    projectKey,
    ideaId: idea.id,
    ideaName: idea.name,
    tool,
    endpoint: payload.endpoint,
    token: payload.token,
    expiresAt: payload.expiresAt,
    createdAt,
  });
}
