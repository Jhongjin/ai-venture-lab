type WorkbenchCurrentActionProps = {
  title: string;
  detail: string;
  activeTaskLabel: string;
  progressLabel: string;
  productSurfaceLabel: string;
  actionItems: string[];
};

export function WorkbenchCurrentAction({
  title,
  detail,
  activeTaskLabel,
  progressLabel,
  productSurfaceLabel,
  actionItems,
}: WorkbenchCurrentActionProps) {
  return (
    <div className="border border-blue-100 bg-blue-50 p-4 text-slate-950" data-smoke="workbench-current-action">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.16em] text-blue-700">지금 할 일</div>
          <h2 className="mt-2 text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">{detail}</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span className="avl-pill avl-pill-info">{activeTaskLabel}</span>
          <span className="avl-pill avl-pill-neutral">{progressLabel}</span>
          <span className="avl-pill avl-pill-neutral">{productSurfaceLabel}</span>
        </div>
      </div>

      <div
        className="mt-4 grid gap-2 border-t border-blue-100 pt-3 sm:grid-cols-3"
        data-smoke="workbench-current-action-checklist"
      >
        {actionItems.map((item, index) => (
          <div key={item} className="flex min-w-0 items-center gap-2 text-xs font-semibold leading-5 text-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] text-blue-700">
              {index + 1}
            </span>
            <span className="min-w-0">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
