"use client";

import type { ChangeEvent } from "react";
import { RefreshCw, Save } from "lucide-react";

import type { ImplementationTaskStatus } from "@/lib/supabase/types";

export type FinalExecutionProgressImportItem = {
  detail: string;
  status: ImplementationTaskStatus;
  taskCode: string;
  title: string;
};

type FinalExecutionProgressImportPanelProps = {
  activeToolLabel: string;
  canUseActions: boolean;
  isBusy: boolean;
  isLiveExternalDelivery: boolean;
  isTaskSyncRefreshing: boolean;
  liveExternalToolProgressPath: string;
  onChangeProgressImportText: (value: string) => void;
  onImportProgressResult: () => void;
  onLoadProgressImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onRefreshTaskSync: () => void;
  progressImportItems: ReadonlyArray<FinalExecutionProgressImportItem>;
  progressImportMessage: string | null;
  progressImportText: string;
  statusLabels: Record<ImplementationTaskStatus, string>;
  statusTone: Record<ImplementationTaskStatus, string>;
};

export function FinalExecutionProgressImportPanel({
  activeToolLabel,
  canUseActions,
  isBusy,
  isLiveExternalDelivery,
  isTaskSyncRefreshing,
  liveExternalToolProgressPath,
  onChangeProgressImportText,
  onImportProgressResult,
  onLoadProgressImportFile,
  onRefreshTaskSync,
  progressImportItems,
  progressImportMessage,
  progressImportText,
  statusLabels,
  statusTone,
}: FinalExecutionProgressImportPanelProps) {
  const importPlaceholder = `${activeToolLabel} 완료 보고${
    isLiveExternalDelivery ? ` 또는 ${liveExternalToolProgressPath}` : ""
  } 내용을 붙여넣으세요.\n예: 완료 작업: T-002 핵심 사용자 여정 와이어프레임\n다음 미완료 작업은 T-003 데이터 모델과 마이그레이션 입니다.`;

  return (
    <details className="mt-4 border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">
              {isLiveExternalDelivery ? "자동 반영이 안 될 때만 백업으로 가져오기" : `${activeToolLabel} 완료 보고 붙여넣기`}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {isLiveExternalDelivery
                ? `일반 흐름에서는 열지 않아도 됩니다. ${activeToolLabel} 자동 반영이 실패했을 때만 사용하세요.`
                : "자동 쓰기 연결 전까지는 완료 보고를 붙여넣어 작업 상태를 갱신합니다."}
            </p>
          </div>
          <span className="avl-pill avl-pill-neutral">{isLiveExternalDelivery ? "보조 경로" : "완료 보고"}</span>
        </div>
      </summary>
      <div className="mt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">
              {isLiveExternalDelivery ? `${activeToolLabel} 진행 결과 백업 가져오기` : `${activeToolLabel} 완료 보고 반영`}
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              {isLiveExternalDelivery
                ? "자동 반영이 실패했거나 예전 완료 보고를 반영해야 할 때만 사용합니다."
                : `${activeToolLabel}에서 받은 완료 보고를 붙여넣으면 작업별 상태를 읽어 Venture Lab에 반영합니다.`}{" "}
              {isLiveExternalDelivery ? (
                <>
                  <span className="font-mono">{liveExternalToolProgressPath}</span> 내용을 넣으면 작업별 상태를 읽어 Venture Lab에
                  반영합니다.
                </>
              ) : null}
            </p>
          </div>
          <label className="avl-btn avl-btn-secondary h-10 cursor-pointer px-3">
            진행 파일 불러오기
            <input type="file" accept=".json,.md,.txt" onChange={onLoadProgressImportFile} className="sr-only" />
          </label>
        </div>
        <textarea
          value={progressImportText}
          onChange={(event) => onChangeProgressImportText(event.target.value)}
          rows={7}
          className="mt-3 w-full border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950"
          placeholder={importPlaceholder}
        />
        {progressImportMessage ? (
          <div className="mt-3 border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-950" role="status">
            {progressImportMessage}
          </div>
        ) : null}
        {progressImportItems.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {progressImportItems.map((item) => (
              <div
                key={`${item.taskCode}-${item.title}`}
                className="flex flex-col gap-2 border border-slate-200 bg-white p-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">{item.taskCode}</span>
                    <span className="text-sm font-semibold text-slate-950">{item.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                </div>
                <span className={`${statusTone[item.status]} shrink-0`}>{statusLabels[item.status]}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            {isLiveExternalDelivery
              ? `${activeToolLabel} 연결 파일에는 자동 반영 설정이 포함됩니다. 이 가져오기는 자동 반영이 실패했을 때 쓰는 백업 경로입니다.`
              : "이 반영은 현재 로그인한 사용자 권한으로 저장됩니다. 외부 도구가 끝낸 작업만 붙여넣으세요."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefreshTaskSync}
              disabled={isBusy || isTaskSyncRefreshing || !canUseActions}
              className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              {isTaskSyncRefreshing || isBusy ? "확인 중" : "서버 상태 확인"}
            </button>
            <button
              type="button"
              onClick={onImportProgressResult}
              disabled={isBusy || !canUseActions || !progressImportText.trim()}
              className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
            >
              <Save size={16} />
              {isBusy
                ? isLiveExternalDelivery
                  ? "백업 반영 중"
                  : "완료 보고 반영 중"
                : isLiveExternalDelivery
                  ? "백업 반영 실행"
                  : "완료 보고 반영"}
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
