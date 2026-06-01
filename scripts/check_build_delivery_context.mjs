import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const { getBuildDeliveryActionPhrase, normalizeBuildDeliveryPreference, resolveBuildDeliveryContext } = await import(moduleUrl);

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

console.log("Build delivery context smoke passed.");
