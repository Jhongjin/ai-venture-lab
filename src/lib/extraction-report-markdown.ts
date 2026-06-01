export type ExtractionReplayMarkdownItem = {
  matchedName: string | null;
  nextAction: string;
  overlapScore: number;
  primaryCandidate: {
    name: string;
    productSurface: {
      label: string;
    };
    validationScore: number;
  };
  verdict: string;
};

export type ExtractionReplayMarkdownSummary = {
  aiCount: number;
  aiMode: string;
  aiOnlyCount: number;
  consensusCount: number;
  generatedAt: string;
  items: ExtractionReplayMarkdownItem[];
  model: string | null;
  note: string;
  rulesCount: number;
  rulesOnlyCount: number;
  sourceLength: number;
};

export type ExtractionPortfolioMarkdownItem = {
  candidateName: string;
  gateId: "proceed" | "research" | "pivot" | "kill";
  gateLabel: string;
  nextAction: string;
  productSurfaceLabel: string;
  readinessScore: number;
  similarIdeaLabel: string | null;
  strategyScore: number;
  validationScore: number;
};

export type ExtractionReportRunMeta = {
  engine?: string | null;
  generatedAt: string;
  model?: string | null;
  note?: string | null;
  sourceLength?: number | null;
};

export function buildExtractionReplayMarkdown(summary: ExtractionReplayMarkdownSummary) {
  const generatedAt = new Date(summary.generatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const rows = summary.items
    .map(
      (item, index) =>
        `| ${index + 1} | ${item.primaryCandidate.name} | ${item.primaryCandidate.productSurface.label} | ${item.verdict} | ${
          item.matchedName ?? "-"
        } | ${item.overlapScore || "-"} | ${item.primaryCandidate.validationScore}/100 | ${item.nextAction} |`,
    )
    .join("\n");

  return `# AI 정리 다시 보기

## 실행 메타

- 실행 시각: ${generatedAt}
- 입력 길이: ${summary.sourceLength}자
- 기준 추출 아이디어: ${summary.rulesCount}개
- AI 아이디어: ${summary.aiCount}개
- 공통 아이디어: ${summary.consensusCount}개
- 기준 추출 단독: ${summary.rulesOnlyCount}개
- AI 단독: ${summary.aiOnlyCount}개
- AI 모드: ${summary.aiMode}
- 모델: ${summary.model ?? "해당 없음"}
- 실행 메모: ${summary.note}

## 비교 결과

| 순서 | 아이디어 | 결과물 형태 | 판정 | 매칭 아이디어 | 유사도 | 검증 점수 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows || "| - | 아이디어 없음 | - | - | - | - | - | - |"}
`;
}

export function buildExtractionPortfolioMarkdown(items: ExtractionPortfolioMarkdownItem[]) {
  const rows = items
    .map(
      (item, index) =>
        `| ${index + 1} | ${item.candidateName} | ${item.productSurfaceLabel} | ${item.gateLabel} | ${item.validationScore}/100 | ${
          item.strategyScore
        }% | ${item.readinessScore}% | ${item.similarIdeaLabel ?? "없음"} | ${item.nextAction} |`,
    )
    .join("\n");
  const gateSummary = (["proceed", "research", "pivot", "kill"] as const)
    .map((gateId) => {
      const count = items.filter((item) => item.gateId === gateId).length;
      const label = gateId === "proceed" ? "진행 가능" : gateId === "research" ? "추가 조사" : gateId === "pivot" ? "전환 검토" : "보류";

      return `- ${label}: ${count}개`;
    })
    .join("\n");

  return `# 아이디어 도출 실행 요약

## 추천 판단 분포

${gateSummary}

## 실행 순서

| 순서 | 아이디어 | 결과물 형태 | 추천 판단 | 검증 기준 | 사업/제작 | 준비도 | 중복 신호 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows || "| - | 아이디어 없음 | - | - | - | - | - | - | - |"}

## 운영 원칙

- 진행 가능한 아이디어는 검증 자료로 저장한 뒤 실행 보드에서 사업성 평가와 첫 검증 계획을 확정합니다.
- 추가 조사가 필요한 아이디어는 부족한 문제 신호, 구매자, 지표, 리스크, MVP 범위를 보완합니다.
- 전환 검토 아이디어는 기존 기록 병합, 세그먼트 축소, 구매자 변경 중 하나를 먼저 결정합니다.
- 보류 아이디어는 새 증거가 생길 때까지 저장하지 않습니다.
`;
}

export function buildExtractionReportBody({
  items,
  organizationName,
  replaySummary,
  runMeta,
  sourceExcerpt,
  sourceLength,
}: {
  items: ExtractionPortfolioMarkdownItem[];
  organizationName: string | null;
  replaySummary: ExtractionReplayMarkdownSummary | null;
  runMeta: ExtractionReportRunMeta | null;
  sourceExcerpt: string;
  sourceLength: number;
}) {
  const generatedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const metaGeneratedAt = runMeta
    ? new Date(runMeta.generatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    : generatedAt;

  return `${buildExtractionPortfolioMarkdown(items)}

## 찾기 조건

- 생성 시각: ${generatedAt}
- 워크스페이스: ${organizationName ?? "개인 기록"}
- 아이디어 수: ${items.length}개
- 추출 엔진: ${runMeta?.engine ?? "미기록"}
- 모델: ${runMeta?.model ?? "해당 없음"}
- 입력 길이: ${runMeta?.sourceLength ?? sourceLength}자
- 추출 시각: ${metaGeneratedAt}
- 실행 메모: ${runMeta?.note ?? "수동 또는 이전 방식으로 찾은 아이디어입니다."}

${replaySummary ? buildExtractionReplayMarkdown(replaySummary) : "## AI 정리 다시 보기\n\n- 이번 리포트에는 다시 보기 결과가 포함되지 않았습니다."}

## 메모 근거 요약

${sourceExcerpt || "메모 근거가 비어 있습니다."}

## 다음 처리

1. 진행 가능한 아이디어는 검증 자료로 저장합니다.
2. 추가 조사가 필요한 아이디어는 부족한 증거를 보완한 뒤 다시 찾습니다.
3. 전환 검토 아이디어는 기존 아이디어 병합 또는 세그먼트 축소를 먼저 판단합니다.
4. 보류 아이디어는 새 증거가 생길 때까지 실행 목록에서 제외합니다.
`;
}
