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
