"use client";

import { ArrowRight, Code2, Download, FolderOpen } from "lucide-react";

import { FinalExecutionSetupChecks } from "@/components/final-execution-setup-checks";
import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";
import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionQuickStartProps = {
  activeExternalBuildTool: Pick<ExternalBuildToolProfile, "key" | "label" | "startFileName">;
  decisionSentence: string;
  isExternalTool: boolean;
  nextTaskCommand: string;
  progressPath: string;
};

export function FinalExecutionQuickStart({
  activeExternalBuildTool,
  decisionSentence,
  isExternalTool,
  nextTaskCommand,
  progressPath,
}: FinalExecutionQuickStartProps) {
  const isIdeExternalDelivery =
    activeExternalBuildTool.key === "cursor" || activeExternalBuildTool.key === "antigravity";
  const isTerminalAgentDelivery =
    activeExternalBuildTool.key === "claude_code" || activeExternalBuildTool.key === "codex";
  const primaryActionTitle = isExternalTool
    ? `${activeExternalBuildTool.label} 연결 파일을 실제 프로젝트 루트에서 실행하세요.`
    : "제작 패키지를 내려받아 내부 개발 시작점으로 넘기세요.";
  const primaryActionDetail = isExternalTool
    ? "이 화면에서는 연결 파일을 받은 뒤 실제 개발할 프로젝트 루트로 옮기고, 설치 명령과 확인 명령만 차례로 실행하면 됩니다. 다운로드 폴더나 AI Venture Lab 폴더에서는 실행하지 않습니다."
    : "내부 개발 도구가 열릴 때까지 같은 제작 패키지와 작업 순서를 기준 자료로 보관합니다.";
  const toolStartMode = isExternalTool && isIdeExternalDelivery
    ? {
        label: "IDE에서 시작",
        title: `${activeExternalBuildTool.label}에서 프로젝트 폴더를 열고 START 파일을 첫 메시지로 넣습니다.`,
        detail: "설치/확인 명령은 프로젝트 루트 터미널에서 실행하고, 실제 작업은 IDE 안의 에이전트 흐름에서 시작합니다.",
      }
    : isExternalTool && isTerminalAgentDelivery
      ? {
          label: "터미널 에이전트에서 시작",
          title: `${activeExternalBuildTool.label}를 프로젝트 루트에서 열고 START 파일을 첫 메시지로 넣습니다.`,
          detail: "설치/확인 명령을 실행한 같은 프로젝트 루트에서 에이전트를 시작하면 됩니다.",
        }
      : {
          label: "내부 개발 준비",
          title: "제작 패키지를 내부 개발 시작 자료로 보관합니다.",
          detail: "외부 도구 연결이 아니면 패키지와 작업 순서를 내부 개발 기준 자료로 넘깁니다.",
        };
  const simplePathItems = [
    {
      icon: <Download size={16} />,
      label: "1. 연결 파일 받기",
      title: `${activeExternalBuildTool.label} 연결 파일`,
      detail: "아래 버튼으로 PowerShell 파일을 받습니다. 받은 직후에는 아직 실행하지 않습니다.",
    },
    {
      icon: <FolderOpen size={16} />,
      label: "2. 실행 위치",
      title: "외부 프로젝트 루트",
      detail: "받은 파일을 새로 만들 앱이나 사이트 폴더의 최상단으로 옮깁니다. 다운로드 폴더나 AI Venture Lab 폴더가 아닙니다.",
    },
    {
      icon: <Code2 size={16} />,
      label: "3. 설치 후 확인",
      title: "설치 명령 후 확인 명령",
      detail: `설치 명령을 먼저 실행하고 ${nextTaskCommand}로 첫 작업이 보이는지 확인합니다.`,
    },
    {
      icon: <ArrowRight size={16} />,
      label: "4. 첫 작업 시작",
      title: `${activeExternalBuildTool.startFileName}`,
      detail: "START 파일 내용을 개발 도구의 첫 메시지로 넣고 T-001부터 처리합니다.",
    },
  ];
  const runLocationItems: ReadonlyArray<WorkbenchReviewGridRow> = [
    ["실행할 곳", "실제 앱 폴더 최상단"],
    ["아닌 곳", "다운로드 폴더 / AI Venture Lab 폴더"],
    ["5초 확인", "package.json, app, src 중 하나"],
  ];
  const installResultItems = [
    ["START 파일", `${activeExternalBuildTool.startFileName} 첫 메시지`],
    ["작업 목록", "T-001부터 볼 수 있는 제작 순서"],
    ["진행 기록", `${progressPath} 자동 반영 백업`],
  ] as const;

  return (
    <>
      <div data-smoke="final-execution-action-banner" className="border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm font-semibold text-blue-950">지금 할 일</div>
        <h3 className="mt-2 text-base font-semibold text-slate-950">{primaryActionTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{primaryActionDetail}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">결정: {decisionSentence}</p>
        {isExternalTool ? (
          <div
            data-smoke="final-execution-run-place-one-liner"
            className="mt-3 border border-blue-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
          >
            이 화면에서는 연결 파일을 받기만 합니다. 실행은 실제 앱 프로젝트 루트 터미널에서 하고, 다운로드 폴더에서는
            실행하지 않습니다. AI Venture Lab 폴더에서도 실행하지 않습니다.
          </div>
        ) : null}
        {isExternalTool ? (
          <div
            data-smoke="final-execution-simple-mode-note"
            className="mt-3 border border-blue-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
          >
            실행만 하기: 연결 파일 받기, 실제 앱 폴더 최상단으로 옮기기, 설치 명령과 확인 명령 실행.
          </div>
        ) : null}
        {isExternalTool ? (
          <div className="mt-3">
            <WorkbenchReviewGrid dataSmoke="final-execution-run-location-summary" rows={runLocationItems} variant="blue" />
          </div>
        ) : null}
      </div>
      {isExternalTool ? (
        <div className="grid gap-3">
          <div data-smoke="final-execution-simple-path" className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
            {simplePathItems.map((step) => (
              <div key={step.label} className="bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <span className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
                    {step.icon}
                  </span>
                  {step.label}
                </div>
                <div className="mt-3 text-base font-semibold text-slate-950">{step.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
          <FinalExecutionSetupChecks installResultItems={installResultItems} />
          <div data-smoke="final-execution-tool-start-mode" className="border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950">도구 시작 방식</div>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{toolStartMode.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{toolStartMode.detail}</p>
              </div>
              <span className="inline-flex w-fit items-center border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {toolStartMode.label}
              </span>
            </div>
          </div>
          <div data-smoke="final-execution-after-first-task" className="border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-950">첫 작업 뒤에는 STEP 8만 확인</div>
            <p className="mt-1 text-sm leading-6 text-emerald-950">
              외부 도구가 완료 보고를 남기면 Venture Lab 작업표와 성과 확인에 자동 반영됩니다. 처음에는 완료된 것,
              다음 작업, 오늘 판단만 보면 됩니다.
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-800">
              자동 반영이 안 될 때만 진행 기록 JSON을 백업으로 붙여넣습니다.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
