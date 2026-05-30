"use client";

export const firstUseInputExamples = [
  {
    label: "회의 메모",
    body: "고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만들고 있어요.",
  },
  {
    label: "GPT 대화",
    body: "반복 결제 목록을 정리하는 앱 아이디어를 이야기했는데, 어떤 범위부터 만들지 모르겠습니다.",
  },
  {
    label: "자동화 업무",
    body: "카카오톡, 이메일, 엑셀에 흩어진 요청을 모아 누락 없이 처리하고 싶습니다.",
  },
] as const;

type FirstUseInputExamplesProps = {
  onExampleClick: (source: string) => void;
};

export function FirstUseInputExamples({ onExampleClick }: FirstUseInputExamplesProps) {
  return (
    <div data-smoke="first-use-input-examples" className="grid gap-px bg-slate-200 md:grid-cols-3">
      {firstUseInputExamples.map((example) => (
        <button
          key={example.label}
          type="button"
          onClick={() => onExampleClick(example.body)}
          aria-label={`${example.label} 예시를 입력칸에 넣기`}
          data-smoke="first-use-example-fill"
          className="bg-white px-4 py-3 text-left transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">붙여넣어도 되는 것</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{example.label}</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{example.body}</p>
          <span className="mt-3 block text-xs font-semibold text-blue-700">예시 넣기</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            입력칸만 채우고 단계는 이동하지 않습니다.
          </span>
        </button>
      ))}
    </div>
  );
}
