import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workspace-organization-rows.ts")).href;
const {
  addableOrganizationRoles,
  buildAddOrganizationMemberParams,
  buildAttachPersonalRecordsPatch,
  buildDefaultWorkspaceInsertRow,
  buildRemoveOrganizationMemberParams,
  buildUpdateOrganizationMemberRoleParams,
  defaultWorkspaceName,
  organizationRoleLabels,
  workspaceRecordTables,
} = await import(moduleUrl);

assert.equal(defaultWorkspaceName, "AI Venture Lab");
assert.deepEqual(addableOrganizationRoles, ["member", "viewer", "admin"]);
assert.deepEqual(organizationRoleLabels, {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
  viewer: "뷰어",
});
assert.deepEqual(workspaceRecordTables, [
  "ideas",
  "risks",
  "decisions",
  "experiments",
  "orchestration_runs",
  "venture_artifacts",
  "implementation_tasks",
]);
assert.deepEqual(buildDefaultWorkspaceInsertRow({ userId: "user-1234567890" }), {
  created_by: "user-1234567890",
  name: "AI Venture Lab",
  slug: "ai-venture-lab-user-123",
});
assert.deepEqual(buildDefaultWorkspaceInsertRow({ userId: "abc" }), {
  created_by: "abc",
  name: "AI Venture Lab",
  slug: "ai-venture-lab-abc",
});
assert.deepEqual(buildAttachPersonalRecordsPatch({ organizationId: "org-1" }), {
  organization_id: "org-1",
});
assert.deepEqual(
  buildAddOrganizationMemberParams({
    email: "  teammate@example.com ",
    organizationId: "org-1",
    role: "member",
  }),
  {
    target_email: "teammate@example.com",
    target_organization_id: "org-1",
    target_role: "member",
  },
);
assert.deepEqual(
  buildUpdateOrganizationMemberRoleParams({
    organizationId: "org-1",
    role: "admin",
    userId: "user-1",
  }),
  {
    target_organization_id: "org-1",
    target_role: "admin",
    target_user_id: "user-1",
  },
);
assert.deepEqual(
  buildRemoveOrganizationMemberParams({
    organizationId: "org-1",
    userId: "user-1",
  }),
  {
    target_organization_id: "org-1",
    target_user_id: "user-1",
  },
);

console.log("Workspace organization rows smoke passed.");
