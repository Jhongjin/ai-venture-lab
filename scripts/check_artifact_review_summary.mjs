import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/artifact-review-summary.ts");
const queueModuleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/artifact-review-queue.ts")).href;
const artifactLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/artifact-labels.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/artifact-labels";',
  `from ${JSON.stringify(artifactLabelsUrl)};`,
);
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");
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
  buildArtifactReviewStatusControlState,
  buildArtifactReviewStatusNoteControlState,
  buildArtifactReviewSummaryState,
  buildArtifactReviewSummaries,
  buildArtifactVersionSummaries,
  comparePreviousArtifactVersions,
  findPreviousArtifactVersion,
  formatArtifactReviewSectionPreview,
  getPreviousArtifactVersionCreatedAtTime,
  getArtifactReviewChecksPreview,
  summarizeArtifactLineChanges,
  sortPreviousArtifactVersions,
} = await import(moduleUrl);
const {
  buildArtifactReviewDevelopmentFocusMessage,
  buildArtifactReviewPanelFocusMessage,
  buildArtifactReviewProgressState,
  buildArtifactReviewQueue,
  buildArtifactReviewWorkflowState,
  buildDevelopmentPanelTabStates,
  compareArtifactsByReviewRecency,
  getLatestArtifactByType,
  getArtifactReviewRecencyTime,
  getArtifactReviewStatusDisplay,
  sortArtifactsByReviewRecency,
} = await import(queueModuleUrl);

function artifact({ body, createdAt, id, status = "draft", type = "prd", updatedAt = createdAt, version }) {
  return {
    artifact_type: type,
    body,
    created_at: createdAt,
    created_by: null,
    id,
    idea_id: "idea-1",
    organization_id: null,
    source: "workbench",
    status,
    status_note: null,
    title: `Artifact ${id}`,
    updated_at: updatedAt,
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
const recencyArtifacts = [
  artifact({
    body: "# PRD",
    createdAt: "2026-05-01T00:00:00.000Z",
    id: "older-version",
    type: "prd",
    updatedAt: "2026-05-03T00:00:00.000Z",
    version: 1,
  }),
  artifact({
    body: "# PRD",
    createdAt: "2026-05-02T00:00:00.000Z",
    id: "newer-version",
    type: "prd",
    updatedAt: "2026-05-03T00:00:00.000Z",
    version: 2,
  }),
  artifact({
    body: "# PRD",
    createdAt: "2026-05-01T00:00:00.000Z",
    id: "newest-update",
    type: "prd",
    updatedAt: "2026-05-04T00:00:00.000Z",
    version: 1,
  }),
  artifact({
    body: "# Tech",
    createdAt: "2026-05-05T00:00:00.000Z",
    id: "tech-newer",
    type: "tech_spec",
    version: 1,
  }),
];
assert.deepEqual(sortArtifactsByReviewRecency(recencyArtifacts).map((item) => item.id), [
  "tech-newer",
  "newest-update",
  "newer-version",
  "older-version",
]);
assert.equal(
  getArtifactReviewRecencyTime({ created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-04T00:00:00.000Z" }),
  Date.parse("2026-05-04T00:00:00.000Z"),
);
assert.equal(compareArtifactsByReviewRecency(recencyArtifacts[0], recencyArtifacts[2]) > 0, true);
assert.equal(compareArtifactsByReviewRecency(recencyArtifacts[2], recencyArtifacts[0]) < 0, true);
assert.equal(compareArtifactsByReviewRecency(recencyArtifacts[0], recencyArtifacts[1]) > 0, true);
assert.equal(
  compareArtifactsByReviewRecency(
    { created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-03T00:00:00.000Z", version: 1 },
    { created_at: "2026-05-02T00:00:00.000Z", updated_at: "2026-05-03T00:00:00.000Z", version: 1 },
  ),
  0,
);
assert.equal(getLatestArtifactByType(recencyArtifacts, "prd")?.id, "newest-update");
assert.equal(getLatestArtifactByType(recencyArtifacts, "mvp_spec"), null);

const currentVersionArtifact = artifact({
  body: "# Current",
  createdAt: "2026-05-05T00:00:00.000Z",
  id: "prd-current-v3",
  type: "prd",
  version: 3,
});
const previousVersionArtifacts = [
  artifact({
    body: "# Previous",
    createdAt: "2026-05-01T00:00:00.000Z",
    id: "prd-v2-older",
    type: "prd",
    version: 2,
  }),
  artifact({
    body: "# Previous",
    createdAt: "2026-05-02T00:00:00.000Z",
    id: "prd-v2-newer",
    type: "prd",
    version: 2,
  }),
  artifact({
    body: "# Previous",
    createdAt: "2026-05-03T00:00:00.000Z",
    id: "prd-v1-newer",
    type: "prd",
    version: 1,
  }),
  artifact({
    body: "# Tech",
    createdAt: "2026-05-04T00:00:00.000Z",
    id: "tech-v2",
    type: "tech_spec",
    version: 2,
  }),
  currentVersionArtifact,
];
assert.deepEqual(sortPreviousArtifactVersions(previousVersionArtifacts).map((artifact) => artifact.id), [
  "prd-current-v3",
  "tech-v2",
  "prd-v2-newer",
  "prd-v2-older",
  "prd-v1-newer",
]);
assert.equal(
  getPreviousArtifactVersionCreatedAtTime({ created_at: "2026-05-02T00:00:00.000Z" }),
  Date.parse("2026-05-02T00:00:00.000Z"),
);
assert.equal(comparePreviousArtifactVersions(previousVersionArtifacts[0], previousVersionArtifacts[1]) > 0, true);
assert.equal(comparePreviousArtifactVersions(previousVersionArtifacts[1], previousVersionArtifacts[0]) < 0, true);
assert.equal(comparePreviousArtifactVersions(previousVersionArtifacts[1], previousVersionArtifacts[2]) < 0, true);
assert.equal(comparePreviousArtifactVersions(previousVersionArtifacts[0], { created_at: "2026-05-01T00:00:00.000Z", version: 2 }), 0);
assert.equal(findPreviousArtifactVersion(currentVersionArtifact, previousVersionArtifacts)?.id, "prd-v2-newer");

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
const summaryState = buildArtifactReviewSummaryState(artifacts);
assert.equal(summaryState.artifactVersionSummaries.get("prd-v3").previous.id, "prd-v2");
assert.equal(summaryState.artifactReviewSummaries.get("prd-v3").previous.id, "prd-v2");
assert.equal(summaryState.artifactReviewSummaries.get("prd-v3").intensity, "major");
assert.equal(formatArtifactReviewSectionPreview(["A", "B", "C", "D", "E"]), "A, B, C, D");
assert.equal(formatArtifactReviewSectionPreview([]), "없음");
assert.equal(formatArtifactReviewSectionPreview(["A", "B"], 1), "A");
assert.deepEqual(getArtifactReviewChecksPreview(["a", "b", "c", "d"]), ["a", "b", "c"]);
assert.deepEqual(getArtifactReviewChecksPreview(["a", "b", "c", "d"], 2), ["a", "b"]);
assert.deepEqual(buildArtifactReviewStatusControlState({
  canManage: true,
  currentStatus: "draft",
  isBusy: false,
  nextStatus: "approved",
  statusLabel: "승인",
}), {
  disabled: false,
  label: "승인",
});
assert.deepEqual(buildArtifactReviewStatusControlState({
  canManage: true,
  currentStatus: "draft",
  isBusy: false,
  nextStatus: "draft",
  statusLabel: "초안",
}), {
  disabled: true,
  label: "초안",
});
assert.deepEqual(buildArtifactReviewStatusControlState({
  canManage: false,
  currentStatus: "draft",
  isBusy: true,
  nextStatus: "archived",
  statusLabel: "보관",
}), {
  disabled: true,
  label: "보관",
});
assert.deepEqual(buildArtifactReviewStatusNoteControlState({
  canManage: true,
  isBusy: false,
}), {
  disabled: false,
  placeholder: "승인 근거, 리뷰어 코멘트, 보관 사유",
});
assert.deepEqual(buildArtifactReviewStatusNoteControlState({
  canManage: false,
  isBusy: true,
}), {
  disabled: true,
  placeholder: "승인 근거, 리뷰어 코멘트, 보관 사유",
});

const memo = buildArtifactReviewMemo(artifacts[2], reviewSummaries.get("prd-v3"));
assert.match(memo, /이전 비교: v2/);
assert.match(memo, /리뷰 강도: 높음/);

const reviewQueue = buildArtifactReviewQueue([
  artifact({
    body: "# Idea",
    createdAt: "2026-05-05T00:00:00.000Z",
    id: "idea-approved",
    status: "approved",
    type: "idea_brief",
    version: 1,
  }),
  artifact({
    body: "# Research",
    createdAt: "2026-05-06T00:00:00.000Z",
    id: "research-approved",
    status: "approved",
    type: "research_note",
    version: 1,
  }),
  artifact({
    body: "# PRD",
    createdAt: "2026-05-07T00:00:00.000Z",
    id: "prd-draft",
    type: "prd",
    version: 1,
  }),
]);
const progressState = buildArtifactReviewProgressState(reviewQueue);
assert.equal(progressState.totalCount, 9);
assert.equal(progressState.approvedCount, 2);
assert.equal(progressState.nextItem?.id, "prd");
assert.equal(progressState.nextItem?.status, "draft");
assert.equal(progressState.progress, 22);
const workflowState = buildArtifactReviewWorkflowState([
  artifact({
    body: "# Idea",
    createdAt: "2026-05-05T00:00:00.000Z",
    id: "idea-approved",
    status: "approved",
    type: "idea_brief",
    version: 1,
  }),
  artifact({
    body: "# Research",
    createdAt: "2026-05-06T00:00:00.000Z",
    id: "research-approved",
    status: "approved",
    type: "research_note",
    version: 1,
  }),
  artifact({
    body: "# PRD",
    createdAt: "2026-05-07T00:00:00.000Z",
    id: "prd-draft",
    type: "prd",
    version: 1,
  }),
]);
assert.deepEqual(
  {
    approvedCount: workflowState.approvedCount,
    nextItemId: workflowState.nextItem?.id,
    progress: workflowState.progress,
    queueLength: workflowState.queue.length,
    totalCount: workflowState.totalCount,
  },
  { approvedCount: 2, nextItemId: "prd", progress: 22, queueLength: 9, totalCount: 9 },
);

const allApprovedProgressState = buildArtifactReviewProgressState(
  buildArtifactReviewQueue(
    [
      "idea_brief",
      "research_note",
      "prd",
      "mvp_spec",
      "backend_decision",
      "design_brief",
      "tech_spec",
      "dev_runbook",
      "launch_checklist",
    ].map((type, index) =>
      artifact({
        body: `# ${type}`,
        createdAt: `2026-05-${String(index + 8).padStart(2, "0")}T00:00:00.000Z`,
        id: `approved-${type}`,
        status: "approved",
        type,
        version: 1,
      }),
    ),
  ),
);
assert.equal(allApprovedProgressState.approvedCount, 9);
assert.equal(allApprovedProgressState.nextItem, null);
assert.equal(allApprovedProgressState.progress, 100);

const emptyProgressState = buildArtifactReviewProgressState([]);
assert.equal(emptyProgressState.approvedCount, 0);
assert.equal(emptyProgressState.nextItem, null);
assert.equal(emptyProgressState.progress, 0);
assert.deepEqual(getArtifactReviewStatusDisplay("approved"), {
  label: "승인",
  nextLabel: "승인",
  pillTone: "avl-pill-success",
});
assert.deepEqual(getArtifactReviewStatusDisplay("draft"), {
  label: "초안",
  nextLabel: "승인 대기",
  pillTone: "avl-pill-warning",
});
assert.deepEqual(getArtifactReviewStatusDisplay("missing"), {
  label: "없음",
  nextLabel: "생성 필요",
  pillTone: "avl-pill-danger",
});
assert.equal(
  buildArtifactReviewDevelopmentFocusMessage("기술 명세"),
  "기술 명세 생성을 위해 개발 프로세스 화면으로 이동했습니다.",
);
assert.equal(
  buildArtifactReviewPanelFocusMessage({ itemLabel: "제품 기획서", panel: "product" }),
  "제품 기획서 생성을 위해 기획서 화면으로 이동했습니다.",
);
assert.deepEqual(
  buildDevelopmentPanelTabStates("tasks").map(({ isActive, label, panel }) => ({ isActive, label, panel })),
  [
    { isActive: false, label: "제작 준비", panel: "setup" },
    { isActive: true, label: "실행 할 일", panel: "tasks" },
    { isActive: false, label: "완료 보고", panel: "handoff" },
  ],
);
assert.match(buildDevelopmentPanelTabStates("tasks")[1].className, /bg-white/);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !canManageRecord(artifact) || status === nextStatus}"),
  "IdeaWorkbench should render artifact status disabled state from shared review control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !canManageRecord(artifact)}"),
  "IdeaWorkbench should render artifact status note disabled state from shared review control.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactStatusControlState.disabled"),
  "IdeaWorkbench should render artifact status button disabled state from shared review control.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactStatusNoteControlState.placeholder"),
  "IdeaWorkbench should render artifact status note placeholder from shared review control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("Object.keys(developmentPanelLabels)"),
  "IdeaWorkbench should render development panel tabs from shared tab display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("developmentPanelTabStates.map"),
  "IdeaWorkbench should use shared development panel tab states.",
);

console.log("Artifact review summary smoke passed.");
