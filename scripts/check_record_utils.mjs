import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/record-utils.ts")).href;
const { cleanInlineText, getApiMessage, isPlainRecord, readResponseJson } = await import(moduleUrl);

assert.equal(isPlainRecord({ id: "record-1" }), true);
assert.equal(isPlainRecord(null), false);
assert.equal(isPlainRecord(["record-1"]), false);
assert.equal(cleanInlineText("  A\n\n B\tC  ", 20), "A B C");
assert.equal(getApiMessage({ error: "저장 실패" }, "기본 메시지"), "저장 실패");
assert.equal(getApiMessage({ message: "저장 완료" }, "기본 메시지"), "저장 완료");
assert.equal(getApiMessage(null, "기본 메시지"), "기본 메시지");

const readableResponse = {
  async json() {
    return { ok: true };
  },
};
const brokenResponse = {
  async json() {
    throw new Error("not json");
  },
};

assert.deepEqual(await readResponseJson(readableResponse, null), { ok: true });
assert.deepEqual(await readResponseJson(brokenResponse, { fallback: true }), { fallback: true });

console.log("Record utils smoke passed.");
