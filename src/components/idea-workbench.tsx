"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowDownToLine,
  Beaker,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Code2,
  Flag,
  Layers3,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  artifactPanelDescriptions,
  artifactPanelLabels,
  buildArtifactReviewQueue,
  developmentPanelDescriptions,
  developmentPanelLabels,
  type ArtifactPanel,
  type ArtifactReviewItem,
  type DevelopmentPanel,
} from "@/lib/artifact-review-queue";
import {
  artifactReviewIntensityTone,
  buildArtifactReviewMemo,
  summarizeArtifactLineChanges,
  summarizeArtifactReview,
  type ArtifactReviewSummary,
} from "@/lib/artifact-review-summary";
import { buildAgentRunPackageMarkdown } from "@/lib/agent-run-package-markdown";
import { buildAppBlueprintMarkdown } from "@/lib/app-blueprint-markdown";
import { buildBackendDecisionMarkdown, buildBackendExecutionPlanMarkdown } from "@/lib/backend-decision-markdown";
import {
  getActiveIdeas,
  isIdeaStageAtOrAfter,
  isDiscardedIdea,
  sortWorkbenchIdeas,
  upsertRecordById,
  upsertRecordsById,
  upsertWorkbenchIdea,
} from "@/lib/workbench-list-utils";
import {
  eventCountForWindow,
  formatStableKoreanDate,
  formatTelemetryProperties,
  formatTelemetryTime,
  productTelemetryFunnelSteps,
  productTelemetryTaxonomy,
  telemetryCategoryLabels,
  telemetryCategoryTone,
  telemetryEventLabels,
} from "@/lib/telemetry-format";
import {
  buildLearningTelemetryReportMarkdown,
  buildProductTelemetryFunnelMarkdown,
  buildTelemetryAdapterGuideMarkdown,
  buildTelemetryClientHelperSnippet,
  buildTelemetryEnvSnippet,
  buildTelemetryNextRouteSnippet,
  buildTelemetrySmokeCommandSnippet,
} from "@/lib/telemetry-artifacts";
import { buildDesignBriefMarkdown } from "@/lib/design-brief-markdown";
import { buildDesignGenerationPromptMarkdown } from "@/lib/design-generation-prompt-markdown";
import { buildTechSpecMarkdown } from "@/lib/tech-spec-markdown";
import {
  artifactLabels,
  artifactSourceLabels,
  artifactStatusDefaultNotes,
  artifactStatusLabels,
  artifactStatusTone,
} from "@/lib/artifact-labels";
import {
  productSurfaceMarkdown,
  productSurfaceProfiles,
  resolveProductSurfaceForIdea as inferIdeaProductSurface,
  withKoreanInstrumental,
} from "@/lib/product-surface";
import {
  buildSurfaceArchitectureNotes,
  buildSurfaceDesignContext,
  implementationSurfaceTaskGuidance,
} from "@/lib/product-surface-implementation";
import { isMissingProductSurfaceColumnError, omitProductSurface } from "@/lib/product-surface-db";
import { cleanInlineText, getApiMessage, isPlainRecord } from "@/lib/record-utils";
import {
  buildDeliveryModeLabels,
  externalBuildToolProfiles,
  getBuildDeliveryPreferenceFromArtifacts,
  getExternalBuildToolProfile,
  type BuildDeliveryMode,
  type ExternalBuildToolKey,
} from "@/lib/build-delivery";
import { toDownloadFileName } from "@/lib/download-file-name";
import {
  buildAntigravityMcpConfigJson,
  buildClaudeMcpConfigJson,
  buildCursorMcpConfigJson,
  buildCursorSyncConfigJson,
} from "@/lib/external-tool-connector-config";
import {
  buildAntigravityCliScript,
  buildClaudeCliScript,
  buildCodexCliScript,
} from "@/lib/external-tool-cli-scripts";
import { buildCursorMcpServerScript } from "@/lib/cursor-mcp-server-script";
import { buildExternalProductionPackageGuide } from "@/lib/external-production-package-guide";
import {
  buildAntigravityAcceptanceMarkdown,
  buildAntigravityAgentInstructionsMarkdown,
  buildAntigravityGuideMarkdown,
  buildAntigravityStartPromptMarkdown,
  buildAntigravityTaskMarkdown,
  buildClaudeGuideMarkdown,
  buildClaudeInstructionsMarkdown,
  buildClaudeStartPromptMarkdown,
  buildClaudeTaskMarkdown,
  buildCodexAgentInstructionsMarkdown,
  buildCodexGuideMarkdown,
  buildCodexStartPromptMarkdown,
  buildCodexTaskMarkdown,
  buildCursorGuideMarkdown,
  buildCursorRulesMarkdown,
  buildCursorStartPromptMarkdown,
  buildCursorTaskMarkdown,
} from "@/lib/external-tool-handoff-markdown";
import {
  buildCodexSetupPowerShell,
  buildCursorSetupPowerShell,
  buildLiveToolSetupPowerShell,
} from "@/lib/external-tool-setup-scripts";
import {
  cursorSyncRegistrySetupNotice,
  getExternalToolConnectionCreatedMessage,
  getExternalToolConnectionFallbackMessage,
  getExternalToolConnectionStatusFallbackMessage,
  getExternalToolSyncPreparingMessage,
  getExternalToolSyncSetupErrorMessage,
  upsertCursorSyncConnection,
  type CursorSyncConnection,
  type CursorSyncRegistryStatus,
} from "@/lib/external-tool-sync-connection";
import {
  FREE_MONTHLY_CREDITS,
  FREE_PACKAGE_ARTIFACT_LIMIT,
  FULL_PACKAGE_ARTIFACT_COUNT,
  IDEA_BUILD_PASS_CREDITS,
  getBuildPassCapacity,
  type CreditSummary,
} from "@/lib/billing";
import {
  buildMarketScanArtifactMarkdown,
  buildMarketScanEvidenceImplication,
  buildMarketScanEvidenceText,
  buildMarketScanLearningText,
  buildMarketScanResultText,
  getMarketScanLevelLabel,
  getMarketScanSourceStrengthTone,
  isMarketScanArtifactForProductSurface,
  isMarketScanArtifactRecord,
  marketScanSourceTypeLabels,
  normalizeMarketScanDraft,
  type MarketScanDraft,
} from "@/lib/market-scan";
import {
  getWorkbenchOperatorActionItems,
  getWorkbenchOperatorFocusCopy,
  getWorkbenchOperatorGateNote,
} from "@/lib/workbench-current-action-copy";
import {
  decisionLabels,
  editabilityLabels,
  evidenceConfidenceLabels,
  evidenceConfidenceOptions,
  experimentStatusGuides,
  experimentStatusLabels,
  filterModeLabels,
  orchestrationPhaseConfigs,
  phaseLabels,
  phaseOrder,
  riskSeverityLabels,
  riskStatusLabels,
  runStatusLabels,
  runStatusTone,
  scoreFieldDescriptions,
  stageLabels,
  type EvidenceConfidence,
} from "@/lib/workbench-labels";
import {
  buildCursorProgressImportDrafts,
  getCursorTaskCode,
  normalizeTaskLookupTitle,
  summarizeCursorProgressEvidence,
  type ImplementationTaskDraft,
} from "@/lib/external-progress-import";
import { buildImplementationDependencyPlanMarkdown } from "@/lib/implementation-dependency-plan";
import { buildImplementationTaskDrafts } from "@/lib/implementation-task-drafts";
import { buildLaunchChecklistMarkdown } from "@/lib/launch-checklist-report";
import { buildMvpSlicePlanMarkdown, buildMvpSpecMarkdown } from "@/lib/mvp-scope-markdown";
import { buildMvpBuildCommandPacketMarkdown } from "@/lib/mvp-build-command-packet-markdown";
import { buildMvpScaffoldManifestMarkdown } from "@/lib/mvp-scaffold-manifest-markdown";
import { buildPostLaunchLearningLoopMarkdown } from "@/lib/post-launch-learning-loop-markdown";
import { buildPrdHandoffMarkdown, buildPrdMarkdown } from "@/lib/prd-markdown";
import { buildQaAcceptanceMatrixMarkdown } from "@/lib/qa-acceptance-matrix-markdown";
import { buildReleaseDecisionPacket } from "@/lib/release-decision-packet";
import { buildRolePromptPackMarkdown } from "@/lib/role-prompt-pack-markdown";
import { buildRunOutputTemplate } from "@/lib/run-output-template";
import { buildEvidenceNoteMarkdown, buildExperimentResultMarkdown } from "@/lib/validation-evidence-markdown";
import {
  buildIdeaBriefMarkdown,
  buildResearchBriefMarkdown,
  buildValidationSprintMarkdown,
  buildValidationSummaryMarkdown,
} from "@/lib/validation-package-markdown";
import {
  buildFilteredImplementationRunPromptMarkdown,
  buildImplementationBacklogMarkdown,
  buildImplementationTaskTicketMarkdown,
} from "@/lib/implementation-task-markdown";
import { buildDevelopmentKickoffMarkdown } from "@/lib/development-kickoff-markdown";
import { buildImplementationHandoffMarkdown } from "@/lib/implementation-handoff-markdown";
import { buildDevelopmentCompletionReportMarkdown } from "@/lib/development-completion-report";
import {
  buildImplementationDependencyStatuses,
  getBlockedImplementationTaskHint,
  getImplementationEvidenceChecklist,
  getImplementationTaskOwnerRole,
  implementationEvidenceFilterLabels,
  implementationEvidenceFilterOptions,
  implementationStatusFilterLabels,
  implementationStatusFilterOptions,
  implementationTaskActionRank,
  implementationTaskExecutionOrder,
  implementationTaskPriorities,
  implementationTaskPriorityLabels,
  implementationTaskPriorityRank,
  implementationTaskPriorityTone,
  implementationTaskStatusLabels,
  implementationTaskStatuses,
  implementationTaskStatusTone,
  implementationTaskTypeLabels,
  implementationTaskTypes,
  sortImplementationTasksForAction,
  sortImplementationTasksForExecution,
  type ImplementationEvidenceFilter,
  type ImplementationStatusFilter,
} from "@/lib/implementation-task-metadata";
import type { WorkbenchTask } from "@/lib/workbench-tasks";
import { FinalExecutionConnectionManager } from "@/components/final-execution-connection-manager";
import { FinalExecutionExternalToolSection } from "@/components/final-execution-external-tool-section";
import { FinalExecutionHeader } from "@/components/final-execution-header";
import { FinalExecutionInternalPanel } from "@/components/final-execution-internal-panel";
import { FinalExecutionLearningCriteria } from "@/components/final-execution-learning-criteria";
import { FinalExecutionPackagePanel } from "@/components/final-execution-package-panel";
import { FinalExecutionQuickStart } from "@/components/final-execution-quick-start";
import { FinalExecutionReadinessSummary } from "@/components/final-execution-readiness-summary";
import { FinalExecutionSyncPanel } from "@/components/final-execution-sync-panel";
import { FinalExecutionTaskList } from "@/components/final-execution-task-list";
import { FinalExecutionToolGuide } from "@/components/final-execution-tool-guide";
import { MarketScanAutoRunner } from "@/components/market-scan-auto-runner";
import { ProductionCreditPanel } from "@/components/production-credit-panel";
import { ProductSurfaceSelector } from "@/components/product-surface-selector";
import { Step2ScoreHandoffBridge } from "@/components/step2-score-handoff-bridge";
import { Step3ValidationGateBridge } from "@/components/step3-validation-gate-bridge";
import { Step4ValidationBundleBridge } from "@/components/step4-validation-bundle-bridge";
import { Step6ExecutionBridge } from "@/components/step6-execution-bridge";
import { Step6ManualRunForm } from "@/components/step6-manual-run-form";
import { Step6RunList } from "@/components/step6-run-list";
import { Step6WorkOrderHeader } from "@/components/step6-work-order-header";
import { Step5AutoProgressTimeline } from "@/components/step5-auto-progress-timeline";
import { Step5BuildDirectionSummary } from "@/components/step5-build-direction-summary";
import { Step5ExecutionPackageBrief } from "@/components/step5-execution-package-brief";
import { Step5ExecutionPackageValueGrid } from "@/components/step5-execution-package-value-grid";
import { Step5PackageCurrentAction } from "@/components/step5-package-current-action";
import { Step5PackageReview } from "@/components/step5-package-review";
import { Step8ActionSummary } from "@/components/step8-action-summary";
import { Step8LearningHeader } from "@/components/step8-learning-header";
import { Step8OperatorReport } from "@/components/step8-operator-report";
import { Step8OutcomeDetails } from "@/components/step8-outcome-details";
import { Step8PrimaryCta } from "@/components/step8-primary-cta";
import { Step8ProgressSection } from "@/components/step8-progress-section";
import { Step8TelemetryAdapterGuide } from "@/components/step8-telemetry-adapter-guide";
import {
  DraftDocumentCard,
  GateChecklistPanel,
  InputField,
  ScoreInput,
  SelectField,
  TextArea,
} from "@/components/workbench-form-controls";
import { WorkbenchCurrentAction } from "@/components/workbench-current-action";
import { WorkbenchEmptyState } from "@/components/workbench-empty-state";
import type {
  Decision,
  Experiment,
  Idea,
  ImplementationTask,
  OrchestrationRun,
  Risk,
  TelemetryEvent,
  VentureArtifact,
} from "@/lib/venture-data";
import type {
  Database,
  DecisionStatus,
  ImplementationTaskPriority,
  ImplementationTaskStatus,
  ImplementationTaskType,
  Json,
  OrchestrationPhase,
  OrchestrationStatus,
  RiskSeverity,
  VentureArtifactStatus,
  VentureArtifactType,
} from "@/lib/supabase/types";

type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type ViewerUser = Pick<User, "id">;

export type { WorkbenchTask } from "@/lib/workbench-tasks";

const decisions: DecisionStatus[] = ["pending", "research_more", "ship", "pivot", "kill"];
const riskSeverities: RiskSeverity[] = ["low", "medium", "high", "critical"];
const orchestrationStatuses: OrchestrationStatus[] = ["planned", "running", "blocked", "done", "skipped"];
const adminRoles = new Set(["owner", "admin"]);
type EditState = Pick<
  Idea,
  | "stage"
  | "decision"
  | "problem_intensity"
  | "frequency"
  | "reachability"
  | "willingness_to_pay"
  | "mvp_speed"
  | "differentiation"
  | "regulatory_risk"
  | "signal"
  | "risk_summary"
  | "next_evidence"
  | "product_surface"
>;

type RiskDraft = {
  title: string;
  area: string;
  severity: RiskSeverity;
  mitigation: string;
};

type ExperimentDraft = {
  name: string;
  success_metric: string;
};

type RunDraft = {
  phase: OrchestrationPhase;
  owner_role: string;
  objective: string;
};

type EvidenceDraft = {
  title: string;
  source: string;
  evidence: string;
  implication: string;
  confidence: EvidenceConfidence;
};

type ExperimentResultDraft = {
  experiment_id: string;
  result: string;
  learning: string;
  next_decision: DecisionStatus;
  next_action: string;
};

type ValidationEvidenceCheck = {
  label: string;
  passed: boolean;
  detail: string;
  action: string;
};

type ValidationEvidenceCoach = {
  score: number;
  label: string;
  checks: ValidationEvidenceCheck[];
  nextFocus: ValidationEvidenceCheck | null;
  prompt: string;
};

type GateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

type BackendCandidateKey = "supabase" | "firebase" | "firebase_sql_connect" | "hybrid";

type BackendCandidateScore = {
  key: BackendCandidateKey;
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  cautions: string[];
};

type BackendExecutionCheck = {
  label: string;
  detail: string;
  evidence: string;
  tone: "required" | "recommended";
};

type BackendExecutionPlan = {
  backend: BackendCandidateScore;
  envVars: string[];
  checks: BackendExecutionCheck[];
  localCommand: string;
  productionGate: string;
  rollback: string;
};

type FirstBuildBridge = {
  stackTitle: string;
  stackReason: string;
  firstTasks: string[];
  excludeNow: string[];
  decisionAnchor: string;
};

export type WorkbenchStepReadiness = {
  selectedIdeaId: string | null;
  canEnterExperiment: boolean;
  canEnterArtifacts: boolean;
  canEnterDevelopment: boolean;
  canEnterOrchestration: boolean;
  canEnterLaunch: boolean;
  launchReadinessScore: number;
  nextLaunchBlockerLabel: string | null;
  nextLaunchBlockerDetail: string | null;
  hasIdeaBriefArtifact: boolean;
  hasResearchBriefArtifact: boolean;
  hasValidationSprintArtifact: boolean;
  hasValidationSummaryArtifact: boolean;
  hasDesignGenerationPromptArtifact: boolean;
  hasDevelopmentPlanArtifact: boolean;
  hasAgentRunPackageArtifact: boolean;
};

type DevelopmentAutoFlowState = "idle" | "running" | "review" | "summary";

function emitVentureEvent<T>(eventName: string, detail: T) {
  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
}

function toEditState(idea: Idea): EditState {
  return {
    stage: idea.stage,
    decision: idea.decision,
    problem_intensity: idea.problem_intensity,
    frequency: idea.frequency,
    reachability: idea.reachability,
    willingness_to_pay: idea.willingness_to_pay,
    mvp_speed: idea.mvp_speed,
    differentiation: idea.differentiation,
    regulatory_risk: idea.regulatory_risk,
    signal: idea.signal,
    risk_summary: idea.risk_summary,
    next_evidence: idea.next_evidence,
    product_surface: inferIdeaProductSurface(idea).key,
  };
}

function scoreState(state: EditState) {
  return (
    state.problem_intensity +
    state.frequency +
    state.reachability +
    state.willingness_to_pay +
    state.mvp_speed +
    state.differentiation -
    state.regulatory_risk
  );
}

function recommendationForScore(score: number): DecisionStatus {
  if (score >= 22) {
    return "ship";
  }

  if (score >= 15) {
    return "research_more";
  }

  if (score >= 9) {
    return "pivot";
  }

  return "kill";
}

function saveDecisionForScore(recommendation: DecisionStatus): DecisionStatus {
  return recommendation === "kill" ? "research_more" : recommendation;
}

function missingEvidence(idea: Idea, state: EditState, riskCount: number) {
  const missing = [];

  if (!idea.one_liner.trim()) {
    missing.push("한 줄 설명");
  }

  if (!idea.target_user.trim()) {
    missing.push("대상 사용자");
  }

  if (!idea.buyer.trim()) {
    missing.push("구매자");
  }

  if (!state.signal.trim()) {
    missing.push("수요 신호");
  }

  if (!state.next_evidence.trim()) {
    missing.push("추가로 확인할 내용");
  }

  if (riskCount === 0) {
    missing.push("연결된 리스크");
  }

  return missing;
}

function inferIdeaDomain(idea: Idea, state: EditState) {
  const text = `${idea.name} ${idea.one_liner} ${idea.target_user} ${idea.buyer} ${state.signal} ${state.risk_summary} ${state.next_evidence}`;

  if (/요양|간병|돌봄|시니어/.test(text)) {
    return "care";
  }

  if (/구독|결제|해지|카드|반복/.test(text)) {
    return "subscription";
  }

  if (/대화|협상|갈등|관계|코칭|역할극/.test(text)) {
    return "conversation";
  }

  if (/영상|사진|콘텐츠|숏폼|브이로그/.test(text)) {
    return "media";
  }

  if (/로컬|이웃|공유|대여|심부름/.test(text)) {
    return "local";
  }

  return "generic";
}

function includesAnyNormalized(text: string, terms: string[]) {
  const normalized = text.toLowerCase();

  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function buildValidationPlan({
  idea,
  state,
  score,
  risks,
  missing,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  risks: Risk[];
  missing: string[];
}) {
  const domain = inferIdeaDomain(idea, state);
  const openHighRiskCount = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed").length;
  const status =
    missing.length > 0
      ? "증거 공백 해소"
      : openHighRiskCount > 0
        ? "리스크 선검증"
        : score >= 22
          ? "첫 제작 후보"
          : score >= 15
            ? "추가 조사"
            : "중단 또는 전환 검토";
  const statusDetail =
    missing.length > 0
      ? `${missing[0]}부터 채워야 다음 단계 판단이 안정적입니다.`
      : openHighRiskCount > 0
        ? "높음/매우 높은 리스크가 남아 있어 제품 범위보다 안전장치를 먼저 확정해야 합니다."
        : "기본 증거가 정리되어 실험 결과를 기준으로 다음 판단을 내릴 수 있습니다.";

  const experimentsByDomain: Record<string, ExperimentDraft[]> = {
    care: [
      {
        name: "보호자-센터 조율 수동 파일럿",
        success_metric: "보호자/센터 5명 중 3명 이상이 현재 방식보다 확인 시간이 줄었다고 응답하고, 2명 이상이 월 3만원 이상 지불 의향을 밝힘.",
      },
      {
        name: "돌봄 기록 템플릿 반복 사용 테스트",
        success_metric: "3일 연속 기록 완료율 70% 이상, 누락/문의 감소 사례 2건 이상 확인.",
      },
    ],
    subscription: [
      {
        name: "구독 감사 리포트 수동 검증",
        success_metric: "사용자 5명 중 3명 이상이 실제 절감 후보를 발견하고, 2명 이상이 절감액 기반 수수료 또는 월 구독에 동의.",
      },
      {
        name: "해지 체크리스트 완료 테스트",
        success_metric: "해지 후보 10건 중 6건 이상이 사용자의 직접 행동으로 완료되고, 실패 사유가 분류됨.",
      },
    ],
    conversation: [
      {
        name: "실제 대화 전 리허설 테스트",
        success_metric: "사용자 5명 중 3명 이상이 대화 전 자신감이 2점 이상 상승하고, 2명 이상이 다음 상황에서도 재사용 의향을 밝힘.",
      },
      {
        name: "스크립트 선택률 테스트",
        success_metric: "상황별 스크립트 3안 중 하나를 실제로 사용한 비율 60% 이상.",
      },
    ],
    media: [
      {
        name: "수동 하이라이트 영상 파일럿",
        success_metric: "샘플 사용자 5명 중 3명 이상이 결과물을 저장 또는 공유하고, 2명 이상이 반복 제작 의향을 밝힘.",
      },
      {
        name: "스토리보드 만족도 테스트",
        success_metric: "편집 전 스토리보드 승인률 70% 이상, 수정 요청이 2회 이하.",
      },
    ],
    local: [
      {
        name: "폐쇄형 단지 거래 파일럿",
        success_metric: "등록 요청 10건 중 4건 이상 매칭, 완료 후 신뢰/안전 불안 점수 2점 이하.",
      },
      {
        name: "보증금/인증 조건 테스트",
        success_metric: "사용자 5명 중 3명 이상이 거래 전 필요한 인증 조건을 명확히 선택.",
      },
    ],
    generic: [
      {
        name: "5명 문제 인터뷰와 수동 결과물 테스트",
        success_metric: "5명 중 3명 이상이 주 1회 이상 문제를 겪고, 2명 이상이 수동 결과물에 비용 또는 재사용 의향을 밝힘.",
      },
      {
        name: "랜딩 페이지 구매 의향 테스트",
        success_metric: "타겟 방문자 30명 중 5명 이상이 대기자 등록 또는 상담 신청.",
      },
    ],
  };

  const risksByDomain: Record<string, RiskDraft[]> = {
    care: [
      {
        title: "돌봄 개인정보와 책임 소재",
        area: "개인정보/운영",
        severity: "high",
        mitigation: "초기 파일럿은 가명 데이터와 동의받은 샘플만 사용하고, 가족/센터/요양보호사별 책임 범위를 문서화합니다.",
      },
    ],
    subscription: [
      {
        title: "결제 데이터와 계정 접근",
        area: "보안/동의",
        severity: "high",
        mitigation: "초기 검증 버전은 직접 계정 로그인을 하지 않고 사용자가 제공한 캡처/CSV만 처리하며, 해지는 안내로 제한합니다.",
      },
    ],
    conversation: [
      {
        title: "전문 상담 또는 법률 조언 오인",
        area: "법무/콘텐츠",
        severity: "medium",
        mitigation: "앱 문구를 연습/커뮤니케이션 보조로 제한하고, 의료·법률·심리상담 판단으로 보이는 표현을 금지합니다.",
      },
    ],
    media: [
      {
        title: "초상권과 민감 미디어 처리",
        area: "개인정보/저작권",
        severity: "medium",
        mitigation: "업로드 전 동의 안내, 아동/타인 얼굴 포함 여부 체크, 원본 보관 기간 제한을 적용합니다.",
      },
    ],
    local: [
      {
        title: "오프라인 거래 안전과 분쟁",
        area: "운영/신뢰",
        severity: "high",
        mitigation: "초기 베타는 초대된 사용자로 제한하고, 보증금·완료 확인·분쟁 기록을 필수로 둡니다.",
      },
    ],
    generic: [
      {
        title: "검증 없는 범위 확장",
        area: "제품",
        severity: "medium",
        mitigation: "첫 제작 범위는 하나의 반복 문제와 하나의 성공 지표만 지원하고, 추가 기능은 실험 통과 후 반영합니다.",
      },
    ],
  };

  return {
    status,
    statusDetail,
    hypotheses: [
      `${idea.target_user || "대상 사용자"}가 ${state.signal || idea.one_liner || "이 문제"}를 반복적으로 겪는다.`,
      `${idea.buyer || "구매자"}가 현재 대안보다 빠르거나 믿을 수 있는 결과에 지불 의향을 보인다.`,
      `첫 제작 범위는 ${state.next_evidence || "추가로 확인할 내용"}을 확인하는 데 필요한 것만 포함한다.`,
    ],
    interviewQuestions: [
      "최근 이 문제가 발생한 실제 사례를 시간순으로 설명해줄 수 있나요?",
      "지금은 어떤 방식으로 해결하고 있고, 그 방식에서 가장 싫은 부분은 무엇인가요?",
      "이 문제가 해결되면 누가 비용을 내고, 얼마까지 현실적인가요?",
      "첫 버전에서 반드시 없어도 되는 기능은 무엇인가요?",
    ],
    experiments: experimentsByDomain[domain],
    risks: risksByDomain[domain],
    nextAction:
      status === "리스크 선검증"
        ? "리스크 초안을 먼저 저장한 뒤 완화 조건을 정하세요."
        : "첫 실험을 저장하고 진행 중으로 바꾼 뒤 실제 사용자 증거를 모으세요.",
  };
}

function buildValidationEvidenceCoach({
  idea,
  state,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
  decisions: Decision[];
}): ValidationEvidenceCoach {
  const domain = inferIdeaDomain(idea, state);
  const combinedText = [
    idea.name,
    idea.one_liner,
    idea.target_user,
    idea.buyer,
    state.signal,
    state.risk_summary,
    state.next_evidence,
    ...artifacts.map((artifact) => `${artifact.title} ${artifact.body}`),
  ].join(" ");
  const doneExperiments = experiments.filter((experiment) => experiment.status === "done");
  const runningExperiments = experiments.filter((experiment) => experiment.status === "running");
  const evidenceArtifacts = artifacts.filter((artifact) =>
    ["evidence_capture", "experiment_result", "validation_summary", "market_scan"].includes(artifact.source || ""),
  );
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const domainQuestions: Record<string, string[]> = {
    care: [
      "가족, 센터, 요양보호사 중 누가 오늘 가장 답답해하는지 실제 사례를 시간순으로 묻기",
      "현재 카카오톡, 전화, 수기 기록으로 처리하는 시간과 누락 사례를 숫자로 받기",
      "민감 돌봄 기록을 앱에 남길 때 필요한 동의와 책임 경계를 확인하기",
    ],
    subscription: [
      "최근 3개월 반복 결제 목록을 보고 실제 낭비 또는 해지 실패 사례를 확인하기",
      "해지를 대신해주는 것과 안내만 해주는 것 중 어떤 수준에 비용을 낼지 묻기",
      "결제/이메일 데이터 접근에 대한 허용 범위와 불안 요인을 확인하기",
    ],
    conversation: [
      "다가오는 실제 대화 1건을 고르고 전후 자신감 점수 변화를 기록하기",
      "제안 스크립트를 실제로 사용했는지와 결과가 나아졌는지 확인하기",
      "상담/법률 조언으로 오해하지 않는 안전 문구를 검증하기",
    ],
    media: [
      "최근 사진/영상이 갤러리에만 쌓인 실제 상황과 다시 보는 빈도를 확인하기",
      "수동 제작 샘플을 보여주고 저장, 공유, 반복 제작 의향을 측정하기",
      "얼굴, 아동, 위치 정보가 포함된 미디어 처리 불안을 확인하기",
    ],
    local: [
      "최근 빌리거나 도움받고 싶었던 물건/일을 3건 이상 수집하기",
      "이웃 인증, 보증금, 분쟁 처리 조건 중 거래 전 꼭 필요한 장치를 고르게 하기",
      "500m 단위 공급/수요가 같은 시간대에 맞는지 소규모 단지에서 확인하기",
    ],
    generic: [
      "최근 이 문제가 발생한 실제 사례를 시간순으로 묻기",
      "현재 대안, 비용, 실패 지점을 숫자와 함께 받기",
      "수동 결과물 또는 랜딩 페이지로 지불/신청 의향을 확인하기",
    ],
  };
  const checks: ValidationEvidenceCheck[] = [
    {
      label: "문제 빈도",
      passed:
        (state.problem_intensity >= 4 && state.frequency >= 3) ||
        includesAnyNormalized(combinedText, ["매일", "매주", "반복", "주 1회", "월 1회", "자주"]),
      detail: "문제가 반복되고 강도가 높은지 확인합니다.",
      action: "최근 30일 기준 발생 횟수와 마지막 사례를 물어보세요.",
    },
    {
      label: "실제 사례",
      passed:
        state.signal.trim().length >= 60 ||
        evidenceArtifacts.length > 0 ||
        includesAnyNormalized(combinedText, ["사례", "인터뷰", "관찰", "고객", "사용자 5명"]),
      detail: "추상 의견이 아니라 실제 행동/사건 근거가 필요합니다.",
      action: "사용자가 마지막으로 이 문제를 겪은 상황을 시간순으로 기록하세요.",
    },
    {
      label: "구매자와 지불",
      passed:
        Boolean(idea.buyer.trim()) &&
        state.willingness_to_pay >= 3 &&
        includesAnyNormalized(combinedText, ["가격", "지불", "구매", "예산", "만원", "원", "구독"]),
      detail: "누가 돈을 내고 어떤 예산에서 결제하는지 확인합니다.",
      action: "월 비용, 건당 비용, 절감액 기반 수수료 중 어떤 모델이 가능한지 묻습니다.",
    },
    {
      label: "도달 채널",
      passed: Boolean(idea.target_user.trim()) && state.reachability >= 3,
      detail: "초기 인터뷰와 파일럿 대상을 실제로 만날 수 있어야 합니다.",
      action: "이번 주 연락 가능한 타겟 5명과 접근 채널을 적으세요.",
    },
    {
      label: "대안/경쟁",
      passed:
        includesAnyNormalized(combinedText, ["대안", "경쟁", "엑셀", "카카오", "전화", "수동", "현재 방식", "우회"]) ||
        artifacts.some((artifact) => ["extracted_research_brief", "market_scan"].includes(artifact.source || "")),
      detail: "현재 대체재를 알아야 차별성과 가격을 판단할 수 있습니다.",
      action: "사용자가 지금 쓰는 대안 3개와 각 대안의 불만을 표로 정리하세요.",
    },
    {
      label: "행동 증거",
      passed: doneExperiments.length > 0 || runningExperiments.length > 0 || evidenceArtifacts.length >= 2,
      detail: "말이 아니라 클릭, 신청, 저장, 공유, 결제 의향 같은 행동 신호가 필요합니다.",
      action: "가장 작은 수동 검증이나 랜딩 테스트를 실행하고 결과를 실험 기록으로 남기세요.",
    },
    {
      label: "리스크 수용",
      passed: openHighRisks.length === 0 && Boolean(state.risk_summary.trim()),
      detail: "고위험 리스크가 남아 있으면 제품 기획서보다 완화 조건을 먼저 정합니다.",
      action: "높음/치명 리스크를 종료하거나 수용 조건과 차단 범위를 기록하세요.",
    },
  ];
  const passedCount = checks.filter((check) => check.passed).length;
  const evidenceScore = Math.round((passedCount / checks.length) * 100);
  const nextFocus = checks.find((check) => !check.passed) ?? null;
  const label =
    evidenceScore >= 86
      ? "개발 전환 근거 양호"
      : evidenceScore >= 65
        ? "7일 검증 가능"
        : evidenceScore >= 45
          ? "핵심 증거 보완"
          : "인터뷰부터 재정렬";
  const prompt = `# 검증 질문 묶음: ${idea.name}

## 이번에 보완할 증거

${nextFocus ? `- ${nextFocus.label}: ${nextFocus.action}` : "- 현재 핵심 증거가 대부분 충족되었습니다. 완료된 실험 결과와 최종 판단 근거를 정리하세요."}

## 질문 세트

${(domainQuestions[domain] ?? domainQuestions.generic).map((question) => `- ${question}`).join("\n")}

## 기록 형식

- 대상/출처:
- 최근 실제 사례:
- 현재 대안:
- 비용/시간 손실:
- 지불 또는 승인 조건:
- 새로 발견한 리스크:
- 진행/전환/중단에 주는 영향:
`;

  return {
    score: evidenceScore,
    label,
    checks,
    nextFocus,
    prompt,
  };
}

function isCreditSummary(value: unknown): value is CreditSummary {
  return (
    isPlainRecord(value) &&
    (value.status === "ready" || value.status === "missing" || value.status === "unavailable") &&
    value.plan === "free" &&
    typeof value.periodKey === "string" &&
    typeof value.monthlyGrant === "number" &&
    typeof value.buildPassCost === "number" &&
    typeof value.freeArtifactLimit === "number" &&
    typeof value.fullArtifactCount === "number" &&
    (typeof value.balance === "number" || value.balance === null) &&
    Array.isArray(value.buildPasses) &&
    Array.isArray(value.ledgerEntries)
  );
}

type CursorProgressDisplayItem = {
  taskCode: string;
  title: string;
  status: ImplementationTaskStatus;
  detail: string;
};

type CursorBuildSyncTokenResponse = {
  ok?: boolean;
  token?: string;
  endpoint?: string;
  expiresAt?: string;
  registryStatus?: CursorSyncRegistryStatus;
  connection?: CursorSyncConnection;
  message?: string;
  error?: string;
};

type CursorSyncConnectionsResponse = {
  ok?: boolean;
  registryStatus?: CursorSyncRegistryStatus;
  tokens?: CursorSyncConnection[];
  message?: string;
  error?: string;
};

type CursorSyncConnectionRevokeResponse = {
  ok?: boolean;
  connection?: CursorSyncConnection;
  error?: string;
};

function buildAppDevelopmentPlanMarkdown({
  idea,
  state,
  experiments,
  runs,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
}) {
  const productSurface = inferIdeaProductSurface(idea, state);
  const hasPrd = artifacts.some((artifact) => artifact.artifact_type === "prd");
  const hasResearchNote = artifacts.some((artifact) => artifact.artifact_type === "research_note");
  const hasMvpSpec = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const hasDesignBrief = artifacts.some((artifact) => artifact.artifact_type === "design_brief");
  const hasTechSpec = artifacts.some((artifact) => artifact.artifact_type === "tech_spec");
  const donePhases = new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
  const primaryExperiment = experiments[0];
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const surfaceDesignContext = buildSurfaceDesignContext(productSurface, surfaceGuidance);
  const surfaceArchitectureNotes = buildSurfaceArchitectureNotes(productSurface, surfaceGuidance);

  return `# 앱 개발 실행 계획: ${idea.name}

## 0. 개발 진입 조건

- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 조사 요약 저장: ${hasResearchNote ? "완료" : "권장"}
- PRD 저장: ${hasPrd ? "완료" : "필요"}
- 첫 제작 범위 저장: ${hasMvpSpec ? "완료" : "필요"}
- 백엔드 결정 저장: ${hasBackendDecision ? "완료" : "필요"}
- 디자인 기준 저장: ${hasDesignBrief ? "완료" : "필요"}
- 기술 명세 저장: ${hasTechSpec ? "완료" : "필요"}
- 검증 계획: ${primaryExperiment ? `${primaryExperiment.name} / ${primaryExperiment.success_metric || "성공 지표 미정"}` : "측정 가능한 검증 계획 필요"}
- 추가 확인 내용: ${state.next_evidence || "미정"}

${productSurfaceMarkdown(productSurface)}

## 0.1 준비도 점검

- 디자인 준비도: 핵심 여정, 제품 기획서, 첫 제작 범위, 백엔드 결정, 빈 상태/로딩/오류/권한/모바일/접근성 커버리지를 확인합니다.
- 개발 착수 준비도: 승인된 제품 기획서, 승인된 첫 제작 범위, 백엔드 결정, 승인된 디자인 기준, 승인된 기술 명세, 제작 실행 계획, 구현 할 일, 높은 리스크 상태를 확인합니다.
- 운영 안전장치: Vercel 환경변수, Supabase RLS 또는 Firebase Security Rules, Preview/Production 배포 로그, 롤백 기준을 코드 작업 전에 기록합니다.
- 준비도 점검은 출시 준비도보다 앞선 작업입니다. 부족한 항목이 있으면 코드 작업보다 제작 자료 또는 리스크 정리를 우선합니다.

## 0.5 백엔드 선택

현재 AI Venture Lab 운영 콘솔은 Supabase를 유지합니다. 새 앱 아이디어를 실제 제품으로 만들 때는 docs/BACKEND_DECISION_GUIDE.md를 기준으로 Supabase, Firebase, Firebase SQL Connect, 또는 하이브리드를 다시 선택합니다.

### 기본 선택지

- Supabase: 관계형 데이터, SQL, RLS, 운영 콘솔, B2B 워크플로우에 적합합니다.
- Firebase: 모바일/웹 동시 개발, 실시간/오프라인, Google Analytics, Crashlytics, Cloud Messaging, Remote Config, Test Lab, App Check가 중요할 때 적합합니다.
- Firebase SQL Connect: PostgreSQL이 필요하지만 Firebase SDK, realtime sync, Google Cloud/Firebase 운영 경험도 필요한 경우 검토합니다.

### 제작 형태 기준

- 현재 권장 형태: ${productSurface.label}
- 첫 제작 형태: ${productSurface.firstBuild}
- 스택 기본값: ${productSurface.stackHint}
- 이 값은 기획서, 디자인 기준, 기술 명세, 외부 제작 도구 전달 자료의 기준입니다.

### 선택 기록

- 선택한 백엔드:
- 선택 이유:
- 제외한 백엔드와 이유:
- 인증 경계:
- 데이터 권한 경계:
- 로컬 개발/에뮬레이터:
- 환경변수와 비밀값 경계:
- 배포 로그와 롤백:

## 1. 기획

### 목표

${idea.one_liner || "아이디어의 핵심 사용자 가치가 아직 비어 있습니다."}

### 해야 할 일

- 대상 사용자와 구매자를 분리해 제품 기획서에 고정합니다.
- 핵심 사용자 여정 1개와 성공 지표 1개만 선택합니다.
- 하지 않을 기능과 중단 기준을 명시합니다.
- 발생 계기, 현재 우회 방법, 문제 비용을 인터뷰나 실제 기록으로 확인합니다.
- 앱이 아닌 수동 운영/콘텐츠/스프레드시트로 더 빠르게 검증 가능한지 비교합니다.

### 제작 자료

- PRD
- 첫 제작 범위
- 실험 성공 기준
- kill criteria
- acceptance criteria

## 2. 디자인

### DESIGN.md 컨텍스트

${surfaceDesignContext}

### 디자인 작업 안내

${idea.name}의 MVP 화면을 설계한다. 제작 형태는 ${productSurface.label}이며, 첫 제작 형태는 ${productSurface.firstBuild}이다. 대상 사용자는 ${idea.target_user || "미정"}이고 구매자는 ${
    idea.buyer || "미정"
  }이다. 사용자는 "${idea.one_liner || "핵심 문제"}"를 해결하려고 들어온다. 첫 화면은 설명 페이지가 아니라 바로 실행 가능한 작업 화면이어야 한다. 화면은 ${productSurface.iaHint} 기준의 핵심 여정, 입력 폼, 결과 상태, 오류/빈 상태, 권한 없음, 모바일 단일 컬럼을 포함한다. UI는 AI Venture Lab DESIGN.md 기준을 따르고, 각 화면마다 primary action은 하나만 둔다.

### 화면

- 진입 화면
- 핵심 입력 화면
- 결과/제작 자료 화면
- 빈 상태, 오류 상태, 권한 없음 상태
- 모바일 단일 컬럼 화면

### 체크

- 사용자가 첫 가치까지 도달하는 클릭 수를 줄입니다.
- 모바일에서 입력 필드와 버튼이 겹치지 않게 검증합니다.
- 민감 데이터 입력 전 고지와 동의를 분리합니다.
- 진행 상태와 다음 추천 행동을 항상 보이게 합니다.
- 되돌리기, 취소, 재시도 경로를 둡니다.

## 3. 개발

### 기술 명세 작성 안내

${idea.name}의 첫 개발 범위를 기술 명세로 작성한다. 반드시 Supabase, Firebase, Firebase SQL Connect, 하이브리드 중 하나를 선택하고 선택 이유를 기록한다. Next.js App Router 기준으로 Server Component, Client Component, Server Action 또는 Route Handler의 경계를 나누고, 선택한 백엔드의 권한 모델, 환경변수, UI 상태, 검증 명령, 수동 스모크 경로, 롤백 경로를 포함한다. 범위는 ${state.next_evidence || "추가 확인 내용"}을 확인하는 데 필요한 수직 슬라이스로 제한한다.

### 기본 아키텍처

${surfaceArchitectureNotes}
- Next.js 앱 라우터 또는 선택한 제작 형태에 맞는 클라이언트 앱 경계를 사용
- 선택한 백엔드의 인증, 데이터 저장, 권한 경계를 기술 명세에 고정
- Vercel 배포 또는 선택한 제작 환경의 Preview/Production 경로
- 서버 액션 또는 API는 권한 확인 후 쓰기 수행
- use client 경계는 브라우저 상태와 이벤트가 필요한 컴포넌트로만 제한
- 민감한 읽기/쓰기는 서버 또는 RLS 정책에서 재검증

### 구현 순서

1. 데이터 모델과 RLS를 먼저 확정합니다.
2. 핵심 여정의 입력, 저장, 조회를 구현합니다.
3. 빈 상태, 오류 상태, 로딩 상태를 추가합니다.
4. 실험 지표를 남길 이벤트 또는 기록 구조를 붙입니다.
5. QA와 보안 체크를 통과한 뒤 프로덕션 배포합니다.
6. AI/자동화 기능은 사람의 검토, 재시도, 폐기 경로를 붙인 뒤 활성화합니다.

### 데이터/RLS 체크

- 새 테이블이 public schema에 있으면 RLS를 활성화합니다.
- select/insert/update/delete별 정책을 나눠 작성합니다.
- insert/update에는 사용자 또는 조직 소유권 with check 조건을 둡니다.
- 허용 케이스와 차단 케이스를 모두 테스트합니다.
- 정책 변경 후 SQL Editor, migration, 또는 로컬 검증 로그 중 하나를 제작 자료에 남깁니다.

### Firebase 체크

- Firestore/Storage를 쓰면 Security Rules를 먼저 작성합니다.
- Rules는 request.auth, 소유권, 조직 멤버십, 입력 데이터 형태를 검증합니다.
- 서버 SDK/Admin SDK를 쓰면 IAM과 서버 전용 경계를 검토합니다.
- 공개 클라이언트에서 Firebase 리소스를 직접 호출하면 App Check를 검토합니다.
- SQL Connect를 쓰면 schema/query/mutation, auth, region, 가격, realtime/offline 동작을 확인합니다.
- Security Rules 또는 IAM 변경 후 허용/차단 케이스와 Emulator/Preview 결과를 기록합니다.

### 환경변수 체크

- Vercel Preview와 Production에 필요한 변수명을 분리해 적습니다.
- 브라우저에 노출 가능한 공개 키와 서버 전용 비밀값을 분리합니다.
- 서비스 역할 키, Admin SDK, 결제/AI API 키는 서버 경계 안에서만 사용합니다.
- 환경변수 변경 뒤에는 재배포 여부와 배포 로그를 확인합니다.

### 품질 점검

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 배포 후 Production 스모크
- Vercel 배포 로그 또는 inspect 링크 확인

## 4. QA와 디버깅

- 인증 전/후 주요 버튼 상태 확인
- 새 기록 생성 후 화면 즉시 반영 확인
- 읽기 전용, 내 기록, 워크스페이스 권한 확인
- 실패한 저장 요청의 오류 메시지 확인
- 모바일 폭에서 레이아웃 확인
- 빈 상태, 로딩, 성공, 오류, 권한 없음 상태 확인
- 데이터 생성/수정/삭제의 허용/거부 경계 확인
- 회귀가 발생한 경우 재현 절차, 원인, 수정, 검증 명령을 기록

## 5. 보안과 개인정보

${state.risk_summary || "보안/개인정보 리스크가 아직 정리되지 않았습니다."}

- Vercel 환경변수만 사용하고 클라이언트에 비밀값을 노출하지 않습니다.
- Supabase RLS와 정책을 출시 전 SQL로 재확인합니다.
- 민감 데이터는 최소 수집, 보관 기간, 삭제 경로를 정합니다.
- 서비스 역할 키는 서버 전용으로만 사용하고 일반 사용자 플로우에 쓰지 않습니다.
- 감사 로그가 필요한 관리자/조직 변경은 이벤트를 남깁니다.

## 6. 배포와 롤백

- Vercel Preview에서 핵심 여정을 먼저 확인합니다.
- Production 배포 후 로그인, 저장, 조회, 제작 자료 저장을 스모크 테스트합니다.
- Vercel inspect URL, 배포 로그, Production alias 반영 여부를 완료 증거로 남깁니다.
- 장애 시 직전 배포로 롤백하고 DB 변경은 되돌릴 스크립트를 준비합니다.
- 환경변수 변경 후에는 새 배포가 되었는지 확인합니다.
- 사용자 영향, 롤백 조건, 연락 채널을 릴리스 노트에 남깁니다.

## 7. 현재 실행 상태

- 전략: ${donePhases.has("strategy") ? "완료" : "필요"}
- 리서치: ${donePhases.has("research") ? "완료" : "필요"}
- 제품: ${donePhases.has("product") ? "완료" : "필요"}
- 디자인: ${donePhases.has("design") ? "완료" : "필요"}
- 개발: ${donePhases.has("build") ? "완료" : "필요"}
- QA: ${donePhases.has("qa") ? "완료" : "필요"}
- 보안: ${donePhases.has("security") ? "완료" : "필요"}
- 출시: ${donePhases.has("launch") ? "완료" : "필요"}
`;
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function clampBackendScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function buildBackendCandidateScores({
  idea,
  state,
  experiments,
  risks,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  risks: Risk[];
}): BackendCandidateScore[] {
  const text = [
    idea.name,
    idea.one_liner,
    idea.target_user,
    idea.buyer,
    state.signal,
    state.risk_summary,
    state.next_evidence,
    ...experiments.flatMap((experiment) => [experiment.name, experiment.success_metric]),
    ...risks.flatMap((risk) => [risk.title, risk.area, risk.mitigation]),
  ]
    .join(" ")
    .toLowerCase();
  const relational = includesAny(text, ["운영", "콘솔", "센터", "관리", "승인", "권한", "워크플로", "리포트", "감사", "b2b", "sql", "관계형"]);
  const mobile = includesAny(text, ["모바일", "ios", "android", "네이티브", "앱스토어", "푸시", "알림", "카메라", "위치"]);
  const realtime = includesAny(text, ["실시간", "채팅", "동기화", "협업", "라이브", "presence", "offline", "오프라인"]);
  const analytics = includesAny(text, ["analytics", "분석", "crash", "crashlytics", "remote config", "a/b", "ab test", "test lab", "app check"]);
  const googleStack = includesAny(text, ["google", "firebase", "gcp", "cloud functions", "cloud messaging", "genkit", "data connect", "sql connect"]);
  const sensitive = includesAny(text, ["개인정보", "민감", "건강", "의료", "금융", "상담", "요양", "법률", "위치", "사진", "가족"]);
  const regulated = sensitive || risks.some((risk) => ["high", "critical"].includes(risk.severity));
  const fastMvp = state.mvp_speed >= 4 || includesAny(text, ["mvp", "첫 버전", "프로토타입", "빠르게", "2주"]);
  const productSurface = inferIdeaProductSurface(idea, state);
  const surfaceIsWebApp = productSurface.key === "web_app" || productSurface.key === "operator_console" || productSurface.key === "automation";
  const surfaceIsMobile = productSurface.key === "mobile_app";
  const surfaceIsMcp = productSurface.key === "mcp_handoff";

  const supabaseScore = clampBackendScore(
    54 +
      (relational ? 18 : 0) +
      (regulated ? 10 : 0) +
      (fastMvp ? 6 : 0) +
      (surfaceIsWebApp ? 8 : 0) +
      (surfaceIsMcp ? 5 : 0) -
      (mobile ? 6 : 0) -
      (realtime ? 4 : 0),
  );
  const firebaseScore = clampBackendScore(
    42 +
      (mobile ? 20 : 0) +
      (surfaceIsMobile ? 12 : 0) +
      (realtime ? 14 : 0) +
      (analytics ? 12 : 0) +
      (googleStack ? 8 : 0) -
      (relational ? 8 : 0) -
      (regulated ? 3 : 0),
  );
  const sqlConnectScore = clampBackendScore(
    38 +
      (relational ? 12 : 0) +
      (mobile || realtime || surfaceIsMobile ? 10 : 0) +
      (googleStack ? 12 : 0) +
      (analytics ? 6 : 0) -
      (!relational ? 6 : 0),
  );
  const hybridScore = clampBackendScore(
    36 +
      (relational && (mobile || realtime) ? 18 : 0) +
      (regulated && analytics ? 10 : 0) +
      (googleStack ? 8 : 0) -
      (fastMvp ? 8 : 0) +
      (surfaceIsMobile && relational ? 8 : 0),
  );

  const candidates: BackendCandidateScore[] = [
    {
      key: "supabase",
      label: "Supabase",
      score: supabaseScore,
      summary: "관계형 데이터, SQL, RLS, 운영 콘솔, 조직 권한이 중심인 첫 버전에 적합합니다.",
      strengths: ["Postgres/RLS 기반 권한", "SQL 질의와 운영자 테이블 점검", "Vercel/Next.js 운영 콘솔과 빠른 궁합"],
      cautions: ["모바일 네이티브 진단/푸시/오프라인은 별도 설계 필요", "실시간 앱 품질 도구는 직접 조합해야 함"],
    },
    {
      key: "firebase",
      label: "Firebase",
      score: firebaseScore,
      summary: "모바일, 실시간, 오프라인, 푸시, Analytics/Crashlytics/App Check가 핵심인 첫 버전에 적합합니다.",
      strengths: ["모바일/웹 SDK와 Google Analytics", "Crashlytics, Cloud Messaging, Remote Config, Test Lab", "App Check와 Emulator Suite"],
      cautions: ["복잡한 조인/운영 리포트는 Firestore 모델링 비용이 큼", "Security Rules와 IAM 경계를 별도로 검증해야 함"],
    },
    {
      key: "firebase_sql_connect",
      label: "Firebase SQL Connect",
      score: sqlConnectScore,
      summary: "PostgreSQL이 필요하지만 Firebase SDK, Google Cloud, 앱 품질 도구도 중요한 경우 검토합니다.",
      strengths: ["Firebase 생태계와 Postgres 모델 절충", "Generated SDK와 Google Cloud 운영 연결", "모바일 앱과 SQL 모델을 함께 검토 가능"],
      cautions: ["Supabase와 운영 모델이 다름", "Cloud SQL, region, 가격, 로컬 에뮬레이터 범위 확인 필요"],
    },
    {
      key: "hybrid",
      label: "Hybrid",
      score: hybridScore,
      summary: "관계형 운영 데이터와 모바일/실시간 앱 경험을 분리해야 할 때만 선택합니다.",
      strengths: ["운영 콘솔은 SQL/RLS, 앱 경험은 Firebase로 분리", "민감 데이터와 이벤트 데이터를 다른 경계로 통제", "점진적 전환 가능"],
      cautions: ["첫 버전부터 복잡도가 빠르게 커짐", "동기화, 권한, 장애 대응 책임이 두 배가 될 수 있음"],
    },
  ];

  return candidates.sort((left, right) => right.score - left.score);
}

function buildBackendExecutionPlan(backend: BackendCandidateScore): BackendExecutionPlan {
  const sharedChecks: BackendExecutionCheck[] = [
    {
      label: "클라이언트/서버 키 경계",
      detail: "브라우저에 노출되는 공개 설정과 서버 전용 비밀값을 분리합니다.",
      evidence: "Vercel Production env 목록에서 NEXT_PUBLIC 또는 공개 Firebase config와 서버 전용 키 경계를 기록",
      tone: "required",
    },
    {
      label: "허용/차단 테스트",
      detail: "로그인 사용자 본인/조직 데이터 접근은 허용하고 타인 데이터 접근은 차단합니다.",
      evidence: "허용 케이스 1개와 차단 케이스 1개의 실행 결과 또는 스크린샷/로그",
      tone: "required",
    },
    {
      label: "Preview/Production 재검증",
      detail: "Preview와 Production에서 같은 권한 경계와 환경변수가 적용되는지 확인합니다.",
      evidence: "Vercel inspect URL, smoke 명령, 배포 URL",
      tone: "required",
    },
  ];

  if (backend.key === "firebase") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_SERVICE_ACCOUNT 또는 Google Cloud IAM 서버 자격 증명",
      ],
      checks: [
        {
          label: "Security Rules",
          detail: "Firestore/Storage Rules에서 request.auth, uid, 조직 멤버십, 입력 데이터 형태를 검증합니다.",
          evidence: "Emulator 또는 Preview에서 본인 문서 write 허용, 다른 uid write 거부 결과",
          tone: "required",
        },
        {
          label: "App Check",
          detail: "공개 클라이언트에서 Firebase 리소스를 직접 호출한다면 App Check 적용 여부를 결정합니다.",
          evidence: "App Check 설정 또는 초기 검증 기간 미적용 사유",
          tone: "recommended",
        },
        ...sharedChecks,
      ],
      localCommand: "firebase emulators:start && pnpm lint && pnpm typecheck && pnpm build",
      productionGate: "Security Rules 배포 후 Preview/Production에서 본인 write와 타인 write 차단을 재확인합니다.",
      rollback: "직전 Rules 배포본과 Vercel 직전 Ready 배포로 되돌립니다.",
    };
  }

  if (backend.key === "firebase_sql_connect") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_SERVICE_ACCOUNT 또는 Google Cloud IAM 서버 자격 증명",
        "SQL_CONNECT_INSTANCE / generated SDK 설정",
      ],
      checks: [
        {
          label: "Schema/Connector 권한",
          detail: "SQL Connect schema, query, mutation이 인증 사용자와 조직 경계를 반영하는지 확인합니다.",
          evidence: "허용 query/mutation과 차단 query/mutation 결과",
          tone: "required",
        },
        {
          label: "Region/가격",
          detail: "Cloud SQL region, Firebase region, 예상 쿼리 비용과 cold path를 첫 제작 범위에 맞춥니다.",
          evidence: "선택 region, 가격 메모, 데이터 보관/삭제 기준",
          tone: "recommended",
        },
        ...sharedChecks,
      ],
      localCommand: "firebase emulators:start && pnpm lint && pnpm typecheck && pnpm build",
      productionGate: "generated SDK와 connector 배포 후 Preview에서 권한/쿼리 shape를 재확인합니다.",
      rollback: "직전 connector/schema 배포본과 Vercel 직전 Ready 배포로 되돌립니다.",
    };
  }

  if (backend.key === "hybrid") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "SUPABASE_SERVICE_ROLE_KEY 서버 전용",
        "FIREBASE_SERVICE_ACCOUNT 서버 전용",
      ],
      checks: [
        {
          label: "데이터 소유권 분리",
          detail: "어떤 데이터가 Supabase에 남고 어떤 이벤트/실시간 데이터가 Firebase로 가는지 경계를 고정합니다.",
          evidence: "데이터 분리 표와 동기화 실패 시 우선 소스",
          tone: "required",
        },
        {
          label: "이중 권한 검증",
          detail: "Supabase RLS와 Firebase Rules/IAM을 각각 허용/차단 케이스로 검증합니다.",
          evidence: "Supabase allowed/denied, Firebase allowed/denied 결과",
          tone: "required",
        },
        ...sharedChecks,
      ],
      localCommand: "pnpm lint && pnpm typecheck && pnpm build && pnpm smoke:routes",
      productionGate: "두 백엔드가 모두 Preview/Production에서 같은 사용자 경계를 적용하는지 확인합니다.",
      rollback: "Vercel 직전 Ready 배포와 각 백엔드의 직전 정책/Rules 배포본으로 되돌립니다.",
    };
  }

  return {
    backend,
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY 서버 전용"],
    checks: [
      {
        label: "RLS 활성화",
        detail: "모든 사용자 기록 테이블에서 RLS를 켜고 owner/workspace 정책을 적용합니다.",
        evidence: "SQL Editor 또는 migration에서 RLS/policy 적용 로그",
        tone: "required",
      },
      {
        label: "Service role 차단 경계",
        detail: "service role key는 서버 전용 작업에만 쓰고 클라이언트 번들에 노출하지 않습니다.",
        evidence: "Vercel env 공개/서버 키 경계 메모와 NEXT_PUBLIC 사용 목록",
        tone: "required",
      },
      ...sharedChecks,
    ],
    localCommand: "pnpm lint && pnpm typecheck && pnpm build && pnpm smoke:routes",
    productionGate: "RLS 정책 적용 후 Production에서 로그인 사용자 insert/update와 타인 데이터 차단을 재확인합니다.",
    rollback: "직전 migration/policy 백업과 Vercel 직전 Ready 배포로 되돌립니다.",
  };
}

function buildFirstBuildBridge({
  idea,
  state,
  backend,
  experiments,
  risks,
}: {
  idea: Idea;
  state: EditState;
  backend: BackendCandidateScore | null;
  experiments: Experiment[];
  risks: Risk[];
}): FirstBuildBridge {
  const backendLabel = backend?.label ?? "Supabase";
  const decisionAnchor =
    state.next_evidence ||
    experiments.find((experiment) => experiment.success_metric.trim())?.success_metric ||
    idea.one_liner ||
    "사용자가 첫 가치를 실제로 느끼는지 확인";
  const highRisk = risks.find((risk) => ["high", "critical"].includes(risk.severity));
  const firstTasks = [
    "첫 화면에서 사용자가 입력할 한 가지 행동을 만든다",
    `${backendLabel}에 후보, 검증 계획, 판단 기록 저장을 연결한다`,
    "로그인, 빈 상태, 저장 성공/실패, 권한 차단을 한 번에 확인한다",
  ];
  const excludeNow = [
    "결제, 관리자 고급 기능, 자동화 전체 흐름",
    "여러 사용자군과 여러 가격 모델을 동시에 검증하는 일",
    highRisk ? `${highRisk.title} 리스크가 정리되기 전의 공개 출시` : "검증 목표와 관계없는 부가 기능",
  ];

  return {
    stackTitle: `Next.js + ${backendLabel}`,
    stackReason: backend?.summary ?? "로그인, 저장, 권한 확인이 필요한 첫 버전을 가장 빠르게 만들 수 있는 조합입니다.",
    firstTasks,
    excludeNow,
    decisionAnchor,
  };
}

export function IdeaWorkbench({
  initialIdeas,
  initialRisks,
  initialDecisions,
  initialExperiments,
  initialOrchestrationRuns,
  initialArtifacts,
  initialImplementationTasks,
  initialTelemetryEvents,
  initialViewerUserId,
  initialViewerMemberships,
  initialCreditSummary = null,
  initialSelectedIdeaId,
  activeTask: controlledActiveTask,
  onActiveTaskChange,
  onStepReadinessChange,
  showSidebar = true,
}: {
  initialIdeas: Idea[];
  initialRisks: Risk[];
  initialDecisions: Decision[];
  initialExperiments: Experiment[];
  initialOrchestrationRuns: OrchestrationRun[];
  initialArtifacts: VentureArtifact[];
  initialImplementationTasks: ImplementationTask[];
  initialTelemetryEvents: TelemetryEvent[];
  initialViewerUserId: string | null;
  initialViewerMemberships: OrganizationMember[];
  initialCreditSummary?: CreditSummary | null;
  initialSelectedIdeaId?: string;
  activeTask?: WorkbenchTask;
  onActiveTaskChange?: (task: WorkbenchTask) => void;
  onStepReadinessChange?: (readiness: WorkbenchStepReadiness) => void;
  showSidebar?: boolean;
  embedded?: boolean;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [ideas, setIdeas] = useState(() => sortWorkbenchIdeas(initialIdeas));
  const [risks, setRisks] = useState(initialRisks);
  const [decisionLog, setDecisionLog] = useState(initialDecisions);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [orchestrationRuns, setOrchestrationRuns] = useState(initialOrchestrationRuns);
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [implementationTasks, setImplementationTasks] = useState(initialImplementationTasks);
  const [telemetryEvents, setTelemetryEvents] = useState(initialTelemetryEvents);
  const [selectedIdeaId, setSelectedIdeaId] = useState(() => {
    const activeInitialIdeas = sortWorkbenchIdeas(getActiveIdeas(initialIdeas));
    const requestedIdea = initialSelectedIdeaId
      ? activeInitialIdeas.find((idea) => idea.id === initialSelectedIdeaId)
      : null;

    return requestedIdea?.id ?? activeInitialIdeas[0]?.id ?? "";
  });
  const selectedIdea =
    ideas.find((idea) => idea.id === selectedIdeaId && !isDiscardedIdea(idea)) ??
    getActiveIdeas(ideas)[0] ??
    ideas.find((idea) => isDiscardedIdea(idea)) ??
    null;
  const [editState, setEditState] = useState<EditState | null>(selectedIdea ? toEditState(selectedIdea) : null);
  const [riskDraft, setRiskDraft] = useState<RiskDraft>({
    title: "",
    area: "",
    severity: "medium",
    mitigation: "",
  });
  const [decisionReason, setDecisionReason] = useState("");
  const [experimentDraft, setExperimentDraft] = useState<ExperimentDraft>({ name: "", success_metric: "" });
  const [runDraft, setRunDraft] = useState<RunDraft>({
    phase: "strategy",
    owner_role: "strategy-reviewer",
    objective: orchestrationPhaseConfigs[0].objective,
  });
  const [evidenceDraft, setEvidenceDraft] = useState<EvidenceDraft>({
    title: "",
    source: "",
    evidence: "",
    implication: "",
    confidence: "medium",
  });
  const [experimentResultDraft, setExperimentResultDraft] = useState<ExperimentResultDraft>({
    experiment_id: "",
    result: "",
    learning: "",
    next_decision: "research_more",
    next_action: "",
  });
  const [marketScanDraft, setMarketScanDraft] = useState<MarketScanDraft | null>(null);
  const [marketScanDraftKey, setMarketScanDraftKey] = useState<string | null>(null);
  const [marketScanMode, setMarketScanMode] = useState<string | null>(null);
  const [marketScanError, setMarketScanError] = useState<string | null>(null);
  const [isMarketScanLoading, setIsMarketScanLoading] = useState(false);
  const [isSavingValidationBundle, setIsSavingValidationBundle] = useState(false);
  const [runOutputs, setRunOutputs] = useState<Record<string, string>>(
    Object.fromEntries(initialOrchestrationRuns.map((run) => [run.id, run.output])),
  );
  const [artifactStatusNotes, setArtifactStatusNotes] = useState<Record<string, string>>({});
  const [implementationTaskEvidence, setImplementationTaskEvidence] = useState<Record<string, string>>({});
  const [implementationTaskDraft, setImplementationTaskDraft] = useState<ImplementationTaskDraft>({
    title: "",
    task_type: "frontend",
    priority: "medium",
    owner_role: "prototype-builder",
    acceptance_criteria: "",
  });
  const [user, setUser] = useState<User | ViewerUser | null>(() =>
    initialViewerUserId ? ({ id: initialViewerUserId } satisfies ViewerUser) : null,
  );
  const [memberships, setMemberships] = useState<OrganizationMember[]>(initialViewerMemberships);
  const [message, setMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(initialCreditSummary);
  const skipInitialCreditRefreshRef = useRef(Boolean(initialCreditSummary));
  const [isCreditSummaryLoading, setIsCreditSummaryLoading] = useState(false);
  const [isBuildPassUnlocking, setIsBuildPassUnlocking] = useState(false);
  const [creditMessage, setCreditMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "mine" | "read_only">("all");
  const [artifactTypeFilter, setArtifactTypeFilter] = useState<VentureArtifactType | "all">("all");
  const [artifactStatusFilter, setArtifactStatusFilter] = useState<VentureArtifactStatus | "all">("all");
  const [artifactSourceFilter, setArtifactSourceFilter] = useState("all");
  const [localActiveTask, setLocalActiveTask] = useState<WorkbenchTask>(() =>
    sortWorkbenchIdeas(getActiveIdeas(initialIdeas))[0] ? "score" : "select",
  );
  const [artifactPanel, setArtifactPanel] = useState<ArtifactPanel>("validation");
  const [developmentPanel, setDevelopmentPanel] = useState<DevelopmentPanel>("setup");
  const [developmentAutoFlowState, setDevelopmentAutoFlowState] = useState<DevelopmentAutoFlowState>("idle");
  const [developmentAutoStepIndex, setDevelopmentAutoStepIndex] = useState(0);
  const [developmentAutoNote, setDevelopmentAutoNote] = useState("");
  const [cursorProgressImportText, setCursorProgressImportText] = useState("");
  const [cursorProgressImportMessage, setCursorProgressImportMessage] = useState<string | null>(null);
  const [cursorProgressImportItems, setCursorProgressImportItems] = useState<CursorProgressDisplayItem[]>([]);
  const [isTaskSyncRefreshing, setIsTaskSyncRefreshing] = useState(false);
  const [taskSyncMessage, setTaskSyncMessage] = useState<string | null>(null);
  const [taskSyncUpdatedAt, setTaskSyncUpdatedAt] = useState<string | null>(null);
  const [cursorSyncConnections, setCursorSyncConnections] = useState<CursorSyncConnection[]>([]);
  const [cursorSyncRegistryStatus, setCursorSyncRegistryStatus] = useState<CursorSyncRegistryStatus | null>(null);
  const [cursorSyncConnectionMessage, setCursorSyncConnectionMessage] = useState<string | null>(null);
  const [isCursorSyncConnectionLoading, setIsCursorSyncConnectionLoading] = useState(false);
  const [revokingCursorSyncConnectionId, setRevokingCursorSyncConnectionId] = useState<string | null>(null);
  const developmentAutoRunIdRef = useRef(0);
  const experienceMode = "guided" as "guided" | "full";
  const [implementationStatusFilter, setImplementationStatusFilter] = useState<ImplementationStatusFilter>("all");
  const [implementationOwnerFilter, setImplementationOwnerFilter] = useState("all");
  const [implementationEvidenceFilter, setImplementationEvidenceFilter] = useState<ImplementationEvidenceFilter>("all");
  const activeTask = controlledActiveTask ?? localActiveTask;
  const updateActiveTask = useCallback((task: WorkbenchTask) => {
    setLocalActiveTask(task);
    onActiveTaskChange?.(task);
  }, [onActiveTaskChange]);

  const refreshCreditSummary = useCallback(async () => {
    if (!user) {
      setCreditSummary(null);
      setCreditMessage(null);
      setIsCreditSummaryLoading(false);
      return null;
    }

    setIsCreditSummaryLoading(true);

    try {
      const response = await fetch("/api/billing/credits", {
        credentials: "include",
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok || !isCreditSummary(payload)) {
        const fallback = response.ok
          ? "크레딧 상태를 읽지 못했습니다."
          : "크레딧 상태를 불러오지 못했습니다.";
        setCreditMessage(getApiMessage(payload, fallback));
        return null;
      }

      setCreditSummary(payload);
      setCreditMessage(payload.message);
      return payload;
    } catch {
      setCreditMessage("크레딧 상태를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
      return null;
    } finally {
      setIsCreditSummaryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (skipInitialCreditRefreshRef.current) {
      skipInitialCreditRefreshRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshCreditSummary();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshCreditSummary]);

  async function recordTelemetryEvent({
    eventName,
    eventCategory,
    properties = {},
    idea = selectedIdea,
  }: {
    eventName: string;
    eventCategory: string;
    properties?: Record<string, Json>;
    idea?: Idea | null;
  }) {
    if (!supabase || !user) {
      return;
    }

    const sanitizedProperties = Object.fromEntries(
      Object.entries(properties).filter(([, value]) => value !== undefined),
    ) as Record<string, Json>;
    const { data, error } = await supabase
      .from("telemetry_events")
      .insert({
        organization_id: idea?.organization_id ?? null,
        idea_id: idea?.id ?? null,
        actor_id: user.id,
        event_name: eventName,
        event_category: eventCategory,
        properties: sanitizedProperties,
      })
      .select()
      .single();

    if (error) {
      console.warn("Failed to record telemetry event", error.message);
      return;
    }

    if (data) {
      setTelemetryEvents((current) => upsertRecordById(current, data));
      emitVentureEvent<TelemetryEvent>("venture:telemetry-created", data);
    }
  }

  useEffect(() => {
    function handleRecordEvent<T extends { id: string }>(
      event: Event,
      setter: (updater: (current: T[]) => T[]) => void,
    ) {
      const record = (event as CustomEvent<T>).detail;

      if (!record?.id) {
        return;
      }

      setter((current) => upsertRecordById(current, record));
    }

    function handleRecordListEvent<T extends { id: string }>(
      event: Event,
      setter: (updater: (current: T[]) => T[]) => void,
    ) {
      const records = (event as CustomEvent<T[]>).detail;

      if (!Array.isArray(records) || records.length === 0) {
        return;
      }

      setter((current) => upsertRecordsById(current, records));
    }

    function handleIdeaCreated(event: Event) {
      const createdIdea = (event as CustomEvent<Idea>).detail;

      if (!createdIdea?.id) {
        return;
      }

      setIdeas((current) => upsertWorkbenchIdea(current, createdIdea));
      setSelectedIdeaId(createdIdea.id);
      setEditState(toEditState(createdIdea));
      updateActiveTask("score");
      setFilterMode("all");
      setMessage("새 아이디어를 실행 보드에 바로 추가하고 선택했습니다.");
    }
    const handleIdeaUpdated = (event: Event) => handleRecordEvent<Idea>(event, setIdeas);
    const handleRiskCreated = (event: Event) => handleRecordEvent<Risk>(event, setRisks);
    const handleRiskUpdated = (event: Event) => handleRecordEvent<Risk>(event, setRisks);
    const handleExperimentCreated = (event: Event) => handleRecordEvent<Experiment>(event, setExperiments);
    const handleExperimentUpdated = (event: Event) => handleRecordEvent<Experiment>(event, setExperiments);
    const handleRunCreated = (event: Event) => handleRecordEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleRunsCreated = (event: Event) => handleRecordListEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleRunUpdated = (event: Event) => handleRecordEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleArtifactCreated = (event: Event) => handleRecordEvent<VentureArtifact>(event, setArtifacts);
    const handleArtifactUpdated = (event: Event) => handleRecordEvent<VentureArtifact>(event, setArtifacts);
    const handleTaskCreated = (event: Event) => handleRecordEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTasksCreated = (event: Event) => handleRecordListEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTaskUpdated = (event: Event) => handleRecordEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTelemetryCreated = (event: Event) => handleRecordEvent<TelemetryEvent>(event, setTelemetryEvents);

    window.addEventListener("venture:idea-created", handleIdeaCreated);
    window.addEventListener("venture:idea-updated", handleIdeaUpdated);
    window.addEventListener("venture:risk-created", handleRiskCreated);
    window.addEventListener("venture:risk-updated", handleRiskUpdated);
    window.addEventListener("venture:experiment-created", handleExperimentCreated);
    window.addEventListener("venture:experiment-updated", handleExperimentUpdated);
    window.addEventListener("venture:run-created", handleRunCreated);
    window.addEventListener("venture:runs-created", handleRunsCreated);
    window.addEventListener("venture:run-updated", handleRunUpdated);
    window.addEventListener("venture:artifact-created", handleArtifactCreated);
    window.addEventListener("venture:artifact-updated", handleArtifactUpdated);
    window.addEventListener("venture:task-created", handleTaskCreated);
    window.addEventListener("venture:tasks-created", handleTasksCreated);
    window.addEventListener("venture:task-updated", handleTaskUpdated);
    window.addEventListener("venture:telemetry-created", handleTelemetryCreated);

    return () => {
      window.removeEventListener("venture:idea-created", handleIdeaCreated);
      window.removeEventListener("venture:idea-updated", handleIdeaUpdated);
      window.removeEventListener("venture:risk-created", handleRiskCreated);
      window.removeEventListener("venture:risk-updated", handleRiskUpdated);
      window.removeEventListener("venture:experiment-created", handleExperimentCreated);
      window.removeEventListener("venture:experiment-updated", handleExperimentUpdated);
      window.removeEventListener("venture:run-created", handleRunCreated);
      window.removeEventListener("venture:runs-created", handleRunsCreated);
      window.removeEventListener("venture:run-updated", handleRunUpdated);
      window.removeEventListener("venture:artifact-created", handleArtifactCreated);
      window.removeEventListener("venture:artifact-updated", handleArtifactUpdated);
      window.removeEventListener("venture:task-created", handleTaskCreated);
      window.removeEventListener("venture:tasks-created", handleTasksCreated);
      window.removeEventListener("venture:task-updated", handleTaskUpdated);
      window.removeEventListener("venture:telemetry-created", handleTelemetryCreated);
    };
  }, [updateActiveTask]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    async function loadMemberships(nextUser: User | null) {
      if (!supabase || !nextUser) {
        if (!initialViewerUserId) {
          setMemberships([]);
        }
        return;
      }

      const { data } = await supabase.from("organization_members").select("*");
      setMemberships(data ?? []);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        void loadMemberships(data.user);
      } else if (!initialViewerUserId) {
        setUser(null);
        setMemberships([]);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser) {
        setUser(nextUser);
        void loadMemberships(nextUser);
      } else if (!initialViewerUserId) {
        setUser(null);
        setMemberships([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [initialViewerUserId, supabase]);

  const selectedRisks = useMemo(
    () => risks.filter((risk) => risk.idea_id === selectedIdea?.id || risk.idea_id === null),
    [risks, selectedIdea?.id],
  );
  const selectedIdeaRisks = useMemo(
    () => risks.filter((risk) => risk.idea_id === selectedIdea?.id),
    [risks, selectedIdea?.id],
  );

  const selectedDecisions = useMemo(
    () => decisionLog.filter((entry) => entry.idea_id === selectedIdea?.id).slice(0, 4),
    [decisionLog, selectedIdea?.id],
  );

  const selectedExperiments = useMemo(
    () => experiments.filter((experiment) => experiment.idea_id === selectedIdea?.id).slice(0, 5),
    [experiments, selectedIdea?.id],
  );

  const selectedRuns = useMemo(
    () =>
      orchestrationRuns
        .filter((run) => run.idea_id === selectedIdea?.id)
        .sort((a, b) => (phaseOrder.get(a.phase) ?? 99) - (phaseOrder.get(b.phase) ?? 99)),
    [orchestrationRuns, selectedIdea?.id],
  );

  const selectedArtifactRecords = useMemo(
    () =>
      artifacts
        .filter((artifact) => artifact.idea_id === selectedIdea?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [artifacts, selectedIdea?.id],
  );
  const buildPassIdeaIds = useMemo(
    () => new Set((creditSummary?.buildPasses ?? []).map((pass) => pass.ideaId)),
    [creditSummary?.buildPasses],
  );
  const isCreditSystemReady = creditSummary?.status === "ready";
  const isCreditSystemMissing = creditSummary?.status === "missing";
  const hasSelectedIdeaBuildPass = Boolean(selectedIdea && buildPassIdeaIds.has(selectedIdea.id));
  const isCreditSystemChecking = Boolean(user) && isCreditSummaryLoading && !creditSummary;
  const needsSelectedIdeaBuildPass = Boolean(selectedIdea && isCreditSystemReady && !hasSelectedIdeaBuildPass);
  const canUseFullProductionPackage = (!isCreditSystemReady && !isCreditSystemChecking) || hasSelectedIdeaBuildPass;
  const buildPassCost = creditSummary?.buildPassCost ?? IDEA_BUILD_PASS_CREDITS;
  const freeArtifactLimit = creditSummary?.freeArtifactLimit ?? FREE_PACKAGE_ARTIFACT_LIMIT;
  const fullArtifactCount = creditSummary?.fullArtifactCount ?? FULL_PACKAGE_ARTIFACT_COUNT;
  const monthlyCreditGrant = creditSummary?.monthlyGrant ?? FREE_MONTHLY_CREDITS;
  const creditBalance = creditSummary?.balance ?? null;
  const remainingBuildPassCount = getBuildPassCapacity(creditBalance, buildPassCost);
  const hasEnoughCreditsForBuildPass = !isCreditSystemReady || (creditBalance ?? 0) >= buildPassCost;
  const creditBalanceLabel = creditBalance === null ? "확인 중" : `${creditBalance} 크레딧`;
  const buildDeliveryPreference = useMemo(
    () => getBuildDeliveryPreferenceFromArtifacts(selectedArtifactRecords),
    [selectedArtifactRecords],
  );
  const [finalExternalToolOverride, setFinalExternalToolOverride] = useState<{
    ideaId: string | null;
    key: ExternalBuildToolKey;
  } | null>(null);
  const buildDeliveryMode: BuildDeliveryMode = buildDeliveryPreference.mode;
  const persistedExternalBuildTool = getExternalBuildToolProfile(buildDeliveryPreference);
  const finalExternalToolOverrideKey =
    finalExternalToolOverride?.ideaId === (selectedIdea?.id ?? null) ? finalExternalToolOverride.key : null;
  const activeExternalBuildTool =
    buildDeliveryMode === "external_tool" && finalExternalToolOverrideKey
      ? externalBuildToolProfiles[finalExternalToolOverrideKey]
      : persistedExternalBuildTool;
  const hasFinalExternalToolOverride =
    buildDeliveryMode === "external_tool" &&
    Boolean(finalExternalToolOverrideKey) &&
    finalExternalToolOverrideKey !== persistedExternalBuildTool.key;
  const activeBuildDeliveryLabel = buildDeliveryModeLabels[buildDeliveryMode];
  const activeBuildDeliveryDetail =
    buildDeliveryMode === "external_tool"
      ? `${activeExternalBuildTool.label}에 맞춰 전달 자료와 시작 방법을 정리합니다. 실제 파일 받기와 연동은 마지막 단계에서 열립니다.`
      : "Venture Lab 안에서 작업 순서, 실행 할 일, 최종 실행, 성과 확인 화면으로 이어갑니다.";
  const artifactReviewQueue = useMemo(() => buildArtifactReviewQueue(selectedArtifactRecords), [selectedArtifactRecords]);
  const approvedArtifactReviewCount = artifactReviewQueue.filter((item) => item.status === "approved").length;
  const nextArtifactReviewItem = artifactReviewQueue.find((item) => item.status !== "approved") ?? null;
  const artifactReviewProgress = Math.round((approvedArtifactReviewCount / artifactReviewQueue.length) * 100);
  const artifactSourceOptions = useMemo(
    () =>
      ["all", ...Array.from(new Set(selectedArtifactRecords.map((artifact) => artifact.source || "manual"))).sort((a, b) =>
        a.localeCompare(b, "ko-KR"),
      )],
    [selectedArtifactRecords],
  );
  const artifactSourceFilterLabels = useMemo(
    () =>
      Object.fromEntries(
        artifactSourceOptions.map((source) => [
          source,
          source === "all" ? "전체 출처" : (artifactSourceLabels[source] ?? source),
        ]),
      ) as Record<string, string>,
    [artifactSourceOptions],
  );
  const activeArtifactSourceFilter = artifactSourceOptions.includes(artifactSourceFilter) ? artifactSourceFilter : "all";
  const selectedArtifacts = useMemo(
    () =>
      selectedArtifactRecords
        .filter((artifact) => artifactTypeFilter === "all" || artifact.artifact_type === artifactTypeFilter)
        .filter((artifact) => artifactStatusFilter === "all" || (artifact.status ?? "draft") === artifactStatusFilter)
        .filter((artifact) => activeArtifactSourceFilter === "all" || (artifact.source || "manual") === activeArtifactSourceFilter)
        .slice(0, 8),
    [activeArtifactSourceFilter, artifactStatusFilter, artifactTypeFilter, selectedArtifactRecords],
  );
  const recentDevelopmentHandoffArtifacts = useMemo(
    () =>
      selectedArtifactRecords
        .filter(
          (artifact) =>
            artifact.artifact_type === "dev_runbook" &&
            ["filtered_implementation_run", "development_process"].includes(artifact.source || ""),
        )
        .slice(0, 3),
    [selectedArtifactRecords],
  );
  const selectedImplementationTasks = useMemo(
    () =>
      implementationTasks
        .filter((task) => task.idea_id === selectedIdea?.id)
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order ||
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
            a.title.localeCompare(b.title, "ko-KR"),
        ),
    [implementationTasks, selectedIdea?.id],
  );
  const firstImplementationTask = selectedImplementationTasks[0] ?? null;
  const hasGeneratedWorkOrder = selectedRuns.length > 0 || selectedImplementationTasks.length > 0;
  const selectedTelemetryEvents = useMemo(
    () =>
      telemetryEvents
        .filter((event) => event.idea_id === selectedIdea?.id)
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [selectedIdea?.id, telemetryEvents],
  );
  const openSelectedIdeaRisks = useMemo(
    () => selectedIdeaRisks.filter((risk) => risk.status !== "closed"),
    [selectedIdeaRisks],
  );
  const learningTelemetryReportDraft = useMemo(
    () =>
      selectedIdea
        ? buildLearningTelemetryReportMarkdown({
            idea: selectedIdea,
            events: selectedTelemetryEvents,
            openRisks: openSelectedIdeaRisks,
            experiments: selectedExperiments,
            implementationTasks: selectedImplementationTasks,
          })
        : "",
    [openSelectedIdeaRisks, selectedExperiments, selectedIdea, selectedImplementationTasks, selectedTelemetryEvents],
  );
  const telemetryAdapterGuideDraft = useMemo(
    () => (selectedIdea ? buildTelemetryAdapterGuideMarkdown(selectedIdea) : ""),
    [selectedIdea],
  );
  const telemetryEnvSnippet = useMemo(() => (selectedIdea ? buildTelemetryEnvSnippet() : ""), [selectedIdea]);
  const telemetryNextRouteSnippet = useMemo(
    () => (selectedIdea ? buildTelemetryNextRouteSnippet(selectedIdea) : ""),
    [selectedIdea],
  );
  const telemetryClientHelperSnippet = useMemo(
    () => (selectedIdea ? buildTelemetryClientHelperSnippet() : ""),
    [selectedIdea],
  );
  const telemetrySmokeCommandSnippet = useMemo(
    () => (selectedIdea ? buildTelemetrySmokeCommandSnippet(selectedIdea) : ""),
    [selectedIdea],
  );
  const selectedProductTelemetryEvents = useMemo(
    () =>
      selectedTelemetryEvents.filter(
        (event) => event.event_category === "product" || event.event_name.startsWith("product_"),
      ),
    [selectedTelemetryEvents],
  );
  const productTelemetryFunnelDraft = useMemo(
    () =>
      selectedIdea
        ? buildProductTelemetryFunnelMarkdown({
            idea: selectedIdea,
            events: selectedProductTelemetryEvents,
          })
        : "",
    [selectedIdea, selectedProductTelemetryEvents],
  );
  const productTelemetryEventCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of selectedProductTelemetryEvents) {
      counts.set(event.event_name, (counts.get(event.event_name) ?? 0) + 1);
    }

    return counts;
  }, [selectedProductTelemetryEvents]);
  const productTelemetryFunnelRows = useMemo(
    () =>
      productTelemetryFunnelSteps.map((step, index) => {
        const count = productTelemetryEventCounts.get(step.eventName) ?? 0;
        const previousStep = productTelemetryFunnelSteps[index - 1];
        const previousCount = previousStep ? productTelemetryEventCounts.get(previousStep.eventName) ?? 0 : count;
        const conversion = index === 0 || previousCount === 0 ? null : Math.round((count / previousCount) * 100);

        return {
          ...step,
          count,
          conversion,
        };
      }),
    [productTelemetryEventCounts],
  );
  const productTelemetryMaxCount = useMemo(
    () => Math.max(1, ...productTelemetryFunnelRows.map((row) => row.count)),
    [productTelemetryFunnelRows],
  );
  const productTelemetryTaxonomyRows = useMemo(
    () =>
      productTelemetryTaxonomy.map((item) => ({
        ...item,
        count: productTelemetryEventCounts.get(item.eventName) ?? 0,
      })),
    [productTelemetryEventCounts],
  );
  const telemetryWindowCounts = useMemo(
    () => ({
      sevenDays: eventCountForWindow(selectedTelemetryEvents, 7),
      fourteenDays: eventCountForWindow(selectedTelemetryEvents, 14),
      thirtyDays: eventCountForWindow(selectedTelemetryEvents, 30),
    }),
    [selectedTelemetryEvents],
  );
  const learningSignalCards = useMemo(
    () => [
      {
        label: "제품 이벤트",
        value: `${selectedProductTelemetryEvents.length}개`,
        detail: "실제 제품/외부 앱에서 수집된 사용자 행동 신호",
      },
      {
        label: "최근 7일",
        value: `${telemetryWindowCounts.sevenDays}개`,
        detail: "첫 가치 도달, 저장, 상태 변경 같은 초기 행동 신호",
      },
      {
        label: "최근 14일",
        value: `${telemetryWindowCounts.fourteenDays}개`,
        detail: "반복 사용, 실험 결과, 리스크 해소 신호",
      },
      {
        label: "최근 30일",
        value: `${telemetryWindowCounts.thirtyDays}개`,
        detail: "유지, 전환, 다음 빌드 판단에 필요한 누적 신호",
      },
      {
        label: "열린 리스크",
        value: `${openSelectedIdeaRisks.length}개`,
        detail: "성과 확인에서 계속 감시해야 하는 차단 요인",
      },
    ],
    [openSelectedIdeaRisks.length, selectedProductTelemetryEvents.length, telemetryWindowCounts],
  );
  const selectedOpenImplementationTasks = useMemo(
    () => sortImplementationTasksForAction(selectedImplementationTasks.filter((task) => task.status !== "done")),
    [selectedImplementationTasks],
  );
  const implementationDependencyStatuses = useMemo(
    () => buildImplementationDependencyStatuses(selectedImplementationTasks),
    [selectedImplementationTasks],
  );
  const implementationTaskProgressStats = useMemo(() => {
    const byType = Object.fromEntries(
      implementationTaskTypes.map((taskType) => [taskType, { done: 0, total: 0 }]),
    ) as Record<ImplementationTaskType, { done: number; total: number }>;
    const completedTasks: ImplementationTask[] = [];
    let blockedCount = 0;

    for (const task of selectedImplementationTasks) {
      byType[task.task_type].total += 1;

      if (task.status === "done") {
        byType[task.task_type].done += 1;
        completedTasks.push(task);
      }

      if (task.status === "blocked") {
        blockedCount += 1;
      }
    }

    return {
      blockedCount,
      completedCount: completedTasks.length,
      completedTasks,
      totalCount: selectedImplementationTasks.length,
      byType,
    };
  }, [selectedImplementationTasks]);
  const readyImplementationDependencyStatuses = implementationDependencyStatuses.filter((status) => status.ready);
  const waitingImplementationDependencyStatuses = implementationDependencyStatuses.filter(
    (status) => status.task.status !== "done" && !status.ready,
  );
  const nextImplementationTask = readyImplementationDependencyStatuses[0]?.task ?? selectedOpenImplementationTasks[0] ?? null;
  const nextImplementationDependencyStatus =
    implementationDependencyStatuses.find((status) => status.task.id === nextImplementationTask?.id) ?? null;
  const nextImplementationTaskIndex = nextImplementationTask
    ? selectedImplementationTasks.findIndex((task) => task.id === nextImplementationTask.id)
    : -1;
  const nextImplementationTaskCode = nextImplementationTaskIndex >= 0 ? getCursorTaskCode(nextImplementationTaskIndex) : null;
  const completedLearningImplementationTasks = implementationTaskProgressStats.completedTasks;
  const totalLearningImplementationTasks = implementationTaskProgressStats.totalCount;
  const productSignalCount = selectedProductTelemetryEvents.length;
  const recentSignalCount = telemetryWindowCounts.fourteenDays;
  const learningDecisionLabel =
    totalLearningImplementationTasks > 0 && completedLearningImplementationTasks.length < totalLearningImplementationTasks
      ? "다음 작업 완료"
      : productSignalCount === 0
        ? "첫 버전 배포"
        : openSelectedIdeaRisks.length > 0
          ? "리스크 보완"
          : "다음 빌드 범위 결정";
  const learningDecisionDetail =
    learningDecisionLabel === "다음 작업 완료"
      ? "아직 완료되지 않은 제작 작업이 있습니다. 선택한 외부 개발 도구나 내부 제작 흐름에서 다음 작업을 끝내고 결과를 다시 반영하세요."
      : learningDecisionLabel === "첫 버전 배포"
        ? "아직 실제 제품 이벤트가 없습니다. 먼저 첫 사용자에게 보여줄 버전을 만들고 핵심 행동 신호를 연결하세요."
        : learningDecisionLabel === "리스크 보완"
          ? "사용 신호와 열린 리스크를 같이 보고 다음 빌드에서 제거할 차단 요인을 정하세요."
          : "최근 사용 신호를 보며 다음 빌드 범위를 작게 승인할지 판단하세요.";
  const learningPrimaryActionLabel = nextImplementationTask
    ? "다음 제작 작업"
    : productSignalCount === 0
      ? "출시 전 확인"
      : "다음 빌드 판단";
  const learningPrimaryActionText = nextImplementationTask
    ? `${nextImplementationTaskCode ? `${nextImplementationTaskCode} ` : ""}${nextImplementationTask.title}만 이어서 끝내고, 완료 보고를 Venture Lab에 반영하세요.`
    : productSignalCount === 0
      ? "첫 버전을 배포하거나 내부 제작 흐름으로 넘긴 뒤, 방문과 핵심 행동 이벤트가 들어오는지 확인하세요."
      : `최근 14일 신호 ${recentSignalCount}개를 기준으로 다음 빌드 범위를 작게 정하세요.`;
  const learningPrimaryActionDetail = nextImplementationTask
    ? buildDeliveryMode === "external_tool"
      ? `${activeExternalBuildTool.label}에서 완료 보고가 들어오면 이 화면의 작업 목록이 자동으로 갱신됩니다.`
      : "내부 제작 흐름에서 완료 증거가 저장되면 이 화면의 작업 목록이 자동으로 갱신됩니다."
    : productSignalCount === 0
      ? "실제 사용 신호가 없을 때는 리포트보다 제작 완료와 이벤트 연결 여부를 먼저 봅니다."
      : "이제 상세 이벤트는 필요할 때만 열고, 다음 개선 또는 보류 판단을 남기면 됩니다.";
  const learningOneSentenceOutcome = nextImplementationTask
    ? `${nextImplementationTaskCode ? `${nextImplementationTaskCode} ` : ""}${nextImplementationTask.title}만 끝내면 다음 판단으로 넘어갈 수 있습니다.`
    : productSignalCount === 0
      ? "지금은 성과 분석보다 첫 버전 배포와 이벤트 연결이 먼저입니다."
      : openSelectedIdeaRisks.length > 0
        ? "사용 신호는 들어왔고, 다음 결정은 열린 리스크를 하나 줄이는 것입니다."
        : "사용 신호가 들어왔으니 다음 빌드 범위를 작게 승인할 차례입니다.";
  const learningPrimaryCtaLabel = "리포트 복사";
  const learningPrimaryNavigationHintTitle = nextImplementationTask
    ? "다음 작업은 STEP 7에서 이어갑니다"
    : "최종 실행은 STEP 7에서 확인합니다";
  const learningPrimaryNavigationHintDetail = nextImplementationTask
    ? "이 화면은 완료와 다음 판단만 보여줍니다. 단계 이동은 왼쪽 단계 메뉴나 하단 단계 버튼에서 진행하세요."
    : "성과 확인 화면 안에서는 단계를 자동 이동하지 않습니다. 최종 실행 자료는 STEP 7에서 확인하세요.";
  const learningDecisionOptions = nextImplementationTask
    ? ["작업 계속", "막힘 해결", "완료 보고 반영"]
    : productSignalCount === 0
      ? ["첫 버전 배포", "성과 신호 연결", "최종 실행 확인"]
      : openSelectedIdeaRisks.length > 0
        ? ["리스크 보완", "범위 축소", "보류"]
        : ["다음 빌드 승인", "작게 개선", "보류"];
  const learningCompletedValue =
    totalLearningImplementationTasks > 0
      ? `${completedLearningImplementationTasks.length}/${totalLearningImplementationTasks} 작업`
      : productSignalCount > 0
        ? `${productSignalCount}개 신호`
        : "없음";
  const learningCompletedDetail =
    totalLearningImplementationTasks > 0
      ? completedLearningImplementationTasks.length > 0
        ? "완료 보고가 저장된 제작 작업입니다."
        : "아직 완료 보고가 들어온 제작 작업은 없습니다."
      : productSignalCount > 0
        ? "첫 버전에서 들어온 실제 사용 신호입니다."
        : "아직 완료 보고나 제품 신호가 없습니다.";
  const learningRemainingValue = nextImplementationTask
    ? nextImplementationTaskCode
      ? `${nextImplementationTaskCode} 남음`
      : "작업 남음"
    : productSignalCount === 0
      ? "신호 연결"
      : openSelectedIdeaRisks.length > 0
        ? `${openSelectedIdeaRisks.length}개 리스크`
        : "없음";
  const learningRemainingDetail = nextImplementationTask
    ? `${nextImplementationTask.title}만 이어서 처리하면 됩니다.`
    : productSignalCount === 0
      ? "첫 버전을 배포한 뒤 방문과 핵심 행동 이벤트를 연결하세요."
      : openSelectedIdeaRisks.length > 0
        ? "열린 리스크 중 다음 빌드에서 줄일 항목을 하나 고르세요."
        : "남은 차단 항목이 없으면 다음 빌드 범위를 작게 정하면 됩니다.";
  const learningDecisionCards = [
    {
      label: "완료된 것",
      value: learningCompletedValue,
      detail: learningCompletedDetail,
    },
    {
      label: "남은 것",
      value: learningRemainingValue,
      detail: learningRemainingDetail,
    },
    {
      label: "지금 판단할 것",
      value: learningDecisionLabel,
      detail: learningDecisionDetail,
    },
  ];
  const learningSimpleReviewRows = [
    ["완료", learningCompletedValue, learningCompletedDetail],
    ["다음", learningRemainingValue, learningRemainingDetail],
    ["판단", learningDecisionLabel, learningDecisionDetail],
  ] as const;
  const learningJudgmentQuestion = nextImplementationTask
    ? "이 작업을 완료로 볼 근거가 있나요?"
    : productSignalCount === 0
      ? "첫 버전 배포와 성과 신호 연결이 끝났나요?"
      : openSelectedIdeaRisks.length > 0
        ? "다음 빌드에서 어떤 리스크 하나를 먼저 줄일까요?"
        : "다음 빌드를 작게 승인할까요, 아니면 보류할까요?";
  const learningNextJudgmentBrief = nextImplementationTask
    ? "다음 제작 작업의 완료 여부만 확인하면 됩니다. 상세 리포트는 아직 열지 않아도 됩니다."
    : productSignalCount === 0
      ? "첫 버전 배포와 성과 신호 연결만 확인하면 됩니다. 숫자 리포트는 아직 이릅니다."
      : openSelectedIdeaRisks.length > 0
        ? "다음 빌드에서 줄일 리스크 하나만 고르면 됩니다. 상세 리포트는 필요할 때만 엽니다."
        : "다음 빌드 범위를 승인할지 보류할지만 정하면 됩니다. 상세 리포트는 필요할 때만 엽니다.";
  const externalSyncCompletedText =
    totalLearningImplementationTasks > 0
      ? `${completedLearningImplementationTasks.length}/${totalLearningImplementationTasks} 작업`
      : "작업 생성 전";
  const externalSyncNextTaskText = nextImplementationTask
    ? `${nextImplementationTaskCode ? `${nextImplementationTaskCode} ` : ""}${nextImplementationTask.title}`
    : totalLearningImplementationTasks > 0
      ? "모든 작업 완료"
      : "STEP 6 작업 순서 생성";
  const externalSyncCheckedText = taskSyncUpdatedAt ?? "화면을 열면 자동 확인";
  const externalSyncOutcomeSentence =
    totalLearningImplementationTasks > 0
      ? `자동 반영 기준으로 완료 ${externalSyncCompletedText}, 다음은 ${externalSyncNextTaskText}입니다.`
      : "아직 반영할 제작 작업이 없습니다. STEP 6에서 작업 순서를 만든 뒤 최종 실행으로 넘기세요.";
  const externalSyncReviewRows = [
    ["반영 결과", externalSyncCompletedText, "외부 도구 완료 보고가 반영된 작업 수입니다."],
    ["다음 작업", externalSyncNextTaskText, "이 작업만 이어서 처리하면 됩니다."],
    ["최근 확인", externalSyncCheckedText, "최종 실행과 성과 확인 화면에서 자동으로 다시 읽습니다."],
  ] as const;
  const nextImplementationTaskId = nextImplementationTask?.id ?? null;
  const learningTaskTimeline = [...selectedImplementationTasks]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((task, index) => {
      const evidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
      const checklist = getImplementationEvidenceChecklist(task, evidence);
      const passedCount = checklist.filter((item) => item.passed).length;
      const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);
      const isNext = nextImplementationTaskId === task.id;
      const statusDetail =
        task.status === "done"
          ? evidence
            ? summarizeCursorProgressEvidence(evidence)
            : "완료 상태입니다."
          : task.status === "blocked"
            ? getBlockedImplementationTaskHint(task).nextAction
            : isNext
              ? "다음으로 이어서 처리할 작업입니다."
              : "앞선 작업이 끝나면 이어서 처리합니다.";

      return {
        task,
        code: getCursorTaskCode(index),
        statusDetail,
        passedCount,
        totalCount: checklist.length,
        missingLabels,
        isNext,
      };
    });
  const learningProgressTitle = nextImplementationTask
    ? "다음 작업 하나만 확인"
    : learningTaskTimeline.length > 0
      ? "완료된 것만 훑어보기"
      : "진행표 대기";
  const learningProgressDetail = nextImplementationTask
    ? "오늘은 표시된 다음 작업 하나만 끝내면 됩니다. 전체 목록은 진행 순서 확인용으로만 봅니다."
    : learningTaskTimeline.length > 0
      ? "완료된 작업과 남은 작업을 빠르게 확인하고, 다음 판단은 위의 한눈 요약에서 정합니다."
      : "최종 실행에서 첫 제작 작업을 넘기면 완료된 것, 남은 것, 지금 판단할 것이 여기에 표시됩니다.";
  const step8ProgressItems = learningTaskTimeline.map((item) => ({
    id: item.task.id,
    code: item.code,
    title: item.task.title,
    statusDetail: item.statusDetail,
    statusLabel: implementationTaskStatusLabels[item.task.status],
    statusTone: implementationTaskStatusTone[item.task.status],
    passedCount: item.passedCount,
    totalCount: item.totalCount,
    missingLabels: item.missingLabels,
    isNext: item.isNext,
    isDone: item.task.status === "done",
    showMissingEvidence: item.missingLabels.length > 0 && item.task.status !== "done",
  }));
  const implementationDependencyPlanDraft = selectedIdea && editState
    ? buildImplementationDependencyPlanMarkdown({
        idea: selectedIdea,
        state: editState,
        statuses: implementationDependencyStatuses,
      })
    : "";
  const implementationEvidenceSummaries = useMemo(
    () =>
      selectedImplementationTasks
        .map((task) => {
          const evidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
          const checklist = getImplementationEvidenceChecklist(task, evidence);
          const missing = checklist.filter((item) => !item.passed).map((item) => item.label);

          return {
            task,
            missing,
            passedCount: checklist.length - missing.length,
            totalCount: checklist.length,
          };
        })
        .sort(
          (a, b) =>
            b.missing.length - a.missing.length ||
            implementationTaskPriorityRank[a.task.priority] - implementationTaskPriorityRank[b.task.priority] ||
            implementationTaskActionRank[a.task.status] - implementationTaskActionRank[b.task.status] ||
            a.task.sort_order - b.task.sort_order,
        ),
    [implementationTaskEvidence, selectedImplementationTasks],
  );
  const implementationEvidenceIssues = implementationEvidenceSummaries.filter((summary) => summary.missing.length > 0);
  const blockedImplementationSummaries = useMemo(
    () =>
      selectedImplementationTasks
        .filter((task) => task.status === "blocked")
        .map((task) => {
          const evidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
          const checklist = getImplementationEvidenceChecklist(task, evidence);
          const missing = checklist.filter((item) => !item.passed).map((item) => item.label);

          return {
            task,
            hint: getBlockedImplementationTaskHint(task),
            missing,
          };
        })
        .sort(
          (a, b) =>
            implementationTaskPriorityRank[a.task.priority] - implementationTaskPriorityRank[b.task.priority] ||
            b.missing.length - a.missing.length ||
            a.task.sort_order - b.task.sort_order,
        ),
    [implementationTaskEvidence, selectedImplementationTasks],
  );
  const implementationOwnerOptions = useMemo(
    () =>
      ["all", ...Array.from(new Set(selectedImplementationTasks.map((task) => getImplementationTaskOwnerRole(task)))).sort((a, b) =>
        a.localeCompare(b, "ko-KR"),
      )],
    [selectedImplementationTasks],
  );
  const implementationOwnerFilterLabels = useMemo(
    () =>
      Object.fromEntries(
        implementationOwnerOptions.map((option) => [option, option === "all" ? "전체 담당" : option]),
      ) as Record<string, string>,
    [implementationOwnerOptions],
  );
  const activeImplementationOwnerFilter = implementationOwnerOptions.includes(implementationOwnerFilter)
    ? implementationOwnerFilter
    : "all";
  const filteredImplementationTasks = useMemo(
    () =>
      selectedImplementationTasks.filter((task) => {
        const currentEvidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
        const hasEvidenceGap = getImplementationEvidenceChecklist(task, currentEvidence).some((item) => !item.passed);
        const matchesStatus = implementationStatusFilter === "all" || task.status === implementationStatusFilter;
        const matchesOwner =
          activeImplementationOwnerFilter === "all" || getImplementationTaskOwnerRole(task) === activeImplementationOwnerFilter;
        const matchesEvidence =
          implementationEvidenceFilter === "all" ||
          (implementationEvidenceFilter === "missing" && hasEvidenceGap) ||
          (implementationEvidenceFilter === "complete" && !hasEvidenceGap);

        return matchesStatus && matchesOwner && matchesEvidence;
      }),
    [
      activeImplementationOwnerFilter,
      implementationEvidenceFilter,
      implementationTaskEvidence,
      implementationStatusFilter,
      selectedImplementationTasks,
    ],
  );
  const visibleImplementationStatuses =
    implementationStatusFilter === "all" ? implementationTaskStatuses : [implementationStatusFilter];

  const artifactVersionSummaries = useMemo(() => {
    const summaries = new Map<string, { previous: VentureArtifact; added: number; removed: number }>();

    for (const artifact of selectedArtifactRecords) {
      const previous = selectedArtifactRecords
        .filter(
          (candidate) =>
            candidate.id !== artifact.id &&
            candidate.artifact_type === artifact.artifact_type &&
            (candidate.version ?? 1) < (artifact.version ?? 1),
        )
        .sort(
          (a, b) =>
            (b.version ?? 1) - (a.version ?? 1) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

      if (previous) {
        summaries.set(artifact.id, {
          previous,
          ...summarizeArtifactLineChanges(artifact.body, previous.body),
        });
      }
    }

    return summaries;
  }, [selectedArtifactRecords]);
  const artifactReviewSummaries = useMemo(() => {
    const summaries = new Map<string, ArtifactReviewSummary>();

    for (const artifact of selectedArtifactRecords) {
      const previous =
        selectedArtifactRecords
          .filter(
            (candidate) =>
              candidate.id !== artifact.id &&
              candidate.artifact_type === artifact.artifact_type &&
              (candidate.version ?? 1) < (artifact.version ?? 1),
          )
          .sort(
            (a, b) =>
              (b.version ?? 1) - (a.version ?? 1) ||
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )[0] ?? null;

      summaries.set(artifact.id, summarizeArtifactReview(artifact, previous));
    }

    return summaries;
  }, [selectedArtifactRecords]);

  const canAdminSelectedOrganization = Boolean(
    user &&
      selectedIdea?.organization_id &&
      memberships.some(
        (membership) =>
          membership.user_id === user.id &&
          membership.organization_id === selectedIdea.organization_id &&
          adminRoles.has(membership.role),
      ),
  );
  const canEdit = Boolean(user && (selectedIdea?.created_by === user.id || canAdminSelectedOrganization));
  const getRecordAccessState = useCallback(
    (record: { created_by: string | null; organization_id: string | null }) => {
      if (!user) {
        return "hidden" as const;
      }

      if (record.created_by === user.id) {
        return "owned" as const;
      }

      if (record.organization_id) {
        const membership = memberships.find(
          (entry) => entry.user_id === user.id && entry.organization_id === record.organization_id,
        );

        if (!membership) {
          return "hidden" as const;
        }

        return adminRoles.has(membership.role) ? ("workspace_admin" as const) : ("workspace_member" as const);
      }

      return "hidden" as const;
    },
    [memberships, user],
  );

  function canManageRecord(record: { created_by: string | null; organization_id: string | null }) {
    const accessState = getRecordAccessState(record);
    return accessState === "owned" || accessState === "workspace_admin";
  }

  async function discardIdeaRecord(idea: Idea) {
    if (!supabase) {
      setMessage("Supabase 연결을 먼저 확인해 주세요.");
      return;
    }

    if (!user) {
      setMessage("아이디어를 삭제하려면 먼저 로그인해 주세요.");
      return;
    }

    if (!canManageRecord(idea)) {
      setMessage("이 아이디어를 삭제할 권한이 없습니다.");
      return;
    }

    const confirmed = window.confirm(`"${idea.name}" 아이디어를 삭제 목록으로 옮길까요?\n나중에 다시 되살릴 수 있습니다.`);

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("ideas")
      .update({ decision: "kill", stage: "paused", updated_at: new Date().toISOString() })
      .eq("id", idea.id)
      .select("*")
      .single();

    if (error || !data) {
      setIsBusy(false);
      setMessage(`${idea.name} 아이디어를 삭제 목록으로 옮기지 못했습니다: ${error?.message ?? "응답 없음"}`);
      return;
    }

    const updatedIdea = data as Idea;
    const nextIdeas = sortWorkbenchIdeas(ideas.map((currentIdea) => (currentIdea.id === idea.id ? updatedIdea : currentIdea)));
    const nextActiveIdea = getActiveIdeas(nextIdeas)[0] ?? null;

    setIdeas(nextIdeas);
    setSelectedIdeaId(nextActiveIdea?.id ?? "");
    setEditState(nextActiveIdea ? toEditState(nextActiveIdea) : null);
    setIsBusy(false);
    setMessage(`"${idea.name}" 아이디어를 삭제 목록으로 옮겼습니다.`);
    window.dispatchEvent(new CustomEvent<Idea>("venture:idea-updated", { detail: updatedIdea }));
    updateActiveTask(nextActiveIdea ? "select" : "archive");
    router.refresh();
  }

  async function restoreIdeaRecord(idea: Idea) {
    if (!supabase) {
      setMessage("Supabase 연결을 먼저 확인해 주세요.");
      return;
    }

    if (!user) {
      setMessage("아이디어를 되살리려면 먼저 로그인해 주세요.");
      return;
    }

    if (!canManageRecord(idea)) {
      setMessage("이 아이디어를 되살릴 권한이 없습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("ideas")
      .update({ decision: "research_more", stage: "score", updated_at: new Date().toISOString() })
      .eq("id", idea.id)
      .select("*")
      .single();

    if (error || !data) {
      setIsBusy(false);
      setMessage(`${idea.name} 아이디어를 되살리지 못했습니다: ${error?.message ?? "응답 없음"}`);
      return;
    }

    const updatedIdea = data as Idea;

    setIdeas((current) => sortWorkbenchIdeas(current.map((currentIdea) => (currentIdea.id === idea.id ? updatedIdea : currentIdea))));
    setSelectedIdeaId(updatedIdea.id);
    setEditState(toEditState(updatedIdea));
    setIsBusy(false);
    setMessage(`"${idea.name}" 아이디어를 다시 진행 목록으로 옮겼습니다.`);
    window.dispatchEvent(new CustomEvent<Idea>("venture:idea-updated", { detail: updatedIdea }));
    updateActiveTask("score");
    router.refresh();
  }

  async function deleteIdeaRecord(idea: Idea) {
    if (!supabase) {
      setMessage("Supabase 연결을 먼저 확인해 주세요.");
      return;
    }

    if (!user) {
      setMessage("아이디어를 삭제하려면 먼저 로그인해 주세요.");
      return;
    }

    if (!canManageRecord(idea)) {
      setMessage("이 아이디어를 삭제할 권한이 없습니다.");
      return;
    }

    const confirmed = window.confirm(
      `"${idea.name}" 아이디어와 연결된 리스크, 판단, 실험, 제작 자료, 실행 기록까지 영구 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const relatedTables = [
      "telemetry_events",
      "implementation_tasks",
      "venture_artifacts",
      "orchestration_runs",
      "experiments",
      "decisions",
      "risks",
    ] as const;

    for (const table of relatedTables) {
      const { error } = await supabase.from(table).delete().eq("idea_id", idea.id);

      if (error) {
        setIsBusy(false);
        setMessage(`${idea.name} 삭제 중 ${table} 정리에서 막혔습니다: ${error.message}`);
        return;
      }
    }

    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);

    if (error) {
      setIsBusy(false);
      setMessage(`${idea.name} 아이디어를 삭제하지 못했습니다: ${error.message}`);
      return;
    }

    const remainingIdeas = sortWorkbenchIdeas(ideas.filter((currentIdea) => currentIdea.id !== idea.id));
    const remainingActiveIdeas = getActiveIdeas(remainingIdeas);
    const deletingSelectedIdea = selectedIdeaId === idea.id || selectedIdea?.id === idea.id;
    const nextSelectedIdea = deletingSelectedIdea
      ? (remainingActiveIdeas[0] ?? null)
      : (remainingActiveIdeas.find((currentIdea) => currentIdea.id === selectedIdeaId) ?? remainingActiveIdeas[0] ?? null);

    setIdeas(remainingIdeas);
    setRisks((current) => current.filter((risk) => risk.idea_id !== idea.id));
    setDecisionLog((current) => current.filter((entry) => entry.idea_id !== idea.id));
    setExperiments((current) => current.filter((experiment) => experiment.idea_id !== idea.id));
    setOrchestrationRuns((current) => current.filter((run) => run.idea_id !== idea.id));
    setArtifacts((current) => current.filter((artifact) => artifact.idea_id !== idea.id));
    setImplementationTasks((current) => current.filter((task) => task.idea_id !== idea.id));
    setTelemetryEvents((current) => current.filter((event) => event.idea_id !== idea.id));
    setSelectedIdeaId(nextSelectedIdea?.id ?? "");
    setEditState(nextSelectedIdea ? toEditState(nextSelectedIdea) : null);
    setIsBusy(false);

    if (nextSelectedIdea) {
      if (deletingSelectedIdea) {
        updateActiveTask("score");
      }
      setMessage(`"${idea.name}" 아이디어를 완전히 삭제했고, 다음 아이디어로 이동했습니다.`);
    } else {
      updateActiveTask(remainingIdeas.length > 0 ? "archive" : "select");
      setMessage(`"${idea.name}" 아이디어를 완전히 삭제했습니다.`);
    }

    router.refresh();
  }

  const currentScore = editState ? scoreState(editState) : 0;
  const scoreRecommendation = recommendationForScore(currentScore);
  const scoreSaveDecision = saveDecisionForScore(scoreRecommendation);
  const savedEditState = selectedIdea ? toEditState(selectedIdea) : null;
  const selectedProductSurface = selectedIdea && editState ? inferIdeaProductSurface(selectedIdea, editState) : null;
  const activeProductSurface = selectedProductSurface ?? productSurfaceProfiles.web_app;
  const activeBuildDeliveryPhrase =
    buildDeliveryMode === "external_tool"
      ? `${activeExternalBuildTool.label}로 개발합니다`
      : "Venture Lab에서 계속 진행합니다";
  const hasReachedScoreStage = selectedIdea ? isIdeaStageAtOrAfter(selectedIdea.stage, "score") : false;
  const isScoreEvaluationSaved = Boolean(
    selectedIdea &&
      editState &&
      savedEditState &&
      hasReachedScoreStage &&
      selectedIdea.decision === scoreSaveDecision &&
      selectedIdea.problem_intensity === editState.problem_intensity &&
      selectedIdea.frequency === editState.frequency &&
      selectedIdea.reachability === editState.reachability &&
      selectedIdea.willingness_to_pay === editState.willingness_to_pay &&
      selectedIdea.mvp_speed === editState.mvp_speed &&
      selectedIdea.differentiation === editState.differentiation &&
      selectedIdea.regulatory_risk === editState.regulatory_risk &&
      selectedIdea.signal === editState.signal &&
      selectedIdea.risk_summary === editState.risk_summary &&
      selectedIdea.next_evidence === editState.next_evidence &&
      savedEditState.product_surface === editState.product_surface,
  );
  const missing =
    selectedIdea && editState ? missingEvidence(selectedIdea, editState, selectedIdeaRisks.length) : [];
  const validationPlan = selectedIdea && editState
    ? buildValidationPlan({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        risks: selectedIdeaRisks,
        missing,
      })
    : null;
  const recommendedValidationExperiment = validationPlan?.experiments[0] ?? null;
  const validationEvidenceCoach = selectedIdea && editState
    ? buildValidationEvidenceCoach({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
        decisions: selectedDecisions,
      })
    : null;
  const ideaBrief = selectedIdea && editState
    ? buildIdeaBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
      })
    : "";
  const researchBriefDraft = selectedIdea && editState
    ? buildResearchBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const validationSprintDraft = selectedIdea && editState
    ? buildValidationSprintMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
      })
    : "";
  const evidenceNoteDraft = selectedIdea && editState
    ? buildEvidenceNoteMarkdown({
        idea: selectedIdea,
        state: editState,
        draft: evidenceDraft,
      })
    : "";
  const selectedExperimentForResult =
    selectedExperiments.find((experiment) => experiment.id === experimentResultDraft.experiment_id) ??
    selectedExperiments[0] ??
    null;
  const experimentResultNoteDraft = selectedIdea && editState && selectedExperimentForResult
    ? buildExperimentResultMarkdown({
        idea: selectedIdea,
        state: editState,
        experiment: selectedExperimentForResult,
        draft: {
          ...experimentResultDraft,
          experiment_id: selectedExperimentForResult.id,
        },
      })
    : "";
  const validationSummaryDraft = selectedIdea && editState
    ? buildValidationSummaryMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
        decisions: selectedDecisions,
      })
    : "";
  const prdDraft = selectedIdea && editState
    ? buildPrdMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const mvpSpecDraft = selectedIdea && editState
    ? buildMvpSpecMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const mvpSlicePlanDraft = selectedIdea && editState
    ? buildMvpSlicePlanMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const developmentPlanDraft = selectedIdea && editState
    ? buildAppDevelopmentPlanMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const backendCandidateScores = selectedIdea && editState
    ? buildBackendCandidateScores({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
      })
    : [];
  const backendDecisionDraft = selectedIdea && editState
    ? buildBackendDecisionMarkdown({
        idea: selectedIdea,
        state: editState,
        candidates: backendCandidateScores,
      })
    : "";
  const backendExecutionPlan = backendCandidateScores[0] ? buildBackendExecutionPlan(backendCandidateScores[0]) : null;
  const firstBuildBridge = selectedIdea && editState
    ? buildFirstBuildBridge({
        idea: selectedIdea,
        state: editState,
        backend: backendCandidateScores[0] ?? null,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
      })
    : null;
  const backendExecutionPlanDraft = selectedIdea && backendExecutionPlan
    ? buildBackendExecutionPlanMarkdown({
        idea: selectedIdea,
        plan: backendExecutionPlan,
      })
    : "";
  const designBriefDraft = selectedIdea && editState
    ? buildDesignBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        runs: selectedRuns,
      })
    : "";
  const designGenerationPromptDraft = selectedIdea && editState
    ? buildDesignGenerationPromptMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        backendCandidateScores,
      })
    : "";
  const techSpecDraft = selectedIdea && editState
    ? buildTechSpecMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const appBlueprintDraft = selectedIdea && editState
    ? buildAppBlueprintMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        implementationTasks: selectedImplementationTasks,
        backendCandidateScores,
      })
    : "";
  const scaffoldManifestDraft = selectedIdea && editState
    ? buildMvpScaffoldManifestMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        backendCandidateScores,
      })
    : "";
  const implementationHandoffDraft = selectedIdea && editState
    ? buildImplementationHandoffMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const rolePromptPackDraft = selectedIdea && editState
    ? buildRolePromptPackMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
      })
    : "";
  const implementationTaskTicketDraft = selectedIdea && editState && nextImplementationTask
    ? buildImplementationTaskTicketMarkdown({
        idea: selectedIdea,
        state: editState,
        task: nextImplementationTask,
      })
    : "";
  const implementationBacklogDraft = selectedIdea && editState
    ? buildImplementationBacklogMarkdown({
        idea: selectedIdea,
        state: editState,
        tasks: selectedOpenImplementationTasks,
        viewName: "열린 제작 할 일",
        filterSummary: "상태: 완료 제외 / 담당: 전체 / 증거: 전체",
        evidenceByTaskId: implementationTaskEvidence,
        emptyMessage: "열린 제작 할 일이 없습니다.",
      })
    : "";
  const implementationFilterSummary = `상태: ${implementationStatusFilterLabels[implementationStatusFilter]} / 담당: ${
    implementationOwnerFilterLabels[activeImplementationOwnerFilter]
  } / 증거: ${implementationEvidenceFilterLabels[implementationEvidenceFilter]}`;
  const filteredImplementationBacklogDraft = selectedIdea && editState
    ? buildImplementationBacklogMarkdown({
        idea: selectedIdea,
        state: editState,
        tasks: filteredImplementationTasks,
        viewName: "필터된 제작 할 일",
        filterSummary: implementationFilterSummary,
        evidenceByTaskId: implementationTaskEvidence,
        emptyMessage: "현재 필터 조건에 맞는 제작 할 일이 없습니다.",
      })
    : "";
  const filteredImplementationRunPromptDraft = selectedIdea && editState
    ? buildFilteredImplementationRunPromptMarkdown({
        idea: selectedIdea,
        state: editState,
        tasks: filteredImplementationTasks,
        filterSummary: implementationFilterSummary,
        evidenceByTaskId: implementationTaskEvidence,
      })
    : "";
  const implementationTaskDrafts = selectedIdea && editState
    ? buildImplementationTaskDrafts({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
      })
    : [];
  const cursorHandoffTaskDrafts = implementationTaskDrafts;
  const implementationTaskSourceArtifact = selectedArtifactRecords.find(
    (artifact) =>
      artifact.status === "approved" &&
      ["tech_spec", "dev_runbook", "mvp_spec", "prd"].includes(artifact.artifact_type),
  ) ?? selectedArtifactRecords.find((artifact) =>
    ["tech_spec", "dev_runbook", "mvp_spec", "prd"].includes(artifact.artifact_type),
  );
  const hasIdeaBriefArtifact = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "idea_brief" ||
      (artifact.title || "").includes("아이디어 브리프") ||
      (artifact.title || "").includes("아이디어 요약"),
  );
  const hasResearchNoteArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "research_note");
  const marketScanArtifacts = selectedArtifactRecords.filter(isMarketScanArtifactRecord);
  const currentMarketScanArtifact = marketScanArtifacts.find((artifact) =>
    isMarketScanArtifactForProductSurface(artifact, activeProductSurface.label),
  );
  const hasMarketScanArtifact = Boolean(currentMarketScanArtifact);
  const hasOutdatedMarketScanArtifact = marketScanArtifacts.length > 0 && !hasMarketScanArtifact;
  const marketScanContextKey =
    selectedIdea && editState
      ? `${selectedIdea.id}:${editState.product_surface ?? selectedIdea.product_surface ?? "undecided"}`
      : null;
  const visibleMarketScanDraft =
    marketScanContextKey && marketScanDraftKey === marketScanContextKey ? marketScanDraft : null;
  const isVisibleMarketScanEstimate = marketScanMode === "local_estimate" && Boolean(visibleMarketScanDraft);
  const marketScanSourceBoundaryText = visibleMarketScanDraft
    ? isVisibleMarketScanEstimate
      ? "제작 패키지 근거로 쓰기 전, 웹 조사 다시 시도로 공개 출처를 붙이는 것이 안전합니다."
      : visibleMarketScanDraft.sources.length > 0
        ? `공개 출처 ${visibleMarketScanDraft.sources.length}개를 함께 저장합니다. 중요한 수치만 원문에서 한 번 더 확인하세요.`
        : "웹 조사 모드지만 표시할 공개 출처가 부족합니다. 중요한 판단 전에는 출처를 한 번 더 확인하세요."
    : "";
  const marketScanStatus = isMarketScanLoading
    ? {
        label: "정리 중",
        tone: "avl-pill avl-pill-info",
        detail: "AI가 수요, 경쟁도, 시장 포화도, 진입장벽을 확인하고 있습니다.",
      }
    : hasMarketScanArtifact
      ? {
          label: "저장 완료",
          tone: "avl-pill avl-pill-success",
          detail: "리서치 노트로 저장되어 다음 단계 판단과 제작 자료에 함께 반영됩니다.",
        }
      : visibleMarketScanDraft
        ? isVisibleMarketScanEstimate
          ? {
              label: "추정 초안",
              tone: "avl-pill avl-pill-warning",
              detail: "웹 출처를 붙이지 못해 사용자 입력 기반 추정으로 준비됐습니다.",
            }
          : {
              label: "웹 조사 준비",
              tone: "avl-pill avl-pill-success",
              detail: "출처가 포함된 자동 점검 초안이 준비됐습니다. 필요한 부분만 보완하면 됩니다.",
            }
        : hasOutdatedMarketScanArtifact
          ? {
              label: "다시 정리 필요",
              tone: "avl-pill avl-pill-warning",
              detail: "결과물 형태가 바뀌어서 현재 기준의 시장·경쟁 점검을 다시 저장해야 합니다.",
            }
        : {
            label: "자동 대기",
            tone: "avl-pill avl-pill-neutral",
            detail: "이 단계가 열리면 AI가 먼저 시장과 경쟁 상황을 정리합니다.",
          };
  const marketScanActionLabel = isMarketScanLoading
    ? "정리 중"
    : hasOutdatedMarketScanArtifact
      ? "현재 결과물 형태로 다시 정리"
      : hasMarketScanArtifact || visibleMarketScanDraft
      ? isVisibleMarketScanEstimate
        ? "웹 조사 다시 시도"
        : "다시 정리"
      : "AI 자동 점검 실행";
  const hasResearchBriefArtifact = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "research_note" &&
      (artifact.source === "extracted_research_brief" ||
        ((artifact.source || "workbench") === "workbench" && (artifact.title || "").includes("리서치 브리프")) ||
        ((artifact.source || "workbench") === "workbench" && (artifact.title || "").includes("조사 요약")) ||
        (artifact.body || "").startsWith("# 리서치 브리프")),
  );
  const hasValidationSprintArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.source === "validation_sprint" || (artifact.title || "").includes("7일 검증 계획"),
  );
  const hasValidationSummaryArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.source === "validation_summary" || (artifact.title || "").includes("검증 완료 요약"),
  );
  const hasEvidenceCaptureArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "evidence_capture");
  const hasExperimentResultArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "experiment_result");
  const validationSummaryRequirements = [
    { label: "아이디어 요약", passed: hasIdeaBriefArtifact },
    { label: "조사 요약", passed: hasResearchBriefArtifact },
    { label: "7일 검증 계획", passed: hasValidationSprintArtifact },
  ];
  const canSaveValidationSummary = validationSummaryRequirements.every((requirement) => requirement.passed);
  const isValidationBundleSaved = canSaveValidationSummary && hasValidationSummaryArtifact;
  const canEnterDevelopmentFromValidationDocs =
    canSaveValidationSummary && hasValidationSummaryArtifact;
  const hasPrdArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "prd");
  const hasApprovedPrdArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "prd" && artifact.status === "approved",
  );
  const hasMvpSpecArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasApprovedMvpSpecArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
  );
  const hasMvpSlicePlanArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "mvp_slice_plan");
  const hasMvpScopeArtifact = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "mvp_spec" &&
      (artifact.source || "workbench") === "workbench" &&
      (artifact.title || "").includes("첫 제작 범위") &&
      !(artifact.title || "").includes("플랜"),
  );
  const hasLaunchChecklistArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "launch_checklist",
  );
  const hasBackendDecisionArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "backend_decision",
  );
  const hasDesignBriefArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "design_brief");
  const hasApprovedDesignBriefArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "design_brief" && artifact.status === "approved",
  );
  const hasDesignGenerationPromptArtifact = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "design_brief" &&
      (artifact.source === "design_generation_prompt" ||
        (artifact.title || "").includes("디자인 기준 자료") ||
        (artifact.title || "").includes("디자인 생성 프롬프트")),
  );
  const hasTechSpecArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "tech_spec");
  const hasApprovedTechSpecArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "tech_spec" && artifact.status === "approved",
  );
  const hasDevRunbookArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "dev_runbook");
  const hasDevelopmentPlanArtifact = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "dev_runbook" &&
      artifact.source === "development_process" &&
      (artifact.title || "").includes("제작 실행 계획"),
  );
  const hasAgentRunPackageArtifact = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "dev_runbook" &&
      (artifact.source === "agent_run_package" ||
        (artifact.title || "").includes("제작 패키지") ||
        (artifact.title || "").includes("하네스 패키지")),
  );
  const hasDevelopmentDesignPackageArtifact = hasDesignGenerationPromptArtifact || hasDesignBriefArtifact;
  const hasDevelopmentExecutionPackageArtifact =
    hasDevelopmentPlanArtifact ||
    selectedArtifactRecords.some(
      (artifact) =>
        artifact.artifact_type === "dev_runbook" &&
        (artifact.source === "development_process" ||
          (artifact.title || "").includes("제작 실행 계획") ||
          (artifact.body || "").includes("## 상세 실행 계획")),
    );
  const hasDevelopmentHandoffPackageArtifact =
    hasAgentRunPackageArtifact ||
    selectedArtifactRecords.some(
      (artifact) =>
        artifact.artifact_type === "dev_runbook" &&
        ((artifact.body || "").includes("# 제작 패키지") ||
          (artifact.body || "").includes("제작 도구 전달 자료") ||
          (artifact.body || "").includes("외부 제작 패키지 구성")),
    );
  const manualDevelopmentDraftCount = [
    hasBackendDecisionArtifact,
    hasDevelopmentDesignPackageArtifact,
    hasTechSpecArtifact,
    hasDevRunbookArtifact,
  ].filter(Boolean).length;
  const hasManualDevelopmentPackageFallback = hasDevRunbookArtifact && manualDevelopmentDraftCount >= 3;
  const canEnterOrchestrationFromDevelopmentDocs =
    (hasDevelopmentDesignPackageArtifact &&
      hasDevelopmentExecutionPackageArtifact &&
      hasDevelopmentHandoffPackageArtifact) ||
    hasManualDevelopmentPackageFallback;

  const developmentOpsArtifacts = selectedArtifactRecords.filter((artifact) =>
    ["backend_decision", "tech_spec", "dev_runbook"].includes(artifact.artifact_type),
  );
  const hasEnvironmentChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      ["환경변수", "Vercel"].every((term) => artifact.body.includes(term)) &&
      ["서버 전용", "클라이언트", "비밀값"].some((term) => artifact.body.includes(term)),
  );
  const hasBackendRulesChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      (artifact.body.includes("RLS") || artifact.body.includes("Security Rules")) &&
      ["허용", "차단"].every((term) => artifact.body.includes(term)),
  );
  const hasReleaseOpsChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      ["롤백", "Production"].every((term) => artifact.body.includes(term)) &&
      (artifact.body.includes("배포 로그") || artifact.body.includes("빌드 로그") || artifact.body.includes("Vercel 로그")),
  );
  const hasDesignStateCoverage = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "design_brief" &&
      ["빈 상태", "로딩", "오류", "권한", "모바일", "접근성"].every((term) => artifact.body.includes(term)),
  );
  const completedImplementationTasks = implementationTaskProgressStats.completedTasks;
  const implementationTasksWithEvidence = completedImplementationTasks.filter((task) => task.evidence.trim());
  const hasBlockedImplementationTasks = implementationTaskProgressStats.blockedCount > 0;
  const hasCompletedExperiment = selectedExperiments.some((experiment) => experiment.status === "done");
  const highRiskCount = selectedIdeaRisks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;
  const unresolvedHighRiskCount = selectedIdeaRisks.filter(
    (risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed",
  ).length;
  const prdReadinessChecks: GateCheck[] = selectedIdea && editState
    ? [
        {
          label: "기본 입력",
          passed: missing.length === 0,
          detail: missing.length === 0 ? "한 줄 설명, 대상 사용자, 구매자, 수요 신호가 채워져 있습니다." : missing.join(", "),
        },
        {
          label: "아이디어 요약",
          passed: hasIdeaBriefArtifact,
          detail: hasIdeaBriefArtifact ? "짧은 요약 문서가 저장되어 있습니다." : "검증 자료에서 아이디어 요약을 저장하세요.",
        },
        {
          label: "리서치 근거",
          passed: hasResearchNoteArtifact,
          detail: hasResearchNoteArtifact ? "리서치 노트가 1개 이상 저장되어 있습니다." : "조사 요약 또는 근거 노트를 저장하세요.",
        },
        {
          label: "7일 검증 계획",
          passed: hasValidationSprintArtifact,
          detail: hasValidationSprintArtifact ? "7일 검증 계획이 저장되어 있습니다." : "7일 검증 계획을 저장하세요.",
        },
        {
          label: "현장 근거",
          passed: hasEvidenceCaptureArtifact || hasExperimentResultArtifact,
          detail:
            hasEvidenceCaptureArtifact || hasExperimentResultArtifact
              ? "수동 근거 또는 검증 결과가 기록되어 있습니다."
              : "인터뷰, 외부 자료, 가격 신호, 검증 결과 중 하나를 저장하세요.",
        },
        {
          label: "검증 학습",
          passed: hasCompletedExperiment || hasExperimentResultArtifact,
          detail:
            hasCompletedExperiment || hasExperimentResultArtifact
              ? "완료된 검증 계획 또는 검증 결과 노트가 있습니다."
              : "검증 계획을 완료하거나 검증 결과 기록을 저장하세요.",
        },
        {
          label: "높은 리스크 통제",
          passed: unresolvedHighRiskCount === 0,
          detail:
            highRiskCount === 0
              ? "높음/치명 리스크가 없습니다."
              : `${highRiskCount - unresolvedHighRiskCount}/${highRiskCount}개 높은 리스크가 종료되었습니다.`,
        },
        {
          label: "판단 기록",
          passed: editState.decision !== "pending" && selectedDecisions.length > 0,
          detail:
            editState.decision !== "pending" && selectedDecisions.length > 0
              ? `${decisionLabels[editState.decision]} 판단과 기록 ${selectedDecisions.length}개가 있습니다.`
              : "진행, 추가 조사, 전환, 중단 중 하나로 판단 근거를 남기세요.",
        },
        {
          label: "검증 완료 요약",
          passed: hasValidationSummaryArtifact,
          detail: hasValidationSummaryArtifact ? "기획서로 넘어가기 전 요약 메모가 저장되어 있습니다." : "검증 완료 요약을 저장하세요.",
        },
      ]
    : [];
  const passedPrdReadinessCount = prdReadinessChecks.filter((check) => check.passed).length;
  const prdReadinessScore =
    prdReadinessChecks.length === 0 ? 0 : Math.round((passedPrdReadinessCount / prdReadinessChecks.length) * 100);
  const nextPrdBlocker = prdReadinessChecks.find((check) => !check.passed) ?? null;
  const prdHandoffDraft = selectedIdea && editState
    ? buildPrdHandoffMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        prdReadinessScore,
        prdReadinessChecks,
        validationEvidenceCoach,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        decisions: selectedDecisions,
        nextPrdBlocker,
      })
    : "";
  const designReadinessChecks: GateCheck[] = selectedIdea && editState
    ? [
        {
          label: "핵심 여정 고정",
          passed: Boolean(selectedIdea.one_liner.trim() && selectedIdea.target_user.trim() && editState.next_evidence.trim()),
          detail:
            selectedIdea.one_liner.trim() && selectedIdea.target_user.trim() && editState.next_evidence.trim()
              ? "사용자, 가치 제안, 추가 확인 내용이 한 흐름으로 연결되어 있습니다."
              : "한 줄 설명, 대상 사용자, 추가 확인 내용을 먼저 고정하세요.",
        },
        {
          label: "제품 기획서",
          passed: hasPrdArtifact,
          detail: hasPrdArtifact ? "제품 기획서 초안이 저장되어 있습니다." : "제작 자료에서 제품 기획서를 저장하세요.",
        },
        {
          label: "첫 제작 범위",
          passed: hasMvpSpecArtifact,
          detail: hasMvpSpecArtifact ? "포함/제외 범위가 저장되어 있습니다." : "첫 제작 범위를 저장하세요.",
        },
        {
          label: "백엔드 선택",
          passed: hasBackendDecisionArtifact,
          detail: hasBackendDecisionArtifact
            ? "데이터/인증/운영 경계가 백엔드 결정에 기록되어 있습니다."
            : "백엔드 선택 비교를 보고 결정을 저장하세요.",
        },
        {
          label: "디자인 상태 커버리지",
          passed: hasDesignStateCoverage,
          detail: hasDesignStateCoverage
            ? "빈 상태, 로딩, 오류, 권한, 모바일, 접근성 상태가 디자인 기준에 포함되어 있습니다."
            : "디자인 기준에 빈 상태, 로딩, 오류, 권한, 모바일, 접근성을 명시하세요.",
        },
        {
          label: "디자인 실행",
          passed: selectedRuns.some((run) => run.phase === "design" && run.status === "done") || hasDesignBriefArtifact,
          detail:
            selectedRuns.some((run) => run.phase === "design" && run.status === "done") || hasDesignBriefArtifact
              ? "디자인 기준이 준비되어 있습니다."
              : "디자인 기준을 저장하세요.",
        },
      ]
    : [];
  const passedDesignReadinessCount = designReadinessChecks.filter((check) => check.passed).length;
  const designReadinessScore =
    designReadinessChecks.length === 0
      ? 0
      : Math.round((passedDesignReadinessCount / designReadinessChecks.length) * 100);
  const buildReadinessChecks: GateCheck[] = selectedIdea
    ? [
        {
          label: "제품 기획서 승인",
          passed: hasApprovedPrdArtifact,
          detail: hasApprovedPrdArtifact
            ? "제품 기획서가 승인되어 제작 입력으로 쓸 수 있습니다."
            : hasPrdArtifact
              ? "제품 기획서 초안은 있고 승인이 필요합니다."
              : "제품 기획서를 먼저 저장하세요.",
        },
        {
          label: "첫 제작 범위 승인",
          passed: hasApprovedMvpSpecArtifact,
          detail: hasApprovedMvpSpecArtifact
            ? "첫 수직 슬라이스 범위가 승인되었습니다."
            : hasMvpSpecArtifact
              ? "첫 제작 범위 초안은 있고 승인이 필요합니다."
              : "첫 제작 범위를 먼저 저장하세요.",
        },
        {
          label: "첫 제작 범위 플랜",
          passed: hasMvpSlicePlanArtifact,
          detail: hasMvpSlicePlanArtifact
            ? "수동 검증, 얇은 제품, AI/자동화, 출시 준비 순서가 저장되어 있습니다."
            : "제작 자료에서 첫 제작 범위 플랜을 저장하세요.",
        },
        {
          label: "백엔드 결정",
          passed: hasBackendDecisionArtifact,
          detail: hasBackendDecisionArtifact
            ? "Supabase/Firebase 선택 근거가 기록되어 있습니다."
            : "백엔드 선택 비교에서 결정을 저장하세요.",
        },
        {
          label: "디자인 승인",
          passed: hasApprovedDesignBriefArtifact,
          detail: hasApprovedDesignBriefArtifact
            ? "구현 전 화면 흐름과 상태가 승인되었습니다."
            : hasDesignBriefArtifact
              ? "디자인 기준 초안은 있고 승인이 필요합니다."
              : "디자인 기준을 저장하세요.",
        },
        {
          label: "기술 명세 승인",
          passed: hasApprovedTechSpecArtifact,
          detail: hasApprovedTechSpecArtifact
            ? "데이터 모델, 권한, 검증 명령이 승인되었습니다."
            : hasTechSpecArtifact
              ? "기술 명세 초안은 있고 승인이 필요합니다."
              : "기술 명세를 저장하세요.",
        },
        {
          label: "제작 실행 계획",
          passed: hasDevRunbookArtifact,
          detail: hasDevRunbookArtifact
            ? "제작 순서와 로컬/배포 검증 경로가 있습니다."
            : "제작 실행 계획을 저장하세요.",
        },
        {
          label: "환경변수 경계",
          passed: hasEnvironmentChecklist,
          detail: hasEnvironmentChecklist
            ? "Vercel 환경변수와 서버/클라이언트 비밀값 경계가 제작 자료에 있습니다."
            : "기술 명세나 제작 실행 계획에 Vercel 환경변수, 서버 전용 키, 클라이언트 공개 키 경계를 적으세요.",
        },
        {
          label: "백엔드 규칙 검증",
          passed: hasBackendRulesChecklist,
          detail: hasBackendRulesChecklist
            ? "RLS 또는 Security Rules의 허용/차단 검증이 기록되어 있습니다."
            : "Supabase RLS 또는 Firebase Security Rules의 허용/차단 테스트 계획을 저장하세요.",
        },
        {
          label: "롤백/배포 로그",
          passed: hasReleaseOpsChecklist,
          detail: hasReleaseOpsChecklist
            ? "Production 배포 로그와 롤백 경로가 제작 자료에 있습니다."
            : "Preview/Production 배포 로그, Vercel inspect 링크, 롤백 기준을 제작 실행 계획에 기록하세요.",
        },
        {
          label: "태스크 분해",
          passed: selectedImplementationTasks.length > 0,
          detail:
            selectedImplementationTasks.length > 0
              ? `${selectedImplementationTasks.length}개 구현 태스크로 쪼개져 있습니다.`
              : "기본 태스크를 생성하세요.",
        },
        {
          label: "높은 리스크",
          passed: unresolvedHighRiskCount === 0,
          detail:
            unresolvedHighRiskCount === 0
              ? "열린 높음/치명 리스크가 없습니다."
              : `${unresolvedHighRiskCount}개 높음/치명 리스크가 남아 있습니다.`,
        },
      ]
    : [];
  const passedBuildReadinessCount = buildReadinessChecks.filter((check) => check.passed).length;
  const buildReadinessScore =
    buildReadinessChecks.length === 0 ? 0 : Math.round((passedBuildReadinessCount / buildReadinessChecks.length) * 100);
  const nextBuildBlocker = buildReadinessChecks.find((check) => !check.passed) ?? null;
  const developmentKickoffDraft = selectedIdea && editState
    ? buildDevelopmentKickoffMarkdown({
        idea: selectedIdea,
        state: editState,
        readinessChecks: buildReadinessChecks,
        taskDrafts: implementationTaskDrafts,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const agentRunPackageTasks = filteredImplementationTasks.some((task) => task.status !== "done")
    ? filteredImplementationTasks.filter((task) => task.status !== "done")
    : selectedOpenImplementationTasks;
  const agentRunPackageDraft = selectedIdea && editState
    ? buildAgentRunPackageMarkdown({
        idea: selectedIdea,
        state: editState,
        artifacts: selectedArtifactRecords,
        tasks: agentRunPackageTasks,
        nextTask: nextImplementationTask,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        readinessChecks: buildReadinessChecks,
        filterSummary: implementationFilterSummary,
        buildDeliveryMode,
        externalBuildTool: activeExternalBuildTool,
      })
    : "";
  const implementationGateChecks: GateCheck[] = selectedIdea
    ? [
        {
          label: "제작 할 일 생성",
          passed: selectedImplementationTasks.length > 0,
          detail:
            selectedImplementationTasks.length > 0
              ? `${selectedImplementationTasks.length}개의 실행 할 일이 있습니다.`
              : "제작 준비 과정에서 기본 실행 할 일을 생성하세요.",
        },
        {
          label: "차단된 할 일 없음",
          passed: !hasBlockedImplementationTasks,
          detail: hasBlockedImplementationTasks
            ? `${implementationTaskProgressStats.blockedCount}개 할 일이 차단 상태입니다.`
            : "현재 차단 상태의 할 일이 없습니다.",
        },
        {
          label: "모든 할 일 완료",
          passed:
            selectedImplementationTasks.length > 0 &&
            completedImplementationTasks.length === selectedImplementationTasks.length,
          detail:
            selectedImplementationTasks.length > 0
              ? `${completedImplementationTasks.length}/${selectedImplementationTasks.length}개 완료`
              : "완료할 할 일이 아직 없습니다.",
        },
        {
          label: "완료 증거 기록",
          passed:
            completedImplementationTasks.length > 0 &&
            implementationTasksWithEvidence.length === completedImplementationTasks.length,
          detail:
            completedImplementationTasks.length > 0
              ? `${implementationTasksWithEvidence.length}/${completedImplementationTasks.length}개 완료 항목에 근거가 있습니다.`
              : "완료된 할 일이 생기면 커밋, PR, 스모크 결과, 배포 URL 같은 근거를 기록하세요.",
        },
        {
          label: "QA와 보안 단계 완료",
          passed:
            selectedRuns.some((run) => run.phase === "qa" && run.status === "done") &&
            selectedRuns.some((run) => run.phase === "security" && run.status === "done"),
        detail: "QA와 보안 점검이 모두 완료되어야 합니다.",
        },
      ]
    : [];
  const passedImplementationGateCount = implementationGateChecks.filter((check) => check.passed).length;
  const implementationGateScore =
    implementationGateChecks.length === 0
      ? 0
      : Math.round((passedImplementationGateCount / implementationGateChecks.length) * 100);
  const launchChecklistDraft = selectedIdea && editState
    ? buildLaunchChecklistMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
      })
    : "";
  const developmentArtifactDrafts: Array<{
    artifactType: VentureArtifactType;
    title: string;
    body: string;
    description: string;
  }> = selectedIdea
    ? [
        {
          artifactType: "backend_decision",
          title: `${selectedIdea.name} 백엔드 결정`,
          body: backendDecisionDraft,
          description: "Supabase, Firebase, SQL Connect, 하이브리드 중 어떤 백엔드를 쓸지 기록합니다.",
        },
        {
          artifactType: "backend_decision",
          title: `${selectedIdea.name} 백엔드 실행 체크리스트`,
          body: backendExecutionPlanDraft,
          description: "선택한 백엔드의 환경변수, 권한 규칙, 검증 명령, 롤백 기준을 제작 자료로 고정합니다.",
        },
        {
          artifactType: "design_brief",
          title: `${selectedIdea.name} 디자인 기준`,
          body: designBriefDraft,
          description: "핵심 여정, 화면 상태, 모바일/접근성 체크를 제작 전에 고정합니다.",
        },
        {
          artifactType: "tech_spec",
          title: `${selectedIdea.name} 기술 명세`,
          body: techSpecDraft,
          description: "데이터 모델, 권한 경계, 구현 순서, 검증 명령, 롤백 경로를 정리합니다.",
        },
      ]
    : [];
  const developmentPackageDrafts: Array<{
    artifactType: VentureArtifactType;
    title: string;
    body: string;
    source: string;
  }> = selectedIdea
    ? [
        ...developmentArtifactDrafts.map((draft) => ({
          artifactType: draft.artifactType,
          title: draft.title,
          body: draft.body,
          source: "development_process",
        })),
        {
          artifactType: "dev_runbook",
          title: `${selectedIdea.name} 제작 실행 계획`,
          body: developmentPlanDraft,
          source: "development_process",
        },
        {
          artifactType: "tech_spec",
          title: `${selectedIdea.name} 앱 구조 청사진`,
          body: appBlueprintDraft,
          source: "app_blueprint",
        },
        {
          artifactType: "dev_runbook",
          title: `${selectedIdea.name} 첫 제작 뼈대 안내서`,
          body: scaffoldManifestDraft,
          source: "scaffold_manifest",
        },
      ]
    : [];
  const visibleDevelopmentPanel: DevelopmentPanel =
    experienceMode === "guided" ? "setup" : developmentPanel;
  const hasSavedDevelopmentAutoPackage =
    canEnterOrchestrationFromDevelopmentDocs;
  const effectiveDevelopmentAutoFlowState: DevelopmentAutoFlowState | "saved" =
    hasSavedDevelopmentAutoPackage ? "saved" : developmentAutoFlowState;
  const developmentAutoProgressSteps = [
    {
      label: "검증 결과 읽는 중",
      detail: hasValidationSummaryArtifact
        ? "저장된 검증 완료 요약과 조사 자료를 기준으로 봅니다."
        : "아이디어 요약, 조사 요약, 7일 검증 계획을 기준으로 부족한 부분을 표시합니다.",
    },
    {
      label: "결과물 형태 확인 중",
      detail: `${activeProductSurface.label} 기준으로 기획서, 화면 구조, 기술 방향, 제작 자료를 맞춥니다.`,
    },
    {
      label: "제작 범위 정리 중",
      detail: firstBuildBridge?.firstTasks.slice(0, 2).join(" · ") || "처음 만들 핵심 화면과 기능을 한 묶음으로 정리합니다.",
    },
    {
      label: "디자인/기술 방향 정리 중",
      detail: `${activeProductSurface.iaHint} ${firstBuildBridge?.stackReason || activeProductSurface.stackHint}`,
    },
    {
      label:
        buildDeliveryMode === "external_tool"
          ? `${activeExternalBuildTool.label} 전달 자료 정리 중`
          : "Venture Lab 실행 자료 정리 중",
      detail:
        buildDeliveryMode === "external_tool"
          ? `${activeExternalBuildTool.packageFocus} ${activeProductSurface.handoffHint}`
          : "작업 순서 보드, 실행 할 일, 최종 실행, 성과 확인 화면에서 이어서 처리할 자료를 묶습니다.",
    },
  ];
  const developmentAutoSummaryCards = [
    {
      label: "검증 결과",
      value: hasValidationSummaryArtifact ? "검증 완료 요약 기준" : "저장된 검증 자료 기준",
      detail: "아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 제작 입력으로 묶습니다.",
    },
    {
      label: "결과물 형태",
      value: activeProductSurface.label,
      detail: `${activeProductSurface.firstBuild} 기준으로 ${activeProductSurface.harnessFocus}`,
    },
    {
      label: "화면 구조",
      value: activeProductSurface.shortLabel,
      detail: activeProductSurface.iaHint,
    },
    {
      label: "기술 방향",
      value: firstBuildBridge?.stackTitle || backendCandidateScores[0]?.label || "Next.js + Supabase",
      detail:
        firstBuildBridge?.stackReason ||
        "인증, 저장, 권한 경계를 빠르게 붙이고 첫 제작 범위를 작게 시작하는 방향입니다.",
    },
    {
      label: "개발 방식",
      value: activeBuildDeliveryLabel,
      detail: activeBuildDeliveryDetail,
    },
    {
      label: "제작 범위",
      value: firstBuildBridge?.firstTasks[0] || "핵심 입력과 저장 흐름",
      detail:
        [
          firstBuildBridge?.firstTasks.slice(1).join(" · ") ||
            "첫 화면에서 사용자가 입력하고 결과를 저장하는 최소 흐름을 우선 만듭니다.",
          firstBuildBridge?.excludeNow[0] ? `이번엔 제외: ${firstBuildBridge.excludeNow.join(" · ")}` : "부가 기능과 복잡한 자동화는 뒤로 미룹니다.",
        ].join(" "),
    },
  ];
  const developmentAutoBuildBridgeCards = [
    {
      label: "첫 제작 순서",
      items:
        firstBuildBridge?.firstTasks.slice(0, 3) ??
        ["첫 화면에서 사용자가 입력할 한 가지 행동을 만든다", "저장과 조회를 연결한다", "성공/실패 상태를 확인한다"],
    },
    {
      label: "기술 스택 후보",
      items: [
        firstBuildBridge?.stackTitle || backendCandidateScores[0]?.label || "Next.js + Supabase",
        firstBuildBridge?.stackReason ||
          activeProductSurface.stackHint ||
          "인증, 저장, 권한 경계를 빠르게 붙이고 첫 제작 범위를 작게 시작합니다.",
      ],
    },
    {
      label: "이번엔 뺄 것",
      items:
        firstBuildBridge?.excludeNow.slice(0, 3) ??
        ["결제, 관리자 고급 기능, 자동화 전체 흐름", "여러 사용자군과 여러 가격 모델 동시 검증", "검증 목표와 관계없는 부가 기능"],
    },
  ];
  const developmentAutoOutputItems = [
    {
      label: "디자인 기준",
      detail: `${activeProductSurface.label}에 맞는 화면 구조, 상태, 모바일/접근성 기준을 저장합니다.`,
    },
    {
      label: "제작 실행 계획",
      detail: "기술 방향, 백엔드 후보, 작업 순서, 품질 점검, 배포/롤백 기준을 저장합니다.",
    },
    {
      label: buildDeliveryMode === "external_tool" ? "개발 도구 전달 자료" : "내부 실행 자료",
      detail:
        buildDeliveryMode === "external_tool"
          ? `${activeExternalBuildTool.label} 기준의 시작 방법, 검증/보고 형식, 읽을 자료 순서를 저장합니다.`
          : "Venture Lab 안에서 이어서 볼 작업 순서, 검증 기준, 최종 실행 기준을 저장합니다.",
    },
  ];
  const developmentAutoTaskDraftLines =
    implementationTaskDrafts.length > 0
      ? implementationTaskDrafts
          .map(
            (task, index) =>
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${task.owner_role}
   - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n     ") || "미정"}`,
          )
          .join("\n")
      : "1. 핵심 제작 범위, 디자인, 데이터/권한, QA, 배포 점검 순서로 작업을 나눕니다.";
  const developmentAutoSummaryLines = developmentAutoSummaryCards.flatMap((card) => [
    `## ${card.label}`,
    card.value,
    card.detail,
    "",
  ]);
  const developmentAutoSummaryDraft = selectedIdea
    ? [
        `# 제작 실행 요약: ${selectedIdea.name}`,
        "",
        ...developmentAutoSummaryLines,
        "## 제작 기준",
        activeProductSurface.promptFocus,
        activeProductSurface.stackHint,
        activeProductSurface.handoffHint,
        "",
        "## 개발 방식",
        `- 개발 방식: ${activeBuildDeliveryLabel}`,
        `- 선택 도구: ${buildDeliveryMode === "external_tool" ? activeExternalBuildTool.label : "Venture Lab 내부 진행"}`,
        `- 반영 기준: ${activeBuildDeliveryDetail}`,
        "",
        buildExternalProductionPackageGuide(activeProductSurface, buildDeliveryMode, activeExternalBuildTool),
        "",
        "## 작업 순서 초안",
        developmentAutoTaskDraftLines,
        "",
        "## 제작 도구 전달 기준",
        buildDeliveryMode === "external_tool"
          ? `저장 후 생성되는 제작 패키지는 ${activeExternalBuildTool.label}에 넘길 자료로 사용합니다.`
          : "저장 후 생성되는 제작 패키지는 Venture Lab 안에서 작업 순서와 최종 실행을 이어가는 기준 자료로 사용합니다.",
        "제품 기획서, 디자인 방향, 기술 스택, 첫 제작 범위, 제외 범위, 검증 기준을 같은 맥락으로 묶어 다음 제작 단계가 흔들리지 않게 합니다.",
        "",
        "## 사용자 보완 메모",
        developmentAutoNote.trim() || "- 추가 메모 없음",
      ].join("\n")
    : "";
  const finalDevelopmentPlanDraft = selectedIdea
    ? [
        developmentAutoSummaryDraft,
        "",
        "---",
        "",
        "## 상세 실행 계획",
        developmentPlanDraft,
      ].join("\n")
    : "";
  const finalAgentRunPackageDraft = selectedIdea
    ? [
        `# 제작 패키지: ${selectedIdea.name}`,
        "",
        "이 문서는 검증된 아이디어를 실제 제작 도구나 외부 제작 환경에 넘기기 위한 최종 자료입니다.",
        "사용자는 별도 문서를 조합하지 않고, 아래 내용을 그대로 다음 제작 환경의 기준 자료로 사용할 수 있습니다.",
        "",
        buildExternalProductionPackageGuide(activeProductSurface, buildDeliveryMode, activeExternalBuildTool),
        "",
        "## 실행 요약",
        developmentAutoSummaryDraft,
        "",
        "## 작업 순서 초안",
        developmentAutoTaskDraftLines,
        "",
        "---",
        "",
        "## 제작 도구 전달 자료",
        agentRunPackageDraft,
      ].join("\n")
    : "";
  const externalToolRunPackageDraft =
    selectedIdea && buildDeliveryMode === "external_tool"
      ? [
          `# ${activeExternalBuildTool.label} 시작 패키지: ${selectedIdea.name}`,
          "",
          `${activeExternalBuildTool.label}에서 바로 첫 작업을 시작할 수 있도록 시작 순서, 전달 파일, 완료 보고 형식을 앞에 붙인 패키지입니다.`,
          activeExternalBuildTool.key === "cursor"
            ? "Cursor는 연결 파일을 받아 프로젝트 루트에서 실행하면 실제 규칙, MCP 설정, 제작 패키지, 작업 목록이 파일로 설치됩니다."
            : activeExternalBuildTool.key === "codex"
              ? "Codex는 연결 파일을 받아 프로젝트 루트에서 실행하면 제작 패키지, 작업 목록, 시작 지시문, 진행 기록 CLI가 파일로 설치됩니다."
              : `${activeExternalBuildTool.label}는 연결 파일을 받아 프로젝트 루트에서 실행하면 도구별 지침, 제작 패키지, 작업 목록, 진행 기록 CLI가 파일로 설치됩니다.`,
          "",
          "## 먼저 할 일",
          "",
          activeExternalBuildTool.handoffSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
          "",
          "## 이 패키지에 맞춘 파일",
          "",
          activeExternalBuildTool.packageFiles.map((file) => `- ${file}`).join("\n"),
          "",
          "## 완료 보고 형식",
          "",
          "- 완료한 작업 코드와 제목",
          "- 변경 파일",
          "- 실행한 검증 명령과 결과",
          "- 배포 또는 미리보기 URL",
          "- 남은 리스크와 다음 작업",
          "",
          "## 도구별 주의",
          "",
          activeExternalBuildTool.handoffNote,
          "",
          "---",
          "",
          finalAgentRunPackageDraft,
        ].join("\n")
      : finalAgentRunPackageDraft;
  const hasFinalExecutionPackage =
    canEnterOrchestrationFromDevelopmentDocs ||
    hasAgentRunPackageArtifact ||
    hasDevelopmentHandoffPackageArtifact ||
    hasManualDevelopmentPackageFallback;
  const hasFinalExecutionWorkOrder =
    selectedRuns.length > 0 || selectedImplementationTasks.length > 0 || hasDevelopmentPlanArtifact;
  const launchReadiness = selectedIdea && editState
    ? [
        {
          label: "제작 패키지 저장",
          passed: hasFinalExecutionPackage,
          detail: hasFinalExecutionPackage
            ? "최종 실행에서 쓸 제작 패키지가 저장되어 있습니다."
            : "STEP 5에서 제작 패키지를 저장하세요.",
        },
        {
          label: "작업 순서 준비",
          passed: hasFinalExecutionWorkOrder,
          detail: hasFinalExecutionWorkOrder
            ? `작업 순서 ${selectedRuns.length}개, 제작 할 일 ${selectedImplementationTasks.length}개가 준비되어 있습니다.`
            : "작업 순서 자동 만들기를 눌러 제작자가 볼 순서를 준비하세요.",
        },
        {
          label: "개발 방식 확정",
          passed: Boolean(buildDeliveryMode && activeBuildDeliveryLabel),
          detail:
            buildDeliveryMode === "external_tool"
              ? `${activeExternalBuildTool.label}로 넘길 준비 자료를 보여줍니다.`
              : "Venture Lab 내부 개발로 이어질 준비 자료를 보여줍니다.",
        },
      ]
    : [];
  const passedLaunchReadinessCount = launchReadiness.filter((check) => check.passed).length;
  const launchReadinessScore =
    launchReadiness.length === 0
      ? 0
      : Math.round((passedLaunchReadinessCount / launchReadiness.length) * 100);
  const nextLaunchBlocker = launchReadiness.find((check) => !check.passed) ?? null;
  const canEnterLaunch = launchReadiness.length > 0 && !nextLaunchBlocker;

  useEffect(() => {
    onStepReadinessChange?.({
      selectedIdeaId: selectedIdea?.id ?? null,
      canEnterExperiment: isScoreEvaluationSaved,
      canEnterArtifacts: selectedExperiments.length > 0 && hasMarketScanArtifact,
      canEnterDevelopment: canEnterDevelopmentFromValidationDocs,
      canEnterOrchestration: canEnterOrchestrationFromDevelopmentDocs,
      canEnterLaunch,
      launchReadinessScore,
      nextLaunchBlockerLabel: nextLaunchBlocker?.label ?? null,
      nextLaunchBlockerDetail: nextLaunchBlocker?.detail ?? null,
      hasIdeaBriefArtifact,
      hasResearchBriefArtifact,
      hasValidationSprintArtifact,
      hasValidationSummaryArtifact,
      hasDesignGenerationPromptArtifact,
      hasDevelopmentPlanArtifact,
      hasAgentRunPackageArtifact,
    });
  }, [
    canEnterDevelopmentFromValidationDocs,
    canEnterLaunch,
    canEnterOrchestrationFromDevelopmentDocs,
    hasAgentRunPackageArtifact,
    hasDesignGenerationPromptArtifact,
    hasDevelopmentPlanArtifact,
    hasIdeaBriefArtifact,
    hasMarketScanArtifact,
    hasResearchBriefArtifact,
    hasValidationSprintArtifact,
    hasValidationSummaryArtifact,
    isScoreEvaluationSaved,
    launchReadinessScore,
    nextLaunchBlocker?.detail,
    nextLaunchBlocker?.label,
    onStepReadinessChange,
    selectedExperiments.length,
    selectedIdea?.id,
  ]);
  const releaseDecisionPacket = selectedIdea && editState
    ? buildReleaseDecisionPacket({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        scoreRecommendation,
        launchReadinessScore,
        launchReadiness,
        implementationGateScore,
        implementationGateChecks,
        artifactReviewProgress,
        artifactReviewQueue,
        nextLaunchBlocker,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
        decisions: selectedDecisions,
      })
    : null;
  const mvpBuildCommandPacketDraft = selectedIdea && editState
    ? buildMvpBuildCommandPacketMarkdown({
        idea: selectedIdea,
        state: editState,
        appBlueprint: appBlueprintDraft,
        scaffoldManifest: scaffoldManifestDraft,
        implementationHandoff: implementationHandoffDraft,
        releaseDecisionPacket,
        implementationTasks: selectedImplementationTasks,
        dependencyStatuses: implementationDependencyStatuses,
        backendCandidateScores,
        artifactReviewQueue,
      })
    : "";
  const qaAcceptanceMatrixDraft = selectedIdea && editState
    ? buildQaAcceptanceMatrixMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        implementationTasks: selectedImplementationTasks,
        launchReadiness,
        implementationGateChecks,
        releaseDecisionPacket,
        backendCandidateScores,
      })
    : "";
  const postLaunchLearningLoopDraft = selectedIdea && editState
    ? buildPostLaunchLearningLoopMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
        releaseDecisionPacket,
        launchReadiness,
        implementationTasks: selectedImplementationTasks,
      })
    : "";
  const developmentCompletionReportDraft = selectedIdea && editState
    ? buildDevelopmentCompletionReportMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
        implementationGateChecks,
        launchReadiness,
        nextLaunchBlocker,
      })
    : "";
  const finalExecutionProjectKey = selectedIdea ? selectedIdea.id.slice(0, 8).toUpperCase() : "PROJECT";
  const cursorTaskPackageDraft = selectedIdea
    ? buildCursorTaskMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        tasks: selectedImplementationTasks,
        fallbackTasks: cursorHandoffTaskDrafts,
      })
    : "";
  const cursorStartPromptDraft = selectedIdea
    ? buildCursorStartPromptMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const cursorRuleDraft = selectedIdea
    ? buildCursorRulesMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
      })
    : "";
  const cursorGuideDraft = selectedIdea
    ? buildCursorGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const cursorMcpConfigDraft = buildCursorMcpConfigJson();
  const cursorMcpServerDraft = buildCursorMcpServerScript();
  const codexTaskPackageDraft = selectedIdea
    ? buildCodexTaskMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        tasks: selectedImplementationTasks,
        fallbackTasks: cursorHandoffTaskDrafts,
      })
    : "";
  const codexStartPromptDraft = selectedIdea
    ? buildCodexStartPromptMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const codexAgentInstructionsDraft = selectedIdea
    ? buildCodexAgentInstructionsMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
      })
    : "";
  const codexGuideDraft = selectedIdea
    ? buildCodexGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const codexCliScriptDraft = buildCodexCliScript(cursorMcpServerDraft);
  const claudeTaskPackageDraft = selectedIdea
    ? buildClaudeTaskMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        tasks: selectedImplementationTasks,
        fallbackTasks: cursorHandoffTaskDrafts,
      })
    : "";
  const claudeStartPromptDraft = selectedIdea
    ? buildClaudeStartPromptMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const claudeInstructionsDraft = selectedIdea
    ? buildClaudeInstructionsMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
      })
    : "";
  const claudeGuideDraft = selectedIdea
    ? buildClaudeGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const claudeMcpConfigDraft = buildClaudeMcpConfigJson();
  const claudeCliScriptDraft = buildClaudeCliScript(cursorMcpServerDraft);
  const antigravityTaskPackageDraft = selectedIdea
    ? buildAntigravityTaskMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        tasks: selectedImplementationTasks,
        fallbackTasks: cursorHandoffTaskDrafts,
      })
    : "";
  const antigravityStartPromptDraft = selectedIdea
    ? buildAntigravityStartPromptMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const antigravityAgentInstructionsDraft = selectedIdea
    ? buildAntigravityAgentInstructionsMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
      })
    : "";
  const antigravityAcceptanceDraft = selectedIdea
    ? buildAntigravityAcceptanceMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
      })
    : "";
  const antigravityGuideDraft = selectedIdea
    ? buildAntigravityGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
      })
    : "";
  const antigravityMcpConfigDraft = buildAntigravityMcpConfigJson();
  const antigravityCliScriptDraft = buildAntigravityCliScript(cursorMcpServerDraft);
  const isCursorExternalDelivery = buildDeliveryMode === "external_tool" && activeExternalBuildTool.key === "cursor";
  const isCodexExternalDelivery = buildDeliveryMode === "external_tool" && activeExternalBuildTool.key === "codex";
  const isClaudeCodeExternalDelivery = buildDeliveryMode === "external_tool" && activeExternalBuildTool.key === "claude_code";
  const isAntigravityExternalDelivery = buildDeliveryMode === "external_tool" && activeExternalBuildTool.key === "antigravity";
  const isLiveExternalDelivery =
    isCursorExternalDelivery || isCodexExternalDelivery || isClaudeCodeExternalDelivery || isAntigravityExternalDelivery;
  const liveExternalToolFolder = isAntigravityExternalDelivery
    ? ".antigravity"
    : isClaudeCodeExternalDelivery
      ? ".claude"
      : isCodexExternalDelivery
        ? ".codex"
        : ".cursor";
  const liveExternalToolProgressPath = `${liveExternalToolFolder}/venture-lab-progress.json`;
  const liveExternalToolSetupSuffix = activeExternalBuildTool.handoffFileSuffix;
  const liveExternalToolStartPromptDraft = isAntigravityExternalDelivery
    ? antigravityStartPromptDraft
    : isClaudeCodeExternalDelivery
      ? claudeStartPromptDraft
      : isCodexExternalDelivery
        ? codexStartPromptDraft
        : cursorStartPromptDraft;
  const liveExternalToolGuideDraft = isAntigravityExternalDelivery
    ? antigravityGuideDraft
    : isClaudeCodeExternalDelivery
      ? claudeGuideDraft
      : isCodexExternalDelivery
        ? codexGuideDraft
        : cursorGuideDraft;
  const liveExternalToolMcpConfigDraft = isAntigravityExternalDelivery
    ? antigravityMcpConfigDraft
    : isClaudeCodeExternalDelivery
      ? claudeMcpConfigDraft
      : isCursorExternalDelivery
        ? cursorMcpConfigDraft
        : "";
  const liveExternalToolSetupFileName = selectedIdea
    ? toDownloadFileName(selectedIdea.name, liveExternalToolSetupSuffix, "ps1")
    : `${liveExternalToolSetupSuffix}.ps1`;
  const liveExternalToolSetupCommand = `powershell -ExecutionPolicy Bypass -File .\\${liveExternalToolSetupFileName}`;
  const liveExternalToolNextTaskCommand = `node ${liveExternalToolFolder}/venture-lab-cli.mjs next-task`;
  const finalExecutionDecisionSentence = `${withKoreanInstrumental(activeProductSurface.label)} 만들고, ${activeBuildDeliveryPhrase}.`;
  const visibleCursorSyncConnections = cursorSyncConnections.filter((connection) => connection.tool === activeExternalBuildTool.key);
  const activeCursorSyncConnections = visibleCursorSyncConnections.filter((connection) => connection.status === "active");
  const latestCursorSyncUseAt =
    activeCursorSyncConnections
      .map((connection) => connection.lastUsedAt)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const finalExecutionConnectionHealthTitle =
    activeCursorSyncConnections.length === 0
      ? "연결 파일을 받으면 자동 반영이 준비됩니다"
      : latestCursorSyncUseAt
        ? `최근 자동 반영 ${formatTelemetryTime(latestCursorSyncUseAt)}`
        : "연결됨, 아직 자동 반영 전";
  const finalExecutionConnectionHealthDetail =
    activeCursorSyncConnections.length === 0
      ? `${activeExternalBuildTool.label} 연결 파일을 받은 뒤 설치 명령과 확인 명령을 실행하세요.`
      : "외부 도구가 진행 기록 명령을 실행하면 Venture Lab 작업표와 STEP 8에 자동 반영됩니다.";
  const cursorProgressPreviewItems =
    cursorProgressImportText.trim() && cursorHandoffTaskDrafts.length > 0
      ? buildCursorProgressImportDrafts({
          sourceText: cursorProgressImportText,
          fallbackTasks: cursorHandoffTaskDrafts,
        }).drafts
          .filter((draft) => draft.status !== "todo" || draft.evidence.trim())
          .map((draft) => ({
            taskCode: draft.taskCode,
            title: draft.title,
            status: draft.status,
            detail: summarizeCursorProgressEvidence(draft.evidence) || "붙여넣은 진행 결과에서 자동으로 읽은 작업입니다.",
          }))
      : [];
  const visibleCursorProgressImportItems =
    cursorProgressImportItems.length > 0 ? cursorProgressImportItems : cursorProgressPreviewItems;
  const finalExecutionTaskPreview = selectedImplementationTasks.slice(0, 6);
  const finalExecutionFallbackTaskPreview =
    selectedImplementationTasks.length === 0 ? cursorHandoffTaskDrafts.slice(0, 6) : [];
  const finalExecutionVisibleTaskCount =
    selectedImplementationTasks.length > 0 ? finalExecutionTaskPreview.length : finalExecutionFallbackTaskPreview.length;
  const finalExecutionTaskListDescription =
    buildDeliveryMode === "external_tool"
      ? isLiveExternalDelivery
        ? `${activeExternalBuildTool.label} 연결 파일에는 이 작업 목록이 포함됩니다. 진행 결과를 남기면 로컬 기록과 Venture Lab 작업 상태가 함께 업데이트됩니다.`
        : `${activeExternalBuildTool.label} 시작 패키지에 이 작업 목록이 포함됩니다. 작업이 끝나면 완료 보고를 반영해 Venture Lab 작업 상태를 맞춥니다.`
      : "내부 개발 패키지에 이 작업 목록이 포함됩니다. 내부 제작 도구가 연결되면 이 순서를 기준으로 이어집니다.";
  const doneRunCount = selectedRuns.filter((run) => run.status === "done").length;
  const workbenchTasks: Array<{
    id: WorkbenchTask;
    label: string;
    description: string;
    status: string;
  }> = [
    {
      id: "select",
      label: "아이디어 도출",
      description: "후보와 결과물 형태를 고릅니다.",
      status: `${getActiveIdeas(ideas).filter((idea) => getRecordAccessState(idea) !== "hidden").length}개`,
    },
    {
      id: "archive",
      label: "삭제한 아이디어",
      description: "복구하거나 완전히 삭제합니다.",
      status: `${ideas.filter((idea) => isDiscardedIdea(idea) && getRecordAccessState(idea) !== "hidden").length}개`,
    },
    {
      id: "score",
      label: "사업성 평가",
      description: "오늘 진행할지 보완할지 정합니다.",
      status: currentScore > 0 ? `${currentScore}점` : "대기",
    },
    {
      id: "risk",
      label: "위험 확인",
      description: "차단 요인과 완화 상태를 관리합니다.",
      status: selectedIdeaRisks.length > 0 ? `${selectedIdeaRisks.length}개` : "대기",
    },
    {
      id: "decision",
      label: "판단 기록",
      description: "진행, 전환, 중단 근거를 남깁니다.",
      status: selectedDecisions.length > 0 ? `${selectedDecisions.length}개` : "대기",
    },
    {
      id: "experiment",
      label: "검증 계획",
      description: "가장 작은 검증 계획을 정의합니다.",
      status: selectedExperiments.length > 0 ? `${selectedExperiments.length}개` : "대기",
    },
    {
      id: "orchestration",
      label: "작업 순서 확인",
      description: "전략부터 출시까지 처리 순서를 확인합니다.",
      status: selectedRuns.length > 0 ? `${doneRunCount}/${selectedRuns.length}` : "대기",
    },
    {
      id: "artifacts",
      label: "검증 자료 저장",
      description: "검증 자료를 한 번에 저장합니다.",
      status: selectedArtifactRecords.length > 0 ? `${selectedArtifactRecords.length}개` : "대기",
    },
    {
      id: "development",
      label: "제작 패키지",
      description: "제작 자료를 자동 정리합니다.",
      status:
        implementationTaskProgressStats.totalCount > 0
          ? `${implementationTaskProgressStats.completedCount}/${implementationTaskProgressStats.totalCount}`
          : selectedArtifactRecords.some((artifact) => artifact.source === "development_process")
            ? "계획됨"
            : "대기",
    },
    {
      id: "launch",
      label: "최종 실행",
      description: "외부 연동 또는 내부 개발로 넘깁니다.",
      status: canEnterLaunch ? "준비 완료" : `${launchReadinessScore}%`,
    },
    {
      id: "learning",
      label: "성과 확인",
      description: "사용 신호로 다음 결정을 봅니다.",
      status: selectedTelemetryEvents.length > 0 ? `${selectedTelemetryEvents.length}개` : "대기",
    },
  ];
  const guidedWorkbenchTaskIds = new Set<WorkbenchTask>([
    "select",
    "score",
    "experiment",
    "artifacts",
    "development",
    "orchestration",
    "launch",
    "learning",
  ]);
  const visibleWorkbenchTasks =
    experienceMode === "guided" ? workbenchTasks.filter((task) => guidedWorkbenchTaskIds.has(task.id)) : workbenchTasks;
  const visibleIdeas = useMemo(() => {
    const activeRecords = getActiveIdeas(ideas);

    if (filterMode === "mine") {
      return sortWorkbenchIdeas(activeRecords.filter((idea) => getRecordAccessState(idea) === "owned"));
    }

    if (filterMode === "read_only") {
      return sortWorkbenchIdeas(
        activeRecords.filter((idea) => {
          const accessState = getRecordAccessState(idea);
          return accessState === "workspace_admin" || accessState === "workspace_member";
        }),
      );
    }

    return sortWorkbenchIdeas(activeRecords.filter((idea) => getRecordAccessState(idea) !== "hidden"));
  }, [filterMode, getRecordAccessState, ideas]);
  const discardedIdeas = useMemo(
    () => sortWorkbenchIdeas(ideas.filter((idea) => isDiscardedIdea(idea) && getRecordAccessState(idea) !== "hidden")),
    [getRecordAccessState, ideas],
  );
  function getIdeaProgress(idea: Idea) {
    if (isDiscardedIdea(idea)) {
      return { label: "삭제됨", task: "archive" as WorkbenchTask };
    }

    switch (idea.stage) {
      case "prd":
        return { label: "STEP 4 검증 자료 저장", task: "artifacts" as WorkbenchTask };
      case "prototype":
      case "qa":
        return { label: "STEP 5 제작 패키지", task: "development" as WorkbenchTask };
      case "launch":
        return { label: "STEP 7 최종 실행", task: "launch" as WorkbenchTask };
      case "intake":
      case "research":
      case "score":
      case "paused":
      default:
        return { label: "STEP 2 사업성 평가", task: "score" as WorkbenchTask };
    }
  }

  async function refreshSelectedIdeaImplementationTasks(options: { source?: "auto" | "manual" } = {}) {
    const isAutoRefresh = options.source === "auto";

    if (!supabase || !selectedIdea) {
      if (!isAutoRefresh) {
        setMessage("먼저 아이디어를 선택하세요.");
      }
      return;
    }

    if (!user) {
      if (!isAutoRefresh) {
        setMessage("작업 상태를 새로고침하려면 먼저 로그인하세요.");
      }
      return;
    }

    if (isAutoRefresh) {
      setIsTaskSyncRefreshing(true);
      setTaskSyncMessage("Venture Lab에 저장된 작업 상태를 자동 확인 중입니다...");
    } else {
      setIsBusy(true);
      setCursorProgressImportMessage("Venture Lab에 저장된 작업 상태를 불러오는 중입니다...");
    }

    const { data, error } = await supabase
      .from("implementation_tasks")
      .select("*")
      .eq("idea_id", selectedIdea.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (isAutoRefresh) {
      setIsTaskSyncRefreshing(false);
    } else {
      setIsBusy(false);
    }

    if (error) {
      const errorMessage =
        error.code === "42P01"
          ? "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요."
          : error.message;
      if (isAutoRefresh) {
        setTaskSyncMessage(errorMessage);
      } else {
        setCursorProgressImportMessage(errorMessage);
        setMessage(errorMessage);
      }
      return;
    }

    const refreshedTasks = (data ?? []) as ImplementationTask[];
    setImplementationTasks((current) => [
      ...current.filter((task) => task.idea_id !== selectedIdea.id),
      ...refreshedTasks,
    ]);
    setCursorProgressImportItems([]);
    const doneCount = refreshedTasks.filter((task) => task.status === "done").length;
    const nextTask = sortImplementationTasksForAction(refreshedTasks).find((task) => task.status !== "done");
    const nextTaskText = nextTask ? ` 다음 작업은 ${nextTask.title}입니다.` : refreshedTasks.length > 0 ? " 모든 작업이 완료 상태입니다." : "";
    const refreshedAt = new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    const refreshMessage = `작업 상태 ${refreshedTasks.length}개를 확인했습니다. 완료 ${doneCount}/${refreshedTasks.length}.${nextTaskText}`;

    setTaskSyncUpdatedAt(refreshedAt);
    setTaskSyncMessage(refreshMessage);

    if (!isAutoRefresh) {
      setCursorProgressImportMessage(refreshMessage);
      setMessage(refreshMessage);
      router.refresh();
    }
  }

  useEffect(() => {
    if (!selectedIdea || !user || !supabase || (activeTask !== "launch" && activeTask !== "learning")) {
      return;
    }

    const initialRefresh = window.setTimeout(() => {
      void refreshSelectedIdeaImplementationTasks({ source: "auto" });
    }, 0);
    const interval = window.setInterval(() => {
      void refreshSelectedIdeaImplementationTasks({ source: "auto" });
    }, 20000);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
    // Restart polling only when the selected record or viewer changes; object identity churn should not reset the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask, selectedIdea?.id, supabase, user?.id]);

  async function refreshCursorSyncConnections({ quiet = false }: { quiet?: boolean } = {}) {
    if (!selectedIdea || !user || !isLiveExternalDelivery) {
      return;
    }

    setIsCursorSyncConnectionLoading(true);

    if (!quiet) {
      setCursorSyncConnectionMessage(`${activeExternalBuildTool.label} 연결 상태를 확인하는 중입니다...`);
    }

    try {
      const response = await fetch(`/api/build-sync/tokens?ideaId=${encodeURIComponent(selectedIdea.id)}`);
      const payload = (await response.json().catch(() => ({}))) as CursorSyncConnectionsResponse;

      if (!response.ok) {
        throw new Error(payload.error || `${activeExternalBuildTool.label} 연결 상태를 확인하지 못했습니다.`);
      }

      setCursorSyncRegistryStatus(payload.registryStatus ?? null);
      setCursorSyncConnections((payload.tokens ?? []).filter((connection) => connection.tool === activeExternalBuildTool.key));

      if (!quiet || payload.registryStatus !== "ready") {
        setCursorSyncConnectionMessage(
          payload.message ??
            (payload.registryStatus === "ready"
              ? `${activeExternalBuildTool.label} 연결 상태를 확인했습니다.`
              : getExternalToolConnectionStatusFallbackMessage(activeExternalBuildTool.label)),
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${activeExternalBuildTool.label} 연결 상태를 확인하지 못했습니다.`;
      setCursorSyncConnectionMessage(errorMessage);
    } finally {
      setIsCursorSyncConnectionLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedIdea || !user || !isLiveExternalDelivery || activeTask !== "launch") {
      return;
    }

    const refreshTimer = window.setTimeout(() => {
      void refreshCursorSyncConnections();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
    // This mirrors the task polling boundary: reload only when the selected project, viewer, or final tool changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask, isLiveExternalDelivery, selectedIdea?.id, user?.id, activeExternalBuildTool.key]);

  if (!selectedIdea || !editState) {
    const hasSelectableIdeas = visibleIdeas.length > 0;

    return (
      <WorkbenchEmptyState hasSelectableIdeas={hasSelectableIdeas} onSelectIdeas={() => updateActiveTask("select")} />
    );
  }

  const activeTaskMeta = workbenchTasks.find((task) => task.id === activeTask) ?? workbenchTasks[0];
  const selectedIdeaProgress = getIdeaProgress(selectedIdea);
  const operatorFocus = getWorkbenchOperatorFocusCopy({
    activeTask,
    isDiscardedIdea: isDiscardedIdea(selectedIdea),
    isScoreEvaluationSaved,
    hasMarketScanArtifact,
    hasOutdatedMarketScanArtifact,
    isValidationBundleSaved,
    hasSavedDevelopmentAutoPackage,
    canEnterLaunch,
    nextLaunchBlocker,
  });
  const operatorFocusActionItems = getWorkbenchOperatorActionItems(activeTask);
  const operatorFocusGateNote = getWorkbenchOperatorGateNote(activeTask);

  async function saveIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea || !editState) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!canEdit) {
      setMessage("현재 운영자에게는 이 아이디어가 읽기 전용입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const scoringState: EditState = {
      ...editState,
      stage: "score",
      decision: scoreSaveDecision,
      product_surface: inferIdeaProductSurface(selectedIdea, editState).key,
    };
    let updateResult = await supabase
      .from("ideas")
      .update(scoringState)
      .eq("id", selectedIdea.id)
      .select()
      .single();

    const usedProductSurfaceFallback = isMissingProductSurfaceColumnError(updateResult.error);

    if (usedProductSurfaceFallback) {
      updateResult = await supabase
        .from("ideas")
        .update(omitProductSurface(scoringState))
        .eq("id", selectedIdea.id)
        .select()
        .single();
    }

    setIsBusy(false);

    const { data, error } = updateResult;

    if (error) {
      setMessage(error.message);
      return;
    }

    setIdeas((current) => current.map((idea) => (idea.id === data.id ? data : idea)));
    setEditState(toEditState(data));
    emitVentureEvent("venture:idea-updated", data);
    void recordTelemetryEvent({
      eventName: "idea_updated",
      eventCategory: "scoring",
      idea: data,
      properties: {
        stage: data.stage,
        decision: data.decision,
        score: scoreState(toEditState(data)),
        regulatory_risk: data.regulatory_risk,
      },
    });
    setMessage(
      usedProductSurfaceFallback
        ? "사업성 평가는 저장했습니다. 결과물 형태는 DB 마이그레이션 적용 후 저장됩니다."
        : "사업성 평가를 저장했습니다.",
    );
    router.refresh();
  }

  async function addRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("리스크를 추가하려면 먼저 로그인하세요.");
      return;
    }

    if (!riskDraft.title.trim()) {
      setMessage("리스크 제목은 필수입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("risks")
      .insert({
        idea_id: selectedIdea.id,
        title: riskDraft.title.trim(),
        area: riskDraft.area.trim(),
        severity: riskDraft.severity,
        mitigation: riskDraft.mitigation.trim(),
        status: "open",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRisks((current) => [data, ...current]);
    emitVentureEvent("venture:risk-created", data);
    void recordTelemetryEvent({
      eventName: "risk_created",
      eventCategory: "risk",
      properties: {
        severity: data.severity,
        status: data.status,
        area: data.area || "미정",
      },
    });
    setRiskDraft({ title: "", area: "", severity: "medium", mitigation: "" });
    setMessage("리스크를 추가했습니다.");
    router.refresh();
  }

  async function recordDecision() {
    if (!supabase || !selectedIdea || !editState) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!canEdit) {
      setMessage("아이디어 작성자 또는 워크스페이스 관리자만 판단을 기록할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const [ideaResult, decisionResult] = await Promise.all([
      supabase.from("ideas").update({ decision: editState.decision }).eq("id", selectedIdea.id).select().single(),
      supabase
        .from("decisions")
        .insert({
          idea_id: selectedIdea.id,
          decision: editState.decision,
          reason: decisionReason.trim(),
          organization_id: selectedIdea.organization_id,
        })
        .select()
        .single(),
    ]);
    setIsBusy(false);

    if (ideaResult.error || decisionResult.error) {
      setMessage(ideaResult.error?.message ?? decisionResult.error?.message ?? "판단을 기록하지 못했습니다.");
      return;
    }

    setIdeas((current) => current.map((idea) => (idea.id === ideaResult.data.id ? ideaResult.data : idea)));
    setDecisionLog((current) => [decisionResult.data, ...current]);
    emitVentureEvent("venture:idea-updated", ideaResult.data);
    emitVentureEvent("venture:decision-created", decisionResult.data);
    void recordTelemetryEvent({
      eventName: "decision_recorded",
      eventCategory: "decision",
      idea: ideaResult.data,
      properties: {
        decision: decisionResult.data.decision,
        reason_length: decisionResult.data.reason.length,
      },
    });
    setDecisionReason("");
    setMessage("판단을 기록했습니다.");
    router.refresh();
  }

  async function createExperimentFromDraft(
    draft: ExperimentDraft,
    options: { clearDraft?: boolean; source?: string; successMessage?: string } = {},
  ) {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return false;
    }

    if (!user) {
      setMessage("검증 계획을 저장하려면 먼저 로그인하세요.");
      return false;
    }

    if (!draft.name.trim()) {
      setMessage("검증 계획 이름은 필수입니다.");
      return false;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("experiments")
      .insert({
        idea_id: selectedIdea.id,
        name: draft.name.trim(),
        success_metric: draft.success_metric.trim(),
        status: "planned",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return false;
    }

    setExperiments((current) => [data, ...current]);
    emitVentureEvent("venture:experiment-created", data);
    void recordTelemetryEvent({
      eventName: "experiment_created",
      eventCategory: "experiment",
      properties: {
        status: data.status,
        name_length: data.name.length,
        success_metric_length: data.success_metric.length,
        source: options.source || "manual",
      },
    });
    if (options.clearDraft) {
      setExperimentDraft({ name: "", success_metric: "" });
    }
    setMessage(options.successMessage || "검증 계획을 저장했습니다.");
    router.refresh();
    return true;
  }

  async function addExperiment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createExperimentFromDraft(experimentDraft, {
      clearDraft: true,
      source: "manual_or_edited",
      successMessage: "검증 계획을 저장했습니다.",
    });
  }

  async function addOrchestrationRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("실행 단계를 추가하려면 먼저 로그인하세요.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .insert({
        idea_id: selectedIdea.id,
        phase: runDraft.phase,
        owner_role: runDraft.owner_role.trim(),
        objective: runDraft.objective.trim(),
        status: "planned",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => [data, ...current]);
    setRunOutputs((current) => ({ ...current, [data.id]: data.output }));
    emitVentureEvent("venture:run-created", data);
    void recordTelemetryEvent({
      eventName: "run_created",
      eventCategory: "orchestration",
      properties: {
        phase: data.phase,
        status: data.status,
        owner_role: data.owner_role || "미정",
      },
    });
    setMessage("실행 단계를 추가했습니다.");
    router.refresh();
  }

  async function createRunbook() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("실행 순서 묶음을 만들려면 먼저 로그인하세요.");
      return;
    }

    const existingPhases = new Set(selectedRuns.map((run) => run.phase));
    const missingRuns = orchestrationPhaseConfigs
      .filter((config) => !existingPhases.has(config.phase))
      .map((config) => ({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        phase: config.phase,
        owner_role: config.ownerRole,
        objective: config.objective,
        status: "planned" as OrchestrationStatus,
      }));

    if (missingRuns.length === 0) {
      setMessage("이 아이디어에는 이미 전체 실행 순서 묶음이 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase.from("orchestration_runs").insert(missingRuns).select();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => [...(data ?? []), ...current]);
    setRunOutputs((current) => ({
      ...current,
      ...Object.fromEntries((data ?? []).map((run) => [run.id, run.output])),
    }));
    emitVentureEvent("venture:runs-created", data ?? []);
    void recordTelemetryEvent({
      eventName: "runbook_created",
      eventCategory: "orchestration",
      properties: {
        run_count: data?.length ?? 0,
        missing_phase_count: missingRuns.length,
      },
    });
    setMessage("전체 실행 순서 묶음을 만들었습니다.");
    router.refresh();
  }

  async function updateExperimentStatus(experiment: Experiment, status: string) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(experiment)) {
      setMessage("실험 작성자 또는 워크스페이스 관리자만 이 실험을 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("experiments")
      .update({
        status,
        started_at: status === "running" ? now : experiment.started_at,
        ended_at: status === "done" ? now : experiment.ended_at,
      })
      .eq("id", experiment.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setExperiments((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:experiment-updated", data);
    void recordTelemetryEvent({
      eventName: "experiment_status_updated",
      eventCategory: "experiment",
      properties: {
        status: data.status,
        previous_status: experiment.status,
      },
    });
    setMessage(`실험 상태를 ${experimentStatusLabels[status] ?? status}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function deleteExperiment(experiment: Experiment) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(experiment)) {
      setMessage("실험 작성자 또는 워크스페이스 관리자만 이 실험을 삭제할 수 있습니다.");
      return;
    }

    const confirmed = window.confirm(`"${experiment.name}" 검증 계획을 삭제할까요?`);

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { error } = await supabase.from("experiments").delete().eq("id", experiment.id);
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const nextExperimentId = selectedExperiments.find((item) => item.id !== experiment.id)?.id ?? "";
    setExperiments((current) => current.filter((item) => item.id !== experiment.id));
    setExperimentResultDraft((current) =>
      current.experiment_id === experiment.id
        ? { ...current, experiment_id: nextExperimentId }
        : current,
    );
    void recordTelemetryEvent({
      eventName: "experiment_deleted",
      eventCategory: "experiment",
      properties: {
        previous_status: experiment.status,
      },
    });
    setMessage("검증 계획을 삭제했습니다.");
    router.refresh();
  }

  async function updateRunStatus(run: OrchestrationRun, status: OrchestrationStatus) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("단계 작성자 또는 워크스페이스 관리자만 이 실행 단계를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .update({ status })
      .eq("id", run.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:run-updated", data);
    void recordTelemetryEvent({
      eventName: "run_status_updated",
      eventCategory: "orchestration",
      properties: {
        phase: data.phase,
        status: data.status,
        previous_status: run.status,
      },
    });
    setMessage(`${phaseLabels[run.phase]} 상태를 ${runStatusLabels[status]}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function deleteOrchestrationRun(run: OrchestrationRun) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("단계 작성자 또는 워크스페이스 관리자만 이 실행 단계를 삭제할 수 있습니다.");
      return;
    }

    const confirmed = window.confirm(`${phaseLabels[run.phase]} 실행 단계를 삭제할까요? 저장된 단계 결과도 함께 사라집니다.`);

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { error } = await supabase.from("orchestration_runs").delete().eq("id", run.id);
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.filter((item) => item.id !== run.id));
    setRunOutputs((current) => {
      const next = { ...current };
      delete next[run.id];
      return next;
    });
    void recordTelemetryEvent({
      eventName: "run_deleted",
      eventCategory: "orchestration",
      properties: {
        phase: run.phase,
        previous_status: run.status,
      },
    });
    setMessage("실행 단계를 삭제했습니다.");
    router.refresh();
  }

  async function saveRunOutput(run: OrchestrationRun) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("단계 작성자 또는 협업 공간 관리자만 이 결과를 저장할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .update({ output: runOutputs[run.id] ?? "" })
      .eq("id", run.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.map((item) => (item.id === data.id ? data : item)));
    setRunOutputs((current) => ({ ...current, [data.id]: data.output }));
    emitVentureEvent("venture:run-updated", data);
    void recordTelemetryEvent({
      eventName: "run_output_saved",
      eventCategory: "orchestration",
      properties: {
        phase: data.phase,
        output_length: data.output.length,
      },
    });
    setMessage(`${phaseLabels[run.phase]} 결과를 저장했습니다.`);
    router.refresh();
  }

  function getNextArtifactVersion(artifactType: VentureArtifactType) {
    return (
      Math.max(
        0,
        ...selectedArtifactRecords
          .filter((artifact) => artifact.artifact_type === artifactType)
          .map((artifact) => artifact.version ?? 1),
      ) + 1
    );
  }

  async function saveArtifactDraft(
    artifactType: VentureArtifactType,
    title: string,
    body: string,
    source: string,
    options: { version?: number; quiet?: boolean; statusNote?: string } = {},
  ) {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return false;
    }

    if (!user) {
      setMessage("제작 자료를 저장하려면 먼저 로그인하세요.");
      return false;
    }

    if (!body.trim()) {
      setMessage("저장할 제작 자료 본문이 비어 있습니다.");
      return false;
    }

    const nextVersion = options.version ?? getNextArtifactVersion(artifactType);

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("venture_artifacts")
      .insert({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        artifact_type: artifactType,
        status: "draft",
        version: nextVersion,
        title,
        body,
        source,
        status_note: options.statusNote ?? "실행 보드에서 생성한 초기 초안입니다.",
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return false;
    }

    setArtifacts((current) => [data, ...current]);
    emitVentureEvent("venture:artifact-created", data);
    void recordTelemetryEvent({
      eventName: "artifact_saved",
      eventCategory: source === "post_launch_learning" ? "learning" : source.includes("launch") ? "launch" : "artifact",
      properties: {
        artifact_type: data.artifact_type,
        source: data.source || "manual",
        version: data.version ?? 1,
        title_length: data.title.length,
        body_length: data.body.length,
      },
    });
    if (!options.quiet) {
      setMessage(`${artifactLabels[artifactType]} v${nextVersion}을 저장했습니다.`);
    }
    router.refresh();
    return true;
  }

  async function saveValidationPackageDrafts() {
    if (!selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("검증 자료를 저장하려면 먼저 로그인하세요.");
      return;
    }

    setIsSavingValidationBundle(true);
    const jobs = [
      {
        done: hasIdeaBriefArtifact,
        artifactType: "idea_brief" as VentureArtifactType,
        title: `${selectedIdea.name} 아이디어 요약`,
        body: ideaBrief,
        source: "workbench",
      },
      {
        done: hasResearchBriefArtifact,
        artifactType: "research_note" as VentureArtifactType,
        title: `${selectedIdea.name} 조사 요약`,
        body: researchBriefDraft,
        source: "workbench",
      },
      {
        done: hasValidationSprintArtifact,
        artifactType: "research_note" as VentureArtifactType,
        title: `${selectedIdea.name} 7일 검증 계획`,
        body: validationSprintDraft,
        source: "validation_sprint",
      },
      {
        done: hasValidationSummaryArtifact,
        artifactType: "research_note" as VentureArtifactType,
        title: `${selectedIdea.name} 검증 완료 요약`,
        body: validationSummaryDraft,
        source: "validation_summary",
      },
    ];

    let savedCount = 0;
    for (const job of jobs) {
      if (job.done) {
        continue;
      }

      const saved = await saveArtifactDraft(job.artifactType, job.title, job.body, job.source, {
        quiet: true,
        statusNote: "검증 자료 자동 저장에서 생성한 초안입니다.",
      });

      if (!saved) {
        setIsSavingValidationBundle(false);
        return;
      }

      savedCount += 1;
    }

    setIsSavingValidationBundle(false);
    setMessage(
      savedCount > 0
        ? "검증 자료를 한 번에 저장했습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다."
        : "이미 필요한 검증 자료가 모두 저장되어 있습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다.",
    );
  }

  async function startDevelopmentAutoPackage() {
    if (hasSavedDevelopmentAutoPackage) {
      return;
    }

    if (!canUseFullProductionPackage) {
      setMessage(
        isCreditSystemChecking
          ? "크레딧 상태를 확인한 뒤 AI 제작 패키지를 만들 수 있습니다."
          : `${buildPassCost}크레딧 제작 패스를 열면 AI 제작 패키지와 외부 개발 도구 연결을 이어갈 수 있습니다.`,
      );
      return;
    }

    const runId = developmentAutoRunIdRef.current + 1;
    developmentAutoRunIdRef.current = runId;
    setMessage(null);
    setDevelopmentAutoFlowState("running");
    setDevelopmentAutoStepIndex(0);

    for (let index = 0; index < developmentAutoProgressSteps.length; index += 1) {
      if (developmentAutoRunIdRef.current !== runId) {
        return;
      }

      setDevelopmentAutoStepIndex(index);
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 420);
      });
    }

    if (developmentAutoRunIdRef.current !== runId) {
      return;
    }

    setDevelopmentAutoStepIndex(developmentAutoProgressSteps.length);
    setDevelopmentAutoFlowState("review");
  }

  async function unlockSelectedIdeaBuildPass() {
    if (!selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("제작 패스를 열려면 먼저 로그인하세요.");
      return;
    }

    if (!needsSelectedIdeaBuildPass) {
      setCreditMessage("이 아이디어는 이미 전체 제작 패키지가 열려 있습니다.");
      return;
    }

    setIsBuildPassUnlocking(true);
    setCreditMessage(null);

    try {
      const response = await fetch("/api/billing/build-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ideaId: selectedIdea.id }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (isCreditSummary(payload)) {
        setCreditSummary(payload);
      }

      if (!response.ok || !isCreditSummary(payload)) {
        setCreditMessage(getApiMessage(payload, "제작 패스를 열지 못했습니다."));
        return;
      }

      const buildPassPayload = payload as CreditSummary & {
        alreadyUnlocked?: unknown;
        chargedCredits?: unknown;
      };
      const chargedCredits = typeof buildPassPayload.chargedCredits === "number"
        ? buildPassPayload.chargedCredits
        : buildPassCost;
      const alreadyUnlocked = buildPassPayload.alreadyUnlocked === true;

      setCreditMessage(
        alreadyUnlocked
          ? "이 아이디어의 전체 제작 패키지는 이미 열려 있습니다."
          : `${chargedCredits}크레딧을 사용해 전체 제작 패키지를 열었습니다.`,
      );
      setMessage("전체 제작 패키지가 열렸습니다. 이제 AI 제작 패키지를 만들고 저장할 수 있습니다.");
      await recordTelemetryEvent({
        eventName: "production_package_build_pass_unlocked",
        eventCategory: "development",
        properties: {
          idea_id: selectedIdea.id,
          charged_credits: chargedCredits,
        },
      });
    } catch {
      setCreditMessage("제작 패스를 열지 못했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setIsBuildPassUnlocking(false);
    }
  }

  async function saveDevelopmentAutoPackage() {
    if (!selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!canUseFullProductionPackage) {
      setMessage(
        isCreditSystemChecking
          ? "크레딧 상태를 확인한 뒤 제작 패키지를 저장할 수 있습니다."
          : `${buildPassCost}크레딧 제작 패스를 열면 제작 패키지를 저장할 수 있습니다.`,
      );
      return;
    }

    const nextDesignBriefVersion = getNextArtifactVersion("design_brief");
    const nextDevRunbookVersion = getNextArtifactVersion("dev_runbook");
    let plannedDevRunbookVersion = nextDevRunbookVersion;

    if (!hasDesignGenerationPromptArtifact) {
      const savedPrompt = await saveArtifactDraft(
        "design_brief",
        `${selectedIdea.name} 디자인 기준 자료`,
        designGenerationPromptDraft,
        "design_generation_prompt",
        {
          version: nextDesignBriefVersion,
          quiet: true,
          statusNote: "최종 제작 패키지 저장 과정에서 함께 저장한 디자인 기준 자료입니다.",
        },
      );

      if (!savedPrompt) {
        return;
      }
    }

    if (!hasDevelopmentPlanArtifact) {
      const savedPlan = await saveArtifactDraft(
        "dev_runbook",
        `${selectedIdea.name} 제작 실행 계획`,
        finalDevelopmentPlanDraft,
        "development_process",
        {
          version: plannedDevRunbookVersion,
          quiet: true,
          statusNote: "최종 제작 패키지 저장 과정에서 함께 저장한 제작 실행 계획입니다.",
        },
      );

      if (!savedPlan) {
        return;
      }

      plannedDevRunbookVersion += 1;
    }

    if (!hasAgentRunPackageArtifact) {
      const savedRunPackage = await saveArtifactDraft(
        "dev_runbook",
        `${selectedIdea.name} 제작 패키지`,
        finalAgentRunPackageDraft,
        "agent_run_package",
        {
          version: plannedDevRunbookVersion,
          quiet: true,
          statusNote: "최종 제작 패키지 저장 과정에서 함께 저장한 제작 도구 전달 자료입니다.",
        },
      );

      if (!savedRunPackage) {
        return;
      }
    }

    setDevelopmentAutoFlowState("summary");
    setDevelopmentAutoStepIndex(developmentAutoProgressSteps.length);
    setMessage("제작 패키지를 저장했습니다. 실제 파일 받기와 제작 도구 연동은 최종 실행 단계에서 열립니다.");
  }

  async function runAiExecutionAutopilot() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("제작 전달 묶음을 만들려면 먼저 로그인하세요.");
      return;
    }

    if (!canUseFullProductionPackage) {
      setMessage(
        isCreditSystemChecking
          ? "크레딧 상태를 확인한 뒤 제작 전달 묶음을 만들 수 있습니다."
          : `${buildPassCost}크레딧 제작 패스를 열면 제작 전달 묶음을 만들 수 있습니다.`,
      );
      return;
    }

    const existingPhases = new Set(selectedRuns.map((run) => run.phase));
    const missingRuns = orchestrationPhaseConfigs
      .filter((config) => !existingPhases.has(config.phase))
      .map((config) => ({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        phase: config.phase,
        owner_role: config.ownerRole,
        objective: config.objective,
        status: "planned" as OrchestrationStatus,
      }));

    const existingArtifactTitles = new Set(
      selectedArtifactRecords.map((artifact) => artifact.title.trim().toLowerCase()),
    );
    const packageDrafts = developmentPackageDrafts.filter(
      (draft) => draft.body.trim() && !existingArtifactTitles.has(draft.title.trim().toLowerCase()),
    );
    const versionOffsets = new Map<VentureArtifactType, number>();
    const artifactRows = packageDrafts.map((draft) => {
      const previousVersion =
        Math.max(
          0,
          ...selectedArtifactRecords
            .filter((artifact) => artifact.artifact_type === draft.artifactType)
            .map((artifact) => artifact.version ?? 1),
        ) + (versionOffsets.get(draft.artifactType) ?? 0);

      versionOffsets.set(draft.artifactType, (versionOffsets.get(draft.artifactType) ?? 0) + 1);

      return {
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        artifact_type: draft.artifactType,
        status: "draft" as VentureArtifactStatus,
        version: previousVersion + 1,
        title: draft.title,
        body: draft.body,
        source: draft.source,
        status_note: "제작 전달 묶음에서 자동 생성한 초안입니다.",
      };
    });

    const existingTaskTitles = new Set(selectedImplementationTasks.map((task) => task.title.trim().toLowerCase()));
    const taskRows = implementationTaskDrafts
      .filter((task) => !existingTaskTitles.has(task.title.trim().toLowerCase()))
      .map((task, index) => ({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        source_artifact_id: implementationTaskSourceArtifact?.id ?? null,
        title: task.title,
        task_type: task.task_type,
        priority: task.priority,
        status: "todo" as ImplementationTaskStatus,
        owner_role: task.owner_role,
        acceptance_criteria: task.acceptance_criteria,
        evidence: "",
        sort_order: selectedImplementationTasks.length + index,
      }));

    if (missingRuns.length === 0 && artifactRows.length === 0 && taskRows.length === 0) {
      setMessage("이미 제작 전달 묶음에 필요한 문서와 할 일이 준비되어 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);

    try {
      let insertedRuns: OrchestrationRun[] = [];
      let insertedArtifacts: VentureArtifact[] = [];
      let insertedTasks: ImplementationTask[] = [];

      if (missingRuns.length > 0) {
        const { data, error } = await supabase.from("orchestration_runs").insert(missingRuns).select();

        if (error) {
          throw new Error(error.message);
        }

        insertedRuns = data ?? [];
      }

      if (artifactRows.length > 0) {
        const { data, error } = await supabase.from("venture_artifacts").insert(artifactRows).select();

        if (error) {
          throw new Error(error.message);
        }

        insertedArtifacts = (data ?? []) as VentureArtifact[];
      }

      if (taskRows.length > 0) {
        const { data, error } = await supabase.from("implementation_tasks").insert(taskRows).select();

        if (error) {
          throw new Error(
            error.code === "42P01"
              ? "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요."
              : error.message,
          );
        }

        insertedTasks = (data ?? []) as ImplementationTask[];
      }

      if (insertedRuns.length > 0) {
        setOrchestrationRuns((current) => [...insertedRuns, ...current]);
        setRunOutputs((current) => ({
          ...current,
          ...Object.fromEntries(insertedRuns.map((run) => [run.id, run.output])),
        }));
        emitVentureEvent("venture:runs-created", insertedRuns);
        void recordTelemetryEvent({
          eventName: "runbook_created",
          eventCategory: "orchestration",
          properties: {
            run_count: insertedRuns.length,
            missing_phase_count: insertedRuns.length,
          },
        });
      }

      if (insertedArtifacts.length > 0) {
        setArtifacts((current) => [...insertedArtifacts, ...current]);
        insertedArtifacts.forEach((artifact) => emitVentureEvent("venture:artifact-created", artifact));
        void recordTelemetryEvent({
          eventName: "artifact_package_saved",
          eventCategory: "development",
          properties: {
            artifact_count: insertedArtifacts.length,
            source: "ai_execution_package",
          },
        });
      }

      if (insertedTasks.length > 0) {
        setImplementationTasks((current) => [...current, ...insertedTasks]);
        emitVentureEvent("venture:tasks-created", insertedTasks);
        void recordTelemetryEvent({
          eventName: "implementation_tasks_created",
          eventCategory: "development",
          properties: {
            task_count: insertedTasks.length,
            source_artifact: implementationTaskSourceArtifact ? "yes" : "no",
          },
        });
      }

      setDevelopmentPanel(insertedTasks.length > 0 || selectedImplementationTasks.length > 0 ? "tasks" : "setup");
      setMessage(
        `제작 전달 묶음을 준비했습니다. 실행 단계 ${insertedRuns.length}개, 제작 자료 ${insertedArtifacts.length}개, 실행 할 일 ${insertedTasks.length}개를 만들었습니다.`,
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "제작 전달 묶음을 만들지 못했습니다.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveEvidenceNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!evidenceDraft.title.trim()) {
      setMessage("근거 제목은 필수입니다.");
      return;
    }

    if (!evidenceDraft.evidence.trim()) {
      setMessage("관찰한 근거를 입력하세요.");
      return;
    }

    const saved = await saveArtifactDraft(
      "research_note",
      `${selectedIdea.name} 근거 - ${evidenceDraft.title.trim()}`,
      evidenceNoteDraft,
      "evidence_capture",
    );

    if (saved) {
      setEvidenceDraft({
        title: "",
        source: "",
        evidence: "",
        implication: "",
        confidence: "medium",
      });
    }
  }

  async function saveExperimentResultNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedExperimentForResult) {
      setMessage("결과를 기록할 실험을 먼저 추가하세요.");
      return;
    }

    if (!experimentResultDraft.result.trim()) {
      setMessage("실험 결과를 입력하세요.");
      return;
    }

    if (!experimentResultDraft.learning.trim()) {
      setMessage("실험에서 배운 점을 입력하세요.");
      return;
    }

    const saved = await saveArtifactDraft(
      "research_note",
      `${selectedExperimentForResult.name} 실험 결과`,
      experimentResultNoteDraft,
      "experiment_result",
    );

    if (saved) {
      void recordTelemetryEvent({
        eventName: "experiment_result_saved",
        eventCategory: "experiment",
        properties: {
          experiment_id: selectedExperimentForResult.id,
          result_length: experimentResultDraft.result.length,
          learning_length: experimentResultDraft.learning.length,
          next_decision: experimentResultDraft.next_decision,
        },
      });
      setExperimentResultDraft({
        experiment_id: selectedExperimentForResult.id,
        result: "",
        learning: "",
        next_decision: "research_more",
        next_action: "",
      });
      setMessage("검증 결과를 저장했습니다. 다음 단계 이동은 하단 다음 단계 버튼에서 진행하세요.");
    }
  }

  function focusArtifactReviewItem(item: ArtifactReviewItem) {
    if (item.artifact) {
      setArtifactTypeFilter(item.artifactType);
      setArtifactStatusFilter("all");
      setArtifactSourceFilter("all");
      setArtifactPanel("library");
      updateActiveTask("artifacts");
      setMessage(`${item.label} 제작 자료를 보관함에서 확인하세요.`);
      return;
    }

    if (item.task === "development") {
      setDevelopmentPanel(item.developmentPanel ?? "setup");
      updateActiveTask("development");
      setMessage(`${item.label} 생성을 위해 개발 프로세스 화면으로 이동했습니다.`);
      return;
    }

    setArtifactPanel(item.panel ?? "product");
    updateActiveTask("artifacts");
    setMessage(`${item.label} 생성을 위해 ${artifactPanelLabels[item.panel ?? "product"]} 화면으로 이동했습니다.`);
  }

  async function updateArtifactStatus(artifact: VentureArtifact, status: VentureArtifactStatus) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(artifact)) {
      setMessage("문서 작성자 또는 협업 공간 관리자만 이 제작 자료를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const statusNote = artifactStatusNotes[artifact.id] ?? artifact.status_note ?? "";
    const { data, error } = await supabase
      .from("venture_artifacts")
      .update({
        status,
        status_note: statusNote.trim() || artifactStatusDefaultNotes[status],
        approved_by: status === "approved" ? user?.id ?? null : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", artifact.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setArtifacts((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:artifact-updated", data);
    void recordTelemetryEvent({
      eventName: "artifact_status_updated",
      eventCategory: "artifact",
      properties: {
        artifact_type: data.artifact_type,
        status: data.status,
        version: data.version ?? 1,
      },
    });
    setArtifactStatusNotes((current) => {
      const next = { ...current };
      delete next[data.id];
      return next;
    });
    setMessage(`${artifact.title || artifactLabels[artifact.artifact_type]} 상태를 ${artifactStatusLabels[status]}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function createImplementationTasks() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("제작 할 일을 만들려면 먼저 로그인하세요.");
      return;
    }

    const existingTitles = new Set(selectedImplementationTasks.map((task) => task.title.trim().toLowerCase()));
    const missingDrafts = implementationTaskDrafts.filter((task) => !existingTitles.has(task.title.trim().toLowerCase()));

    if (missingDrafts.length === 0) {
      setMessage("이 아이디어에는 이미 기본 제작 할 일이 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .insert(
        missingDrafts.map((task, index) => ({
          idea_id: selectedIdea.id,
          organization_id: selectedIdea.organization_id,
          source_artifact_id: implementationTaskSourceArtifact?.id ?? null,
          title: task.title,
          task_type: task.task_type,
          priority: task.priority,
          status: "todo" as ImplementationTaskStatus,
          owner_role: task.owner_role,
          acceptance_criteria: task.acceptance_criteria,
          evidence: "",
          sort_order: selectedImplementationTasks.length + index,
        })),
      )
      .select();
    setIsBusy(false);

    if (error) {
      setMessage(
        error.code === "42P01"
          ? "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요."
          : error.message,
      );
      return;
    }

    setImplementationTasks((current) => [...current, ...(data ?? [])]);
    emitVentureEvent("venture:tasks-created", data ?? []);
    void recordTelemetryEvent({
      eventName: "implementation_tasks_created",
      eventCategory: "development",
      properties: {
        task_count: data?.length ?? 0,
        source_artifact: implementationTaskSourceArtifact ? "yes" : "no",
      },
    });
    setMessage(`${missingDrafts.length}개의 제작 할 일을 만들었습니다.`);
    router.refresh();
  }

  async function loadCursorProgressImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setCursorProgressImportText(text);
    setCursorProgressImportMessage(`${file.name} 내용을 가져왔습니다. 진행 결과 반영을 눌러 작업 목록에 저장하세요.`);
    setCursorProgressImportItems([]);
    setMessage(`${file.name} 내용을 가져왔습니다. 진행 결과 반영을 눌러 작업 목록에 저장하세요.`);
    event.currentTarget.value = "";
  }

  async function importCursorProgressResult() {
    const toolLabel = isLiveExternalDelivery ? activeExternalBuildTool.label : "외부 개발 도구";
    const toolProgressPath = isLiveExternalDelivery
      ? liveExternalToolProgressPath
      : `${activeExternalBuildTool.label} 완료 보고`;
    setCursorProgressImportMessage(`${toolLabel} 진행 결과를 읽는 중입니다...`);

    if (!supabase || !selectedIdea) {
      setCursorProgressImportMessage("먼저 아이디어를 선택하세요.");
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setCursorProgressImportMessage("로그인 후 다시 시도하세요.");
      setMessage(`${toolLabel} 진행 결과를 반영하려면 먼저 로그인하세요.`);
      return;
    }

    if (!cursorProgressImportText.trim()) {
      setCursorProgressImportMessage("붙여넣은 내용이 없습니다.");
      setMessage(`${toolLabel} 완료 보고나 ${toolProgressPath} 내용을 붙여넣으세요.`);
      return;
    }

    if (cursorHandoffTaskDrafts.length === 0) {
      setCursorProgressImportMessage("제작 패키지와 작업 순서 초안이 먼저 필요합니다.");
      setMessage(`먼저 제작 패키지와 작업 순서 초안을 준비해야 ${toolLabel} 진행 결과를 반영할 수 있습니다.`);
      return;
    }

    const importPlan = buildCursorProgressImportDrafts({
      sourceText: cursorProgressImportText,
      fallbackTasks: cursorHandoffTaskDrafts,
    });
    const displayItems = importPlan.drafts
      .filter((draft) => draft.status !== "todo" || draft.evidence.trim())
      .map((draft) => ({
        taskCode: draft.taskCode,
        title: draft.title,
        status: draft.status,
        detail:
          summarizeCursorProgressEvidence(draft.evidence) ||
          (draft.status === "done"
            ? `${toolLabel} 완료 보고가 반영되었습니다.`
            : draft.status === "doing"
              ? `${toolLabel}에서 진행 중인 작업으로 표시되었습니다.`
              : draft.status === "blocked"
                ? `${toolLabel} 완료 보고에서 차단 상태로 표시되었습니다.`
                : "다음 미완료 작업으로 표시되었습니다."),
      }));

    if (importPlan.parsedCount === 0) {
      setCursorProgressImportMessage("T-001 같은 작업 번호나 progress JSON 기록을 찾지 못했습니다.");
      setCursorProgressImportItems([]);
      setMessage("Cursor 결과에서 T-001 같은 작업 번호나 progress JSON 기록을 찾지 못했습니다.");
      return;
    }

    const existingSortedTasks = sortImplementationTasksForExecution(selectedImplementationTasks);
    const existingByTitle = new Map(
      selectedImplementationTasks.map((task) => [normalizeTaskLookupTitle(task.title), task]),
    );
    const rowsToInsert: Array<{
      idea_id: string;
      organization_id: string | null;
      source_artifact_id: string | null;
      title: string;
      task_type: ImplementationTaskType;
      priority: ImplementationTaskPriority;
      status: ImplementationTaskStatus;
      owner_role: string;
      acceptance_criteria: string;
      evidence: string;
      sort_order: number;
    }> = [];
    const updateRows: Array<{
      task: ImplementationTask;
      status: ImplementationTaskStatus;
      evidence: string;
    }> = [];
    let skippedTaskCount = 0;

    importPlan.drafts.forEach((draft, index) => {
      const normalizedTitle = normalizeTaskLookupTitle(draft.title);
      const indexMatch =
        existingSortedTasks.length === importPlan.drafts.length ? existingSortedTasks[index] ?? null : null;
      const matchedTask = existingByTitle.get(normalizedTitle) ?? indexMatch;
      const nextEvidence = draft.evidence.trim();

      if (matchedTask) {
        if (!canManageRecord(matchedTask)) {
          skippedTaskCount += 1;
          return;
        }

        const nextStatus = matchedTask.status === "done" && draft.status !== "done" ? matchedTask.status : draft.status;
        const mergedEvidence = [matchedTask.evidence?.trim() ?? "", nextEvidence]
          .filter(Boolean)
          .join("\n\n---\n\n")
          .slice(0, 9000);

        if (matchedTask.status !== nextStatus || (nextEvidence && mergedEvidence !== (matchedTask.evidence ?? ""))) {
          updateRows.push({
            task: matchedTask,
            status: nextStatus,
            evidence: mergedEvidence,
          });
        }

        return;
      }

      rowsToInsert.push({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        source_artifact_id: implementationTaskSourceArtifact?.id ?? null,
        title: draft.title,
        task_type: draft.task_type,
        priority: draft.priority,
        status: draft.status,
        owner_role: draft.owner_role,
        acceptance_criteria: draft.acceptance_criteria,
        evidence: nextEvidence,
        sort_order: selectedImplementationTasks.length + rowsToInsert.length,
      });
    });

    if (rowsToInsert.length === 0 && updateRows.length === 0) {
      const noChangeMessage =
        skippedTaskCount > 0
          ? `반영할 수 있는 작업이 없습니다. 권한 때문에 ${skippedTaskCount}개 작업을 건너뛰었습니다.`
          : "반영할 새 작업이나 변경된 상태가 없습니다.";
      setCursorProgressImportMessage(noChangeMessage);
      setCursorProgressImportItems(displayItems);
      setMessage(noChangeMessage);
      return;
    }

    setIsBusy(true);
    setMessage(null);
    setCursorProgressImportMessage(
      `작업을 저장하는 중입니다. 새 작업 ${rowsToInsert.length}개, 상태 업데이트 ${updateRows.length}개를 준비했습니다.`,
    );

    try {
      let insertedTasks: ImplementationTask[] = [];
      const updatedTasks: ImplementationTask[] = [];

      if (rowsToInsert.length > 0) {
        const { data, error } = await supabase.from("implementation_tasks").insert(rowsToInsert).select();

        if (error) {
          throw new Error(
            error.code === "42P01"
              ? "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요."
              : error.message,
          );
        }

        insertedTasks = (data ?? []) as ImplementationTask[];
      }

      for (const update of updateRows) {
        const { data, error } = await supabase
          .from("implementation_tasks")
          .update({
            status: update.status,
            evidence: update.evidence,
          })
          .eq("id", update.task.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        updatedTasks.push(data as ImplementationTask);
      }

      if (insertedTasks.length > 0) {
        setImplementationTasks((current) => [...current, ...insertedTasks]);
        emitVentureEvent("venture:tasks-created", insertedTasks);
      }

      if (updatedTasks.length > 0) {
        const updatedById = new Map(updatedTasks.map((task) => [task.id, task]));
        setImplementationTasks((current) => current.map((task) => updatedById.get(task.id) ?? task));
        updatedTasks.forEach((task) => emitVentureEvent("venture:task-updated", task));
      }

      void recordTelemetryEvent({
        eventName: "cursor_progress_imported",
        eventCategory: "development",
        properties: {
          external_tool: activeExternalBuildTool.key,
          inserted_task_count: insertedTasks.length,
          updated_task_count: updatedTasks.length,
          parsed_task_count: importPlan.parsedCount,
          completed_task_count: importPlan.completedCount,
        },
      });
      setDevelopmentPanel("tasks");
      const successMessage = `${toolLabel} 진행 결과를 반영했습니다. 새 작업 ${insertedTasks.length}개, 상태 업데이트 ${updatedTasks.length}개, 완료 인식 ${importPlan.completedCount}개입니다.`;
      setCursorProgressImportMessage(successMessage);
      setCursorProgressImportItems(displayItems);
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${toolLabel} 진행 결과를 반영하지 못했습니다.`;
      setCursorProgressImportMessage(errorMessage);
      setMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function addImplementationTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("제작 할 일을 추가하려면 먼저 로그인하세요.");
      return;
    }

    if (!implementationTaskDraft.title.trim()) {
      setMessage("태스크 제목은 필수입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .insert({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        source_artifact_id: implementationTaskSourceArtifact?.id ?? null,
        title: implementationTaskDraft.title.trim(),
        task_type: implementationTaskDraft.task_type,
        priority: implementationTaskDraft.priority,
        status: "todo",
        owner_role: implementationTaskDraft.owner_role.trim(),
        acceptance_criteria: implementationTaskDraft.acceptance_criteria.trim(),
        evidence: "",
        sort_order: selectedImplementationTasks.length,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setImplementationTasks((current) => [...current, data]);
    emitVentureEvent("venture:task-created", data);
    void recordTelemetryEvent({
      eventName: "implementation_task_created",
      eventCategory: "development",
      properties: {
        task_type: data.task_type,
        priority: data.priority,
        owner_role: data.owner_role || "미정",
      },
    });
    setImplementationTaskDraft({
      title: "",
      task_type: "frontend",
      priority: "medium",
      owner_role: "prototype-builder",
      acceptance_criteria: "",
    });
    setMessage("제작 할 일을 추가했습니다.");
    router.refresh();
  }

  async function updateImplementationTaskStatus(task: ImplementationTask, status: ImplementationTaskStatus) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(task)) {
      setMessage("태스크 작성자 또는 워크스페이스 관리자만 이 태스크를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .update({ status })
      .eq("id", task.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setImplementationTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:task-updated", data);
    void recordTelemetryEvent({
      eventName: "implementation_task_status_updated",
      eventCategory: "development",
      properties: {
        task_type: data.task_type,
        status: data.status,
        previous_status: task.status,
      },
    });
    setMessage(`${task.title} 상태를 ${implementationTaskStatusLabels[status]}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function saveImplementationTaskEvidence(task: ImplementationTask) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(task)) {
      setMessage("태스크 작성자 또는 워크스페이스 관리자만 이 증거를 저장할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .update({ evidence: implementationTaskEvidence[task.id] ?? task.evidence ?? "" })
      .eq("id", task.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setImplementationTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:task-updated", data);
    void recordTelemetryEvent({
      eventName: "implementation_task_evidence_saved",
      eventCategory: "development",
      properties: {
        task_type: data.task_type,
        evidence_length: data.evidence.length,
        status: data.status,
      },
    });
    setImplementationTaskEvidence((current) => {
      const next = { ...current };
      delete next[data.id];
      return next;
    });
    setMessage("제작 할 일 근거를 저장했습니다.");
    router.refresh();
  }

  async function updateRiskStatus(risk: Risk, status: string) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(risk)) {
      setMessage("리스크 작성자 또는 워크스페이스 관리자만 이 리스크를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("risks")
      .update({ status })
      .eq("id", risk.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRisks((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:risk-updated", data);
    void recordTelemetryEvent({
      eventName: "risk_status_updated",
      eventCategory: "risk",
      properties: {
        severity: data.severity,
        status: data.status,
        previous_status: risk.status,
      },
    });
    setMessage(`리스크 상태를 ${riskStatusLabels[status] ?? status}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function copyIdeaBrief() {
    if (!ideaBrief) {
      return;
    }

    await navigator.clipboard.writeText(ideaBrief);
    setCopyMessage("아이디어 요약을 클립보드에 복사했습니다.");
  }

  async function copyPrdDraft() {
    if (!prdDraft) {
      return;
    }

    await navigator.clipboard.writeText(prdDraft);
    setCopyMessage("제품 기획서 초안을 클립보드에 복사했습니다.");
  }

  async function copyMvpSpecDraft() {
    if (!mvpSpecDraft) {
      return;
    }

    await navigator.clipboard.writeText(mvpSpecDraft);
    setCopyMessage("첫 제작 범위를 클립보드에 복사했습니다.");
  }

  async function copyDraft(body: string, label: string) {
    if (!body) {
      return;
    }

    await navigator.clipboard.writeText(body);
    setCopyMessage(`${label}을 클립보드에 복사했습니다.`);
  }

  function downloadTextFile(body: string, label: string, fileName: string, mimeType: string) {
    if (!body) {
      return;
    }

    const url = window.URL.createObjectURL(new Blob([body], { type: mimeType }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
    setCopyMessage(`${label} 파일을 준비했습니다.`);
  }

  function downloadMarkdownFile(body: string, label: string, fileName: string) {
    downloadTextFile(body, label, fileName, "text/markdown;charset=utf-8");
  }

  function encodeUtf8Base64(body: string) {
    const bytes = new TextEncoder().encode(body);
    let binary = "";

    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }

    return window.btoa(binary);
  }

  async function revokeCursorSyncConnection(connection: CursorSyncConnection) {
    if (!user) {
      setCursorSyncConnectionMessage(`${activeExternalBuildTool.label} 연결을 끊으려면 먼저 로그인하세요.`);
      return;
    }

    setRevokingCursorSyncConnectionId(connection.id);
    setCursorSyncConnectionMessage(`${activeExternalBuildTool.label} 연결을 끊는 중입니다...`);

    try {
      const response = await fetch(`/api/build-sync/tokens/${encodeURIComponent(connection.id)}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => ({}))) as CursorSyncConnectionRevokeResponse;

      if (!response.ok || !payload.connection) {
        throw new Error(payload.error || `${activeExternalBuildTool.label} 연결을 끊지 못했습니다.`);
      }

      setCursorSyncConnections((current) => upsertCursorSyncConnection(current, payload.connection as CursorSyncConnection));
      setCursorSyncConnectionMessage(`${activeExternalBuildTool.label} 연결을 끊었습니다. 해당 연결 파일의 자동 반영은 더 이상 저장되지 않습니다.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${activeExternalBuildTool.label} 연결을 끊지 못했습니다.`;
      setCursorSyncConnectionMessage(errorMessage);
    } finally {
      setRevokingCursorSyncConnectionId(null);
    }
  }

  async function downloadCursorSetupScript() {
    if (!selectedIdea || !finalAgentRunPackageDraft) {
      return;
    }

    if (!user) {
      setMessage("Cursor 자동 연결 파일을 받으려면 먼저 로그인하세요.");
      return;
    }

    setIsBusy(true);
    setMessage(getExternalToolSyncPreparingMessage("Cursor"));

    try {
      const response = await fetch("/api/build-sync/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId: selectedIdea.id, tool: "cursor" }),
      });
      const payload = (await response.json().catch(() => ({}))) as CursorBuildSyncTokenResponse;

      if (!response.ok || !payload.token || !payload.endpoint || !payload.expiresAt) {
        throw new Error(payload.error || getExternalToolSyncSetupErrorMessage("Cursor"));
      }

      setCursorSyncRegistryStatus(payload.registryStatus ?? null);

      if (payload.connection) {
        setCursorSyncConnections((current) => upsertCursorSyncConnection(current, payload.connection as CursorSyncConnection));
      }

      setCursorSyncConnectionMessage(
        payload.message ??
          (payload.registryStatus === "ready"
            ? getExternalToolConnectionCreatedMessage("Cursor")
            : getExternalToolConnectionFallbackMessage("Cursor")),
      );

      const syncConfigDraft = buildCursorSyncConfigJson({
        projectKey: finalExecutionProjectKey,
        ideaId: selectedIdea.id,
        ideaName: selectedIdea.name,
        tool: "cursor",
        endpoint: payload.endpoint,
        token: payload.token,
        expiresAt: payload.expiresAt,
        createdAt: new Date().toISOString(),
      });
      const downloadedCursorGuideDraft = buildCursorGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
        syncExpiresAt: payload.expiresAt,
      });

      const files = [
        { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
        { path: "AI_VENTURE_TASKS.md", body: cursorTaskPackageDraft },
        { path: "AI_VENTURE_CURSOR_START.md", body: cursorStartPromptDraft },
        { path: "README_VENTURE_LAB_CURSOR.md", body: downloadedCursorGuideDraft },
        { path: ".cursor/rules/ai-venture-lab.mdc", body: cursorRuleDraft },
        { path: ".cursor/mcp.json", body: cursorMcpConfigDraft },
        { path: ".cursor/venture-lab-cli.mjs", body: cursorMcpServerDraft },
        { path: ".cursor/venture-lab-mcp-server.mjs", body: cursorMcpServerDraft },
        { path: ".cursor/venture-lab-sync.json", body: syncConfigDraft },
        { path: ".cursor/venture-lab-progress.json", body: "[]\n" },
      ].map((file) => ({ path: file.path, base64: encodeUtf8Base64(file.body) }));

      const script = buildCursorSetupPowerShell({
        idea: selectedIdea,
        projectKey: finalExecutionProjectKey,
        files,
      });

      downloadTextFile(
        script,
        "Cursor 연결 스크립트",
        toDownloadFileName(selectedIdea.name, "cursor-setup", "ps1"),
        "text/plain;charset=utf-8",
      );
      setMessage("Cursor 연결 파일을 준비했습니다. venture_record_progress가 로컬 기록과 서버 반영을 함께 처리합니다.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Cursor 연결 파일을 만들지 못했습니다.";
      setMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function downloadCodexSetupScript() {
    if (!selectedIdea || !finalAgentRunPackageDraft) {
      return;
    }

    if (!user) {
      setMessage("Codex 자동 연결 파일을 받으려면 먼저 로그인하세요.");
      return;
    }

    setIsBusy(true);
    setMessage(getExternalToolSyncPreparingMessage("Codex"));

    try {
      const response = await fetch("/api/build-sync/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId: selectedIdea.id, tool: "codex" }),
      });
      const payload = (await response.json().catch(() => ({}))) as CursorBuildSyncTokenResponse;

      if (!response.ok || !payload.token || !payload.endpoint || !payload.expiresAt) {
        throw new Error(payload.error || getExternalToolSyncSetupErrorMessage("Codex"));
      }

      setCursorSyncRegistryStatus(payload.registryStatus ?? null);

      if (payload.connection) {
        setCursorSyncConnections((current) => upsertCursorSyncConnection(current, payload.connection as CursorSyncConnection));
      }

      setCursorSyncConnectionMessage(
        payload.message ??
          (payload.registryStatus === "ready"
            ? getExternalToolConnectionCreatedMessage("Codex")
            : getExternalToolConnectionFallbackMessage("Codex")),
      );

      const syncConfigDraft = buildCursorSyncConfigJson({
        projectKey: finalExecutionProjectKey,
        ideaId: selectedIdea.id,
        ideaName: selectedIdea.name,
        tool: "codex",
        endpoint: payload.endpoint,
        token: payload.token,
        expiresAt: payload.expiresAt,
        createdAt: new Date().toISOString(),
      });
      const downloadedCodexGuideDraft = buildCodexGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
        syncExpiresAt: payload.expiresAt,
      });

      const files = [
        { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
        { path: "AI_VENTURE_TASKS.md", body: codexTaskPackageDraft },
        { path: "AI_VENTURE_CODEX_START.md", body: codexStartPromptDraft },
        { path: "AGENTS.ai-venture-lab.md", body: codexAgentInstructionsDraft },
        { path: "README_VENTURE_LAB_CODEX.md", body: downloadedCodexGuideDraft },
        { path: ".codex/venture-lab-cli.mjs", body: codexCliScriptDraft },
        { path: ".codex/venture-lab-sync.json", body: syncConfigDraft },
        { path: ".codex/venture-lab-progress.json", body: "[]\n" },
      ].map((file) => ({ path: file.path, base64: encodeUtf8Base64(file.body) }));

      const script = buildCodexSetupPowerShell({
        idea: selectedIdea,
        projectKey: finalExecutionProjectKey,
        files,
      });

      downloadTextFile(
        script,
        "Codex 연결 스크립트",
        toDownloadFileName(selectedIdea.name, "codex-setup", "ps1"),
        "text/plain;charset=utf-8",
      );
      setMessage("Codex 연결 파일을 준비했습니다. record-progress 명령이 로컬 기록과 서버 반영을 함께 처리합니다.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Codex 연결 파일을 만들지 못했습니다.";
      setMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function downloadClaudeSetupScript() {
    if (!selectedIdea || !finalAgentRunPackageDraft) {
      return;
    }

    if (!user) {
      setMessage("Claude Code 자동 연결 파일을 받으려면 먼저 로그인하세요.");
      return;
    }

    setIsBusy(true);
    setMessage(getExternalToolSyncPreparingMessage("Claude Code"));

    try {
      const response = await fetch("/api/build-sync/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId: selectedIdea.id, tool: "claude_code" }),
      });
      const payload = (await response.json().catch(() => ({}))) as CursorBuildSyncTokenResponse;

      if (!response.ok || !payload.token || !payload.endpoint || !payload.expiresAt) {
        throw new Error(payload.error || getExternalToolSyncSetupErrorMessage("Claude Code"));
      }

      setCursorSyncRegistryStatus(payload.registryStatus ?? null);

      if (payload.connection) {
        setCursorSyncConnections((current) => upsertCursorSyncConnection(current, payload.connection as CursorSyncConnection));
      }

      setCursorSyncConnectionMessage(
        payload.message ??
          (payload.registryStatus === "ready"
            ? getExternalToolConnectionCreatedMessage("Claude Code")
            : getExternalToolConnectionFallbackMessage("Claude Code")),
      );

      const syncConfigDraft = buildCursorSyncConfigJson({
        projectKey: finalExecutionProjectKey,
        ideaId: selectedIdea.id,
        ideaName: selectedIdea.name,
        tool: "claude_code",
        endpoint: payload.endpoint,
        token: payload.token,
        expiresAt: payload.expiresAt,
        createdAt: new Date().toISOString(),
      });
      const downloadedClaudeGuideDraft = buildClaudeGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
        syncExpiresAt: payload.expiresAt,
      });

      const files = [
        { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
        { path: "AI_VENTURE_TASKS.md", body: claudeTaskPackageDraft },
        { path: "AI_VENTURE_CLAUDE_START.md", body: claudeStartPromptDraft },
        { path: "CLAUDE.md", body: claudeInstructionsDraft },
        { path: "README_VENTURE_LAB_CLAUDE.md", body: downloadedClaudeGuideDraft },
        { path: ".mcp.json", body: claudeMcpConfigDraft },
        { path: ".claude/venture-lab-cli.mjs", body: claudeCliScriptDraft },
        { path: ".claude/venture-lab-sync.json", body: syncConfigDraft },
        { path: ".claude/venture-lab-progress.json", body: "[]\n" },
      ].map((file) => ({ path: file.path, base64: encodeUtf8Base64(file.body) }));

      const script = buildLiveToolSetupPowerShell({
        idea: selectedIdea,
        projectKey: finalExecutionProjectKey,
        files,
        toolLabel: "Claude Code",
        folder: ".claude",
        startFileName: "AI_VENTURE_CLAUDE_START.md",
      });

      downloadTextFile(
        script,
        "Claude Code 연결 스크립트",
        toDownloadFileName(selectedIdea.name, "claude-code-setup", "ps1"),
        "text/plain;charset=utf-8",
      );
      setMessage("Claude Code 연결 파일을 준비했습니다. MCP 도구 또는 record-progress 명령이 로컬 기록과 서버 반영을 함께 처리합니다.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Claude Code 연결 파일을 만들지 못했습니다.";
      setMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function downloadAntigravitySetupScript() {
    if (!selectedIdea || !finalAgentRunPackageDraft) {
      return;
    }

    if (!user) {
      setMessage("Google Antigravity 자동 연결 파일을 받으려면 먼저 로그인하세요.");
      return;
    }

    setIsBusy(true);
    setMessage(getExternalToolSyncPreparingMessage("Google Antigravity"));

    try {
      const response = await fetch("/api/build-sync/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId: selectedIdea.id, tool: "antigravity" }),
      });
      const payload = (await response.json().catch(() => ({}))) as CursorBuildSyncTokenResponse;

      if (!response.ok || !payload.token || !payload.endpoint || !payload.expiresAt) {
        throw new Error(payload.error || getExternalToolSyncSetupErrorMessage("Google Antigravity"));
      }

      setCursorSyncRegistryStatus(payload.registryStatus ?? null);

      if (payload.connection) {
        setCursorSyncConnections((current) => upsertCursorSyncConnection(current, payload.connection as CursorSyncConnection));
      }

      setCursorSyncConnectionMessage(
        payload.message ??
          (payload.registryStatus === "ready"
            ? getExternalToolConnectionCreatedMessage("Google Antigravity")
            : getExternalToolConnectionFallbackMessage("Google Antigravity")),
      );

      const syncConfigDraft = buildCursorSyncConfigJson({
        projectKey: finalExecutionProjectKey,
        ideaId: selectedIdea.id,
        ideaName: selectedIdea.name,
        tool: "antigravity",
        endpoint: payload.endpoint,
        token: payload.token,
        expiresAt: payload.expiresAt,
        createdAt: new Date().toISOString(),
      });
      const downloadedAntigravityGuideDraft = buildAntigravityGuideMarkdown({
        idea: selectedIdea,
        productSurface: activeProductSurface,
        projectKey: finalExecutionProjectKey,
        syncExpiresAt: payload.expiresAt,
      });

      const files = [
        { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
        { path: "AI_VENTURE_TASKS.md", body: antigravityTaskPackageDraft },
        { path: "AI_VENTURE_ANTIGRAVITY_START.md", body: antigravityStartPromptDraft },
        { path: "AI_VENTURE_ACCEPTANCE.md", body: antigravityAcceptanceDraft },
        { path: "AGENTS.ai-venture-lab.md", body: antigravityAgentInstructionsDraft },
        { path: "README_VENTURE_LAB_ANTIGRAVITY.md", body: downloadedAntigravityGuideDraft },
        { path: ".antigravity/mcp_config.json", body: antigravityMcpConfigDraft },
        { path: ".antigravity/venture-lab-cli.mjs", body: antigravityCliScriptDraft },
        { path: ".antigravity/venture-lab-sync.json", body: syncConfigDraft },
        { path: ".antigravity/venture-lab-progress.json", body: "[]\n" },
      ].map((file) => ({ path: file.path, base64: encodeUtf8Base64(file.body) }));

      const script = buildLiveToolSetupPowerShell({
        idea: selectedIdea,
        projectKey: finalExecutionProjectKey,
        files,
        toolLabel: "Google Antigravity",
        folder: ".antigravity",
        startFileName: "AI_VENTURE_ANTIGRAVITY_START.md",
      });

      downloadTextFile(
        script,
        "Google Antigravity 연결 스크립트",
        toDownloadFileName(selectedIdea.name, "antigravity-setup", "ps1"),
        "text/plain;charset=utf-8",
      );
      setMessage("Google Antigravity 연결 파일을 준비했습니다. record-progress 명령이 로컬 기록과 서버 반영을 함께 처리합니다.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google Antigravity 연결 파일을 만들지 못했습니다.";
      setMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  function downloadFinalExecutionPrimaryPackage() {
    if (isCursorExternalDelivery) {
      void downloadCursorSetupScript();
      return;
    }

    if (isCodexExternalDelivery) {
      void downloadCodexSetupScript();
      return;
    }

    if (isClaudeCodeExternalDelivery) {
      void downloadClaudeSetupScript();
      return;
    }

    if (isAntigravityExternalDelivery) {
      void downloadAntigravitySetupScript();
      return;
    }

    downloadMarkdownFile(
      externalToolRunPackageDraft,
      `${activeExternalBuildTool.label} 시작 패키지`,
      toDownloadFileName(selectedIdea.name, activeExternalBuildTool.handoffFileSuffix),
    );
  }

  async function copyLaunchChecklistDraft() {
    if (!launchChecklistDraft) {
      return;
    }

    await navigator.clipboard.writeText(launchChecklistDraft);
    setCopyMessage("출시 체크리스트를 클립보드에 복사했습니다.");
  }

  async function saveRecommendedExperiment(suggestion: ExperimentDraft) {
    await createExperimentFromDraft(suggestion, {
      source: "ai_recommended",
      successMessage:
        "AI 추천 검증 계획을 저장했습니다. 시장·경쟁 점검은 자동으로 정리되고, 이동은 하단 다음 단계 버튼에서만 진행됩니다.",
    });
  }

  function loadRiskSuggestion(suggestion: RiskDraft) {
    setRiskDraft(suggestion);
    updateActiveTask("risk");
    setMessage("추천 리스크를 리스크 입력란에 채웠습니다. 완화 방안을 검토한 뒤 저장하세요.");
  }

  function loadDecisionTemplate() {
    if (!validationPlan) {
      return;
    }

    setDecisionReason(
      `${validationPlan.status}: ${validationPlan.statusDetail}\n\n다음 행동: ${validationPlan.nextAction}\n\n확인할 핵심 가설\n- ${validationPlan.hypotheses.join(
        "\n- ",
      )}`,
    );
    updateActiveTask("decision");
    setMessage("검증 상태 기반 판단 근거 초안을 채웠습니다. 최종 판단을 확인한 뒤 기록하세요.");
  }

  function loadEvidenceCoachPrompt() {
    if (!validationEvidenceCoach) {
      return;
    }

    setExperimentResultDraft((current) => ({
      ...current,
      experiment_id: current.experiment_id || selectedExperimentForResult?.id || "",
      next_action:
        validationEvidenceCoach.nextFocus?.action ??
        "완료한 검증 결과를 바탕으로 계속 진행, 추가 조사, 전환, 중단 중 다음 행동을 정합니다.",
    }));
    setMessage("보완할 질문을 아래 결과 기록의 다음 행동 입력칸에 넣었습니다. 단계 이동은 하단 다음 단계 버튼에서만 진행됩니다.");
  }

  async function runMarketScan() {
    if (!selectedIdea || !editState) {
      setMarketScanError("먼저 아이디어를 선택하세요.");
      return;
    }

    setIsMarketScanLoading(true);
    setMarketScanError(null);

    try {
      const productSurface = inferIdeaProductSurface(selectedIdea, editState);
      const response = await fetch("/api/ideas/market-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: {
            name: selectedIdea.name,
            one_liner: selectedIdea.one_liner,
            target_user: selectedIdea.target_user,
            buyer: selectedIdea.buyer,
            product_surface: productSurface.label,
          },
          state: {
            signal: editState.signal,
            risk_summary: editState.risk_summary,
            next_evidence: editState.next_evidence,
          },
          score: currentScore,
          risks: selectedIdeaRisks.map((risk) => `${risk.title}: ${risk.mitigation || risk.area || "세부 내용 없음"}`),
          experiments: selectedExperiments.map(
            (experiment) => `${experiment.name}: ${experiment.success_metric || "성공/중단 기준 미정"}`,
          ),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok || !isPlainRecord(payload)) {
        throw new Error("시장성 점검을 불러오지 못했습니다.");
      }

      const scan = normalizeMarketScanDraft(payload.scan);

      if (!scan) {
        throw new Error(cleanInlineText(payload.error, 240) || "시장성 점검 결과를 읽지 못했습니다.");
      }

      const scanMode = cleanInlineText(payload.mode, 80);
      setMarketScanDraftKey(`${selectedIdea.id}:${editState.product_surface ?? selectedIdea.product_surface ?? "undecided"}`);
      setMarketScanDraft(scan);
      setMarketScanMode(scanMode);
      setExperimentResultDraft((current) => ({
        ...current,
        experiment_id: current.experiment_id || selectedExperimentForResult?.id || "",
        result: buildMarketScanResultText(scan),
        learning: buildMarketScanLearningText(scan, decisionLabels),
        next_decision: scan.recommendation,
        next_action: scan.next_action,
      }));
      setEvidenceDraft({
        title: `시장·경쟁 자동 점검 - ${selectedIdea.name}`,
        source:
          scan.sources.length > 0
            ? scan.sources.map((source) => source.url || source.title).filter(Boolean).join(", ")
            : scanMode === "local_estimate"
              ? "AI 추정 초안"
              : "AI 시장·경쟁 자동 점검",
        evidence: buildMarketScanEvidenceText(scan),
        implication: buildMarketScanEvidenceImplication(scan, decisionLabels),
        confidence: scan.confidence,
      });
      const marketScanBody = buildMarketScanArtifactMarkdown({
        idea: selectedIdea,
        scan,
        mode: scanMode,
        productSurfaceLabel: productSurface.label,
        decisionLabels,
      });
      const savedMarketScan = user
        ? await saveArtifactDraft(
            "research_note",
            `${selectedIdea.name} 시장·경쟁 자동 조사`,
            marketScanBody,
            "market_scan",
            {
              quiet: true,
              statusNote:
                scanMode === "openai_web"
                  ? "AI 시장·경쟁 자동 점검에서 저장한 웹 검색 포함 리서치 노트입니다."
                  : "AI 시장·경쟁 자동 점검에서 저장한 추정 초안입니다.",
            },
          )
        : false;

      setMessage(
        savedMarketScan
          ? "시장·경쟁 자동 점검을 리서치 노트로 저장했습니다. 결과물 형태까지 반영했으니 필요한 부분만 보완하고 하단 다음 단계로 넘어가세요."
          : "시장·경쟁 자동 점검 초안을 채웠습니다. 로그인 상태가 아니거나 저장 권한이 없으면 리서치 노트 자동 저장은 건너뜁니다.",
      );
    } catch (error) {
      setMarketScanError(error instanceof Error ? error.message : "시장성 점검을 불러오지 못했습니다.");
    } finally {
      setIsMarketScanLoading(false);
    }
  }

  return (
    <section className={showSidebar ? "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]" : "grid gap-6"}>
      <MarketScanAutoRunner
        active={activeTask === "experiment"}
        autoKey={marketScanContextKey}
        disabled={Boolean(visibleMarketScanDraft) || isMarketScanLoading || hasMarketScanArtifact}
        onRun={runMarketScan}
      />
      {showSidebar ? (
      <aside className="grid gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="border border-slate-200 bg-white p-5 text-slate-900">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="avl-pill avl-pill-neutral mb-3 inline-flex px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">검토 목록</div>
            <h2 className="text-xl font-semibold text-slate-950">아이디어 선택</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">오늘 먼저 볼 아이디어 한 건을 고르고 다음 단계로 넘어갑니다.</p>
          </div>
          <ClipboardList className="text-slate-400" size={24} />
        </div>

        <div className="avl-segmented mb-4 grid grid-cols-3 gap-2 p-1">
          {[
            ["all", filterModeLabels.all],
            ["mine", filterModeLabels.mine],
            ["read_only", filterModeLabels.read_only],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilterMode(value as "all" | "mine" | "read_only")}
                className={`h-9 rounded-[0.125rem] text-sm font-semibold transition ${
                  filterMode === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {visibleIdeas.length > 0 ? (
            visibleIdeas.map((idea) => {
              const accessState = getRecordAccessState(idea);
              const isOwned = accessState === "owned";
              const isOrgAdmin = accessState === "workspace_admin";
              const isManageable = isOwned || isOrgAdmin;
              const productSurface = inferIdeaProductSurface(idea);

              return (
                <div
                  key={idea.id}
                  className={`border p-4 text-left transition ${
                    idea.id === selectedIdea.id
                      ? "border-blue-200 bg-blue-50 text-slate-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdeaId(idea.id);
                      setEditState(toEditState(idea));
                      updateActiveTask("score");
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-slate-950">
                        {idea.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`avl-pill ${
                            idea.id === selectedIdea.id ? "avl-pill-info" : "avl-pill-neutral"
                          }`}
                        >
                          {stageLabels[idea.stage]}
                        </span>
                        <span className="avl-pill avl-pill-info">
                          {productSurface.label}
                        </span>
                        <span
                          className={`avl-pill ${
                            idea.id === selectedIdea.id
                              ? isManageable
                                ? "avl-pill-success"
                                : "avl-pill-neutral"
                              : isManageable
                                ? "avl-pill-success"
                                : "avl-pill-neutral"
                          }`}
                        >
                          {isOwned
                            ? editabilityLabels.editable
                            : isOrgAdmin
                              ? editabilityLabels.orgAdmin
                              : editabilityLabels.readOnly}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {idea.one_liner || idea.signal}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {productSurface.firstBuild}
                    </p>
                  </button>
                  {isManageable ? (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void discardIdeaRecord(idea)}
                        disabled={isBusy}
                        className="avl-btn avl-btn-danger h-9 px-3 text-xs disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              이 필터에 맞는 아이디어가 아직 없습니다.
            </div>
          )}
        </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">작업 순서</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">단계를 고르면 오른쪽 작업 화면만 바뀝니다.</p>
          </div>
          <div className="grid gap-2">
            {visibleWorkbenchTasks.map((task, index) => {
              const isTaskLocked = task.id === "launch" && !canEnterLaunch && activeTask !== "launch";

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => updateActiveTask(task.id)}
                  disabled={isTaskLocked}
                  aria-current={activeTask === task.id ? "step" : undefined}
                  className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                    activeTask === task.id
                      ? "border-blue-200 bg-blue-50 text-slate-950 shadow-sm"
                      : "border-slate-200/80 bg-white/75 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <span
                    className={`avl-step-dot h-8 w-8 text-sm ${
                      activeTask === task.id ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{task.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {isTaskLocked ? "준비 완료 후 열립니다" : task.description}
                    </span>
                  </span>
                  <span
                    className={`avl-pill ${
                      activeTask === task.id ? "avl-pill-info" : isTaskLocked ? "avl-pill-warning" : "avl-pill-neutral"
                    }`}
                  >
                    {isTaskLocked ? "잠김" : task.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
      ) : null}

      <div className="grid min-w-0 gap-6">
        <WorkbenchCurrentAction
          actionItems={operatorFocusActionItems}
          activeTaskLabel={activeTaskMeta.label}
          detail={operatorFocus.detail}
          gateNote={operatorFocusGateNote}
          productSurfaceLabel={activeProductSurface.label}
          progressLabel={selectedIdeaProgress.label}
          title={operatorFocus.title}
        />

        <div
          className={`grid gap-5 ${
            activeTask === "select" ? "" : "hidden"
          }`}
        >
          <div className="grid gap-5 xl:grid-cols-[200px_minmax(0,1fr)]">
            <aside className="border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold text-slate-500">아이디어 목록</div>
              <h3 className="mt-2 text-base font-semibold text-slate-950">검토 아이디어</h3>

              <div className="mt-4 avl-segmented grid grid-cols-3 gap-2 p-1">
                {[
                  ["all", filterModeLabels.all],
                  ["mine", filterModeLabels.mine],
                  ["read_only", filterModeLabels.read_only],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterMode(value as "all" | "mine" | "read_only")}
                    className={`h-10 text-sm font-semibold transition ${
                      filterMode === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 border border-slate-200 bg-white px-3 py-3 text-sm leading-5 text-slate-600">
                진행 중인 아이디어를 고르면 마지막으로 이어갈 단계가 바로 열립니다. 현재 보이는 아이디어는 {visibleIdeas.length}개입니다.
              </div>
            </aside>

            <section className="avl-card p-5 text-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">진행 상태</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">진행 중인 아이디어</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-600">
                    다시 이어갈 아이디어를 고르세요. 각 아이디어의 진행 단계가 함께 표시됩니다.
                  </p>
                </div>
                <div className="avl-pill avl-pill-neutral gap-2 px-3 py-2 text-sm">
                  <ClipboardList size={16} />
                  {visibleIdeas.length}개 아이디어
                </div>
              </div>

              {visibleIdeas.length > 0 && selectedIdea && !isDiscardedIdea(selectedIdea) ? (() => {
                const selectedProgress = getIdeaProgress(selectedIdea);
                const selectedSurface = inferIdeaProductSurface(selectedIdea);
                const isOwned = Boolean(user && selectedIdea.created_by === user.id);
                const isOrgAdmin = Boolean(
                  user &&
                    selectedIdea.organization_id &&
                    memberships.some(
                      (membership) =>
                        membership.user_id === user.id &&
                        membership.organization_id === selectedIdea.organization_id &&
                        adminRoles.has(membership.role),
                    ),
                );
                const isManageable = isOwned || isOrgAdmin;
                const comparisonIdeas = visibleIdeas.filter((idea) => idea.id !== selectedIdea.id).slice(0, 4);

                return (
                  <div className="mt-6 grid gap-4">
                    <div className="grid gap-4">
                      <div className="border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">선택한 아이디어</div>
                          <h3 className="mt-2 text-[20px] font-semibold text-slate-950">{selectedIdea.name}</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-5 text-slate-600">
                              {selectedIdea.one_liner || selectedIdea.signal}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="avl-pill avl-pill-neutral">
                              {selectedProgress.label}
                            </span>
                            <span className="avl-pill avl-pill-info">
                              {selectedSurface.label}
                            </span>
                            <span
                              className={`avl-pill ${
                                isManageable ? "avl-pill-success" : "avl-pill-neutral"
                              }`}
                            >
                              {isOwned
                                ? editabilityLabels.editable
                                : isOrgAdmin
                                  ? editabilityLabels.orgAdmin
                                  : editabilityLabels.readOnly}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">현재 단계</div>
                            <div className="mt-2 text-base font-semibold text-slate-950">{selectedProgress.label}</div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">클릭하면 이 단계에서 이어갑니다.</p>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">추천 동작</div>
                            <div className="mt-2 text-base font-semibold text-slate-950">이어서 보기</div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">저장된 맥락을 유지한 채 다음 화면을 엽니다.</p>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">결과물 형태</div>
                            <div className="mt-2 text-base font-semibold text-slate-950">{selectedSurface.label}</div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{selectedSurface.firstBuild}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateActiveTask(selectedProgress.task)}
                            className="avl-btn avl-btn-primary h-11 px-4"
                          >
                            이어서 보기
                          </button>
                          {isManageable ? (
                            <button
                              type="button"
                              onClick={() => void discardIdeaRecord(selectedIdea)}
                              disabled={isBusy}
                              className="avl-btn avl-btn-danger h-11 px-4 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              삭제
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="border border-slate-200 bg-white p-4 text-sm leading-5 text-slate-600">
                        아이디어를 삭제하면 목록에서 사라지지만, 삭제한 아이디어 화면에서 다시 되살릴 수 있습니다.
                      </div>
                    </div>

                    <div className="border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-slate-500">다른 아이디어</div>
                          <h4 className="mt-1 text-lg font-semibold text-slate-950">다른 진행 중인 아이디어</h4>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {comparisonIdeas.length > 0 ? (
                          comparisonIdeas.map((idea, index) => {
                            const progress = getIdeaProgress(idea);
                            const surface = inferIdeaProductSurface(idea);
                            const isOwnedComparison = Boolean(user && idea.created_by === user.id);
                            const isOrgAdminComparison = Boolean(
                              user &&
                                idea.organization_id &&
                                memberships.some(
                                  (membership) =>
                                    membership.user_id === user.id &&
                                    membership.organization_id === idea.organization_id &&
                                    adminRoles.has(membership.role),
                                ),
                            );

                            return (
                              <div
                                key={idea.id}
                                className="border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedIdeaId(idea.id);
                                    setEditState(toEditState(idea));
                                    updateActiveTask(progress.task);
                                  }}
                                  className="w-full text-left"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="avl-step-dot h-8 w-8 bg-slate-900 text-sm text-white">
                                      {index + 2}
                                    </span>
                                    <div className="flex flex-wrap justify-end gap-2">
                                      <span className="avl-pill avl-pill-neutral">{surface.shortLabel}</span>
                                      <span className="avl-pill avl-pill-info">{progress.label}</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-base font-semibold text-slate-950">{idea.name}</div>
                                  <p className="mt-2 text-sm leading-5 text-slate-600">{idea.one_liner || idea.signal}</p>
                                  <p className="mt-2 text-xs leading-5 text-slate-500">{surface.firstBuild}</p>
                                </button>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                  <span className="avl-pill avl-pill-neutral">
                                    {isOwnedComparison
                                      ? editabilityLabels.editable
                                      : isOrgAdminComparison
                                        ? editabilityLabels.orgAdmin
                                        : editabilityLabels.readOnly}
                                  </span>
                                  {isOwnedComparison || isOrgAdminComparison ? (
                                    <button
                                      type="button"
                                      onClick={() => void discardIdeaRecord(idea)}
                                      disabled={isBusy}
                                      className="avl-btn avl-btn-danger h-8 px-3 text-xs disabled:opacity-50"
                                    >
                                      <Trash2 size={13} />
                                      삭제
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="avl-surface-muted border-dashed p-4 text-sm leading-5 text-slate-600 md:col-span-2">
                            지금은 이 아이디어 한 건만 보면 충분합니다. 새 아이디어를 더 넣거나, 나중에 다른 아이디어를 다시 비교해도 됩니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="mt-6 border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                  진행 중인 아이디어가 없습니다. 새 아이디어를 도출하거나, 삭제한 아이디어에서 되살릴 항목을 확인하세요.
                </div>
              )}
            </section>
          </div>
        </div>

        <div className={`grid gap-5 ${activeTask === "archive" ? "" : "hidden"}`}>
          <section className="avl-card p-5 text-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">삭제 보관함</div>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">삭제한 아이디어</h2>
                <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-600">
                  삭제한 아이디어는 이곳에 남겨둡니다. 다시 이어갈 수 있고, 필요할 때만 완전히 삭제합니다.
                </p>
              </div>
              <div className="avl-pill avl-pill-neutral px-3 py-2 text-sm">{discardedIdeas.length}개</div>
            </div>

            <div className="mt-5 grid gap-3">
              {discardedIdeas.length > 0 ? (
                discardedIdeas.map((idea) => {
                  const accessState = getRecordAccessState(idea);
                  const isManageable = accessState === "owned" || accessState === "workspace_admin";

                  return (
                    <div key={idea.id} className="border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="avl-pill avl-pill-warning mb-2">삭제됨</div>
                          <h3 className="text-base font-semibold text-slate-950">{idea.name}</h3>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{idea.one_liner || idea.signal}</p>
                        </div>
                        {isManageable ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void restoreIdeaRecord(idea)}
                              disabled={isBusy}
                              className="avl-btn avl-btn-secondary h-10 px-3 text-sm disabled:opacity-50"
                            >
                              <RefreshCw size={15} />
                              되살리기
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteIdeaRecord(idea)}
                              disabled={isBusy}
                              className="avl-btn avl-btn-danger h-10 px-3 text-sm disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                              완전 삭제
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  삭제한 아이디어가 없습니다. 진행 중인 아이디어에서 삭제를 누르면 이곳으로 이동합니다.
                </div>
              )}
            </div>
          </section>
        </div>

        <form
          onSubmit={saveIdea}
          className={`grid gap-5 ${activeTask === "score" ? "" : "hidden"}`}
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section className="avl-card p-5 text-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">판단 화면</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedIdea.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-600">
                    {selectedIdea.one_liner || selectedIdea.signal}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {canEdit
                      ? "아래 값은 AI가 원문을 분석해 먼저 채운 추천값입니다. 그대로 저장해도 되고, 다르게 판단되면 직접 수정하세요."
                      : "이 기록은 보기 전용입니다. 본인이 만든 아이디어나 팀 관리자 권한이 있는 기록만 편집할 수 있습니다."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => void discardIdeaRecord(selectedIdea)}
                      disabled={isBusy}
                      className="avl-btn avl-btn-danger h-11 px-4 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      삭제
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isBusy || !canEdit || isScoreEvaluationSaved}
                    className={`avl-btn h-11 px-4 disabled:opacity-60 ${
                      isScoreEvaluationSaved ? "avl-btn-secondary" : "avl-btn-primary"
                    }`}
                  >
                    {isBusy ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : isScoreEvaluationSaved ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {isScoreEvaluationSaved ? "저장 완료" : "사업성 평가 저장"}
                  </button>
                </div>
              </div>

              <Step2ScoreHandoffBridge
                activeProductSurfaceLabel={activeProductSurface.label}
                currentScore={currentScore}
                isScoreEvaluationSaved={isScoreEvaluationSaved}
                scoreDecisionLabel={decisionLabels[scoreSaveDecision]}
              />

              <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="border border-slate-200 bg-slate-50 p-5 text-slate-900">
                  <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">사업성 평가 확인</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    AI가 먼저 채운 값을 확인하세요. 다르게 보이는 항목만 조정하면 되고, 단계와 판단은 저장할 때 자동으로 정리됩니다.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">저장되는 단계</div>
                      <div className="mt-2 text-base font-semibold text-slate-950">STEP 2 사업성 평가</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        지금 화면에서는 사용자가 고르지 않습니다. 저장하면 이 아이디어는 사업성 평가 단계로 기록됩니다.
                      </p>
                    </div>
                    <div className="border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">AI 추천 판단</div>
                      <div className="mt-2 text-base font-semibold text-slate-950">{decisionLabels[scoreSaveDecision]}</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        아래 평가값으로 계산한 추천입니다. 평가가 낮아도 자동 삭제하지 않고, 삭제는 사용자가 직접 선택합니다.
                      </p>
                    </div>
                  </div>

                  <ProductSurfaceSelector
                    activeProductSurface={activeProductSurface}
                    canEdit={canEdit}
                    onProductSurfaceChange={(value) =>
                      setEditState({
                        ...editState,
                        product_surface: value,
                      })
                    }
                  />

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <ScoreInput
                      label="문제 강도"
                      description={scoreFieldDescriptions.problem_intensity}
                      value={editState.problem_intensity}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, problem_intensity: value })}
                    />
                    <ScoreInput
                      label="발생 빈도"
                      description={scoreFieldDescriptions.frequency}
                      value={editState.frequency}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, frequency: value })}
                    />
                    <ScoreInput
                      label="도달 가능성"
                      description={scoreFieldDescriptions.reachability}
                      value={editState.reachability}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, reachability: value })}
                    />
                    <ScoreInput
                      label="지불 의향"
                      description={scoreFieldDescriptions.willingness_to_pay}
                      value={editState.willingness_to_pay}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, willingness_to_pay: value })}
                    />
                    <ScoreInput
                      label="첫 제작 속도"
                      description={scoreFieldDescriptions.mvp_speed}
                      value={editState.mvp_speed}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, mvp_speed: value })}
                    />
                    <ScoreInput
                      label="차별성"
                      description={scoreFieldDescriptions.differentiation}
                      value={editState.differentiation}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, differentiation: value })}
                    />
                    <ScoreInput
                      label="리스크 감점"
                      description={scoreFieldDescriptions.regulatory_risk}
                      value={editState.regulatory_risk}
                      disabled={!canEdit}
                      onChange={(value) => setEditState({ ...editState, regulatory_risk: value })}
                    />
                    <div className="border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold tracking-[0.14em] text-slate-700">현재 평가</div>
                      <div className="mt-2 text-3xl font-semibold text-slate-950">{currentScore}</div>
                      <p className="mt-2 text-sm leading-5 text-slate-600">
                        위 6개 항목에서 리스크를 반영한 참고값입니다. 저장하면 AI가 다음 검증 계획의 기준으로 사용합니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="border border-slate-200 bg-slate-50 p-5 text-slate-900">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">AI 추천 판단</div>
                    <div className="mt-3 text-3xl font-semibold text-slate-950">{decisionLabels[scoreSaveDecision]}</div>
                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      현재 평가값으로 계산한 추천입니다. 저장하면 AI가 이 판단을 기준으로 다음 단계를 준비합니다.
                    </p>
                    {scoreRecommendation === "kill" ? (
                      <p className="mt-3 border-l border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                        현재 평가만 보면 중단에 가깝지만, 아이디어를 바로 삭제하지는 않습니다. 삭제는 상단 삭제 버튼을 눌렀을 때만 진행됩니다.
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {missing.length > 0 ? (
                        missing.map((item) => (
                            <span key={item} className="avl-pill avl-pill-warning">
                              {item}
                            </span>
                        ))
                      ) : (
                          <span className="avl-pill avl-pill-success">
                            기획 전환 준비 완료
                          </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">다음 행동</div>
                    <div className="mt-2 text-sm font-semibold text-slate-950">사업성 평가를 저장하면 됩니다</div>
                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      AI가 채운 값을 그대로 쓰거나 필요한 부분만 수정한 뒤 저장하세요. 다음 단계의 실험과 리스크 초안은 AI가 이어서 준비합니다.
                    </p>
                  </div>
                </div>
              </div>

              <details className="mt-5 border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">추가 메모 열기</summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  AI가 만든 초안을 직접 보완하고 싶을 때만 여기를 수정하세요.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <TextArea
                    label="수요 신호"
                    value={editState.signal}
                    disabled={!canEdit}
                    onChange={(value) => setEditState({ ...editState, signal: value })}
                  />
                  <TextArea
                    label="리스크 요약"
                    value={editState.risk_summary}
                    disabled={!canEdit}
                    onChange={(value) => setEditState({ ...editState, risk_summary: value })}
                  />
                  <TextArea
                    label="추가로 확인할 내용"
                    value={editState.next_evidence}
                    disabled={!canEdit}
                    onChange={(value) => setEditState({ ...editState, next_evidence: value })}
                  />
                </div>
              </details>
            </section>

            <div className="grid gap-4">
              <section className="border border-slate-200 bg-slate-50 p-5 text-slate-900">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">평가값 읽는 법</div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                  <li>- 처음 값은 AI가 원문을 보고 채운 추천값입니다. 그대로 써도 되고 직접 바꿔도 됩니다.</li>
                  <li>- 작게 만들기 쉽지만 차별성이 낮다면 범위를 줄이거나 대상을 좁히는 쪽이 좋습니다.</li>
                  <li>- 리스크 감점이 높다면 검증 계획보다 개인정보, 법무, 운영 리스크를 먼저 확인하세요.</li>
                </ul>
              </section>

              <section className="border border-slate-200 bg-white p-5">
                <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">다음 판단</div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  사업성 평가를 저장하면 AI가 다음 검증 계획에서 첫 확인 방법과 성공 기준을 이어서 준비합니다. 여기서는 현재 평가값만 확인하면 충분합니다.
                </p>
              </section>
            </div>
          </div>
        </form>

        <div
          className={`avl-card p-5 ${
            activeTask === "development" ? "" : "hidden"
          }`}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">제작 패키지 정리</h2>
              <p className="mt-1 text-sm text-slate-500">
                검증된 아이디어를 실제 제작이나 외부 제작 도구가 바로 읽을 실행 기준과 첫 작업으로 정리합니다.
              </p>
            </div>
            <Code2 className="text-blue-600" size={22} />
          </div>

          <Step5PackageCurrentAction
            canUseFullProductionPackage={canUseFullProductionPackage}
            isCreditSystemChecking={isCreditSystemChecking}
          />

          {experienceMode === "full" ? (
            <div className="mb-5 avl-segmented p-1">
              <div className="grid gap-1 sm:grid-cols-3">
                {(Object.keys(developmentPanelLabels) as DevelopmentPanel[]).map((panel) => (
                  <button
                    key={panel}
                    type="button"
                    onClick={() => setDevelopmentPanel(panel)}
                    className={`rounded-[0.125rem] px-3 py-2 text-sm font-semibold transition ${
                      visibleDevelopmentPanel === panel
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`}
                  >
                    {developmentPanelLabels[panel]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="avl-surface-muted mb-5 p-4">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">현재 단계</div>
              <h3 className="mt-2 text-base font-semibold text-slate-950">제작 패키지 자동 정리</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                AI가 제작 방향과 실행 자료를 순서대로 묶습니다. 사용자는 최종 저장 전 한 번만 확인하면 됩니다.
              </p>
            </div>
          )}
          {experienceMode === "full" ? (
            <p className="mb-4 text-sm leading-5 text-slate-600">{developmentPanelDescriptions[visibleDevelopmentPanel]}</p>
          ) : null}

          <ProductionCreditPanel
            buildPassCost={buildPassCost}
            creditBalance={creditBalance}
            creditBalanceLabel={creditBalanceLabel}
            creditMessage={creditMessage}
            creditStatus={creditSummary?.status}
            remainingBuildPassCount={remainingBuildPassCount}
            freeArtifactLimit={freeArtifactLimit}
            fullArtifactCount={fullArtifactCount}
            hasEnoughCreditsForBuildPass={hasEnoughCreditsForBuildPass}
            hasSelectedIdeaBuildPass={hasSelectedIdeaBuildPass}
            isBuildPassUnlocking={isBuildPassUnlocking}
            isCreditSummaryLoading={isCreditSummaryLoading && !creditSummary}
            isCreditSystemMissing={isCreditSystemMissing}
            isCreditSystemReady={isCreditSystemReady}
            monthlyCreditGrant={monthlyCreditGrant}
            needsSelectedIdeaBuildPass={needsSelectedIdeaBuildPass}
            onUnlockBuildPass={unlockSelectedIdeaBuildPass}
          />

          {experienceMode === "guided" ? (
            <div className={visibleDevelopmentPanel === "setup" ? "" : "hidden"}>
              <section className="border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="avl-kicker">자동 제작 패키지</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">AI가 제작 패키지를 한 번에 만듭니다</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      검증 결과와 결과물 형태를 바탕으로 기획서, 디자인 기준, 기술 방향, 첫 제작 범위를 하나로 묶습니다.
                      사용자는 요약을 확인하고 필요한 메모만 더한 뒤 저장하면 됩니다.
                    </p>
                  </div>
                  <div className="min-w-36 border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">저장 상태</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">
                      {hasSavedDevelopmentAutoPackage ? "저장 완료" : "저장 전"}
                    </div>
                  </div>
                </div>

                <Step5BuildDirectionSummary
                  decisionSentence={`${withKoreanInstrumental(activeProductSurface.label)} 만들고, ${activeBuildDeliveryPhrase}.`}
                  deliveryLabel={buildDeliveryMode === "external_tool" ? activeExternalBuildTool.label : "내부 진행"}
                />

                <Step5ExecutionPackageBrief />

                <Step5ExecutionPackageValueGrid />

                <Step5AutoProgressTimeline
                  activeStepIndex={developmentAutoStepIndex}
                  flowState={effectiveDevelopmentAutoFlowState}
                  steps={developmentAutoProgressSteps}
                />

                {effectiveDevelopmentAutoFlowState === "idle" ? (
                  <div
                    className={`mt-5 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between ${
                      canUseFullProductionPackage ? "border-blue-200 bg-blue-50" : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <p className={`text-sm leading-6 ${canUseFullProductionPackage ? "text-blue-950" : "text-amber-950"}`}>
                      {canUseFullProductionPackage
                        ? "시작하면 AI가 필요한 내용을 순서대로 묶고, 저장 전 확인할 최종 제작 요약을 바로 보여줍니다."
                        : isCreditSystemChecking
                          ? "크레딧 상태를 확인한 뒤 AI 제작 패키지를 만들 수 있습니다."
                          : `${buildPassCost}크레딧 제작 패스를 열면 AI가 전체 제작 패키지를 만들고 외부 개발 도구 연결까지 이어갑니다.`}
                    </p>
                    <button
                      type="button"
                      onClick={startDevelopmentAutoPackage}
                      disabled={!canUseFullProductionPackage}
                      className="avl-btn avl-btn-primary h-11 px-4 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Layers3 size={18} />
                      AI 제작 패키지 만들기
                    </button>
                  </div>
                ) : null}

                {effectiveDevelopmentAutoFlowState === "running" ? (
                  <div className="mt-5 border border-blue-200 bg-blue-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-blue-950">
                          {developmentAutoProgressSteps[developmentAutoStepIndex]?.label ?? "제작 패키지를 정리하는 중"}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-blue-950">
                          화면은 자동으로 다음 확인 단계로 넘어갑니다. 사용자는 마지막 요약만 확인하면 됩니다.
                        </p>
                      </div>
                      <span className="avl-pill avl-pill-info">
                        {Math.min(developmentAutoStepIndex + 1, developmentAutoProgressSteps.length)}/
                        {developmentAutoProgressSteps.length}
                      </span>
                    </div>
                  </div>
                ) : null}

                {effectiveDevelopmentAutoFlowState === "review" ? (
                  <Step5PackageReview
                    bridgeCards={developmentAutoBuildBridgeCards}
                    note={developmentAutoNote}
                    onNoteChange={setDevelopmentAutoNote}
                    summaryCards={developmentAutoSummaryCards}
                  />
                ) : null}

                {effectiveDevelopmentAutoFlowState !== "idle" && effectiveDevelopmentAutoFlowState !== "running" ? (
                  <div className="mt-5 border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="avl-kicker">저장할 제작 자료</div>
                        <h4 className="mt-2 text-base font-semibold text-slate-950">이 내용으로 제작 패키지를 저장합니다</h4>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          저장하면 디자인 기준, 제작 실행 계획, 제작 도구 전달 자료가 함께 남고, 하단 다음 단계 버튼이 열립니다.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={saveDevelopmentAutoPackage}
                        disabled={
                          isBusy ||
                          !user ||
                          hasSavedDevelopmentAutoPackage ||
                          !canUseFullProductionPackage ||
                          !designGenerationPromptDraft ||
                          !developmentPlanDraft ||
                          !agentRunPackageDraft
                        }
                        className={`avl-btn h-11 px-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                          hasSavedDevelopmentAutoPackage ? "avl-btn-secondary" : "avl-btn-primary"
                        }`}
                      >
                        {hasSavedDevelopmentAutoPackage ? <CheckCircle2 size={18} /> : <Save size={18} />}
                        {hasSavedDevelopmentAutoPackage ? "제작 패키지 저장 완료" : "제작 패키지 저장"}
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {developmentAutoOutputItems.map((item) => (
                        <div key={item.label} className="border border-slate-200 bg-white p-3">
                          <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                    {hasSavedDevelopmentAutoPackage ? (
                      <p className="mt-3 text-sm font-semibold text-emerald-700">
                        제작 패키지가 저장되었습니다. 실제 파일 받기와 외부 제작 도구 연동은 최종 실행 단계에서 열립니다.
                      </p>
                    ) : !canUseFullProductionPackage ? (
                      <p className="mt-3 text-sm font-semibold text-amber-700">
                        {isCreditSystemChecking
                          ? "크레딧 상태를 확인한 뒤 제작 패키지를 저장할 수 있습니다."
                          : "제작 패스를 열어야 전체 제작 패키지를 저장하고 다음 작업 순서로 넘어갈 수 있습니다."}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}

          {experienceMode === "full" ? (
          <>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <GateChecklistPanel
              eyebrow="디자인 점검"
              title="디자인 준비도"
              description="화면을 그리기 전에 사용자 여정, 첫 제작 범위, 데이터 경계, 상태 설계가 준비됐는지 확인합니다."
              score={designReadinessScore}
              checks={designReadinessChecks}
            />
            <GateChecklistPanel
              eyebrow="제작 점검"
              title="제작 시작 준비도"
              description="제작을 시작하기 전에 승인된 기획/디자인/기술 입력과 리스크 상태를 확인합니다."
              score={buildReadinessScore}
              checks={buildReadinessChecks}
            />
          </div>

          <div className="avl-card mt-5 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="avl-kicker">상세 제작 자료</div>
              <h3 className="mt-2 text-base font-semibold text-slate-950">제작 패키지 자동 정리</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                백엔드 선택, 제작 자료, 실행 순서, 기본 제작 할 일을 한 번에 정리합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={runAiExecutionAutopilot}
              disabled={isBusy || !user || !canUseFullProductionPackage}
              className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-50"
            >
              <Layers3 size={18} />
              제작 패키지 정리
            </button>
          </div>

          <div className="avl-card mt-5 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="avl-kicker">백엔드 선택</div>
                <h3 className="mt-2 text-base font-semibold text-slate-950">백엔드 선택 비교</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  아이디어 문맥, 실험, 리스크를 바탕으로 Supabase, Firebase, SQL Connect, Hybrid 적합도를 비교합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(backendDecisionDraft, "백엔드 결정")}
                  className="avl-btn avl-btn-secondary h-10 rounded-[0.125rem] px-3"
                >
                  <Clipboard size={16} />
                  결정 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft("backend_decision", `${selectedIdea.name} 백엔드 결정`, backendDecisionDraft, "development_process")
                  }
                  disabled={isBusy || !user}
                  className="avl-btn avl-btn-primary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
                >
                  <Save size={16} />
                  결정 저장
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-4">
              {backendCandidateScores.map((candidate, index) => (
                <div key={candidate.key} className="border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{candidate.label}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {index === 0 ? "현재 1순위" : "비교 후보"}
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-slate-950">{candidate.score}</div>
                  </div>
                  <div className="mt-3 h-2 rounded-[2px] bg-slate-100">
                    <div className="h-2 rounded-[2px] bg-slate-950" style={{ width: `${candidate.score}%` }} />
                  </div>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{candidate.summary}</p>
                  <div className="mt-3 grid gap-2 text-xs leading-5">
                    <div className="avl-surface-muted px-2.5 py-2 text-slate-700">{candidate.strengths[0]}</div>
                    <div className="avl-surface-muted px-2.5 py-2 text-slate-700">{candidate.cautions[0]}</div>
                  </div>
                </div>
              ))}
            </div>

            {backendExecutionPlan ? (
              <div className="avl-card mt-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      실행 체크리스트
                    </div>
                    <h4 className="mt-1 text-base font-semibold text-slate-950">백엔드 실행 체크리스트</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      현재 권장안은 {backendExecutionPlan.backend.label}입니다. 개발 착수 전에 환경변수, 권한 규칙,
                      허용/차단 검증, 운영 롤백 기준을 같은 문서로 남깁니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(backendExecutionPlanDraft, "백엔드 실행 체크리스트")}
                      disabled={!backendExecutionPlanDraft}
                      className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
                    >
                      <Clipboard size={16} />
                      체크리스트 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "backend_decision",
                          `${selectedIdea.name} 백엔드 실행 체크리스트`,
                          backendExecutionPlanDraft,
                          "backend_execution_checklist",
                        )
                      }
                      disabled={isBusy || !user || !backendExecutionPlanDraft}
                      className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
                    >
                      <Save size={16} />
                      체크리스트 저장
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                  <div className="avl-surface-muted p-3">
                    <div className="text-sm font-semibold text-slate-950">필수 환경변수</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {backendExecutionPlan.envVars.map((envVar) => (
                        <span
                          key={envVar}
                          className="avl-pill avl-pill-neutral font-mono"
                        >
                          {envVar}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="avl-surface-muted p-3">
                    <div className="text-sm font-semibold text-slate-950">검증 체크</div>
                    <div className="mt-3 grid gap-2">
                      {backendExecutionPlan.checks.map((check) => (
                        <div key={check.label} className="border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                          className={`avl-pill ${
                                check.tone === "required"
                                  ? "avl-pill-danger"
                                  : "avl-pill-info"
                              }`}
                            >
                              {check.tone === "required" ? "필수" : "권장"}
                            </span>
                            <span className="text-sm font-semibold text-slate-950">{check.label}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">증거: {check.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {[
                    ["로컬 검증", backendExecutionPlan.localCommand],
                    ["프로덕션 점검", backendExecutionPlan.productionGate],
                    ["롤백 기준", backendExecutionPlan.rollback],
                  ].map(([label, detail]) => (
                    <div key={label} className="avl-surface-muted p-3">
                      <div className="text-sm font-semibold text-slate-950">{label}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="avl-surface-muted mt-5 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="avl-kicker">앱 구조</div>
                <h3 className="mt-2 text-base font-semibold text-slate-950">앱 구조 청사진</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  기획서, 첫 제작 범위, 디자인, 백엔드 선택을 실제 라우트, 컴포넌트, 데이터 모델, API, 권한, 수용 테스트로
                  번역합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(appBlueprintDraft, "앱 구조 청사진")}
                  disabled={!appBlueprintDraft}
                  className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  청사진 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft("tech_spec", `${selectedIdea.name} 앱 구조 청사진`, appBlueprintDraft, "app_blueprint")
                  }
                  disabled={isBusy || !user || !appBlueprintDraft}
                  className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
                >
                  <Save size={16} />
                  청사진 저장
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {[
                ["라우트/화면", "대시보드, 새 기록, 상세, 문서, 설정 화면을 구현 단위로 나눕니다."],
                ["데이터/API", "작업 공간, 기록, 근거, 리스크, 문서, 이벤트 로그 계약을 정의합니다."],
                ["테스트/배포", "권한, 빈 상태, 저장 실패, 모바일, Production 스모크 기준을 포함합니다."],
              ].map(([label, detail]) => (
                <div key={label} className="border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-semibold text-slate-950">{label}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
            <textarea
              value={appBlueprintDraft}
              readOnly
              rows={9}
              className="avl-textarea mt-4 font-mono leading-6"
            />
          </div>

          <div className="avl-surface-muted mt-5 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="avl-kicker">시작 구조</div>
                <h3 className="mt-2 text-base font-semibold text-slate-950">첫 제작 시작 구조</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  개발자가 바로 저장소를 만들 수 있도록 파일 트리, 라우트 책임, 환경변수, 백엔드 규칙, 검증 명령을
                  한 문서로 정리합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(scaffoldManifestDraft, "첫 제작 시작 구조")}
                  disabled={!scaffoldManifestDraft}
                  className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  구조 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "dev_runbook",
                      `${selectedIdea.name} 첫 제작 시작 구조`,
                      scaffoldManifestDraft,
                      "scaffold_manifest",
                    )
                  }
                  disabled={isBusy || !user || !scaffoldManifestDraft}
                  className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
                >
                  <Save size={16} />
                  구조 저장
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              {[
                ["파일 트리", "app, components, lib, scripts, docs 기준 시작 구조"],
                ["환경변수", "클라이언트 공개 키와 서버 전용 비밀값 경계"],
                ["백엔드 규칙", "Supabase RLS 또는 Firebase Rules 시작점"],
                ["검증 명령", "lint, typecheck, build, Preview/Production smoke"],
              ].map(([label, detail]) => (
                <div key={label} className="border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-semibold text-slate-950">{label}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
            <textarea
              value={scaffoldManifestDraft}
              readOnly
              rows={9}
              className="avl-textarea mt-4 font-mono leading-6"
            />
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {developmentArtifactDrafts.map((draft) => (
              <div key={draft.artifactType} className="avl-surface-muted p-4">
                <div className="text-sm font-semibold text-slate-950">{artifactLabels[draft.artifactType]}</div>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{draft.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyDraft(draft.body, artifactLabels[draft.artifactType])}
                    className="avl-btn avl-btn-secondary h-9 rounded-[0.125rem] px-3 text-xs"
                  >
                    <Clipboard size={15} />
                    복사
                  </button>
                  <button
                    type="button"
                    onClick={() => saveArtifactDraft(draft.artifactType, draft.title, draft.body, "development_process")}
                    disabled={isBusy || !user}
                    className="avl-btn avl-btn-primary h-9 rounded-[0.125rem] px-3 text-xs disabled:opacity-50"
                  >
                    <Save size={15} />
                    저장
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
          ) : null}

          <div
            className={`avl-card mt-5 p-4 ${
              visibleDevelopmentPanel === "tasks" ? "" : "hidden"
            }`}
          >
            <div className="avl-card mb-4 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="avl-kicker">
                    제작 패키지
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-slate-950">제작 시작 요약</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    구현에 필요한 할 일을 만들기 전에 범위, 금지 범위, 막히는 항목, 완료 근거를 한 문서로 정리합니다.
                  </p>
                  <div
                    className={`mt-3 border px-3 py-2 text-sm leading-6 ${
                      nextBuildBlocker
                        ? "border-amber-200 bg-amber-50 text-amber-950"
                        : "border-emerald-200 bg-emerald-50 text-emerald-950"
                    }`}
                  >
                    {nextBuildBlocker ? (
                      <>
                        <span className="font-semibold">다음 확인 항목: {nextBuildBlocker.label}</span>
                        <span className="block">{nextBuildBlocker.detail}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">제작 시작에 필요한 입력이 정리됐습니다.</span>
                        <span className="block">기본 할 일을 만들고 가장 작은 첫 제작 범위부터 진행하세요.</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <div className="avl-surface-muted px-4 py-3 text-right text-slate-950">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      준비 {passedBuildReadinessCount}/{buildReadinessChecks.length}
                    </div>
                    <div className="mt-1 text-3xl font-semibold">{buildReadinessScore}%</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDraft(developmentKickoffDraft, "제작 시작 요약")}
                    disabled={!developmentKickoffDraft}
                    className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
                  >
                    <Clipboard size={16} />
                    요약 복사
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveArtifactDraft(
                        "dev_runbook",
                        `${selectedIdea.name} 제작 시작 요약`,
                        developmentKickoffDraft,
                        "development_kickoff",
                      )
                    }
                    disabled={isBusy || !user || !developmentKickoffDraft}
                    className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
                  >
                    <Save size={16} />
                    요약 저장
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">제작 진행 목록</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  저장된 제품 기획서, 명세, 실행 계획을 바탕으로 제작자가 처리할 일을 나누고 완료 근거를 남깁니다.
                </p>
              </div>
              <button
                type="button"
                onClick={createImplementationTasks}
                disabled={isBusy || !user}
                className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
              >
                <ClipboardList size={16} />
                기본 태스크 생성
              </button>
            </div>

            {experienceMode === "full" ? (
              <form onSubmit={addImplementationTask} className="avl-card mt-4 p-4">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-950">직접 태스크 추가</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    자동 생성 태스크 밖의 버그, 디자인 수정, 배포 작업, 고객 검증 작업을 바로 추가합니다.
                  </p>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_0.8fr_0.7fr_0.9fr]">
                  <InputField
                    label="태스크 제목"
                    value={implementationTaskDraft.title}
                    onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, title: value }))}
                  />
                  <SelectField
                    label="유형"
                    value={implementationTaskDraft.task_type}
                    options={implementationTaskTypes}
                    labels={implementationTaskTypeLabels}
                    onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, task_type: value }))}
                  />
                  <SelectField
                    label="우선순위"
                    value={implementationTaskDraft.priority}
                    options={implementationTaskPriorities}
                    labels={implementationTaskPriorityLabels}
                    onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, priority: value }))}
                  />
                  <InputField
                    label="담당 역할"
                    value={implementationTaskDraft.owner_role}
                    onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, owner_role: value }))}
                  />
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <TextArea
                    label="수용 기준"
                    value={implementationTaskDraft.acceptance_criteria}
                    onChange={(value) =>
                      setImplementationTaskDraft((current) => ({ ...current, acceptance_criteria: value }))
                    }
                  />
                  <button
                    type="submit"
                    disabled={isBusy || !user}
                    className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-50"
                  >
                    <Save size={16} />
                    태스크 추가
                  </button>
                </div>
              </form>
            ) : null}

            {selectedImplementationTasks.length > 0 ? (
              <div className="avl-card mt-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950">다음 제작 액션</h4>
                    {nextImplementationTask ? (
                      <>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-slate-950">{nextImplementationTask.title}</span>
                          <span className={implementationTaskStatusTone[nextImplementationTask.status]}>
                            {implementationTaskStatusLabels[nextImplementationTask.status]}
                          </span>
                          <span className={implementationTaskPriorityTone[nextImplementationTask.priority]}>
                            {implementationTaskPriorityLabels[nextImplementationTask.priority]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {nextImplementationTask.status === "blocked"
                            ? "막힌 상태입니다. 먼저 막힌 이유와 해소 증거를 기록하세요."
                            : nextImplementationTask.status === "doing"
                              ? "이미 진행 중입니다. 완료 증거를 붙이고 완료로 이동하세요."
                              : nextImplementationDependencyStatus && !nextImplementationDependencyStatus.ready
                                ? "선행 조건에 막혀 있습니다. 아래 실행 순서 점검에서 먼저 완료할 태스크를 확인하세요."
                                : "바로 시작하기 좋은 다음 태스크입니다. 진행 시작 후 증거를 남기세요."}
                        </p>
                        {nextImplementationDependencyStatus?.blockers.length ? (
                          <div className="avl-surface-muted mt-2 px-3 py-2 text-xs font-semibold leading-5 text-slate-700">
                            선행 조건: {nextImplementationDependencyStatus.blockers.join(", ")}
                          </div>
                        ) : null}
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {nextImplementationTask.owner_role || "owner 미정"}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        열린 실행 할 일이 없습니다. 개발 완료 점검과 출시 판단을 확인하세요.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nextImplementationTask ? (
                      <>
                        {nextImplementationTask.status === "todo" ? (
                          <button
                            type="button"
                            onClick={() => updateImplementationTaskStatus(nextImplementationTask, "doing")}
                            disabled={isBusy || !canManageRecord(nextImplementationTask)}
                            className="avl-btn avl-btn-primary h-9 px-3 text-xs disabled:opacity-50"
                          >
                            진행 시작
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => copyDraft(implementationTaskTicketDraft, "다음 제작 할 일")}
                          className="avl-btn avl-btn-secondary h-9 px-3 text-xs"
                        >
                          <Clipboard size={15} />
                          할 일 복사
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => copyDraft(implementationBacklogDraft, "남은 제작 할 일")}
                      className="avl-btn avl-btn-secondary h-9 px-3 text-xs"
                    >
                      <ClipboardList size={15} />
                      남은 할 일
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {experienceMode === "guided" && selectedImplementationTasks.length > 0 ? (
              <div className="avl-card mt-4 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950">AI가 정리한 실행 순서</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      아래 열린 할 일만 위에서부터 처리하면 됩니다. 자세한 보드와 수동 태스크 관리는 제작 단계에서 필요한 때만 엽니다.
                    </p>
                  </div>
                  <span className="avl-pill avl-pill-neutral">
                    열린 할 일 {selectedOpenImplementationTasks.length}개
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {selectedOpenImplementationTasks.slice(0, 5).map((task, index) => (
                    <div key={task.id} className="avl-surface-muted p-3">
                      <div className="flex flex-wrap items-center gap-2">
                          <span className="avl-pill avl-pill-neutral inline-flex h-6 w-6 items-center justify-center px-0 text-xs">
                            {index + 1}
                          </span>
                        <span className="text-sm font-semibold text-slate-950">{task.title}</span>
                        <span className={implementationTaskStatusTone[task.status]}>
                          {implementationTaskStatusLabels[task.status]}
                        </span>
                        <span className={implementationTaskPriorityTone[task.priority]}>
                          {implementationTaskPriorityLabels[task.priority]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{task.acceptance_criteria}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && implementationDependencyStatuses.length > 0 ? (
              <div className="avl-surface-muted mt-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="avl-kicker">
                      execution order
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-slate-950">개발 실행 순서 점검</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      태스크를 기획, 디자인, 데이터, 백엔드, 프론트, QA, 보안, 배포 순서로 정렬하고 선행 조건을 통과한
                      작업만 다음 실행 후보로 올립니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="avl-pill avl-pill-neutral">
                      시작 가능 {readyImplementationDependencyStatuses.length}개
                    </span>
                    <span className="avl-pill avl-pill-neutral">
                      대기 {waitingImplementationDependencyStatuses.length}개
                    </span>
                    <button
                      type="button"
                      onClick={() => copyDraft(implementationDependencyPlanDraft, "개발 실행 순서 점검")}
                      disabled={!implementationDependencyPlanDraft}
                      className="avl-btn avl-btn-secondary h-9 px-3 text-xs disabled:opacity-50"
                    >
                      <Clipboard size={15} />
                      순서 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 개발 실행 순서 점검`,
                          implementationDependencyPlanDraft,
                          "implementation_dependency_plan",
                        )
                      }
                      disabled={isBusy || !user || !implementationDependencyPlanDraft}
                      className="avl-btn avl-btn-primary h-9 px-3 text-xs disabled:opacity-50"
                    >
                      <Save size={15} />
                      순서 저장
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-8">
                  {implementationTaskExecutionOrder.map((taskType, index) => {
                    const taskTypeStats = implementationTaskProgressStats.byType[taskType];

                    return (
                      <div key={taskType} className="border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-950">
                          {implementationTaskTypeLabels[taskType]}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-slate-500">
                          {taskTypeStats.done}/{taskTypeStats.total} 완료
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="border border-slate-200 bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-950">바로 시작 가능</div>
                    <div className="mt-3 grid gap-2">
                      {readyImplementationDependencyStatuses.slice(0, 4).map((status) => (
                        <div key={status.task.id} className="avl-surface-muted px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-950">{status.task.title}</span>
                            <span className="avl-pill avl-pill-neutral">
                              {implementationTaskTypeLabels[status.task.task_type]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{status.nextAction}</p>
                        </div>
                      ))}
                      {readyImplementationDependencyStatuses.length === 0 ? (
                          <div className="avl-surface-muted border-dashed px-3 py-2 text-sm leading-6 text-slate-700">
                            먼저 선행 조건을 완료해야 시작 가능한 할 일이 생깁니다.
                          </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="border border-slate-200 bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-950">선행 조건 대기</div>
                    <div className="mt-3 grid gap-2">
                      {waitingImplementationDependencyStatuses.slice(0, 4).map((status) => (
                        <div key={status.task.id} className="avl-surface-muted px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-950">{status.task.title}</span>
                            <span className="avl-pill avl-pill-neutral">
                              {implementationTaskTypeLabels[status.task.task_type]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{status.blockers.join(", ")}</p>
                        </div>
                      ))}
                      {waitingImplementationDependencyStatuses.length === 0 ? (
                          <div className="avl-surface-muted border-dashed px-3 py-2 text-sm leading-6 text-slate-700">
                            선행 조건에 막힌 열린 할 일이 없습니다.
                          </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="avl-card mt-4 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-950">제작 패키지</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    승인된 제작 자료, 제작 할 일, 남은 확인 사항, 검증 명령을 한 번에 묶어 제작 도구나 제작 담당자에게 넘깁니다.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="avl-pill avl-pill-neutral">
                      할 일 {agentRunPackageTasks.length}개
                    </span>
                    <span className="avl-pill avl-pill-neutral">
                      승인 제작 자료 {selectedArtifactRecords.filter((artifact) => artifact.status === "approved").length}개
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyDraft(agentRunPackageDraft, "제작 패키지")}
                    disabled={!agentRunPackageDraft}
                    className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
                  >
                    <Clipboard size={16} />
                    자료 복사
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveArtifactDraft(
                        "dev_runbook",
                        `${selectedIdea.name} 제작 패키지`,
                        agentRunPackageDraft,
                        "agent_run_package",
                      )
                    }
                    disabled={isBusy || !user || !agentRunPackageDraft}
                    className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
                  >
                    <Save size={16} />
                    제작 자료 저장
                  </button>
                </div>
              </div>
            </div>

            {experienceMode === "full" && blockedImplementationSummaries.length > 0 ? (
              <div className="avl-surface-muted mt-4 border-rose-200 bg-rose-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-rose-950">차단 해소 큐</h4>
                    <p className="mt-1 text-sm leading-6 text-rose-900">
                      막힌 태스크는 담당 역할, 다음 액션, 해소 증거를 먼저 정리한 뒤 진행 상태로 되돌립니다.
                    </p>
                  </div>
                  <div className="avl-pill avl-pill-danger px-3 py-2">
                    차단 {blockedImplementationSummaries.length}개
                  </div>
                </div>

                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {blockedImplementationSummaries.slice(0, 4).map((summary) => (
                    <div key={summary.task.id} className="border border-rose-200 bg-rose-50 px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">{summary.task.title}</span>
                        <span className="avl-pill avl-pill-danger">
                          {implementationTaskPriorityLabels[summary.task.priority]}
                        </span>
                        <span className="avl-pill avl-pill-neutral">
                          담당 {summary.hint.ownerRole}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-950">다음 액션:</span> {summary.hint.nextAction}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-950">해소 증거:</span> {summary.hint.unblockEvidence}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-950">에스컬레이션:</span> {summary.hint.escalation}
                        </p>
                      </div>
                      {summary.missing.length > 0 ? (
                          <div className="avl-pill avl-pill-warning mt-2 inline-flex">
                            추가 증거 필요: {summary.missing.join(", ")}
                          </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && implementationEvidenceSummaries.length > 0 ? (
              <div className="avl-surface-muted mt-4 border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-950">근거 보완 우선순위</h4>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      완료 전에 커밋, 검증, 권한, 배포, 롤백 근거가 약한 태스크부터 보완합니다.
                    </p>
                  </div>
                  <div className="avl-pill avl-pill-warning px-3 py-2">
                    보완 필요 {implementationEvidenceIssues.length}/{implementationEvidenceSummaries.length}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {implementationEvidenceIssues.length > 0 ? (
                    implementationEvidenceIssues.slice(0, 4).map((summary) => (
                      <div key={summary.task.id} className="border border-amber-200 bg-amber-50 px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{summary.task.title}</span>
                          <span className="avl-pill avl-pill-warning">
                            {summary.passedCount}/{summary.totalCount}
                          </span>
                          <span className="avl-pill avl-pill-neutral">
                            {implementationTaskTypeLabels[summary.task.task_type]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">보완 필요: {summary.missing.join(", ")}</p>
                      </div>
                    ))
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      현재 모든 태스크의 근거가 채워져 있습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && selectedImplementationTasks.length > 0 ? (
              <div className="avl-card mt-4 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950">태스크 필터</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      상태, 담당 역할, 증거 품질을 좁혀서 현재 처리할 카드만 봅니다.
                    </p>
                  </div>
                  <div className="avl-pill avl-pill-neutral px-3 py-2">
                    표시 {filteredImplementationTasks.length}/{selectedImplementationTasks.length}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto]">
                  <SelectField
                    label="상태"
                    value={implementationStatusFilter}
                    options={implementationStatusFilterOptions}
                    labels={implementationStatusFilterLabels}
                    onChange={setImplementationStatusFilter}
                  />
                  <SelectField
                    label="담당"
                    value={activeImplementationOwnerFilter}
                    options={implementationOwnerOptions}
                    labels={implementationOwnerFilterLabels}
                    onChange={setImplementationOwnerFilter}
                  />
                  <SelectField
                    label="증거"
                    value={implementationEvidenceFilter}
                    options={implementationEvidenceFilterOptions}
                    labels={implementationEvidenceFilterLabels}
                    onChange={setImplementationEvidenceFilter}
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setImplementationStatusFilter("all");
                        setImplementationOwnerFilter("all");
                        setImplementationEvidenceFilter("all");
                      }}
                      className="avl-btn avl-btn-secondary h-11 w-full px-3 lg:w-auto"
                    >
                      초기화
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => copyDraft(filteredImplementationBacklogDraft, "필터된 개발 백로그")}
                      className="avl-btn avl-btn-primary h-11 w-full px-3 lg:w-auto"
                    >
                      <ClipboardList size={15} />
                      필터 복사
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => copyDraft(filteredImplementationRunPromptDraft, "필터된 제작 지시")}
                      className="avl-btn avl-btn-secondary h-11 w-full px-3 lg:w-auto"
                    >
                      <Code2 size={15} />
                      제작 지시
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedIdea) {
                          return;
                        }

                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 필터된 제작 지시`,
                          filteredImplementationRunPromptDraft,
                          "filtered_implementation_run",
                        );
                      }}
                      disabled={isBusy || !user || !selectedIdea}
                      className="avl-btn avl-btn-secondary h-11 w-full px-3 disabled:opacity-50 lg:w-auto"
                    >
                      <Save size={15} />
                      저장
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && selectedImplementationTasks.length > 0 && filteredImplementationTasks.length === 0 ? (
              <div className="avl-surface-muted mt-4 border-dashed p-4 text-sm leading-6 text-slate-600">
                현재 필터 조건에 맞는 태스크가 없습니다. 필터를 초기화하거나 다른 조건으로 좁혀 보세요.
              </div>
            ) : null}

            {experienceMode === "full" && filteredImplementationTasks.length > 0 ? (
              <div className="mt-4 grid gap-3 xl:grid-cols-4">
                {visibleImplementationStatuses.map((status) => {
                  const tasksInStatus = filteredImplementationTasks.filter((task) => task.status === status);

                return (
                  <section key={status} className="border border-slate-200 bg-white min-h-44 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className={implementationTaskStatusTone[status]}>
                        {implementationTaskStatusLabels[status]}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{tasksInStatus.length}개</span>
                    </div>

                    <div className="grid gap-3">
                      {tasksInStatus.length > 0 ? (
                        tasksInStatus.map((task) => {
                          const currentTaskEvidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
                          const evidenceChecklist = getImplementationEvidenceChecklist(task, currentTaskEvidence);
                          const passedEvidenceCount = evidenceChecklist.filter((item) => item.passed).length;
                          const missingEvidenceLabels = evidenceChecklist
                            .filter((item) => !item.passed)
                            .map((item) => item.label);
                          const blockedHint = task.status === "blocked" ? getBlockedImplementationTaskHint(task) : null;

                          return (
                          <div key={task.id} className="avl-surface-muted p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-950">{task.title}</span>
                              <span className="avl-pill avl-pill-neutral">
                                {implementationTaskTypeLabels[task.task_type]}
                              </span>
                              <span className={implementationTaskPriorityTone[task.priority]}>
                                {implementationTaskPriorityLabels[task.priority]}
                              </span>
                            </div>
                            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {task.owner_role || "owner 미정"}
                            </div>
                            {blockedHint ? (
                              <div className="mt-2 border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-900">
                                <div className="font-semibold">차단 해소 다음 액션</div>
                                <div className="mt-1">{blockedHint.nextAction}</div>
                              </div>
                            ) : null}
                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{task.acceptance_criteria}</p>
                            <textarea
                              value={currentTaskEvidence}
                              onChange={(event) =>
                                setImplementationTaskEvidence((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                              disabled={isBusy || !canManageRecord(task)}
                              rows={3}
                              placeholder="완료 증거, PR/커밋, 스모크 결과, 남은 리스크"
                              className="avl-textarea mt-3 w-full resize-y text-sm leading-6 text-slate-800 disabled:text-slate-500"
                            />
                            <div
                              className={`mt-2 border px-3 py-2 text-xs leading-5 ${
                                missingEvidenceLabels.length === 0
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                                  : "border-amber-100 bg-amber-50 text-amber-900"
                              }`}
                            >
                              <div className="font-semibold">
                                증거 품질 {passedEvidenceCount}/{evidenceChecklist.length}
                              </div>
                              <div className="mt-1">
                                {missingEvidenceLabels.length === 0
                                  ? "필수 증거 힌트가 모두 포함되어 있습니다."
                                  : `보완 필요: ${missingEvidenceLabels.join(", ")}`}
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => saveImplementationTaskEvidence(task)}
                                disabled={
                                  isBusy ||
                                  !canManageRecord(task) ||
                                  (implementationTaskEvidence[task.id] ?? task.evidence ?? "") === (task.evidence ?? "")
                                }
                                className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                              >
                                증거 저장
                              </button>
                              {implementationTaskStatuses.map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  onClick={() => updateImplementationTaskStatus(task, nextStatus)}
                                  disabled={isBusy || !canManageRecord(task) || task.status === nextStatus}
                                  className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                                >
                                  {implementationTaskStatusLabels[nextStatus]}
                                </button>
                              ))}
                            </div>
                          </div>
                          );
                        })
                      ) : (
                        <div className="avl-surface-muted border-dashed p-3 text-sm leading-5 text-slate-500">
                          아직 {implementationTaskStatusLabels[status]} 상태의 태스크가 없습니다.
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
              </div>
            ) : null}

            {selectedImplementationTasks.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                먼저 기획서, 첫 제작 범위, 기술 명세, 제작 실행 계획을 저장한 뒤 기본 할 일을 만들면 구현 작업이 자동으로 분해됩니다.
              </p>
            ) : null}
          </div>

          <div className={visibleDevelopmentPanel === "handoff" ? "" : "hidden"}>
          <div className="avl-card mt-5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="avl-kicker">완료 기준</div>
                <h3 className="mt-2 text-base font-semibold text-slate-950">제작 완료 기준</h3>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  구현 할 일, 완료 근거, 품질 점검/보안 단계를 기준으로 제작 완료 보고서를 만듭니다.
                </p>
              </div>
              <div className="border border-slate-200 bg-white px-4 py-3 text-right text-slate-950">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  통과 {passedImplementationGateCount}/{implementationGateChecks.length}
                </div>
                <div className="mt-1 text-2xl font-semibold">{implementationGateScore}%</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {implementationGateChecks.map((check) => (
                <div key={check.label} className="border border-slate-200 bg-white p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={18}
                      className={check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400"}
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{check.label}</div>
                        <p className="mt-1 text-sm leading-5 text-slate-600">{check.detail}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyDraft(developmentCompletionReportDraft, "제작 완료 보고서")}
                className="avl-btn avl-btn-secondary h-10 rounded-[0.125rem] px-3"
              >
                <Clipboard size={16} />
                보고서 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft(
                    "dev_runbook",
                    `${selectedIdea.name} 제작 완료 보고서`,
                    developmentCompletionReportDraft,
                    "development_report",
                  )
                }
                disabled={isBusy || !user}
                className="avl-btn avl-btn-primary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
              >
                <Save size={16} />
                보고서 저장
              </button>
            </div>
          </div>

            {experienceMode === "guided" ? (
              <div className="avl-surface-muted mt-4 p-4">
                <div className="avl-pill avl-pill-info">AI가 준비한 실행 자료</div>
                <p className="mt-3 text-sm leading-5 text-slate-600">
                  지금은 제작 완료 보고서만 저장하고 출시 판단으로 넘어가면 됩니다. 제작팀 전달 자료, 실행 명령, 검수 기준,
                  역할별 지시서는 필요할 때 펼쳐 확인하세요.
                </p>
              </div>
            ) : (
            <>
              <textarea
                value={developmentPlanDraft}
                readOnly
                rows={24}
                className="avl-textarea mt-4 min-h-[420px] w-full resize-y bg-slate-50 font-mono text-sm leading-6 text-slate-700"
              />
              {copyMessage ? <p className="mt-3 text-sm text-slate-600">{copyMessage}</p> : null}

                <div className="avl-card mt-5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="avl-kicker">제작 전달 자료</div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">외부 제작 도구 전달 자료</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        검증된 아이디어를 Codex 같은 제작 도구로 넘길 때 쓰는 제작 기준 자료입니다.
                      </p>
                    </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(implementationHandoffDraft, "제작 도구 전달 자료")}
                      className="avl-btn avl-btn-secondary h-10 rounded-[0.125rem] px-3"
                    >
                      <Clipboard size={16} />
                      복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 제작 도구 전달 자료`,
                          implementationHandoffDraft,
                          "development_process",
                        )
                      }
                      disabled={isBusy || !user}
                      className="avl-btn avl-btn-primary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
                    >
                      <Save size={16} />
                      저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={implementationHandoffDraft}
                  readOnly
                  rows={14}
                  className="avl-textarea mt-4 w-full resize-y font-mono text-sm leading-6 text-slate-700"
                />
              </div>

                <div className="avl-card mt-5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="avl-kicker">제작 시작 자료</div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">제작 시작 안내 묶음</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        승인된 문서, 개발 실행 순서, 출시 판단을 합쳐 실제 구현 세션의 첫 메시지로 넘기는 시작 안내서입니다.
                      </p>
                    </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(mvpBuildCommandPacketDraft, "제작 시작 안내 묶음")}
                      disabled={!mvpBuildCommandPacketDraft}
                      className="avl-btn avl-btn-secondary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
                    >
                      <Clipboard size={16} />
                      안내 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 제작 시작 안내 묶음`,
                          mvpBuildCommandPacketDraft,
                          "mvp_build_command",
                        )
                      }
                      disabled={isBusy || !user || !mvpBuildCommandPacketDraft}
                      className="avl-btn avl-btn-primary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
                    >
                      <Save size={16} />
                      안내 저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={mvpBuildCommandPacketDraft}
                  readOnly
                  rows={16}
                  className="avl-textarea mt-4 w-full resize-y font-mono text-sm leading-6 text-slate-700"
                />
              </div>

                <div className="avl-card mt-5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="avl-kicker">품질 기준</div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">품질 점검표</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        구현 완료 직후 확인할 핵심 여정, 권한, 보안, 디버깅, 배포 스모크를 한 번에 정리합니다.
                      </p>
                    </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(qaAcceptanceMatrixDraft, "품질 점검표")}
                      disabled={!qaAcceptanceMatrixDraft}
                      className="avl-btn avl-btn-secondary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
                    >
                      <Clipboard size={16} />
                      점검표 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 품질 점검표`,
                          qaAcceptanceMatrixDraft,
                          "qa_acceptance_matrix",
                        )
                      }
                      disabled={isBusy || !user || !qaAcceptanceMatrixDraft}
                      className="avl-btn avl-btn-primary h-10 rounded-[0.125rem] px-3 disabled:opacity-50"
                    >
                      <Save size={16} />
                      점검표 저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={qaAcceptanceMatrixDraft}
                  readOnly
                  rows={14}
                  className="avl-textarea mt-4 w-full resize-y font-mono text-sm leading-6 text-slate-700"
                />
              </div>

                <div className="avl-surface-muted mt-5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="avl-kicker">역할별 작업 안내</div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">역할별 작업 안내 묶음</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        전략, 리서치, 제품, 디자인, 개발, 품질 점검, 디버깅, 보안, 출시 역할에 같은 문맥을 나눠주는 작업 안내서입니다.
                      </p>
                    </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(rolePromptPackDraft, "역할별 작업 안내 묶음")}
                      className="avl-btn avl-btn-secondary px-3"
                    >
                      <Clipboard size={16} />
                      복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 역할별 작업 안내 묶음`,
                          rolePromptPackDraft,
                          "development_process",
                        )
                      }
                      disabled={isBusy || !user}
                      className="avl-btn avl-btn-primary px-3 disabled:opacity-50"
                    >
                      <Save size={16} />
                      저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={rolePromptPackDraft}
                  readOnly
                  rows={16}
                  className="avl-textarea mt-4 w-full resize-y font-mono text-sm leading-6 text-slate-700"
                />
              </div>
            </>
          )}
          </div>
        </div>

        <div className={`avl-card p-4 ${activeTask === "launch" ? "" : "hidden"}`}>
          <FinalExecutionHeader
            canEnterLaunch={canEnterLaunch}
            nextLaunchBlocker={nextLaunchBlocker}
            passedReadinessCount={passedLaunchReadinessCount}
            readinessScore={launchReadinessScore}
            totalReadinessCount={launchReadiness.length}
          />

          {canEnterLaunch ? (
            <div className="grid gap-5">
              <FinalExecutionQuickStart
                activeExternalBuildTool={activeExternalBuildTool}
                decisionSentence={finalExecutionDecisionSentence}
                isExternalTool={buildDeliveryMode === "external_tool"}
                nextTaskCommand={liveExternalToolNextTaskCommand}
                progressPath={liveExternalToolProgressPath}
              />
              <FinalExecutionReadinessSummary
                activeBuildDeliveryLabel={activeBuildDeliveryLabel}
                activeExternalBuildTool={activeExternalBuildTool}
                activeProductSurface={activeProductSurface}
                buildDeliveryMode={buildDeliveryMode}
                hasFinalExternalToolOverride={hasFinalExternalToolOverride}
                onSelectExternalTool={(toolKey) =>
                  setFinalExternalToolOverride({ ideaId: selectedIdea?.id ?? null, key: toolKey })
                }
              />

              {buildDeliveryMode === "external_tool" ? (
                <FinalExecutionExternalToolSection
                  activeToolLabel={activeExternalBuildTool.label}
                  isLiveExternalDelivery={isLiveExternalDelivery}
                  onSwitchToCursor={() =>
                    setFinalExternalToolOverride({ ideaId: selectedIdea?.id ?? null, key: "cursor" })
                  }
                >
                  <FinalExecutionPackagePanel
                    activeExternalBuildTool={activeExternalBuildTool}
                    connectionManager={
                      isLiveExternalDelivery ? (
                        <FinalExecutionConnectionManager
                          activeConnectionCount={activeCursorSyncConnections.length}
                          connectionHealthDetail={finalExecutionConnectionHealthDetail}
                          connectionHealthTitle={finalExecutionConnectionHealthTitle}
                          connectionMessage={cursorSyncConnectionMessage}
                          connections={visibleCursorSyncConnections}
                          formatTime={formatTelemetryTime}
                          isConnectionLoading={isCursorSyncConnectionLoading}
                          onRefreshConnections={refreshCursorSyncConnections}
                          onRevokeConnection={revokeCursorSyncConnection}
                          registrySetupNotice={cursorSyncRegistrySetupNotice}
                          registryStatus={cursorSyncRegistryStatus}
                          revokingConnectionId={revokingCursorSyncConnectionId}
                          toolLabel={activeExternalBuildTool.label}
                          userCanManage={Boolean(user)}
                        />
                      ) : null
                    }
                    externalToolRunPackageDraft={externalToolRunPackageDraft}
                    finalAgentRunPackageDraft={finalAgentRunPackageDraft}
                    isBusy={isBusy}
                    isLiveExternalDelivery={isLiveExternalDelivery}
                    liveExternalToolStartPromptDraft={liveExternalToolStartPromptDraft}
                    onCopyDraft={copyDraft}
                    onDownloadPrimaryPackage={downloadFinalExecutionPrimaryPackage}
                    onDownloadProductionPackage={() =>
                      downloadMarkdownFile(
                        finalAgentRunPackageDraft,
                        "최종 제작 패키지",
                        toDownloadFileName(selectedIdea.name, "production-package"),
                      )
                    }
                    setupFileName={liveExternalToolSetupFileName}
                  />

                  <FinalExecutionToolGuide
                    activeExternalBuildTool={activeExternalBuildTool}
                    copyDraft={copyDraft}
                    guideDraft={liveExternalToolGuideDraft}
                    isLiveExternalDelivery={isLiveExternalDelivery}
                    mcpConfigDraft={liveExternalToolMcpConfigDraft}
                    nextTaskCommand={liveExternalToolNextTaskCommand}
                    setupCommand={liveExternalToolSetupCommand}
                    toolFolder={liveExternalToolFolder}
                  />
                </FinalExecutionExternalToolSection>
              ) : (
                <FinalExecutionInternalPanel
                  finalAgentRunPackageDraft={finalAgentRunPackageDraft}
                  onCopyPackage={() => copyDraft(finalAgentRunPackageDraft, "내부 개발 패키지")}
                  onDownloadPackage={() =>
                    downloadMarkdownFile(
                      finalAgentRunPackageDraft,
                      "내부 개발 패키지",
                      toDownloadFileName(selectedIdea.name, "venture-lab-build-package"),
                    )
                  }
                />
              )}

              <FinalExecutionTaskList
                description={finalExecutionTaskListDescription}
                fallbackTaskPreview={finalExecutionFallbackTaskPreview}
                isLiveExternalDelivery={isLiveExternalDelivery}
                statusLabels={implementationTaskStatusLabels}
                statusTone={implementationTaskStatusTone}
                taskPreview={finalExecutionTaskPreview}
                visibleTaskCount={finalExecutionVisibleTaskCount}
              />

              {buildDeliveryMode === "external_tool" ? (
                <FinalExecutionSyncPanel
                  activeToolLabel={activeExternalBuildTool.label}
                  canUseActions={Boolean(user)}
                  externalSyncReviewRows={externalSyncReviewRows}
                  isBusy={isBusy}
                  isLiveExternalDelivery={isLiveExternalDelivery}
                  isTaskSyncRefreshing={isTaskSyncRefreshing}
                  liveExternalToolProgressPath={liveExternalToolProgressPath}
                  onChangeProgressImportText={(value) => {
                    setCursorProgressImportText(value);
                    setCursorProgressImportMessage(null);
                    setCursorProgressImportItems([]);
                  }}
                  onImportProgressResult={importCursorProgressResult}
                  onLoadProgressImportFile={loadCursorProgressImportFile}
                  onRefreshTaskSync={() => void refreshSelectedIdeaImplementationTasks({ source: "manual" })}
                  progressImportItems={visibleCursorProgressImportItems}
                  progressImportMessage={cursorProgressImportMessage}
                  progressImportText={cursorProgressImportText}
                  statusLabels={implementationTaskStatusLabels}
                  statusTone={implementationTaskStatusTone}
                  taskSyncMessage={taskSyncMessage}
                  taskSyncUpdatedAt={taskSyncUpdatedAt}
                />
              ) : null}

              <FinalExecutionLearningCriteria
                isBusy={isBusy}
                learningDraft={postLaunchLearningLoopDraft}
                onCopyCriteria={() => copyDraft(postLaunchLearningLoopDraft, "출시 후 성과 확인")}
                onSaveCriteria={() =>
                  saveArtifactDraft(
                    "launch_checklist",
                    `${selectedIdea.name} 출시 후 성과 확인`,
                    postLaunchLearningLoopDraft,
                    "post_launch_learning",
                  )
                }
                userCanSave={Boolean(user)}
              />
            </div>
          ) : null}
        </div>

        <div className={`avl-card p-4 ${activeTask === "learning" ? "" : "hidden"}`}>
          <Step8LearningHeader />

          <Step8ActionSummary
            externalSyncCheckedText={externalSyncCheckedText}
            externalSyncOutcomeSentence={externalSyncOutcomeSentence}
            externalSyncReviewRows={externalSyncReviewRows}
            finalExecutionDecisionSentence={finalExecutionDecisionSentence}
            learningDecisionOptions={learningDecisionOptions}
            learningJudgmentQuestion={learningJudgmentQuestion}
            learningNextJudgmentBrief={learningNextJudgmentBrief}
            learningOneSentenceOutcome={learningOneSentenceOutcome}
            learningPrimaryActionDetail={learningPrimaryActionDetail}
            learningPrimaryActionLabel={learningPrimaryActionLabel}
            learningPrimaryActionText={learningPrimaryActionText}
            learningSimpleReviewRows={learningSimpleReviewRows}
            primaryCtaSlot={
              <Step8PrimaryCta
                canCopyReport={productSignalCount > 0 && !nextImplementationTask}
                ctaLabel={learningPrimaryCtaLabel}
                navigationHintDetail={learningPrimaryNavigationHintDetail}
                navigationHintTitle={learningPrimaryNavigationHintTitle}
                onCopyReport={() => copyDraft(learningTelemetryReportDraft, "학습 리포트")}
                reportDraft={learningTelemetryReportDraft}
              />
            }
          />

          <Step8OutcomeDetails learningDecisionCards={learningDecisionCards} />

          <Step8ProgressSection
            completedCount={completedLearningImplementationTasks.length}
            items={step8ProgressItems}
            nextTaskCode={nextImplementationTaskCode}
            nextTaskTitle={nextImplementationTask?.title ?? null}
            progressDetail={learningProgressDetail}
            progressTitle={learningProgressTitle}
            totalCount={totalLearningImplementationTasks}
          />

          {experienceMode === "guided" ? null : (
            <Step8TelemetryAdapterGuide
              canSave={Boolean(user)}
              ideaId={selectedIdea.id}
              isBusy={isBusy}
              onCopyDraft={copyDraft}
              onSaveGuide={() =>
                saveArtifactDraft(
                  "tech_spec",
                  `${selectedIdea.name} 성과 신호 연결 가이드`,
                  telemetryAdapterGuideDraft,
                  "telemetry_adapter",
                )
              }
              telemetryAdapterGuideDraft={telemetryAdapterGuideDraft}
              telemetryClientHelperSnippet={telemetryClientHelperSnippet}
              telemetryEnvSnippet={telemetryEnvSnippet}
              telemetryNextRouteSnippet={telemetryNextRouteSnippet}
              telemetrySmokeCommandSnippet={telemetrySmokeCommandSnippet}
            />
          )}

          <Step8OperatorReport
            canSave={Boolean(user)}
            categoryLabels={telemetryCategoryLabels}
            categoryTone={telemetryCategoryTone}
            eventLabels={telemetryEventLabels}
            formatTelemetryProperties={formatTelemetryProperties}
            formatTelemetryTime={formatTelemetryTime}
            isBusy={isBusy}
            learningSignalCards={learningSignalCards}
            learningTelemetryReportDraft={learningTelemetryReportDraft}
            onCopyFunnel={() => copyDraft(productTelemetryFunnelDraft, "제품 사용 퍼널 리포트")}
            onCopyReport={() => copyDraft(learningTelemetryReportDraft, "학습 리포트")}
            onSaveFunnel={() =>
              saveArtifactDraft(
                "research_note",
                `${selectedIdea.name} 제품 사용 퍼널`,
                productTelemetryFunnelDraft,
                "product_telemetry_funnel",
              )
            }
            onSaveReport={() =>
              saveArtifactDraft(
                "research_note",
                `${selectedIdea.name} 학습 리포트`,
                learningTelemetryReportDraft,
                "post_launch_learning",
              )
            }
            productTelemetryFunnelDraft={productTelemetryFunnelDraft}
            productTelemetryFunnelRows={productTelemetryFunnelRows}
            productTelemetryMaxCount={productTelemetryMaxCount}
            productTelemetryTaxonomyRows={productTelemetryTaxonomyRows}
            selectedTelemetryEvents={selectedTelemetryEvents}
          />
        </div>

        <div
          className={`avl-card p-5 ${
            activeTask === "orchestration" ? "" : "hidden"
          }`}
        >
          <Step6WorkOrderHeader
            canCreateRunbook={Boolean(user)}
            isBusy={isBusy}
            onCreateRunbook={createRunbook}
          />

          <Step6ExecutionBridge
            finalExecutionDetail={
              buildDeliveryMode === "external_tool"
                ? `${activeExternalBuildTool.label} 연결 파일과 START 파일`
                : "내부 개발 시작 자료와 완료 기준"
            }
            firstTaskAcceptanceCriteria={firstImplementationTask?.acceptance_criteria ?? null}
            firstTaskTitle={firstImplementationTask?.title ?? null}
            firstTaskTypeLabel={
              firstImplementationTask ? implementationTaskTypeLabels[firstImplementationTask.task_type] : null
            }
            hasGeneratedWorkOrder={hasGeneratedWorkOrder}
          />

          <Step6ManualRunForm
            canSubmit={Boolean(user)}
            isBusy={isBusy}
            onObjectiveChange={(value) => setRunDraft({ ...runDraft, objective: value })}
            onOwnerRoleChange={(value) => setRunDraft({ ...runDraft, owner_role: value })}
            onPhaseChange={(nextPhase) => {
              const config = orchestrationPhaseConfigs.find((item) => item.phase === nextPhase);
              setRunDraft({
                phase: nextPhase,
                owner_role: config?.ownerRole ?? runDraft.owner_role,
                objective: config?.objective ?? runDraft.objective,
              });
            }}
            onSubmit={addOrchestrationRun}
            phaseLabels={phaseLabels}
            phaseOptions={orchestrationPhaseConfigs.map((config) => config.phase)}
            runDraft={runDraft}
          />

          <Step6RunList
            canManageRun={canManageRecord}
            isBusy={isBusy}
            onDeleteRun={deleteOrchestrationRun}
            onFillRunOutput={(run) =>
              setRunOutputs((current) => ({
                ...current,
                [run.id]: buildRunOutputTemplate(run, selectedIdea, editState),
              }))
            }
            onRunOutputChange={(runId, value) => setRunOutputs((current) => ({ ...current, [runId]: value }))}
            onSaveRunOutput={saveRunOutput}
            onUpdateRunStatus={updateRunStatus}
            orchestrationStatuses={orchestrationStatuses}
            phaseLabels={phaseLabels}
            runOutputs={runOutputs}
            runStatusLabels={runStatusLabels}
            runStatusTone={runStatusTone}
            selectedRuns={selectedRuns}
          />
        </div>

        <div className={activeTask === "risk" || activeTask === "decision" ? "grid gap-5" : "hidden"}>
          <div className={`grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px] ${activeTask === "risk" ? "" : "hidden"}`}>
            <form onSubmit={addRisk} className="avl-card p-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="avl-kicker">risk register</div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">위험 확인</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-600">막을 위험만 먼저 남깁니다.</p>
                </div>
                <ShieldAlert className="text-rose-600" size={22} />
              </div>
              {validationPlan?.risks[0] ? (
                <div className="mb-4 border border-rose-100 bg-rose-50 px-4 py-3">
                  <div className="text-xs font-semibold tracking-[0.14em] text-rose-700">AI 추천 리스크</div>
                  <p className="mt-2 text-sm leading-5 text-rose-950">
                    사업성 평가를 기준으로 먼저 확인할 위험을 준비했습니다. 누르면 아래 입력칸에 자동으로 채워집니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadRiskSuggestion(validationPlan.risks[0])}
                    className="avl-btn avl-btn-secondary mt-3 h-9 px-3 text-xs"
                  >
                    핵심 리스크 가져오기
                  </button>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-3">
                <InputField
                  label="제목"
                  value={riskDraft.title}
                  onChange={(value) => setRiskDraft({ ...riskDraft, title: value })}
                />
                <InputField
                  label="영역"
                  value={riskDraft.area}
                  onChange={(value) => setRiskDraft({ ...riskDraft, area: value })}
                />
                <SelectField
                  label="심각도"
                  value={riskDraft.severity}
                  options={riskSeverities}
                  labels={riskSeverityLabels}
                  disabled={!user}
                  onChange={(value) => setRiskDraft({ ...riskDraft, severity: value as RiskSeverity })}
                />
              </div>
              <div className="avl-surface-muted mt-4 grid gap-3 px-4 py-3 sm:grid-cols-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">현재 위험 수</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">{selectedRisks.length}개</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">열린 위험</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">
                    {selectedRisks.filter((risk) => risk.status === "open").length}개
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">대응 중</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">
                    {selectedRisks.filter((risk) => risk.status === "mitigating").length}개
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <TextArea
                  label="완화 방안"
                  value={riskDraft.mitigation}
                  disabled={!user}
                  onChange={(value) => setRiskDraft({ ...riskDraft, mitigation: value })}
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isBusy || !user}
                  className="avl-btn avl-btn-danger px-4 disabled:opacity-50"
                >
                  <Flag size={18} />
                  리스크 추가
                </button>
              </div>
                <div className="avl-surface-muted mt-4 px-4 py-3 text-sm leading-5 text-slate-600">
                  제목, 심각도, 대응 방향만 있어도 다음 단계로 충분합니다.
                </div>
              </form>

            <section className="avl-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">risk list</div>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">기록된 위험</h3>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {selectedRisks.length > 0 ? (
                  selectedRisks.map((risk) => (
                    <div key={risk.id} className="avl-surface-muted p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{risk.title}</span>
                          <span className="avl-pill avl-pill-neutral">
                            {riskSeverityLabels[risk.severity]}
                          </span>
                          <span className="avl-pill avl-pill-neutral">
                            {riskStatusLabels[risk.status] ?? risk.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["open", "mitigating", "closed"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateRiskStatus(risk, status)}
                              disabled={isBusy || !canManageRecord(risk) || risk.status === status}
                              className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                            >
                              {riskStatusLabels[status] ?? status}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
                    </div>
                  ))
                ) : (
                    <div className="avl-surface-muted border-dashed p-4 text-sm leading-6 text-slate-600">
                      아직 기록된 위험이 없습니다. 출시를 막을 수 있는 핵심 위험만 먼저 추가해도 충분합니다.
                    </div>
                )}
              </div>
            </section>
          </div>

          <div className={`grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] ${activeTask === "decision" ? "" : "hidden"}`}>
            <section className="avl-card p-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="avl-kicker">decision log</div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">판단 기록</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-600">왜 이 판단인지 한 문단이면 충분합니다.</p>
                </div>
                <CheckCircle2 className="text-emerald-600" size={22} />
              </div>
              <div className="grid gap-4">
                {validationPlan ? (
                  <div className="border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <div className="text-xs font-semibold tracking-[0.14em] text-emerald-700">AI 판단 근거</div>
                    <p className="mt-2 text-sm leading-5 text-emerald-950">
                      사업성 평가 내용을 바탕으로 판단 근거 초안을 만들 수 있습니다.
                    </p>
                    <button
                      type="button"
                      onClick={loadDecisionTemplate}
                      className="avl-btn avl-btn-secondary mt-3 h-9 px-3 text-xs"
                    >
                      판단 근거 가져오기
                    </button>
                  </div>
                ) : null}
                <TextArea
                  label="판단 근거"
                  value={decisionReason}
                  disabled={!canEdit}
                  onChange={(value) => setDecisionReason(value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={recordDecision}
                    disabled={isBusy || !canEdit}
                    className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                    {decisionLabels[editState.decision]} 기록
                  </button>
                </div>
                <div className="avl-surface-muted px-4 py-3 text-sm leading-5 text-slate-600">
                  왜 지금 진행 또는 보류인지 한 문단이면 충분합니다.
                </div>
              </div>
            </section>

            <section className="avl-card p-4">
              <div className="avl-surface-muted mb-4 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">현재 판단</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{decisionLabels[editState.decision]}</div>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  지금까지의 평가와 위험 신호를 보고 남길 판단입니다. 문장 하나면 충분합니다.
                </p>
              </div>
              <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">판단 기록</div>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">기록된 판단</h3>
              <div className="mt-4 grid gap-2">
                {selectedDecisions.length > 0 ? (
                  selectedDecisions.map((entry) => (
                    <div key={entry.id} className="avl-surface-muted p-4 text-sm text-slate-600">
                      <span className="font-semibold text-slate-950">{decisionLabels[entry.decision]}</span>
                      {entry.reason ? ` - ${entry.reason}` : ""}
                    </div>
                  ))
                ) : (
                  <div className="avl-surface-muted border-dashed p-4 text-sm text-slate-500">아직 기록된 판단이 없습니다.</div>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className={`grid gap-4 ${activeTask === "experiment" ? "" : "hidden"}`}>
          <div className="grid gap-4">
              <section className="avl-card p-4">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="avl-kicker">검증 계획</div>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">7일 검증 계획</h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                      선택한 아이디어가 실제로 해볼 만한지 확인하는 단계입니다. AI가 추천한 검증 계획을 저장하면,
                      현재 아이디어 아래에 붙는 하위 검증 계획으로 남습니다.
                    </p>
                  </div>
                  <Beaker className="text-sky-600" size={22} />
                </div>
                <Step3ValidationGateBridge
                  hasMarketScanArtifact={hasMarketScanArtifact}
                  hasSavedExperiment={selectedExperiments.length > 0}
                  isMarketScanLoading={isMarketScanLoading}
                  isMarketScanOutdated={hasOutdatedMarketScanArtifact}
                />
                <div className="mb-5 grid gap-px bg-slate-200 md:grid-cols-3">
                  {[
                    ["무엇을 확인할지", "가장 불확실한 한 가지를 고릅니다. 예: 실제로 자주 겪는 문제인지, 돈을 낼 만큼 불편한지."],
                    ["어떻게 확인할지", "7일 안에 직접 할 수 있는 행동 하나만 정합니다. 예: 5명 인터뷰, 랜딩/대기자, 직접 테스트."],
                    ["어디까지 보면 될지", "몇 명이 어떤 행동을 하면 계속할지, 어떤 반응이면 멈출지 숫자로 정합니다."],
                  ].map(([title, detail], index) => (
                    <div key={title} className="bg-slate-50 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        0{index + 1}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">{title}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-0">
                  {validationPlan ? (
                    <div className="border border-sky-100 bg-sky-50 px-4 py-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-xs font-semibold tracking-[0.14em] text-sky-700">AI 추천 검증 계획</div>
                          <p className="mt-2 text-sm leading-6 text-sky-950">
                            AI가 이번 주에 확인할 검증 하나를 먼저 정했습니다. 저장하면 이 아이디어의 하위 검증 계획으로 남고,
                            다음 단계 이동은 하단 버튼에서만 열립니다.
                          </p>
                        </div>
                        {recommendedValidationExperiment ? (
                          <button
                            type="button"
                            onClick={() => void saveRecommendedExperiment(recommendedValidationExperiment)}
                            disabled={isBusy || !user || selectedExperiments.length > 0}
                            className="avl-btn avl-btn-primary shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save size={17} />
                            {selectedExperiments.length > 0 ? "검증 계획 저장 완료" : "AI 추천 검증 계획 저장"}
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {validationPlan.experiments.slice(0, 2).map((experiment) => (
                          <div
                            key={experiment.name}
                            className="border border-sky-200 bg-white p-3"
                          >
                            <div className="text-sm font-semibold text-slate-950">{experiment.name}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-600">{experiment.success_metric}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <details
                    className={`border border-slate-200 bg-white p-4 ${
                      validationPlan ? "border-t-0" : ""
                    }`}
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">필요할 때만 직접 수정하기</div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            AI 추천 기준이 맞지 않을 때만 열어서 검증 이름과 성공 기준을 바꿉니다.
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">열어서 수정</span>
                      </div>
                    </summary>
                    <form onSubmit={addExperiment} className="mt-4 grid gap-4 border-t border-slate-200 pt-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <InputField
                          label="이번에 해볼 작은 검증"
                          value={experimentDraft.name}
                          placeholder="예) 타깃 5명에게 문제 인터뷰하기"
                          onChange={(value) => setExperimentDraft({ ...experimentDraft, name: value })}
                        />
                        <InputField
                          label="성공/중단 기준"
                          value={experimentDraft.success_metric}
                          placeholder="예) 5명 중 3명이 최근 사례와 비용 지불 의향을 말하면 진행"
                          onChange={(value) => setExperimentDraft({ ...experimentDraft, success_metric: value })}
                        />
                        <button
                          type="submit"
                          disabled={isBusy || !user}
                          className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
                        >
                          <Beaker size={18} />
                          수정한 계획 저장
                        </button>
                      </div>
                    </form>
                  </details>
                </div>

              <div className="mt-5 grid gap-3">
                <div>
                  <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">저장된 하위 검증 계획</div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    아래 항목은 모두 <span className="font-semibold text-slate-950">{selectedIdea.name}</span> 아이디어에 연결된 검증입니다.
                  </p>
                </div>
                {selectedExperiments.length > 0 ? (
                  selectedExperiments.map((experiment, index) => (
                    <div key={experiment.id} className="border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-4 border-l-4 border-sky-300 pl-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="avl-step-dot bg-slate-950 text-white">{index + 1}</span>
                              <span className="avl-pill avl-pill-info">하위 검증</span>
                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                상위 아이디어 · {selectedIdea.name}
                              </span>
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-950">{experiment.name}</div>
                          </div>
                          <span className="avl-pill avl-pill-neutral">
                            {experimentStatusLabels[experiment.status] ?? experiment.status}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-slate-600">
                          {experiment.success_metric || "성공/중단 기준 미정"}
                        </p>

                        <div className="grid gap-3">
                          <div>
                            <div className="text-xs font-semibold tracking-[0.12em] text-slate-500">상태 변경 기준</div>
                            <div className="mt-2 grid gap-2 md:grid-cols-3">
                              {["planned", "running", "done"].map((status) => {
                                const isSelected = experiment.status === status;

                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    title={experimentStatusGuides[status]}
                                    onClick={() => updateExperimentStatus(experiment, status)}
                                    disabled={isBusy || !canManageRecord(experiment) || isSelected}
                                    className={`border p-3 text-left text-xs transition disabled:opacity-100 ${
                                      isSelected
                                        ? "border-slate-950 bg-slate-950 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                                    }`}
                                  >
                                    <div className="text-sm font-semibold">{experimentStatusLabels[status] ?? status}</div>
                                    <p className={`mt-1 leading-5 ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                                      {experimentStatusGuides[status]}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => void deleteExperiment(experiment)}
                              disabled={isBusy || !canManageRecord(experiment)}
                              className="avl-btn avl-btn-danger h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                            >
                              <Trash2 size={13} />
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                    <div className="avl-surface-muted border-dashed p-4 text-sm text-slate-600">
                      아직 저장한 하위 검증 계획이 없습니다. 위의 AI 추천 검증 계획을 저장하면 다음 단계가 열립니다.
                    </div>
                )}
              </div>
            </section>
          </div>

            <div className="avl-surface-muted px-4 py-3 text-sm leading-5 text-slate-600">
              길게 기획하지 않아도 됩니다. 이 아이디어에 대해 이번 주에 실제로 확인할 행동 하나와 성공/중단 기준 하나면 충분합니다.
            </div>

          {validationEvidenceCoach ? (
            <details className="avl-card p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">선택 보조</div>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">부족한 질문을 더 보고 싶을 때만 열기</h3>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">열어서 보기</span>
                </div>
              </summary>
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">부족한 근거 확인</div>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">{validationEvidenceCoach.label}</h3>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                      일반 흐름에서는 아래 시장·경쟁 자동 점검이 먼저 정리됩니다. 이 영역은 외부 AI나 인터뷰 준비에 쓸 질문을
                    더 뽑고 싶을 때만 여는 추가 확인 영역입니다. 버튼을 눌러도 다음 단계로 이동하지 않습니다.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {validationEvidenceCoach.nextFocus
                      ? `${validationEvidenceCoach.nextFocus.label}: ${validationEvidenceCoach.nextFocus.action}`
                      : "핵심 근거가 충분합니다. 실행한 검증 결과를 기록한 뒤 하단 다음 단계 버튼으로 이동하세요."}
                  </p>
                </div>
                <div className="bg-slate-950 px-3 py-2 text-right text-white">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">근거</div>
                  <div className="text-2xl font-semibold">{validationEvidenceCoach.score}%</div>
                </div>
              </div>
              <div className="mt-4 grid gap-px bg-slate-200 md:grid-cols-3">
                {[
                  ["근거 충분도", "현재 확인한 내용이 다음 단계로 넘어가기에 충분한지 참고로 보여줍니다."],
                  ["질문 복사", "외부 AI, 인터뷰 준비, 조사 메모에 붙여넣을 질문을 복사합니다."],
                  ["아래 입력칸에 넣기", "부족한 근거를 아래 결과 기록의 다음 행동 입력칸에 넣습니다."],
                ].map(([title, detail]) => (
                  <div key={title} className="bg-slate-50 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-950">{title}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(validationEvidenceCoach.prompt, "검증 질문 묶음")}
                  className="avl-btn avl-btn-secondary h-9 px-3 text-xs"
                >
                  <Clipboard size={15} />
                  질문 복사
                </button>
                <button
                  type="button"
                  onClick={loadEvidenceCoachPrompt}
                  className="avl-btn avl-btn-secondary h-9 px-3 text-xs"
                >
                  <ArrowDownToLine size={15} />
                  아래 입력칸에 넣기
                </button>
              </div>
            </details>
          ) : null}

          <div className="avl-card p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="avl-kicker">시장·경쟁 자동 점검</div>
                <h3 className="mt-1 text-base font-semibold text-slate-950">AI가 시장성, 경쟁도, 진입장벽을 먼저 채웁니다</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  이 단계는 사용자가 시장 조사를 직접 끝내야 하는 구간이 아닙니다. STEP 3에 들어오면 AI가 현재 아이디어와 제작
                  형태를 함께 보고 예상 수요, 경쟁도, 시장 포화도, 진입장벽, 대체재를 먼저 정리합니다.
                </p>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                  로그인 상태라면 자동 점검 결과는 리서치 노트로도 저장됩니다. 공개 자료를 찾으면 출처를 함께 표시하고,
                  출처가 부족하면 추정 초안으로 남깁니다. 웹, 앱, 자동화처럼 만드는 형태에 맞춰 경쟁 기준을 잡고, 다시 정리는
                  결과를 새로 고칠 때만 사용합니다. 다음 단계는 이 점검 노트가 저장된 뒤에만 열립니다.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:w-auto lg:min-w-[240px]">
                <div className="bg-slate-50 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">자동 점검 상태</div>
                    <span className={marketScanStatus.tone}>{marketScanStatus.label}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{marketScanStatus.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void runMarketScan()}
                  disabled={isMarketScanLoading || !selectedIdea || !editState}
                  className="avl-btn avl-btn-secondary justify-center px-4 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isMarketScanLoading ? "animate-spin" : ""} />
                  {marketScanActionLabel}
                </button>
              </div>
            </div>

            {marketScanError ? (
              <div className="mt-3 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{marketScanError}</div>
            ) : null}

            {hasMarketScanArtifact && !visibleMarketScanDraft && !isMarketScanLoading ? (
              <div className="mt-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                시장·경쟁 점검이 이미 저장되어 있습니다. 새로 확인할 내용이 없다면 하단 다음 단계 버튼으로 제작 자료를 이어가면 됩니다.
              </div>
            ) : null}

            {hasOutdatedMarketScanArtifact && !visibleMarketScanDraft && !isMarketScanLoading ? (
              <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                이전 결과물 형태로 저장된 시장·경쟁 점검이 있습니다. 현재 결과물 형태인 {activeProductSurface.label} 기준으로
                다시 정리한 뒤 다음 단계가 열립니다.
              </div>
            ) : null}

            {visibleMarketScanDraft ? (
              <div className="mt-4 grid gap-4">
                <div
                  className={`border px-4 py-3 text-sm leading-6 ${
                    isVisibleMarketScanEstimate
                      ? "border-amber-200 bg-amber-50 text-amber-950"
                      : "border-blue-100 bg-blue-50 text-slate-700"
                  }`}
                >
                  {isVisibleMarketScanEstimate
                    ? "이 결과는 웹 출처가 붙지 않은 추정 초안입니다. OpenAI 웹 조사가 가능해지면 다시 실행해 출처 포함 리서치 노트로 보강하세요."
                    : "이 결과는 현재 아이디어에 연결되는 자동 점검 초안입니다. 저장 권한이 있으면 리서치 노트로 자동 저장되고, 제작 패키지에 들어갈 리서치 근거로 함께 묶입니다."}
                </div>
                <div data-smoke="market-scan-source-boundary" className="border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">근거 기준</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{marketScanSourceBoundaryText}</p>
                </div>
                <div className="grid gap-px bg-slate-200 md:grid-cols-3">
                  {[
                    ["조사 방식", isVisibleMarketScanEstimate ? "추정 초안" : "웹 출처 포함"],
                    ["참고 출처", `${visibleMarketScanDraft.sources.length}개`],
                    ["경쟁/대체재", `${visibleMarketScanDraft.competitor_map.length}개`],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-white px-4 py-3">
                      <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{label}</div>
                      <div className="mt-2 text-base font-semibold text-slate-950">{value}</div>
                    </div>
                  ))}
                </div>
                <div data-smoke="market-scan-decision-strip" className="grid gap-px bg-slate-200 lg:grid-cols-3">
                  {[
                    [
                      "지금 판단",
                      decisionLabels[visibleMarketScanDraft.recommendation],
                      `신뢰도 ${getMarketScanLevelLabel(visibleMarketScanDraft.confidence)}`,
                    ],
                    ["다음 행동", visibleMarketScanDraft.next_action, "이 행동만 확인하면 다음 단계 판단이 쉬워집니다"],
                    [
                      "주의",
                      visibleMarketScanDraft.caveat || "출처와 추정이 섞일 수 있으니 중요한 수치는 다시 확인하세요.",
                      isVisibleMarketScanEstimate ? "추정 초안" : "웹 출처 포함",
                    ],
                  ].map(([label, value, helper]) => (
                    <div key={label} className="bg-white px-4 py-3">
                      <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{label}</div>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{value}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
                    </div>
                  ))}
                </div>
                {visibleMarketScanDraft.market_signals.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {visibleMarketScanDraft.market_signals.map((signal) => (
                      <div key={signal.label} className="border border-emerald-100 bg-emerald-50 px-3 py-3">
                        <div className="text-xs font-semibold tracking-[0.12em] text-emerald-700">{signal.label}</div>
                        <p className="mt-1 text-xs leading-5 text-slate-700">{signal.finding}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-px bg-slate-200 lg:grid-cols-3">
                  {[
                    ["예상 수요", visibleMarketScanDraft.demand_forecast],
                    ["경쟁/포화도", `${visibleMarketScanDraft.competition} ${visibleMarketScanDraft.saturation}`],
                    ["진입장벽", visibleMarketScanDraft.entry_barriers],
                  ].map(([title, detail]) => (
                    <div key={title} className="bg-slate-50 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-950">{title}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="avl-surface-muted px-4 py-3 text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-950">대체재와 차별화:</span> {visibleMarketScanDraft.alternatives}
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">AI 추천 판단</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">
                      {decisionLabels[visibleMarketScanDraft.recommendation]}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      신뢰도{" "}
                      {visibleMarketScanDraft.confidence === "high"
                        ? "높음"
                        : visibleMarketScanDraft.confidence === "medium"
                          ? "보통"
                          : "낮음"}
                      {marketScanMode === "local_estimate" ? " · 추정 초안" : ""}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">경쟁/대체재</div>
                    <div className="mt-3 grid gap-2">
                      {visibleMarketScanDraft.competitor_map.length > 0 ? (
                        visibleMarketScanDraft.competitor_map.map((competitor) => (
                          <div key={`${competitor.name}-${competitor.category}`} className="border border-slate-100 bg-slate-50 px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-950">{competitor.name}</span>
                              <span className="avl-pill avl-pill-neutral text-[11px]">{competitor.category}</span>
                              <span className="avl-pill avl-pill-info text-[11px]">
                                위협 {getMarketScanLevelLabel(competitor.threat)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{competitor.note}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">아직 정리된 경쟁/대체재가 없습니다.</div>
                      )}
                    </div>
                  </div>
                  <div className="border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">진입장벽 체크</div>
                    <div className="mt-3 grid gap-2">
                      {visibleMarketScanDraft.entry_barrier_checks.length > 0 ? (
                        visibleMarketScanDraft.entry_barrier_checks.map((barrier) => (
                          <div key={barrier.label} className="border border-slate-100 bg-slate-50 px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-950">{barrier.label}</span>
                              <span className="avl-pill avl-pill-warning text-[11px]">
                                {getMarketScanLevelLabel(barrier.severity)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{barrier.note}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">아직 정리된 진입장벽이 없습니다.</div>
                      )}
                    </div>
                  </div>
                </div>
                {visibleMarketScanDraft.research_queries.length > 0 ? (
                  <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">추가로 확인할 질문</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {visibleMarketScanDraft.research_queries.map((query) => (
                        <span key={query} className="avl-pill avl-pill-neutral text-xs">
                          {query}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">참고 출처</div>
                    <div className="text-xs text-slate-500">
                      근거 강도 높음{" "}
                      {visibleMarketScanDraft.sources.filter((source) => source.strength === "high").length}개 / 전체{" "}
                      {visibleMarketScanDraft.sources.length}개
                    </div>
                  </div>
                  {visibleMarketScanDraft.sources.length > 0 ? (
                    <div className="grid gap-2">
                      {visibleMarketScanDraft.sources.map((source, index) => (
                        <div key={`${source.url}-${index}`} className="border border-slate-200 bg-white px-3 py-2 text-xs leading-5">
                          <div className="mb-1 flex flex-wrap gap-2">
                            <span className={`avl-pill ${getMarketScanSourceStrengthTone(source.strength)} text-[11px]`}>
                              근거 강도 {getMarketScanLevelLabel(source.strength)}
                            </span>
                            <span className="avl-pill avl-pill-neutral text-[11px]">
                              {marketScanSourceTypeLabels[source.source_type]}
                            </span>
                          </div>
                          {source.url ? (
                            <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-950 underline-offset-2 hover:underline">
                              {source.title || source.url}
                            </a>
                          ) : (
                            <span className="font-semibold text-slate-950">{source.title}</span>
                          )}
                          {source.reason ? <p className="mt-1 text-slate-500">{source.reason}</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">표시할 출처가 없습니다. 추정 초안으로만 참고하세요.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <details className="avl-card p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="avl-kicker">선택 기록</div>
                  <h3 className="mt-1 text-base font-semibold text-slate-950">직접 확인한 결과가 있을 때만 열기</h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    인터뷰, 랜딩 페이지, 직접 테스트처럼 이미 확인한 결과가 있으면 여기에 남깁니다. 아직 실행 전이면
                    위의 자동 점검만으로도 다음 제작 자료 단계로 넘어갈 수 있습니다.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-600">열어서 기록</span>
              </div>
            </summary>
            <form onSubmit={saveExperimentResultNote} className="mt-4 grid gap-4 border-t border-slate-200 pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-600">
                  이 기록은 선택 사항입니다. 저장해도 단계가 자동으로 넘어가지 않고, 이동은 항상 하단 다음 단계 버튼에서만 진행됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => copyDraft(experimentResultNoteDraft, "검증 결과")}
                  disabled={!experimentResultNoteDraft}
                  className="avl-btn avl-btn-secondary px-3 disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  결과 복사
                </button>
              </div>
            <div className="grid gap-4">
              <div className="grid gap-px bg-slate-200 md:grid-cols-5">
                {[
                  ["어떤 검증인가요", "결과를 남길 검증 계획을 고릅니다."],
                  ["검증 후 판단", "결과를 보고 계속 진행할지, 더 조사할지, 전환/중단할지 고릅니다."],
                  ["결과", "숫자, 사람 수, 반응처럼 실제 확인한 사실을 적습니다."],
                  ["배운 점", "그 결과가 아이디어에 어떤 의미인지 정리합니다."],
                  ["다음 행동", "바로 이어서 할 한 가지 행동을 적습니다."],
                ].map(([title, detail]) => (
                  <div key={title} className="bg-slate-50 px-3 py-3">
                    <div className="text-xs font-semibold text-slate-950">{title}</div>
                    <p className="mt-1 text-[11px] leading-5 text-slate-600">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  어떤 검증인가요
                  <select
                    value={selectedExperimentForResult?.id ?? ""}
                    disabled={selectedExperiments.length === 0}
                    onChange={(event) =>
                      setExperimentResultDraft((current) => ({ ...current, experiment_id: event.target.value }))
                    }
                    className="avl-select h-11 text-sm font-normal text-slate-950 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {selectedExperiments.length > 0 ? (
                      selectedExperiments.map((experiment) => (
                        <option key={experiment.id} value={experiment.id}>
                          {experiment.name}
                        </option>
                      ))
                    ) : (
                      <option value="">검증 계획을 먼저 추가하세요</option>
                    )}
                  </select>
                  <span className="text-xs font-normal leading-5 text-slate-500">
                    위에서 추가한 검증 계획 중 결과를 남길 항목을 선택합니다.
                  </span>
                </label>
                <SelectField
                  label="검증 후 판단"
                  value={experimentResultDraft.next_decision}
                  options={decisions}
                  labels={decisionLabels}
                  description="이 결과를 보고 아이디어를 계속 진행할지, 추가 조사할지, 전환/중단할지 고릅니다."
                  disabled={selectedExperiments.length === 0}
                  onChange={(value) =>
                    setExperimentResultDraft((current) => ({ ...current, next_decision: value }))
                  }
                />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <TextArea
                  label="확인한 결과"
                  value={experimentResultDraft.result}
                  placeholder="예) 5명 중 3명이 같은 문제를 겪고 있었고, 2명은 월 구독 의향을 보였습니다."
                  description="실제로 확인한 사실을 숫자와 반응 중심으로 적습니다."
                  disabled={selectedExperiments.length === 0}
                  onChange={(value) => setExperimentResultDraft((current) => ({ ...current, result: value }))}
                />
                <TextArea
                  label="배운 점"
                  value={experimentResultDraft.learning}
                  placeholder="예) 문제는 있지만 기능보다 신뢰와 개인정보 설명이 먼저 필요했습니다."
                  description="결과를 보고 새로 알게 된 의미를 적습니다."
                  disabled={selectedExperiments.length === 0}
                  onChange={(value) => setExperimentResultDraft((current) => ({ ...current, learning: value }))}
                />
              </div>
              <TextArea
                label="다음 행동"
                value={experimentResultDraft.next_action}
                placeholder="예) 개인정보 저장 방식을 설명한 랜딩 페이지로 2차 확인"
                description="이 결과 다음에 바로 할 한 가지 행동만 적습니다."
                disabled={selectedExperiments.length === 0}
                onChange={(value) => setExperimentResultDraft((current) => ({ ...current, next_action: value }))}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isBusy || !user || selectedExperiments.length === 0}
                  className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
                >
                  <Save size={18} />
                  검증 결과 저장
                </button>
              </div>
            </div>
            </form>
          </details>
        </div>

        <div className={activeTask === "artifacts" ? "avl-card p-4" : "hidden"}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">검증 자료 저장</h2>
              <p className="mt-1 text-sm text-slate-500">
                {experienceMode === "guided"
                  ? "AI가 아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 한 번에 저장합니다."
                  : artifactPanelDescriptions[artifactPanel]}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <button
                type="button"
                onClick={() => void saveValidationPackageDrafts()}
                disabled={isBusy || isSavingValidationBundle || !user || isValidationBundleSaved}
                className="avl-btn avl-btn-primary px-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />
                {isSavingValidationBundle
                  ? "저장 중"
                  : isValidationBundleSaved
                    ? "검증 자료 저장 완료"
                    : "검증 자료 한 번에 저장"}
              </button>
              <div className={experienceMode === "guided" ? "hidden" : "grid gap-2 sm:grid-cols-2"}>
              <button
                type="button"
                onClick={() => setArtifactPanel("validation")}
                className={`border px-4 py-3 text-left transition ${
                  artifactPanel === "validation"
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <div className="text-xs font-semibold tracking-[0.14em] opacity-70">STEP 4-1</div>
                <div className="mt-1 text-sm font-semibold">검증 자료 저장</div>
              </button>
              <button
                type="button"
                onClick={() => setArtifactPanel("product")}
                disabled={!hasValidationSummaryArtifact}
                className={`border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  artifactPanel === "product"
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <div className="text-xs font-semibold tracking-[0.14em] opacity-70">STEP 4-2</div>
                <div className="mt-1 text-sm font-semibold">
                  {hasValidationSummaryArtifact ? "기획서 만들기" : "검증 요약 저장 후 열림"}
                </div>
              </button>
              </div>
            </div>
          </div>
          <Step4ValidationBundleBridge isValidationBundleSaved={isValidationBundleSaved} />
          <div className="mt-4 grid gap-px bg-slate-200 md:grid-cols-4">
            {[
              ["아이디어 요약", hasIdeaBriefArtifact],
              ["조사 요약", hasResearchBriefArtifact],
              ["7일 검증 계획", hasValidationSprintArtifact],
              ["검증 완료 요약", hasValidationSummaryArtifact],
            ].map(([label, passed]) => (
              <div key={String(label)} className="bg-slate-50 px-3 py-3">
                <div className="text-xs font-semibold text-slate-500">{String(label)}</div>
                <div className={`mt-1 text-sm font-semibold ${passed ? "text-emerald-700" : "text-slate-700"}`}>
                  {passed ? "저장 완료" : "저장 필요"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DraftDocumentCard
          className={activeTask === "artifacts" && (experienceMode === "guided" || artifactPanel === "validation") ? "" : "hidden"}
          kicker="validation"
          title="아이디어 요약"
          description="기획서나 조사 문서에 바로 이어 쓸 수 있는 1차 요약입니다."
          body={ideaBrief}
          rows={12}
          copyLabel="요약 복사"
          onCopy={copyIdeaBrief}
          onSave={() => saveArtifactDraft("idea_brief", `${selectedIdea.name} 아이디어 요약`, ideaBrief, "workbench")}
          saveLabel={hasIdeaBriefArtifact ? "저장 완료" : "제작 자료 저장"}
          saveDisabled={isBusy || !user || hasIdeaBriefArtifact}
          disabledNote={hasIdeaBriefArtifact ? "아이디어 요약이 저장되어 상단 상태에 반영되었습니다." : undefined}
          actionMode="hidden"
        />

        <DraftDocumentCard
          className={activeTask === "artifacts" && (experienceMode === "guided" || artifactPanel === "validation") ? "" : "hidden"}
          kicker="research"
          title="조사 요약"
          description="인터뷰, 경쟁/대안, 가격, 규제, 개인정보 확인 내용을 한 문서로 묶습니다."
          body={researchBriefDraft}
          rows={18}
          copyLabel="조사 요약 복사"
          onCopy={() => copyDraft(researchBriefDraft, "조사 요약")}
          onSave={() =>
            saveArtifactDraft("research_note", `${selectedIdea.name} 조사 요약`, researchBriefDraft, "workbench")
          }
          saveLabel={hasResearchBriefArtifact ? "저장 완료" : "제작 자료 저장"}
          saveDisabled={isBusy || !user || hasResearchBriefArtifact}
          disabledNote={hasResearchBriefArtifact ? "조사 요약이 저장되어 상단 상태에 반영되었습니다." : undefined}
          actionMode="hidden"
        />

        <DraftDocumentCard
          className={activeTask === "artifacts" && (experienceMode === "guided" || artifactPanel === "validation") ? "" : "hidden"}
          kicker="7일 검증"
          title="7일 검증 계획"
          description="인터뷰 모집, 대안 조사, 가격 질문, Day 7 판정 기준을 바로 실행할 수 있게 묶습니다."
          body={validationSprintDraft}
          rows={18}
          copyLabel="검증 계획 복사"
          onCopy={() => copyDraft(validationSprintDraft, "7일 검증 계획")}
          onSave={() =>
            saveArtifactDraft(
              "research_note",
              `${selectedIdea.name} 7일 검증 계획`,
              validationSprintDraft,
              "validation_sprint",
            )
          }
          saveLabel={hasValidationSprintArtifact ? "저장 완료" : "제작 자료 저장"}
          saveDisabled={isBusy || !user || hasValidationSprintArtifact}
          disabledNote={hasValidationSprintArtifact ? "7일 검증 계획이 저장되어 상단 상태에 반영되었습니다." : undefined}
          actionMode="hidden"
        />

        <div
          className={`avl-card p-4 ${
            activeTask === "artifacts" && (experienceMode === "guided" || artifactPanel === "validation") ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">근거 직접 기록</h2>
              <p className="mt-1 text-sm text-slate-500">
                인터뷰 메모, 외부 자료, 가격 신호, 경쟁 대안 관찰을 리서치 노트로 저장합니다.
              </p>
              <p className="mt-1 text-sm leading-5 text-amber-700">
                AI 시장·경쟁 자동 점검이 정리되면 이 칸도 초안으로 채워집니다. 따로 직접 조사한 내용이 없다면 비워둬도 되고,
                위에서 저장한 요약 자료와 검증 계획만으로도 다음 단계로 넘어갈 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyDraft(evidenceNoteDraft, "근거 기록")}
              className="avl-btn avl-btn-secondary px-4"
            >
              <Clipboard size={18} />
              미리보기 복사
            </button>
          </div>
          <form onSubmit={saveEvidenceNote} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
              <InputField
                label="근거 제목"
                value={evidenceDraft.title}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, title: value }))}
              />
              <InputField
                label="출처/URL/인터뷰 대상"
                value={evidenceDraft.source}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, source: value }))}
              />
              <SelectField
                label="확신도"
                value={evidenceDraft.confidence}
                options={[...evidenceConfidenceOptions]}
                labels={evidenceConfidenceLabels}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, confidence: value }))}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextArea
                label="관찰한 근거"
                value={evidenceDraft.evidence}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, evidence: value }))}
              />
              <TextArea
                label="해석과 영향"
                value={evidenceDraft.implication}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, implication: value }))}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                저장하면 AI가 저장한 자료에 리서치 노트로 남고 출시 준비도 리서치 항목에 반영됩니다.
              </p>
              <button
                type="submit"
                disabled={isBusy || !user}
                className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
              >
                <Save size={18} />
                근거 저장
              </button>
            </div>
          </form>
        </div>

        <DraftDocumentCard
          className={activeTask === "artifacts" && (experienceMode === "guided" || artifactPanel === "validation") ? "" : "hidden"}
          kicker="summary"
          title="검증 완료 요약"
          description="아이디어 요약, 조사 요약, 7일 검증 계획이 모두 저장된 뒤 마지막으로 저장하는 요약입니다."
          body={validationSummaryDraft}
          rows={16}
          copyLabel="요약 복사"
          onCopy={() => copyDraft(validationSummaryDraft, "검증 완료 요약")}
          copyDisabled={!canSaveValidationSummary}
          onSave={() =>
            saveArtifactDraft(
              "research_note",
              `${selectedIdea.name} 검증 완료 요약`,
              validationSummaryDraft,
              "validation_summary",
            )
          }
          saveLabel={hasValidationSummaryArtifact ? "저장 완료" : "검증 자료 저장"}
          saveDisabled={isBusy || !user || !canSaveValidationSummary || hasValidationSummaryArtifact}
          disabledNote={
            hasValidationSummaryArtifact
              ? "검증 완료 요약이 저장되었습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다."
              : canSaveValidationSummary
              ? undefined
              : `검증 완료 요약은 ${validationSummaryRequirements
                  .filter((requirement) => !requirement.passed)
                  .map((requirement) => requirement.label)
                  .join(", ")} 저장 후 활성화됩니다.`
          }
          actionMode="hidden"
        />

        <div
          className={`avl-card p-5 text-slate-900 ${
            activeTask === "artifacts" &&
            experienceMode !== "guided" &&
            artifactPanel === "product" &&
            hasValidationSummaryArtifact
              ? ""
              : "hidden"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="avl-kicker">다음 단계 준비</div>
              <h2 className="mt-3 text-lg font-semibold text-slate-950">AI가 기획서로 넘길 준비를 확인했습니다</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                검증 근거가 제품 요구사항으로 넘어갈 만큼 정리되었는지 먼저 확인합니다.
              </p>
              <div
                className={`border mt-4 px-4 py-3 text-sm leading-5 ${
                  nextPrdBlocker ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"
                }`}
              >
                {nextPrdBlocker ? (
                  <>
                    <span className="font-semibold">다음 보완 항목: {nextPrdBlocker.label}</span>
                    <span className="block">{nextPrdBlocker.detail}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">기획서로 넘어갈 준비가 되었습니다.</span>
                    <span className="block">검증 완료 요약을 기준으로 제품 범위를 좁혀 저장하세요.</span>
                  </>
                )}
              </div>
            </div>
            <div className="border border-slate-200 bg-white px-5 py-4 text-right text-slate-950">
              <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">
                통과 {passedPrdReadinessCount}/{prdReadinessChecks.length}
              </div>
              <div className="mt-1 text-3xl font-semibold">{prdReadinessScore}%</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {prdReadinessChecks.map((check) => (
                <div key={check.label} className="border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={18}
                    className={check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400"}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{check.label}</div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{check.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyDraft(prdHandoffDraft, "기획서 전환 전달 내용")}
              disabled={!prdHandoffDraft}
              className="avl-btn avl-btn-primary px-3 disabled:opacity-50"
            >
              <Clipboard size={16} />
                  전달 내용 복사
            </button>
            <button
              type="button"
              onClick={() =>
                saveArtifactDraft(
                  "research_note",
                  `${selectedIdea.name} 기획서 전환 전달 내용`,
                  prdHandoffDraft,
                  "prd_readiness_handoff",
                )
              }
              disabled={isBusy || !user || !prdHandoffDraft}
              className="avl-btn avl-btn-secondary px-3 disabled:opacity-50"
            >
              <Save size={16} />
              전달 내용 저장
            </button>
          </div>
        </div>

        <DraftDocumentCard
          className={
            activeTask === "artifacts" &&
            experienceMode !== "guided" &&
            artifactPanel === "product" &&
            hasValidationSummaryArtifact
              ? ""
              : "hidden"
          }
          kicker="product"
          title="제품 기획서 초안"
           description="사업성 평가, 증거, 리스크, 검증 계획, 작업 순서 결과를 바탕으로 생성되는 기획서 초안입니다."
          body={prdDraft}
          rows={18}
          copyLabel="기획서 복사"
          onCopy={copyPrdDraft}
          onSave={() => saveArtifactDraft("prd", `${selectedIdea.name} 제품 기획서`, prdDraft, "workbench")}
          saveLabel={hasPrdArtifact ? "저장 완료" : "제작 자료 저장"}
          saveDisabled={isBusy || !user || hasPrdArtifact}
          disabledNote={hasPrdArtifact ? "제품 기획서가 저장되어 상단 진행 상태에 반영되었습니다." : undefined}
        />

        <div
          className={
            activeTask === "artifacts" &&
            experienceMode !== "guided" &&
            artifactPanel === "product" &&
            hasValidationSummaryArtifact
              ? "grid gap-6 xl:grid-cols-2"
              : "hidden"
          }
        >
          <DraftDocumentCard
            className="xl:col-span-2"
            kicker="execution plan"
            title="첫 제작 범위 플랜"
            description="개발 범위를 수동 검증, 얇은 제품, AI/자동화, 출시 준비로 나눠 첫 구현이 커지지 않게 합니다."
            body={mvpSlicePlanDraft}
            rows={18}
            copyLabel="플랜 복사"
            onCopy={() => copyDraft(mvpSlicePlanDraft, "첫 제작 범위 플랜")}
            onSave={() =>
              saveArtifactDraft(
                "mvp_spec",
                `${selectedIdea.name} 첫 제작 범위 플랜`,
                mvpSlicePlanDraft,
                "mvp_slice_plan",
              )
            }
            saveLabel={hasMvpSlicePlanArtifact ? "저장 완료" : "제작 자료 저장"}
            saveDisabled={isBusy || !user || !mvpSlicePlanDraft || hasMvpSlicePlanArtifact}
            disabledNote={hasMvpSlicePlanArtifact ? "첫 제작 범위 플랜이 저장되어 상단 진행 상태에 반영되었습니다." : undefined}
          />

          <DraftDocumentCard
            kicker="spec"
            title="첫 제작 범위 초안"
            description="기획 근거, 검증 계획, 개발 점검 항목을 바탕으로 생성되는 실행 명세입니다."
            body={mvpSpecDraft}
            rows={16}
            copyLabel="명세 복사"
            onCopy={copyMvpSpecDraft}
            onSave={() => saveArtifactDraft("mvp_spec", `${selectedIdea.name} 첫 제작 범위`, mvpSpecDraft, "workbench")}
            saveLabel={hasMvpScopeArtifact ? "저장 완료" : "제작 자료 저장"}
            saveDisabled={isBusy || !user || hasMvpScopeArtifact}
            disabledNote={hasMvpScopeArtifact ? "첫 제작 범위 초안이 저장되어 상단 진행 상태에 반영되었습니다." : undefined}
          />

          <DraftDocumentCard
            kicker="launch"
            title="출시 체크리스트 초안"
             description="제작 자료, 작업 순서, 리스크, 검증 계획을 바탕으로 출시 직전 확인 항목을 정리합니다."
            body={launchChecklistDraft}
            rows={16}
            copyLabel="체크리스트 복사"
            onCopy={copyLaunchChecklistDraft}
            onSave={() =>
              saveArtifactDraft(
                "launch_checklist",
                `${selectedIdea.name} 출시 체크리스트`,
                launchChecklistDraft,
                "workbench",
              )
            }
            saveLabel={hasLaunchChecklistArtifact ? "저장 완료" : "제작 자료 저장"}
            saveDisabled={isBusy || !user || hasLaunchChecklistArtifact}
            disabledNote={hasLaunchChecklistArtifact ? "출시 체크리스트가 저장되어 상단 진행 상태에 반영되었습니다." : undefined}
          />
        </div>

        <div
          className={`avl-card p-6 ${
            activeTask === "artifacts" && experienceMode !== "guided" && artifactPanel === "library" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">AI가 저장한 자료</h2>
              <p className="mt-1 text-sm text-slate-500">선택한 협업 공간 기록에 저장된 제작 자료입니다.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                유형
                <select
                  value={artifactTypeFilter}
                  onChange={(event) => setArtifactTypeFilter(event.target.value as VentureArtifactType | "all")}
                  className="avl-select h-10 text-sm normal-case tracking-normal text-slate-800"
                >
                  <option value="all">전체 유형</option>
                  {Object.entries(artifactLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                상태
                <select
                  value={artifactStatusFilter}
                  onChange={(event) => setArtifactStatusFilter(event.target.value as VentureArtifactStatus | "all")}
                  className="avl-select h-10 text-sm normal-case tracking-normal text-slate-800"
                >
                  <option value="all">전체 상태</option>
                  {(["draft", "approved", "archived"] as VentureArtifactStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {artifactStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                출처
                <select
                  value={activeArtifactSourceFilter}
                  onChange={(event) => setArtifactSourceFilter(event.target.value)}
                  className="avl-select h-10 text-sm normal-case tracking-normal text-slate-800"
                >
                  {artifactSourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {artifactSourceFilterLabels[source]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {selectedIdea ? (
            <div className="mb-4 avl-band p-4 text-slate-900">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="avl-kicker">확인 항목</div>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">제작 전 확인할 자료</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    아이디어 검증에서 제작과 출시까지 필요한 자료를 순서대로 확인합니다.
                  </p>
                  {nextArtifactReviewItem ? (
                    <div className="border border-slate-200 bg-white mt-3 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">
                          다음 처리: {nextArtifactReviewItem.label}
                        </span>
                        <span
                          className={`avl-pill ${
                            nextArtifactReviewItem.status === "draft"
                              ? "avl-pill-warning"
                              : "avl-pill-danger"
                          }`}
                        >
                          {nextArtifactReviewItem.status === "draft" ? "승인 대기" : "생성 필요"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{nextArtifactReviewItem.detail}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{nextArtifactReviewItem.action}</p>
                    </div>
                  ) : (
                    <div className="mt-3 border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900">
                      모든 핵심 제작 자료가 확인되었습니다. 출시 판단과 배포 검증으로 넘어갈 수 있습니다.
                    </div>
                  )}
                </div>
                <div className="shrink-0 border border-slate-200 bg-white px-4 py-3 text-right text-slate-950">
                  <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">
                    승인 {approvedArtifactReviewCount}/{artifactReviewQueue.length}
                  </div>
                  <div className="mt-1 text-3xl font-semibold">{artifactReviewProgress}%</div>
                  {nextArtifactReviewItem ? (
                    <button
                      type="button"
                      onClick={() => focusArtifactReviewItem(nextArtifactReviewItem)}
                      className="avl-btn avl-btn-secondary mt-3 h-9 px-3 text-xs"
                    >
                      다음 항목 열기
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {artifactReviewQueue.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => focusArtifactReviewItem(item)}
                    className="border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-950">{item.label}</span>
                      <span
                        className={`avl-pill ${
                          item.status === "approved"
                            ? "avl-pill-success"
                            : item.status === "draft"
                              ? "avl-pill-warning"
                              : "avl-pill-danger"
                        }`}
                      >
                        {item.status === "approved" ? "승인" : item.status === "draft" ? "초안" : "없음"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {recentDevelopmentHandoffArtifacts.length > 0 ? (
            <div className="mb-4 border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="avl-kicker">전달 자료</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">최근 제작 전달 자료</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    제작 지시와 실행 계획 저장본을 먼저 보여줍니다. 최신본을 복사해 다음 제작 루프에 넘기세요.
                  </p>
                </div>
                <span className="avl-pill avl-pill-neutral">
                  {recentDevelopmentHandoffArtifacts.length}개
                </span>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {recentDevelopmentHandoffArtifacts.map((artifact) => (
                  <div key={artifact.id} className="border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-950">{artifact.title || "제목 없음"}</span>
                      <span className="avl-pill avl-pill-neutral">
                        v{artifact.version ?? 1}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {artifactSourceLabels[artifact.source || "manual"] ?? artifact.source ?? "수동"} /{" "}
                      {formatStableKoreanDate(artifact.created_at)}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(artifact.body)}
                      className="avl-btn avl-btn-secondary mt-3 px-2.5 text-xs"
                    >
                      <Clipboard size={14} />
                      전달 내용 복사
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid gap-3">
            {selectedArtifacts.length > 0 ? (
              selectedArtifacts.map((artifact) => {
                const status = artifact.status ?? "draft";
                const versionSummary = artifactVersionSummaries.get(artifact.id);
                const reviewSummary = artifactReviewSummaries.get(artifact.id);

                return (
                          <div key={artifact.id} className="avl-surface-muted p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{artifact.title || "제목 없음"}</span>
                          <span className="avl-pill avl-pill-neutral">
                            {artifactLabels[artifact.artifact_type]}
                          </span>
                          <span className={artifactStatusTone[status]}>
                            {artifactStatusLabels[status]}
                          </span>
                          <span className="avl-pill avl-pill-neutral">
                            v{artifact.version ?? 1}
                          </span>
                          {artifact.source === "filtered_implementation_run" ? (
                            <span className="avl-pill avl-pill-info">
                              필터 저장본
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {artifactSourceLabels[artifact.source || "manual"] ?? artifact.source ?? "수동"} /{" "}
                          {formatStableKoreanDate(artifact.created_at)}
                          {artifact.approved_at ? ` / 승인 ${formatStableKoreanDate(artifact.approved_at)}` : ""}
                        </div>
                        {artifact.status_note ? (
                          <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-600">점검 메모: {artifact.status_note}</p>
                        ) : null}
                        {versionSummary ? (
                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            {`v${versionSummary.previous.version ?? 1} 대비 변경: +${versionSummary.added} / -${versionSummary.removed}줄`}
                          </p>
                        ) : null}
                        {reviewSummary ? (
                          <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={artifactReviewIntensityTone[reviewSummary.intensity]}>
                                리뷰 강도 {reviewSummary.intensityLabel}
                              </span>
                              <span className="avl-pill avl-pill-neutral">
                                비교 {reviewSummary.previous ? `v${reviewSummary.previous.version ?? 1}` : "최초 버전"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-5 text-slate-600">{reviewSummary.recommendation}</p>
                            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                              <div className="border border-slate-200 bg-white px-3 py-2">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  섹션 변화
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  추가: {reviewSummary.addedSections.slice(0, 4).join(", ") || "없음"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  삭제: {reviewSummary.removedSections.slice(0, 4).join(", ") || "없음"}
                                </p>
                              </div>
                              <div className="border border-slate-200 bg-white px-3 py-2">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  승인 전 확인
                                </div>
                                <ul className="mt-1 grid gap-1 text-xs leading-5 text-slate-600">
                                  {reviewSummary.checks.slice(0, 3).map((check) => (
                                    <li key={check}>- {check}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(artifact.body)}
                          className="avl-btn avl-btn-secondary px-3 text-xs"
                        >
                          <Clipboard size={14} />
                          복사
                        </button>
                        {reviewSummary ? (
                          <button
                            type="button"
                            onClick={() => copyDraft(buildArtifactReviewMemo(artifact, reviewSummary), "제작 자료 리뷰 메모")}
                            className="avl-btn avl-btn-secondary px-3 text-xs"
                          >
                            <ClipboardList size={14} />
                            리뷰 메모
                          </button>
                        ) : null}
                        {(["draft", "approved", "archived"] as VentureArtifactStatus[]).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            onClick={() => updateArtifactStatus(artifact, nextStatus)}
                            disabled={isBusy || !canManageRecord(artifact) || status === nextStatus}
                            className="avl-btn avl-btn-secondary px-3 text-xs disabled:opacity-45"
                          >
                            {artifactStatusLabels[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      상태 메모
                      <textarea
                        value={artifactStatusNotes[artifact.id] ?? artifact.status_note ?? ""}
                        onChange={(event) =>
                          setArtifactStatusNotes((current) => ({
                            ...current,
                            [artifact.id]: event.target.value,
                          }))
                        }
                        rows={2}
                        disabled={isBusy || !canManageRecord(artifact)}
                        placeholder="승인 근거, 리뷰어 코멘트, 보관 사유"
                        className="avl-textarea mt-2 w-full resize-y text-sm normal-case leading-5 tracking-normal text-slate-800 disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                );
              })
            ) : (
                <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                {selectedArtifactRecords.length > 0 ? "현재 필터에 맞는 제작 자료가 없습니다." : "아직 저장된 제작 자료가 없습니다."}
              </div>
            )}
          </div>
        </div>

        {message ? <p className="text-sm leading-5 text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}

