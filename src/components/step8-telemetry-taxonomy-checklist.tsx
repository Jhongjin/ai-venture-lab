"use client";

export type Step8TelemetryTaxonomyItem = {
  count: number;
  eventName: string;
  label: string;
  when: string;
};

type Step8TelemetryTaxonomyChecklistProps = {
  items: ReadonlyArray<Step8TelemetryTaxonomyItem>;
};

export function Step8TelemetryTaxonomyChecklist({ items }: Step8TelemetryTaxonomyChecklistProps) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-950">수집해야 할 행동 신호</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          첫 버전에서 어떤 이벤트를 보내야 Day 7/14/30 판단이 가능한지 점검합니다.
        </p>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item.eventName} className="border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{item.eventName}</div>
              </div>
              <span className={`avl-pill ${item.count > 0 ? "avl-pill-success" : "avl-pill-neutral"}`}>
                {item.count > 0 ? `${item.count}개` : "대기"}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{item.when}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
