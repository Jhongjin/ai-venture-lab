import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workspace-organization-rows.ts")).href;
const { buildDefaultWorkspaceInsertRow, defaultWorkspaceName } = await import(moduleUrl);

assert.equal(defaultWorkspaceName, "AI Venture Lab");
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

console.log("Workspace organization rows smoke passed.");
