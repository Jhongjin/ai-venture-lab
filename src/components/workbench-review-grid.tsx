import type { ReactNode } from "react";

export type WorkbenchReviewGridRow = readonly [label: string, value: ReactNode, detail?: ReactNode];

type WorkbenchReviewGridProps = {
  dataSmoke?: string;
  density?: "compact" | "roomy";
  detailTone?: "muted" | "soft";
  rows: ReadonlyArray<WorkbenchReviewGridRow>;
  variant: "blue" | "emerald";
};

const variantClasses = {
  blue: {
    container: "bg-blue-200",
    label: "text-blue-700",
  },
  emerald: {
    container: "bg-emerald-200",
    label: "text-emerald-700",
  },
} as const;

const densityClasses = {
  compact: {
    cell: "px-3 py-2",
    label: "text-[11px]",
    value: "mt-1",
  },
  roomy: {
    cell: "px-3 py-3",
    label: "text-xs",
    value: "mt-2",
  },
} as const;

const detailToneClasses = {
  muted: "text-slate-500",
  soft: "text-slate-600",
} as const;

export function WorkbenchReviewGrid({
  dataSmoke,
  density = "compact",
  detailTone = "muted",
  rows,
  variant,
}: WorkbenchReviewGridProps) {
  const color = variantClasses[variant];
  const spacing = densityClasses[density];

  return (
    <div data-smoke={dataSmoke} className={`grid gap-px ${color.container} sm:grid-cols-3`}>
      {rows.map(([label, value, detail]) => (
        <div key={label} className={`bg-white ${spacing.cell}`}>
          <div className={`${spacing.label} font-semibold uppercase tracking-[0.14em] ${color.label}`}>{label}</div>
          <div className={`${spacing.value} text-sm font-semibold leading-6 text-slate-950`}>{value}</div>
          {detail ? <p className={`mt-1 text-xs leading-5 ${detailToneClasses[detailTone]}`}>{detail}</p> : null}
        </div>
      ))}
    </div>
  );
}
