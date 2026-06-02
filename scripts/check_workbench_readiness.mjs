import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-readiness-checks.ts")).href;
const {
  buildBuildReadinessChecks,
  buildDesignReadinessChecks,
  buildImplementationGateChecks,
  buildPrdReadinessChecks,
  buildWorkbenchGateReadinessState,
  buildWorkbenchStepReadinessSnapshot,
  countDoneWorkbenchRuns,
  countWorkbenchHighRiskItems,
  hasDevelopmentProcessArtifact,
  hasDoneWorkbenchRunForPhase,
  summarizeGateChecks,
} = await import(moduleUrl);

const completePrdChecks = buildPrdReadinessChecks({
  decision: "ship",
  decisionCount: 2,
  decisionLabel: "진행",
  hasCompletedExperiment: true,
  hasEvidenceCaptureArtifact: true,
  hasExperimentResultArtifact: false,
  hasIdeaBriefArtifact: true,
  hasResearchNoteArtifact: true,
  hasValidationSprintArtifact: true,
  hasValidationSummaryArtifact: true,
  highRiskCount: 1,
  missing: [],
  unresolvedHighRiskCount: 0,
});
assert.equal(completePrdChecks.length, 9);
assert.equal(summarizeGateChecks(completePrdChecks).score, 100);

const pendingDecisionChecks = buildPrdReadinessChecks({
  decision: "pending",
  decisionCount: 0,
  decisionLabel: "대기",
  hasCompletedExperiment: false,
  hasEvidenceCaptureArtifact: false,
  hasExperimentResultArtifact: false,
  hasIdeaBriefArtifact: true,
  hasResearchNoteArtifact: true,
  hasValidationSprintArtifact: true,
  hasValidationSummaryArtifact: false,
  highRiskCount: 2,
  missing: ["구매자"],
  unresolvedHighRiskCount: 1,
});
const pendingSummary = summarizeGateChecks(pendingDecisionChecks);
assert.equal(pendingSummary.nextBlocker.label, "기본 입력");
assert.equal(pendingDecisionChecks.find((check) => check.label === "판단 기록")?.passed, false);
assert.equal(pendingDecisionChecks.find((check) => check.label === "높은 리스크 통제")?.detail, "1/2개 높은 리스크가 종료되었습니다.");

const designChecks = buildDesignReadinessChecks({
  hasBackendDecisionArtifact: true,
  hasDesignBriefArtifact: false,
  hasDesignStateCoverage: false,
  hasDoneDesignRun: true,
  hasMvpSpecArtifact: true,
  hasPrdArtifact: true,
  nextEvidence: "",
  oneLiner: "반복 업무를 자동 정리합니다.",
  targetUser: "1인 창업자",
});
assert.equal(designChecks.find((check) => check.label === "핵심 여정 고정")?.passed, false);
assert.equal(designChecks.find((check) => check.label === "디자인 실행")?.passed, true);

const buildChecks = buildBuildReadinessChecks({
  hasApprovedDesignBriefArtifact: false,
  hasApprovedMvpSpecArtifact: true,
  hasApprovedPrdArtifact: false,
  hasApprovedTechSpecArtifact: true,
  hasBackendDecisionArtifact: true,
  hasBackendRulesChecklist: true,
  hasDesignBriefArtifact: true,
  hasDevRunbookArtifact: true,
  hasEnvironmentChecklist: true,
  hasMvpSlicePlanArtifact: true,
  hasMvpSpecArtifact: true,
  hasPrdArtifact: true,
  hasReleaseOpsChecklist: false,
  hasTechSpecArtifact: true,
  implementationTaskCount: 4,
  unresolvedHighRiskCount: 0,
});
assert.equal(buildChecks.find((check) => check.label === "제품 기획서 승인")?.detail, "제품 기획서 초안은 있고 승인이 필요합니다.");
assert.equal(buildChecks.find((check) => check.label === "태스크 분해")?.detail, "4개 구현 태스크로 쪼개져 있습니다.");

const implementationChecks = buildImplementationGateChecks({
  blockedTaskCount: 1,
  completedTaskCount: 2,
  completedTaskWithEvidenceCount: 1,
  hasDoneQaRun: true,
  hasDoneSecurityRun: false,
  implementationTaskCount: 3,
});
const implementationSummary = summarizeGateChecks(implementationChecks);
assert.equal(implementationChecks.find((check) => check.label === "차단된 할 일 없음")?.detail, "1개 할 일이 차단 상태입니다.");
assert.equal(implementationChecks.find((check) => check.label === "완료 증거 기록")?.passed, false);
assert.equal(implementationSummary.score, 20);

const gateStateInput = {
  blockedTaskCount: 1,
  completedTaskCount: 2,
  completedTaskWithEvidenceCount: 1,
  decision: "ship",
  decisionCount: 2,
  decisionLabel: "진행",
  experiments: [{ status: "done" }],
  hasApprovedDesignBriefArtifact: false,
  hasApprovedMvpSpecArtifact: true,
  hasApprovedPrdArtifact: false,
  hasApprovedTechSpecArtifact: true,
  hasBackendDecisionArtifact: true,
  hasBackendRulesChecklist: true,
  hasDesignBriefArtifact: false,
  hasDesignStateCoverage: false,
  hasDevRunbookArtifact: true,
  hasEditableIdeaContext: true,
  hasEnvironmentChecklist: true,
  hasEvidenceCaptureArtifact: true,
  hasExperimentResultArtifact: false,
  hasIdeaBriefArtifact: true,
  hasMvpSlicePlanArtifact: true,
  hasMvpSpecArtifact: true,
  hasPrdArtifact: true,
  hasReleaseOpsChecklist: false,
  hasResearchNoteArtifact: true,
  hasSelectedIdea: true,
  hasTechSpecArtifact: true,
  hasValidationSprintArtifact: true,
  hasValidationSummaryArtifact: true,
  implementationTaskCount: 3,
  missing: [],
  nextEvidence: "가격 신호를 확인",
  oneLiner: "반복 업무를 자동 정리합니다.",
  risks: [{ severity: "high", status: "closed" }],
  runs: [
    { phase: "design", status: "done" },
    { phase: "qa", status: "done" },
    { phase: "security", status: "running" },
  ],
  targetUser: "1인 창업자",
};
const gateState = buildWorkbenchGateReadinessState(gateStateInput);
assert.equal(gateState.prdReadinessScore, 100);
assert.equal(gateState.nextPrdBlocker, null);
assert.equal(gateState.designReadinessScore, 83);
assert.equal(gateState.nextBuildBlocker.label, "제품 기획서 승인");
assert.equal(gateState.implementationGateScore, 20);
assert.equal(gateState.passedImplementationGateCount, 1);

const emptyGateState = buildWorkbenchGateReadinessState({
  ...gateStateInput,
  hasEditableIdeaContext: false,
  hasSelectedIdea: false,
});
assert.deepEqual(emptyGateState.prdReadinessChecks, []);
assert.deepEqual(emptyGateState.designReadinessChecks, []);
assert.deepEqual(emptyGateState.buildReadinessChecks, []);
assert.deepEqual(emptyGateState.implementationGateChecks, []);
assert.equal(emptyGateState.prdReadinessScore, 0);
assert.equal(emptyGateState.buildReadinessScore, 0);

const stepReadiness = buildWorkbenchStepReadinessSnapshot({
  canEnterDevelopment: true,
  canEnterLaunch: false,
  canEnterOrchestration: true,
  experimentCount: 2,
  hasAgentRunPackageArtifact: true,
  hasDesignGenerationPromptArtifact: true,
  hasDevelopmentPlanArtifact: true,
  hasIdeaBriefArtifact: true,
  hasMarketScanArtifact: true,
  hasResearchBriefArtifact: true,
  hasValidationSprintArtifact: true,
  hasValidationSummaryArtifact: true,
  isScoreEvaluationSaved: true,
  launchReadinessScore: 67,
  nextLaunchBlockerDetail: "완료 증거를 붙이세요.",
  nextLaunchBlockerLabel: "완료 증거",
  selectedIdeaId: "idea-1",
});
assert.equal(stepReadiness.canEnterExperiment, true);
assert.equal(stepReadiness.canEnterArtifacts, true);
assert.equal(stepReadiness.canEnterDevelopment, true);
assert.equal(stepReadiness.canEnterOrchestration, true);
assert.equal(stepReadiness.canEnterLaunch, false);
assert.equal(stepReadiness.launchReadinessScore, 67);
assert.equal(stepReadiness.nextLaunchBlockerLabel, "완료 증거");
assert.equal(stepReadiness.hasAgentRunPackageArtifact, true);

const lockedArtifactsReadiness = buildWorkbenchStepReadinessSnapshot({
  ...stepReadiness,
  canEnterDevelopment: false,
  canEnterOrchestration: false,
  experimentCount: 0,
  hasMarketScanArtifact: true,
  isScoreEvaluationSaved: false,
});
assert.equal(lockedArtifactsReadiness.canEnterExperiment, false);
assert.equal(lockedArtifactsReadiness.canEnterArtifacts, false);
assert.equal(lockedArtifactsReadiness.canEnterDevelopment, false);
assert.equal(lockedArtifactsReadiness.canEnterOrchestration, false);

const riskCounts = countWorkbenchHighRiskItems([
  { severity: "low", status: "open" },
  { severity: "high", status: "closed" },
  { severity: "critical", status: "open" },
  { severity: "medium", status: "open" },
]);
assert.deepEqual(riskCounts, { highRiskCount: 2, unresolvedHighRiskCount: 1 });

const runs = [
  { phase: "design", status: "done" },
  { phase: "qa", status: "running" },
  { phase: "security", status: "done" },
];
assert.equal(hasDoneWorkbenchRunForPhase(runs, "design"), true);
assert.equal(hasDoneWorkbenchRunForPhase(runs, "qa"), false);
assert.equal(countDoneWorkbenchRuns(runs), 2);
assert.equal(hasDevelopmentProcessArtifact([{ source: "manual" }, { source: "development_process" }]), true);
assert.equal(hasDevelopmentProcessArtifact([{ source: null }]), false);

console.log("Workbench readiness smoke passed.");
