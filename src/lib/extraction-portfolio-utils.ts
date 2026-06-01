export type ExtractionPortfolioGateId = "proceed" | "research" | "pivot" | "kill";

export type ExtractionPortfolioCandidateSummary = {
  confidence: number;
  id: string;
  name: string;
  productSurface: {
    label: string;
  };
  validationScore: number;
};

export type ExtractionPortfolioGateSummary = {
  id: ExtractionPortfolioGateId;
  label: string;
  nextAction: string;
  rank: number;
};

export type ExtractionPortfolioSimilarIdeaSummary = {
  idea: {
    name: string;
  };
  score: number;
};

export type ExtractionPortfolioItemSummary<Candidate extends ExtractionPortfolioCandidateSummary> = {
  candidate: Candidate;
  gate: ExtractionPortfolioGateSummary;
  readinessScore: number;
  similarIdea: ExtractionPortfolioSimilarIdeaSummary | null;
};

export function selectRecommendedExtractionCandidate<Candidate extends ExtractionPortfolioCandidateSummary>(
  candidates: Candidate[],
  gatesByCandidateId: ReadonlyMap<string, { rank: number }>,
) {
  return candidates.reduce<Candidate | null>((best, candidate) => {
    if (!best) {
      return candidate;
    }

    const candidateGate = gatesByCandidateId.get(candidate.id);
    const bestGate = gatesByCandidateId.get(best.id);
    const candidateRank = candidateGate?.rank ?? candidate.validationScore;
    const bestRank = bestGate?.rank ?? best.validationScore;

    if (candidateRank !== bestRank) {
      return candidateRank > bestRank ? candidate : best;
    }

    return candidate.confidence > best.confidence ? candidate : best;
  }, null);
}

export function getSecondaryExtractionPortfolioItems<Item extends { candidate: { id: string } }>(
  items: Item[],
  recommendedCandidateId: string | null,
) {
  return items.filter((item) => item.candidate.id !== recommendedCandidateId).slice(0, 3);
}

export function getBulkSavableExtractionItems<Item extends { gate: { id: string }; readinessScore: number; similarIdea: unknown }>(
  items: Item[],
) {
  return items
    .filter((item) => ["proceed", "research"].includes(item.gate.id) && !item.similarIdea && item.readinessScore >= 70)
    .slice(0, 3);
}

export function countExtractionPortfolioGates<Item extends { gate: { id: ExtractionPortfolioGateId } }>(items: Item[]) {
  return items.reduce<Record<ExtractionPortfolioGateId, number>>(
    (counts, item) => ({ ...counts, [item.gate.id]: counts[item.gate.id] + 1 }),
    { proceed: 0, research: 0, pivot: 0, kill: 0 },
  );
}

export function buildExtractionPortfolioMarkdownItems<Candidate extends ExtractionPortfolioCandidateSummary>(
  items: ExtractionPortfolioItemSummary<Candidate>[],
  getStrategyScore: (candidate: Candidate) => number,
) {
  return items.map((item) => ({
    candidateName: item.candidate.name,
    gateId: item.gate.id,
    gateLabel: item.gate.label,
    nextAction: item.gate.nextAction,
    productSurfaceLabel: item.candidate.productSurface.label,
    readinessScore: item.readinessScore,
    similarIdeaLabel: item.similarIdea ? `${item.similarIdea.idea.name} ${item.similarIdea.score}%` : null,
    strategyScore: getStrategyScore(item.candidate),
    validationScore: item.candidate.validationScore,
  }));
}
