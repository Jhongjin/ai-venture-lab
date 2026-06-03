import {
  getProductSurfaceProfile,
  inferProductSurface,
  type ProductSurfaceProfile,
} from "@/lib/product-surface";
import {
  inferAssumptions,
  inferFirstPrototypeScope,
  inferInitialScores,
  inferKillCriteria,
  inferPricingHypothesis,
  inferRecommendation,
  inferRiskLevel,
  inferSevenDayExperiment,
  inferSuccessMetric,
  inferText,
  inferValidationQuestions,
  scoreExtractedIdea,
  type InitialIdeaScores,
} from "@/lib/extraction-inference";
import { compactText, findLabeledValue, stripLabel } from "@/lib/extraction-text-utils";

export type ExtractedIdea = {
  id: string;
  sourceBlock: string;
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  signal: string;
  risk_summary: string;
  next_evidence: string;
  confidence: number;
  evidence: string[];
  validationScore: number;
  initialScores: InitialIdeaScores;
  riskLevel: "낮음" | "보통" | "높음";
  recommendation: "우선 검증" | "리스크 선검증" | "추가 조사" | "보류";
  assumptions: string[];
  validationQuestions: string[];
  sevenDayExperiment: string;
  successMetric: string;
  killCriteria: string;
  firstPrototypeScope: string;
  pricingHypothesis: string;
  validationRationale: string;
  productSurface: ProductSurfaceProfile;
};

export type AiExtractedIdeaCandidate = {
  name?: string;
  one_liner?: string;
  target_user?: string;
  buyer?: string;
  signal?: string;
  risk_summary?: string;
  next_evidence?: string;
  assumptions?: string[];
  validation_questions?: string[];
  seven_day_experiment?: string;
  success_metric?: string;
  kill_criteria?: string;
  first_prototype_scope?: string;
  pricing_hypothesis?: string;
  product_surface?: string;
  product_surface_reason?: string;
};

export function compareExtractedIdeasByValidationStrength(a: ExtractedIdea, b: ExtractedIdea) {
  return b.validationScore - a.validationScore || b.confidence - a.confidence;
}

export function sortExtractedIdeasByValidationStrength(ideas: ReadonlyArray<ExtractedIdea>) {
  return [...ideas].sort(compareExtractedIdeasByValidationStrength);
}

export function splitIdeaBlocks(source: string) {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsIdea =
      /^(#{1,4}\s*)?\d+[\.\)]\s+/.test(line) ||
      /^#{1,4}\s+/.test(line) ||
      /^아이디어\s*[:：]/.test(line);

    if (startsIdea && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  return blocks
    .filter((block) => /(아이디어|페인|솔루션|타겟|사용자|앱|서비스|플랫폼|에이전트|콘솔|코치|매니저|대시보드)/i.test(block))
    .slice(0, 8);
}

export function extractIdeasFromText(source: string): ExtractedIdea[] {
  return sortExtractedIdeasByValidationStrength(
    splitIdeaBlocks(source).map((block, index) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const rawName = findLabeledValue(block, ["아이디어", "서비스명", "앱"]) || stripLabel(lines[0] ?? `아이디어 ${index + 1}`);
      const name = compactText(rawName.replace(/\(.+\)/, ""), 42) || `아이디어 ${index + 1}`;
      const oneLiner =
        findLabeledValue(block, ["솔루션", "기능", "핵심", "차별점"]) ||
        compactText(lines.find((line) => /앱|서비스|플랫폼|에이전트|콘솔|도구|코치|매니저/.test(line)) ?? block, 150);
      const target_user = findLabeledValue(block, ["타겟층", "타겟", "대상 사용자", "사용자"]) || inferText(block, "target");
      const buyer = findLabeledValue(block, ["구매자", "BM", "비즈니스 모델", "타겟 고객"]) || inferText(block, "buyer");
      const signal = findLabeledValue(block, ["페인 포인트", "문제", "수요", "핵심"]) || compactText(block, 180);
      const risk_summary = findLabeledValue(block, ["리스크", "주의점", "제약"]) || inferText(block, "risk");
      const next_evidence =
        findLabeledValue(block, ["추가로 확인할 내용", "다음에 확인할 내용", "다음 증거", "검증", "다음 단계"]) ||
        inferText(block, "next");
      const evidence = [
        signal ? "문제 신호" : "",
        oneLiner ? "솔루션 단서" : "",
        target_user ? "타겟 단서" : "",
        buyer ? "구매자 단서" : "",
        risk_summary ? "리스크 추론" : "",
      ].filter(Boolean);
      const riskLevel = inferRiskLevel(block);
      const validationScore = scoreExtractedIdea({
        block,
        evidenceCount: evidence.length,
        riskLevel,
        buyer,
      });
      const initialScores = inferInitialScores(block, riskLevel, buyer);
      const recommendation = inferRecommendation(validationScore, riskLevel);
      const assumptions = inferAssumptions(block, name, target_user, buyer);
      const validationQuestions = inferValidationQuestions(block, target_user, buyer);
      const sevenDayExperiment = inferSevenDayExperiment(block, name);
      const successMetric = inferSuccessMetric(block);
      const killCriteria = inferKillCriteria(block);
      const firstPrototypeScope = inferFirstPrototypeScope(block);
      const pricingHypothesis = inferPricingHypothesis(block, buyer);
      const productSurface = inferProductSurface({
        name,
        one_liner: oneLiner,
        target_user,
        buyer,
        signal,
        risk_summary,
        next_evidence,
        firstPrototypeScope,
        pricingHypothesis,
        sourceBlock: block,
      });

      return {
        id: `${index}-${name}`,
        sourceBlock: block,
        name,
        one_liner: oneLiner,
        target_user,
        buyer,
        signal,
        risk_summary,
        next_evidence,
        confidence: Math.min(95, 45 + evidence.length * 10 + Math.min(lines.length, 8)),
        evidence,
        validationScore,
        initialScores,
        riskLevel,
        recommendation,
        assumptions,
        validationQuestions,
        sevenDayExperiment,
        successMetric,
        killCriteria,
        firstPrototypeScope,
        pricingHypothesis,
        productSurface,
        validationRationale:
          riskLevel === "높음"
            ? "수요가 보여도 규제, 권한, 책임 구조를 먼저 통과해야 합니다."
            : "문제, 대상, 구매자, 첫 실험 단서가 있어 초기 검증 대상으로 볼 수 있습니다.",
      };
    }),
  );
}

function firstText(values: Array<string | undefined>, fallback: string, maxLength = 180) {
  return compactText(values.find((value) => value && value.trim()) ?? fallback, maxLength);
}

export function buildAiExtractedIdeaSourceBlock({
  candidate,
  name,
  source,
}: {
  candidate: AiExtractedIdeaCandidate;
  name: string;
  source: string;
}) {
  return [
    `AI 아이디어: ${name}`,
    candidate.signal ? `문제 신호: ${candidate.signal}` : "",
    candidate.one_liner ? `솔루션: ${candidate.one_liner}` : "",
    candidate.target_user ? `대상 사용자: ${candidate.target_user}` : "",
    candidate.buyer ? `구매자: ${candidate.buyer}` : "",
    candidate.risk_summary ? `리스크: ${candidate.risk_summary}` : "",
    `메모 요약 근거: ${compactText(source, 900)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildAiExtractedIdeaEvidence({
  buyer,
  oneLiner,
  riskSummary,
  signal,
  targetUser,
}: {
  buyer: string;
  oneLiner: string;
  riskSummary: string;
  signal: string;
  targetUser: string;
}) {
  return [
    signal ? "AI 문제 신호" : "",
    oneLiner ? "AI 솔루션 정리" : "",
    targetUser ? "AI 타겟 추론" : "",
    buyer ? "AI 구매자 추론" : "",
    riskSummary ? "AI 리스크 추론" : "",
  ].filter(Boolean);
}

export function buildAiExtractedIdeaAssumptions({
  blockForInference,
  buyer,
  candidate,
  name,
  targetUser,
}: {
  blockForInference: string;
  buyer: string;
  candidate: AiExtractedIdeaCandidate;
  name: string;
  targetUser: string;
}) {
  return candidate.assumptions && candidate.assumptions.length >= 3
    ? candidate.assumptions.slice(0, 4).map((item) => compactText(item, 220))
    : inferAssumptions(blockForInference, name, targetUser, buyer);
}

export function buildAiExtractedIdeaValidationQuestions({
  blockForInference,
  buyer,
  candidate,
  targetUser,
}: {
  blockForInference: string;
  buyer: string;
  candidate: AiExtractedIdeaCandidate;
  targetUser: string;
}) {
  return candidate.validation_questions && candidate.validation_questions.length >= 3
    ? candidate.validation_questions.slice(0, 5).map((item) => compactText(item, 240))
    : inferValidationQuestions(blockForInference, targetUser, buyer);
}

export function hydrateAiExtractedIdeas(source: string, candidates: AiExtractedIdeaCandidate[]): ExtractedIdea[] {
  return sortExtractedIdeasByValidationStrength(
    candidates.slice(0, 8).map((candidate, index) => {
      const name = firstText([candidate.name], `AI 아이디어 ${index + 1}`, 42);
      const sourceBlock = buildAiExtractedIdeaSourceBlock({ candidate, name, source });
      const blockForInference = `${sourceBlock}\n${source}`;
      const oneLiner = firstText([candidate.one_liner], compactText(source, 150), 150);
      const target_user = firstText([candidate.target_user], inferText(blockForInference, "target"), 160);
      const buyer = firstText([candidate.buyer], inferText(blockForInference, "buyer"), 160);
      const signal = firstText([candidate.signal], inferText(blockForInference, "next"), 220);
      const risk_summary = firstText([candidate.risk_summary], inferText(blockForInference, "risk"), 240);
      const next_evidence = firstText([candidate.next_evidence], inferText(blockForInference, "next"), 240);
      const riskLevel = inferRiskLevel(blockForInference);
      const evidence = buildAiExtractedIdeaEvidence({
        buyer,
        oneLiner,
        riskSummary: risk_summary,
        signal,
        targetUser: target_user,
      });
      const validationScore = scoreExtractedIdea({
        block: blockForInference,
        evidenceCount: evidence.length + 1,
        riskLevel,
        buyer,
      });
      const assumptions = buildAiExtractedIdeaAssumptions({
        blockForInference,
        buyer,
        candidate,
        name,
        targetUser: target_user,
      });
      const validationQuestions = buildAiExtractedIdeaValidationQuestions({
        blockForInference,
        buyer,
        candidate,
        targetUser: target_user,
      });
      const sevenDayExperiment = firstText([candidate.seven_day_experiment], inferSevenDayExperiment(blockForInference, name), 520);
      const successMetric = firstText([candidate.success_metric], inferSuccessMetric(blockForInference), 320);
      const killCriteria = firstText([candidate.kill_criteria], inferKillCriteria(blockForInference), 360);
      const firstPrototypeScope = firstText([candidate.first_prototype_scope], inferFirstPrototypeScope(blockForInference), 360);
      const pricingHypothesis = firstText([candidate.pricing_hypothesis], inferPricingHypothesis(blockForInference, buyer), 260);
      const productSurface = getProductSurfaceProfile(candidate.product_surface, {
        name,
        one_liner: oneLiner,
        target_user,
        buyer,
        signal,
        risk_summary,
        next_evidence,
        firstPrototypeScope,
        pricingHypothesis,
        sourceBlock,
      });

      return {
        id: `ai-${index}-${name}`,
        sourceBlock,
        name,
        one_liner: oneLiner,
        target_user,
        buyer,
        signal,
        risk_summary,
        next_evidence,
        confidence: Math.min(96, 76 + Math.min(evidence.length, 5) * 3),
        evidence,
        validationScore,
        initialScores: inferInitialScores(blockForInference, riskLevel, buyer),
        riskLevel,
        recommendation: inferRecommendation(validationScore, riskLevel),
        assumptions,
        validationQuestions,
        sevenDayExperiment,
        successMetric,
        killCriteria,
        firstPrototypeScope,
        pricingHypothesis,
        productSurface,
        validationRationale:
          riskLevel === "높음"
            ? "AI가 수요는 정리했지만 규제, 개인정보, 운영 책임 검증이 먼저 필요합니다."
            : "AI가 문제, 대상, 구매자, 첫 실험을 정리해 검증할 아이디어로 볼 수 있습니다.",
      };
    }),
  );
}
