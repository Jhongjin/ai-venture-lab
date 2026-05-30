"use client";

import { GeneratedIdeaSlotCard } from "@/components/generated-idea-slot-card";
import type { ProductSurfaceKey } from "@/lib/product-surface";

type GeneratedIdeaGridIdea = {
  firstValidation: string;
  pain: string;
  productSurface?: ProductSurfaceKey;
  solution: string;
  title: string;
};

type GeneratedIdeaGridSlot = {
  id: string;
  idea: GeneratedIdeaGridIdea | null;
  kept: boolean;
};

type GeneratedIdeaGridProps = {
  onToggleKeep: (slotId: string) => void;
  selectedBuildDeliveryPhrase: string;
  selectedBuildDeliveryShortLabel: string;
  slots: GeneratedIdeaGridSlot[];
};

const generatedIdeaGridSlotIndexes = [0, 1, 2] as const;

export function GeneratedIdeaGrid({
  onToggleKeep,
  selectedBuildDeliveryPhrase,
  selectedBuildDeliveryShortLabel,
  slots,
}: GeneratedIdeaGridProps) {
  return (
    <div data-smoke="generated-idea-grid" className="grid min-h-[280px] gap-3 lg:grid-cols-3">
      {generatedIdeaGridSlotIndexes.map((slotIndex) => (
        <GeneratedIdeaSlotCard
          key={slots[slotIndex]?.id ?? `generated-slot-${slotIndex}`}
          onToggleKeep={onToggleKeep}
          selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
          selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
          slot={slots[slotIndex]}
          slotIndex={slotIndex}
        />
      ))}
    </div>
  );
}
