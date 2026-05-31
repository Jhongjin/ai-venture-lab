import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/extraction-risk-utils.ts")).href;
const { inferRiskArea, inferRiskSeverity } = await import(moduleUrl);

assert.equal(inferRiskSeverity("높음"), "high");
assert.equal(inferRiskSeverity("보통"), "medium");
assert.equal(inferRiskSeverity("낮음"), "low");

assert.equal(inferRiskArea("요양 돌봄 의료 기록 권한"), "규제/개인정보");
assert.equal(inferRiskArea("결제 카드 계좌 해지 자동화"), "금융/결제");
assert.equal(inferRiskArea("대화 상담 심리 갈등 코칭"), "민감 대화/조언");
assert.equal(inferRiskArea("로컬 공유 대여 심부름 신뢰"), "신뢰/운영");
assert.equal(inferRiskArea("일반 업무 자동화 콘솔"), "제품/보안");

console.log("Extraction risk utils smoke passed.");
