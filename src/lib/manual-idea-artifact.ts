import {
  buildDeliveryPreferenceMarkdown,
  normalizeBuildDeliveryPreference,
  type BuildDeliveryPreference,
} from "@/lib/build-delivery";
import { productSurfaceMarkdown, type ProductSurfaceProfile } from "@/lib/product-surface";
import type { Database } from "@/lib/supabase/types";

type Idea = Database["public"]["Tables"]["ideas"]["Row"];
type IdeaInsert = Database["public"]["Tables"]["ideas"]["Insert"];
type VentureArtifactInsert = Database["public"]["Tables"]["venture_artifacts"]["Insert"];

export type ManualIdeaInput = {
  buyer: string;
  name: string;
  next_evidence: string;
  one_liner: string;
  risk_summary: string;
  signal: string;
  target_user: string;
};

export function formatManualIdeaArtifactValue(value: string, fallback: string) {
  return value || fallback;
}

export function buildManualIdeaInsertRow({
  form,
  organizationId,
  productSurfaceKey,
}: {
  form: ManualIdeaInput;
  organizationId: string | null;
  productSurfaceKey: NonNullable<IdeaInsert["product_surface"]>;
}): IdeaInsert {
  return {
    name: form.name.trim(),
    one_liner: form.one_liner.trim(),
    target_user: form.target_user.trim(),
    buyer: form.buyer.trim(),
    signal: form.signal.trim(),
    risk_summary: form.risk_summary.trim(),
    next_evidence: form.next_evidence.trim(),
    product_surface: productSurfaceKey,
    stage: "intake",
    decision: "pending",
    problem_intensity: 0,
    frequency: 0,
    reachability: 0,
    willingness_to_pay: 0,
    mvp_speed: 0,
    differentiation: 0,
    regulatory_risk: 0,
    organization_id: organizationId,
  };
}

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

- 한 줄 설명: ${formatManualIdeaArtifactValue(oneLiner, "미정")}
- 대상 사용자: ${formatManualIdeaArtifactValue(targetUser, "미정")}
- 구매자: ${formatManualIdeaArtifactValue(buyer, "미정")}

${productSurfaceMarkdown}

${buildDeliveryMarkdown}

## 다음 확인

${formatManualIdeaArtifactValue(nextEvidence, "사업성 평가에서 AI가 필요한 검증 질문을 다시 정리합니다.")}
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

export function buildManualIdeaDirectionArtifactRowFromProfiles({
  buildDeliveryPreference,
  idea,
  productSurface,
}: {
  buildDeliveryPreference: Partial<BuildDeliveryPreference> | null | undefined;
  idea: Pick<Idea, "buyer" | "id" | "name" | "next_evidence" | "one_liner" | "organization_id" | "target_user">;
  productSurface: ProductSurfaceProfile;
}): VentureArtifactInsert {
  return buildManualIdeaDirectionArtifactRow({
    buildDeliveryMarkdown: buildDeliveryPreferenceMarkdown(normalizeBuildDeliveryPreference(buildDeliveryPreference)),
    idea,
    productSurfaceMarkdown: productSurfaceMarkdown(productSurface),
  });
}
