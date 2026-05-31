import { CheckCircle2, Clipboard, Save } from "lucide-react";

function clampScore(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(5, Math.max(0, value));
}

export function ScoreInput({
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span className="flex items-center justify-between gap-3">
        {label}
        <span className="avl-pill avl-pill-neutral px-2 py-1 text-xs">{value}/5</span>
      </span>
      <input
        type="range"
        min={0}
        max={5}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampScore(Number(event.target.value)))}
      />
      {description ? <span className="text-xs font-normal leading-5 text-slate-500">{description}</span> : null}
    </label>
  );
}

export function GateChecklistPanel({
  eyebrow,
  title,
  description,
  score,
  checks,
}: {
  eyebrow: string;
  title: string;
  description: string;
  score: number;
  checks: Array<{
    label: string;
    passed: boolean;
    detail: string;
  }>;
}) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{eyebrow}</div>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
        </div>
        <div className="shrink-0 border border-slate-200 bg-slate-50 px-3 py-2 text-center text-slate-950">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">준비</div>
          <div className="text-2xl font-semibold">{score}%</div>
        </div>
      </div>
      <div className="mt-4 h-2 bg-slate-100">
        <div className="h-2 bg-slate-950" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-4 grid gap-3">
        {checks.map((check) => (
          <div key={check.label} className="border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2
                size={18}
                className={check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400"}
              />
              <div>
                <div className="text-sm font-semibold text-slate-950">{check.label}</div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{check.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DraftDocumentCard({
  className = "",
  kicker,
  title,
  description,
  body,
  rows = 16,
  copyLabel,
  saveLabel = "제작 자료 저장",
  onCopy,
  onSave,
  copyDisabled = false,
  saveDisabled = false,
  disabledNote,
  actionMode = "full",
}: {
  className?: string;
  kicker?: string;
  title: string;
  description: string;
  body: string;
  rows?: number;
  copyLabel: string;
  saveLabel?: string;
  onCopy: () => void;
  onSave?: () => void;
  copyDisabled?: boolean;
  saveDisabled?: boolean;
  disabledNote?: string;
  actionMode?: "full" | "copy-only" | "hidden";
}) {
  const isSaved = saveLabel === "저장 완료";
  const showActions = actionMode !== "hidden";
  const showSave = actionMode === "full" && onSave;

  return (
    <section className={`${className} avl-card p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {kicker ? (
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{kicker}</div>
          ) : null}
          <h3 className={`${kicker ? "mt-2" : ""} text-lg font-semibold text-slate-950`}>{title}</h3>
          <p className="mt-2 text-sm leading-5 text-slate-600">{description}</p>
        </div>
        {showActions ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopy}
              disabled={copyDisabled}
              className="avl-btn avl-btn-secondary px-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clipboard size={18} />
              {copyLabel}
            </button>
            {showSave ? (
              <button
                type="button"
                onClick={onSave}
                disabled={saveDisabled}
                className="avl-btn avl-btn-primary px-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {saveLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {onSave && actionMode === "full" ? (
        <div
          data-smoke="draft-document-save-boundary"
          className="mt-4 border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"
        >
          {isSaved ? (
            <span>이 문서는 저장되어 상단 진행 상태에 반영되었습니다.</span>
          ) : (
            <>
              복사는 외부 문서나 메신저에 붙여 넣을 때 쓰는 보조 동작입니다. 일반 진행은 내용을 확인한 뒤{" "}
              <span className="font-semibold text-slate-950">{saveLabel}</span>을 누르면 됩니다.
            </>
          )}
          {disabledNote ? <span className="mt-1 block text-amber-700">{disabledNote}</span> : null}
        </div>
      ) : actionMode === "hidden" ? (
        <div className="mt-4 border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          확인용 미리보기입니다. 일반 진행은 상단의{" "}
          <span className="font-semibold text-slate-950">검증 자료 한 번에 저장</span> 버튼 하나만 누르면 됩니다.
          {disabledNote ? <span className="mt-1 block text-amber-700">{disabledNote}</span> : null}
        </div>
      ) : null}
      <textarea value={body} readOnly rows={rows} className="avl-textarea mt-4 font-mono text-sm leading-5 text-slate-700" />
    </section>
  );
}

export function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="avl-input" />
    </label>
  );
}

export function TextArea({
  label,
  value,
  placeholder,
  description,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="avl-textarea min-h-28"
      />
      {description ? <span className="text-xs font-normal leading-5 text-slate-500">{description}</span> : null}
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  labels,
  description,
  disabled,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  labels?: Record<T, string>;
  description?: string;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T)} className="avl-select">
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
      {description ? <span className="text-xs font-normal leading-5 text-slate-500">{description}</span> : null}
    </label>
  );
}
