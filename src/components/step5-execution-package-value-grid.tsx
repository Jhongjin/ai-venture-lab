const step5ExecutionPackageValueItems = [
  ["실행 패키지", "기획서, 디자인 기준, 기술 방향, 검증 근거를 개발 시작 기준으로 묶습니다."],
  ["제작 범위 잠금", "첫 버전에 만들 것과 제외할 것을 분리해 다음 작업이 커지지 않게 합니다."],
  ["도구 전달 자료", "Cursor, Codex, Claude Code, Antigravity가 읽을 첫 지시문과 작업 목록으로 이어집니다."],
  ["다음 단계 연결", "저장 후 작업 순서를 만들고, 최종 실행에서 외부 개발 도구 파일로 넘깁니다."],
] as const;

export function Step5ExecutionPackageValueGrid() {
  return (
    <div className="mt-5 grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-4" data-smoke="step5-execution-package-value-grid">
      {step5ExecutionPackageValueItems.map(([label, detail]) => (
        <div key={label} className="bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
        </div>
      ))}
    </div>
  );
}
