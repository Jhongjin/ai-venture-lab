"use client";

import type { BuildDeliveryPreference } from "@/lib/build-delivery";
import type { ProductSurfaceKey, ProductSurfaceProfile } from "@/lib/product-surface";
import { RecommendedIdeaActions } from "@/components/recommended-idea-actions";
import { RecommendedIdeaBuildDirection } from "@/components/recommended-idea-build-direction";
import { RecommendedIdeaDecisionBanner } from "@/components/recommended-idea-decision-banner";
import { RecommendedIdeaHeader } from "@/components/recommended-idea-header";
import { RecommendedIdeaInsightGrid } from "@/components/recommended-idea-insight-grid";
import { RecommendedIdeaMetrics } from "@/components/recommended-idea-metrics";
import { RecommendedIdeaRationale } from "@/components/recommended-idea-rationale";

type RecommendedIdeaCardIdea = {
  id: string;
  name: string;
  one_liner: string;
  productSurface: ProductSurfaceProfile;
  validationRationale: string;
  validationScore: number;
};

type RecommendedIdeaCardProps = {
  buildDeliveryLabel: string;
  buildDeliveryPhrase: string;
  buildDeliveryPreference: BuildDeliveryPreference;
  canSave: boolean;
  gateBadgeClassName?: string | null;
  gateLabel?: string | null;
  gateNextAction?: string | null;
  gateSummary?: string | null;
  idea: RecommendedIdeaCardIdea;
  isSaveLocked: boolean;
  isSaving: boolean;
  onBuildDeliveryPreferenceChange: (preference: BuildDeliveryPreference) => void;
  onEdit: () => void;
  onProductSurfaceChange: (value: ProductSurfaceKey) => void;
  onSave: () => void;
  readinessScore: number;
  strategyScore: number;
};

export function RecommendedIdeaCard({
  buildDeliveryLabel,
  buildDeliveryPhrase,
  buildDeliveryPreference,
  canSave,
  gateBadgeClassName,
  gateLabel,
  gateNextAction,
  gateSummary,
  idea,
  isSaveLocked,
  isSaving,
  onBuildDeliveryPreferenceChange,
  onEdit,
  onProductSurfaceChange,
  onSave,
  readinessScore,
  strategyScore,
}: RecommendedIdeaCardProps) {
  return (
    <section data-smoke="recommended-idea-card" className="border border-slate-200 bg-white p-4">
      <RecommendedIdeaHeader
        gateBadgeClassName={gateBadgeClassName}
        gateLabel={gateLabel}
        name={idea.name}
        oneLiner={idea.one_liner}
      />
      <RecommendedIdeaMetrics
        buildDeliveryLabel={buildDeliveryLabel}
        productSurfaceShortLabel={idea.productSurface.shortLabel}
        readinessScore={readinessScore}
        strategyScore={strategyScore}
        validationScore={idea.validationScore}
      />
      <RecommendedIdeaDecisionBanner
        buildDeliveryPhrase={buildDeliveryPhrase}
        productSurfaceLabel={idea.productSurface.label}
      />
      <RecommendedIdeaBuildDirection
        buildDeliveryPreference={buildDeliveryPreference}
        onBuildDeliveryPreferenceChange={onBuildDeliveryPreferenceChange}
        onProductSurfaceChange={onProductSurfaceChange}
        productSurface={idea.productSurface}
      />
      <RecommendedIdeaRationale
        nextAction={gateNextAction}
        summary={gateSummary ?? idea.validationRationale}
      />
      <RecommendedIdeaInsightGrid productSurfaceLabel={idea.productSurface.label} />
      <RecommendedIdeaActions
        canSave={canSave}
        isSaveLocked={isSaveLocked}
        isSaving={isSaving}
        onEdit={onEdit}
        onSave={onSave}
      />
    </section>
  );
}
