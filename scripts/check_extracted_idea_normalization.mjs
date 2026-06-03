import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extracted-idea-normalization.ts");
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const extractionTextUrl = pathToFileURL(path.join(process.cwd(), "src/lib/extraction-text-utils.ts")).href;

const inferencePath = path.join(process.cwd(), "src/lib/extraction-inference.ts");
const inferenceSource = readFileSync(inferencePath, "utf8").replace(
  'from "@/lib/extraction-text-utils";',
  `from ${JSON.stringify(extractionTextUrl)};`,
);
const { outputText: inferenceOutput } = ts.transpileModule(inferenceSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: inferencePath,
});
const inferenceModuleUrl = `data:text/javascript;base64,${Buffer.from(inferenceOutput).toString("base64")}`;

const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`)
  .replace('from "@/lib/extraction-inference";', `from ${JSON.stringify(inferenceModuleUrl)};`)
  .replace('from "@/lib/extraction-text-utils";', `from ${JSON.stringify(extractionTextUrl)};`);

const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildAiExtractedIdeaEvidence,
  buildAiExtractedIdeaSourceBlock,
  compareExtractedIdeasByValidationStrength,
  extractIdeasFromText,
  hydrateAiExtractedIdeas,
  sortExtractedIdeasByValidationStrength,
  splitIdeaBlocks,
} = await import(moduleUrl);

const sourceText = [
  "1. 아이디어: 고객 문의 자동 정리 콘솔",
  "타겟: 쇼핑몰 CS 운영자",
  "구매자: 운영팀 리더",
  "문제: 매주 문의를 시트로 옮기느라 시간이 낭비됩니다.",
  "솔루션: 문의를 분류하고 답변 초안을 제안하는 운영 콘솔",
  "리스크: 개인정보와 권한 경계",
  "검증: 실제 문의 20건으로 분류 정확도 확인",
  "",
  "2. 아이디어: 구독 결제 정리 앱",
  "사용자: 디지털 구독이 많은 개인",
  "문제: 매월 결제 낭비가 반복됩니다.",
  "솔루션: 구독 목록을 모아 해지 후보를 보여주는 앱",
].join("\n");

const blocks = splitIdeaBlocks(sourceText);
assert.equal(blocks.length, 2);

const ideas = extractIdeasFromText(sourceText);
assert.equal(ideas.length, 2);
assert.equal(ideas[0].name, "고객 문의 자동 정리 콘솔");
assert.equal(ideas[0].target_user, "쇼핑몰 CS 운영자");
assert.equal(ideas[0].buyer, "운영팀 리더");
assert.ok(ideas[0].evidence.includes("문제 신호"));
assert.equal(ideas[0].riskLevel, "보통");
assert.ok(ideas[0].validationScore >= ideas[1].validationScore);
assert.deepEqual(
  sortExtractedIdeasByValidationStrength([
    { id: "lower", validationScore: 58, confidence: 90 },
    { id: "higher", validationScore: 78, confidence: 50 },
    { id: "tie-stronger", validationScore: 58, confidence: 95 },
  ]).map((item) => item.id),
  ["higher", "tie-stronger", "lower"],
);
assert.equal(
  compareExtractedIdeasByValidationStrength(
    { validationScore: 78, confidence: 50 },
    { validationScore: 58, confidence: 95 },
  ) < 0,
  true,
);

const aiCandidate = {
  name: "문의 정리 도우미",
  one_liner: "문의 분류와 답변 초안을 만드는 운영 콘솔",
  target_user: "쇼핑몰 CS 담당자",
  buyer: "운영팀 리더",
  signal: "반복 문의 정리 시간이 큽니다.",
  risk_summary: "개인정보 마스킹 필요",
};
const aiSourceBlock = buildAiExtractedIdeaSourceBlock({
  candidate: aiCandidate,
  name: "문의 정리 도우미",
  source: "고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만듭니다.",
});
assert.match(aiSourceBlock, /AI 아이디어: 문의 정리 도우미/);
assert.match(aiSourceBlock, /문제 신호: 반복 문의 정리 시간이 큽니다/);
assert.match(aiSourceBlock, /메모 요약 근거: 고객 문의를 매주 시트로 옮기고/);
assert.deepEqual(
  buildAiExtractedIdeaEvidence({
    buyer: "운영팀 리더",
    oneLiner: "문의 분류와 답변 초안",
    riskSummary: "개인정보 마스킹 필요",
    signal: "반복 문의 정리 시간이 큽니다.",
    targetUser: "쇼핑몰 CS 담당자",
  }),
  ["AI 문제 신호", "AI 솔루션 정리", "AI 타겟 추론", "AI 구매자 추론", "AI 리스크 추론"],
);

const hydrated = hydrateAiExtractedIdeas("고객 문의를 매주 시트로 옮기고 답변 초안을 따로 만듭니다.", [
  {
    name: "문의 정리 도우미",
    one_liner: "문의 분류와 답변 초안을 만드는 운영 콘솔",
    target_user: "쇼핑몰 CS 담당자",
    buyer: "운영팀 리더",
    signal: "반복 문의 정리 시간이 큽니다.",
    risk_summary: "개인정보 마스킹 필요",
    next_evidence: "실제 문의 20건으로 정확도 확인",
    assumptions: ["문의 데이터 접근 권한이 있다", "운영팀이 시간을 절감한다", "초안 품질을 검토할 사람이 있다"],
    validation_questions: ["주당 문의 정리 시간은?", "오답 허용 기준은?", "구매 예산은?"],
    product_surface: "operator_console",
  },
]);
assert.equal(hydrated.length, 1);
assert.equal(hydrated[0].id.startsWith("ai-0-문의 정리 도우미"), true);
assert.equal(hydrated[0].productSurface.key, "operator_console");
assert.ok(hydrated[0].evidence.includes("AI 문제 신호"));
assert.equal(hydrated[0].assumptions.length, 3);

console.log("Extracted idea normalization smoke passed.");
