import type { ExtractedIdeaArtifactBodies } from "@/lib/extracted-idea-artifact-markdown";
import { buildExtractedIdeaArtifactBodies } from "@/lib/extracted-idea-artifact-markdown";
import {
  buildDeliveryPreferenceMarkdown,
  defaultBuildDeliveryPreference,
  normalizeBuildDeliveryPreference,
  type BuildDeliveryPreference,
} from "@/lib/build-delivery";
import type { ExtractedIdea } from "@/lib/extracted-idea-normalization";
import { productSurfaceMarkdown } from "@/lib/product-surface";
import { redactSensitiveSource } from "@/lib/source-redaction";
import type { Database } from "@/lib/supabase/types";

type VentureArtifactInsert = Database["public"]["Tables"]["venture_artifacts"]["Insert"];

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
  strategyLensMarkdown: string;
}) {
  const buildDelivery = normalizeBuildDeliveryPreference(buildDeliveryPreference);
  const redactedSourceBlock = redactSensitiveSource(candidate.sourceBlock);
  const sourceBlock =
    redactedSourceBlock === candidate.sourceBlock
      ? redactedSourceBlock
      : `${redactedSourceBlock}

> 자동 가림 처리: 메모 근거에서 연락처, 카드, 계좌, 신분 정보로 보이는 패턴을 치환했습니다.`;
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
    strategyLensMarkdown,
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
