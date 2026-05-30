"use client";

import type { ReactNode } from "react";

import {
  FinalExecutionLiveCommandGuide,
  type FinalExecutionCommandPathItem,
} from "@/components/final-execution-live-command-guide";
import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionToolGuideProps = {
  activeExternalBuildTool: Pick<
    ExternalBuildToolProfile,
    "handoffNote" | "handoffSteps" | "key" | "label" | "packageFiles" | "startFileName" | "startMethod"
  >;
  commandPathItems: ReadonlyArray<FinalExecutionCommandPathItem>;
  copyDraft: (body: string, label: string) => Promise<void> | void;
  guideDraft: string;
  isLiveExternalDelivery: boolean;
  mcpConfigDraft: string;
  nextTaskCommand: string;
  setupCommand: string;
  successCriterion: string;
  toolFolder: string;
};

type GuideStepProps = {
  children: ReactNode;
};

function GuideStep({ children }: GuideStepProps) {
  return <li className="border border-slate-200 bg-slate-50 p-3">{children}</li>;
}

export function FinalExecutionToolGuide({
  activeExternalBuildTool,
  commandPathItems,
  copyDraft,
  guideDraft,
  isLiveExternalDelivery,
  mcpConfigDraft,
  nextTaskCommand,
  setupCommand,
  successCriterion,
  toolFolder,
}: FinalExecutionToolGuideProps) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-950">
        {isLiveExternalDelivery ? "실행만 하기" : "외부 도구 전달 방식"}
      </div>
      {isLiveExternalDelivery ? (
        <FinalExecutionLiveCommandGuide
          activeExternalBuildTool={activeExternalBuildTool}
          commandPathItems={commandPathItems}
          copyDraft={copyDraft}
          guideDraft={guideDraft}
          mcpConfigDraft={mcpConfigDraft}
          nextTaskCommand={nextTaskCommand}
          setupCommand={setupCommand}
          successCriterion={successCriterion}
          toolFolder={toolFolder}
        />
      ) : (
        <>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeExternalBuildTool.startMethod}</p>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
            {activeExternalBuildTool.handoffSteps.map((step, index) => (
              <GuideStep key={step}>
                {index + 1}. {step}
              </GuideStep>
            ))}
          </ol>
          <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">함께 받는 파일 기준</div>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
              {activeExternalBuildTool.packageFiles.map((file) => (
                <div key={file} className="border border-slate-200 bg-white p-2">
                  {file}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{activeExternalBuildTool.handoffNote}</p>
          </div>
        </>
      )}
    </div>
  );
}
