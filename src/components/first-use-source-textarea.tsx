"use client";

import type { ChangeEvent } from "react";

type FirstUseSourceTextareaProps = {
  onRawIdeaSourceChange: (value: string) => void;
  rawIdeaSource: string;
};

export function FirstUseSourceTextarea({
  onRawIdeaSourceChange,
  rawIdeaSource,
}: FirstUseSourceTextareaProps) {
  function handleSourceChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onRawIdeaSourceChange(event.target.value);
  }

  return (
    <div className="grid gap-2">
      <div
        data-smoke="first-use-short-input-ok"
        className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-950"
      >
        짧아도 됩니다. 회의록 한 줄, GPT 대화 일부, 반복 업무 메모만 넣어도 AI가 후보와 검증 질문으로 정리합니다.
      </div>
      <textarea
        data-smoke="first-use-raw-source"
        value={rawIdeaSource}
        onChange={handleSourceChange}
        rows={12}
        placeholder="예) 고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만들고 있어요. 반복 입력을 줄이고 누락을 확인하는 도구가 필요합니다."
        className="avl-textarea min-h-[280px] leading-7"
      />
    </div>
  );
}
