import { artifactLabels, artifactStatusLabels } from "@/lib/artifact-labels";
import type { ArtifactReviewItem } from "@/lib/artifact-review-queue";
import {
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
} from "@/lib/implementation-task-metadata";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Decision, Experiment, Idea, ImplementationTask, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  phaseLabels,
  riskSeverityLabels,
  riskStatusLabels,
  runStatusLabels,
} from "@/lib/workbench-labels";

export type ReleaseDecisionConfidence = "high" | "medium" | "low";

export type ReleaseDecisionPacket = {
  recommendation: DecisionStatus;
  confidence: ReleaseDecisionConfidence;
  confidenceLabel: string;
  headline: string;
  blockers: string[];
  greenSignals: string[];
  requiredActions: string[];
  markdown: string;
};

type ReleaseDecisionState = Pick<Idea, "decision">;

type ReleaseDecisionGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export function buildReleaseDecisionPacket({
  idea,
  state,
  score,
  scoreRecommendation,
  launchReadinessScore,
  launchReadiness,
  implementationGateScore,
  implementationGateChecks,
  artifactReviewProgress,
  artifactReviewQueue,
  nextLaunchBlocker,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
  decisions,
}: {
  idea: Idea;
  state: ReleaseDecisionState;
  score: number;
  scoreRecommendation: DecisionStatus;
  launchReadinessScore: number;
  launchReadiness: ReleaseDecisionGateCheck[];
  implementationGateScore: number;
  implementationGateChecks: ReleaseDecisionGateCheck[];
  artifactReviewProgress: number;
  artifactReviewQueue: ArtifactReviewItem[];
  nextLaunchBlocker: ReleaseDecisionGateCheck | null;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
  decisions: Decision[];
}): ReleaseDecisionPacket {
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const blockedTasks = implementationTasks.filter((task) => task.status === "blocked");
  const failedImplementationChecks = implementationGateChecks.filter((check) => !check.passed);
  const unapprovedArtifacts = artifactReviewQueue.filter((item) => item.status !== "approved");
  const completedTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const completedRuns = runs.filter((run) => run.status === "done");
  const latestDecision = decisions[0] ?? null;
  const releaseReady =
    launchReadinessScore === 100 &&
    implementationGateScore === 100 &&
    artifactReviewProgress === 100 &&
    openHighRisks.length === 0 &&
    blockedTasks.length === 0 &&
    implementationTasks.length > 0;

  let recommendation: DecisionStatus = "research_more";

  if (state.decision === "kill" || (score <= 8 && launchReadinessScore < 40)) {
    recommendation = "kill";
  } else if (state.decision === "pivot" || (score < 15 && launchReadinessScore < 60)) {
    recommendation = "pivot";
  } else if (releaseReady) {
    recommendation = "ship";
  } else if (scoreRecommendation === "ship" && launchReadinessScore >= 80 && openHighRisks.length === 0) {
    recommendation = "research_more";
  } else {
    recommendation = scoreRecommendation === "pending" ? "research_more" : scoreRecommendation;
  }

  const blockers = [
    ...(nextLaunchBlocker ? [`출시 준비도: ${nextLaunchBlocker.label} - ${nextLaunchBlocker.detail}`] : []),
    ...openHighRisks.map(
      (risk) => `높은 리스크: ${risk.title} (${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status})`,
    ),
    ...blockedTasks.map((task) => `차단 태스크: ${task.title} (${implementationTaskTypeLabels[task.task_type]})`),
    ...failedImplementationChecks.map((check) => `개발 완료 점검: ${check.label} - ${check.detail}`),
    ...unapprovedArtifacts.slice(0, 4).map((item) => `제작 자료 승인: ${item.label} - ${item.detail}`),
  ].slice(0, 8);

  const greenSignals = [
    `출시 준비도 ${launchReadinessScore}% (${launchReadiness.filter((check) => check.passed).length}/${launchReadiness.length})`,
    `개발 완료 점검 ${implementationGateScore}% (${implementationGateChecks.filter((check) => check.passed).length}/${implementationGateChecks.length})`,
    `제작 자료 승인 ${artifactReviewProgress}% (${artifactReviewQueue.filter((item) => item.status === "approved").length}/${artifactReviewQueue.length})`,
    `구현 태스크 ${completedTaskCount}/${implementationTasks.length} 완료`,
    `실행 단계 ${completedRuns.length}/${runs.length} 완료`,
    latestDecision ? `최근 판단 기록: ${decisionLabels[latestDecision.decision]} - ${latestDecision.reason || "근거 미기록"}` : "최근 판단 기록 없음",
  ].filter(Boolean);

  const requiredActions = releaseReady
    ? [
        "`판단 기록`에서 최종 판단을 `진행`으로 기록합니다.",
        "`출시 판단 패킷`을 제작 자료로 저장하고 승인합니다.",
        "Production smoke, Vercel inspect URL, 롤백 기준을 릴리스 노트에 남깁니다.",
      ]
    : [
        ...(unapprovedArtifacts.length > 0 ? [`AI가 저장한 자료에서 ${unapprovedArtifacts[0].label}부터 확인하거나 보완합니다.`] : []),
        ...(failedImplementationChecks.length > 0 ? [`앱 개발 > 완료와 핸드오프에서 ${failedImplementationChecks[0].label} 항목을 먼저 해소합니다.`] : []),
        ...(openHighRisks.length > 0 ? [`리스크 탭에서 ${openHighRisks[0].title}의 종료 또는 수용 판단을 기록합니다.`] : []),
        ...(nextLaunchBlocker ? [`출시 준비도에서 ${nextLaunchBlocker.label} 항목을 해소합니다.`] : []),
        "`판단 기록`에 보류 사유와 다음 확인 행동을 남깁니다.",
      ];

  const confidence: ReleaseDecisionConfidence =
    releaseReady || (launchReadinessScore >= 90 && blockers.length <= 1)
      ? "high"
      : launchReadinessScore >= 65 || implementationGateScore >= 70
        ? "medium"
        : "low";
  const confidenceLabel = confidence === "high" ? "높음" : confidence === "medium" ? "보통" : "낮음";
  const headline =
    recommendation === "ship"
      ? "핵심 출시 점검이 끝나 진행 판단을 기록할 수 있습니다."
      : recommendation === "pivot"
        ? "현재 범위로는 출시보다 세그먼트, 문제, 첫 제작 범위 전환이 우선입니다."
        : recommendation === "kill"
          ? "추가 자원을 투입하기 전에 중단 판단을 검토해야 합니다."
          : "출시 전 보완해야 할 증거 또는 실행 점검이 남아 있습니다.";
  const launchLines =
    launchReadiness.length > 0
      ? launchReadiness.map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`).join("\n")
      : "- 출시 준비도 항목이 없습니다.";
  const implementationLines =
    implementationGateChecks.length > 0
      ? implementationGateChecks.map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`).join("\n")
      : "- 개발 완료 점검 항목이 없습니다.";
  const artifactLines =
    artifactReviewQueue.length > 0
      ? artifactReviewQueue
          .map((item) => `- [${item.status === "approved" ? "x" : " "}] ${item.label}: ${item.detail}`)
          .join("\n")
      : "- 승인 큐가 없습니다.";
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`).join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- 연결된 실험이 없습니다.";
  const taskLines =
    implementationTasks.length > 0
      ? implementationTasks
          .map(
            (task) =>
              `- [${task.status === "done" ? "x" : " "}] ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]}\n  - 증거: ${task.evidence.trim() || "미기록"}`,
          )
          .join("\n")
      : "- 구현 태스크가 없습니다.";
  const runLines =
    runs.length > 0
      ? runs.map((run) => `- ${phaseLabels[run.phase]}: ${runStatusLabels[run.status]} / ${run.owner_role || "담당 미정"}`).join("\n")
      : "- 실행 기록이 없습니다.";
  const decisionLines =
    decisions.length > 0
      ? decisions.map((decision) => `- ${decisionLabels[decision.decision]}: ${decision.reason || "근거 미기록"}`).join("\n")
      : "- 판단 기록이 없습니다.";
  const artifactSnapshotLines =
    artifacts.length > 0
      ? artifacts
          .slice(0, 12)
          .map((artifact) => `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${artifactStatusLabels[artifact.status]}`)
          .join("\n")
      : "- 저장된 제작 자료가 없습니다.";
  const blockersMarkdown = blockers.length > 0 ? blockers.map((item) => `- ${item}`).join("\n") : "- 차단 항목 없음";
  const greenSignalsMarkdown = greenSignals.map((item) => `- ${item}`).join("\n");
  const actionsMarkdown = requiredActions.map((item) => `- ${item}`).join("\n");

  return {
    recommendation,
    confidence,
    confidenceLabel,
    headline,
    blockers,
    greenSignals,
    requiredActions,
    markdown: `# 출시 판단 패킷: ${idea.name}

## 최종 권고

- 권고 판단: ${decisionLabels[recommendation]}
- 판단 신뢰도: ${confidenceLabel}
- 한 줄 결론: ${headline}
- 현재 운영 판단: ${decisionLabels[state.decision]}
- 점수 기반 추천: ${decisionLabels[scoreRecommendation]} (${score}점)
- 출시 준비도: ${launchReadinessScore}%
- 개발 완료 점검: ${implementationGateScore}%
- 제작 자료 승인: ${artifactReviewProgress}%

## 차단 항목

${blockersMarkdown}

## 진행 신호

${greenSignalsMarkdown}

## 다음 액션

${actionsMarkdown}

## 출시 준비도 상세

${launchLines}

## 개발 완료 점검 상세

${implementationLines}

## 제작 자료 승인 큐

${artifactLines}

## 구현 태스크와 증거

${taskLines}

## 리스크

${riskLines}

## 실험

${experimentLines}

## 실행 단계

${runLines}

## 최근 제작 자료 스냅샷

${artifactSnapshotLines}

## 판단 기록

${decisionLines}

## 운영 메모

- 진행 판단은 QA, 보안, 높은 리스크, Production smoke, 롤백 기준이 닫힌 뒤 기록합니다.
- 추가 조사 판단은 첫 번째 차단 항목을 다음 실험 또는 구현 태스크로 전환합니다.
- 전환 판단은 대상 사용자, 구매자, 첫 제작 범위 중 어느 축을 바꿀지 명시합니다.
- 중단 판단은 보존할 학습과 재검토 조건을 남깁니다.
`,
  };
}
