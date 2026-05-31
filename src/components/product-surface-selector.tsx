"use client";

import {
  buildableProductSurfaceOrder,
  productSurfaceProfiles,
  type ProductSurfaceKey,
  type ProductSurfaceProfile,
} from "@/lib/product-surface";

type ProductSurfaceSelectorProps = {
  activeProductSurface: ProductSurfaceProfile;
  canEdit: boolean;
  onProductSurfaceChange: (value: ProductSurfaceKey) => void;
};

export function ProductSurfaceSelector({
  activeProductSurface,
  canEdit,
  onProductSurfaceChange,
}: ProductSurfaceSelectorProps) {
  return (
    <div data-smoke="product-surface-selector" className="mt-4 border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">결과물 형태</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        AI가 이 아이디어를 웹 서비스, 모바일 앱, 랜딩/웹사이트, 업무 자동화, 운영 콘솔 중 어떤 결과물로 만들지
        먼저 정합니다. Cursor, Codex 같은 개발 도구는 개발 방식으로 따로 저장됩니다.
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-blue-950">
        예: 모바일 앱으로 만들고, Cursor로 개발합니다. 이 화면에서는 앞부분인 결과물 형태만 확인합니다.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <label className="grid gap-2 text-sm font-semibold text-slate-900">
          AI가 추천한 결과물 형태
          <select
            value={activeProductSurface.key}
            disabled={!canEdit}
            onChange={(event) => onProductSurfaceChange(event.target.value as ProductSurfaceKey)}
            className="h-11 cursor-pointer border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {buildableProductSurfaceOrder.map((key) => (
              <option key={key} value={key}>
                {productSurfaceProfiles[key].label}
              </option>
            ))}
          </select>
        </label>
        <div className="border border-slate-200 bg-slate-50 p-4">
          <div className="text-base font-semibold text-slate-950">{activeProductSurface.label}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeProductSurface.description}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeProductSurface.harnessFocus}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            다르게 보이면 이 항목만 바꾼 뒤 저장하세요. 이후 모든 제작 문서가 이 기준을 따라갑니다.
          </p>
        </div>
      </div>
    </div>
  );
}
