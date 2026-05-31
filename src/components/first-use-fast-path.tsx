"use client";

const firstUseFastPathSteps = [
  ["1. 붙여넣기", "회의 메모, GPT 대화, 자동화할 업무를 그대로 넣기"],
  ["2. 버튼 누르기", "이 내용으로 아이디어 정리하기로 후보 3개와 결과물 형태·개발 방식 받기"],
  ["3. 저장 후 열림", "하단 다음 단계 버튼이 열리고 사업성 평가부터 이어짐"],
] as const;

export function FirstUseFastPath() {
  return (
    <div data-smoke="first-use-fast-path" className="grid gap-px bg-slate-200 md:grid-cols-3">
      {firstUseFastPathSteps.map(([label, body]) => (
        <div key={label} className="bg-slate-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
        </div>
      ))}
    </div>
  );
}
