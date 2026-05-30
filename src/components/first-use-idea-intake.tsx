"use client";

import type { ChangeEvent } from "react";

import { FirstUseFastPath } from "@/components/first-use-fast-path";
import { FirstUseInputExamples, firstUseInputExamples } from "@/components/first-use-input-examples";
import { FirstUseMoreContext } from "@/components/first-use-more-context";

type FirstUseIdeaIntakeProps = {
  onRawIdeaSourceChange: (value: string) => void;
  rawIdeaSource: string;
};

export function FirstUseIdeaIntake({ onRawIdeaSourceChange, rawIdeaSource }: FirstUseIdeaIntakeProps) {
  const selectedInputExample = firstUseInputExamples.find((example) => example.body === rawIdeaSource.trim());
  const hasRawIdeaSource = rawIdeaSource.trim().length > 0;

  function handleSourceChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onRawIdeaSourceChange(event.target.value);
  }

  function handleExampleClick(source: string) {
    onRawIdeaSourceChange(source);
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
      <FirstUseFastPath />
      <div
        data-smoke="first-use-current-action"
        className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">지금 할 일</div>
        <p className="mt-1 font-semibold text-slate-950">
          아래 입력칸에 생각나는 말을 그대로 붙입니다. 비워두면 AI가 후보 3개를 먼저 만듭니다.
        </p>
      </div>
      <FirstUseInputExamples onExampleClick={handleExampleClick} />
      {hasRawIdeaSource ? (
        <div
          data-smoke="first-use-input-ready"
          className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">입력 준비 완료</div>
          <p className="mt-1 font-semibold text-slate-950">
            {selectedInputExample ? `${selectedInputExample.label} 예시가 입력됐습니다.` : "입력칸에 메모가 들어왔습니다."} 이제
            아래 이 내용으로 아이디어 정리하기 버튼을 누르면 AI가 후보 3개를 정리합니다.
          </p>
        </div>
      ) : null}
      <textarea
        data-smoke="first-use-raw-source"
        value={rawIdeaSource}
        onChange={handleSourceChange}
        rows={12}
        placeholder="예) 고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만들고 있어요. 반복 입력을 줄이고 누락을 확인하는 도구가 필요합니다."
        className="avl-textarea min-h-[280px] leading-7"
      />
      <FirstUseMoreContext />
    </div>
  );
}
