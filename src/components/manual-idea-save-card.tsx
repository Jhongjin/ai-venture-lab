"use client";

import type { ProductSurfaceProfile } from "@/lib/product-surface";
import { ManualIdeaAiSummary } from "@/components/manual-idea-ai-summary";
import { ManualIdeaFormFields, type ManualIdeaFormValues } from "@/components/manual-idea-form-fields";
import { ManualIdeaReviewChecklist } from "@/components/manual-idea-review-checklist";
import { ManualIdeaSaveHeader } from "@/components/manual-idea-save-header";

type ManualIdeaSaveCardProps = {
  activeOrganizationName: string | null;
  canSave: boolean;
  embedded: boolean;
  form: ManualIdeaFormValues;
  isSaving: boolean;
  onFormChange: (form: ManualIdeaFormValues) => void;
  productSurface: Pick<ProductSurfaceProfile, "firstBuild" | "label"> | null;
  selectedBuildDeliveryPhrase: string;
};

export function ManualIdeaSaveCard({
  activeOrganizationName,
  canSave,
  embedded,
  form,
  isSaving,
  onFormChange,
  productSurface,
  selectedBuildDeliveryPhrase,
}: ManualIdeaSaveCardProps) {
  return (
    <section data-smoke="manual-idea-save-card" className="avl-card p-6 text-slate-900">
      <ManualIdeaSaveHeader
        activeOrganizationName={activeOrganizationName}
        canSave={canSave}
        embedded={embedded}
        isSaving={isSaving}
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <ManualIdeaFormFields form={form} onChange={onFormChange} />

        <div className="grid gap-4">
          <ManualIdeaAiSummary
            buyer={form.buyer}
            productSurface={productSurface}
            selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
            targetUser={form.target_user}
          />

          <ManualIdeaReviewChecklist />
        </div>
      </div>
    </section>
  );
}
