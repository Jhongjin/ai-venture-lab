"use client";

type Step6CurrentActionItem = {
  code: string | null;
  detail: string;
  label: string;
  title: string;
};

type Step6ExecutionBridgeProps = {
  currentActionItems: ReadonlyArray<Step6CurrentActionItem>;
  finalExecutionDetail: string;
  firstTaskLockItems: ReadonlyArray<readonly [label: string, detail: string]>;
};

export function Step6ExecutionBridge({
  currentActionItems,
  finalExecutionDetail,
  firstTaskLockItems,
}: Step6ExecutionBridgeProps) {
  const executionBridgeItems = [
    {
      label: "1. 제작 패키지",
      detail: "제품 기획서, 화면 구조, 디자인 기준, 기술 방향",
    },
    {
      label: "2. 작업 순서",
      detail: "T-001부터 개발자가 처리할 순서",
    },
    {
      label: "3. 최종 실행",
      detail: finalExecutionDetail,
    },
  ];

  return (
    <>
      <div data-smoke="step6-execution-bridge" className="mt-4 border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-950">제작 패키지 연결</div>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          저장한 제작 패키지를 작업 순서로 풀고, 첫 작업이 준비되면 하단 다음 버튼으로 최종 실행에서 연결 파일을 받습니다.
        </p>
        <div className="mt-3 grid gap-px bg-slate-200 sm:grid-cols-3">
          {executionBridgeItems.map(({ label, detail }) => (
            <div key={label} className="bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{label}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div data-smoke="step6-current-action" className="mt-4 grid gap-px bg-slate-200 lg:grid-cols-3">
        {currentActionItems.map(({ label, code, title, detail }) => (
          <div key={label} className="bg-white px-4 py-3">
            <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{label}</div>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold leading-6 text-slate-950">
              {code ? <span className="font-mono text-xs font-semibold text-slate-500">{code}</span> : null}
              <span>{title}</span>
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div data-smoke="step6-first-task-lock" className="mt-4 border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm font-semibold text-blue-950">첫 제작 범위 잠금</div>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          작업 순서를 만들면 먼저 T-001 하나만 확인합니다. 이름과 완료 기준이 맞으면 하단 다음 단계로 최종 실행에 넘깁니다.
        </p>
        <div className="mt-3 grid gap-px bg-blue-200 md:grid-cols-3">
          {firstTaskLockItems.map(([label, detail]) => (
            <div key={label} className="min-w-0 bg-white px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
              <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-950">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
