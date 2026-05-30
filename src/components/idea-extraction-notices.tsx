type IdeaExtractionNoticesProps = {
  duplicateCandidateCount: number;
  extractMessage: string | null;
};

export function IdeaExtractionNotices({ duplicateCandidateCount, extractMessage }: IdeaExtractionNoticesProps) {
  return (
    <>
      {extractMessage ? (
        <div
          data-smoke="idea-extraction-message"
          aria-live="polite"
          role="status"
          className="avl-surface-muted px-4 py-3 text-sm leading-6 text-slate-700"
        >
          {extractMessage}
        </div>
      ) : null}
      {duplicateCandidateCount > 0 ? (
        <div
          data-smoke="idea-extraction-duplicate-warning"
          className="avl-surface-muted border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
        >
          {duplicateCandidateCount}개 아이디어가 기존 기록과 유사합니다. 새로 만들기보다 기존 기록 확장을 먼저
          확인하세요.
        </div>
      ) : null}
    </>
  );
}
