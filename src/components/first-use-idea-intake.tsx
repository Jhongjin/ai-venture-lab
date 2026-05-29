"use client";

import type { ChangeEvent } from "react";

const firstUseInputExamples = [
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

const firstUseFastPathSteps = [
  ["1. 붙여넣기", "회의 메모, GPT 대화, 자동화할 업무를 그대로 넣기"],
  ["2. AI 정리", "후보 3개와 결과물 형태·개발 방식 정리"],
  ["3. 저장 후 열림", "하단 다음 단계 버튼이 열리고 사업성 평가부터 이어짐"],
] as const;

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

type FirstUseIdeaIntakeProps = {
  onRawIdeaSourceChange: (value: string) => void;
  rawIdeaSource: string;
};

export function FirstUseIdeaIntake({ onRawIdeaSourceChange, rawIdeaSource }: FirstUseIdeaIntakeProps) {
  function handleSourceChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onRawIdeaSourceChange(event.target.value);
  }

  return (
    <div className="grid gap-3">
      <div
        data-smoke="first-use-one-sentence"
        className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950"
      >
        <span className="font-semibold text-slate-950">처음이라면 메모를 그대로 붙이고 AI 정리만 누르세요.</span>{" "}
        넣는 것: 메모, 대화, 자동화할 업무. 받는 것: 후보 3개, 결과물 형태, 개발 방식.
      </div>
      <div data-smoke="first-use-fast-path" className="grid gap-px bg-slate-200 md:grid-cols-3">
        {firstUseFastPathSteps.map(([label, body]) => (
          <div key={label} className="bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
          </div>
        ))}
      </div>
      <div
        data-smoke="first-use-current-action"
        className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">지금 할 일</div>
        <p className="mt-1 font-semibold text-slate-950">
          아래 입력칸에 생각나는 말을 그대로 붙입니다. 비워두면 AI가 후보 3개를 먼저 만듭니다.
        </p>
      </div>
      <div data-smoke="first-use-input-examples" className="grid gap-px bg-slate-200 md:grid-cols-3">
        {firstUseInputExamples.map((example) => (
          <div key={example.label} className="bg-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">붙여넣어도 되는 것</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{example.label}</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{example.body}</p>
          </div>
        ))}
      </div>
      <textarea
        value={rawIdeaSource}
        onChange={handleSourceChange}
        rows={12}
        placeholder="예) 고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만들고 있어요. 반복 입력을 줄이고 누락을 확인하는 도구가 필요합니다."
        className="avl-textarea min-h-[280px] leading-7"
      />
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
            <span className="font-semibold text-slate-950">저장 후 받는 결과:</span> 사업성 평가, 리스크, 검증 계획,
            제작 패키지, 외부 개발 도구 전달 자료
          </div>
        </div>
      </details>
    </div>
  );
}
