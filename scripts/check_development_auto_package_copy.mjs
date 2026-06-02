import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const buildDeliveryUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const implementationMetadataUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;

const externalGuidePath = path.join(process.cwd(), "src/lib/external-production-package-guide.ts");
const externalGuideSource = readFileSync(externalGuidePath, "utf8").replace(
  'from "@/lib/build-delivery";',
  `from ${JSON.stringify(buildDeliveryUrl)};`,
);
const { outputText: externalGuideOutput } = ts.transpileModule(externalGuideSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: externalGuidePath,
});
const externalGuideUrl = `data:text/javascript;base64,${Buffer.from(externalGuideOutput).toString("base64")}`;

const modulePath = path.join(process.cwd(), "src/lib/development-auto-package-copy.ts");
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/external-production-package-guide";', `from ${JSON.stringify(externalGuideUrl)};`)
  .replace('from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationMetadataUrl)};`);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;

const { externalBuildToolProfiles } = await import(buildDeliveryUrl);
const { productSurfaceProfiles } = await import(productSurfaceUrl);
const {
  buildDevelopmentAutoPackageSavedMessage,
  buildDevelopmentAutoPackageSaveJobs,
  buildDevelopmentAutoPackageCopyState,
  buildDevelopmentAutopilotPreparedMessage,
  buildDevelopmentAutoWorkbenchState,
  buildDevelopmentFinalPackageDrafts,
} = await import(moduleUrl);

const input = {
  activeBuildDeliveryDetail: "Cursor 연결 파일과 시작 지시문으로 넘깁니다.",
  activeBuildDeliveryLabel: "외부 개발 도구",
  backendCandidateLabel: "Supabase",
  buildDeliveryMode: "external_tool",
  externalBuildTool: externalBuildToolProfiles.cursor,
  firstBuildBridge: {
    decisionAnchor: "첫 제작 범위를 작게 고정",
    excludeNow: ["결제", "관리자 고급 기능"],
    firstTasks: ["AI 정리 화면", "저장 연결", "완료 보고"],
    stackReason: "저장과 권한 경계가 우선입니다.",
    stackTitle: "Next.js + Supabase",
  },
  hasValidationSummaryArtifact: true,
  productSurface: productSurfaceProfiles.automation,
};

const state = buildDevelopmentAutoPackageCopyState({
  developmentAutoNote: "첫 버전은 결제 없이 진행",
  ideaName: "AI Venture Lab",
  implementationTaskDrafts: [
    {
      acceptance_criteria: "사용자가 입력하고 저장 완료 상태를 본다",
      owner_role: "builder",
      priority: "high",
      task_type: "frontend",
      title: "T-001 시작 화면",
    },
  ],
  input,
});

assert.equal(state.developmentAutoProgressSteps.length, 5);
assert.match(state.developmentAutoProgressSteps[4].label, /Cursor/);
assert.deepEqual(
  state.developmentAutoSummaryCards.map((card) => card.label),
  ["검증 결과", "결과물 형태", "화면 구조", "기술 방향", "개발 방식", "제작 범위"],
);
assert.equal(state.developmentAutoBuildBridgeCards[0].items[0], "AI 정리 화면");
assert.equal(state.developmentAutoOutputItems.length, 3);
assert.match(state.developmentAutoTaskDraftLines, /T-001 시작 화면/);
assert.match(state.developmentAutoTaskDraftLines, /프론트/);
assert.match(state.developmentAutoSummaryDraft, /# 제작 실행 요약: AI Venture Lab/);
assert.match(state.developmentAutoSummaryDraft, /첫 버전은 결제 없이 진행/);
assert.match(state.developmentAutoSummaryDraft, /Cursor/);
assert.equal(
  buildDevelopmentAutoPackageSavedMessage(),
  "제작 패키지를 저장했습니다. 실제 파일 받기와 제작 도구 연동은 최종 실행 단계에서 열립니다.",
);
assert.equal(
  buildDevelopmentAutopilotPreparedMessage({ artifactCount: 3, runCount: 2, taskCount: 4 }),
  "제작 전달 묶음을 준비했습니다. 실행 단계 2개, 제작 자료 3개, 실행 할 일 4개를 만들었습니다.",
);

const emptyState = buildDevelopmentAutoPackageCopyState({
  developmentAutoNote: "",
  ideaName: null,
  implementationTaskDrafts: [],
  input,
});
assert.equal(emptyState.developmentAutoSummaryDraft, "");
assert.match(emptyState.developmentAutoTaskDraftLines, /핵심 제작 범위/);

const workbenchState = buildDevelopmentAutoWorkbenchState({
  ...input,
  canEnterOrchestrationFromDevelopmentDocs: false,
  developmentAutoFlowState: "review",
  developmentAutoNote: "첫 버전은 결제 없이 진행",
  developmentPanel: "tasks",
  experienceMode: "guided",
  ideaName: "AI Venture Lab",
  implementationTaskDrafts: [
    {
      acceptance_criteria: "사용자가 입력하고 저장 완료 상태를 본다",
      owner_role: "builder",
      priority: "high",
      task_type: "frontend",
      title: "T-001 시작 화면",
    },
  ],
});
assert.equal(workbenchState.visibleDevelopmentPanel, "setup");
assert.equal(workbenchState.hasSavedDevelopmentAutoPackage, false);
assert.equal(workbenchState.effectiveDevelopmentAutoFlowState, "review");
assert.match(workbenchState.developmentAutoSummaryDraft, /AI Venture Lab/);

const savedWorkbenchState = buildDevelopmentAutoWorkbenchState({
  ...input,
  canEnterOrchestrationFromDevelopmentDocs: true,
  developmentAutoFlowState: "review",
  developmentAutoNote: "",
  developmentPanel: "tasks",
  experienceMode: "full",
  ideaName: "AI Venture Lab",
  implementationTaskDrafts: [],
});
assert.equal(savedWorkbenchState.visibleDevelopmentPanel, "tasks");
assert.equal(savedWorkbenchState.hasSavedDevelopmentAutoPackage, true);
assert.equal(savedWorkbenchState.effectiveDevelopmentAutoFlowState, "saved");

const finalDrafts = buildDevelopmentFinalPackageDrafts({
  agentRunPackageDraft: "## 제작 도구 전달 자료\n작업 순서",
  buildDeliveryMode: "external_tool",
  developmentAutoSummaryDraft: state.developmentAutoSummaryDraft,
  developmentPlanDraft: "## 상세 실행 계획\n검증 후 배포",
  externalBuildTool: externalBuildToolProfiles.cursor,
  ideaName: "AI Venture Lab",
  productSurface: productSurfaceProfiles.automation,
  taskDraftLines: state.developmentAutoTaskDraftLines,
});
assert.match(finalDrafts.finalDevelopmentPlanDraft, /상세 실행 계획/);
assert.match(finalDrafts.finalAgentRunPackageDraft, /# 제작 패키지: AI Venture Lab/);
assert.match(finalDrafts.externalToolRunPackageDraft, /# Cursor 시작 패키지: AI Venture Lab/);

const saveJobs = buildDevelopmentAutoPackageSaveJobs({
  designGenerationPromptDraft: "디자인 기준",
  finalAgentRunPackageDraft: finalDrafts.finalAgentRunPackageDraft,
  finalDevelopmentPlanDraft: finalDrafts.finalDevelopmentPlanDraft,
  hasAgentRunPackageArtifact: false,
  hasDesignGenerationPromptArtifact: false,
  hasDevelopmentPlanArtifact: false,
  ideaName: "AI Venture Lab",
  nextDesignBriefVersion: 2,
  nextDevRunbookVersion: 4,
});
assert.deepEqual(
  saveJobs.map((job) => [job.artifactType, job.source, job.version]),
  [
    ["design_brief", "design_generation_prompt", 2],
    ["dev_runbook", "development_process", 4],
    ["dev_runbook", "agent_run_package", 5],
  ],
);
assert.equal(saveJobs[0].title, "AI Venture Lab 디자인 기준 자료");
assert.match(saveJobs[2].statusNote, /제작 도구 전달 자료/);

const packageOnlySaveJobs = buildDevelopmentAutoPackageSaveJobs({
  designGenerationPromptDraft: "디자인 기준",
  finalAgentRunPackageDraft: finalDrafts.finalAgentRunPackageDraft,
  finalDevelopmentPlanDraft: finalDrafts.finalDevelopmentPlanDraft,
  hasAgentRunPackageArtifact: false,
  hasDesignGenerationPromptArtifact: true,
  hasDevelopmentPlanArtifact: true,
  ideaName: "AI Venture Lab",
  nextDesignBriefVersion: 2,
  nextDevRunbookVersion: 4,
});
assert.deepEqual(
  packageOnlySaveJobs.map((job) => [job.artifactType, job.source, job.version]),
  [["dev_runbook", "agent_run_package", 4]],
);

const allSavedJobs = buildDevelopmentAutoPackageSaveJobs({
  designGenerationPromptDraft: "디자인 기준",
  finalAgentRunPackageDraft: finalDrafts.finalAgentRunPackageDraft,
  finalDevelopmentPlanDraft: finalDrafts.finalDevelopmentPlanDraft,
  hasAgentRunPackageArtifact: true,
  hasDesignGenerationPromptArtifact: true,
  hasDevelopmentPlanArtifact: true,
  ideaName: "AI Venture Lab",
  nextDesignBriefVersion: 2,
  nextDevRunbookVersion: 4,
});
assert.equal(allSavedJobs.length, 0);

const internalFinalDrafts = buildDevelopmentFinalPackageDrafts({
  ...finalDrafts,
  agentRunPackageDraft: "내부 제작 자료",
  buildDeliveryMode: "venture_lab",
  developmentAutoSummaryDraft: state.developmentAutoSummaryDraft,
  developmentPlanDraft: "## 상세 실행 계획\n검증 후 배포",
  externalBuildTool: externalBuildToolProfiles.cursor,
  ideaName: "AI Venture Lab",
  productSurface: productSurfaceProfiles.automation,
  taskDraftLines: state.developmentAutoTaskDraftLines,
});
assert.equal(internalFinalDrafts.externalToolRunPackageDraft, internalFinalDrafts.finalAgentRunPackageDraft);

console.log("Development auto package copy smoke passed.");
