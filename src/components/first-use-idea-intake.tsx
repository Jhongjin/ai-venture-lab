"use client";

import { FirstUseFastPath } from "@/components/first-use-fast-path";
import { FirstUseInputExamples } from "@/components/first-use-input-examples";
import { FirstUseInputStatus } from "@/components/first-use-input-status";
import { FirstUseMoreContext } from "@/components/first-use-more-context";
import { FirstUseResultPreview } from "@/components/first-use-result-preview";
import { FirstUseSourceTextarea } from "@/components/first-use-source-textarea";

type FirstUseIdeaIntakeProps = {
  onRawIdeaSourceChange: (value: string) => void;
  rawIdeaSource: string;
};

export function FirstUseIdeaIntake({ onRawIdeaSourceChange, rawIdeaSource }: FirstUseIdeaIntakeProps) {
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
      <FirstUseResultPreview />
      <FirstUseInputStatus rawIdeaSource={rawIdeaSource} />
      <FirstUseInputExamples onExampleClick={handleExampleClick} />
      <FirstUseSourceTextarea
        onRawIdeaSourceChange={onRawIdeaSourceChange}
        rawIdeaSource={rawIdeaSource}
      />
      <FirstUseMoreContext />
    </div>
  );
}
