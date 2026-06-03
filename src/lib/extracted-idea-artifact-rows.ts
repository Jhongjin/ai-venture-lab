import type { ExtractedIdeaArtifactBodies } from "@/lib/extracted-idea-artifact-markdown";
import { buildExtractedIdeaArtifactBodies } from "@/lib/extracted-idea-artifact-markdown";
import {
  buildDeliveryPreferenceMarkdown,
  defaultBuildDeliveryPreference,
  normalizeBuildDeliveryPreference,
  type BuildDeliveryPreference,
} from "@/lib/build-delivery";
import type { ExtractedIdea } from "@/lib/extracted-idea-normalization";
import { inferRiskArea, inferRiskSeverity } from "@/lib/extraction-risk-utils";
import { buildCandidateStrategyLensMarkdown } from "@/lib/extraction-strategy-lens";
import { productSurfaceMarkdown } from "@/lib/product-surface";
import { redactSensitiveSource } from "@/lib/source-redaction";
import type { Database } from "@/lib/supabase/types";

type ExperimentInsert = Database["public"]["Tables"]["experiments"]["Insert"];
type IdeaInsert = Database["public"]["Tables"]["ideas"]["Insert"];
type RiskInsert = Database["public"]["Tables"]["risks"]["Insert"];
type VentureArtifactInsert = Database["public"]["Tables"]["venture_artifacts"]["Insert"];

type ExtractionGateSummary = { label: string; nextAction: string };

export function buildExtractedIdeaSignalText(candidate: Pick<ExtractedIdea, "assumptions" | "signal">) {
  return `${candidate.signal}

핵심 가설
- ${candidate.assumptions.join("\n- ")}`;
}

export function buildExtractedIdeaRiskSummaryText(
  candidate: Pick<ExtractedIdea, "killCriteria" | "riskLevel" | "risk_summary">,
) {
  return `${candidate.risk_summary}

리스크 등급: ${candidate.riskLevel}
중단 기준
${candidate.killCriteria}`;
}

export function buildExtractedIdeaNextEvidenceText({
  candidate,
  extractionGate,
}: {
  candidate: Pick<
    ExtractedIdea,
    | "firstPrototypeScope"
    | "pricingHypothesis"
    | "productSurface"
    | "sevenDayExperiment"
    | "successMetric"
    | "validationQuestions"
  >;
  extractionGate: ExtractionGateSummary;
}) {
  return `결과물 형태
${candidate.productSurface.label}: ${candidate.productSurface.harnessFocus}

7일 검증 계획
${candidate.sevenDayExperiment}

성공 지표
${candidate.successMetric}

검증 질문
- ${candidate.validationQuestions.join("\n- ")}

첫 제작 범위
${candidate.firstPrototypeScope}

가격/구매 가설
${candidate.pricingHypothesis}

추천 판단
${extractionGate.label}: ${extractionGate.nextAction}`;
}

export function buildExtractedIdeaInsertRow({
  candidate,
  extractionGate,
  organizationId,
}: {
  candidate: ExtractedIdea;
  extractionGate: ExtractionGateSummary;
  organizationId: string | null;
}): IdeaInsert {
  return {
    name: candidate.name.trim(),
    one_liner: candidate.one_liner.trim(),
    target_user: candidate.target_user.trim(),
    buyer: candidate.buyer.trim(),
    signal: buildExtractedIdeaSignalText(candidate),
    risk_summary: buildExtractedIdeaRiskSummaryText(candidate),
    next_evidence: buildExtractedIdeaNextEvidenceText({ candidate, extractionGate }),
    product_surface: candidate.productSurface.key,
    stage: "research",
    decision: "research_more",
    ...candidate.initialScores,
    organization_id: organizationId,
  };
}

export function buildExtractedIdeaRiskRow({
  candidate,
  ideaId,
  organizationId,
}: {
  candidate: Pick<ExtractedIdea, "name" | "one_liner" | "riskLevel" | "risk_summary">;
  ideaId: string;
  organizationId: string | null;
}): RiskInsert {
  return {
    idea_id: ideaId,
    title: `${candidate.name} 핵심 리스크`,
    area: inferRiskArea(`${candidate.name} ${candidate.one_liner} ${candidate.risk_summary}`),
    severity: inferRiskSeverity(candidate.riskLevel),
    mitigation: candidate.risk_summary,
    status: "open",
    organization_id: organizationId,
  };
}

export function buildExtractedIdeaExperimentRow({
  candidate,
  ideaId,
  organizationId,
}: {
  candidate: Pick<ExtractedIdea, "name" | "successMetric">;
  ideaId: string;
  organizationId: string | null;
}): ExperimentInsert {
  return {
    idea_id: ideaId,
    name: `${candidate.name} 7일 검증`,
    success_metric: candidate.successMetric,
    status: "planned",
    organization_id: organizationId,
  };
}

export function buildExtractedIdeaArtifactRows({
  artifactBodies,
  candidateName,
  ideaId,
  organizationId,
}: {
  artifactBodies: ExtractedIdeaArtifactBodies;
  candidateName: string;
  ideaId: string;
  organizationId: string | null;
}): VentureArtifactInsert[] {
  const base = {
    idea_id: ideaId,
    organization_id: organizationId,
    status: "draft" as const,
    version: 1,
    status_note: "메모에서 찾은 아이디어를 검증 자료로 정리함",
  };

  return [
    {
      ...base,
      artifact_type: "idea_brief",
      title: `${candidateName} 아이디어 요약`,
      source: "extracted_idea_package",
      body: artifactBodies.ideaBriefBody,
    },
    {
      ...base,
      artifact_type: "research_note",
      title: `${candidateName} 조사 요약`,
      source: "extracted_research_brief",
      body: artifactBodies.researchBriefBody,
    },
    {
      ...base,
      artifact_type: "research_note",
      title: `${candidateName} 7일 검증 계획`,
      source: "validation_sprint",
      body: artifactBodies.validationSprintBody,
    },
  ];
}

export function buildExtractedIdeaSourceBlock(sourceBlock: string) {
  const redactedSourceBlock = redactSensitiveSource(sourceBlock);

  if (redactedSourceBlock === sourceBlock) {
    return redactedSourceBlock;
  }

  return `${redactedSourceBlock}

> 자동 가림 처리: 메모 근거에서 연락처, 카드, 계좌, 신분 정보로 보이는 패턴을 치환했습니다.`;
}

export function buildExtractedIdeaPackageArtifactRows({
  buildDeliveryPreference = defaultBuildDeliveryPreference,
  candidate,
  extractionGate,
  ideaId,
  organizationId,
  strategyLensMarkdown,
}: {
  buildDeliveryPreference?: BuildDeliveryPreference;
  candidate: ExtractedIdea;
  extractionGate: { label: string; nextAction: string };
  ideaId: string;
  organizationId: string | null;
  strategyLensMarkdown?: string;
}) {
  const buildDelivery = normalizeBuildDeliveryPreference(buildDeliveryPreference);
  const sourceBlock = buildExtractedIdeaSourceBlock(candidate.sourceBlock);
  const artifactBodies = buildExtractedIdeaArtifactBodies({
    assumptions: candidate.assumptions,
    buildDeliveryMarkdown: buildDeliveryPreferenceMarkdown(buildDelivery),
    buyer: candidate.buyer,
    confidence: candidate.confidence,
    evidence: candidate.evidence,
    firstPrototypeScope: candidate.firstPrototypeScope,
    gateLabel: extractionGate.label,
    gateNextAction: extractionGate.nextAction,
    killCriteria: candidate.killCriteria,
    name: candidate.name,
    nextEvidence: candidate.next_evidence,
    oneLiner: candidate.one_liner,
    pricingHypothesis: candidate.pricingHypothesis,
    productSurfaceMarkdown: productSurfaceMarkdown(candidate.productSurface),
    recommendation: candidate.recommendation,
    riskLevel: candidate.riskLevel,
    riskSummary: candidate.risk_summary,
    sevenDayExperiment: candidate.sevenDayExperiment,
    signal: candidate.signal,
    sourceBlock,
    strategyLensMarkdown: strategyLensMarkdown ?? buildCandidateStrategyLensMarkdown(candidate),
    successMetric: candidate.successMetric,
    targetUser: candidate.target_user,
    validationQuestions: candidate.validationQuestions,
    validationRationale: candidate.validationRationale,
    validationScore: candidate.validationScore,
  });

  return buildExtractedIdeaArtifactRows({
    artifactBodies,
    candidateName: candidate.name,
    ideaId,
    organizationId,
  });
}
