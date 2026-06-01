import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/artifact-review-summary.ts");
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
  buildArtifactReviewMemo,
  buildArtifactReviewSummaries,
  buildArtifactVersionSummaries,
  summarizeArtifactLineChanges,
} = await import(moduleUrl);

function artifact({ body, createdAt, id, type = "prd", version }) {
  return {
    artifact_type: type,
    body,
    created_at: createdAt,
    created_by: null,
    id,
    idea_id: "idea-1",
    organization_id: null,
    source: "workbench",
    status: "draft",
    status_note: null,
    title: `Artifact ${id}`,
    updated_at: createdAt,
    version,
  };
}

const artifacts = [
  artifact({
    body: "# Problem\none\nshared",
    createdAt: "2026-05-01T00:00:00.000Z",
    id: "prd-v1",
    version: 1,
  }),
  artifact({
    body: "# Problem\n## Scope\none\nshared\ntwo",
    createdAt: "2026-05-02T00:00:00.000Z",
    id: "prd-v2",
    version: 2,
  }),
  artifact({
    body: "# Problem\n## Decision\none",
    createdAt: "2026-05-03T00:00:00.000Z",
    id: "prd-v3",
    version: 3,
  }),
  artifact({
    body: "# Tech\napi",
    createdAt: "2026-05-04T00:00:00.000Z",
    id: "tech-v1",
    type: "tech_spec",
    version: 1,
  }),
];

assert.deepEqual(summarizeArtifactLineChanges("a\nb\nb", "a\nb\nc"), { added: 1, removed: 1 });

const versionSummaries = buildArtifactVersionSummaries(artifacts);
assert.equal(versionSummaries.has("prd-v1"), false);
assert.equal(versionSummaries.get("prd-v2").previous.id, "prd-v1");
assert.deepEqual(
  { added: versionSummaries.get("prd-v2").added, removed: versionSummaries.get("prd-v2").removed },
  { added: 2, removed: 0 },
);
assert.equal(versionSummaries.get("prd-v3").previous.id, "prd-v2");
assert.equal(versionSummaries.has("tech-v1"), false);

const reviewSummaries = buildArtifactReviewSummaries(artifacts);
assert.equal(reviewSummaries.get("prd-v1").previous, null);
assert.equal(reviewSummaries.get("prd-v2").previous.id, "prd-v1");
assert.equal(reviewSummaries.get("prd-v3").previous.id, "prd-v2");
assert.equal(reviewSummaries.get("prd-v3").intensity, "major");
assert.ok(reviewSummaries.get("prd-v3").removedSections.includes("Scope"));

const memo = buildArtifactReviewMemo(artifacts[2], reviewSummaries.get("prd-v3"));
assert.match(memo, /이전 비교: v2/);
assert.match(memo, /리뷰 강도: 높음/);

console.log("Artifact review summary smoke passed.");
