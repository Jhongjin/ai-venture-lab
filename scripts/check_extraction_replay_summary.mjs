import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-replay-summary.ts");
const source = readFileSync(modulePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildExtractionReplaySummary } = await import(moduleUrl);

function candidate({ confidence, id, name, score }) {
  return {
    confidence,
    id,
    name,
    productSurface: { label: "웹앱" },
    validationScore: score,
  };
}

const rulesIdeas = [
  candidate({ confidence: 70, id: "rules-1", name: "Venture OS", score: 72 }),
  candidate({ confidence: 88, id: "rules-2", name: "Rules Only", score: 82 }),
];
const aiIdeas = [
  candidate({ confidence: 91, id: "ai-1", name: "AI Venture OS", score: 78 }),
  candidate({ confidence: 65, id: "ai-2", name: "AI Only", score: 76 }),
];

const summary = buildExtractionReplaySummary({
  aiIdeas,
  aiMode: "openai",
  findBestCandidateMatch: (rulesCandidate, pool, usedIds) => {
    const match = pool.find((item) => item.id === "ai-1" && rulesCandidate.id === "rules-1" && !usedIds.has(item.id));
    return match ? { item: match, score: 84 } : null;
  },
  model: "gpt-test",
  note: "비교 완료",
  rulesIdeas,
  sourceLength: 1024,
});

assert.equal(summary.rulesCount, 2);
assert.equal(summary.aiCount, 2);
assert.equal(summary.consensusCount, 1);
assert.equal(summary.rulesOnlyCount, 1);
assert.equal(summary.aiOnlyCount, 1);
assert.equal(summary.items[0].source, "both");
assert.equal(summary.items[0].primaryCandidate.id, "ai-1");
assert.equal(summary.items[0].matchedName, "Venture OS");
assert.equal(summary.items[1].source, "ai");
assert.equal(summary.items[2].source, "rules");
assert.equal(summary.items[0].nextAction, "두 방식이 모두 포착했습니다. 아이디어 패키지로 저장하거나 실행 보드에서 먼저 평가하세요.");

const lowScoreSummary = buildExtractionReplaySummary({
  aiIdeas: [candidate({ confidence: 99, id: "ai-low", name: "Low Match", score: 99 })],
  aiMode: "fallback",
  findBestCandidateMatch: (rulesCandidate, pool) =>
    rulesCandidate.id === "rules-1" ? { item: pool[0], score: 40 } : null,
  model: null,
  note: "낮은 유사도",
  rulesIdeas: [rulesIdeas[0]],
  sourceLength: 20,
});
assert.equal(lowScoreSummary.consensusCount, 0);
assert.equal(lowScoreSummary.rulesOnlyCount, 1);
assert.equal(lowScoreSummary.aiOnlyCount, 1);

console.log("Extraction replay summary smoke passed.");
