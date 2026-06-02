import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/generated-idea-slots.ts");
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/product-surface";',
  `from ${JSON.stringify(productSurfaceUrl)};`,
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
  buildExtractIdeasRequestPayload,
  buildExistingIdeaContexts,
  buildGenerateSampleIdeasRequestPayload,
  buildGeneratedIdeaSourceFromSlots,
  createExtractionRunMeta,
  formatGeneratedIdeaSource,
  generatedIdeaToExistingContext,
  getExtractIdeasUrl,
  getGenerateSampleIdeasUrl,
  mergeGeneratedIdeaSlots,
  savedIdeaToExistingContext,
} = await import(moduleUrl);

const generatedIdea = {
  title: "AI Venture Lab",
  pain: "아이디어와 대화가 흩어져 검증 자료를 매번 다시 만듭니다.",
  solution: "메모에서 사업성, 리스크, 검증 계획을 자동 정리합니다.",
  targetUser: "초기 창업자",
  buyer: "1인 창업자",
  firstValidation: "실제 메모 5개로 저장 전 품질을 확인합니다.",
  productSurface: "operator_console",
  firstBuild: "메모 입력, 후보 선택, 제작 자료 저장",
};

assert.deepEqual(generatedIdeaToExistingContext(generatedIdea), {
  name: "AI Venture Lab",
  one_liner: "메모에서 사업성, 리스크, 검증 계획을 자동 정리합니다.",
  target_user: "초기 창업자",
  buyer: "1인 창업자",
});

assert.deepEqual(
  savedIdeaToExistingContext({
    name: "Saved Idea",
    one_liner: "저장된 아이디어",
    target_user: "운영자",
    buyer: "팀장",
  }),
  {
    name: "Saved Idea",
    one_liner: "저장된 아이디어",
    target_user: "운영자",
    buyer: "팀장",
  },
);

const savedIdeas = Array.from({ length: 22 }, (_, index) => ({
  name: `Saved ${index + 1}`,
  one_liner: `저장된 아이디어 ${index + 1}`,
  target_user: "운영자",
  buyer: "팀장",
}));
const existingContexts = buildExistingIdeaContexts({
  generatedIdeas: [generatedIdea],
  savedIdeas,
});
assert.equal(existingContexts.length, 21);
assert.equal(existingContexts[0].name, "AI Venture Lab");
assert.equal(existingContexts.at(-1)?.name, "Saved 20");

const limitedContexts = buildExistingIdeaContexts({
  savedIdeas,
  savedIdeaLimit: 2,
});
assert.deepEqual(
  limitedContexts.map((context) => context.name),
  ["Saved 1", "Saved 2"],
);
assert.equal(getGenerateSampleIdeasUrl(), "/api/ideas/generate-sample");
assert.equal(getExtractIdeasUrl(), "/api/ideas/extract");
assert.deepEqual(
  buildGenerateSampleIdeasRequestPayload({ generatedIdeas: [generatedIdea], savedIdeas }).existingIdeas,
  existingContexts,
);
const extractSource = "아이디어 메모를 붙여넣고 AI가 후보를 정리합니다.";
assert.deepEqual(buildExtractIdeasRequestPayload({ source: extractSource, savedIdeas: limitedContexts }), {
  source: extractSource,
  existingIdeas: limitedContexts,
});

const sourceMarkdown = formatGeneratedIdeaSource(generatedIdea, 0);
assert.match(sourceMarkdown, /아이디어 1: AI Venture Lab/);
assert.match(sourceMarkdown, /예상 결과물: 운영 콘솔/);
assert.match(sourceMarkdown, /먼저 확인할 것: 실제 메모 5개/);

const slots = mergeGeneratedIdeaSlots({
  currentSlots: [],
  generatedIdeas: [generatedIdea],
  preserveKept: false,
});
assert.equal(slots.length, 3);
assert.equal(slots[0].idea?.title, "AI Venture Lab");
assert.equal(slots[0].kept, false);
assert.equal(buildGeneratedIdeaSourceFromSlots(slots).includes("AI Venture Lab"), true);

const meta = createExtractionRunMeta({
  engine: "openai",
  model: "gpt-test",
  sourceLength: 120,
  candidateCount: 3,
  note: "테스트 실행",
});
assert.equal(meta.engine, "openai");
assert.equal(meta.model, "gpt-test");
assert.equal(meta.sourceLength, 120);
assert.equal(meta.candidateCount, 3);
assert.equal(meta.note, "테스트 실행");
assert.match(meta.generatedAt, /^\d{4}-\d{2}-\d{2}T/);

console.log("Generated idea slots smoke passed.");
