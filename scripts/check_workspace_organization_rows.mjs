import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workspace-organization-rows.ts")).href;
const { buildAttachPersonalRecordsPatch, buildDefaultWorkspaceInsertRow, defaultWorkspaceName, workspaceRecordTables } =
  await import(moduleUrl);

assert.equal(defaultWorkspaceName, "AI Venture Lab");
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

console.log("Workspace organization rows smoke passed.");
