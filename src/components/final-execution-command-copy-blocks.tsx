"use client";

import { Clipboard, ClipboardList, Code2 } from "lucide-react";

type FinalExecutionCommandCopyBlocksProps = {
  activeToolLabel: string;
  copyDraft: (body: string, label: string) => Promise<void> | void;
  guideDraft: string;
  mcpConfigDraft: string;
  nextTaskCommand: string;
  setupCommand: string;
  toolFolder: string;
};

export function FinalExecutionCommandCopyBlocks({
  activeToolLabel,
  copyDraft,
  guideDraft,
  mcpConfigDraft,
  nextTaskCommand,
  setupCommand,
  toolFolder,
}: FinalExecutionCommandCopyBlocksProps) {
  return (
    <>
      <div
        data-smoke="final-execution-command-sequence"
        className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
      >
        같은 프로젝트 루트 터미널에서 1. 설치 명령, 2. 확인 명령 순서로 실행합니다.
        <span className="mt-1 block text-xs leading-5 text-blue-800">
          현재 터미널이 다운로드 폴더나 AI Venture Lab 폴더라면 먼저 파일을 옮기고, 실제 프로젝트 루트로 이동한 뒤
          실행하세요.
        </span>
        <span className="mt-1 block text-xs leading-5 text-blue-800">
          복사 버튼은 명령을 클립보드에 넣는 역할만 합니다. 붙여넣기는 연결 파일을 옮긴 그 프로젝트 루트 터미널에서
          합니다.
        </span>
      </div>
      <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-semibold text-slate-950">먼저 실행할 설치 명령</div>
          <button
            type="button"
            onClick={() => copyDraft(setupCommand, "설치 명령")}
            className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs"
          >
            <Clipboard size={14} />
            설치 명령 복사
          </button>
        </div>
        <div className="mt-2 rounded-none bg-slate-950 px-3 py-2 font-mono text-xs text-white break-all">
          {setupCommand}
        </div>
      </div>
      <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-semibold text-slate-950">설치 후 확인 명령</div>
          <button
            type="button"
            onClick={() => copyDraft(nextTaskCommand, "확인 명령")}
            className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs"
          >
            <Clipboard size={14} />
            확인 명령 복사
          </button>
        </div>
        <div className="mt-2 rounded-none bg-slate-950 px-3 py-2 font-mono text-xs text-white break-all">
          {nextTaskCommand}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        실행 위치는 다운로드 폴더나 AI Venture Lab 폴더가 아니라 실제 개발할 프로젝트 루트입니다. 이 스크립트가 그
        위치에 <span className="font-mono">{toolFolder}/venture-lab-cli.mjs</span>, 자동 반영 연결 정보, 제작 패키지와
        작업 목록을 만듭니다.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {mcpConfigDraft ? (
          <button
            type="button"
            onClick={() => copyDraft(mcpConfigDraft, `${activeToolLabel} MCP 설정`)}
            disabled={!mcpConfigDraft}
            className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
          >
            <Code2 size={16} />
            MCP 설정 복사
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => copyDraft(guideDraft, `${activeToolLabel} 연결 가이드`)}
          disabled={!guideDraft}
          className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
        >
          <ClipboardList size={16} />
          가이드 복사
        </button>
      </div>
    </>
  );
}
