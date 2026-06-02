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
const { buildMarketScanReviewRows, buildMarketScanReviewState } = await import(moduleUrl);

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
assert.equal(webDraftState.status.label, "웹 조사 준비");
assert.equal(webDraftState.actionLabel, "다시 정리");
assert.match(webDraftState.sourceBoundaryText, /공개 출처 1개/);

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

const estimateRows = buildMarketScanReviewRows({
  decisionLabels,
  draft: { ...draft, caveat: "" },
  isEstimate: true,
  publicSourceCount: 0,
});
assert.equal(estimateRows.overviewRows[0].value, "추정 초안");
assert.equal(estimateRows.decisionRows[2].value, "출처와 추정이 섞일 수 있으니 중요한 수치는 다시 확인하세요.");
assert.equal(estimateRows.decisionRows[2].helper, "추정 초안");

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
assert.equal(idleState.status.label, "자동 대기");
assert.equal(idleState.actionLabel, "AI 자동 점검 실행");

console.log("Market scan review state smoke passed.");
