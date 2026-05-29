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

export function Step5PackageReview({ bridgeCards, note, onNoteChange, summaryCards }: Step5PackageReviewProps) {
  function handleNoteChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onNoteChange(event.target.value);
  }

  return (
    <div className="mt-5 grid gap-4">
      <div className="border border-slate-200 bg-slate-50 p-4">
        <div className="avl-kicker">정리된 내용 확인</div>
        <h4 className="mt-2 text-base font-semibold text-slate-950">저장 전 확인할 핵심 내용</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <div key={card.label} className="border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{card.label}</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{card.value}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
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
      </div>

      <div className="border border-slate-200 bg-white p-4">
        <label className="text-sm font-semibold text-slate-950" htmlFor="development-auto-note">
          추가로 남길 내용
        </label>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          다음 작업자가 꼭 알아야 할 내용이 있으면 적으세요. 없으면 비워둬도 됩니다.
        </p>
        <textarea
          id="development-auto-note"
          value={note}
          onChange={handleNoteChange}
          rows={7}
          className="avl-textarea mt-3"
          placeholder="예) 이번 제작에서는 결제와 관리자 화면은 제외하고, 입력/저장/조회 흐름만 먼저 확인합니다."
        />
      </div>

      <p className="text-sm leading-6 text-slate-600">보완할 내용이 없다면 메모는 비워둔 채 바로 저장하면 됩니다.</p>
    </div>
  );
}
