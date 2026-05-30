"use client";

import type { ReactNode } from "react";

type FinalExecutionExternalToolSectionProps = {
  activeToolLabel: string;
  children: ReactNode;
  isLiveExternalDelivery: boolean;
  onSwitchToCursor: () => void;
};

export function FinalExecutionExternalToolSection({
  activeToolLabel,
  children,
  isLiveExternalDelivery,
  onSwitchToCursor,
}: FinalExecutionExternalToolSectionProps) {
  return (
    <section className="border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="avl-kicker">외부 개발 도구</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            {isLiveExternalDelivery ? `${activeToolLabel} 프로젝트에 연결 파일을 설치합니다` : `${activeToolLabel}용 제작 패키지를 받습니다`}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {isLiveExternalDelivery
              ? `${activeToolLabel}가 실제로 읽을 제작 패키지, 시작 지시문, 작업 목록, 자동 진행 기록 설정을 설치 파일 하나로 묶습니다.`
              : `${activeToolLabel}가 바로 읽을 수 있도록 도구별 시작 지시문과 제작 패키지를 한 파일로 묶습니다.`}
          </p>
        </div>
        <span className="avl-pill avl-pill-info">{activeToolLabel}</span>
      </div>

      {!isLiveExternalDelivery ? (
        <div className="mt-4 flex flex-col gap-3 border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-blue-950">
            {activeToolLabel}는 현재 시작 패키지와 완료 보고 반영으로 진행합니다. 작업 상태까지 자동으로 Venture Lab에 반영하려면
            위의 지원 도구 중 하나를 선택하세요.
          </p>
          <button type="button" onClick={onSwitchToCursor} className="avl-btn avl-btn-primary h-10 px-3">
            Cursor로 바꾸기
          </button>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.56fr)_minmax(360px,0.44fr)]">{children}</div>
    </section>
  );
}
