"use client";

import { FirstUseIdeaIntake } from "@/components/first-use-idea-intake";
import { GeneratedIdeaGrid } from "@/components/generated-idea-grid";
import type { ProductSurfaceKey } from "@/lib/product-surface";

type IdeaExtractionInputSurfaceIdea = {
  firstValidation: string;
  pain: string;
  productSurface?: ProductSurfaceKey;
  solution: string;
  title: string;
};

type IdeaExtractionInputSurfaceSlot = {
  id: string;
  idea: IdeaExtractionInputSurfaceIdea | null;
  kept: boolean;
};

type IdeaExtractionInputSurfaceProps = {
  generatedIdeaSlots: IdeaExtractionInputSurfaceSlot[];
  hasGeneratedIdeaSlots: boolean;
  onRawIdeaSourceChange: (value: string) => void;
  onToggleGeneratedIdeaKeep: (slotId: string) => void;
  rawIdeaSource: string;
  selectedBuildDeliveryPhrase: string;
  selectedBuildDeliveryShortLabel: string;
};

export function IdeaExtractionInputSurface({
  generatedIdeaSlots,
  hasGeneratedIdeaSlots,
  onRawIdeaSourceChange,
  onToggleGeneratedIdeaKeep,
  rawIdeaSource,
  selectedBuildDeliveryPhrase,
  selectedBuildDeliveryShortLabel,
}: IdeaExtractionInputSurfaceProps) {
  return hasGeneratedIdeaSlots ? (
    <GeneratedIdeaGrid
      onToggleKeep={onToggleGeneratedIdeaKeep}
      selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
      selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
      slots={generatedIdeaSlots}
    />
  ) : (
    <FirstUseIdeaIntake rawIdeaSource={rawIdeaSource} onRawIdeaSourceChange={onRawIdeaSourceChange} />
  );
}
