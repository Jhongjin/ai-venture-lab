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

export function buildExternalToolConnectionCheckingMessage(toolLabel: string) {
  return `${toolLabel} 연결 상태를 확인하는 중입니다...`;
}

export function buildExternalToolConnectionCheckFailedMessage(toolLabel: string) {
  return `${toolLabel} 연결 상태를 확인하지 못했습니다.`;
}

export function buildExternalToolConnectionCheckedMessage(toolLabel: string) {
  return `${toolLabel} 연결 상태를 확인했습니다.`;
}

export function buildExternalToolConnectionRevokeLoginRequiredMessage(toolLabel: string) {
  return `${toolLabel} 연결을 끊으려면 먼저 로그인하세요.`;
}

export function buildExternalToolConnectionRevokingMessage(toolLabel: string) {
  return `${toolLabel} 연결을 끊는 중입니다...`;
}

export function buildExternalToolConnectionRevokeFailedMessage(toolLabel: string) {
  return `${toolLabel} 연결을 끊지 못했습니다.`;
}

export function buildExternalToolConnectionRevokedMessage(toolLabel: string) {
  return `${toolLabel} 연결을 끊었습니다. 해당 연결 파일의 자동 반영은 더 이상 저장되지 않습니다.`;
}

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
