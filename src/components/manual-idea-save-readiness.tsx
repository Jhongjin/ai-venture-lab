type ManualIdeaSaveReadinessProps = {
  hasAudienceDraft: boolean;
  hasEvidenceNotes: boolean;
  hasRequiredFields: boolean;
};

export function ManualIdeaSaveReadiness({
  hasAudienceDraft,
  hasEvidenceNotes,
  hasRequiredFields,
}: ManualIdeaSaveReadinessProps) {
  const readinessRows = [
    {
      label: "필수 입력",
      passed: hasRequiredFields,
      readyLabel: "준비됨",
      waitingLabel: "필요",
    },
    {
      label: "구매자/대상",
      passed: hasAudienceDraft,
      readyLabel: "정리됨",
      waitingLabel: "선택 보완",
    },
    {
      label: "검증 메모",
      passed: hasEvidenceNotes,
      readyLabel: "메모 있음",
      waitingLabel: "선택 보완",
    },
  ];

  return (
    <div data-smoke="manual-idea-save-readiness" className="grid gap-4">
      <section data-smoke="manual-idea-next-step" className="avl-band p-5 text-slate-900">
        <div className="avl-kicker">다음 단계</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950">저장하면 사업성 평가로 이어집니다</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          새 아이디어를 저장하면 실행 보드에 추가되고, 바로 선택된 상태로 STEP 2에서 이어서 검토할 수 있습니다.
        </p>
      </section>

      <section data-smoke="manual-idea-draft-status" className="avl-card p-5 text-slate-900">
        <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">AI가 채운 초안 상태</div>
        <div className="mt-3 grid gap-3">
          {readinessRows.map(({ label, passed, readyLabel, waitingLabel }) => (
            <div key={label} className="avl-surface-muted p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900">{label}</span>
                <span className={`avl-pill ${passed ? "avl-pill-success" : "avl-pill-neutral"}`}>
                  {passed ? readyLabel : waitingLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
