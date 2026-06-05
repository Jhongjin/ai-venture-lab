"use client";

export type Step8ProgressItem = {
  code: string;
  id: string;
  isDone: boolean;
  isNext: boolean;
  missingLabels: string[];
  passedCount: number;
  showMissingEvidence: boolean;
  statusDetail: string;
  statusLabel: string;
  statusTone: string;
  title: string;
  totalCount: number;
};

type Step8ProgressDetailsProps = {
  items: ReadonlyArray<Step8ProgressItem>;
};

function getProgressItemClassName(item: Step8ProgressItem) {
  if (item.isNext) {
    return "border-blue-200 bg-blue-50";
  }

  if (item.isDone) {
    return "border-emerald-200 bg-emerald-50";
  }

  return "border-slate-200 bg-slate-50";
}

export function Step8ProgressDetails({ items }: Step8ProgressDetailsProps) {
  return (
    <details data-smoke="step8-progress-details" className="mt-4 border border-slate-200 bg-slate-50 p-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
        {items.length > 0 ? "전체 진행표 보기" : "빈 상태 보기"}
      </summary>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className={`border p-3 ${getProgressItemClassName(item)}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">{item.code}</span>
                    <span className="text-sm font-semibold text-slate-950">{item.title}</span>
                    {item.isNext ? <span className="avl-pill avl-pill-info">다음 작업</span> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.statusDetail}</p>
                  {item.showMissingEvidence ? (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      보완할 근거: {item.missingLabels.slice(0, 3).join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                  <span className={item.statusTone}>{item.statusLabel}</span>
                  <span className="avl-pill avl-pill-neutral">
                    근거 {item.passedCount}/{item.totalCount}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <div className="font-semibold text-slate-950">성과 확인은 아직 볼 게 없습니다.</div>
            <p className="mt-1">
              최종 실행에서 첫 제작 작업을 넘기면 완료된 것, 이어 할 것, 지금 판단이 여기에 표시됩니다.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              최종 실행 확인은 STEP 7에서 진행하세요. 이 빈 상태는 단계를 자동으로 이동시키지 않습니다.
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
