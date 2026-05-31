"use client";

import { ArrowRight, Code2, Download, FolderOpen } from "lucide-react";

import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionSimplePathProps = {
  activeToolLabel: string;
  activeToolKey: ExternalBuildToolProfile["key"];
  nextTaskCommand: string;
  startFileName: string;
};

export function FinalExecutionSimplePath({
  activeToolLabel,
  activeToolKey,
  nextTaskCommand,
  startFileName,
}: FinalExecutionSimplePathProps) {
  const startsInsideIde = activeToolKey === "cursor" || activeToolKey === "antigravity";
  const firstTaskDetail = startsInsideIde
    ? `START 파일 내용을 ${activeToolLabel} 안의 첫 메시지에 넣고 T-001부터 처리합니다.`
    : `같은 프로젝트 루트에서 ${activeToolLabel}를 열고 START 파일 내용을 첫 메시지로 넣습니다.`;
  const simplePathItems = [
    {
      icon: <Download size={16} />,
      label: "1. 연결 파일 받기",
      title: `${activeToolLabel} 연결 파일`,
      detail: "아래 버튼으로 PowerShell 파일을 받습니다. 받은 직후에는 아직 실행하지 않습니다.",
    },
    {
      icon: <FolderOpen size={16} />,
      label: "2. 실행 위치",
      title: "외부 프로젝트 루트",
      detail:
        "아직 앱 폴더가 없다면 먼저 새 폴더를 만들고, 받은 파일을 그 최상단으로 옮깁니다. 다운로드 폴더나 AI Venture Lab 폴더가 아닙니다.",
    },
    {
      icon: <Code2 size={16} />,
      label: "3. 설치 후 확인",
      title: "설치 명령 후 확인 명령",
      detail: `복사한 명령은 연결 파일을 옮긴 프로젝트 루트 터미널에 붙여넣습니다. 설치 명령을 먼저 실행하고 ${nextTaskCommand} 결과에 T-001 첫 작업이 보이면 성공입니다.`,
    },
    {
      icon: <ArrowRight size={16} />,
      label: "4. 첫 작업 시작",
      title: startFileName,
      detail: firstTaskDetail,
    },
  ];

  return (
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
  );
}
