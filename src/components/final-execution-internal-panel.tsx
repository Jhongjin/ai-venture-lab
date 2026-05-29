"use client";

import { Clipboard, Download } from "lucide-react";

type FinalExecutionInternalPanelProps = {
  finalAgentRunPackageDraft: string;
  onCopyPackage: () => void;
  onDownloadPackage: () => void;
};

export function FinalExecutionInternalPanel({
  finalAgentRunPackageDraft,
  onCopyPackage,
  onDownloadPackage,
}: FinalExecutionInternalPanelProps) {
  return (
    <section className="border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="avl-kicker">내부 제작 방식</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Venture Lab 내부 개발로 이어갑니다</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            내부 개발 도구가 연결되면 이 패키지를 기준으로 작업 보드와 구현 세션이 이어집니다. 현재는 같은 기준 자료를
            보관하고 받을 수 있습니다.
          </p>
        </div>
        <button type="button" disabled className="avl-btn avl-btn-secondary h-10 px-3 opacity-60">
          내부 개발 도구 준비 중
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopyPackage}
          disabled={!finalAgentRunPackageDraft}
          className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
        >
          <Clipboard size={16} />
          패키지 복사
        </button>
        <button
          type="button"
          onClick={onDownloadPackage}
          disabled={!finalAgentRunPackageDraft}
          className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
        >
          <Download size={16} />
          패키지 파일 받기
        </button>
      </div>
    </section>
  );
}
