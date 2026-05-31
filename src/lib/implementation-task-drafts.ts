import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import { implementationSurfaceTaskGuidance } from "@/lib/product-surface-implementation";
import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea, Risk, VentureArtifact } from "@/lib/venture-data";
import { decisionLabels } from "@/lib/workbench-labels";

type ImplementationTaskDraftState = Pick<Idea, "decision" | "signal" | "risk_summary" | "next_evidence" | "product_surface">;

export function buildImplementationTaskDrafts({
  idea,
  state,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: ImplementationTaskDraftState;
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
}): ImplementationTaskDraft[] {
  const hasHighRisk = risks.some((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const hasApprovedPrd = artifacts.some((artifact) => artifact.artifact_type === "prd" && artifact.status === "approved");
  const hasApprovedMvp = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved");
  const hasMvpSlicePlan = artifacts.some((artifact) => artifact.source === "mvp_slice_plan");
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const primaryExperiment = experiments[0];
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];

  return [
    {
      title: "기획서와 첫 제작 범위 잠금",
      task_type: "planning",
      priority: hasApprovedPrd && hasApprovedMvp && hasMvpSlicePlan ? "medium" : "high",
      owner_role: "product-builder",
      acceptance_criteria: [
        `현재 판단은 ${decisionLabels[state.decision]}이고, 첫 릴리스 범위가 한 문장으로 고정되어야 합니다.`,
        `제작 형태는 ${productSurface.label}이고, 첫 제작은 ${productSurface.firstBuild} 기준으로 고정합니다.`,
        surfaceGuidance.planningScope,
        hasMvpSlicePlan
          ? "첫 제작 범위 플랜의 준비, 첫 제작, 자동화 확장, 출시 준비 순서가 개발 범위에 반영되어야 합니다."
          : "첫 제작 범위 플랜을 먼저 저장하고, 수동 검증과 얇은 제품 슬라이스를 분리해야 합니다.",
        "포함 범위, 제외 범위, 성공 지표, 중단 기준이 제품 기획서 또는 첫 제작 범위에 남아 있어야 합니다.",
        surfaceGuidance.expansionGuard,
      ].join("\n"),
    },
    {
      title: "핵심 사용자 여정 와이어프레임 정리",
      task_type: "design",
      priority: "medium",
      owner_role: "design-reviewer",
      acceptance_criteria: [
        `${idea.target_user || "대상 사용자"}가 Slice 1에서 첫 가치를 얻는 화면 흐름을 3-5단계로 고정합니다.`,
        productSurface.iaHint,
        surfaceGuidance.designFlow,
        "빈 상태, 오류, 저장 성공, 읽기 전용, 모바일 화면 조건을 적습니다.",
      ].join("\n"),
    },
    {
      title: "데이터 모델과 마이그레이션 작성",
      task_type: "data",
      priority: "high",
      owner_role: "data-modeler",
      acceptance_criteria: [
        "첫 제작 범위의 핵심 엔티티, 소유권, 조직 경계, 감사 로그 또는 변경 이력이 정의됩니다.",
        surfaceGuidance.dataBoundary,
        "마이그레이션은 재실행 가능하고, 필요한 인덱스와 제약 조건을 포함합니다.",
      ].join("\n"),
    },
    {
      title: "백엔드 권한 경계 구현",
      task_type: "backend",
      priority: hasBackendDecision ? "medium" : "high",
      owner_role: "backend-architect",
      acceptance_criteria: [
        `기술 기준은 ${productSurface.stackHint}`,
        "첫 제작 범위에 필요한 테이블, 문서, 함수, 정책만 구현합니다.",
        surfaceGuidance.backendBoundary,
        "Supabase RLS 또는 Firebase Security Rules의 허용/차단 조건이 문서와 코드에 반영됩니다.",
        "클라이언트에서 서비스 역할 키나 서버 전용 비밀값을 사용하지 않습니다.",
      ].join("\n"),
    },
    {
      title: "핵심 입력/저장/조회 화면 구현",
      task_type: "frontend",
      priority: "high",
      owner_role: "frontend-builder",
      acceptance_criteria: [
        `${idea.one_liner || "핵심 가치"}를 검증하는 Slice 1 최소 입력 폼과 결과 화면이 동작합니다.`,
        surfaceGuidance.frontendSlice,
        "저장 후 새로고침 없이 목록과 선택 상태가 즉시 갱신됩니다.",
        surfaceGuidance.expansionGuard,
      ].join("\n"),
    },
    {
      title: "상태 UX와 폼 검증 추가",
      task_type: "frontend",
      priority: "medium",
      owner_role: "ux-polisher",
      acceptance_criteria: [
        "필수 입력 오류, 저장 중, 성공, 실패, 권한 없음, 읽기 전용 상태가 같은 화면 안에서 이해됩니다.",
        surfaceGuidance.stateCoverage,
        "모바일 폭에서 버튼, 긴 텍스트, 입력 필드가 겹치지 않습니다.",
      ].join("\n"),
    },
    {
      title: primaryExperiment ? "실험 성공 지표 계측" : "첫 실험 성공 지표 정의",
      task_type: "qa",
      priority: primaryExperiment ? "medium" : "high",
      owner_role: "qa-runner",
      acceptance_criteria: [
        primaryExperiment
          ? `실험 "${primaryExperiment.name}"의 성공 지표를 수동 또는 이벤트 로그로 확인할 수 있어야 합니다.\n성공 지표: ${primaryExperiment.success_metric || "미정"}`
          : "첫 실험 이름과 성공 지표가 저장되고, QA 스모크에서 확인할 수 있어야 합니다.",
        surfaceGuidance.qaSmoke,
      ].join("\n"),
    },
    {
      title: hasHighRisk ? "높은 리스크 완화 검증" : "보안/개인정보 기본 점검",
      task_type: "security",
      priority: hasHighRisk ? "high" : "medium",
      owner_role: "security-reviewer",
      acceptance_criteria: hasHighRisk
        ? [
            risks
              .filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed")
              .map((risk) => `- ${risk.title}: ${risk.mitigation || "완화 방안 필요"}`)
              .join("\n"),
            surfaceGuidance.securityFocus,
          ].join("\n")
        : ["개인정보 최소 수집, 비밀값 노출, 권한 우회, 로그 민감정보 여부를 확인합니다.", surfaceGuidance.securityFocus].join(
            "\n",
          ),
    },
    {
      title: "Vercel Preview/Production 스모크와 롤백 기록",
      task_type: "deploy",
      priority: "medium",
      owner_role: "release-manager",
      acceptance_criteria: [
        "Preview URL에서 핵심 여정이 통과하고, Production 배포 후 동일 스모크가 통과합니다.",
        surfaceGuidance.deployHandoff,
        "환경변수 경계, 백엔드 규칙 허용/차단 검증, Vercel inspect URL 또는 배포 로그, 롤백 방법이 완료 보고에 기록됩니다.",
      ].join("\n"),
    },
  ];
}
