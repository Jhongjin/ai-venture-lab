export type ExtractionReplayMode = "openai" | "fallback" | "unavailable";

export type ExtractionReplayCandidate = {
  confidence: number;
  id: string;
  validationScore: number;
};

export type ExtractionReplayItem<Candidate extends ExtractionReplayCandidate = ExtractionReplayCandidate> = {
  id: string;
  matchedName: string | null;
  nextAction: string;
  overlapScore: number;
  primaryCandidate: Candidate;
  source: "both" | "rules" | "ai";
  verdict: string;
};

export type ExtractionReplaySummary<Candidate extends ExtractionReplayCandidate = ExtractionReplayCandidate> = {
  aiCount: number;
  aiMode: ExtractionReplayMode;
  aiOnlyCount: number;
  consensusCount: number;
  generatedAt: string;
  items: ExtractionReplayItem<Candidate>[];
  model: string | null;
  note: string;
  rulesCount: number;
  rulesOnlyCount: number;
  sourceLength: number;
};

export type ExtractionReplayMatch<Candidate extends ExtractionReplayCandidate> = {
  item: Candidate;
  score: number;
};

export function buildExtractionReplaySummary<Candidate extends ExtractionReplayCandidate>({
  aiIdeas,
  aiMode,
  findBestCandidateMatch,
  model,
  note,
  rulesIdeas,
  sourceLength,
}: {
  aiIdeas: Candidate[];
  aiMode: ExtractionReplayMode;
  findBestCandidateMatch: (
    rulesCandidate: Candidate,
    aiIdeas: Candidate[],
    usedAiIds: Set<string>,
  ) => ExtractionReplayMatch<Candidate> | null;
  model: string | null;
  note: string;
  rulesIdeas: Candidate[];
  sourceLength: number;
}): ExtractionReplaySummary<Candidate> {
  const usedAiIds = new Set<string>();
  const items: ExtractionReplayItem<Candidate>[] = [];

  for (const rulesCandidate of rulesIdeas) {
    const match = findBestCandidateMatch(rulesCandidate, aiIdeas, usedAiIds);

    if (match && match.score >= 52) {
      usedAiIds.add(match.item.id);
      const primaryCandidate =
        match.item.validationScore >= rulesCandidate.validationScore || match.item.confidence >= rulesCandidate.confidence
          ? match.item
          : rulesCandidate;

      items.push({
        id: `both-${rulesCandidate.id}-${match.item.id}`,
        source: "both",
        primaryCandidate,
        matchedName: primaryCandidate.id === match.item.id ? getCandidateName(rulesCandidate) : getCandidateName(match.item),
        overlapScore: match.score,
        verdict: "공통 아이디어",
        nextAction: "두 방식이 모두 포착했습니다. 아이디어 패키지로 저장하거나 실행 보드에서 먼저 평가하세요.",
      });
      continue;
    }

    items.push({
      id: `rules-${rulesCandidate.id}`,
      source: "rules",
      primaryCandidate: rulesCandidate,
      matchedName: null,
      overlapScore: 0,
      verdict: "규칙 단독",
      nextAction: "원문 라벨이나 키워드가 강한 아이디어입니다. AI가 놓쳤을 수 있으니 문제/구매자 증거를 보완합니다.",
    });
  }

  for (const aiCandidate of aiIdeas) {
    if (usedAiIds.has(aiCandidate.id)) {
      continue;
    }

    items.push({
      id: `ai-${aiCandidate.id}`,
      source: "ai",
      primaryCandidate: aiCandidate,
      matchedName: null,
      overlapScore: 0,
      verdict: "AI 단독",
      nextAction: "AI가 문맥에서 추론한 아이디어입니다. 메모 근거와 과잉 해석 여부를 먼저 확인합니다.",
    });
  }

  const sortedItems = items.sort((a, b) => {
    const sourceRank = { both: 3, ai: 2, rules: 1 };

    return (
      sourceRank[b.source] - sourceRank[a.source] ||
      b.primaryCandidate.validationScore - a.primaryCandidate.validationScore ||
      b.primaryCandidate.confidence - a.primaryCandidate.confidence
    );
  });
  const consensusCount = sortedItems.filter((item) => item.source === "both").length;
  const rulesOnlyCount = sortedItems.filter((item) => item.source === "rules").length;
  const aiOnlyCount = sortedItems.filter((item) => item.source === "ai").length;

  return {
    generatedAt: new Date().toISOString(),
    sourceLength,
    rulesCount: rulesIdeas.length,
    aiCount: aiIdeas.length,
    consensusCount,
    rulesOnlyCount,
    aiOnlyCount,
    aiMode,
    model,
    note,
    items: sortedItems,
  };
}

function getCandidateName(candidate: ExtractionReplayCandidate) {
  return "name" in candidate && typeof candidate.name === "string" ? candidate.name : candidate.id;
}
