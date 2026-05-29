"use client";

import type { BuildDeliveryMode, ExternalBuildToolKey, ExternalBuildToolProfile } from "@/lib/build-delivery";
import { externalBuildToolOrder, externalBuildToolProfiles } from "@/lib/build-delivery";
import type { ProductSurfaceProfile } from "@/lib/product-surface";

type FinalExecutionReadinessSummaryProps = {
  activeBuildDeliveryLabel: string;
  activeExternalBuildTool: Pick<ExternalBuildToolProfile, "automationLabel" | "key" | "label">;
  activeProductSurface: Pick<ProductSurfaceProfile, "firstBuild" | "label">;
  buildDeliveryMode: BuildDeliveryMode;
  hasFinalExternalToolOverride: boolean;
  onSelectExternalTool: (toolKey: ExternalBuildToolKey) => void;
};

export function FinalExecutionReadinessSummary({
  activeBuildDeliveryLabel,
  activeExternalBuildTool,
  activeProductSurface,
  buildDeliveryMode,
  hasFinalExternalToolOverride,
  onSelectExternalTool,
}: FinalExecutionReadinessSummaryProps) {
  return (
    <div data-smoke="final-execution-readiness-summary" className="grid gap-3 md:grid-cols-3">
      <div className="border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">준비 상태</div>
        <div className="mt-2 text-base font-semibold text-slate-950">실행 준비 완료</div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          제작 패키지와 작업 순서가 준비되어 선택한 개발 방식으로 넘길 수 있습니다.
        </p>
      </div>
      <div className="border border-slate-200 bg-white p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">결과물 형태</div>
        <div className="mt-2 text-base font-semibold text-slate-950">{activeProductSurface.label}</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{activeProductSurface.firstBuild}</p>
      </div>
      <div className="border border-slate-200 bg-white p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">개발 방식</div>
        <div className="mt-2 text-base font-semibold text-slate-950">{activeBuildDeliveryLabel}</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {buildDeliveryMode === "external_tool"
            ? `${activeExternalBuildTool.label} 기준으로 패키지와 시작 순서를 준비했습니다. ${activeExternalBuildTool.automationLabel} 방식입니다.`
            : "Venture Lab 내부 개발 도구로 이어질 준비 자료를 묶었습니다."}
        </p>
        {buildDeliveryMode === "external_tool" ? (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">사용할 개발 도구</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {externalBuildToolOrder.map((toolKey) => {
                const tool = externalBuildToolProfiles[toolKey];
                const selected = activeExternalBuildTool.key === toolKey;

                return (
                  <button
                    key={tool.key}
                    type="button"
                    onClick={() => onSelectExternalTool(tool.key)}
                    className={`avl-btn h-9 px-3 text-xs shadow-none ${
                      selected ? "avl-btn-primary" : "avl-btn-secondary"
                    }`}
                  >
                    {tool.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {hasFinalExternalToolOverride
                ? `이번 최종 전달 파일은 ${activeExternalBuildTool.label} 기준으로 다시 만듭니다. 저장된 이전 선택은 바꾸지 않습니다.`
                : "STEP 1에서 저장한 도구가 기본값입니다. 최종 전달 직전에 다른 도구로 바꿔 받을 수 있습니다."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
