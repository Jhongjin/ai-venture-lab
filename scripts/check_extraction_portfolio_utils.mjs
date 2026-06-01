import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-portfolio-utils.ts");
const source = readFileSync(modulePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildExtractionDetailItems,
  buildExtractionGateMap,
  buildExtractionPortfolioItems,
  buildExtractionPortfolioMarkdownItems,
  buildExtractionSimilarIdeaMatches,
  countExtractionPortfolioGates,
  getBulkSavableExtractionItems,
  getSecondaryExtractionPortfolioItems,
  selectRecommendedExtractionCandidate,
} = await import(moduleUrl);

function candidate({ confidence, id, name, score }) {
  return {
    confidence,
    id,
    name,
    productSurface: { label: "웹앱" },
    validationScore: score,
  };
}

function gate({ id, label, rank }) {
  return {
    id,
    label,
    nextAction: `${label} 다음 행동`,
    rank,
  };
}

const candidates = [
  candidate({ confidence: 80, id: "a", name: "A", score: 85 }),
  candidate({ confidence: 95, id: "b", name: "B", score: 70 }),
  candidate({ confidence: 70, id: "c", name: "C", score: 90 }),
];
const gatesById = new Map([
  ["a", { rank: 80 }],
  ["b", { rank: 80 }],
  ["c", { rank: 60 }],
]);
const matches = buildExtractionSimilarIdeaMatches(candidates, [{ id: "existing-b", name: "Existing B" }], (current) =>
  current.id === "b" ? { idea: { name: "Existing B" }, reason: "name overlap", score: 64 } : null,
);
assert.equal(matches.size, 1);
assert.equal(matches.get("b")?.reason, "name overlap");

const gateMap = buildExtractionGateMap({
  buildGate: (current, checks, match) => ({
    id: match ? "pivot" : checks.every((check) => check.passed) ? "proceed" : "research",
    label: current.name,
    nextAction: "next",
    rank: current.validationScore,
  }),
  buildReadiness: (current, match) => [
    { label: "score", passed: current.validationScore >= 80 },
    { label: "duplicate", passed: !match },
  ],
  candidates,
  similarIdeaMatches: matches,
});
assert.equal(gateMap.get("a")?.id, "proceed");
assert.equal(gateMap.get("b")?.id, "pivot");
assert.equal(gateMap.get("c")?.id, "proceed");

const partialGateMap = new Map(gateMap);
partialGateMap.delete("c");
const builtPortfolioItems = buildExtractionPortfolioItems({
  buildGate: (current, checks, match) => ({
    id: match ? "pivot" : checks.every((check) => check.passed) ? "proceed" : "research",
    label: current.name,
    nextAction: "next",
    rank: current.validationScore,
  }),
  buildReadiness: (current, match) => [
    { label: "score", passed: current.validationScore >= 80 },
    { label: "duplicate", passed: !match },
  ],
  candidates,
  gatesByCandidateId: partialGateMap,
  similarIdeaMatches: matches,
});
assert.deepEqual(
  builtPortfolioItems.map((item) => item.candidate.id),
  ["c", "a", "b"],
);
assert.equal(builtPortfolioItems[0].gate.id, "proceed");
assert.equal(builtPortfolioItems[1].nextGap, "저장 가능");
assert.equal(builtPortfolioItems[2].nextGap, "score");
assert.equal(builtPortfolioItems[2].readinessScore, 0);

const detailItems = buildExtractionDetailItems({
  buildGate: (current, checks, match) => ({
    id: match ? "pivot" : checks.every((check) => check.passed) ? "proceed" : "research",
    label: current.name,
    nextAction: "next",
    rank: current.validationScore,
  }),
  buildReadiness: (current, match) => [
    { label: "score", passed: current.validationScore >= 80 },
    { label: "duplicate", passed: !match },
  ],
  buildStrategyLens: (current) => [{ label: "market", score: current.validationScore, tone: "good" }],
  candidates,
  gateStyles: {
    kill: { title: "보류" },
    pivot: { title: "전환" },
    proceed: { title: "진행" },
    research: { title: "조사" },
  },
  gatesByCandidateId: partialGateMap,
  getSourceEvidence: (current) => `source:${current.id}`,
  getStrategyScore: (current) => current.validationScore - 5,
  similarIdeaMatches: matches,
});
assert.deepEqual(
  detailItems.map((item) => item.candidate.id),
  ["a", "b", "c"],
);
assert.equal(detailItems[0].gateStyle.title, "진행");
assert.equal(detailItems[1].similarIdea?.reason, "name overlap");
assert.equal(detailItems[1].nextReadinessGap?.label, "score");
assert.equal(detailItems[1].sourceEvidence, "source:b");
assert.equal(detailItems[2].extractionGate.id, "proceed");
assert.equal(detailItems[2].strategyScore, 85);

assert.equal(selectRecommendedExtractionCandidate(candidates, gatesById)?.id, "b");
assert.equal(selectRecommendedExtractionCandidate([], gatesById), null);

const portfolioItems = [
  {
    candidate: candidates[0],
    gate: gate({ id: "proceed", label: "진행 가능", rank: 100 }),
    readinessScore: 90,
    similarIdea: null,
  },
  {
    candidate: candidates[1],
    gate: gate({ id: "research", label: "추가 조사", rank: 70 }),
    readinessScore: 72,
    similarIdea: { idea: { name: "Existing B" }, score: 64 },
  },
  {
    candidate: candidates[2],
    gate: gate({ id: "pivot", label: "전환 검토", rank: 40 }),
    readinessScore: 76,
    similarIdea: null,
  },
  {
    candidate: candidate({ confidence: 60, id: "d", name: "D", score: 60 }),
    gate: gate({ id: "kill", label: "보류", rank: 10 }),
    readinessScore: 30,
    similarIdea: null,
  },
];

assert.deepEqual(
  getSecondaryExtractionPortfolioItems(portfolioItems, "a").map((item) => item.candidate.id),
  ["b", "c", "d"],
);
assert.deepEqual(
  getBulkSavableExtractionItems(portfolioItems).map((item) => item.candidate.id),
  ["a"],
);
assert.deepEqual(countExtractionPortfolioGates(portfolioItems), {
  proceed: 1,
  research: 1,
  pivot: 1,
  kill: 1,
});

const markdownItems = buildExtractionPortfolioMarkdownItems(portfolioItems.slice(0, 2), (item) =>
  item.id === "a" ? 77 : 61,
);
assert.equal(markdownItems[0].candidateName, "A");
assert.equal(markdownItems[0].strategyScore, 77);
assert.equal(markdownItems[0].similarIdeaLabel, null);
assert.equal(markdownItems[1].similarIdeaLabel, "Existing B 64%");
assert.equal(markdownItems[1].gateLabel, "추가 조사");

console.log("Extraction portfolio utils smoke passed.");
