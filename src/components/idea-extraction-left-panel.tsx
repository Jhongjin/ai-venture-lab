"use client";

import { IdeaExtractionActionPanel } from "@/components/idea-extraction-action-panel";
import { IdeaExtractionFlowSteps } from "@/components/idea-extraction-flow-steps";
import { IdeaExtractionInputSurface } from "@/components/idea-extraction-input-surface";
import { IdeaExtractionNotices } from "@/components/idea-extraction-notices";
import { IdeaExtractionWorkAreaHeader } from "@/components/idea-extraction-work-area-header";
import type { ProductSurfaceKey } from "@/lib/product-surface";

type IdeaExtractionLeftPanelIdea = {
  firstValidation: string;
  pain: string;
  productSurface?: ProductSurfaceKey;
  solution: string;
  title: string;
};

type IdeaExtractionLeftPanelSlot = {
  id: string;
  idea: IdeaExtractionLeftPanelIdea | null;
  kept: boolean;
};

type IdeaExtractionLeftPanelProps = {
  duplicateCandidateCount: number;
  extractMessage: string | null;
  filledGeneratedIdeaCount: number;
  generatedIdeaSlots: IdeaExtractionLeftPanelSlot[];
  hasGeneratedIdeaSlots: boolean;
  hasIdeaSourceInput: boolean;
  isAiExtracting: boolean;
  isGeneratingSample: boolean;
  isReplayingExtraction: boolean;
  keptGeneratedIdeaCount: number;
  onClearInput: () => void;
  onExtractIdeas: () => void;
  onGenerateMoreIdeas: () => void;
  onGenerateSampleIdeas: () => void;
  onRawIdeaSourceChange: (value: string) => void;
  onReplayExtractionComparison: () => void;
  onToggleGeneratedIdeaKeep: (slotId: string) => void;
  rawIdeaSource: string;
  selectedBuildDeliveryPhrase: string;
  selectedBuildDeliveryShortLabel: string;
  trimmedIdeaSourceLength: number;
};

export function IdeaExtractionLeftPanel({
  duplicateCandidateCount,
  extractMessage,
  filledGeneratedIdeaCount,
  generatedIdeaSlots,
  hasGeneratedIdeaSlots,
  hasIdeaSourceInput,
  isAiExtracting,
  isGeneratingSample,
  isReplayingExtraction,
  keptGeneratedIdeaCount,
  onClearInput,
  onExtractIdeas,
  onGenerateMoreIdeas,
  onGenerateSampleIdeas,
  onRawIdeaSourceChange,
  onReplayExtractionComparison,
  onToggleGeneratedIdeaKeep,
  rawIdeaSource,
  selectedBuildDeliveryPhrase,
  selectedBuildDeliveryShortLabel,
  trimmedIdeaSourceLength,
}: IdeaExtractionLeftPanelProps) {
  return (
    <div data-smoke="idea-extraction-left-panel" className="grid gap-3">
      <IdeaExtractionWorkAreaHeader
        filledGeneratedIdeaCount={filledGeneratedIdeaCount}
        hasGeneratedIdeaSlots={hasGeneratedIdeaSlots}
        hasIdeaSourceInput={hasIdeaSourceInput}
        keptGeneratedIdeaCount={keptGeneratedIdeaCount}
        trimmedIdeaSourceLength={trimmedIdeaSourceLength}
      />
      <IdeaExtractionInputSurface
        generatedIdeaSlots={generatedIdeaSlots}
        hasGeneratedIdeaSlots={hasGeneratedIdeaSlots}
        onRawIdeaSourceChange={onRawIdeaSourceChange}
        onToggleGeneratedIdeaKeep={onToggleGeneratedIdeaKeep}
        rawIdeaSource={rawIdeaSource}
        selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
        selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
      />
      <IdeaExtractionActionPanel
        hasGeneratedIdeaSlots={hasGeneratedIdeaSlots}
        hasIdeaSourceInput={hasIdeaSourceInput}
        isAiExtracting={isAiExtracting}
        isGeneratingSample={isGeneratingSample}
        isReplayingExtraction={isReplayingExtraction}
        onClearInput={onClearInput}
        onExtractIdeas={onExtractIdeas}
        onGenerateMoreIdeas={onGenerateMoreIdeas}
        onGenerateSampleIdeas={onGenerateSampleIdeas}
        onReplayExtractionComparison={onReplayExtractionComparison}
      />
      <IdeaExtractionNotices duplicateCandidateCount={duplicateCandidateCount} extractMessage={extractMessage} />
      <IdeaExtractionFlowSteps hasGeneratedIdeaSlots={hasGeneratedIdeaSlots} />
    </div>
  );
}
