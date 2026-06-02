import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-list-utils.ts")).href;
const {
  appendRecord,
  appendRecords,
  buildDiscardIdeaPatch,
  buildRestoreIdeaPatch,
  buildWorkbenchIdeaDiscardFailedMessage,
  buildWorkbenchIdeaDiscardedMessage,
  buildWorkbenchIdeaRemovalCompletionState,
  buildWorkbenchIdeaRestoreFailedMessage,
  buildWorkbenchIdeaRestoredMessage,
  buildWorkbenchIdeaVisibilityState,
  filterVisibleWorkbenchIdeas,
  canManageWorkbenchRecord,
  getActiveIdeas,
  getIdeaDeletionRelatedTables,
  getIdeaStageRank,
  getInitialSelectedWorkbenchIdeaId,
  getInitialWorkbenchTask,
  getNextSelectedWorkbenchIdeaAfterRemoval,
  getSelectedWorkbenchIdea,
  getWorkbenchRecordAccessDisplay,
  getWorkbenchRecordAccessState,
  getWorkbenchIdeaDiscardSelectionState,
  getWorkbenchIdeaRemovalSelectionState,
  getVisibleActiveIdeaCount,
  getVisibleDiscardedIdeas,
  isWorkbenchAdminRole,
  isDiscardedIdea,
  isIdeaStageAtOrAfter,
  isRemovedWorkbenchIdeaSelected,
  mergeRecordMap,
  omitRecordKey,
  prependRecord,
  prependRecords,
  removeRecordById,
  removeRecordsByIdeaId,
  replaceRecordById,
  replaceRecordsByIdeaId,
  replaceRecordsById,
  setRecordField,
  setRecordFields,
  setRecordKey,
  sortWorkbenchIdeas,
  upsertRecordById,
  upsertRecordsById,
  upsertWorkbenchIdea,
  workbenchIdeaFilterModes,
  workbenchIdeaSelectionRequiredMessage,
  workbenchStorageConnectionRequiredMessage,
  workbenchStorageNotConfiguredMessage,
} = await import(moduleUrl);

function idea({
  access,
  createdAt,
  decision = "pending",
  id,
  name,
  stage,
}) {
  return {
    access,
    buyer: "",
    created_at: createdAt,
    created_by: null,
    decision,
    differentiation: 0,
    frequency: 0,
    id,
    mvp_speed: 0,
    name,
    next_evidence: "",
    one_liner: "",
    organization_id: null,
    problem_intensity: 0,
    product_surface: null,
    reachability: 0,
    regulatory_risk: 0,
    risk_summary: "",
    signal: "",
    stage,
    target_user: "",
    updated_at: createdAt,
    willingness_to_pay: 0,
  };
}

const ideas = [
  idea({ access: "workspace_member", createdAt: "2026-05-02T00:00:00.000Z", id: "shared-old", name: "공유 운영", stage: "prd" }),
  idea({ access: "owned", createdAt: "2026-05-04T00:00:00.000Z", id: "owned-new", name: "내 신규", stage: "score" }),
  idea({ access: "hidden", createdAt: "2026-05-05T00:00:00.000Z", id: "hidden", name: "숨김", stage: "score" }),
  idea({ access: "workspace_admin", createdAt: "2026-05-06T00:00:00.000Z", id: "admin", name: "관리 공유", stage: "launch" }),
  idea({ access: "owned", createdAt: "2026-05-07T00:00:00.000Z", decision: "kill", id: "deleted", name: "삭제", stage: "paused" }),
];
const getAccess = (record) => record.access;

assert.equal(getIdeaStageRank("intake") < getIdeaStageRank("launch"), true);
assert.equal(isIdeaStageAtOrAfter("prototype", "prd"), true);
assert.equal(isIdeaStageAtOrAfter("score", "launch"), false);
assert.equal(isDiscardedIdea(ideas[4]), true);
assert.equal(isWorkbenchAdminRole("owner"), true);
assert.equal(isWorkbenchAdminRole("admin"), true);
assert.equal(isWorkbenchAdminRole("member"), false);
assert.deepEqual(workbenchIdeaFilterModes, ["all", "mine", "read_only"]);
assert.equal(workbenchIdeaSelectionRequiredMessage, "먼저 아이디어를 선택하세요.");
assert.equal(workbenchStorageConnectionRequiredMessage, "저장 연결을 먼저 확인해 주세요.");
assert.equal(workbenchStorageNotConfiguredMessage, "저장 연결이 설정되어 있지 않습니다.");
assert.deepEqual(getIdeaDeletionRelatedTables(), [
  "telemetry_events",
  "implementation_tasks",
  "venture_artifacts",
  "orchestration_runs",
  "experiments",
  "decisions",
  "risks",
]);
assert.deepEqual(buildDiscardIdeaPatch("2026-06-01T00:00:00.000Z"), {
  decision: "kill",
  stage: "paused",
  updated_at: "2026-06-01T00:00:00.000Z",
});
assert.deepEqual(buildRestoreIdeaPatch("2026-06-01T00:00:00.000Z"), {
  decision: "research_more",
  stage: "score",
  updated_at: "2026-06-01T00:00:00.000Z",
});
assert.equal(
  buildWorkbenchIdeaDiscardFailedMessage({ errorMessage: "permission denied", ideaName: "AI Venture Lab" }),
  "AI Venture Lab 아이디어를 삭제 목록으로 옮기지 못했습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeaDiscardFailedMessage({ errorMessage: null, ideaName: "AI Venture Lab" }),
  "AI Venture Lab 아이디어를 삭제 목록으로 옮기지 못했습니다: 응답 없음",
);
assert.equal(buildWorkbenchIdeaDiscardedMessage("AI Venture Lab"), "\"AI Venture Lab\" 아이디어를 삭제 목록으로 옮겼습니다.");
assert.equal(
  buildWorkbenchIdeaRestoreFailedMessage({ errorMessage: "permission denied", ideaName: "AI Venture Lab" }),
  "AI Venture Lab 아이디어를 되살리지 못했습니다: permission denied",
);
assert.equal(buildWorkbenchIdeaRestoredMessage("AI Venture Lab"), "\"AI Venture Lab\" 아이디어를 다시 진행 목록으로 옮겼습니다.");
assert.deepEqual(getActiveIdeas(ideas).map((record) => record.id), ["shared-old", "owned-new", "hidden", "admin"]);

assert.deepEqual(
  sortWorkbenchIdeas([ideas[3], ideas[1], ideas[0]]).map((record) => record.id),
  ["owned-new", "shared-old", "admin"],
);
assert.equal(getInitialSelectedWorkbenchIdeaId(ideas, "admin"), "admin");
assert.equal(getInitialSelectedWorkbenchIdeaId(ideas, "deleted"), "hidden");
assert.equal(getInitialSelectedWorkbenchIdeaId([ideas[4]]), "");
assert.equal(getInitialWorkbenchTask(ideas), "score");
assert.equal(getInitialWorkbenchTask([ideas[4]]), "select");
assert.equal(getInitialWorkbenchTask([]), "select");
assert.deepEqual(
  {
    nextSelectedIdeaId: getWorkbenchIdeaDiscardSelectionState(ideas).nextSelectedIdea?.id,
    nextTask: getWorkbenchIdeaDiscardSelectionState(ideas).nextTask,
  },
  { nextSelectedIdeaId: "hidden", nextTask: "select" },
);
assert.deepEqual(getWorkbenchIdeaDiscardSelectionState([ideas[4]]), {
  nextSelectedIdea: null,
  nextTask: "archive",
});
assert.equal(getSelectedWorkbenchIdea(ideas, "admin")?.id, "admin");
assert.equal(getSelectedWorkbenchIdea(ideas, "missing")?.id, "shared-old");
assert.equal(getSelectedWorkbenchIdea([ideas[4]], "missing")?.id, "deleted");
assert.equal(getSelectedWorkbenchIdea([], "missing"), null);
assert.equal(
  isRemovedWorkbenchIdeaSelected({
    currentSelectedIdeaId: "owned-new",
    removedIdeaId: "owned-new",
    selectedIdeaId: "admin",
  }),
  true,
);
assert.equal(
  isRemovedWorkbenchIdeaSelected({
    currentSelectedIdeaId: "admin",
    removedIdeaId: "owned-new",
    selectedIdeaId: "admin",
  }),
  false,
);
assert.equal(
  getNextSelectedWorkbenchIdeaAfterRemoval({
    currentSelectedIdeaId: "owned-new",
    nextIdeas: ideas.filter((record) => record.id !== "owned-new"),
    removedIdeaId: "owned-new",
    selectedIdeaId: "owned-new",
  })?.id,
  "hidden",
);
assert.equal(
  getNextSelectedWorkbenchIdeaAfterRemoval({
    currentSelectedIdeaId: "admin",
    nextIdeas: ideas.filter((record) => record.id !== "shared-old"),
    removedIdeaId: "shared-old",
    selectedIdeaId: "admin",
  })?.id,
  "admin",
);
assert.equal(
  getNextSelectedWorkbenchIdeaAfterRemoval({
    currentSelectedIdeaId: "deleted",
    nextIdeas: [ideas[4]],
    removedIdeaId: "deleted",
    selectedIdeaId: "deleted",
  }),
  null,
);
assert.deepEqual(
  getWorkbenchIdeaRemovalSelectionState({
    currentSelectedIdeaId: "owned-new",
    nextIdeas: ideas.filter((record) => record.id !== "owned-new"),
    removedIdeaId: "owned-new",
    selectedIdeaId: "owned-new",
  }),
  { isRemovingSelectedIdea: true, nextSelectedIdea: ideas[2] },
);
assert.deepEqual(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: true,
    nextSelectedIdea: ideas[2],
    remainingIdeaCount: 2,
  }),
  {
    message: "\"AI Venture Lab\" 아이디어를 완전히 삭제했고, 다음 아이디어로 이동했습니다.",
    nextTask: "score",
  },
);
assert.deepEqual(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: false,
    nextSelectedIdea: ideas[2],
    remainingIdeaCount: 2,
  }),
  {
    message: "\"AI Venture Lab\" 아이디어를 완전히 삭제했고, 다음 아이디어로 이동했습니다.",
    nextTask: null,
  },
);
assert.deepEqual(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: true,
    nextSelectedIdea: null,
    remainingIdeaCount: 1,
  }),
  {
    message: "\"AI Venture Lab\" 아이디어를 완전히 삭제했습니다.",
    nextTask: "archive",
  },
);
assert.equal(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: true,
    nextSelectedIdea: null,
    remainingIdeaCount: 0,
  }).nextTask,
  "select",
);

assert.deepEqual(
  filterVisibleWorkbenchIdeas(ideas, "all", getAccess).map((record) => record.id),
  ["owned-new", "shared-old", "admin"],
);
assert.deepEqual(
  filterVisibleWorkbenchIdeas(ideas, "mine", getAccess).map((record) => record.id),
  ["owned-new"],
);
assert.deepEqual(
  filterVisibleWorkbenchIdeas(ideas, "read_only", getAccess).map((record) => record.id),
  ["shared-old", "admin"],
);
assert.equal(getVisibleActiveIdeaCount(ideas, getAccess), 3);
assert.deepEqual(getVisibleDiscardedIdeas(ideas, getAccess).map((record) => record.id), ["deleted"]);
const visibilityState = buildWorkbenchIdeaVisibilityState(ideas, "all", getAccess);
assert.deepEqual(visibilityState.visibleIdeas.map((record) => record.id), ["owned-new", "shared-old", "admin"]);
assert.deepEqual(visibilityState.discardedIdeas.map((record) => record.id), ["deleted"]);
assert.equal(visibilityState.activeVisibleIdeaCount, 3);
assert.equal(visibilityState.discardedVisibleIdeaCount, 1);

const memberships = [
  { organization_id: "org-admin", role: "admin", user_id: "viewer-1" },
  { organization_id: "org-member", role: "member", user_id: "viewer-1" },
  { organization_id: "org-other", role: "owner", user_id: "other-user" },
];
const viewer = { id: "viewer-1" };
const ownedRecord = { created_by: "viewer-1", organization_id: null };
const adminRecord = { created_by: "other-user", organization_id: "org-admin" };
const memberRecord = { created_by: "other-user", organization_id: "org-member" };
const hiddenRecord = { created_by: "other-user", organization_id: "org-other" };
assert.equal(getWorkbenchRecordAccessState({ memberships, record: ownedRecord, user: viewer }), "owned");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: adminRecord, user: viewer }), "workspace_admin");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: memberRecord, user: viewer }), "workspace_member");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: hiddenRecord, user: viewer }), "hidden");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: ownedRecord, user: null }), "hidden");
assert.equal(canManageWorkbenchRecord({ memberships, record: ownedRecord, user: viewer }), true);
assert.equal(canManageWorkbenchRecord({ memberships, record: adminRecord, user: viewer }), true);
assert.equal(canManageWorkbenchRecord({ memberships, record: memberRecord, user: viewer }), false);
assert.deepEqual(
  ["owned", "workspace_admin", "workspace_member", "hidden"].map((accessState) => {
    const display = getWorkbenchRecordAccessDisplay(accessState);
    return [display.label, display.isManageable, display.pillTone];
  }),
  [
    ["내 기록", true, "avl-pill-success"],
    ["팀 관리자", true, "avl-pill-success"],
    ["팀 기록", false, "avl-pill-neutral"],
    ["숨김", false, "avl-pill-neutral"],
  ],
);

assert.deepEqual(upsertRecordById([{ id: "a", value: 1 }], { id: "a", value: 2 }), [{ id: "a", value: 2 }]);
assert.deepEqual(upsertRecordsById([{ id: "a", value: 1 }], [{ id: "b", value: 2 }]), [
  { id: "b", value: 2 },
  { id: "a", value: 1 },
]);
assert.deepEqual(replaceRecordById([{ id: "a", value: 1 }], { id: "a", value: 2 }), [{ id: "a", value: 2 }]);
assert.deepEqual(replaceRecordById([{ id: "a", value: 1 }], { id: "b", value: 2 }), [{ id: "a", value: 1 }]);
assert.deepEqual(
  replaceRecordsById(
    [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ],
    [{ id: "b", value: 3 }],
  ),
  [
    { id: "a", value: 1 },
    { id: "b", value: 3 },
  ],
);
assert.deepEqual(prependRecord([{ id: "b" }], { id: "a" }), [{ id: "a" }, { id: "b" }]);
assert.deepEqual(prependRecords([{ id: "c" }], [{ id: "a" }, { id: "b" }]), [
  { id: "a" },
  { id: "b" },
  { id: "c" },
]);
assert.deepEqual(appendRecord([{ id: "a" }], { id: "b" }), [{ id: "a" }, { id: "b" }]);
assert.deepEqual(appendRecords([{ id: "a" }], [{ id: "b" }, { id: "c" }]), [
  { id: "a" },
  { id: "b" },
  { id: "c" },
]);
assert.deepEqual(mergeRecordMap({ a: "old", b: "keep" }, { a: "new", c: "added" }), {
  a: "new",
  b: "keep",
  c: "added",
});
assert.deepEqual(omitRecordKey({ a: "keep", b: "drop" }, "b"), { a: "keep" });
assert.deepEqual(omitRecordKey({ a: "keep" }, "missing"), { a: "keep" });
assert.deepEqual(setRecordKey({ a: "keep" }, "b", "set"), { a: "keep", b: "set" });
assert.deepEqual(setRecordKey({ a: "old" }, "a", "new"), { a: "new" });
assert.deepEqual(setRecordField({ a: "old", b: 1 }, "a", "new"), { a: "new", b: 1 });
assert.deepEqual(setRecordFields({ a: "old", b: 1 }, { a: "new" }), { a: "new", b: 1 });
assert.deepEqual(removeRecordById([{ id: "a" }, { id: "b" }], "a"), [{ id: "b" }]);
assert.deepEqual(
  removeRecordsByIdeaId(
    [
      { id: "risk-1", idea_id: "idea-1" },
      { id: "risk-2", idea_id: "idea-2" },
      { id: "global", idea_id: null },
    ],
    "idea-1",
  ),
  [
    { id: "risk-2", idea_id: "idea-2" },
    { id: "global", idea_id: null },
  ],
);
assert.deepEqual(
  replaceRecordsByIdeaId(
    [
      { id: "old-1", idea_id: "idea-1" },
      { id: "keep-1", idea_id: "idea-2" },
    ],
    "idea-1",
    [
      { id: "new-1", idea_id: "idea-1" },
      { id: "new-2", idea_id: "idea-1" },
    ],
  ),
  [
    { id: "keep-1", idea_id: "idea-2" },
    { id: "new-1", idea_id: "idea-1" },
    { id: "new-2", idea_id: "idea-1" },
  ],
);
assert.deepEqual(upsertWorkbenchIdea([ideas[0]], ideas[1]).map((record) => record.id), ["owned-new", "shared-old"]);

console.log("Workbench list utils smoke passed.");
