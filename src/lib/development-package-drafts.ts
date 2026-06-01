import type { VentureArtifactType } from "@/lib/supabase/types";

export type DevelopmentArtifactDraft = {
  artifactType: VentureArtifactType;
  body: string;
  description: string;
  title: string;
};

export type DevelopmentPackageDraft = {
  artifactType: VentureArtifactType;
  body: string;
  source: string;
  title: string;
};

export function buildDevelopmentArtifactDrafts({
  backendDecisionDraft,
  backendExecutionPlanDraft,
  designBriefDraft,
  ideaName,
  techSpecDraft,
}: {
  backendDecisionDraft: string;
  backendExecutionPlanDraft: string;
  designBriefDraft: string;
  ideaName: string | null;
  techSpecDraft: string;
}): DevelopmentArtifactDraft[] {
  if (!ideaName) {
    return [];
  }

  return [
    {
      artifactType: "backend_decision",
      title: `${ideaName} 백엔드 결정`,
      body: backendDecisionDraft,
      description: "Supabase, Firebase, SQL Connect, 하이브리드 중 어떤 백엔드를 쓸지 기록합니다.",
    },
    {
      artifactType: "backend_decision",
      title: `${ideaName} 백엔드 실행 체크리스트`,
      body: backendExecutionPlanDraft,
      description: "선택한 백엔드의 환경변수, 권한 규칙, 검증 명령, 롤백 기준을 제작 자료로 고정합니다.",
    },
    {
      artifactType: "design_brief",
      title: `${ideaName} 디자인 기준`,
      body: designBriefDraft,
      description: "핵심 여정, 화면 상태, 모바일/접근성 체크를 제작 전에 고정합니다.",
    },
    {
      artifactType: "tech_spec",
      title: `${ideaName} 기술 명세`,
      body: techSpecDraft,
      description: "데이터 모델, 권한 경계, 구현 순서, 검증 명령, 롤백 경로를 정리합니다.",
    },
  ];
}

export function buildDevelopmentPackageDrafts({
  appBlueprintDraft,
  developmentArtifactDrafts,
  developmentPlanDraft,
  ideaName,
  scaffoldManifestDraft,
}: {
  appBlueprintDraft: string;
  developmentArtifactDrafts: DevelopmentArtifactDraft[];
  developmentPlanDraft: string;
  ideaName: string | null;
  scaffoldManifestDraft: string;
}): DevelopmentPackageDraft[] {
  if (!ideaName) {
    return [];
  }

  return [
    ...developmentArtifactDrafts.map((draft) => ({
      artifactType: draft.artifactType,
      title: draft.title,
      body: draft.body,
      source: "development_process",
    })),
    {
      artifactType: "dev_runbook",
      title: `${ideaName} 제작 실행 계획`,
      body: developmentPlanDraft,
      source: "development_process",
    },
    {
      artifactType: "tech_spec",
      title: `${ideaName} 앱 구조 청사진`,
      body: appBlueprintDraft,
      source: "app_blueprint",
    },
    {
      artifactType: "dev_runbook",
      title: `${ideaName} 첫 제작 뼈대 안내서`,
      body: scaffoldManifestDraft,
      source: "scaffold_manifest",
    },
  ];
}
