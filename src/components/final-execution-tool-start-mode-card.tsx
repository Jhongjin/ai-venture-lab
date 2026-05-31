"use client";

import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionToolStartModeCardProps = {
  activeExternalBuildTool: Pick<ExternalBuildToolProfile, "key" | "label">;
  isExternalTool: boolean;
};

function getToolStartMode({
  activeExternalBuildTool,
  isExternalTool,
}: FinalExecutionToolStartModeCardProps) {
  if (!isExternalTool) {
    return {
      label: "내부 개발 준비",
      title: "제작 패키지를 내부 개발 시작 자료로 보관합니다.",
      detail: "외부 도구 연결이 아니면 패키지와 작업 순서를 내부 개발 기준 자료로 넘깁니다.",
      promptTarget: null,
    };
  }

  if (activeExternalBuildTool.key === "cursor" || activeExternalBuildTool.key === "antigravity") {
    return {
      label: "IDE에서 시작",
      title: `${activeExternalBuildTool.label}에서 프로젝트 폴더를 열고 START 파일을 첫 메시지로 넣습니다.`,
      detail: "설치/확인 명령은 프로젝트 루트 터미널에서 실행하고, 실제 작업은 IDE 안의 에이전트 흐름에서 시작합니다.",
      promptTarget: `${activeExternalBuildTool.label} 안의 에이전트 채팅 입력창`,
    };
  }

  return {
    label: "터미널 에이전트에서 시작",
    title: `${activeExternalBuildTool.label}를 프로젝트 루트에서 열고 START 파일을 첫 메시지로 넣습니다.`,
    detail: "설치/확인 명령을 실행한 같은 프로젝트 루트에서 에이전트를 시작하면 됩니다.",
    promptTarget: "프로젝트 루트에서 연 터미널 에이전트의 첫 입력창",
  };
}

export function FinalExecutionToolStartModeCard({
  activeExternalBuildTool,
  isExternalTool,
}: FinalExecutionToolStartModeCardProps) {
  const toolStartMode = getToolStartMode({ activeExternalBuildTool, isExternalTool });

  return (
    <div data-smoke="final-execution-tool-start-mode" className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-950">도구 시작 방식</div>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{toolStartMode.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{toolStartMode.detail}</p>
          {toolStartMode.promptTarget ? (
            <div
              data-smoke="final-execution-start-prompt-target"
              className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
            >
              START 파일 붙여넣을 곳: {toolStartMode.promptTarget}
            </div>
          ) : null}
        </div>
        <span className="inline-flex w-fit items-center border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {toolStartMode.label}
        </span>
      </div>
    </div>
  );
}
