import { artifactLabels, artifactStatusLabels } from "@/lib/artifact-labels";
import {
  getImplementationEvidenceChecklist,
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
} from "@/lib/implementation-task-metadata";
import type { Experiment, Idea, ImplementationTask, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  phaseLabels,
  riskSeverityLabels,
  riskStatusLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type DevelopmentCompletionGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

type DevelopmentCompletionState = Pick<Idea, "stage" | "decision">;

export type DevelopmentCompletionTaskStats = {
  completedTaskCount: number;
  taskEvidenceCount: number;
};

export function getDoneDevelopmentCompletionRuns(runs: OrchestrationRun[]) {
  return runs.filter((run) => run.status === "done");
}

export function buildDevelopmentCompletionTaskStats(
  implementationTasks: ImplementationTask[],
): DevelopmentCompletionTaskStats {
  const completedTasks = implementationTasks.filter((task) => task.status === "done");

  return {
    completedTaskCount: completedTasks.length,
    taskEvidenceCount: completedTasks.filter((task) => task.evidence.trim()).length,
  };
}

export function getReleaseEvidenceImplementationTasks(implementationTasks: ImplementationTask[]) {
  return implementationTasks.filter((task) => ["backend", "data", "security", "deploy"].includes(task.task_type));
}

export function buildDevelopmentCompletionReportMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
  implementationGateChecks,
  launchReadiness,
  nextLaunchBlocker,
}: {
  idea: Idea;
  state: DevelopmentCompletionState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
  implementationGateChecks: DevelopmentCompletionGateCheck[];
  launchReadiness: DevelopmentCompletionGateCheck[];
  nextLaunchBlocker: DevelopmentCompletionGateCheck | null;
}) {
  const taskLines =
    implementationTasks.length > 0
      ? implementationTasks
          .map(
            (task) =>
              `- [${task.status === "done" ? "x" : " "}] ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}\n  - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n    ")}\n  - 완료 증거: ${task.evidence.trim() || "미기록"}`,
          )
          .join("\n")
      : "- 아직 생성된 개발 태스크가 없습니다.";
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`).join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- 연결된 실험이 없습니다.";
  const artifactLines =
    artifacts.length > 0
      ? artifacts
          .slice(0, 12)
          .map(
            (artifact) =>
              `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${artifact.title || "제목 없음"} (${artifactStatusLabels[artifact.status]})`,
          )
          .join("\n")
      : "- 저장된 제작 자료가 없습니다.";
  const doneRuns = getDoneDevelopmentCompletionRuns(runs);
  const doneRunLines =
    doneRuns.length > 0
      ? doneRuns.map((run) => `- ${phaseLabels[run.phase]}: ${run.owner_role || "owner 미정"}`).join("\n")
      : "- 완료된 실행 단계가 없습니다.";
  const gateLines = implementationGateChecks
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`)
    .join("\n");
  const launchLines = launchReadiness
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`)
    .join("\n");
  const { completedTaskCount, taskEvidenceCount } = buildDevelopmentCompletionTaskStats(implementationTasks);
  const releaseEvidenceTasks = getReleaseEvidenceImplementationTasks(implementationTasks);
  const releaseEvidenceLines =
    releaseEvidenceTasks.length > 0
      ? releaseEvidenceTasks
          .map((task) => {
            const checklist = getImplementationEvidenceChecklist(task, task.evidence ?? "");
            const passed = checklist.filter((item) => item.passed).length;
            const missing = checklist.filter((item) => !item.passed).map((item) => item.label);

            return `- ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / 증거 품질 ${passed}/${checklist.length}
  - 보완 필요: ${missing.length > 0 ? missing.join(", ") : "없음"}
  - 완료 증거: ${task.evidence.trim() || "미기록"}`;
          })
          .join("\n")
      : "- 릴리스 안전장치와 직접 연결된 백엔드, 데이터, 보안, 배포 태스크가 아직 없습니다.";

  return `# 개발 완료 보고서: ${idea.name}

## 요약

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 개발 태스크: ${completedTaskCount}/${implementationTasks.length} 완료
- 완료 증거: ${taskEvidenceCount}/${completedTaskCount} 기록
- 다음 출시 차단 항목: ${nextLaunchBlocker ? `${nextLaunchBlocker.label} - ${nextLaunchBlocker.detail}` : "없음"}

## 개발 완료 점검

${gateLines || "- 점검이 아직 계산되지 않았습니다."}

## 구현 태스크와 증거

${taskLines}

## 릴리스 증거 요약

${releaseEvidenceLines}

## 제작 자료 상태

${artifactLines}

## 리스크 상태

${riskLines}

## 실험 상태

${experimentLines}

## 완료된 실행 단계

${doneRunLines}

## 출시 준비도

${launchLines || "- 출시 준비도 항목이 아직 없습니다."}

## 완료 판단 메모

- 모든 완료 태스크에는 커밋, PR, Preview URL, 검증 명령, 스모크 결과, 남은 리스크 중 최소 하나의 증거가 필요합니다.
- 릴리스 태스크에는 Vercel inspect URL 또는 배포 로그, Production alias 확인, 롤백 기준이 필요합니다.
- 백엔드 변경 태스크에는 Supabase RLS 또는 Firebase Security Rules/IAM의 허용/차단 검증이 필요합니다.
- 환경변수 변경 태스크에는 Preview/Production 변수명, 공개 키/서버 전용 비밀값 경계, 재배포 여부가 필요합니다.
- 차단 태스크가 있으면 출시 판단은 보류합니다.
- 프로덕션 배포 후 로그인, 저장, 조회, 권한 차단, 모바일 화면을 다시 확인합니다.
`;
}
