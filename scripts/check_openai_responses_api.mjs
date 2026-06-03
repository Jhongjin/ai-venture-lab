import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/openai-responses-api.ts")).href;
const { postOpenAIResponsesJson } = await import(moduleUrl);

let capturedRequest = null;
globalThis.fetch = async (input, init = {}) => {
  capturedRequest = {
    body: JSON.parse(init.body),
    headers: init.headers,
    input,
    method: init.method,
  };

  return new Response(JSON.stringify({ output_text: "{\"ok\":true}" }), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
};

const { payload, response } = await postOpenAIResponsesJson({
  apiKey: "sk-test",
  body: {
    input: "hello",
    model: "gpt-5-mini",
  },
  fallback: {},
});

assert.equal(response.status, 200);
assert.deepEqual(payload, { output_text: "{\"ok\":true}" });
assert.deepEqual(capturedRequest, {
  body: {
    input: "hello",
    model: "gpt-5-mini",
  },
  headers: {
    Authorization: "Bearer sk-test",
    "Content-Type": "application/json",
  },
  input: "https://api.openai.com/v1/responses",
  method: "POST",
});

globalThis.fetch = async () =>
  new Response("not-json", {
    status: 502,
  });

const fallbackResult = await postOpenAIResponsesJson({
  apiKey: "sk-test",
  body: {},
  fallback: { fallback: true },
});

assert.deepEqual(fallbackResult.payload, { fallback: true });
assert.equal(fallbackResult.response.status, 502);

for (const routePath of [
  "src/app/api/ideas/extract/route.ts",
  "src/app/api/ideas/generate-sample/route.ts",
  "src/app/api/ideas/market-scan/route.ts",
]) {
  const source = fs.readFileSync(path.join(process.cwd(), routePath), "utf8");

  assert.equal(
    source.includes('fetch("https://api.openai.com/v1/responses"'),
    false,
    `${routePath} should call postOpenAIResponsesJson instead of direct OpenAI fetch`,
  );
  assert.equal(
    source.includes("openaiResponse.json().catch"),
    false,
    `${routePath} should use postOpenAIResponsesJson for OpenAI JSON fallback parsing`,
  );
}

console.log("OpenAI Responses API smoke passed.");
