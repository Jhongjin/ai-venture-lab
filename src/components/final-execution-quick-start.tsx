"use client";

import type { ReactNode } from "react";

import { FinalExecutionSetupChecks } from "@/components/final-execution-setup-checks";
import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type FinalExecutionSimplePathItem = {
  detail: string;
  icon: ReactNode;
  label: string;
  title: string;
};

type FinalExecutionToolStartMode = {
  detail: string;
  label: string;
  title: string;
};

type FinalExecutionQuickStartProps = {
  decisionSentence: string;
  installResultItems: ReadonlyArray<readonly [label: string, detail: string]>;
  isExternalTool: boolean;
  primaryActionDetail: string;
  primaryActionTitle: string;
  runLocationItems: ReadonlyArray<WorkbenchReviewGridRow>;
  simplePathItems: ReadonlyArray<FinalExecutionSimplePathItem>;
  toolStartMode: FinalExecutionToolStartMode;
};

export function FinalExecutionQuickStart({
  decisionSentence,
  installResultItems,
  isExternalTool,
  primaryActionDetail,
  primaryActionTitle,
  runLocationItems,
  simplePathItems,
  toolStartMode,
}: FinalExecutionQuickStartProps) {
  return (
    <>
      <div data-smoke="final-execution-action-banner" className="border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm font-semibold text-blue-950">지금 할 일</div>
        <h3 className="mt-2 text-base font-semibold text-slate-950">{primaryActionTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{primaryActionDetail}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">결정: {decisionSentence}</p>
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
        </div>
      ) : null}
    </>
  );
}
