import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/text-match-utils.ts")).href;
const { getMatchTokens, normalizeMatchText, tokenOverlapScore } = await import(moduleUrl);

assert.equal(normalizeMatchText("  Care-OS, 결제/해지!!  "), "care os 결제 해지");
assert.equal(normalizeMatchText("AI   제작\n패키지"), "ai 제작 패키지");

assert.deepEqual([...getMatchTokens("a AI 운영 콘솔 운영")], ["ai", "운영", "콘솔"]);

assert.equal(tokenOverlapScore("요양 보호자 운영 콘솔", "보호자 운영 기록 콘솔"), 75);
assert.equal(tokenOverlapScore("반복 결제 해지", "반복 결제 해지"), 100);
assert.equal(tokenOverlapScore("", "반복 결제"), 0);
assert.equal(tokenOverlapScore("한 글자 a b", "다른 글자 c d"), 50);

console.log("Text match utils smoke passed.");
