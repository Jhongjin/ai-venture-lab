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
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;
const moduleUrl = transpileModuleUrl("src/lib/implementation-dependency-plan.ts", [
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);

const {
  buildImplementationDependencyPlanArtifactSaveDraft,
  buildImplementationDependencyPlanDraft,
  buildImplementationDependencyPlanMarkdown,
} = await import(moduleUrl);

const timestamp = "2026-06-02T00:00:00.000Z";
const idea = {
  buyer: "운영팀",
  created_at: timestamp,
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "외부 제작 도구에서 첫 태스크 실행",
  one_liner: "메모와 대화를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "권한 경계 확인 필요",
  signal: "반복 검증과 제작 전달 자동화",
  stage: "prototype",
  target_user: "앱 아이디어를 반복 검증하는 창업자",
  updated_at: timestamp,
  willingness_to_pay: 4,
};
const state = {
  decision: idea.decision,
  stage: idea.stage,
};
const readyTask = {
  acceptance_criteria: "첫 화면에서 다음 제작 행동을 확인한다.",
  artifact_id: null,
  blocked_reason: null,
  completed_at: null,
  created_at: timestamp,
  created_by: "user-1",
  evidence: "",
  id: "task-1",
  idea_id: idea.id,
  organization_id: "org-1",
  owner_role: "prototype-builder",
  priority: "high",
  sort_order: 1,
  status: "todo",
  task_type: "frontend",
  title: "T-001 제작 패키지 리뷰 화면",
  updated_at: timestamp,
};
const doneTask = {
  ...readyTask,
  completed_at: timestamp,
  evidence: "commit abc123 / pnpm typecheck passed",
  id: "task-2",
  status: "done",
  task_type: "planning",
  title: "범위 잠금",
};
const statuses = [
  {
    blockers: [],
    completedPrerequisites: ["planning"],
    gate: "선행 조건 통과",
    missingPrerequisites: [],
    nextAction: "첫 화면 구현을 시작합니다.",
    ready: true,
    task: readyTask,
  },
  {
    blockers: [],
    completedPrerequisites: [],
    gate: "완료",
    missingPrerequisites: [],
    nextAction: "다음 태스크로 이동합니다.",
    ready: false,
    task: doneTask,
  },
];

const markdown = buildImplementationDependencyPlanMarkdown({ idea, state, statuses });
const draft = buildImplementationDependencyPlanDraft({ idea, state, statuses });

assert.equal(draft, markdown);
assert.match(draft, /# 개발 실행 순서 점검: AI Venture Lab/);
assert.match(draft, /T-001 제작 패키지 리뷰 화면/);
assert.match(draft, /첫 화면 구현을 시작합니다/);
const saveDraft = buildImplementationDependencyPlanArtifactSaveDraft({
  body: draft,
  ideaName: idea.name,
});
assert.equal(saveDraft.artifactType, "dev_runbook");
assert.equal(saveDraft.title, "AI Venture Lab 개발 실행 순서 점검");
assert.equal(saveDraft.source, "implementation_dependency_plan");
assert.match(saveDraft.body, /# 개발 실행 순서 점검: AI Venture Lab/);
assert.equal(buildImplementationDependencyPlanArtifactSaveDraft({ body: "", ideaName: null }), null);
assert.equal(buildImplementationDependencyPlanDraft({ idea: null, state: null, statuses }), "");

console.log("Implementation dependency plan smoke passed.");
