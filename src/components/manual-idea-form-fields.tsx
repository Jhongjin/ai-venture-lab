"use client";

export type ManualIdeaFormValues = {
  buyer: string;
  name: string;
  next_evidence: string;
  one_liner: string;
  risk_summary: string;
  signal: string;
  target_user: string;
};

type ManualIdeaFormFieldsProps = {
  form: ManualIdeaFormValues;
  onChange: (form: ManualIdeaFormValues) => void;
};

export function ManualIdeaFormFields({ form, onChange }: ManualIdeaFormFieldsProps) {
  function updateField(field: keyof ManualIdeaFormValues, value: string) {
    onChange({ ...form, [field]: value });
  }

  return (
    <div data-smoke="manual-idea-form-fields" className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="이름"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          required
          hint="AI가 추천한 이름을 그대로 두거나, 본인이 이해하기 쉬운 이름으로 다듬어도 됩니다."
        />
        <Field
          label="한 줄 설명"
          value={form.one_liner}
          onChange={(value) => updateField("one_liner", value)}
          required
          hint="사용자 문제와 해결 방식이 한 문장에 보이면 충분합니다."
        />
      </div>

      <details className="avl-surface-muted p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">추가 입력 열기</summary>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          아래는 AI가 만든 초안을 사람이 다듬는 공간입니다. 필요가 없으면 그대로 저장해도 됩니다.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="구매자" value={form.buyer} onChange={(value) => updateField("buyer", value)} />
          <Field
            label="대상 사용자"
            value={form.target_user}
            onChange={(value) => updateField("target_user", value)}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TextArea label="수요 신호" value={form.signal} onChange={(value) => updateField("signal", value)} />
          <TextArea
            label="리스크 요약"
            value={form.risk_summary}
            onChange={(value) => updateField("risk_summary", value)}
          />
          <TextArea
            label="추가로 확인할 내용"
            value={form.next_evidence}
            onChange={(value) => updateField("next_evidence", value)}
          />
        </div>
      </details>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  hint,
}: {
  hint?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} className="avl-input" />
      {hint ? <span className="text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="avl-textarea min-h-28" />
    </label>
  );
}
