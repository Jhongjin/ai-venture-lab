export type ExtractedIdeaArtifactBodyInput = {
  assumptions: string[];
  buildDeliveryMarkdown: string;
  buyer: string;
  confidence: number;
  evidence: string[];
  firstPrototypeScope: string;
  gateLabel: string;
  gateNextAction: string;
  killCriteria: string;
  name: string;
  nextEvidence: string;
  oneLiner: string;
  pricingHypothesis: string;
  productSurfaceMarkdown: string;
  recommendation: string;
  riskLevel: string;
  riskSummary: string;
  sevenDayExperiment: string;
  signal: string;
  sourceBlock: string;
  strategyLensMarkdown: string;
  successMetric: string;
  targetUser: string;
  validationQuestions: string[];
  validationRationale: string;
  validationScore: number;
};

export type ExtractedIdeaArtifactBodies = {
  ideaBriefBody: string;
  researchBriefBody: string;
  validationSprintBody: string;
};

export function buildExtractedIdeaArtifactBodies({
  assumptions,
  buildDeliveryMarkdown,
  buyer,
  confidence,
  evidence,
  firstPrototypeScope,
  gateLabel,
  gateNextAction,
  killCriteria,
  name,
  nextEvidence,
  oneLiner,
  pricingHypothesis,
  productSurfaceMarkdown,
  recommendation,
  riskLevel,
  riskSummary,
  sevenDayExperiment,
  signal,
  sourceBlock,
  strategyLensMarkdown,
  successMetric,
  targetUser,
  validationQuestions,
  validationRationale,
  validationScore,
}: ExtractedIdeaArtifactBodyInput): ExtractedIdeaArtifactBodies {
  return {
    ideaBriefBody: `# 아이디어 요약: ${name}

## 한 줄 설명

${oneLiner}

## 대상과 구매자

- 대상 사용자: ${targetUser}
- 구매자: ${buyer}

## 문제 신호

${signal}

## 메모 근거

${sourceBlock}

## 핵심 가설

${assumptions.map((item) => `- ${item}`).join("\n")}

## 초기 점수

- 검증 점수: ${validationScore}/100
- 신뢰도: ${confidence}%
- 추천: ${recommendation}
- 추천 판단: ${gateLabel}
- 다음 작업: ${gateNextAction}
- 리스크: ${riskLevel}

${productSurfaceMarkdown}

${buildDeliveryMarkdown}

${strategyLensMarkdown}

## 리스크 요약

${riskSummary}

## 추가로 확인할 내용

${nextEvidence}
`,
    researchBriefBody: `# 조사 요약: ${name}

## 확인된 단서

${evidence.map((item) => `- ${item}`).join("\n")}

## 메모 근거

${sourceBlock}

## 검증 질문

${validationQuestions.map((item) => `- ${item}`).join("\n")}

## 가격/구매 가설

${pricingHypothesis}

${productSurfaceMarkdown}

${buildDeliveryMarkdown}

## 첫 제작 범위

${firstPrototypeScope}

## 중단 기준

${killCriteria}

## 판단 메모

${validationRationale}
`,
    validationSprintBody: `# 7일 검증 계획: ${name}

## 확인할 내용

${sevenDayExperiment}

${productSurfaceMarkdown}

${buildDeliveryMarkdown}

## 메모 근거

${sourceBlock}

## 성공 지표

${successMetric}

## Day 1-2 모집

- 대상 사용자: ${targetUser}
- 질문: 최근 이 문제가 실제로 발생한 사례를 확인합니다.

## Day 3-4 대안 조사

- 현재 우회 방법, 경쟁 서비스, 수동 해결책을 확인합니다.

## Day 5 가격/구매 검증

${pricingHypothesis}

## Day 6 첫 화면 반응

${firstPrototypeScope}

## Day 7 판단

- 진행: 성공 지표를 충족하고 높은 리스크가 완화됩니다.
- 추가 조사: 문제는 있으나 구매/도달/운영 근거가 부족합니다.
- 전환: 사용자는 있으나 다른 구매자, 채널, 수동 서비스가 더 적합합니다.
- 중단: ${killCriteria}
`,
  };
}
