import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const {
  compareBuildDeliveryPreferenceArtifactsByCreatedAt,
  getBuildDeliveryActionPhrase,
  getBuildDeliveryPreferenceArtifactTime,
  getBuildDeliveryPreferenceFromArtifacts,
  normalizeBuildDeliveryPreference,
  resolveBuildDeliveryContext,
  sortBuildDeliveryPreferenceArtifacts,
} = await import(moduleUrl);

const preference = normalizeBuildDeliveryPreference({
  mode: "external_tool",
  externalTool: "cursor",
});

const overriddenContext = resolveBuildDeliveryContext({
  finalExternalToolOverride: {
    ideaId: "idea-1",
    key: "codex",
  },
  preference,
  selectedIdeaId: "idea-1",
});
assert.equal(overriddenContext.buildDeliveryMode, "external_tool");
assert.equal(overriddenContext.persistedExternalBuildTool.key, "cursor");
assert.equal(overriddenContext.finalExternalToolOverrideKey, "codex");
assert.equal(overriddenContext.activeExternalBuildTool.key, "codex");
assert.equal(overriddenContext.hasFinalExternalToolOverride, true);
assert.equal(overriddenContext.activeBuildDeliveryPhrase, "Codex로 개발합니다");
assert.equal(overriddenContext.activeBuildDeliveryLabel, "외부 제작 도구로 개발");
assert.match(overriddenContext.activeBuildDeliveryDetail, /Codex/);

const staleOverrideContext = resolveBuildDeliveryContext({
  finalExternalToolOverride: {
    ideaId: "other-idea",
    key: "claude_code",
  },
  preference,
  selectedIdeaId: "idea-1",
});
assert.equal(staleOverrideContext.finalExternalToolOverrideKey, null);
assert.equal(staleOverrideContext.activeExternalBuildTool.key, "cursor");
assert.equal(staleOverrideContext.hasFinalExternalToolOverride, false);

const internalContext = resolveBuildDeliveryContext({
  finalExternalToolOverride: {
    ideaId: "idea-1",
    key: "antigravity",
  },
  preference: normalizeBuildDeliveryPreference({
    mode: "venture_lab",
    externalTool: "cursor",
  }),
  selectedIdeaId: "idea-1",
});
assert.equal(internalContext.buildDeliveryMode, "venture_lab");
assert.equal(internalContext.activeExternalBuildTool.key, "cursor");
assert.equal(internalContext.hasFinalExternalToolOverride, false);
assert.equal(internalContext.activeBuildDeliveryPhrase, "Venture Lab에서 계속 진행합니다");
assert.equal(internalContext.activeBuildDeliveryLabel, "Venture Lab에서 계속 진행");
assert.match(internalContext.activeBuildDeliveryDetail, /Venture Lab 안에서/);

assert.equal(
  getBuildDeliveryActionPhrase({
    buildDeliveryMode: "external_tool",
    externalToolLabel: "Cursor",
  }),
  "Cursor로 개발합니다",
);
assert.equal(
  getBuildDeliveryActionPhrase({
    buildDeliveryMode: "venture_lab",
    externalToolLabel: "Cursor",
  }),
  "Venture Lab에서 계속 진행합니다",
);

const deliveryArtifacts = [
  {
    body: "build_delivery_mode: external_tool\nexternal_tool: cursor",
    created_at: "2026-06-01T00:00:00.000Z",
    id: "older",
  },
  {
    body: "build_delivery_mode: venture_lab\nexternal_tool: codex",
    created_at: "2026-06-03T00:00:00.000Z",
    id: "newer",
  },
  {
    body: "not a delivery preference",
    created_at: "2026-06-04T00:00:00.000Z",
    id: "ignored-newest",
  },
];
assert.deepEqual(sortBuildDeliveryPreferenceArtifacts(deliveryArtifacts).map((artifact) => artifact.id), [
  "ignored-newest",
  "newer",
  "older",
]);
assert.equal(
  getBuildDeliveryPreferenceArtifactTime({ created_at: "2026-06-03T00:00:00.000Z" }),
  Date.parse("2026-06-03T00:00:00.000Z"),
);
assert.equal(getBuildDeliveryPreferenceArtifactTime({ created_at: "not-a-date" }), 0);
assert.equal(
  compareBuildDeliveryPreferenceArtifactsByCreatedAt(
    { created_at: "2026-06-01T00:00:00.000Z" },
    { created_at: "2026-06-03T00:00:00.000Z" },
  ) > 0,
  true,
);
assert.equal(
  compareBuildDeliveryPreferenceArtifactsByCreatedAt(
    { created_at: "2026-06-03T00:00:00.000Z" },
    { created_at: "2026-06-01T00:00:00.000Z" },
  ) < 0,
  true,
);
assert.equal(
  compareBuildDeliveryPreferenceArtifactsByCreatedAt(
    { created_at: "not-a-date" },
    { created_at: null },
  ),
  0,
);
assert.deepEqual(deliveryArtifacts.map((artifact) => artifact.id), ["older", "newer", "ignored-newest"]);
assert.deepEqual(getBuildDeliveryPreferenceFromArtifacts(deliveryArtifacts), {
  mode: "venture_lab",
  externalTool: "codex",
});

console.log("Build delivery context smoke passed.");
