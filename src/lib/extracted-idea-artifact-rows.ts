import type { ExtractedIdeaArtifactBodies } from "@/lib/extracted-idea-artifact-markdown";
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
