import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/market-scan.ts");
const source = readFileSync(modulePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildMarketScanActionControlState,
  buildMarketScanArtifactSaveDraft,
  buildMarketScanDraftPanelState,
  buildMarketScanEvidenceDraft,
  buildMarketScanExperimentResultPatch,
  buildMarketScanPublicSourceDisplayItems,
  buildMarketScanRequestPayload,
  buildMarketScanReviewRows,
  buildMarketScanReviewState,
  buildMarketScanRunCompletedMessage,
  buildVisibleMarketScanReviewRows,
  countHighStrengthMarketScanSources,
  getMarketScanUrl,
} = await import(moduleUrl);

const decisionLabels = {
  kill: "중단",
  pivot: "전환",
  research_more: "추가 조사",
  ship: "진행",
};

function artifact({ body, id, title = "시장·경쟁 자동 조사" }) {
  return {
    artifact_type: "research_note",
    body,
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: null,
    id,
    idea_id: "idea-1",
    organization_id: null,
    source: "market_scan",
    status: "draft",
    status_note: null,
    title,
    updated_at: "2026-06-01T00:00:00.000Z",
    version: 1,
  };
}

const draft = {
  alternatives: "스프레드시트와 수동 메모",
  caveat: "공개 수치는 최종 판단 전에 확인 필요",
  competition: "대체재가 있지만 자동화 깊이는 낮음",
  competitor_map: [{ category: "manual", name: "Spreadsheet", note: "수동 정리가 필요함", threat: "medium" }],
  confidence: "medium",
  demand_forecast: "반복 업무가 많은 소규모 팀에서 우선 수요",
  entry_barrier_checks: [{ label: "데이터 연결", note: "초기 설정 부담이 있음", severity: "medium" }],
  entry_barriers: "신뢰할 수 있는 연결과 권한 경계가 필요",
  market_signals: [{ finding: "업무 자동화 검색량 증가", label: "검색 신호" }],
  next_action: "공개 출처 2개를 더 확인",
  recommendation: "research_more",
  research_queries: ["automation os competitors"],
  saturation: "범용 도구는 많지만 사업화 흐름 특화는 드묾",
  sources: [
    {
      reason: "공개 제품 문서",
      source_type: "primary",
      strength: "high",
      title: "Public source",
      url: "https://example.com/source",
    },
    {
      reason: "사용자가 붙여넣은 대화",
      source_type: "user_input",
      strength: "low",
      title: "Pasted chat",
      url: "",
    },
  ],
  summary: "시장 검증 자동화 수요가 있음",
};

assert.equal(getMarketScanUrl(), "/api/ideas/market-scan");

assert.deepEqual(
  buildMarketScanRequestPayload({
    experiments: [
      { name: "5명 인터뷰", success_metric: "3명 이상 반복 문제 인정" },
      { name: "랜딩 대기자", success_metric: "" },
    ],
    idea: {
      buyer: "소규모 팀 리더",
      name: "AI Venture Lab",
      one_liner: "아이디어를 검증 가능한 제작 패키지로 정리",
      target_user: "1인 창업자",
    },
    productSurfaceLabel: "웹 서비스",
    risks: [
      { area: "시장", mitigation: "공개 출처 확인", title: "시장 근거 부족" },
      { area: "", mitigation: "", title: "운영 리스크" },
    ],
    score: 22,
    state: {
      next_evidence: "공개 출처 2개 확인",
      risk_summary: "출처와 수요 근거 필요",
      signal: "반복 대화에서 아이디어 정리가 어렵다는 신호",
    },
  }),
  {
    idea: {
      buyer: "소규모 팀 리더",
      name: "AI Venture Lab",
      one_liner: "아이디어를 검증 가능한 제작 패키지로 정리",
      product_surface: "웹 서비스",
      target_user: "1인 창업자",
    },
    state: {
      next_evidence: "공개 출처 2개 확인",
      risk_summary: "출처와 수요 근거 필요",
      signal: "반복 대화에서 아이디어 정리가 어렵다는 신호",
    },
    score: 22,
    risks: ["시장 근거 부족: 공개 출처 확인", "운영 리스크: 세부 내용 없음"],
    experiments: ["5명 인터뷰: 3명 이상 반복 문제 인정", "랜딩 대기자: 성공/중단 기준 미정"],
  },
);

const savedState = buildMarketScanReviewState({
  artifacts: [artifact({ body: "## 제작 형태\n\n웹앱", id: "saved-web" })],
  draft: null,
  draftKey: null,
  isLoading: false,
  mode: null,
  productSurfaceLabel: "웹앱",
  selectedIdeaId: "idea-1",
  selectedProductSurface: "web",
});
assert.equal(savedState.hasArtifact, true);
assert.equal(savedState.hasOutdatedArtifact, false);
assert.equal(savedState.showSavedNotice, true);
assert.equal(savedState.showOutdatedNotice, false);
assert.equal(savedState.status.label, "저장 완료");
assert.equal(savedState.actionLabel, "다시 정리");

const outdatedState = buildMarketScanReviewState({
  artifacts: [artifact({ body: "## 제작 형태\n\n모바일 앱", id: "saved-mobile" })],
  draft: null,
  draftKey: null,
  isLoading: false,
  mode: null,
  productSurfaceLabel: "웹앱",
  selectedIdeaId: "idea-1",
  selectedProductSurface: "web",
});
assert.equal(outdatedState.hasArtifact, false);
assert.equal(outdatedState.hasOutdatedArtifact, true);
assert.equal(outdatedState.showSavedNotice, false);
assert.equal(outdatedState.showOutdatedNotice, true);
assert.equal(outdatedState.status.label, "다시 정리 필요");
assert.equal(outdatedState.actionLabel, "현재 결과물 형태로 다시 정리");

const webDraftState = buildMarketScanReviewState({
  artifacts: [],
  draft,
  draftKey: "idea-1:web",
  isLoading: false,
  mode: "openai_web",
  productSurfaceLabel: "웹앱",
  selectedIdeaId: "idea-1",
  selectedProductSurface: "web",
});
assert.equal(webDraftState.contextKey, "idea-1:web");
assert.equal(webDraftState.visibleDraft?.summary, draft.summary);
assert.equal(webDraftState.isVisibleEstimate, false);
assert.equal(webDraftState.publicSources.length, 1);
assert.equal(countHighStrengthMarketScanSources(webDraftState.publicSources), 1);
assert.equal(webDraftState.status.label, "웹 조사 준비");
assert.equal(webDraftState.actionLabel, "다시 정리");
assert.match(webDraftState.sourceBoundaryText, /공개 출처 1개/);
assert.deepEqual(buildMarketScanPublicSourceDisplayItems(draft.sources), [
  {
    key: "https://example.com/source-0",
    source: draft.sources[0],
    sourceTypeLabel: "직접 출처",
    strengthLabel: "높음",
    strengthTone: "avl-pill-success",
  },
]);
assert.deepEqual(
  buildMarketScanDraftPanelState({
    draft: webDraftState.visibleDraft,
    isEstimate: webDraftState.isVisibleEstimate,
  }),
  {
    alertClassName: "border-blue-100 bg-blue-50 text-slate-700",
    alertMessage:
      "이 결과는 현재 아이디어에 연결되는 자동 점검 초안입니다. 저장 권한이 있으면 리서치 노트로 자동 저장되고, 제작 패키지에 들어갈 리서치 근거로 함께 묶입니다.",
    confidenceLabel: "보통",
    confidenceSuffix: "",
    highStrengthPublicSourceCount: 1,
    isVisible: true,
    publicSourceCount: 1,
    publicSourceItems: [
      {
        key: "https://example.com/source-0",
        source: draft.sources[0],
        sourceTypeLabel: "직접 출처",
        strengthLabel: "높음",
        strengthTone: "avl-pill-success",
      },
    ],
    publicSourceSummaryText: "근거 강도 높음 1개 / 전체 1개",
    showCompetitorMap: true,
    showEntryBarrierChecks: true,
    showMarketSignals: true,
    showPublicSources: true,
    showResearchQueries: true,
  },
);
assert.deepEqual(
  buildMarketScanActionControlState({
    actionLabel: webDraftState.actionLabel,
    hasCurrentArtifact: webDraftState.hasArtifact,
    hasEditableState: true,
    hasSelectedIdea: true,
    hasVisibleDraft: Boolean(webDraftState.visibleDraft),
    isLoading: false,
  }),
  {
    autoRunnerDisabled: true,
    iconClassName: "",
    label: "다시 정리",
    manualDisabled: false,
  },
);

const reviewRows = buildMarketScanReviewRows({
  decisionLabels,
  draft,
  isEstimate: false,
  publicSourceCount: webDraftState.publicSources.length,
});
assert.deepEqual(
  reviewRows.overviewRows.map((row) => row.label),
  ["조사 방식", "공개 출처", "경쟁/대체재"],
);
assert.equal(reviewRows.overviewRows[0].value, "웹 출처 포함");
assert.equal(reviewRows.overviewRows[1].value, "1개");
assert.equal(reviewRows.decisionRows[0].value, "추가 조사");
assert.equal(reviewRows.decisionRows[0].helper, "신뢰도 보통");
assert.equal(reviewRows.decisionRows[2].value, draft.caveat);
assert.deepEqual(
  reviewRows.marketDetailRows.map((row) => row.title),
  ["예상 수요", "경쟁/포화도", "진입장벽"],
);
assert.equal(reviewRows.marketDetailRows[1].detail, `${draft.competition} ${draft.saturation}`);
assert.equal(
  buildMarketScanRunCompletedMessage({ savedMarketScan: true }),
  "시장·경쟁 자동 점검을 리서치 노트로 저장했습니다. 결과물 형태까지 반영했으니 필요한 부분만 보완하고 하단 다음 단계로 넘어가세요.",
);
assert.equal(
  buildMarketScanRunCompletedMessage({ savedMarketScan: false }),
  "시장·경쟁 자동 점검 초안을 채웠습니다. 로그인 상태가 아니거나 저장 권한이 없으면 리서치 노트 자동 저장은 건너뜁니다.",
);
const experimentResultPatch = buildMarketScanExperimentResultPatch({
  currentExperimentId: "",
  decisionLabels,
  scan: draft,
  selectedExperimentId: "experiment-1",
});
assert.equal(experimentResultPatch.experiment_id, "experiment-1");
assert.match(experimentResultPatch.result, /시장·경쟁 자동 점검 초안/);
assert.match(experimentResultPatch.learning, /추천 판단: 추가 조사/);
assert.equal(experimentResultPatch.next_decision, "research_more");
assert.equal(experimentResultPatch.next_action, draft.next_action);
assert.equal(
  buildMarketScanExperimentResultPatch({
    currentExperimentId: "experiment-2",
    decisionLabels,
    scan: draft,
    selectedExperimentId: "experiment-1",
  }).experiment_id,
  "experiment-2",
);
const evidenceDraft = buildMarketScanEvidenceDraft({
  decisionLabels,
  ideaName: "AI Venture Lab",
  mode: "openai_web",
  scan: draft,
});
assert.equal(evidenceDraft.title, "시장·경쟁 자동 점검 - AI Venture Lab");
assert.equal(evidenceDraft.source, "https://example.com/source");
assert.match(evidenceDraft.evidence, /AI 시장·경쟁 자동 점검/);
assert.match(evidenceDraft.implication, /AI 추천 판단: 추가 조사/);
assert.equal(evidenceDraft.confidence, "medium");
assert.equal(
  buildMarketScanEvidenceDraft({
    decisionLabels,
    ideaName: "AI Venture Lab",
    mode: "local_estimate",
    scan: { ...draft, sources: [] },
  }).source,
  "AI 추정 초안",
);

const visibleRows = buildVisibleMarketScanReviewRows({
  decisionLabels,
  draft,
  isEstimate: false,
  publicSourceCount: webDraftState.publicSources.length,
});
assert.equal(visibleRows.overviewRows[1].value, "1개");
assert.equal(visibleRows.decisionRows[0].value, "추가 조사");
assert.deepEqual(
  buildVisibleMarketScanReviewRows({
    decisionLabels,
    draft: null,
    isEstimate: false,
    publicSourceCount: 0,
  }),
  {
    decisionRows: [],
    marketDetailRows: [],
    overviewRows: [],
  },
);

const saveDraft = buildMarketScanArtifactSaveDraft({
  decisionLabels,
  idea: { name: "AI Venture Lab" },
  mode: "openai_web",
  productSurfaceLabel: "웹앱",
  scan: draft,
});
assert.equal(saveDraft.artifactType, "research_note");
assert.equal(saveDraft.title, "AI Venture Lab 시장·경쟁 자동 조사");
assert.equal(saveDraft.source, "market_scan");
assert.match(saveDraft.body, /# 시장·경쟁 자동 조사: AI Venture Lab/);
assert.match(saveDraft.body, /웹 검색 포함/);
assert.match(saveDraft.statusNote, /웹 검색 포함/);

const estimateState = buildMarketScanReviewState({
  artifacts: [],
  draft,
  draftKey: "idea-1:web",
  isLoading: false,
  mode: "local_estimate",
  productSurfaceLabel: "웹앱",
  selectedIdeaId: "idea-1",
  selectedProductSurface: "web",
});
assert.equal(estimateState.status.label, "추정 초안");
assert.equal(estimateState.actionLabel, "웹 조사 다시 시도");
assert.equal(estimateState.isVisibleEstimate, true);
assert.match(estimateState.sourceBoundaryText, /웹 조사 다시 시도/);
assert.deepEqual(
  buildMarketScanDraftPanelState({
    draft: estimateState.visibleDraft,
    isEstimate: estimateState.isVisibleEstimate,
  }),
  {
    alertClassName: "border-amber-200 bg-amber-50 text-amber-950",
    alertMessage:
      "이 결과는 웹 출처가 붙지 않은 추정 초안입니다. OpenAI 웹 조사가 가능해지면 다시 실행해 출처 포함 리서치 노트로 보강하세요.",
    confidenceLabel: "보통",
    confidenceSuffix: " · 추정 초안",
    highStrengthPublicSourceCount: 1,
    isVisible: true,
    publicSourceCount: 1,
    publicSourceItems: [
      {
        key: "https://example.com/source-0",
        source: draft.sources[0],
        sourceTypeLabel: "직접 출처",
        strengthLabel: "높음",
        strengthTone: "avl-pill-success",
      },
    ],
    publicSourceSummaryText: "근거 강도 높음 1개 / 전체 1개",
    showCompetitorMap: true,
    showEntryBarrierChecks: true,
    showMarketSignals: true,
    showPublicSources: true,
    showResearchQueries: true,
  },
);

const estimateRows = buildMarketScanReviewRows({
  decisionLabels,
  draft: { ...draft, caveat: "" },
  isEstimate: true,
  publicSourceCount: 0,
});
assert.equal(estimateRows.overviewRows[0].value, "추정 초안");
assert.equal(estimateRows.decisionRows[2].value, "출처와 추정이 섞일 수 있으니 중요한 수치는 다시 확인하세요.");
assert.equal(estimateRows.decisionRows[2].helper, "추정 초안");

const estimateSaveDraft = buildMarketScanArtifactSaveDraft({
  decisionLabels,
  idea: { name: "AI Venture Lab" },
  mode: "local_estimate",
  productSurfaceLabel: "웹앱",
  scan: draft,
});
assert.match(estimateSaveDraft.statusNote, /추정 초안/);

const loadingState = buildMarketScanReviewState({
  artifacts: [],
  draft,
  draftKey: "idea-1:web",
  isLoading: true,
  mode: "openai_web",
  productSurfaceLabel: "웹앱",
  selectedIdeaId: "idea-1",
  selectedProductSurface: "web",
});
assert.equal(loadingState.status.label, "정리 중");
assert.equal(loadingState.actionLabel, "정리 중");
assert.equal(loadingState.showSavedNotice, false);
assert.equal(loadingState.showOutdatedNotice, false);
assert.deepEqual(
  buildMarketScanActionControlState({
    actionLabel: loadingState.actionLabel,
    hasCurrentArtifact: loadingState.hasArtifact,
    hasEditableState: true,
    hasSelectedIdea: true,
    hasVisibleDraft: Boolean(loadingState.visibleDraft),
    isLoading: true,
  }),
  {
    autoRunnerDisabled: true,
    iconClassName: "animate-spin",
    label: "정리 중",
    manualDisabled: true,
  },
);

const idleState = buildMarketScanReviewState({
  artifacts: [],
  draft,
  draftKey: "idea-1:web",
  isLoading: false,
  mode: "openai_web",
  productSurfaceLabel: "웹앱",
  selectedIdeaId: null,
  selectedProductSurface: null,
});
assert.equal(idleState.contextKey, null);
assert.equal(idleState.visibleDraft, null);
assert.equal(idleState.showSavedNotice, false);
assert.equal(idleState.showOutdatedNotice, false);
assert.equal(idleState.status.label, "자동 대기");
assert.equal(idleState.actionLabel, "AI 자동 점검 실행");
assert.deepEqual(
  buildMarketScanDraftPanelState({
    draft: idleState.visibleDraft,
    isEstimate: idleState.isVisibleEstimate,
  }),
  {
    alertClassName: "border-blue-100 bg-blue-50 text-slate-700",
    alertMessage:
      "이 결과는 현재 아이디어에 연결되는 자동 점검 초안입니다. 저장 권한이 있으면 리서치 노트로 자동 저장되고, 제작 패키지에 들어갈 리서치 근거로 함께 묶입니다.",
    confidenceLabel: "",
    confidenceSuffix: "",
    highStrengthPublicSourceCount: 0,
    isVisible: false,
    publicSourceCount: 0,
    publicSourceItems: [],
    publicSourceSummaryText: "근거 강도 높음 0개 / 전체 0개",
    showCompetitorMap: false,
    showEntryBarrierChecks: false,
    showMarketSignals: false,
    showPublicSources: false,
    showResearchQueries: false,
  },
);
assert.deepEqual(
  buildMarketScanActionControlState({
    actionLabel: idleState.actionLabel,
    hasCurrentArtifact: idleState.hasArtifact,
    hasEditableState: false,
    hasSelectedIdea: false,
    hasVisibleDraft: Boolean(idleState.visibleDraft),
    isLoading: false,
  }),
  {
    autoRunnerDisabled: false,
    iconClassName: "",
    label: "AI 자동 점검 실행",
    manualDisabled: true,
  },
);

console.log("Market scan review state smoke passed.");
