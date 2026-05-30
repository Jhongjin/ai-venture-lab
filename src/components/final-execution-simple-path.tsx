"use client";

import { ArrowRight, Code2, Download, FolderOpen } from "lucide-react";

type FinalExecutionSimplePathProps = {
  activeToolLabel: string;
  nextTaskCommand: string;
  startFileName: string;
};

export function FinalExecutionSimplePath({
  activeToolLabel,
  nextTaskCommand,
  startFileName,
}: FinalExecutionSimplePathProps) {
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
      title: startFileName,
      detail: "START 파일 내용을 개발 도구의 첫 메시지로 넣고 T-001부터 처리합니다.",
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
