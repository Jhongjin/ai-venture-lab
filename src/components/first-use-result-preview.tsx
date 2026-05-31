"use client";

const firstUseResultPreviewItems = [
  {
    label: "후보",
    title: "AI 아이디어 후보 3개",
    body: "AI가 사업 후보로 나누고, 좋은 후보는 킵하고 나머지만 다시 볼 수 있습니다.",
  },
  {
    label: "제작 방향",
    title: "결과물 형태와 개발 방식",
    body: "무엇을 만들지는 결과물 형태, 어디서 만들지는 개발 방식으로 따로 보여줍니다.",
  },
  {
    label: "저장 후",
    title: "저장 후 사업성 평가로 이어짐",
    body: "후보 한 건을 저장하면 STEP 2가 열립니다. 저장 완료 전에는 다음 단계 버튼이 잠긴 상태로 유지됩니다.",
  },
] as const;

export function FirstUseResultPreview() {
  return (
    <div data-smoke="first-use-result-preview" className="grid gap-px bg-blue-200 md:grid-cols-3">
      {firstUseResultPreviewItems.map((item) => (
        <div key={item.label} className="bg-white px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{item.label}</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{item.title}</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
