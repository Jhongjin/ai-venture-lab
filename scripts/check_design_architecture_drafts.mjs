import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function transpileModuleUrl(modulePath, replacements = []) {
  const absolutePath = path.join(process.cwd(), modulePath);
  let source = readFileSync(absolutePath, "utf8");
  for (const [from, to] of replacements) {
    source = source.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const implementationTaskMetadataUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/implementation-task-metadata.ts"),
).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const productSurfaceImplementationUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/product-surface-implementation.ts"),
).href;
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

const appBlueprintUrl = transpileModuleUrl("src/lib/app-blueprint-markdown.ts", [
  ['from "@/lib/product-surface-implementation";', `from ${JSON.stringify(productSurfaceImplementationUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const designBriefUrl = transpileModuleUrl("src/lib/design-brief-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
]);
const designPromptUrl = transpileModuleUrl("src/lib/design-generation-prompt-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/product-surface-implementation";', `from ${JSON.stringify(productSurfaceImplementationUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const scaffoldManifestUrl = transpileModuleUrl("src/lib/mvp-scaffold-manifest-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const techSpecUrl = transpileModuleUrl("src/lib/tech-spec-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const moduleUrl = transpileModuleUrl("src/lib/design-architecture-drafts.ts", [
  ['from "@/lib/app-blueprint-markdown";', `from ${JSON.stringify(appBlueprintUrl)};`],
  ['from "@/lib/design-brief-markdown";', `from ${JSON.stringify(designBriefUrl)};`],
  ['from "@/lib/design-generation-prompt-markdown";', `from ${JSON.stringify(designPromptUrl)};`],
  ['from "@/lib/mvp-scaffold-manifest-markdown";', `from ${JSON.stringify(scaffoldManifestUrl)};`],
  ['from "@/lib/tech-spec-markdown";', `from ${JSON.stringify(techSpecUrl)};`],
]);

const {
  buildAppBlueprintExperimentLines,
  buildAppBlueprintRiskLines,
  buildAppBlueprintTaskLines,
  getHighAppBlueprintRisks,
  getRecommendedAppBlueprintBackend,
} = await import(appBlueprintUrl);
const { formatDesignBriefRunOutput, getDesignBriefRun } = await import(designBriefUrl);
const {
  buildDesignGenerationExperimentLines,
  buildDesignGenerationRiskLines,
  getDesignGenerationSurfaceOpening,
  getRecommendedDesignGenerationBackend,
} = await import(designPromptUrl);
const {
  buildMvpScaffoldBackendRules,
  buildMvpScaffoldEnvLines,
  buildMvpScaffoldExperimentLines,
  getMvpScaffoldExclusions,
  getRecommendedMvpScaffoldBackend,
  usesFirebaseMvpScaffoldBackend,
} = await import(scaffoldManifestUrl);
const {
  buildTechSpecExperimentLines,
  formatTechSpecBuildOutput,
  formatTechSpecSecurityOutput,
  getTechSpecBuildRun,
  getTechSpecSecurityRun,
} = await import(techSpecUrl);
const {
  buildDesignArchitectureArtifactSaveControlStates,
  buildDesignArchitectureArtifactSaveDrafts,
  buildDesignArchitectureDraftState,
} = await import(moduleUrl);

const idea = {
  buyer: "운영팀",
  created_at: "2026-06-01T00:00:00.000Z",
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "외부 제작 도구에 전달 가능한 첫 패키지",
  one_liner: "메모를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "조직 권한과 개인정보 경계 필요",
  signal: "운영 승인과 감사 로그가 중요함",
  stage: "prototype",
  target_user: "1인 창업자",
  updated_at: "2026-06-01T00:00:00.000Z",
  willingness_to_pay: 4,
};
const state = {
  buyer: idea.buyer,
  decision: idea.decision,
  differentiation: idea.differentiation,
  frequency: idea.frequency,
  mvp_speed: idea.mvp_speed,
  next_evidence: idea.next_evidence,
  product_surface: idea.product_surface,
  problem_intensity: idea.problem_intensity,
  reachability: idea.reachability,
  regulatory_risk: idea.regulatory_risk,
  risk_summary: idea.risk_summary,
  signal: idea.signal,
  stage: idea.stage,
  willingness_to_pay: idea.willingness_to_pay,
};
const backendCandidateScores = [
  {
    cautions: ["실시간 앱 품질 도구는 직접 조합"],
    key: "supabase",
    label: "Supabase",
    score: 90,
    strengths: ["Postgres/RLS 기반 권한"],
    summary: "운영 콘솔과 조직 권한에 적합합니다.",
  },
];
const experiments = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "exp-1",
    idea_id: idea.id,
    name: "디자인 검증",
    organization_id: "org-1",
    started_at: "2026-06-02",
    ended_at: null,
    status: "running",
    success_metric: "첫 화면에서 다음 행동을 이해",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const risks = [
  {
    area: "privacy",
    created_at: "2026-06-01T00:00:00.000Z",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "민감 데이터 입력 전 목적과 삭제 경로 표시",
    organization_id: "org-1",
    severity: "high",
    status: "mitigating",
    title: "민감 데이터 노출",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const runs = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "run-1",
    idea_id: idea.id,
    objective: "디자인 기준 작성",
    organization_id: "org-1",
    owner_role: "designer",
    phase: "design",
    status: "done",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const implementationTasks = [
  {
    acceptance_criteria: "사용자가 다음 행동을 보고 저장 완료 상태를 확인한다.",
    artifact_id: null,
    blocked_reason: null,
    completed_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    done_evidence: "",
    id: "task-1",
    idea_id: idea.id,
    organization_id: "org-1",
    owner_role: "prototype-builder",
    priority: "high",
    status: "todo",
    task_type: "frontend",
    title: "T-001 워크벤치 첫 화면",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

assert.equal(getRecommendedAppBlueprintBackend(backendCandidateScores), "Supabase");
assert.equal(getRecommendedAppBlueprintBackend([]), "Supabase");
assert.equal(getRecommendedDesignGenerationBackend(backendCandidateScores), "Supabase");
assert.equal(getRecommendedDesignGenerationBackend([]), "Supabase");
assert.equal(getRecommendedMvpScaffoldBackend(backendCandidateScores), "Supabase");
assert.equal(getRecommendedMvpScaffoldBackend([]), "Supabase");
assert.equal(usesFirebaseMvpScaffoldBackend("Firebase SQL Connect"), true);
assert.equal(usesFirebaseMvpScaffoldBackend("Supabase"), false);
assert.match(getDesignGenerationSurfaceOpening({ key: "web_site" }), /랜딩\/웹사이트 첫 화면/);
assert.match(getDesignGenerationSurfaceOpening({ key: "operator_console" }), /실제 앱 첫 화면/);
assert.match(buildDesignGenerationRiskLines(risks), /민감 데이터 입력 전 목적과 삭제 경로 표시/);
assert.equal(
  buildDesignGenerationRiskLines([]),
  "- 아직 연결된 리스크가 없습니다. 개인정보, 권한, 결제, 규제 리스크를 기본 상태로 고려하세요.",
);
assert.match(buildDesignGenerationExperimentLines(experiments), /첫 화면에서 다음 행동을 이해/);
assert.equal(
  buildDesignGenerationExperimentLines([]),
  "- 아직 실험이 없습니다. 첫 화면에서 사용자가 핵심 행동을 완료했는지 측정할 수 있게 설계하세요.",
);
assert.match(getMvpScaffoldExclusions({ key: "web_site" }), /회원 계정/);
assert.match(getMvpScaffoldExclusions({ key: "operator_console" }), /마케팅 랜딩 페이지/);
assert.match(buildMvpScaffoldEnvLines(true), /FIREBASE_SERVICE_ACCOUNT_JSON/);
assert.match(buildMvpScaffoldEnvLines(false), /SUPABASE_SERVICE_ROLE_KEY/);
assert.match(buildMvpScaffoldBackendRules(true), /Firebase 규칙 초안/);
assert.match(buildMvpScaffoldBackendRules(false), /Supabase 스키마\/RLS 초안/);
assert.match(buildMvpScaffoldExperimentLines(experiments), /첫 화면에서 다음 행동을 이해/);
assert.equal(buildMvpScaffoldExperimentLines([]), "- 첫 구현 전 성공 지표를 가진 실험을 1개 이상 정의합니다.");
assert.deepEqual(
  getHighAppBlueprintRisks(risks).map((risk) => risk.id),
  ["risk-1"],
);
assert.match(buildAppBlueprintRiskLines(risks), /민감 데이터 입력 전 목적과 삭제 경로 표시/);
assert.equal(
  buildAppBlueprintRiskLines([]),
  "- 아직 등록된 리스크가 없습니다. 인증, 개인정보, 결제, 규제, 운영 장애 리스크를 먼저 적습니다.",
);
assert.match(buildAppBlueprintExperimentLines(experiments), /디자인 검증/);
assert.equal(
  buildAppBlueprintExperimentLines([]),
  "- 첫 제작 전에 5명 이상 대상 사용자에게 핵심 행동을 시켜 보는 검증 계획을 정의합니다.",
);
assert.match(buildAppBlueprintTaskLines(implementationTasks), /T-001 워크벤치 첫 화면/);
assert.match(buildAppBlueprintTaskLines([]), /범위 잠금/);
assert.equal(getDesignBriefRun(runs)?.id, "run-1");
assert.equal(getDesignBriefRun([]), undefined);
assert.equal(formatDesignBriefRunOutput({ ...runs[0], output: "모바일 상태 점검 완료" }), "모바일 상태 점검 완료");
assert.match(formatDesignBriefRunOutput(undefined), /디자인 실행 결과가 아직 없습니다/);
assert.equal(
  getTechSpecBuildRun([
    {
      ...runs[0],
      id: "run-build",
      phase: "build",
    },
    {
      ...runs[0],
      id: "run-security",
      phase: "security",
    },
  ])?.id,
  "run-build",
);
assert.equal(
  getTechSpecSecurityRun([
    {
      ...runs[0],
      id: "run-build",
      phase: "build",
    },
    {
      ...runs[0],
      id: "run-security",
      phase: "security",
    },
  ])?.id,
  "run-security",
);
assert.equal(getTechSpecBuildRun([]), undefined);
assert.match(buildTechSpecExperimentLines(experiments), /첫 화면에서 다음 행동을 이해/);
assert.equal(buildTechSpecExperimentLines([]), "- 측정 가능한 실험을 하나 정의합니다.");
assert.equal(
  formatTechSpecSecurityOutput({
    riskSummary: "조직 권한과 개인정보 경계 필요",
    securityRun: { ...runs[0], output: "보안 실행 결과", phase: "security" },
  }),
  "보안 실행 결과",
);
assert.equal(
  formatTechSpecSecurityOutput({
    riskSummary: "조직 권한과 개인정보 경계 필요",
    securityRun: undefined,
  }),
  "조직 권한과 개인정보 경계 필요",
);
assert.equal(
  formatTechSpecSecurityOutput({
    riskSummary: "",
    securityRun: undefined,
  }),
  "보안 제작 자료가 아직 없습니다.",
);
assert.equal(formatTechSpecBuildOutput({ ...runs[0], output: "데이터 모델 작성", phase: "build" }), "데이터 모델 작성");
assert.match(formatTechSpecBuildOutput(undefined), /개발 실행 결과가 아직 없습니다/);

const draftState = buildDesignArchitectureDraftState({
  backendCandidateScores,
  experiments,
  idea,
  implementationTasks,
  risks,
  runs,
  state,
});

assert.match(draftState.designBriefDraft, /# 디자인 기준: AI Venture Lab/);
assert.match(draftState.designGenerationPromptDraft, /# 디자인 생성 지시: AI Venture Lab/);
assert.match(draftState.techSpecDraft, /# 기술 명세: AI Venture Lab/);
assert.match(draftState.appBlueprintDraft, /# 앱 구조 청사진: AI Venture Lab/);
assert.match(draftState.appBlueprintDraft, /T-001 워크벤치 첫 화면/);
assert.match(draftState.scaffoldManifestDraft, /# 첫 제작 뼈대 안내서: AI Venture Lab/);

const saveDrafts = buildDesignArchitectureArtifactSaveDrafts({
  appBlueprintDraft: draftState.appBlueprintDraft,
  ideaName: idea.name,
  scaffoldManifestDraft: draftState.scaffoldManifestDraft,
});
assert.equal(saveDrafts.appBlueprintSaveDraft.artifactType, "tech_spec");
assert.equal(saveDrafts.appBlueprintSaveDraft.title, "AI Venture Lab 앱 구조 청사진");
assert.equal(saveDrafts.appBlueprintSaveDraft.source, "app_blueprint");
assert.match(saveDrafts.appBlueprintSaveDraft.body, /# 앱 구조 청사진: AI Venture Lab/);
assert.equal(saveDrafts.scaffoldManifestSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.scaffoldManifestSaveDraft.title, "AI Venture Lab 첫 제작 시작 구조");
assert.equal(saveDrafts.scaffoldManifestSaveDraft.source, "scaffold_manifest");
assert.match(saveDrafts.scaffoldManifestSaveDraft.body, /# 첫 제작 뼈대 안내서: AI Venture Lab/);
assert.deepEqual(buildDesignArchitectureArtifactSaveControlStates({
  appBlueprintSaveDraft: saveDrafts.appBlueprintSaveDraft,
  hasUser: true,
  isBusy: false,
  scaffoldManifestSaveDraft: saveDrafts.scaffoldManifestSaveDraft,
}), {
  appBlueprint: {
    disabled: false,
    label: "청사진 저장",
  },
  scaffoldManifest: {
    disabled: false,
    label: "구조 저장",
  },
});
assert.deepEqual(buildDesignArchitectureArtifactSaveControlStates({
  appBlueprintSaveDraft: null,
  hasUser: false,
  isBusy: true,
  scaffoldManifestSaveDraft: null,
}), {
  appBlueprint: {
    disabled: true,
    label: "청사진 저장",
  },
  scaffoldManifest: {
    disabled: true,
    label: "구조 저장",
  },
});
assert.ok(
  ideaWorkbenchSource.includes("designArchitectureArtifactSaveControlStates.appBlueprint.disabled"),
  "IdeaWorkbench should render app blueprint save disabled state from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("designArchitectureArtifactSaveControlStates.scaffoldManifest.disabled"),
  "IdeaWorkbench should render scaffold manifest save disabled state from shared helper.",
);

assert.deepEqual(
  buildDesignArchitectureArtifactSaveDrafts({
    appBlueprintDraft: "",
    ideaName: null,
    scaffoldManifestDraft: "",
  }),
  {
    appBlueprintSaveDraft: null,
    scaffoldManifestSaveDraft: null,
  },
);

const emptyDraftState = buildDesignArchitectureDraftState({
  backendCandidateScores: [],
  experiments: [],
  idea: null,
  implementationTasks: [],
  risks: [],
  runs: [],
  state: null,
});
assert.deepEqual(emptyDraftState, {
  appBlueprintDraft: "",
  designBriefDraft: "",
  designGenerationPromptDraft: "",
  scaffoldManifestDraft: "",
  techSpecDraft: "",
});

console.log("Design architecture drafts smoke passed.");
