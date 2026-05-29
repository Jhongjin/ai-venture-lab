"use client";

import { RefreshCw, Trash2 } from "lucide-react";

type FinalExecutionConnectionStatus = "active" | "revoked" | "expired";

export type FinalExecutionConnection = {
  id: string;
  tool: "cursor" | "codex" | "claude_code" | "antigravity";
  status: FinalExecutionConnectionStatus;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type FinalExecutionConnectionManagerProps = {
  activeConnectionCount: number;
  connectionHealthDetail: string;
  connectionHealthTitle: string;
  connectionMessage: string | null;
  connections: ReadonlyArray<FinalExecutionConnection>;
  formatTime: (value: string) => string;
  isConnectionLoading: boolean;
  onRefreshConnections: () => Promise<void> | void;
  onRevokeConnection: (connection: FinalExecutionConnection) => Promise<void> | void;
  registrySetupNotice: string;
  registryStatus: "ready" | "missing" | "unavailable" | null;
  revokingConnectionId: string | null;
  toolLabel: string;
  userCanManage: boolean;
};

const connectionStatusLabels: Record<FinalExecutionConnectionStatus, string> = {
  active: "연결됨",
  revoked: "끊김",
  expired: "만료됨",
};

const connectionStatusTone: Record<FinalExecutionConnectionStatus, string> = {
  active: "avl-pill avl-pill-success",
  revoked: "avl-pill avl-pill-warning",
  expired: "avl-pill avl-pill-neutral",
};

export function FinalExecutionConnectionManager({
  activeConnectionCount,
  connectionHealthDetail,
  connectionHealthTitle,
  connectionMessage,
  connections,
  formatTime,
  isConnectionLoading,
  onRefreshConnections,
  onRevokeConnection,
  registrySetupNotice,
  registryStatus,
  revokingConnectionId,
  toolLabel,
  userCanManage,
}: FinalExecutionConnectionManagerProps) {
  return (
    <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-950">{toolLabel} 연결 관리</div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            연결 파일을 다시 받으면 새 연결이 추가됩니다. 더 쓰지 않는 연결은 여기서 끊습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onRefreshConnections()}
          disabled={isConnectionLoading || !userCanManage}
          className="avl-btn avl-btn-secondary h-9 px-3 text-xs disabled:opacity-50"
        >
          <RefreshCw size={14} />
          {isConnectionLoading ? "확인 중" : "연결 확인"}
        </button>
      </div>
      {connectionMessage ? (
        <div className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-950">
          {connectionMessage}
        </div>
      ) : null}
      {registryStatus === "missing" || registryStatus === "unavailable" ? (
        <div className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
          {registrySetupNotice}
        </div>
      ) : null}
      {registryStatus === "ready" ? (
        <div data-smoke="final-execution-connection-health" className="mt-3 grid gap-px bg-slate-200 sm:grid-cols-2">
          <div className="bg-white px-3 py-3">
            <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">자동 반영 상태</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{connectionHealthTitle}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{connectionHealthDetail}</p>
          </div>
          <div className="bg-white px-3 py-3">
            <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">안 보이면</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">확인 명령을 먼저 실행하세요</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              자동 반영이 실패할 때만 STEP 8의 진행 JSON 붙여넣기를 백업으로 사용합니다.
            </p>
          </div>
        </div>
      ) : null}
      {registryStatus === "ready" ? (
        <div className="mt-3 grid gap-2">
          {connections.length > 0 ? (
            connections.slice(0, 4).map((connection) => (
              <div
                key={connection.id}
                className="flex flex-col gap-2 border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={connectionStatusTone[connection.status]}>{connectionStatusLabels[connection.status]}</span>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {connection.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    발급 {formatTime(connection.createdAt)} · 만료 {formatTime(connection.expiresAt)}
                    {connection.lastUsedAt ? ` · 최근 반영 ${formatTime(connection.lastUsedAt)}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onRevokeConnection(connection)}
                  disabled={connection.status !== "active" || revokingConnectionId === connection.id || !userCanManage}
                  className="avl-btn avl-btn-secondary h-9 px-3 text-xs disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {revokingConnectionId === connection.id ? "끊는 중" : "연결 끊기"}
                </button>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-slate-300 bg-white px-3 py-2 text-xs leading-5 text-slate-600">
              아직 저장된 {toolLabel} 연결이 없습니다. <span className="font-semibold">{toolLabel} 연결 파일 받기</span>를 누르면
              이곳에 연결이 표시됩니다.
            </div>
          )}
          {activeConnectionCount > 0 ? (
            <p className="text-xs leading-5 text-slate-500">현재 자동 반영 가능한 연결 {activeConnectionCount}개</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
