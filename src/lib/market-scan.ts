import type { DecisionStatus } from "@/lib/supabase/types";
import type { VentureArtifact } from "@/lib/venture-data";

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

export type MarketScanDecisionLabels = Record<DecisionStatus, string>;

export type MarketScanExperimentResultPatch = {
  experiment_id: string;
  learning: string;
  next_action: string;
  next_decision: DecisionStatus;
  result: string;
};

export type MarketScanEvidenceDraft = {
  confidence: MarketScanDraft["confidence"];
  evidence: string;
  implication: string;
  source: string;
  title: string;
};

export function isMarketScanArtifactRecord(artifact: VentureArtifact) {
  return artifact.source === "market_scan" || (artifact.title || "").includes("시장·경쟁 자동 조사");
}

export function isMarketScanArtifactForProductSurface(artifact: VentureArtifact, productSurfaceLabel: string) {
  const body = artifact.body || "";

  return (
    body.includes(`## 제작 형태\n\n${productSurfaceLabel}`) ||
    body.includes(`제작 형태: ${productSurfaceLabel}`) ||
    body.includes(`권장 제작 형태: ${productSurfaceLabel}`)
  );
}

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

export function isPublicMarketScanSource(source: MarketScanSource) {
  return source.source_type !== "user_input" && /^https?:\/\//i.test(source.url.trim());
}

export function getPublicMarketScanSources(sources: ReadonlyArray<MarketScanSource>) {
  return sources.filter(isPublicMarketScanSource);
}

export type MarketScanReviewStatus = {
  label: string;
  tone: string;
  detail: string;
};

export type MarketScanReviewState = {
  actionLabel: string;
  contextKey: string | null;
  currentArtifact: VentureArtifact | null;
  hasArtifact: boolean;
  hasOutdatedArtifact: boolean;
  isVisibleEstimate: boolean;
  publicSources: MarketScanSource[];
  sourceBoundaryText: string;
  status: MarketScanReviewStatus;
  visibleDraft: MarketScanDraft | null;
};

export type MarketScanReviewRows = {
  decisionRows: Array<{ helper: string; label: string; value: string }>;
  marketDetailRows: Array<{ detail: string; title: string }>;
  overviewRows: Array<{ label: string; value: string }>;
};

export function buildMarketScanReviewRows({
  decisionLabels,
  draft,
  isEstimate,
  publicSourceCount,
}: {
  decisionLabels: MarketScanDecisionLabels;
  draft: MarketScanDraft;
  isEstimate: boolean;
  publicSourceCount: number;
}): MarketScanReviewRows {
  return {
    overviewRows: [
      { label: "조사 방식", value: isEstimate ? "추정 초안" : "웹 출처 포함" },
      { label: "공개 출처", value: `${publicSourceCount}개` },
      { label: "경쟁/대체재", value: `${draft.competitor_map.length}개` },
    ],
    decisionRows: [
      {
        label: "지금 판단",
        value: decisionLabels[draft.recommendation],
        helper: `신뢰도 ${getMarketScanLevelLabel(draft.confidence)}`,
      },
      {
        label: "다음 행동",
        value: draft.next_action,
        helper: "이 행동만 확인하면 다음 단계 판단이 쉬워집니다",
      },
      {
        label: "주의",
        value: draft.caveat || "출처와 추정이 섞일 수 있으니 중요한 수치는 다시 확인하세요.",
        helper: isEstimate ? "추정 초안" : "웹 출처 포함",
      },
    ],
    marketDetailRows: [
      { title: "예상 수요", detail: draft.demand_forecast },
      { title: "경쟁/포화도", detail: `${draft.competition} ${draft.saturation}` },
      { title: "진입장벽", detail: draft.entry_barriers },
    ],
  };
}

export function buildVisibleMarketScanReviewRows({
  decisionLabels,
  draft,
  isEstimate,
  publicSourceCount,
}: {
  decisionLabels: MarketScanDecisionLabels;
  draft: MarketScanDraft | null;
  isEstimate: boolean;
  publicSourceCount: number;
}): MarketScanReviewRows {
  if (!draft) {
    return {
      decisionRows: [],
      marketDetailRows: [],
      overviewRows: [],
    };
  }

  return buildMarketScanReviewRows({
    decisionLabels,
    draft,
    isEstimate,
    publicSourceCount,
  });
}

export function buildMarketScanRunCompletedMessage({
  savedMarketScan,
}: {
  savedMarketScan: boolean | null | undefined;
}) {
  return savedMarketScan
    ? "시장·경쟁 자동 점검을 리서치 노트로 저장했습니다. 결과물 형태까지 반영했으니 필요한 부분만 보완하고 하단 다음 단계로 넘어가세요."
    : "시장·경쟁 자동 점검 초안을 채웠습니다. 로그인 상태가 아니거나 저장 권한이 없으면 리서치 노트 자동 저장은 건너뜁니다.";
}

export function buildMarketScanReviewState({
  artifacts,
  draft,
  draftKey,
  isLoading,
  mode,
  productSurfaceLabel,
  selectedIdeaId,
  selectedProductSurface,
}: {
  artifacts: ReadonlyArray<VentureArtifact>;
  draft: MarketScanDraft | null;
  draftKey: string | null;
  isLoading: boolean;
  mode: string | null;
  productSurfaceLabel: string;
  selectedIdeaId: string | null;
  selectedProductSurface: string | null;
}): MarketScanReviewState {
  const marketScanArtifacts = artifacts.filter(isMarketScanArtifactRecord);
  const currentArtifact =
    marketScanArtifacts.find((artifact) => isMarketScanArtifactForProductSurface(artifact, productSurfaceLabel)) ?? null;
  const hasArtifact = Boolean(currentArtifact);
  const hasOutdatedArtifact = marketScanArtifacts.length > 0 && !hasArtifact;
  const contextKey = selectedIdeaId ? `${selectedIdeaId}:${selectedProductSurface ?? "undecided"}` : null;
  const visibleDraft = contextKey && draftKey === contextKey ? draft : null;
  const isVisibleEstimate = mode === "local_estimate" && Boolean(visibleDraft);
  const publicSources = visibleDraft ? getPublicMarketScanSources(visibleDraft.sources) : [];
  const sourceBoundaryText = visibleDraft
    ? isVisibleEstimate
      ? "제작 패키지 근거로 쓰기 전, 웹 조사 다시 시도로 공개 출처를 붙이는 것이 안전합니다."
      : publicSources.length > 0
        ? `공개 출처 ${publicSources.length}개를 함께 저장합니다. 중요한 수치만 원문에서 한 번 더 확인하세요.`
        : "웹 조사 모드지만 표시할 공개 출처가 부족합니다. 중요한 판단 전에는 출처를 한 번 더 확인하세요."
    : "";
  const status = isLoading
    ? {
        label: "정리 중",
        tone: "avl-pill avl-pill-info",
        detail: "AI가 수요, 경쟁도, 시장 포화도, 진입장벽을 확인하고 있습니다.",
      }
    : hasArtifact
      ? {
          label: "저장 완료",
          tone: "avl-pill avl-pill-success",
          detail: "리서치 노트로 저장되어 다음 단계 판단과 제작 자료에 함께 반영됩니다.",
        }
      : visibleDraft
        ? isVisibleEstimate
          ? {
              label: "추정 초안",
              tone: "avl-pill avl-pill-warning",
              detail: "웹 출처를 붙이지 못해 사용자 입력 기반 추정으로 준비됐습니다.",
            }
          : {
              label: "웹 조사 준비",
              tone: "avl-pill avl-pill-success",
              detail: "출처가 포함된 자동 점검 초안이 준비됐습니다. 필요한 부분만 보완하면 됩니다.",
            }
        : hasOutdatedArtifact
          ? {
              label: "다시 정리 필요",
              tone: "avl-pill avl-pill-warning",
              detail: "결과물 형태가 바뀌어서 현재 기준의 시장·경쟁 점검을 다시 저장해야 합니다.",
            }
          : {
              label: "자동 대기",
              tone: "avl-pill avl-pill-neutral",
              detail: "이 단계가 열리면 AI가 먼저 시장과 경쟁 상황을 정리합니다.",
            };
  const actionLabel = isLoading
    ? "정리 중"
    : hasOutdatedArtifact
      ? "현재 결과물 형태로 다시 정리"
      : hasArtifact || visibleDraft
        ? isVisibleEstimate
          ? "웹 조사 다시 시도"
          : "다시 정리"
        : "AI 자동 점검 실행";

  return {
    actionLabel,
    contextKey,
    currentArtifact,
    hasArtifact,
    hasOutdatedArtifact,
    isVisibleEstimate,
    publicSources,
    sourceBoundaryText,
    status,
    visibleDraft,
  };
}

type MarketScanSourceUrlStyle = "parenthesized" | "colon";

function formatMarketScanPublicSourceLine(
  source: MarketScanSource,
  { includeReason = false, urlStyle }: { includeReason?: boolean; urlStyle: MarketScanSourceUrlStyle },
) {
  const urlText = source.url && source.title ? (urlStyle === "colon" ? `: ${source.url}` : ` (${source.url})`) : "";
  const reasonText = includeReason && source.reason ? ` - ${source.reason}` : "";

  return `- ${source.title || source.url}${urlText} / ${marketScanSourceTypeLabels[source.source_type]} / 근거 강도 ${getMarketScanLevelLabel(source.strength)}${reasonText}`;
}

function buildMarketScanPublicSourceLines({
  fallback,
  includeReason = false,
  scan,
  urlStyle,
}: {
  fallback: string;
  includeReason?: boolean;
  scan: MarketScanDraft;
  urlStyle: MarketScanSourceUrlStyle;
}) {
  const publicSources = getPublicMarketScanSources(scan.sources);

  return publicSources.length > 0
    ? publicSources.map((source) => formatMarketScanPublicSourceLine(source, { includeReason, urlStyle })).join("\n")
    : fallback;
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
  const sourceLines = buildMarketScanPublicSourceLines({
    fallback: "- 공개 출처 없음 - 추정 초안으로만 참고",
    scan,
    urlStyle: "parenthesized",
  });
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

공개 출처
${sourceLines}`;
}

export function buildMarketScanLearningText(scan: MarketScanDraft, decisionLabels: MarketScanDecisionLabels) {
  return `요약: ${scan.summary}

추천 판단: ${decisionLabels[scan.recommendation]}
신뢰도: ${getMarketScanLevelLabel(scan.confidence)}

주의: ${scan.caveat}`;
}

export function buildMarketScanEvidenceText(scan: MarketScanDraft) {
  const sourceLines = buildMarketScanPublicSourceLines({
    fallback: "- 공개 출처가 부족해 AI 추정 초안으로만 참고",
    scan,
    urlStyle: "parenthesized",
  });
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

공개 출처
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

export function buildMarketScanExperimentResultPatch({
  currentExperimentId,
  decisionLabels,
  scan,
  selectedExperimentId,
}: {
  currentExperimentId: string;
  decisionLabels: MarketScanDecisionLabels;
  scan: MarketScanDraft;
  selectedExperimentId: string | null | undefined;
}): MarketScanExperimentResultPatch {
  return {
    experiment_id: currentExperimentId || selectedExperimentId || "",
    result: buildMarketScanResultText(scan),
    learning: buildMarketScanLearningText(scan, decisionLabels),
    next_decision: scan.recommendation,
    next_action: scan.next_action,
  };
}

export function buildMarketScanEvidenceDraft({
  decisionLabels,
  ideaName,
  mode,
  scan,
}: {
  decisionLabels: MarketScanDecisionLabels;
  ideaName: string;
  mode: string | null;
  scan: MarketScanDraft;
}): MarketScanEvidenceDraft {
  const publicSources = getPublicMarketScanSources(scan.sources);

  return {
    title: `시장·경쟁 자동 점검 - ${ideaName}`,
    source:
      publicSources.length > 0
        ? publicSources.map((source) => source.url || source.title).filter(Boolean).join(", ")
        : mode === "local_estimate"
          ? "AI 추정 초안"
          : "AI 시장·경쟁 자동 점검",
    evidence: buildMarketScanEvidenceText(scan),
    implication: buildMarketScanEvidenceImplication(scan, decisionLabels),
    confidence: scan.confidence,
  };
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
  const sourceLines = buildMarketScanPublicSourceLines({
    fallback: "- 공개 출처가 부족해 AI 추정 초안으로 저장",
    includeReason: true,
    scan,
    urlStyle: "colon",
  });
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

## 공개 출처

${sourceLines}

## 주의

${scan.caveat}
`;
}

export type MarketScanArtifactSaveDraft = {
  artifactType: "research_note";
  body: string;
  source: "market_scan";
  statusNote: string;
  title: string;
};

export function buildMarketScanArtifactSaveDraft({
  decisionLabels,
  idea,
  mode,
  productSurfaceLabel,
  scan,
}: {
  decisionLabels: MarketScanDecisionLabels;
  idea: { name: string };
  mode: string | null;
  productSurfaceLabel: string;
  scan: MarketScanDraft;
}): MarketScanArtifactSaveDraft {
  return {
    artifactType: "research_note",
    body: buildMarketScanArtifactMarkdown({
      decisionLabels,
      idea,
      mode,
      productSurfaceLabel,
      scan,
    }),
    source: "market_scan",
    statusNote:
      mode === "openai_web"
        ? "AI 시장·경쟁 자동 점검에서 저장한 웹 검색 포함 리서치 노트입니다."
        : "AI 시장·경쟁 자동 점검에서 저장한 추정 초안입니다.",
    title: `${idea.name} 시장·경쟁 자동 조사`,
  };
}
