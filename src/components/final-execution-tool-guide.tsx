"use client";

import type { ReactNode } from "react";

import {
  FinalExecutionLiveCommandGuide,
} from "@/components/final-execution-live-command-guide";
import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionToolGuideProps = {
  activeExternalBuildTool: Pick<
    ExternalBuildToolProfile,
    "handoffNote" | "handoffSteps" | "key" | "label" | "packageFiles" | "startFileName" | "startMethod"
  >;
  copyDraft: (body: string, label: string) => Promise<void> | void;
  guideDraft: string;
  isLiveExternalDelivery: boolean;
  mcpConfigDraft: string;
  nextTaskCommand: string;
  setupCommand: string;
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
  copyDraft,
  guideDraft,
  isLiveExternalDelivery,
  mcpConfigDraft,
  nextTaskCommand,
  setupCommand,
  toolFolder,
}: FinalExecutionToolGuideProps) {
  const commandPathItems = [
    ["1. 파일 받기", `${activeExternalBuildTool.label} 연결 파일 받기 버튼으로 PowerShell 파일을 받습니다.`],
    ["2. 위치 옮기기", "받은 파일을 실제 개발할 프로젝트 루트로 옮깁니다. 다운로드 폴더나 AI Venture Lab 폴더에서는 실행하지 않습니다."],
    ["3. 설치와 확인", "아래 설치 명령을 먼저 실행하고, 확인 명령으로 첫 작업이 읽히는지 봅니다."],
    ["4. 첫 작업 시작", `${activeExternalBuildTool.startFileName} 내용을 첫 메시지로 넣고 T-001부터 처리합니다.`],
  ] as const;
  const successCriterion = `확인 명령 결과에 T-001이 보이면 설치 완료입니다. 그 다음 ${activeExternalBuildTool.startFileName}을 첫 메시지로 넣고 시작하세요.`;

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
