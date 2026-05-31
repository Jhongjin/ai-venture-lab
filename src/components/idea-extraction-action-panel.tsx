"use client";

import { ArrowsClockwise, Sparkle } from "@phosphor-icons/react";

type IdeaExtractionActionPanelProps = {
  hasGeneratedIdeaSlots: boolean;
  hasIdeaSourceInput: boolean;
  isAiExtracting: boolean;
  isGeneratingSample: boolean;
  isReplayingExtraction: boolean;
  onClearInput: () => void;
  onExtractIdeas: () => void;
  onGenerateMoreIdeas: () => void;
  onGenerateSampleIdeas: () => void;
  onReplayExtractionComparison: () => void;
};

export function IdeaExtractionActionPanel({
  hasGeneratedIdeaSlots,
  hasIdeaSourceInput,
  isAiExtracting,
  isGeneratingSample,
  isReplayingExtraction,
  onClearInput,
  onExtractIdeas,
  onGenerateMoreIdeas,
  onGenerateSampleIdeas,
  onReplayExtractionComparison,
}: IdeaExtractionActionPanelProps) {
  const isBusy = isGeneratingSample || isAiExtracting || isReplayingExtraction;

  return (
    <div data-smoke="idea-extraction-action-panel" className="border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-950">AI 정리 작업</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {hasGeneratedIdeaSlots
              ? "킵한 후보는 유지하고, 마음에 들지 않은 후보만 새로 확인한 뒤 한 건으로 정리합니다."
              : hasIdeaSourceInput
                ? "입력칸 내용을 한 건의 검토 아이디어, 결과물 형태, 개발 방식으로 정리합니다."
                : "아이디어가 없으면 AI가 검토할 후보 3개를 먼저 도출합니다."}
          </p>
          {hasGeneratedIdeaSlots ? (
            <p data-smoke="idea-regenerate-does-not-save" className="mt-1 text-xs font-semibold leading-5 text-slate-600">
              다른 후보 더 확인하기는 저장이나 단계 이동 없이 후보만 바꿉니다. 최종 저장은 킵한 후보로 아이디어 정리하기에서만 합니다.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {hasGeneratedIdeaSlots ? (
            <>
              <button
                type="button"
                onClick={onExtractIdeas}
                disabled={isBusy || !hasIdeaSourceInput}
                className="avl-btn avl-btn-primary px-4 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAiExtracting ? <ArrowsClockwise className="animate-spin" size={16} /> : <Sparkle size={16} />}
                {isAiExtracting ? "정리하는 중" : "킵한 후보로 아이디어 정리하기"}
              </button>
              <button
                type="button"
                onClick={onGenerateMoreIdeas}
                disabled={isBusy}
                className="avl-btn avl-btn-secondary px-4 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingSample ? <ArrowsClockwise className="animate-spin" size={15} /> : <ArrowsClockwise size={15} />}
                다른 후보 더 확인하기
              </button>
            </>
          ) : hasIdeaSourceInput ? (
            <button
              type="button"
              onClick={onExtractIdeas}
              disabled={isBusy}
              className="avl-btn avl-btn-primary px-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAiExtracting ? <ArrowsClockwise className="animate-spin" size={16} /> : <Sparkle size={16} />}
              {isAiExtracting ? "정리하는 중" : "이 내용으로 아이디어 정리하기"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onGenerateSampleIdeas}
              disabled={isBusy}
              className="avl-btn avl-btn-primary shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingSample ? <ArrowsClockwise className="animate-spin" size={16} /> : <Sparkle size={16} />}
              {isGeneratingSample ? "도출하는 중" : "AI가 아이디어 도출하기"}
            </button>
          )}
          {hasIdeaSourceInput ? (
            <button
              type="button"
              onClick={onClearInput}
              className="avl-btn avl-btn-subtle px-4 text-slate-600 hover:text-slate-900"
            >
              비우기
            </button>
          ) : null}
        </div>
      </div>

      {hasIdeaSourceInput && !hasGeneratedIdeaSlots ? (
        <details className="mt-3 border-t border-slate-200 pt-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
            필요할 때만 AI 정리 다시 보기
          </summary>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              결과가 어색하거나 빠진 후보가 있어 보일 때만 같은 입력을 한 번 더 점검합니다.
            </p>
            <button
              type="button"
              onClick={onReplayExtractionComparison}
              disabled={isBusy}
              className="avl-btn avl-btn-secondary shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReplayingExtraction ? (
                <ArrowsClockwise className="animate-spin" size={15} />
              ) : (
                <ArrowsClockwise size={15} />
              )}
              {isReplayingExtraction ? "점검하는 중" : "빠진 후보 다시 확인"}
            </button>
          </div>
        </details>
      ) : null}
    </div>
  );
}
