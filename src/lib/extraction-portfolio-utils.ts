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

export type ExtractionPortfolioListItem<Candidate, Gate, SimilarIdea> = {
  candidate: Candidate;
  gate: Gate;
  nextGap: string;
  readinessScore: number;
  similarIdea: SimilarIdea | null;
};

export type ExtractionDetailListItem<Candidate, Gate, GateStyle, SimilarIdea, ReadinessCheck, StrategyLens> = {
  candidate: Candidate;
  extractionGate: Gate;
  gateStyle: GateStyle;
  nextReadinessGap: ReadinessCheck | undefined;
  passedReadinessCount: number;
  readinessChecks: ReadinessCheck[];
  readinessScore: number;
  similarIdea: SimilarIdea | null;
  sourceEvidence: string;
  strategyLenses: StrategyLens[];
  strategyScore: number;
};

export function buildExtractionSimilarIdeaMatches<Candidate extends { id: string }, ExistingIdea, Match>(
  candidates: Candidate[],
  existingIdeas: ExistingIdea[],
  findSimilarIdea: (candidate: Candidate, existingIdeas: ExistingIdea[]) => Match | null,
) {
  const matches = new Map<string, Match>();

  for (const candidate of candidates) {
    const match = findSimilarIdea(candidate, existingIdeas);

    if (match) {
      matches.set(candidate.id, match);
    }
  }

  return matches;
}

export function buildExtractionGateMap<Candidate extends { id: string }, Match, ReadinessCheck, Gate>({
  buildGate,
  buildReadiness,
  candidates,
  similarIdeaMatches,
}: {
  buildGate: (candidate: Candidate, readinessChecks: ReadinessCheck[], similarIdea: Match | null) => Gate;
  buildReadiness: (candidate: Candidate, similarIdea: Match | null) => ReadinessCheck[];
  candidates: Candidate[];
  similarIdeaMatches: ReadonlyMap<string, Match>;
}) {
  const gates = new Map<string, Gate>();

  for (const candidate of candidates) {
    const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
    gates.set(candidate.id, buildGate(candidate, buildReadiness(candidate, similarIdea), similarIdea));
  }

  return gates;
}

export function buildExtractionPortfolioItems<
  Candidate extends { confidence: number; id: string; validationScore: number },
  Match,
  ReadinessCheck extends { label: string; passed: boolean },
  Gate extends { rank: number },
>({
  buildGate,
  buildReadiness,
  candidates,
  gatesByCandidateId,
  similarIdeaMatches,
}: {
  buildGate: (candidate: Candidate, readinessChecks: ReadinessCheck[], similarIdea: Match | null) => Gate;
  buildReadiness: (candidate: Candidate, similarIdea: Match | null) => ReadinessCheck[];
  candidates: Candidate[];
  gatesByCandidateId: ReadonlyMap<string, Gate>;
  similarIdeaMatches: ReadonlyMap<string, Match>;
}) {
  return candidates
    .map<ExtractionPortfolioListItem<Candidate, Gate, Match>>((candidate) => {
      const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
      const readinessChecks = buildReadiness(candidate, similarIdea);
      const gate = gatesByCandidateId.get(candidate.id) ?? buildGate(candidate, readinessChecks, similarIdea);
      const passedReadinessCount = readinessChecks.filter((check) => check.passed).length;
      const nextReadinessGap = readinessChecks.find((check) => !check.passed);

      return {
        candidate,
        gate,
        nextGap: nextReadinessGap ? nextReadinessGap.label : "저장 가능",
        readinessScore: Math.round((passedReadinessCount / readinessChecks.length) * 100),
        similarIdea,
      };
    })
    .sort(
      (left, right) =>
        right.gate.rank - left.gate.rank ||
        right.candidate.validationScore - left.candidate.validationScore ||
        right.candidate.confidence - left.candidate.confidence,
    );
}

export function buildExtractionDetailItems<
  Candidate extends { id: string },
  Match,
  ReadinessCheck extends { passed: boolean },
  GateId extends string,
  Gate extends { id: GateId },
  GateStyle,
  StrategyLens,
>({
  buildGate,
  buildReadiness,
  buildStrategyLens,
  candidates,
  gateStyles,
  gatesByCandidateId,
  getSourceEvidence,
  getStrategyScore,
  similarIdeaMatches,
}: {
  buildGate: (candidate: Candidate, readinessChecks: ReadinessCheck[], similarIdea: Match | null) => Gate;
  buildReadiness: (candidate: Candidate, similarIdea: Match | null) => ReadinessCheck[];
  buildStrategyLens: (candidate: Candidate) => StrategyLens[];
  candidates: Candidate[];
  gateStyles: Record<GateId, GateStyle>;
  gatesByCandidateId: ReadonlyMap<string, Gate>;
  getSourceEvidence: (candidate: Candidate) => string;
  getStrategyScore: (candidate: Candidate) => number;
  similarIdeaMatches: ReadonlyMap<string, Match>;
}) {
  return candidates.map<ExtractionDetailListItem<Candidate, Gate, GateStyle, Match, ReadinessCheck, StrategyLens>>(
    (candidate) => {
      const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
      const readinessChecks = buildReadiness(candidate, similarIdea);
      const passedReadinessCount = readinessChecks.filter((check) => check.passed).length;
      const readinessScore = Math.round((passedReadinessCount / readinessChecks.length) * 100);
      const nextReadinessGap = readinessChecks.find((check) => !check.passed);
      const extractionGate = gatesByCandidateId.get(candidate.id) ?? buildGate(candidate, readinessChecks, similarIdea);

      return {
        candidate,
        extractionGate,
        gateStyle: gateStyles[extractionGate.id],
        nextReadinessGap,
        passedReadinessCount,
        readinessChecks,
        readinessScore,
        similarIdea,
        sourceEvidence: getSourceEvidence(candidate),
        strategyLenses: buildStrategyLens(candidate),
        strategyScore: getStrategyScore(candidate),
      };
    },
  );
}

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

export function buildSingleExtractionSaveMessage({
  artifactCount,
  candidateName,
  partialError,
}: {
  artifactCount: number;
  candidateName: string;
  partialError: string | null;
}) {
  return partialError
    ? `아이디어는 저장했지만 연결 기록 일부가 실패했습니다: ${partialError}`
    : `'${candidateName}' 아이디어를 리스크, 7일 검증 계획, 제작 자료 ${artifactCount}개까지 저장했습니다.`;
}

export function buildBulkExtractionSaveMessage({
  partialErrors,
  savedNames,
}: {
  partialErrors: string[];
  savedNames: string[];
}) {
  if (savedNames.length === 0) {
    return `일괄 저장에 실패했습니다: ${partialErrors.join(" | ") || "저장된 아이디어가 없습니다."}`;
  }

  const partialErrorText = partialErrors.length > 0 ? ` / 일부 보완 필요: ${partialErrors.join(" | ")}` : "";

  return `상위 아이디어 ${savedNames.length}개를 검증 자료로 저장했습니다: ${savedNames.join(", ")}${partialErrorText}`;
}
