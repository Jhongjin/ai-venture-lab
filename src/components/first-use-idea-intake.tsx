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
        <span className="font-semibold text-slate-950">
          처음이라면 메모를 그대로 붙이고 이 내용으로 아이디어 정리하기만 누르세요.
        </span>{" "}
        넣는 것: 메모, 대화, 자동화할 업무. 받는 것: 후보 3개, 결과물 형태, 개발 방식, 첫 검증 질문.
      </div>
      <FirstUseInputStatus rawIdeaSource={rawIdeaSource} />
      <FirstUseSourceTextarea
        onRawIdeaSourceChange={onRawIdeaSourceChange}
        rawIdeaSource={rawIdeaSource}
      />
      <FirstUseInputExamples onExampleClick={handleExampleClick} />
      <FirstUseFastPath />
      <FirstUseResultPreview />
      <div
        data-smoke="first-use-final-output"
        className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-950"
      >
        최종 결과: 저장한 후보는 사업성 평가, 검증 계획, 제작 패키지, 작업 순서, STEP 7 연결 파일까지 이어집니다.
        처음에는 후보 한 건만 저장하면 됩니다.
      </div>
      <FirstUseMoreContext />
    </div>
  );
}
