"use client";

import type { ReactNode } from "react";
import { Clipboard, Download } from "lucide-react";

import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionPackagePanelProps = {
  activeExternalBuildTool: Pick<ExternalBuildToolProfile, "label" | "packageFiles" | "startFileName">;
  connectionManager: ReactNode;
  externalToolRunPackageDraft: string;
  finalAgentRunPackageDraft: string;
  isBusy: boolean;
  isLiveExternalDelivery: boolean;
  liveExternalToolStartPromptDraft: string;
  onCopyDraft: (body: string, label: string) => Promise<void> | void;
  onDownloadPrimaryPackage: () => Promise<void> | void;
  onDownloadProductionPackage: () => void;
  setupFileName: string;
};

export function FinalExecutionPackagePanel({
  activeExternalBuildTool,
  connectionManager,
  externalToolRunPackageDraft,
  finalAgentRunPackageDraft,
  isBusy,
  isLiveExternalDelivery,
  liveExternalToolStartPromptDraft,
  onCopyDraft,
  onDownloadPrimaryPackage,
  onDownloadProductionPackage,
  setupFileName,
}: FinalExecutionPackagePanelProps) {
  const copyBody = isLiveExternalDelivery ? liveExternalToolStartPromptDraft : externalToolRunPackageDraft;
  const copyLabel = isLiveExternalDelivery
    ? `${activeExternalBuildTool.label} 시작 지시문`
    : `${activeExternalBuildTool.label} 시작 패키지`;

  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-950">
        {isLiveExternalDelivery ? `${activeExternalBuildTool.label} 연결 파일` : `${activeExternalBuildTool.label} 시작 패키지`}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {isLiveExternalDelivery
          ? `프로젝트 루트에서 실행하면 ${activeExternalBuildTool.label}용 제작 문서, 작업 목록, 진행 기록 파일이 실제 파일로 생성됩니다.`
          : `${activeExternalBuildTool.startFileName} 기준의 시작 순서, 제품 기획서, 화면 구조, 디자인 기준, 기술 경계, 작업 순서, 완료 보고 형식을 묶었습니다.`}
      </p>
      {isLiveExternalDelivery ? (
        <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
          {activeExternalBuildTool.packageFiles.map((file) => (
            <div key={file} className="border border-slate-200 bg-slate-50 p-3">
              {file}
            </div>
          ))}
        </div>
      ) : null}
      {isLiveExternalDelivery ? (
        <div
          data-smoke="final-execution-primary-download-cue"
          className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
        >
          먼저 {activeExternalBuildTool.label} 연결 파일 받기만 누르세요.
          <span className="mt-1 block text-xs leading-5 text-blue-800">
            설치 확인 뒤에만 START 지시문 복사와 보관용 문서 받기를 씁니다.
          </span>
          <span className="mt-1 block text-xs leading-5 text-blue-800">
            받을 파일명: <span className="font-mono">{setupFileName}</span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-blue-800">
            실행 위치: 실제 앱 폴더 최상단
          </span>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onDownloadPrimaryPackage()}
          disabled={isBusy || !externalToolRunPackageDraft}
          className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
        >
          <Download size={16} />
          {isLiveExternalDelivery
            ? isBusy
              ? "연결 준비 중"
              : `${activeExternalBuildTool.label} 연결 파일 받기`
            : "시작 패키지 받기"}
        </button>
        <button
          type="button"
          onClick={() => onCopyDraft(copyBody, copyLabel)}
          disabled={!copyBody}
          className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
        >
          <Clipboard size={16} />
          {isLiveExternalDelivery ? "설치 확인 후 START 지시문 복사" : "지시문 복사"}
        </button>
        {isLiveExternalDelivery ? (
          <button
            type="button"
            onClick={onDownloadProductionPackage}
            disabled={!finalAgentRunPackageDraft}
            className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
          >
            <Download size={16} />
            보관용 문서 받기
          </button>
        ) : null}
      </div>
      {connectionManager}
    </div>
  );
}
