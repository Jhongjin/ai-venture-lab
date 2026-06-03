import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-report-markdown.ts");
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
  buildExtractionPortfolioGateSummary,
  buildExtractionPortfolioMarkdown,
  buildExtractionPortfolioReportArtifactRow,
  buildExtractionPortfolioReviewMarkdown,
  buildExtractionPortfolioRows,
  buildExtractionReplayMarkdown,
  buildExtractionReplayRows,
  buildExtractionReportBody,
  formatExtractionReportTitleDate,
} = await import(moduleUrl);

const portfolioItems = [
  {
    candidateName: "AI Venture Lab",
    gateId: "proceed",
    gateLabel: "진행 가능",
    nextAction: "검증 자료로 저장",
    productSurfaceLabel: "웹앱",
    readinessScore: 88,
    similarIdeaLabel: null,
    strategyScore: 76,
    validationScore: 82,
  },
  {
    candidateName: "Care Ops",
    gateId: "research",
    gateLabel: "추가 조사",
    nextAction: "구매자 근거 보완",
    productSurfaceLabel: "운영 콘솔",
    readinessScore: 66,
    similarIdeaLabel: "Care Memo 72%",
    strategyScore: 61,
    validationScore: 70,
  },
];

const replaySummary = {
  aiCount: 1,
  aiMode: "openai",
  aiOnlyCount: 0,
  consensusCount: 1,
  generatedAt: "2026-06-01T03:00:00.000Z",
  items: [
    {
      matchedName: "Venture OS",
      nextAction: "두 방식이 모두 포착했습니다.",
      overlapScore: 84,
      primaryCandidate: {
        name: "AI Venture Lab",
        productSurface: { label: "웹앱" },
        validationScore: 82,
      },
      verdict: "공통 아이디어",
    },
  ],
  model: "gpt-test",
  note: "테스트 실행",
  rulesCount: 1,
  rulesOnlyCount: 0,
  sourceLength: 512,
};

const portfolioMarkdown = buildExtractionPortfolioMarkdown(portfolioItems);
assert.match(buildExtractionPortfolioGateSummary(portfolioItems), /진행 가능: 1개/);
assert.match(buildExtractionPortfolioGateSummary(portfolioItems), /보류: 0개/);
assert.match(buildExtractionPortfolioRows(portfolioItems), /Care Ops/);
assert.equal(buildExtractionPortfolioRows([]), "| - | 아이디어 없음 | - | - | - | - | - | - | - |");
assert.match(portfolioMarkdown, /진행 가능: 1개/);
assert.match(portfolioMarkdown, /추가 조사: 1개/);
assert.match(portfolioMarkdown, /AI Venture Lab \| 웹앱 \| 진행 가능 \| 82\/100 \| 76% \| 88% \| 없음/);
assert.match(portfolioMarkdown, /Care Memo 72%/);

const replayMarkdown = buildExtractionReplayMarkdown(replaySummary);
assert.match(buildExtractionReplayRows(replaySummary.items), /AI Venture Lab/);
assert.equal(buildExtractionReplayRows([]), "| - | 아이디어 없음 | - | - | - | - | - | - |");
assert.match(replayMarkdown, /AI 정리 다시 보기/);
assert.match(replayMarkdown, /AI 모드: openai/);
assert.match(replayMarkdown, /Venture OS/);
assert.match(replayMarkdown, /84/);

const reviewMarkdown = buildExtractionPortfolioReviewMarkdown({
  items: portfolioItems,
  replaySummary,
});
assert.ok(reviewMarkdown.indexOf("# AI 정리 다시 보기") < reviewMarkdown.indexOf("# 아이디어 도출 실행 요약"));
assert.match(reviewMarkdown, /공통 아이디어/);
assert.match(reviewMarkdown, /추천 판단 분포/);

const fallbackReviewMarkdown = buildExtractionPortfolioReviewMarkdown({
  items: portfolioItems,
  replaySummary: null,
});
assert.ok(fallbackReviewMarkdown.startsWith("# 아이디어 도출 실행 요약"));
assert.doesNotMatch(fallbackReviewMarkdown, /AI 정리 다시 보기/);

const reportBody = buildExtractionReportBody({
  items: portfolioItems,
  organizationName: "Operator Lab",
  replaySummary,
  runMeta: {
    engine: "rules_plus_ai",
    generatedAt: "2026-06-01T03:01:00.000Z",
    model: "gpt-test",
    note: "AI+규칙 비교",
    sourceLength: 512,
  },
  sourceExcerpt: "연락처는 [가림] 처리된 근거만 저장",
  sourceLength: 999,
});
assert.match(reportBody, /워크스페이스: Operator Lab/);
assert.match(reportBody, /추출 엔진: rules_plus_ai/);
assert.match(reportBody, /입력 길이: 512자/);
assert.match(reportBody, /연락처는 \[가림\] 처리된 근거만 저장/);
assert.match(reportBody, /다음 처리/);

const titleDate = formatExtractionReportTitleDate(new Date("2026-06-01T00:00:00.000Z"));
assert.match(titleDate, /06.*01/);

const reportRow = buildExtractionPortfolioReportArtifactRow({
  items: portfolioItems,
  organizationId: "org-1",
  organizationName: "Operator Lab",
  replaySummary,
  runMeta: {
    engine: "rules_plus_ai",
    generatedAt: "2026-06-01T03:01:00.000Z",
    model: "gpt-test",
    note: "AI+규칙 비교",
    sourceLength: 512,
  },
  sourceExcerpt: "연락처는 [가림] 처리된 근거만 저장",
  sourceLength: 999,
  titleDate: "06.02 09:30",
});
assert.equal(reportRow.idea_id, null);
assert.equal(reportRow.organization_id, "org-1");
assert.equal(reportRow.artifact_type, "research_note");
assert.equal(reportRow.status, "draft");
assert.equal(reportRow.version, 1);
assert.equal(reportRow.title, "아이디어 정리 리포트 06.02 09:30");
assert.equal(reportRow.source, "extraction_portfolio");
assert.equal(reportRow.status_note, "메모에서 찾은 아이디어와 근거를 비교해 저장한 리포트입니다.");
assert.match(reportRow.body, /워크스페이스: Operator Lab/);
assert.match(reportRow.body, /연락처는 \[가림\] 처리된 근거만 저장/);

const fallbackReportBody = buildExtractionReportBody({
  items: [],
  organizationName: null,
  replaySummary: null,
  runMeta: null,
  sourceExcerpt: "",
  sourceLength: 0,
});
assert.match(fallbackReportBody, /개인 기록/);
assert.match(fallbackReportBody, /이번 리포트에는 다시 보기 결과가 포함되지 않았습니다/);
assert.match(fallbackReportBody, /메모 근거가 비어 있습니다/);

console.log("Extraction report markdown smoke passed.");
