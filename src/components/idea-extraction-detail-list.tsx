"use client";

import { IdeaExtractionDetailCard } from "@/components/idea-extraction-detail-card";

type ExtractionDetailCandidate = {
  assumptions: string[];
  buyer: string;
  confidence: number;
  evidence: string[];
  firstPrototypeScope: string;
  id: string;
  killCriteria: string;
  name: string;
  one_liner: string;
  pricingHypothesis: string;
  productSurface: {
    shortLabel: string;
  };
  recommendation: string;
  riskLevel: "낮음" | "보통" | "높음";
  sevenDayExperiment: string;
  successMetric: string;
  target_user: string;
  validationQuestions: string[];
  validationScore: number;
};

type ExtractionDetailGate = {
  blockers: string[];
  label: string;
  nextAction: string;
  summary: string;
  threshold: string;
};

type ExtractionDetailGateStyle = {
  badge: string;
  panel: string;
  score: string;
  title: string;
};

type ExtractionDetailLens = {
  detail: string;
  label: string;
  score: number;
  tone: "good" | "watch" | "risk";
};

type ExtractionDetailReadinessCheck = {
  detail: string;
  label: string;
  passed: boolean;
};

type ExtractionDetailSimilarIdea = {
  idea: {
    name: string;
  };
  reason: string;
  score: number;
};

export type IdeaExtractionDetailListItem = {
  candidate: ExtractionDetailCandidate;
  extractionGate: ExtractionDetailGate;
  gateStyle: ExtractionDetailGateStyle;
  nextReadinessGap: ExtractionDetailReadinessCheck | undefined;
  passedReadinessCount: number;
  readinessChecks: ExtractionDetailReadinessCheck[];
  readinessScore: number;
  similarIdea: ExtractionDetailSimilarIdea | null | undefined;
  sourceEvidence: string;
  strategyLenses: ExtractionDetailLens[];
  strategyScore: number;
};

type IdeaExtractionDetailListProps = {
  canSave: boolean;
  detailItems: IdeaExtractionDetailListItem[];
  extractSaveKey: string | null;
  onLoadIdea: (candidateId: string) => void;
  onSaveIdea: (candidateId: string) => void | Promise<void>;
  selectedBuildDeliveryShortLabel: string;
};

export function IdeaExtractionDetailList({
  canSave,
  detailItems,
  extractSaveKey,
  onLoadIdea,
  onSaveIdea,
  selectedBuildDeliveryShortLabel,
}: IdeaExtractionDetailListProps) {
  return (
    <details className="avl-card p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">아이디어별 상세 보기</summary>
      <p className="mt-3 text-sm leading-5 text-slate-600">
        추천 아이디어만으로 부족할 때만 다른 아이디어의 가설과 검증 계획을 펼칩니다.
      </p>
      <div className="mt-4 grid gap-3">
        {detailItems.map((item) => (
          <IdeaExtractionDetailCard
            key={item.candidate.id}
            canSave={canSave}
            candidate={item.candidate}
            extractionGate={item.extractionGate}
            gateStyle={item.gateStyle}
            isSaveLocked={Boolean(extractSaveKey)}
            isSaving={extractSaveKey === item.candidate.id}
            nextReadinessGap={item.nextReadinessGap}
            onLoad={() => onLoadIdea(item.candidate.id)}
            onSave={() => onSaveIdea(item.candidate.id)}
            passedReadinessCount={item.passedReadinessCount}
            readinessChecks={item.readinessChecks}
            readinessScore={item.readinessScore}
            selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
            similarIdea={item.similarIdea}
            sourceEvidence={item.sourceEvidence}
            strategyLenses={item.strategyLenses}
            strategyScore={item.strategyScore}
          />
        ))}
      </div>
    </details>
  );
}
