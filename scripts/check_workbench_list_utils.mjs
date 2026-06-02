import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-list-utils.ts")).href;
const {
  buildDiscardIdeaPatch,
  buildRestoreIdeaPatch,
  filterVisibleWorkbenchIdeas,
  canManageWorkbenchRecord,
  getActiveIdeas,
  getIdeaDeletionRelatedTables,
  getIdeaStageRank,
  getWorkbenchRecordAccessDisplay,
  getWorkbenchRecordAccessState,
  getVisibleActiveIdeaCount,
  getVisibleDiscardedIdeas,
  isWorkbenchAdminRole,
  isDiscardedIdea,
  isIdeaStageAtOrAfter,
  omitRecordKey,
  replaceRecordById,
  replaceRecordsById,
  sortWorkbenchIdeas,
  upsertRecordById,
  upsertRecordsById,
  upsertWorkbenchIdea,
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
assert.deepEqual(getActiveIdeas(ideas).map((record) => record.id), ["shared-old", "owned-new", "hidden", "admin"]);

assert.deepEqual(
  sortWorkbenchIdeas([ideas[3], ideas[1], ideas[0]]).map((record) => record.id),
  ["owned-new", "shared-old", "admin"],
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
assert.deepEqual(omitRecordKey({ a: "keep", b: "drop" }, "b"), { a: "keep" });
assert.deepEqual(omitRecordKey({ a: "keep" }, "missing"), { a: "keep" });
assert.deepEqual(upsertWorkbenchIdea([ideas[0]], ideas[1]).map((record) => record.id), ["owned-new", "shared-old"]);

console.log("Workbench list utils smoke passed.");
