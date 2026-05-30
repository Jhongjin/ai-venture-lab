"use client";

const firstUseBuildChoiceSplitItems = [
  {
    label: "무엇을 만들지",
    title: "결과물 형태",
    body: "웹 서비스, 모바일 앱, 랜딩/웹사이트, 업무 자동화, 운영 콘솔 중 하나로 정리됩니다.",
  },
  {
    label: "어떻게 만들지",
    title: "개발 방식",
    body: "Cursor, Codex, Claude Code, Antigravity 같은 외부 개발 도구 또는 내부 진행으로 나뉩니다.",
  },
] as const;

const firstUseOperatorRoleItems = [
  {
    label: "AI가 먼저",
    title: "후보와 판단 자료 정리",
    body: "사업성, 리스크, 검증 질문, 제작 패키지 기준을 초안으로 만듭니다.",
  },
  {
    label: "사용자는",
    title: "한 건 확인하고 저장",
    body: "맞는 후보를 고르고 필요한 말만 고친 뒤 저장합니다.",
  },
  {
    label: "다음에는",
    title: "하단 다음 단계만 누르기",
    body: "저장 완료 후 다음 단계 버튼이 열립니다.",
  },
] as const;

export function FirstUseMoreContext() {
  return (
    <details data-smoke="first-use-more-context" className="border border-slate-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950">
        AI가 만들 결과와 저장 후 흐름 보기
      </summary>
      <div className="grid gap-3 border-t border-slate-200 p-4">
        <div
          data-smoke="first-use-ai-output-preview"
          className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
        >
          <span className="font-semibold text-slate-950">AI 정리 결과:</span> 아이디어 후보 3개, 결과물 형태, 개발 방식,
          첫 검증 질문이 먼저 나옵니다. 사용자는 한 건만 확인하고 저장하면 됩니다.
        </div>
        <div data-smoke="first-use-operator-role" className="grid gap-px bg-blue-200 md:grid-cols-3">
          {firstUseOperatorRoleItems.map((item) => (
            <div key={item.label} className="bg-white px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{item.label}</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{item.title}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
        <div data-smoke="first-use-build-choice-split" className="grid gap-px bg-slate-200 md:grid-cols-2">
          {firstUseBuildChoiceSplitItems.map((item) => (
            <div key={item.label} className="bg-white px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{item.title}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
        <div
          data-smoke="first-use-build-contract"
          className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
        >
          <span className="font-semibold text-slate-950">예시:</span> 모바일 앱으로 만들고, Cursor로 개발합니다.
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            결과물 형태와 개발 방식은 따로 저장되고, 실제 연결 파일은 STEP 7에서 받습니다.
          </span>
        </div>
        <div
          data-smoke="first-use-output-path"
          className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
        >
          <span className="font-semibold text-slate-950">저장 후 받는 결과:</span> 사업성 평가, 리스크, 검증 계획, 제작
          패키지, 외부 개발 도구 전달 자료
        </div>
      </div>
    </details>
  );
}
