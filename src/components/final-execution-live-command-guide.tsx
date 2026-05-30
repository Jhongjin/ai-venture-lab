"use client";

import { FinalExecutionCommandCopyBlocks } from "@/components/final-execution-command-copy-blocks";
import { FinalExecutionToolDetailGuide } from "@/components/final-execution-tool-detail-guide";
import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

export type FinalExecutionCommandPathItem = readonly [title: string, detail: string];

type FinalExecutionLiveCommandGuideProps = {
  activeExternalBuildTool: Pick<
    ExternalBuildToolProfile,
    "key" | "label" | "packageFiles" | "startFileName"
  >;
  commandPathItems: ReadonlyArray<FinalExecutionCommandPathItem>;
  copyDraft: (body: string, label: string) => Promise<void> | void;
  guideDraft: string;
  mcpConfigDraft: string;
  nextTaskCommand: string;
  setupCommand: string;
  successCriterion: string;
  toolFolder: string;
};

export function FinalExecutionLiveCommandGuide({
  activeExternalBuildTool,
  commandPathItems,
  copyDraft,
  guideDraft,
  mcpConfigDraft,
  nextTaskCommand,
  setupCommand,
  successCriterion,
  toolFolder,
}: FinalExecutionLiveCommandGuideProps) {
  return (
    <>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        아래 순서만 끝내면 {activeExternalBuildTool.label}가 제작 패키지, 작업 목록, 진행 기록 파일을 읽을 수 있습니다.
        도구별 세부 설정은 필요할 때만 펼쳐 확인하세요.
      </p>
      <div
        data-smoke="final-execution-command-path"
        className="mt-3 grid gap-px bg-slate-200 text-sm leading-6 text-slate-700"
      >
        {commandPathItems.map(([title, detail]) => (
          <div key={title} className="bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{detail}</p>
          </div>
        ))}
      </div>
      <div data-smoke="final-execution-success-criterion" className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">성공 기준</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-emerald-950">{successCriterion}</p>
      </div>
      <FinalExecutionToolDetailGuide activeExternalBuildTool={activeExternalBuildTool} toolFolder={toolFolder} />
      <FinalExecutionCommandCopyBlocks
        activeToolLabel={activeExternalBuildTool.label}
        copyDraft={copyDraft}
        guideDraft={guideDraft}
        mcpConfigDraft={mcpConfigDraft}
        nextTaskCommand={nextTaskCommand}
        setupCommand={setupCommand}
        toolFolder={toolFolder}
      />
    </>
  );
}
