import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/development-package-drafts.ts")).href;
const {
  appBlueprintGuideRows,
  buildDevelopmentArtifactDrafts,
  buildDevelopmentPackageDraftState,
  buildDevelopmentPackageDrafts,
  scaffoldManifestGuideRows,
} = await import(moduleUrl);

assert.deepEqual(
  appBlueprintGuideRows.map((row) => row.label),
  ["라우트/화면", "데이터/API", "테스트/배포"],
);
assert.deepEqual(
  scaffoldManifestGuideRows.map((row) => row.label),
  ["파일 트리", "환경변수", "백엔드 규칙", "검증 명령"],
);

const artifactDrafts = buildDevelopmentArtifactDrafts({
  backendDecisionDraft: "backend decision",
  backendExecutionPlanDraft: "backend checklist",
  designBriefDraft: "design brief",
  ideaName: "AI Venture Lab",
  techSpecDraft: "tech spec",
});
assert.deepEqual(
  artifactDrafts.map((draft) => draft.title),
  [
    "AI Venture Lab 백엔드 결정",
    "AI Venture Lab 백엔드 실행 체크리스트",
    "AI Venture Lab 디자인 기준",
    "AI Venture Lab 기술 명세",
  ],
);
assert.deepEqual(
  artifactDrafts.map((draft) => draft.artifactType),
  ["backend_decision", "backend_decision", "design_brief", "tech_spec"],
);
assert.deepEqual(
  artifactDrafts.map((draft) => draft.source),
  ["development_process", "development_process", "development_process", "development_process"],
);
assert.ok(artifactDrafts[1].description.includes("환경변수"));

const packageDrafts = buildDevelopmentPackageDrafts({
  appBlueprintDraft: "blueprint",
  developmentArtifactDrafts: artifactDrafts,
  developmentPlanDraft: "runbook",
  ideaName: "AI Venture Lab",
  scaffoldManifestDraft: "scaffold",
});
assert.equal(packageDrafts.length, 7);
assert.deepEqual(
  packageDrafts.slice(0, 4).map((draft) => draft.source),
  ["development_process", "development_process", "development_process", "development_process"],
);
assert.deepEqual(packageDrafts.slice(4).map((draft) => draft.source), [
  "development_process",
  "app_blueprint",
  "scaffold_manifest",
]);
assert.deepEqual(
  buildDevelopmentPackageDraftState({
    appBlueprintDraft: "blueprint",
    backendDecisionDraft: "backend decision",
    backendExecutionPlanDraft: "backend checklist",
    designBriefDraft: "design brief",
    developmentPlanDraft: "runbook",
    ideaName: "AI Venture Lab",
    scaffoldManifestDraft: "scaffold",
    techSpecDraft: "tech spec",
  }),
  {
    developmentArtifactDrafts: artifactDrafts,
    developmentPackageDrafts: packageDrafts,
  },
);
assert.deepEqual(buildDevelopmentArtifactDrafts({ backendDecisionDraft: "", backendExecutionPlanDraft: "", designBriefDraft: "", ideaName: null, techSpecDraft: "" }), []);
assert.deepEqual(
  buildDevelopmentPackageDrafts({
    appBlueprintDraft: "",
    developmentArtifactDrafts: artifactDrafts,
    developmentPlanDraft: "",
    ideaName: null,
    scaffoldManifestDraft: "",
  }),
  [],
);
assert.deepEqual(
  buildDevelopmentPackageDraftState({
    appBlueprintDraft: "",
    backendDecisionDraft: "",
    backendExecutionPlanDraft: "",
    designBriefDraft: "",
    developmentPlanDraft: "",
    ideaName: null,
    scaffoldManifestDraft: "",
    techSpecDraft: "",
  }),
  {
    developmentArtifactDrafts: [],
    developmentPackageDrafts: [],
  },
);

console.log("Development package drafts smoke passed.");
