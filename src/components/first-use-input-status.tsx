"use client";

import { firstUseInputExamples } from "@/components/first-use-input-examples";

type FirstUseInputStatusProps = {
  rawIdeaSource: string;
};

export function FirstUseInputStatus({ rawIdeaSource }: FirstUseInputStatusProps) {
  const selectedInputExample = firstUseInputExamples.find((example) => example.body === rawIdeaSource.trim());
  const hasRawIdeaSource = rawIdeaSource.trim().length > 0;

  return (
    <>
      <div
        data-smoke="first-use-current-action"
        className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">지금 할 일</div>
        <p className="mt-1 font-semibold text-slate-950">
          아래 입력칸에 생각나는 말을 그대로 붙입니다. 비워두면 AI가 후보 3개를 먼저 만듭니다.
        </p>
      </div>
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
    </>
  );
}
