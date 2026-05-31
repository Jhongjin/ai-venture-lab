import { countKeywordHits } from "@/lib/extraction-text-utils";
import { hasNumericSignal } from "@/lib/extraction-gate";

type StrategyLensCandidate = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  signal: string;
  risk_summary: string;
  next_evidence: string;
  firstPrototypeScope: string;
  pricingHypothesis: string;
  riskLevel: "낮음" | "보통" | "높음";
  validationScore: number;
  successMetric: string;
  initialScores: {
    mvp_speed: number;
    differentiation: number;
  };
};

export type CandidateStrategyLens = {
  label: string;
  score: number;
  detail: string;
  tone: "good" | "watch" | "risk";
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function lensTone(score: number): CandidateStrategyLens["tone"] {
  if (score >= 74) {
    return "good";
  }

  if (score >= 55) {
    return "watch";
  }

  return "risk";
}

export function buildCandidateStrategyLens(candidate: StrategyLensCandidate): CandidateStrategyLens[] {
  const combinedText = `${candidate.name} ${candidate.one_liner} ${candidate.target_user} ${candidate.buyer} ${candidate.signal} ${candidate.risk_summary} ${candidate.next_evidence} ${candidate.firstPrototypeScope} ${candidate.pricingHypothesis}`;
  const paidHits = countKeywordHits(combinedText, ["구독", "월", "수수료", "절감", "유료", "결제", "비용", "좌석", "기업", "센터"]);
  const distributionHits = countKeywordHits(combinedText, ["센터", "팀", "조직", "커뮤니티", "전문직", "가족", "보호자", "크리에이터", "대행사"]);
  const automationHits = countKeywordHits(combinedText, ["AI", "자동", "대행", "추천", "매칭", "생성", "에이전트", "코칭", "분석"]);
  const privacyHits = countKeywordHits(combinedText, ["개인정보", "금융", "의료", "건강", "계좌", "카드", "상담", "심리", "미성년", "위치"]);
  const riskPenalty = candidate.riskLevel === "높음" ? 28 : candidate.riskLevel === "보통" ? 14 : 4;
  const feasibilityBase = candidate.initialScores.mvp_speed * 14 + candidate.initialScores.differentiation * 6;
  const hasNumericMetric = hasNumericSignal(candidate.successMetric);

  return [
    {
      label: "시장 신호",
      score: clampPercent(candidate.validationScore + (hasNumericMetric ? 6 : -8)),
      detail: hasNumericMetric ? "검증 지표에 숫자가 있어 첫 실험으로 옮기기 좋습니다." : "성공 기준을 숫자로 더 좁혀야 합니다.",
      tone: lensTone(candidate.validationScore + (hasNumericMetric ? 6 : -8)),
    },
    {
      label: "수익화",
      score: clampPercent(45 + paidHits * 10 + (candidate.buyer.trim().length > 8 ? 10 : 0)),
      detail: paidHits > 0 ? "가격/구매 단서가 있어 결제 의향 실험을 붙일 수 있습니다." : "누가 어떤 예산으로 지불하는지 보완하세요.",
      tone: lensTone(45 + paidHits * 10 + (candidate.buyer.trim().length > 8 ? 10 : 0)),
    },
    {
      label: "첫 제작 난이도",
      score: clampPercent(feasibilityBase - riskPenalty),
      detail:
        candidate.initialScores.mvp_speed >= 4
          ? "수동/템플릿/콘솔 형태로 얇게 시작할 수 있습니다."
          : "첫 버전 범위를 더 줄여야 제작 리스크가 낮아집니다.",
      tone: lensTone(feasibilityBase - riskPenalty),
    },
    {
      label: "도달 채널",
      score: clampPercent(42 + distributionHits * 11 + (candidate.target_user.trim().length > 8 ? 8 : 0)),
      detail: distributionHits > 0 ? "초기 인터뷰와 파일럿을 찾을 세그먼트 단서가 있습니다." : "첫 10명을 어디서 만날지 채널을 정하세요.",
      tone: lensTone(42 + distributionHits * 11 + (candidate.target_user.trim().length > 8 ? 8 : 0)),
    },
    {
      label: "자동화 레버리지",
      score: clampPercent(42 + automationHits * 9),
      detail: automationHits > 0 ? "AI/자동화가 반복 비용을 줄이는 핵심 가치로 보입니다." : "자동화 전에 수동 서비스로도 가치가 생기는지 확인하세요.",
      tone: lensTone(42 + automationHits * 9),
    },
    {
      label: "보안 부담",
      score: clampPercent(90 - privacyHits * 11 - riskPenalty),
      detail: privacyHits > 0 ? "민감 데이터 경계, 보관, 삭제, 권한 검증이 먼저 필요합니다." : "초기 버전은 비교적 낮은 데이터 부담으로 시작할 수 있습니다.",
      tone: lensTone(90 - privacyHits * 11 - riskPenalty),
    },
  ];
}

export function getCandidateStrategyScore(candidate: StrategyLensCandidate) {
  const lenses = buildCandidateStrategyLens(candidate);

  return clampPercent(lenses.reduce((total, lens) => total + lens.score, 0) / lenses.length);
}

export function buildCandidateStrategyLensMarkdown(candidate: StrategyLensCandidate) {
  const lenses = buildCandidateStrategyLens(candidate);

  return `## 사업/제작 렌즈

- 종합 점수: ${getCandidateStrategyScore(candidate)}%

| 렌즈 | 점수 | 판단 |
| --- | --- | --- |
${lenses.map((lens) => `| ${lens.label} | ${lens.score}% | ${lens.detail} |`).join("\n")}
`;
}
