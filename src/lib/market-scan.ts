import type { DecisionStatus } from "@/lib/supabase/types";

type MarketScanLevel = "low" | "medium" | "high";

export type MarketScanSource = {
  title: string;
  url: string;
  reason: string;
  source_type: "primary" | "secondary" | "directory" | "news" | "user_input" | "unknown";
  strength: MarketScanLevel;
};

export type MarketScanSignal = {
  label: string;
  finding: string;
};

export type MarketScanCompetitor = {
  name: string;
  category: string;
  threat: MarketScanLevel;
  note: string;
};

export type MarketScanBarrier = {
  label: string;
  severity: MarketScanLevel;
  note: string;
};

export type MarketScanDraft = {
  summary: string;
  demand_forecast: string;
  competition: string;
  saturation: string;
  entry_barriers: string;
  alternatives: string;
  market_signals: MarketScanSignal[];
  competitor_map: MarketScanCompetitor[];
  entry_barrier_checks: MarketScanBarrier[];
  research_queries: string[];
  recommendation: DecisionStatus;
  confidence: MarketScanLevel;
  next_action: string;
  caveat: string;
  sources: MarketScanSource[];
};

type MarketScanDecisionLabels = Record<DecisionStatus, string>;

function isMarketScanRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanMarketScanText(value: unknown, maxLength = 900) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function normalizeMarketScanLevel(value: unknown, fallback: MarketScanLevel): MarketScanLevel {
  return value === "high" || value === "medium" || value === "low" ? value : fallback;
}

export function getMarketScanLevelLabel(value: MarketScanLevel) {
  return value === "high" ? "높음" : value === "medium" ? "보통" : "낮음";
}

export const marketScanSourceTypeLabels: Record<MarketScanSource["source_type"], string> = {
  primary: "직접 출처",
  secondary: "해석 자료",
  directory: "목록/디렉터리",
  news: "뉴스/보도",
  user_input: "사용자 입력",
  unknown: "출처 유형 미확인",
};

export function getMarketScanSourceStrengthTone(strength: MarketScanSource["strength"]) {
  return strength === "high" ? "avl-pill-success" : strength === "medium" ? "avl-pill-warning" : "avl-pill-neutral";
}

function normalizeMarketScanSource(value: unknown): MarketScanSource | null {
  if (!isMarketScanRecord(value)) {
    return null;
  }

  const sourceType: MarketScanSource["source_type"] =
    value.source_type === "primary" ||
    value.source_type === "secondary" ||
    value.source_type === "directory" ||
    value.source_type === "news" ||
    value.source_type === "user_input" ||
    value.source_type === "unknown"
      ? value.source_type
      : "unknown";
  const source = {
    title: cleanMarketScanText(value.title, 160),
    url: cleanMarketScanText(value.url, 500),
    reason: cleanMarketScanText(value.reason, 240),
    source_type: sourceType,
    strength: normalizeMarketScanLevel(value.strength, "low"),
  };

  return source.title || source.url ? source : null;
}

function normalizeMarketScanSignal(value: unknown): MarketScanSignal | null {
  if (!isMarketScanRecord(value)) {
    return null;
  }

  const signal = {
    label: cleanMarketScanText(value.label, 120),
    finding: cleanMarketScanText(value.finding, 360),
  };

  return signal.label && signal.finding ? signal : null;
}

function normalizeMarketScanCompetitor(value: unknown): MarketScanCompetitor | null {
  if (!isMarketScanRecord(value)) {
    return null;
  }

  const competitor = {
    name: cleanMarketScanText(value.name, 160),
    category: cleanMarketScanText(value.category, 160),
    threat: normalizeMarketScanLevel(value.threat, "medium"),
    note: cleanMarketScanText(value.note, 360),
  };

  return competitor.name && competitor.note ? competitor : null;
}

function normalizeMarketScanBarrier(value: unknown): MarketScanBarrier | null {
  if (!isMarketScanRecord(value)) {
    return null;
  }

  const barrier = {
    label: cleanMarketScanText(value.label, 160),
    severity: normalizeMarketScanLevel(value.severity, "medium"),
    note: cleanMarketScanText(value.note, 360),
  };

  return barrier.label && barrier.note ? barrier : null;
}

export function normalizeMarketScanDraft(value: unknown): MarketScanDraft | null {
  if (!isMarketScanRecord(value)) {
    return null;
  }

  const sources = Array.isArray(value.sources)
    ? value.sources.map(normalizeMarketScanSource).filter((source): source is MarketScanSource => Boolean(source))
    : [];
  const marketSignals = Array.isArray(value.market_signals)
    ? value.market_signals
        .map(normalizeMarketScanSignal)
        .filter((signal): signal is MarketScanSignal => Boolean(signal))
    : [];
  const competitorMap = Array.isArray(value.competitor_map)
    ? value.competitor_map
        .map(normalizeMarketScanCompetitor)
        .filter((competitor): competitor is MarketScanCompetitor => Boolean(competitor))
    : [];
  const entryBarrierChecks = Array.isArray(value.entry_barrier_checks)
    ? value.entry_barrier_checks
        .map(normalizeMarketScanBarrier)
        .filter((barrier): barrier is MarketScanBarrier => Boolean(barrier))
    : [];
  const recommendation: DecisionStatus =
    value.recommendation === "pending" ||
    value.recommendation === "research_more" ||
    value.recommendation === "ship" ||
    value.recommendation === "pivot" ||
    value.recommendation === "kill"
      ? value.recommendation
      : "research_more";
  const scan: MarketScanDraft = {
    summary: cleanMarketScanText(value.summary),
    demand_forecast: cleanMarketScanText(value.demand_forecast),
    competition: cleanMarketScanText(value.competition),
    saturation: cleanMarketScanText(value.saturation),
    entry_barriers: cleanMarketScanText(value.entry_barriers),
    alternatives: cleanMarketScanText(value.alternatives),
    market_signals: marketSignals,
    competitor_map: competitorMap,
    entry_barrier_checks: entryBarrierChecks,
    research_queries: Array.isArray(value.research_queries)
      ? value.research_queries.map((query) => cleanMarketScanText(query, 240)).filter(Boolean)
      : [],
    recommendation,
    confidence: normalizeMarketScanLevel(value.confidence, "low"),
    next_action: cleanMarketScanText(value.next_action),
    caveat: cleanMarketScanText(value.caveat),
    sources,
  };

  return scan.summary && scan.next_action ? scan : null;
}

export function buildMarketScanResultText(scan: MarketScanDraft) {
  const sourceLines =
    scan.sources.length > 0
      ? scan.sources
          .map(
            (source) =>
              `- ${source.title || source.url}${source.url ? ` (${source.url})` : ""} / ${marketScanSourceTypeLabels[source.source_type]} / 근거 강도 ${getMarketScanLevelLabel(source.strength)}`,
          )
          .join("\n")
      : "- 출처 없음";
  const signalLines =
    scan.market_signals.length > 0
      ? scan.market_signals.map((signal) => `- ${signal.label}: ${signal.finding}`).join("\n")
      : "- 추가 확인 필요";
  const competitorLines =
    scan.competitor_map.length > 0
      ? scan.competitor_map
          .map((competitor) => `- ${competitor.name} (${competitor.category}): ${competitor.note}`)
          .join("\n")
      : "- 경쟁/대체재 추가 확인 필요";
  const barrierLines =
    scan.entry_barrier_checks.length > 0
      ? scan.entry_barrier_checks.map((barrier) => `- ${barrier.label}: ${barrier.note}`).join("\n")
      : "- 진입장벽 추가 확인 필요";

  return `시장·경쟁 자동 점검 초안

수요 신호
${signalLines}

수요 예측
${scan.demand_forecast}

경쟁도/포화도
${scan.competition}
${scan.saturation}

경쟁/대체재
${competitorLines}

진입장벽
${scan.entry_barriers}

진입장벽 체크
${barrierLines}

대체재
${scan.alternatives}

참고 출처
${sourceLines}`;
}

export function buildMarketScanLearningText(scan: MarketScanDraft, decisionLabels: MarketScanDecisionLabels) {
  return `요약: ${scan.summary}

추천 판단: ${decisionLabels[scan.recommendation]}
신뢰도: ${getMarketScanLevelLabel(scan.confidence)}

주의: ${scan.caveat}`;
}

export function buildMarketScanEvidenceText(scan: MarketScanDraft) {
  const sourceLines =
    scan.sources.length > 0
      ? scan.sources
          .map(
            (source) =>
              `- ${source.title || source.url}${source.url ? ` (${source.url})` : ""} / ${marketScanSourceTypeLabels[source.source_type]} / 근거 강도 ${getMarketScanLevelLabel(source.strength)}`,
          )
          .join("\n")
      : "- 공개 출처가 부족해 AI 추정 초안으로만 참고";
  const signalLines =
    scan.market_signals.length > 0
      ? scan.market_signals.map((signal) => `- ${signal.label}: ${signal.finding}`).join("\n")
      : "- 추가 확인 필요";
  const competitorLines =
    scan.competitor_map.length > 0
      ? scan.competitor_map
          .map((competitor) => `- ${competitor.name} (${competitor.category}): ${competitor.note}`)
          .join("\n")
      : "- 경쟁/대체재 추가 확인 필요";
  const barrierLines =
    scan.entry_barrier_checks.length > 0
      ? scan.entry_barrier_checks.map((barrier) => `- ${barrier.label}: ${barrier.note}`).join("\n")
      : "- 진입장벽 추가 확인 필요";
  const queryLines =
    scan.research_queries.length > 0 ? scan.research_queries.map((query) => `- ${query}`).join("\n") : "- 추가 검색 질문 없음";

  return `AI 시장·경쟁 자동 점검

수요 신호
${signalLines}

예상 수요
${scan.demand_forecast}

경쟁도와 시장 포화도
${scan.competition}
${scan.saturation}

경쟁/대체재
${competitorLines}

진입장벽
${scan.entry_barriers}

진입장벽 체크
${barrierLines}

대체재와 차별화
${scan.alternatives}

추가 확인 질문
${queryLines}

참고 출처
${sourceLines}`;
}

export function buildMarketScanEvidenceImplication(scan: MarketScanDraft, decisionLabels: MarketScanDecisionLabels) {
  return `AI 추천 판단: ${decisionLabels[scan.recommendation]}
신뢰도: ${getMarketScanLevelLabel(scan.confidence)}

다음 행동
${scan.next_action}

주의
${scan.caveat}`;
}

export function buildMarketScanArtifactMarkdown({
  idea,
  scan,
  mode,
  productSurfaceLabel,
  decisionLabels,
}: {
  idea: { name: string };
  scan: MarketScanDraft;
  mode: string | null;
  productSurfaceLabel: string;
  decisionLabels: MarketScanDecisionLabels;
}) {
  const sourceLines =
    scan.sources.length > 0
      ? scan.sources
          .map(
            (source) =>
              `- ${source.title || source.url}${source.url ? `: ${source.url}` : ""} / ${marketScanSourceTypeLabels[source.source_type]} / 근거 강도 ${getMarketScanLevelLabel(source.strength)}${source.reason ? ` - ${source.reason}` : ""}`,
          )
          .join("\n")
      : "- 공개 출처가 부족해 AI 추정 초안으로 저장";
  const competitorLines =
    scan.competitor_map.length > 0
      ? scan.competitor_map
          .map(
            (competitor) =>
              `- ${competitor.name} (${competitor.category}, 위협 ${getMarketScanLevelLabel(competitor.threat)}): ${competitor.note}`,
          )
          .join("\n")
      : "- 경쟁/대체재 추가 확인 필요";
  const barrierLines =
    scan.entry_barrier_checks.length > 0
      ? scan.entry_barrier_checks
          .map((barrier) => `- ${barrier.label} (${getMarketScanLevelLabel(barrier.severity)}): ${barrier.note}`)
          .join("\n")
      : "- 진입장벽 추가 확인 필요";
  const signalLines =
    scan.market_signals.length > 0
      ? scan.market_signals.map((signal) => `- ${signal.label}: ${signal.finding}`).join("\n")
      : "- 추가 확인 필요";
  const queryLines =
    scan.research_queries.length > 0 ? scan.research_queries.map((query) => `- ${query}`).join("\n") : "- 추가 검색 질문 없음";

  return `# 시장·경쟁 자동 조사: ${idea.name}

이 문서는 STEP 3에 들어오면 AI가 먼저 정리하는 검토 초안입니다. 공개 자료가 부족한 항목은 추정으로 표시하고, 중요한 수치나 점유율은 최종 판단 전에 다시 확인해야 합니다.

## 제작 형태

${productSurfaceLabel}

## 요약

${scan.summary}

## 수요 신호

${signalLines}

## 예상 수요

${scan.demand_forecast}

## 경쟁도와 시장 포화도

${scan.competition}

${scan.saturation}

## 경쟁/대체재

${competitorLines}

## 진입장벽

${scan.entry_barriers}

${barrierLines}

## 대체재와 차별화

${scan.alternatives}

## AI 추천 판단

- 추천: ${decisionLabels[scan.recommendation]}
- 신뢰도: ${getMarketScanLevelLabel(scan.confidence)}
- 실행 방식: ${mode === "openai_web" ? "웹 검색 포함" : "추정 초안"}
- 다음 행동: ${scan.next_action}

## 추가 확인 질문

${queryLines}

## 참고 출처

${sourceLines}

## 주의

${scan.caveat}
`;
}
