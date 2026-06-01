import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/artifact-library-utils.ts");
const artifactLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/artifact-labels.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/artifact-labels";',
  `from ${JSON.stringify(artifactLabelsUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildArtifactSourceFilterLabels,
  buildArtifactSourceOptions,
  filterArtifactLibrary,
  getRecentDevelopmentHandoffArtifacts,
  resolveArtifactSourceFilter,
} = await import(moduleUrl);

function artifact({ createdAt, id, source = "manual", status = "draft", type = "prd" }) {
  return {
    artifact_type: type,
    body: `# Artifact ${id}`,
    created_at: createdAt,
    created_by: null,
    id,
    idea_id: "idea-1",
    organization_id: null,
    source,
    status,
    status_note: null,
    title: `Artifact ${id}`,
    updated_at: createdAt,
    version: 1,
  };
}

const artifacts = [
  artifact({
    createdAt: "2026-06-01T04:00:00.000Z",
    id: "handoff-filtered",
    source: "filtered_implementation_run",
    type: "dev_runbook",
  }),
  artifact({
    createdAt: "2026-06-01T03:00:00.000Z",
    id: "approved-prd",
    source: "workbench",
    status: "approved",
    type: "prd",
  }),
  artifact({
    createdAt: "2026-06-01T02:00:00.000Z",
    id: "manual-prd",
    source: "",
    type: "prd",
  }),
  artifact({
    createdAt: "2026-06-01T01:00:00.000Z",
    id: "handoff-process",
    source: "development_process",
    type: "dev_runbook",
  }),
  artifact({
    createdAt: "2026-06-01T00:00:00.000Z",
    id: "evidence",
    source: "evidence_capture",
    type: "research_note",
  }),
];

const sourceOptions = buildArtifactSourceOptions(artifacts);
assert.equal(sourceOptions[0], "all");
assert.deepEqual(sourceOptions.slice(1), [
  "development_process",
  "evidence_capture",
  "filtered_implementation_run",
  "manual",
  "workbench",
]);

const labels = buildArtifactSourceFilterLabels(sourceOptions);
assert.equal(labels.all, "전체 출처");
assert.equal(labels.filtered_implementation_run, "선별 제작 자료");
assert.equal(labels.manual, "수동");

assert.equal(resolveArtifactSourceFilter(sourceOptions, "workbench"), "workbench");
assert.equal(resolveArtifactSourceFilter(sourceOptions, "stale-source"), "all");

assert.deepEqual(
  filterArtifactLibrary({
    artifacts,
    sourceFilter: "all",
    statusFilter: "draft",
    typeFilter: "prd",
  }).map((item) => item.id),
  ["manual-prd"],
);

assert.deepEqual(
  filterArtifactLibrary({
    artifacts,
    limit: 1,
    sourceFilter: "all",
    statusFilter: "all",
    typeFilter: "dev_runbook",
  }).map((item) => item.id),
  ["handoff-filtered"],
);

assert.deepEqual(
  getRecentDevelopmentHandoffArtifacts(artifacts).map((item) => item.id),
  ["handoff-filtered", "handoff-process"],
);

console.log("Artifact library utils smoke passed.");
