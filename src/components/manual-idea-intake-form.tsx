"use client";

import type { FormEvent } from "react";
import type { ProductSurfaceProfile } from "@/lib/product-surface";
import { ManualIdeaSaveCard } from "@/components/manual-idea-save-card";
import { ManualIdeaSaveReadiness } from "@/components/manual-idea-save-readiness";
import type { ManualIdeaFormValues } from "@/components/manual-idea-form-fields";

type ManualIdeaIntakeFormProps = {
  activeOrganizationName: string | null;
  activeTask: "auth" | "workspace" | "extract" | "idea";
  canSave: boolean;
  embedded: boolean;
  form: ManualIdeaFormValues;
  isSaving: boolean;
  onFormChange: (form: ManualIdeaFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  productSurface: Pick<ProductSurfaceProfile, "firstBuild" | "label"> | null;
  saveMessage: string | null;
  selectedBuildDeliveryPhrase: string;
};

export function ManualIdeaIntakeForm({
  activeOrganizationName,
  activeTask,
  canSave,
  embedded,
  form,
  isSaving,
  onFormChange,
  onSubmit,
  productSurface,
  saveMessage,
  selectedBuildDeliveryPhrase,
}: ManualIdeaIntakeFormProps) {
  return (
    <form onSubmit={onSubmit} className={`grid gap-5 ${activeTask === "idea" ? "" : "hidden"}`}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_340px]">
        <ManualIdeaSaveCard
          activeOrganizationName={activeOrganizationName}
          canSave={canSave}
          embedded={embedded}
          form={form}
          isSaving={isSaving}
          onFormChange={onFormChange}
          productSurface={productSurface}
          selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
        />

        <ManualIdeaSaveReadiness
          hasAudienceDraft={Boolean(form.buyer && form.target_user)}
          hasEvidenceNotes={Boolean(form.signal || form.risk_summary || form.next_evidence)}
          hasRequiredFields={Boolean(form.name && form.one_liner)}
        />
      </div>

      {saveMessage ? <p className="text-sm leading-6 text-slate-600">{saveMessage}</p> : null}
    </form>
  );
}
