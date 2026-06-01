import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-list-utils.ts")).href;
const {
  filterVisibleWorkbenchIdeas,
  getActiveIdeas,
  getIdeaStageRank,
  getVisibleActiveIdeaCount,
  getVisibleDiscardedIdeas,
  isDiscardedIdea,
  isIdeaStageAtOrAfter,
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

assert.deepEqual(upsertRecordById([{ id: "a", value: 1 }], { id: "a", value: 2 }), [{ id: "a", value: 2 }]);
assert.deepEqual(upsertRecordsById([{ id: "a", value: 1 }], [{ id: "b", value: 2 }]), [
  { id: "b", value: 2 },
  { id: "a", value: 1 },
]);
assert.deepEqual(upsertWorkbenchIdea([ideas[0]], ideas[1]).map((record) => record.id), ["owned-new", "shared-old"]);

console.log("Workbench list utils smoke passed.");
