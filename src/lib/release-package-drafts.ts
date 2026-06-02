import { buildDevelopmentCompletionReportMarkdown } from "@/lib/development-completion-report";
import { buildMvpBuildCommandPacketMarkdown } from "@/lib/mvp-build-command-packet-markdown";
import { buildPostLaunchLearningLoopMarkdown } from "@/lib/post-launch-learning-loop-markdown";
import { buildQaAcceptanceMatrixMarkdown } from "@/lib/qa-acceptance-matrix-markdown";
import { buildReleaseDecisionPacket, type ReleaseDecisionPacket } from "@/lib/release-decision-packet";
import type { ArtifactReviewItem } from "@/lib/artifact-review-queue";
import type { BackendCandidateScore } from "@/lib/backend-planning";
import type { ImplementationDependencyStatus } from "@/lib/implementation-task-metadata";
import type { DecisionStatus } from "@/lib/supabase/types";
import type {
  Decision,
  Experiment,
  Idea,
  ImplementationTask,
  OrchestrationRun,
  Risk,
  VentureArtifact,
} from "@/lib/venture-data";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";

type ReleasePackageGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type ReleasePackageDraftState = {
  developmentCompletionReportDraft: string;
  mvpBuildCommandPacketDraft: string;
  postLaunchLearningLoopDraft: string;
  qaAcceptanceMatrixDraft: string;
  releaseDecisionPacket: ReleaseDecisionPacket | null;
};

const emptyReleasePackageDraftState: ReleasePackageDraftState = {
  developmentCompletionReportDraft: "",
  mvpBuildCommandPacketDraft: "",
  postLaunchLearningLoopDraft: "",
  qaAcceptanceMatrixDraft: "",
  releaseDecisionPacket: null,
};

export function buildReleasePackageDraftState({
  appBlueprint,
  artifactReviewProgress,
  artifactReviewQueue,
  artifacts,
  backendCandidateScores,
  decisions,
  dependencyStatuses,
  experiments,
  idea,
  implementationGateChecks,
  implementationGateScore,
  implementationHandoff,
  implementationTasks,
  launchReadiness,
  launchReadinessScore,
  nextLaunchBlocker,
  risks,
  runs,
  scaffoldManifest,
  score,
  scoreRecommendation,
  state,
}: {
  appBlueprint: string;
  artifactReviewProgress: number;
  artifactReviewQueue: ArtifactReviewItem[];
  artifacts: VentureArtifact[];
  backendCandidateScores: BackendCandidateScore[];
  decisions: Decision[];
  dependencyStatuses: ImplementationDependencyStatus[];
  experiments: Experiment[];
  idea: Idea | null;
  implementationGateChecks: ReleasePackageGateCheck[];
  implementationGateScore: number;
  implementationHandoff: string;
  implementationTasks: ImplementationTask[];
  launchReadiness: ReleasePackageGateCheck[];
  launchReadinessScore: number;
  nextLaunchBlocker: ReleasePackageGateCheck | null;
  risks: Risk[];
  runs: OrchestrationRun[];
  scaffoldManifest: string;
  score: number;
  scoreRecommendation: DecisionStatus;
  state: WorkbenchEditState | null;
}): ReleasePackageDraftState {
  if (!idea || !state) {
    return emptyReleasePackageDraftState;
  }

  const releaseDecisionPacket = buildReleaseDecisionPacket({
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
  });

  return {
    releaseDecisionPacket,
    mvpBuildCommandPacketDraft: buildMvpBuildCommandPacketMarkdown({
      idea,
      state,
      appBlueprint,
      scaffoldManifest,
      implementationHandoff,
      releaseDecisionPacket,
      implementationTasks,
      dependencyStatuses,
      backendCandidateScores,
      artifactReviewQueue,
    }),
    qaAcceptanceMatrixDraft: buildQaAcceptanceMatrixMarkdown({
      idea,
      state,
      risks,
      experiments,
      implementationTasks,
      launchReadiness,
      implementationGateChecks,
      releaseDecisionPacket,
      backendCandidateScores,
    }),
    postLaunchLearningLoopDraft: buildPostLaunchLearningLoopMarkdown({
      idea,
      state,
      experiments,
      risks,
      releaseDecisionPacket,
      launchReadiness,
      implementationTasks,
    }),
    developmentCompletionReportDraft: buildDevelopmentCompletionReportMarkdown({
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
    }),
  };
}
