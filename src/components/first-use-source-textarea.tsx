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
    <textarea
      data-smoke="first-use-raw-source"
      value={rawIdeaSource}
      onChange={handleSourceChange}
      rows={12}
      placeholder="예) 고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만들고 있어요. 반복 입력을 줄이고 누락을 확인하는 도구가 필요합니다."
      className="avl-textarea min-h-[280px] leading-7"
    />
  );
}
