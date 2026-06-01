import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-inference.ts");
const extractionTextUrl = pathToFileURL(path.join(process.cwd(), "src/lib/extraction-text-utils.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/extraction-text-utils";',
  `from ${JSON.stringify(extractionTextUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  inferAssumptions,
  inferFirstPrototypeScope,
  inferInitialScores,
  inferKillCriteria,
  inferPricingHypothesis,
  inferRecommendation,
  inferRiskLevel,
  inferSevenDayExperiment,
  inferSuccessMetric,
  inferText,
  inferValidationQuestions,
  scoreExtractedIdea,
} = await import(moduleUrl);

const subscriptionBlock = "구독 결제 해지 비용 낭비가 매월 반복되고 사용자가 불편함을 느낌";
assert.equal(inferText(subscriptionBlock, "target"), "디지털 구독과 반복 결제가 많은 소비자");
assert.equal(inferText(subscriptionBlock, "buyer"), "문제 해결에 직접 비용을 지불할 개인 사용자");
assert.match(inferText(subscriptionBlock, "next"), /구독 내역/);
assert.equal(inferRiskLevel("금융 계좌 카드 결제 개인정보"), "높음");
assert.equal(inferRiskLevel("권한과 보안 확인 필요"), "보통");
assert.equal(inferRiskLevel("일반 업무 자동화"), "낮음");

assert.equal(inferAssumptions(subscriptionBlock, "구독 정리", "개인 사용자", "개인 사용자")[2], "구독 정리은 완전 자동화 전에 수동 운영 MVP로도 핵심 가치를 검증할 수 있다.");
assert.equal(inferValidationQuestions(subscriptionBlock, "개인 사용자", "개인 사용자").length, 4);
assert.match(inferSevenDayExperiment(subscriptionBlock, "구독 정리"), /구독 목록 수집/);
assert.match(inferKillCriteria(`${subscriptionBlock} 금융 계좌`), /필수 데이터\/권한\/규제 리스크/);
assert.match(inferFirstPrototypeScope(subscriptionBlock), /구독 목록/);
assert.match(inferPricingHypothesis(subscriptionBlock, "개인 사용자"), /절감액/);
assert.match(inferSuccessMetric(subscriptionBlock), /불필요한 구독/);

const scores = inferInitialScores(
  "비용 낭비 반복 사용자 센터 수동 리포트 콘솔 자동 AI 추천",
  "보통",
  "센터 운영팀",
);
assert.deepEqual(scores, {
  problem_intensity: 4,
  frequency: 3,
  reachability: 4,
  willingness_to_pay: 5,
  mvp_speed: 5,
  differentiation: 5,
  regulatory_risk: 3,
});

assert.equal(
  scoreExtractedIdea({
    block: "불편 낭비 반복 시간 비용 자동 안내 콘솔",
    evidenceCount: 5,
    riskLevel: "낮음",
    buyer: "구매 사용자",
  }),
  92,
);
assert.equal(inferRecommendation(76, "높음"), "리스크 선검증");
assert.equal(inferRecommendation(73, "낮음"), "우선 검증");
assert.equal(inferRecommendation(60, "낮음"), "추가 조사");
assert.equal(inferRecommendation(40, "낮음"), "보류");

console.log("Extraction inference smoke passed.");
