"use client";

import {
  buildDeliveryModeLabels,
  externalBuildToolOrder,
  externalBuildToolProfiles,
  normalizeBuildDeliveryPreference,
  type BuildDeliveryMode,
  type BuildDeliveryPreference,
  type ExternalBuildToolKey,
} from "@/lib/build-delivery";
import {
  buildableProductSurfaceOrder,
  productSurfaceProfiles,
  type ProductSurfaceKey,
  type ProductSurfaceProfile,
  withKoreanInstrumental,
} from "@/lib/product-surface";

type RecommendedIdeaBuildDirectionProps = {
  buildDeliveryPreference: BuildDeliveryPreference;
  onBuildDeliveryPreferenceChange: (preference: BuildDeliveryPreference) => void;
  onProductSurfaceChange: (value: ProductSurfaceKey) => void;
  productSurface: Pick<ProductSurfaceProfile, "firstBuild" | "key" | "label">;
};

export function RecommendedIdeaBuildDirection({
  buildDeliveryPreference,
  onBuildDeliveryPreferenceChange,
  onProductSurfaceChange,
  productSurface,
}: RecommendedIdeaBuildDirectionProps) {
  const selectedExternalBuildTool = externalBuildToolProfiles[buildDeliveryPreference.externalTool];
  const buildDirectionSentence =
    buildDeliveryPreference.mode === "external_tool"
      ? `${withKoreanInstrumental(productSurface.label)} 만들고, ${withKoreanInstrumental(selectedExternalBuildTool.label)} 개발합니다.`
      : `${withKoreanInstrumental(productSurface.label)} 만들고, Venture Lab 내부 제작으로 이어갑니다.`;

  return (
    <div data-smoke="recommended-build-direction" className="mt-4 grid gap-3">
      <div
        data-smoke="recommended-build-direction-sentence"
        className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">저장될 제작 방향</div>
        <p className="mt-1 font-semibold text-slate-950">{buildDirectionSentence}</p>
        <p className="mt-1 text-sm text-emerald-900">
          결과물 형태는 무엇을 만들지, 개발 방식은 어디서 만들지를 정합니다. 실제 연결 파일은 STEP 7에서만 받습니다.
        </p>
      </div>
      <div data-smoke="recommended-product-surface" className="border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">결과물 형태</div>
        <div className="mt-2 text-base font-semibold text-slate-950">{productSurface.label}</div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{productSurface.firstBuild}</p>
        <label className="mt-3 grid gap-2 text-sm font-semibold text-slate-900">
          결과물 형태 확인
          <select
            value={productSurface.key}
            onChange={(event) => onProductSurfaceChange(event.target.value as ProductSurfaceKey)}
            className="h-10 cursor-pointer border border-blue-200 bg-white px-3 text-sm font-semibold text-slate-950"
          >
            {buildableProductSurfaceOrder.map((key) => (
              <option key={key} value={key}>
                {productSurfaceProfiles[key].label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          이 기준이 사업성 평가, 디자인 방향, 기술 스택, 제작 패키지까지 이어집니다.
        </p>
      </div>

      <div data-smoke="recommended-build-delivery" className="border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="grid gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">개발 방식</div>
            <h4 className="mt-2 text-base font-semibold text-slate-950">어디서 개발할지도 처음에 정합니다</h4>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              지금은 방향만 저장합니다. 실제 패키지 파일 받기와 외부 도구 연동은 모든 검증과 제작 준비가 끝난
              마지막 단계에서 열립니다.
            </p>
          </div>
          <span className="avl-pill avl-pill-neutral w-fit">
            {buildDeliveryModeLabels[buildDeliveryPreference.mode]}
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-2">
            {(["external_tool", "venture_lab"] as BuildDeliveryMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  onBuildDeliveryPreferenceChange(normalizeBuildDeliveryPreference({ ...buildDeliveryPreference, mode }))
                }
                className={`min-w-0 border px-4 py-3 text-left text-sm ${
                  buildDeliveryPreference.mode === mode
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-900"
                }`}
              >
                <span className="block font-semibold">{buildDeliveryModeLabels[mode]}</span>
                <span
                  className={`mt-1 block leading-5 ${
                    buildDeliveryPreference.mode === mode ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  {mode === "external_tool"
                    ? "마지막 단계에서 선택 도구용 패키지와 연동 자료를 받습니다."
                    : "추후 Venture Lab 내부 개발 도구로 이어갑니다."}
                </span>
              </button>
            ))}
          </div>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-900">
            사용할 개발 도구
            <select
              value={buildDeliveryPreference.externalTool}
              disabled={buildDeliveryPreference.mode !== "external_tool"}
              onChange={(event) =>
                onBuildDeliveryPreferenceChange(
                  normalizeBuildDeliveryPreference({
                    ...buildDeliveryPreference,
                    externalTool: event.target.value as ExternalBuildToolKey,
                  }),
                )
              }
              className="h-11 cursor-pointer border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {externalBuildToolOrder.map((key) => (
                <option key={key} value={key}>
                  {externalBuildToolProfiles[key].label}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal leading-5 text-slate-500">
              {buildDeliveryPreference.mode === "external_tool"
                ? selectedExternalBuildTool.description
                : "내부 개발을 선택하면 외부 도구 코드는 최종 패키지의 보조 정보로만 남습니다."}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
