import { artifactLabels } from "@/lib/artifact-labels";
import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import {
  implementationTaskPriorityLabels,
  implementationTaskTypeLabels,
} from "@/lib/implementation-task-metadata";
import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea, Risk, VentureArtifact } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  riskSeverityLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type DevelopmentKickoffState = Pick<Idea, "stage" | "decision" | "next_evidence" | "product_surface">;

export type DevelopmentKickoffGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export function countPassedDevelopmentKickoffChecks(readinessChecks: DevelopmentKickoffGateCheck[]) {
  return readinessChecks.filter((check) => check.passed).length;
}

export function getFailedDevelopmentKickoffChecks(readinessChecks: DevelopmentKickoffGateCheck[]) {
  return readinessChecks.filter((check) => !check.passed);
}

export function getMvpSliceDevelopmentKickoffArtifact(artifacts: VentureArtifact[]) {
  return artifacts.find((artifact) => artifact.source === "mvp_slice_plan") ?? null;
}

export function getApprovedDevelopmentKickoffProductArtifacts(artifacts: VentureArtifact[]) {
  return artifacts.filter(
    (artifact) =>
      artifact.status === "approved" &&
      ["prd", "mvp_spec", "design_brief", "tech_spec", "backend_decision"].includes(artifact.artifact_type),
  );
}

export function getOpenHighDevelopmentKickoffRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
}

export function buildDevelopmentKickoffMarkdown({
  idea,
  state,
  readinessChecks,
  taskDrafts,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: DevelopmentKickoffState;
  readinessChecks: DevelopmentKickoffGateCheck[];
  taskDrafts: ImplementationTaskDraft[];
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const passedCount = countPassedDevelopmentKickoffChecks(readinessChecks);
  const failedChecks = getFailedDevelopmentKickoffChecks(readinessChecks);
  const mvpSliceArtifact = getMvpSliceDevelopmentKickoffArtifact(artifacts);
  const approvedProductArtifacts = getApprovedDevelopmentKickoffProductArtifacts(artifacts);
  const highRiskLines = getOpenHighDevelopmentKickoffRisks(risks).map(
    (risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${risk.mitigation || "완화 조건 미정"}`,
  );
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 4)
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다. 개발 전 성공 지표를 먼저 고정하세요.";
  const taskLines =
    taskDrafts.length > 0
      ? taskDrafts
          .map(
            (task, index) =>
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${
                implementationTaskPriorityLabels[task.priority]
              } / ${task.owner_role}`,
          )
          .join("\n")
      : "생성 가능한 기본 태스크가 없습니다.";
  const blockedLines =
    failedChecks.length > 0
      ? failedChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
      : "- 개발 착수 전 필수 점검이 통과 상태입니다.";

  return `# 제작 시작 요약: ${idea.name}

## 킥오프 판정

- 개발 착수 준비도: ${passedCount}/${readinessChecks.length}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}
- 추가 확인 내용: ${state.next_evidence || "미정"}

## 시작 전 차단 항목

${blockedLines}

## 범위 잠금

- 기준 문서: ${mvpSliceArtifact ? `${mvpSliceArtifact.title} v${mvpSliceArtifact.version ?? 1}` : "첫 제작 범위 플랜 미저장"}
- 이번 개발은 Slice 1 얇은 제품 슬라이스를 ${productSurface.firstBuild} 기준으로만 구현합니다.
- Slice 2 AI/자동화는 Slice 1 사용 증거가 생기기 전까지 보류합니다.
- 인증, 저장, 조회, 권한 차단, 상태 UX, 배포 스모크가 없는 기능 추가는 하지 않습니다.
- 결제, 외부 계정 직접 조작, 민감 데이터 자동 처리, 복잡한 관리자 백오피스는 제외합니다.

## 승인된 입력

${
  approvedProductArtifacts.length > 0
    ? approvedProductArtifacts.map((artifact) => `- ${artifactLabels[artifact.artifact_type]}: ${artifact.title}`).join("\n")
    : "- 승인된 제품/기술 제작 자료가 없습니다."
}

## 검증과 실험 기준

${experimentLines}

## 높은 리스크

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 열린 높음/치명 리스크가 없습니다."}

## 기본 구현 태스크 후보

${taskLines}

## 구현자 지시

1. 가장 먼저 범위 잠금 태스크를 완료하고 포함/제외/No-go/성공 지표를 증거로 남깁니다.
2. 기존 코드 패턴을 따르고 사용자 또는 다른 작업자의 변경을 되돌리지 않습니다.
3. 데이터 모델과 권한 경계는 UI보다 먼저 검증 가능한 형태로 정리합니다.
4. 완료 증거에는 커밋, 검증 명령, Preview 또는 Production URL, Vercel inspect 또는 배포 로그, RLS/Rules 허용/차단 결과, 롤백 기준을 남깁니다.
5. 막히는 작업은 차단 상태로 옮기고 차단 사유, 필요한 SQL/환경변수/외부 작업, 해소 조건을 적습니다.

## 완료 보고 형식

- 변경 요약:
- 구현 범위:
- 제외한 범위:
- 검증 결과:
- 배포/롤백:
- 남은 리스크:
- 다음 작업:
`;
}
