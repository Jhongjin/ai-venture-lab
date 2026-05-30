import { withKoreanInstrumental, type ProductSurfaceProfile } from "@/lib/product-surface";

type ManualIdeaAiSummaryProps = {
  buyer: string;
  productSurface: Pick<ProductSurfaceProfile, "firstBuild" | "label"> | null;
  selectedBuildDeliveryPhrase: string;
  targetUser: string;
};

export function ManualIdeaAiSummary({
  buyer,
  productSurface,
  selectedBuildDeliveryPhrase,
  targetUser,
}: ManualIdeaAiSummaryProps) {
  return (
    <div data-smoke="manual-idea-ai-summary" className="border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">AI가 먼저 정리한 것</div>
      <div className="mt-3 grid gap-3">
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">저장 기준</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            이름과 한 줄 설명만 비어 있지 않으면 이 단계는 완료됩니다.
          </p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">구매자/대상</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {buyer || targetUser
              ? `${buyer || "구매자 미정"} / ${targetUser || "대상 사용자 미정"}`
              : "AI 초안이 아직 비어 있으면, 저장 뒤 다음 단계에서 다시 구체화해도 됩니다."}
          </p>
        </div>
        <div className="border border-blue-200 bg-blue-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">결과물 형태</div>
          {productSurface ? (
            <>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{productSurface.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{productSurface.firstBuild}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                이 기준이 STEP 2와 제작 패키지까지 이어집니다. 무엇을 만들지 정하는 값입니다.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              이름과 한 줄 설명을 입력하면 AI가 웹 서비스, 모바일 앱, 업무 자동화 중 어떤 형태로 만들지 먼저 추정합니다.
            </p>
          )}
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">개발 방식</div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{selectedBuildDeliveryPhrase}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            실제 연결 파일은 STEP 7에서 받습니다. 여기서는 어디로 넘길지 방향만 저장합니다.
          </p>
          {productSurface ? (
            <p className="mt-1 text-xs leading-5 text-slate-600">
              결정 문장: {withKoreanInstrumental(productSurface.label)} 만들고, {selectedBuildDeliveryPhrase}.
            </p>
          ) : null}
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">다음 액션</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            저장하면 이 초안이 바로 선택되고, 사업성 평가와 첫 검증 계획으로 이어집니다. 결과물 형태와 개발 방식은 다음 단계에서도 분리해 보여줍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
