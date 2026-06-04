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

export type ReleasePackageArtifactSaveDraft = {
  artifactType: "dev_runbook" | "launch_checklist";
  body: string;
  source: "development_report" | "mvp_build_command" | "post_launch_learning" | "qa_acceptance_matrix";
  title: string;
};

export type ReleasePackageArtifactSaveControlState = {
  disabled: boolean;
  label: string;
};

export type ReleasePackageArtifactSaveControlStates = {
  developmentCompletionReport: ReleasePackageArtifactSaveControlState;
  mvpBuildCommandPacket: ReleasePackageArtifactSaveControlState;
  postLaunchLearningLoop: ReleasePackageArtifactSaveControlState;
  qaAcceptanceMatrix: ReleasePackageArtifactSaveControlState;
};

const emptyReleasePackageDraftState: ReleasePackageDraftState = {
  developmentCompletionReportDraft: "",
  mvpBuildCommandPacketDraft: "",
  postLaunchLearningLoopDraft: "",
  qaAcceptanceMatrixDraft: "",
  releaseDecisionPacket: null,
};

export function buildReleasePackageArtifactSaveControlStates({
  developmentCompletionReportSaveDraft,
  hasUser,
  isBusy,
  mvpBuildCommandPacketSaveDraft,
  postLaunchLearningLoopSaveDraft,
  qaAcceptanceMatrixSaveDraft,
}: {
  developmentCompletionReportSaveDraft: ReleasePackageArtifactSaveDraft | null;
  hasUser: boolean;
  isBusy: boolean;
  mvpBuildCommandPacketSaveDraft: ReleasePackageArtifactSaveDraft | null;
  postLaunchLearningLoopSaveDraft: ReleasePackageArtifactSaveDraft | null;
  qaAcceptanceMatrixSaveDraft: ReleasePackageArtifactSaveDraft | null;
}): ReleasePackageArtifactSaveControlStates {
  return {
    developmentCompletionReport: {
      disabled: isBusy || !hasUser || !developmentCompletionReportSaveDraft,
      label: "보고서 저장",
    },
    mvpBuildCommandPacket: {
      disabled: isBusy || !hasUser || !mvpBuildCommandPacketSaveDraft,
      label: "안내 저장",
    },
    postLaunchLearningLoop: {
      disabled: isBusy || !hasUser || !postLaunchLearningLoopSaveDraft,
      label: "기준 저장",
    },
    qaAcceptanceMatrix: {
      disabled: isBusy || !hasUser || !qaAcceptanceMatrixSaveDraft,
      label: "점검표 저장",
    },
  };
}

export function buildReleasePackageArtifactSaveDrafts({
  developmentCompletionReportDraft,
  ideaName,
  mvpBuildCommandPacketDraft,
  postLaunchLearningLoopDraft,
  qaAcceptanceMatrixDraft,
}: {
  developmentCompletionReportDraft: string;
  ideaName: string | null;
  mvpBuildCommandPacketDraft: string;
  postLaunchLearningLoopDraft: string;
  qaAcceptanceMatrixDraft: string;
}) {
  return {
    developmentCompletionReportSaveDraft:
      ideaName && developmentCompletionReportDraft
        ? {
            artifactType: "dev_runbook" as const,
            body: developmentCompletionReportDraft,
            source: "development_report" as const,
            title: `${ideaName} 제작 완료 보고서`,
          }
        : null,
    mvpBuildCommandPacketSaveDraft:
      ideaName && mvpBuildCommandPacketDraft
        ? {
            artifactType: "dev_runbook" as const,
            body: mvpBuildCommandPacketDraft,
            source: "mvp_build_command" as const,
            title: `${ideaName} 제작 시작 안내 묶음`,
          }
        : null,
    postLaunchLearningLoopSaveDraft:
      ideaName && postLaunchLearningLoopDraft
        ? {
            artifactType: "launch_checklist" as const,
            body: postLaunchLearningLoopDraft,
            source: "post_launch_learning" as const,
            title: `${ideaName} 출시 후 성과 확인`,
          }
        : null,
    qaAcceptanceMatrixSaveDraft:
      ideaName && qaAcceptanceMatrixDraft
        ? {
            artifactType: "dev_runbook" as const,
            body: qaAcceptanceMatrixDraft,
            source: "qa_acceptance_matrix" as const,
            title: `${ideaName} 품질 점검표`,
          }
        : null,
  };
}

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
