import type { Database } from "@/lib/supabase/types";

type Idea = Database["public"]["Tables"]["ideas"]["Row"];
type VentureArtifactInsert = Database["public"]["Tables"]["venture_artifacts"]["Insert"];

export function buildManualIdeaDirectionArtifactBody({
  buildDeliveryMarkdown,
  buyer,
  ideaName,
  nextEvidence,
  oneLiner,
  productSurfaceMarkdown,
  targetUser,
}: {
  buildDeliveryMarkdown: string;
  buyer: string;
  ideaName: string;
  nextEvidence: string;
  oneLiner: string;
  productSurfaceMarkdown: string;
  targetUser: string;
}) {
  return `# 초기 제작 방향: ${ideaName}

## 아이디어

- 한 줄 설명: ${oneLiner || "미정"}
- 대상 사용자: ${targetUser || "미정"}
- 구매자: ${buyer || "미정"}

${productSurfaceMarkdown}

${buildDeliveryMarkdown}

## 다음 확인

${nextEvidence || "사업성 평가에서 AI가 필요한 검증 질문을 다시 정리합니다."}
`;
}

export function buildManualIdeaDirectionArtifactRow({
  buildDeliveryMarkdown,
  idea,
  productSurfaceMarkdown,
}: {
  buildDeliveryMarkdown: string;
  idea: Pick<Idea, "buyer" | "id" | "name" | "next_evidence" | "one_liner" | "organization_id" | "target_user">;
  productSurfaceMarkdown: string;
}): VentureArtifactInsert {
  return {
    idea_id: idea.id,
    organization_id: idea.organization_id,
    artifact_type: "idea_brief",
    status: "draft",
    version: 1,
    title: `${idea.name} 초기 제작 방향`,
    source: "manual",
    status_note: "직접 입력한 아이디어의 결과물 형태와 개발 방식을 저장함",
    body: buildManualIdeaDirectionArtifactBody({
      buildDeliveryMarkdown,
      buyer: idea.buyer,
      ideaName: idea.name,
      nextEvidence: idea.next_evidence,
      oneLiner: idea.one_liner,
      productSurfaceMarkdown,
      targetUser: idea.target_user,
    }),
  };
}
