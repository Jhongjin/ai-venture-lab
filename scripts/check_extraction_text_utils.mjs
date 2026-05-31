import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/extraction-text-utils.ts")).href;
const { compactText, countKeywordHits, findLabeledValue, stripLabel } = await import(moduleUrl);

assert.equal(compactText("  고객   문의\n반복 업무  "), "고객 문의 반복 업무");
assert.equal(compactText("123456789", 4), "1234");

assert.equal(stripLabel("### 1. 아이디어: “요양보호사 운영 콘솔”"), "요양보호사 운영 콘솔");
assert.equal(stripLabel("2) 반복 결제 정리"), "반복 결제 정리");

const sourceBlock = [
  "아이디어: 반복 결제 정리",
  "타겟: 디지털 구독 사용자가 매달 놓치는 결제",
  "리스크: 결제 데이터와 계정 권한",
].join("\n");

assert.equal(findLabeledValue(sourceBlock, ["아이디어", "서비스명"]), "반복 결제 정리");
assert.equal(findLabeledValue(sourceBlock, ["타겟", "대상 사용자"]), "디지털 구독 사용자가 매달 놓치는 결제");
assert.equal(findLabeledValue(sourceBlock, ["없는 라벨"]), "");

assert.equal(countKeywordHits(sourceBlock, ["결제", "권한", "없는단어"]), 2);

console.log("Extraction text utils smoke passed.");
