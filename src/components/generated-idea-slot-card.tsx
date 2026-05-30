"use client";

import { productSurfaceProfiles, withKoreanInstrumental, type ProductSurfaceKey } from "@/lib/product-surface";

type GeneratedIdeaSlotIdea = {
  firstValidation: string;
  pain: string;
  productSurface?: ProductSurfaceKey;
  solution: string;
  title: string;
};

type GeneratedIdeaSlot = {
  id: string;
  idea: GeneratedIdeaSlotIdea | null;
  kept: boolean;
};

type GeneratedIdeaSlotCardProps = {
  onToggleKeep: (slotId: string) => void;
  selectedBuildDeliveryPhrase: string;
  selectedBuildDeliveryShortLabel: string;
  slot: GeneratedIdeaSlot | undefined;
  slotIndex: number;
};

export function GeneratedIdeaSlotCard({
  onToggleKeep,
  selectedBuildDeliveryPhrase,
  selectedBuildDeliveryShortLabel,
  slot,
  slotIndex,
}: GeneratedIdeaSlotCardProps) {
  const idea = slot?.idea;
  const productSurface = idea?.productSurface ? productSurfaceProfiles[idea.productSurface] : null;
  const productSurfaceLabel = productSurface?.label ?? "웹 서비스";
  const productSurfaceFirstBuild =
    productSurface?.firstBuild ?? "로그인, 입력, 결과 확인, 저장까지 이어지는 첫 제작 흐름";

  return (
    <article
      data-smoke="generated-idea-slot-card"
      className={`flex min-h-[280px] flex-col border p-4 ${
        slot?.kept ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            후보 {slotIndex + 1}
          </div>
          <h4 className="mt-2 break-words text-base font-semibold leading-6 text-slate-950">
            {idea?.title ?? "새 후보 대기"}
          </h4>
        </div>
        {slot ? (
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-950">
            <input
              type="checkbox"
              checked={slot.kept}
              onChange={() => onToggleKeep(slot.id)}
              className="h-4 w-4 accent-slate-950"
            />
            킵
          </label>
        ) : null}
      </div>

      {idea ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="avl-pill avl-pill-brand">{productSurface?.shortLabel ?? "웹 서비스"}</span>
            <span className="avl-pill avl-pill-info">개발 방식 {selectedBuildDeliveryShortLabel}</span>
            {slot?.kept ? <span className="avl-pill avl-pill-success">유지됨</span> : null}
          </div>
          <div
            data-smoke="generated-idea-build-choice"
            className="mt-3 grid gap-2 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600"
          >
            <p className="font-semibold text-slate-950">
              이 후보는 {withKoreanInstrumental(productSurfaceLabel)} 만들고, {selectedBuildDeliveryPhrase}.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  결과물 형태
                </span>
                {productSurfaceLabel} · {productSurfaceFirstBuild}
              </p>
              <p>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  개발 방식
                </span>
                {selectedBuildDeliveryShortLabel} · 실제 연결 파일은 STEP 7에서 받습니다.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
            <p>
              <span className="font-semibold text-slate-950">문제 </span>
              {idea.pain}
            </p>
            <p>
              <span className="font-semibold text-slate-950">해결 </span>
              {idea.solution}
            </p>
            <p>
              <span className="font-semibold text-slate-950">첫 확인 </span>
              {idea.firstValidation}
            </p>
          </div>
          <p className="mt-auto pt-4 text-xs leading-5 text-slate-600">
            {slot?.kept
              ? "다른 후보를 더 확인해도 이 칸은 유지됩니다."
              : "마음에 들면 킵하세요. 아니면 다음 확인 때 이 칸만 바뀝니다."}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          다른 후보 더 확인하기를 누르면 이 칸에 새 아이디어가 들어옵니다.
        </p>
      )}
    </article>
  );
}
