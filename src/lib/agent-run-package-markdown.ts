import { artifactLabels, artifactSourceLabels } from "@/lib/artifact-labels";
import { getApprovedAgentRunPackageArtifacts } from "@/lib/agent-run-package-artifacts";
import {
  externalBuildToolProfiles,
  type BuildDeliveryMode,
  type ExternalBuildToolProfile,
} from "@/lib/build-delivery";
import { buildExternalProductionPackageGuide } from "@/lib/external-production-package-guide";
import {
  getImplementationEvidenceChecklist,
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
  sortImplementationTasksForAction,
} from "@/lib/implementation-task-metadata";
import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import {
  buildProductSurfaceContextSection,
  implementationSurfaceTaskGuidance,
} from "@/lib/product-surface-implementation";
import type { Experiment, Idea, ImplementationTask, Risk, VentureArtifact } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  riskSeverityLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type AgentRunPackageState = Pick<Idea, "stage" | "decision" | "next_evidence" | "product_surface">;

type AgentRunPackageGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export function buildAgentRunPackageMarkdown({
  idea,
  state,
  artifacts,
  tasks,
  nextTask,
  risks,
  experiments,
  readinessChecks,
  filterSummary,
  buildDeliveryMode = "external_tool",
  externalBuildTool = externalBuildToolProfiles.cursor,
}: {
  idea: Idea;
  state: AgentRunPackageState;
  artifacts: VentureArtifact[];
  tasks: ImplementationTask[];
  nextTask: ImplementationTask | null;
  risks: Risk[];
  experiments: Experiment[];
  readinessChecks: AgentRunPackageGateCheck[];
  filterSummary: string;
  buildDeliveryMode?: BuildDeliveryMode;
  externalBuildTool?: ExternalBuildToolProfile;
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const approvedArtifacts = getApprovedAgentRunPackageArtifacts(artifacts);
  const sourceLines =
    approvedArtifacts.length > 0
      ? approvedArtifacts
          .slice(0, 10)
          .map(
            (artifact) =>
              `- ${artifactLabels[artifact.artifact_type]} / ${artifactSourceLabels[artifact.source] ?? artifact.source}: ${
                artifact.title || "제목 없음"
              } / v${artifact.version ?? 1}`,
          )
          .join("\n")
      : "- 승인된 제작 자료가 없습니다. 실행 전 제품 기획서, 첫 제작 범위, 디자인 기준, 기술 명세 중 필요한 항목을 승인하세요.";
  const taskLines =
    tasks.length > 0
      ? sortImplementationTasksForAction(tasks)
          .slice(0, 8)
          .map((task, index) => {
            const checklist = getImplementationEvidenceChecklist(task, task.evidence ?? "");
            const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);

            return [
              `${index + 1}. ${task.title}`,
              `   - 유형/상태/우선순위: ${implementationTaskTypeLabels[task.task_type]} / ${
                implementationTaskStatusLabels[task.status]
              } / ${implementationTaskPriorityLabels[task.priority]}`,
              `   - 담당 역할: ${task.owner_role || "owner 미정"}`,
              `   - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n     ") || "미정"}`,
              `   - 증거 공백: ${missingLabels.length > 0 ? missingLabels.join(", ") : "없음"}`,
            ].join("\n");
          })
          .join("\n")
      : "- 현재 실행할 개발 태스크가 없습니다. 기본 태스크를 생성하거나 필터를 초기화하세요.";
  const blockerLines = readinessChecks
    .filter((check) => !check.passed)
    .map((check) => `- ${check.label}: ${check.detail}`);
  const riskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed")
    .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${risk.mitigation || "완화 조건 미정"}`);
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 5)
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다.";

  return `# 제작 패키지: ${idea.name}

너는 이 제품의 제작 담당자입니다. 아래 자료에 포함된 승인 제작 자료와 태스크만 기준으로 작업합니다.

## 실행 모드

- 현재 필터: ${filterSummary}
- 다음 1순위 태스크: ${nextTask ? nextTask.title : "없음"}
- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}
- 추가 확인 내용: ${state.next_evidence || "미정"}

${buildProductSurfaceContextSection(productSurface, surfaceGuidance)}

${buildExternalProductionPackageGuide(productSurface, buildDeliveryMode, externalBuildTool)}

## 승인된 원천 제작 자료

${sourceLines}

## 시작 전 미해결 점검

${blockerLines.length > 0 ? blockerLines.join("\n") : "- 개발 착수 점검이 통과 상태입니다."}

## 실행 태스크

${taskLines}

## 실험 기준

${experimentLines}

## 열린 높은 리스크

${riskLines.length > 0 ? riskLines.join("\n") : "- 열린 높음/치명 리스크가 없습니다."}

## 범위 규칙

- 첫 제작 범위 플랜이 있으면 ${productSurface.firstBuild} 기준의 Slice 1 얇은 제품 구현만 처리합니다.
- Slice 2 AI/자동화, 결제, 외부 계정 직접 조작, 복잡한 관리자 기능은 별도 승인 전까지 만들지 않습니다.
- 사용자가 직접 해야 하는 SQL, 환경변수, Vercel 설정, GitHub workflow scope 작업은 코드 블록과 실행 위치를 분리해 보고합니다.
- 다른 작업자의 변경을 되돌리지 않고 현재 코드베이스 패턴을 따릅니다.

## 검증 명령

- pnpm lint
- pnpm typecheck
- pnpm harness:check
- 필요 시 pnpm quality:full
- 배포 후 pnpm smoke:prod, pnpm smoke:routes

## 완료 보고

- 변경 요약:
- 수정 파일:
- 검증 결과:
- 배포/스모크:
- SQL/환경변수/외부 작업:
- 남은 리스크:
- 다음 작업:
`;
}
