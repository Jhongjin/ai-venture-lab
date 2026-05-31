"use client";

type Step6CurrentActionItem = {
  code: string | null;
  detail: string;
  label: string;
  title: string;
};

type Step6ExecutionBridgeProps = {
  finalExecutionDetail: string;
  firstTaskAcceptanceCriteria?: string | null;
  firstTaskTitle?: string | null;
  firstTaskTypeLabel?: string | null;
  hasGeneratedWorkOrder: boolean;
};

export function Step6ExecutionBridge({
  finalExecutionDetail,
  firstTaskAcceptanceCriteria,
  firstTaskTitle,
  firstTaskTypeLabel,
  hasGeneratedWorkOrder,
}: Step6ExecutionBridgeProps) {
  const firstTaskCode = "T-001";
  const currentActionItems: ReadonlyArray<Step6CurrentActionItem> = [
    {
      label: "지금 할 일",
      code: null,
      title: hasGeneratedWorkOrder ? "생성된 작업 순서를 확인하세요" : "작업 순서 자동 만들기를 누르세요",
      detail: hasGeneratedWorkOrder
        ? "T-001 이름과 완료 기준만 먼저 보고, 필요한 보완만 한 뒤 하단 다음 단계로 이동합니다."
        : "AI가 제작자가 볼 순서와 첫 작업을 만듭니다.",
    },
    {
      label: "첫 작업",
      code: firstTaskCode,
      title: firstTaskTitle ?? "기획서와 첫 제작 범위 잠금",
      detail: firstTaskTypeLabel ?? "작업 순서를 만들면 첫 제작 기준이 여기에 표시됩니다.",
    },
    {
      label: "다음 단계",
      code: null,
      title: hasGeneratedWorkOrder ? "최종 실행으로 넘길 준비" : "작업 순서가 있어야 최종 실행이 열립니다",
      detail: "외부 개발 도구 연결은 STEP 7에서 진행합니다.",
    },
  ];
  const firstTaskLockItems = [
    ["작업 번호", firstTaskCode],
    ["작업 이름", firstTaskTitle ?? "기획서와 첫 제작 범위 잠금"],
    ["완료 기준", firstTaskAcceptanceCriteria || "작업 순서 생성 후 표시"],
  ] as const;
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
  const stepBoundaryItems = [
    ["STEP 6에서 끝낼 일", "T-001 이름과 완료 기준 확인, 작업 순서 저장"],
    ["STEP 7에서 할 일", "연결 파일 받기, 설치 명령과 확인 명령 복사, START 파일로 첫 작업 시작"],
  ] as const;

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
        <div data-smoke="step6-step7-boundary" className="mt-3 grid gap-px bg-blue-200 sm:grid-cols-2">
          {stepBoundaryItems.map(([label, detail]) => (
            <div key={label} className="bg-blue-50 px-4 py-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-blue-700">{label}</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-blue-950">{detail}</p>
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
      <div
        data-smoke="step6-first-task-focus"
        className="mt-4 border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-950"
      >
        처음에는 전체 작업표를 다 읽지 않고 T-001 이름과 완료 기준만 확인합니다.
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
