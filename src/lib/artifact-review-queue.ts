import type { VentureArtifact } from "@/lib/venture-data";
import type { WorkbenchTask } from "@/lib/workbench-tasks";
import type { VentureArtifactStatus, VentureArtifactType } from "@/lib/supabase/types";

export type ArtifactPanel = "validation" | "product" | "library";
export type DevelopmentPanel = "setup" | "tasks" | "handoff";
export type ArtifactReviewStatus = "approved" | "draft" | "missing";

export type ArtifactReviewItem = {
  id: string;
  label: string;
  artifactType: VentureArtifactType;
  requiredStatus: VentureArtifactStatus;
  status: ArtifactReviewStatus;
  artifact: VentureArtifact | null;
  detail: string;
  action: string;
  task: WorkbenchTask;
  panel?: ArtifactPanel;
  developmentPanel?: DevelopmentPanel;
};

export type ArtifactReviewProgressState = {
  approvedCount: number;
  nextItem: ArtifactReviewItem | null;
  progress: number;
  totalCount: number;
};

export const artifactReviewStatusDisplays: Record<
  ArtifactReviewStatus,
  { label: string; nextLabel: string; pillTone: "avl-pill-success" | "avl-pill-warning" | "avl-pill-danger" }
> = {
  approved: { label: "승인", nextLabel: "승인", pillTone: "avl-pill-success" },
  draft: { label: "초안", nextLabel: "승인 대기", pillTone: "avl-pill-warning" },
  missing: { label: "없음", nextLabel: "생성 필요", pillTone: "avl-pill-danger" },
};

export function getArtifactReviewStatusDisplay(status: ArtifactReviewStatus) {
  return artifactReviewStatusDisplays[status];
}

export const artifactPanelLabels: Record<ArtifactPanel, string> = {
  validation: "검증 자료",
  product: "기획서",
  library: "자료 보관함",
};

export const artifactPanelDescriptions: Record<ArtifactPanel, string> = {
  validation: "아이디어 요약, 조사 요약, 7일 검증 계획을 먼저 저장합니다.",
  product: "기획서, 첫 제작 범위, 출시 체크리스트를 생성합니다.",
  library: "저장된 자료를 필터링하고 승인 상태를 관리합니다.",
};

export const developmentPanelLabels: Record<DevelopmentPanel, string> = {
  setup: "제작 준비",
  tasks: "실행 할 일",
  handoff: "완료 보고",
};

export const developmentPanelDescriptions: Record<DevelopmentPanel, string> = {
  setup: "실제 제작으로 넘기기 전에 결정, 화면, 데이터, 위험 조건이 준비됐는지 확인합니다.",
  tasks: "실행할 일을 상태별로 나누고 막힌 항목과 완료 근거를 봅니다.",
  handoff: "끝난 일, 남은 일, 다음 담당자에게 넘길 내용을 한 번에 확인합니다.",
};

export function buildArtifactReviewDevelopmentFocusMessage(itemLabel: string) {
  return `${itemLabel} 생성을 위해 개발 프로세스 화면으로 이동했습니다.`;
}

export function buildArtifactReviewPanelFocusMessage({
  itemLabel,
  panel,
}: {
  itemLabel: string;
  panel: ArtifactPanel;
}) {
  return `${itemLabel} 생성을 위해 ${artifactPanelLabels[panel]} 화면으로 이동했습니다.`;
}

const artifactReviewBlueprint: Array<
  Omit<ArtifactReviewItem, "status" | "artifact" | "detail"> & {
    missingDetail: string;
    draftDetail: string;
    approvedDetail: string;
  }
> = [
  {
    id: "idea-brief",
    label: "아이디어 요약",
    artifactType: "idea_brief",
    requiredStatus: "approved",
    action: "문제, 대상, 구매자, 리스크 요약을 확인 가능한 문서로 저장합니다.",
    task: "artifacts",
    panel: "validation",
    missingDetail: "아이디어 요약이 없습니다.",
    draftDetail: "아이디어 요약 초안은 있으나 승인 전입니다.",
    approvedDetail: "아이디어 요약이 승인되었습니다.",
  },
  {
    id: "research-note",
    label: "리서치 노트",
    artifactType: "research_note",
    requiredStatus: "approved",
    action: "인터뷰, 대체재, 가격 신호, 리플레이 리포트를 승인 근거로 정리합니다.",
    task: "artifacts",
    panel: "validation",
    missingDetail: "리서치 노트나 아이디어 정리 리포트가 없습니다.",
    draftDetail: "리서치 초안은 있으나 승인 전입니다.",
    approvedDetail: "리서치 노트가 승인되었습니다.",
  },
  {
    id: "prd",
    label: "제품 기획서",
    artifactType: "prd",
    requiredStatus: "approved",
    action: "목표, 제외 범위, 수용 기준, 중단 조건을 승인합니다.",
    task: "artifacts",
    panel: "product",
    missingDetail: "제품 기획서가 없습니다.",
    draftDetail: "제품 기획서 초안은 있으나 승인 전입니다.",
    approvedDetail: "제품 기획서가 승인되었습니다.",
  },
  {
    id: "mvp-spec",
    label: "첫 제작 범위",
    artifactType: "mvp_spec",
    requiredStatus: "approved",
    action: "첫 제작 범위, 첫 화면, 제외 범위, 성공 기준을 승인합니다.",
    task: "artifacts",
    panel: "product",
    missingDetail: "첫 제작 범위가 없습니다.",
    draftDetail: "첫 제작 범위 초안은 있으나 승인 전입니다.",
    approvedDetail: "첫 제작 범위가 승인되었습니다.",
  },
  {
    id: "backend-decision",
    label: "백엔드 결정",
    artifactType: "backend_decision",
    requiredStatus: "approved",
    action: "Supabase, Firebase, SQL Connect, Hybrid 중 하나를 선택하고 권한 검증 조건을 승인합니다.",
    task: "development",
    developmentPanel: "setup",
    missingDetail: "백엔드 결정 문서가 없습니다.",
    draftDetail: "백엔드 결정 초안은 있으나 승인 전입니다.",
    approvedDetail: "백엔드 결정이 승인되었습니다.",
  },
  {
    id: "design-brief",
    label: "디자인 기준",
    artifactType: "design_brief",
    requiredStatus: "approved",
    action: "핵심 화면, 빈/오류/권한 상태, 모바일 흐름을 승인합니다.",
    task: "development",
    developmentPanel: "setup",
    missingDetail: "디자인 기준이 없습니다.",
    draftDetail: "디자인 기준 초안은 있으나 승인 전입니다.",
    approvedDetail: "디자인 기준이 승인되었습니다.",
  },
  {
    id: "tech-spec",
    label: "기술 명세",
    artifactType: "tech_spec",
    requiredStatus: "approved",
    action: "데이터 모델, 권한, 환경변수, 검증 명령을 승인합니다.",
    task: "development",
    developmentPanel: "setup",
    missingDetail: "기술 명세가 없습니다.",
    draftDetail: "기술 명세 초안은 있으나 승인 전입니다.",
    approvedDetail: "기술 명세가 승인되었습니다.",
  },
  {
    id: "dev-runbook",
    label: "제작 실행 계획",
    artifactType: "dev_runbook",
    requiredStatus: "approved",
    action: "구현 순서, 담당 역할, 검증/배포 루프를 승인합니다.",
    task: "development",
    developmentPanel: "handoff",
    missingDetail: "제작 실행 계획이 없습니다.",
    draftDetail: "제작 실행 계획 초안은 있으나 승인 전입니다.",
    approvedDetail: "제작 실행 계획이 승인되었습니다.",
  },
  {
    id: "launch-checklist",
    label: "출시 체크리스트",
    artifactType: "launch_checklist",
    requiredStatus: "approved",
    action: "품질 점검, 보안, 배포, 롤백 기준을 승인하고 출시 판단으로 넘깁니다.",
    task: "artifacts",
    panel: "product",
    missingDetail: "출시 체크리스트가 없습니다.",
    draftDetail: "출시 체크리스트 초안은 있으나 승인 전입니다.",
    approvedDetail: "출시 체크리스트가 승인되었습니다.",
  },
];

function getArtifactReviewRecencyTime(artifact: Pick<VentureArtifact, "created_at" | "updated_at">) {
  return new Date(artifact.updated_at ?? artifact.created_at).getTime();
}

export function sortArtifactsByReviewRecency<T extends Pick<VentureArtifact, "created_at" | "updated_at" | "version">>(
  artifacts: T[],
) {
  return [...artifacts].sort(
    (a, b) => getArtifactReviewRecencyTime(b) - getArtifactReviewRecencyTime(a) || (b.version ?? 1) - (a.version ?? 1),
  );
}

export function getLatestArtifactByType(artifacts: VentureArtifact[], artifactType: VentureArtifactType) {
  return sortArtifactsByReviewRecency(artifacts.filter((artifact) => artifact.artifact_type === artifactType))[0] ?? null;
}

export function buildArtifactReviewQueue(artifacts: VentureArtifact[]): ArtifactReviewItem[] {
  return artifactReviewBlueprint.map((item) => {
    const artifact = getLatestArtifactByType(artifacts, item.artifactType);
    const status: ArtifactReviewStatus = artifact ? (artifact.status === item.requiredStatus ? "approved" : "draft") : "missing";
    const detail = status === "approved" ? item.approvedDetail : status === "draft" ? item.draftDetail : item.missingDetail;

    return {
      id: item.id,
      label: item.label,
      artifactType: item.artifactType,
      requiredStatus: item.requiredStatus,
      status,
      artifact,
      detail,
      action: item.action,
      task: item.task,
      panel: item.panel,
      developmentPanel: item.developmentPanel,
    };
  });
}

export function buildArtifactReviewProgressState(queue: ArtifactReviewItem[]): ArtifactReviewProgressState {
  const totalCount = queue.length;
  const approvedCount = queue.filter((item) => item.status === "approved").length;

  return {
    approvedCount,
    nextItem: queue.find((item) => item.status !== "approved") ?? null,
    progress: totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0,
    totalCount,
  };
}

export function buildArtifactReviewWorkflowState(artifacts: VentureArtifact[]) {
  const queue = buildArtifactReviewQueue(artifacts);
  const progressState = buildArtifactReviewProgressState(queue);

  return {
    ...progressState,
    queue,
  };
}
