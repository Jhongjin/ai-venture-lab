import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extracted-idea-artifact-markdown.ts");
const source = readFileSync(modulePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildExtractedIdeaArtifactBodies } = await import(moduleUrl);

const bodies = buildExtractedIdeaArtifactBodies({
  assumptions: ["반복 업무를 자동 정리하면 저장률이 오른다", "구매자는 팀 리더다"],
  buildDeliveryMarkdown: "## 제작 도구\n\n- Cursor",
  buyer: "초기 창업팀 리더",
  confidence: 82,
  evidence: ["문제 신호", "구매자 단서"],
  firstPrototypeScope: "메모 붙여넣기와 검증 패키지 저장",
  gateLabel: "진행 가능",
  gateNextAction: "검증 자료로 저장",
  killCriteria: "인터뷰 5명 중 1명도 반복 문제를 말하지 않음",
  name: "AI Venture Lab",
  nextEvidence: "첫 인터뷰 5명",
  oneLiner: "아이디어를 검증 패키지로 자동 정리합니다.",
  pricingHypothesis: "월 29달러",
  productSurfaceMarkdown: "## 결과물 형태\n\n웹앱",
  recommendation: "우선 검증",
  riskLevel: "보통",
  riskSummary: "민감 정보 가림 필요",
  sevenDayExperiment: "랜딩 페이지와 인터뷰로 검증",
  signal: "반복 업무가 많음",
  sourceBlock: "사용자 메모 [가림]",
  strategyLensMarkdown: "## 사업/제작 렌즈\n\n- 종합 점수: 76%",
  successMetric: "7일 안에 3명 대기 등록",
  targetUser: "1인 창업자",
  validationQuestions: ["어떤 반복 업무가 가장 자주 생기나요?", "현재 대안은 무엇인가요?"],
  validationRationale: "문제, 대상, 구매자 단서가 있음",
  validationScore: 81,
});

assert.match(bodies.ideaBriefBody, /# 아이디어 요약: AI Venture Lab/);
assert.match(bodies.ideaBriefBody, /검증 점수: 81\/100/);
assert.match(bodies.ideaBriefBody, /추천 판단: 진행 가능/);
assert.match(bodies.ideaBriefBody, /자동 정리하면 저장률이 오른다/);
assert.match(bodies.ideaBriefBody, /사업\/제작 렌즈/);
assert.match(bodies.ideaBriefBody, /사용자 메모 \[가림\]/);

assert.match(bodies.researchBriefBody, /# 조사 요약: AI Venture Lab/);
assert.match(bodies.researchBriefBody, /문제 신호/);
assert.match(bodies.researchBriefBody, /어떤 반복 업무가 가장 자주 생기나요/);
assert.match(bodies.researchBriefBody, /월 29달러/);
assert.match(bodies.researchBriefBody, /문제, 대상, 구매자 단서가 있음/);

assert.match(bodies.validationSprintBody, /# 7일 검증 계획: AI Venture Lab/);
assert.match(bodies.validationSprintBody, /7일 안에 3명 대기 등록/);
assert.match(bodies.validationSprintBody, /Day 1-2 모집/);
assert.match(bodies.validationSprintBody, /대상 사용자: 1인 창업자/);
assert.match(bodies.validationSprintBody, /중단: 인터뷰 5명 중 1명도 반복 문제를 말하지 않음/);

console.log("Extracted idea artifact markdown smoke passed.");
