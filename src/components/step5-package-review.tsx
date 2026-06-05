import type { ChangeEvent } from "react";

type Step5SummaryCard = {
  detail: string;
  label: string;
  value: string;
};

type Step5BridgeCard = {
  items: ReadonlyArray<string>;
  label: string;
};

type Step5PackageReviewProps = {
  bridgeCards: ReadonlyArray<Step5BridgeCard>;
  note: string;
  onNoteChange: (value: string) => void;
  summaryCards: ReadonlyArray<Step5SummaryCard>;
};

const step5ReviewFocusItems = [
  ["만들 것", "결과물/개발 방식"],
  ["범위", "포함/제외"],
  ["첫 작업", "T-001"],
] as const;

export function Step5PackageReview({ bridgeCards, note, onNoteChange, summaryCards }: Step5PackageReviewProps) {
  function handleNoteChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onNoteChange(event.target.value);
  }

  return (
    <div className="mt-5 grid gap-4">
      <div className="border border-slate-200 bg-slate-50 p-4">
        <div className="avl-kicker">지금 확인할 것</div>
        <h4 className="mt-2 text-base font-semibold text-slate-950">3개만 확인</h4>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          맞으면 저장.
        </p>
        <div data-smoke="step5-review-save-focus" className="mt-3 grid gap-px bg-blue-200 md:grid-cols-3">
          {step5ReviewFocusItems.map(([label, detail]) => (
            <div key={label} className="bg-white px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
            </div>
          ))}
        </div>
        <div
          data-smoke="step5-save-does-not-move"
          className="mt-3 border border-blue-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
        >
          저장해도 이동하지 않습니다. 이동은 하단 다음 버튼입니다.
        </div>
        <details data-smoke="step5-review-details-optional" className="mt-4">
          <summary className="cursor-pointer border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950">
            요약 보기
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <div key={card.label} className="border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{card.label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{card.value}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>
        </details>
        <details data-smoke="step5-review-bridge-optional" className="mt-3">
          <summary className="cursor-pointer border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950">
            연결 보기
          </summary>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {bridgeCards.map((card) => (
              <div key={card.label} className="border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{card.label}</div>
                <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-700">
                  {card.items.map((item) => (
                    <li key={item} className="border-l border-slate-200 pl-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="border border-slate-200 bg-white p-4">
        <label className="text-sm font-semibold text-slate-950" htmlFor="development-auto-note">
          보완 메모
        </label>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          바꿀 점만 적으세요. 없으면 비워둡니다.
        </p>
        <textarea
          id="development-auto-note"
          value={note}
          onChange={handleNoteChange}
          rows={5}
          className="avl-textarea mt-3"
          placeholder="예) 결제와 관리자 화면은 빼고, 입력/저장/조회만 먼저 확인합니다."
        />
      </div>
    </div>
  );
}
