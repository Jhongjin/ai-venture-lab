"use client";

type ExtractionRunEngine = "openai" | "rules" | "fallback";

type IdeaExtractionStatusGridProps = {
  extractionRunEngine: ExtractionRunEngine | null | undefined;
  extractionRunNote: string | null | undefined;
  hasGeneratedIdeaSlots: boolean;
};

function getExtractionRunStatus(engine: ExtractionRunEngine | null | undefined) {
  if (!engine) {
    return "아직 실행 전";
  }

  if (engine === "openai") {
    return "AI 정리 완료";
  }

  if (engine === "fallback") {
    return "기본 방식으로 정리";
  }

  return "기본 정리 완료";
}

export function IdeaExtractionStatusGrid({
  extractionRunEngine,
  extractionRunNote,
  hasGeneratedIdeaSlots,
}: IdeaExtractionStatusGridProps) {
  return (
    <div data-smoke="idea-extraction-status-grid" className="grid gap-px border-t border-slate-200 bg-slate-200 pt-px md:grid-cols-3">
      <div className="flex min-h-[126px] flex-col bg-slate-50 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">실행 상태</div>
        <div className="mt-2 text-sm font-semibold text-slate-950">
          {getExtractionRunStatus(extractionRunEngine)}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {extractionRunNote ?? "아이디어를 입력하고 AI로 구체화를 실행하면 상태가 표시됩니다."}
        </p>
      </div>
      <div className="flex min-h-[126px] flex-col bg-slate-50 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">개인정보 보호</div>
        <div className="mt-2 text-sm font-semibold text-slate-950">저장 전 자동 가림</div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          연락처, 계좌, 카드번호처럼 보이는 내용은 저장 전에 자동으로 가립니다.
        </p>
      </div>
      <div className="flex min-h-[126px] flex-col bg-white px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">후보 탐색</div>
        <div className="mt-2 text-sm font-semibold text-slate-950">
          {hasGeneratedIdeaSlots ? "킵한 후보는 유지" : "다른 후보 더 확인"}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {hasGeneratedIdeaSlots
            ? "다른 후보를 더 확인하면 킵하지 않은 칸만 새 후보로 바뀝니다."
            : "결과가 어색하거나 빠진 후보가 있을 때 입력칸 아래 버튼으로 다시 점검합니다."}
        </p>
      </div>
    </div>
  );
}
