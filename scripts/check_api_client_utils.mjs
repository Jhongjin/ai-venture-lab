import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/api-client.ts")).href;
const { fetchApiJson, fetchApiResponse, readApiResponseJson } = await import(moduleUrl);

const requests = [];

globalThis.fetch = async (input, init = {}) => {
  requests.push({ input, init });

  return new Response(JSON.stringify({ ok: true, method: init.method ?? "GET" }), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 202,
  });
};

const plainResponse = await fetchApiResponse("/api/plain", { method: "DELETE" });
assert.equal(plainResponse.status, 202);

const { payload, response } = await fetchApiJson({
  fallback: {},
  init: { method: "POST" },
  input: "/api/json",
});

assert.equal(response.status, 202);
assert.deepEqual(payload, { ok: true, method: "POST" });
assert.deepEqual(await readApiResponseJson(new Response(JSON.stringify({ ok: "direct" })), {}), { ok: "direct" });
assert.deepEqual(
  await readApiResponseJson(
    {
      async json() {
        throw new Error("not json");
      },
    },
    { fallback: true },
  ),
  { fallback: true },
);
assert.deepEqual(
  requests.map((request) => [request.input, request.init.method]),
  [
    ["/api/plain", "DELETE"],
    ["/api/json", "POST"],
  ],
);

function collectCodeFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectCodeFiles(entryPath);
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    return [entryPath];
  });
}

for (const filePath of collectCodeFiles(path.join(process.cwd(), "src/components"))) {
  const source = fs.readFileSync(filePath, "utf8");

  assert.equal(
    source.includes("fetch("),
    false,
    `${path.relative(process.cwd(), filePath)} should call api-client helpers instead of direct fetch`,
  );
  assert.equal(
    source.includes("readResponseJson"),
    false,
    `${path.relative(process.cwd(), filePath)} should read API JSON through api-client helpers`,
  );
}

console.log("API client utils smoke passed.");
