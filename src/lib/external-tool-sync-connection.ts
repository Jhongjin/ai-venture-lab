import type { ExternalBuildToolKey } from "@/lib/build-delivery";

export type ExternalToolSyncConnectionTool = Exclude<ExternalBuildToolKey, "generic_mcp">;
export type CursorSyncRegistryStatus = "ready" | "missing" | "unavailable";
export type CursorSyncConnectionStatus = "active" | "revoked" | "expired";

export type CursorSyncConnection = {
  id: string;
  tool: ExternalToolSyncConnectionTool;
  status: CursorSyncConnectionStatus;
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

const cursorSyncRegistryFallbackMessage = "개별 연결 끊기는 연결 기록 설정 후 열립니다.";

export const cursorSyncRegistrySetupNotice =
  "개별 연결 끊기는 연결 기록 설정 후 활성화됩니다. 설정 전에도 연결 파일은 기존 방식으로 동작합니다.";

export function getExternalToolSyncPreparingMessage(toolLabel: string) {
  return `${toolLabel} 자동 반영 연결을 준비하는 중입니다...`;
}

export function getExternalToolSyncSetupErrorMessage(toolLabel: string) {
  return `${toolLabel} 자동 반영 연결을 준비하지 못했습니다.`;
}

export function getExternalToolConnectionCreatedMessage(toolLabel: string) {
  return `새 ${toolLabel} 연결을 만들었습니다. 필요하면 이 화면에서 개별 연결을 끊을 수 있습니다.`;
}

export function getExternalToolConnectionFallbackMessage(toolLabel: string) {
  return `${toolLabel} 연결 파일을 만들었습니다. ${cursorSyncRegistryFallbackMessage}`;
}

export function getExternalToolConnectionStatusFallbackMessage(toolLabel: string) {
  return `${toolLabel} 연결 파일은 만들 수 있지만, ${cursorSyncRegistryFallbackMessage}`;
}

export function getCursorSyncConnectionCreatedAtTime(connection: Pick<CursorSyncConnection, "createdAt">) {
  return new Date(connection.createdAt).getTime();
}

export function compareCursorSyncConnectionsByCreatedAt(
  a: Pick<CursorSyncConnection, "createdAt">,
  b: Pick<CursorSyncConnection, "createdAt">,
) {
  return getCursorSyncConnectionCreatedAtTime(b) - getCursorSyncConnectionCreatedAtTime(a);
}

export function sortCursorSyncConnectionsByCreatedAt<T extends Pick<CursorSyncConnection, "createdAt">>(
  connections: T[],
) {
  return [...connections].sort(compareCursorSyncConnectionsByCreatedAt);
}

export function filterCursorSyncConnectionsByTool<T extends Pick<CursorSyncConnection, "tool">>(
  connections: T[],
  tool: ExternalBuildToolKey,
) {
  return connections.filter((connection) => connection.tool === tool);
}

export function upsertCursorSyncConnection(connections: CursorSyncConnection[], connection: CursorSyncConnection) {
  const withoutCurrent = connections.filter((item) => item.id !== connection.id);
  return sortCursorSyncConnectionsByCreatedAt([connection, ...withoutCurrent]);
}
