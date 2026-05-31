import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-strategy-lens.ts");
const extractionTextUrl = pathToFileURL(path.join(process.cwd(), "src/lib/extraction-text-utils.ts")).href;
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/extraction-text-utils";', `from ${JSON.stringify(extractionTextUrl)};`)
  .replace(
    'import { hasNumericSignal } from "@/lib/extraction-gate";',
    'function hasNumericSignal(value) { return /\\d|명|일|%|퍼센트|건|회|만원|원/.test(value); }',
  );
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildCandidateStrategyLens, buildCandidateStrategyLensMarkdown, getCandidateStrategyScore } = await import(moduleUrl);

const candidate = {
  name: "돌봄 운영 콘솔",
  one_liner: "AI 자동 기록과 월 구독 결제로 운영 비용을 줄이는 센터 콘솔",
  target_user: "가족 보호자와 케어센터 운영자",
  buyer: "케어센터 운영팀",
  signal: "일정과 기록이 흩어져 매주 조율 시간이 낭비됨",
  risk_summary: "개인정보 보관과 권한 검증이 필요함",
  next_evidence: "보호자 5명 인터뷰와 센터 파일럿",
  firstPrototypeScope: "가족 초대, 돌봄 일정, 일일 기록, 이슈 알림",
  pricingHypothesis: "센터당 월 10만원 구독",
  riskLevel: "보통",
  validationScore: 78,
  successMetric: "보호자 5명 중 3명 이상이 조율 시간이 줄었다고 답함",
  initialScores: {
    mvp_speed: 5,
    differentiation: 4,
  },
};

const lenses = buildCandidateStrategyLens(candidate);
assert.equal(lenses.length, 6);
assert.deepEqual(
  lenses.map((lens) => lens.label),
  ["시장 신호", "수익화", "첫 제작 난이도", "도달 채널", "자동화 레버리지", "보안 부담"],
);
assert.equal(lenses.find((lens) => lens.label === "시장 신호")?.score, 84);
assert.equal(lenses.find((lens) => lens.label === "시장 신호")?.tone, "good");
assert.ok(getCandidateStrategyScore(candidate) >= 70);

const markdown = buildCandidateStrategyLensMarkdown(candidate);
assert.match(markdown, /## 사업\/제작 렌즈/);
assert.match(markdown, /종합 점수: \d+%/);
assert.match(markdown, /\| 시장 신호 \| 84% \|/);

const weakCandidate = {
  ...candidate,
  riskLevel: "높음",
  validationScore: 50,
  successMetric: "좋아졌다고 느낌",
  initialScores: {
    mvp_speed: 2,
    differentiation: 2,
  },
};
assert.equal(buildCandidateStrategyLens(weakCandidate).find((lens) => lens.label === "시장 신호")?.tone, "risk");

console.log("Extraction strategy lens smoke passed.");
