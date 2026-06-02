import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/api-request-utils.ts")).href;
const { buildJsonPostRequestInit } = await import(moduleUrl);

assert.deepEqual(buildJsonPostRequestInit({ ideaId: "idea-1" }), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ideaId: "idea-1" }),
});

assert.deepEqual(buildJsonPostRequestInit({ ideaId: "idea-1" }, { credentials: "include" }), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ ideaId: "idea-1" }),
});

console.log("API request utils smoke passed.");
