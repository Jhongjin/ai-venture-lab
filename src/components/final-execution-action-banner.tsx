"use client";

import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type FinalExecutionActionBannerProps = {
  activeToolLabel: string;
  decisionSentence: string;
  isExternalTool: boolean;
};

export function FinalExecutionActionBanner({
  activeToolLabel,
  decisionSentence,
  isExternalTool,
}: FinalExecutionActionBannerProps) {
  const primaryActionTitle = isExternalTool
    ? `${activeToolLabel} 연결 파일을 실제 프로젝트 루트에서 실행하세요.`
    : "제작 패키지를 내려받아 내부 개발 시작점으로 넘기세요.";
  const primaryActionDetail = isExternalTool
    ? "이 화면에서는 연결 파일을 받은 뒤 실제 개발할 프로젝트 루트로 옮기고, 설치 명령과 확인 명령만 차례로 실행하면 됩니다. 다운로드 폴더나 AI Venture Lab 폴더에서는 실행하지 않습니다."
    : "내부 개발 도구가 열릴 때까지 같은 제작 패키지와 작업 순서를 기준 자료로 보관합니다.";
  const runLocationItems: ReadonlyArray<WorkbenchReviewGridRow> = [
    ["실행할 곳", "실제 앱 폴더 최상단"],
    ["아닌 곳", "다운로드 폴더 / AI Venture Lab 폴더"],
    ["5초 확인", "package.json, app, src 중 하나"],
  ];

  return (
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
        <div
          data-smoke="final-execution-button-order"
          className="mt-2 border border-blue-200 bg-white px-3 py-2 text-sm leading-6 text-blue-950"
        >
          버튼 순서: {activeToolLabel} 연결 파일 받기 - 설치 명령 복사 - 확인 명령 복사 - START 파일 열기.
        </div>
      ) : null}
      {isExternalTool ? (
        <div className="mt-3">
          <WorkbenchReviewGrid dataSmoke="final-execution-run-location-summary" rows={runLocationItems} variant="blue" />
        </div>
      ) : null}
    </div>
  );
}
