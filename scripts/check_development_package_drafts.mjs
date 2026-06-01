import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/development-package-drafts.ts")).href;
const { buildDevelopmentArtifactDrafts, buildDevelopmentPackageDrafts } = await import(moduleUrl);

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

console.log("Development package drafts smoke passed.");
