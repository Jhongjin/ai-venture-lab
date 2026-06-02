import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extracted-idea-artifact-rows.ts");
const artifactMarkdownUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/extracted-idea-artifact-markdown.ts"),
).href;
const buildDeliveryUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const sourceRedactionUrl = pathToFileURL(path.join(process.cwd(), "src/lib/source-redaction.ts")).href;
const source = readFileSync(modulePath, "utf8")
  .replaceAll('from "@/lib/extracted-idea-artifact-markdown";', `from ${JSON.stringify(artifactMarkdownUrl)};`)
  .replaceAll('from "@/lib/build-delivery";', `from ${JSON.stringify(buildDeliveryUrl)};`)
  .replaceAll('from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`)
  .replaceAll('from "@/lib/source-redaction";', `from ${JSON.stringify(sourceRedactionUrl)};`);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildExtractedIdeaArtifactRows, buildExtractedIdeaPackageArtifactRows } = await import(moduleUrl);
const { productSurfaceProfiles } = await import(productSurfaceUrl);

const rows = buildExtractedIdeaArtifactRows({
  artifactBodies: {
    ideaBriefBody: "# idea",
    researchBriefBody: "# research",
    validationSprintBody: "# sprint",
  },
  candidateName: "AI Venture Lab",
  ideaId: "idea-1",
  organizationId: "org-1",
});

assert.deepEqual(
  rows.map((row) => [row.artifact_type, row.source, row.title, row.body, row.status, row.version]),
  [
    ["idea_brief", "extracted_idea_package", "AI Venture Lab 아이디어 요약", "# idea", "draft", 1],
    ["research_note", "extracted_research_brief", "AI Venture Lab 조사 요약", "# research", "draft", 1],
    ["research_note", "validation_sprint", "AI Venture Lab 7일 검증 계획", "# sprint", "draft", 1],
  ],
);
assert.deepEqual(
  rows.map((row) => [row.idea_id, row.organization_id, row.status_note]),
  [
    ["idea-1", "org-1", "메모에서 찾은 아이디어를 검증 자료로 정리함"],
    ["idea-1", "org-1", "메모에서 찾은 아이디어를 검증 자료로 정리함"],
    ["idea-1", "org-1", "메모에서 찾은 아이디어를 검증 자료로 정리함"],
  ],
);

const packageRows = buildExtractedIdeaPackageArtifactRows({
  candidate: {
    id: "candidate-1",
    sourceBlock: "사용자 메모: founder@example.com 으로 연락하면 반복 보고서를 자동 정리하고 싶다고 했습니다.",
    name: "AI Venture Lab",
    one_liner: "메모에서 사업 검증 패키지를 자동으로 만듭니다.",
    target_user: "초기 창업자",
    buyer: "1인 창업자",
    signal: "매주 반복되는 사업 검증 문서 정리에 시간이 많이 듭니다.",
    risk_summary: "개인정보가 섞인 메모를 안전하게 가려야 합니다.",
    next_evidence: "실제 메모 5개로 저장 전 검증합니다.",
    confidence: 78,
    evidence: ["반복 업무", "메모 기반 정리"],
    validationScore: 76,
    initialScores: { mvp_speed: 80, differentiation: 72 },
    riskLevel: "보통",
    recommendation: "우선 검증",
    assumptions: ["사용자는 정리보다 확인을 원합니다."],
    validationQuestions: ["저장 전 요약만 보고 충분한가?"],
    sevenDayExperiment: "3명의 창업자에게 메모 정리 결과를 보여줍니다.",
    successMetric: "3명 중 2명이 다음 검증에 쓰겠다고 말함",
    killCriteria: "개인정보 가림을 신뢰하지 못하면 중단",
    firstPrototypeScope: "메모 입력, 후보 정리, 검증 패키지 저장",
    pricingHypothesis: "월 19달러",
    validationRationale: "반복 빈도와 제작 속도가 높습니다.",
    productSurface: productSurfaceProfiles.web_app,
  },
  extractionGate: { label: "진행", nextAction: "검증 패키지를 저장합니다." },
  ideaId: "idea-2",
  organizationId: null,
  strategyLensMarkdown: "## 전략 렌즈\n\n- 제작 속도: 높음",
});

assert.deepEqual(packageRows.map((row) => row.artifact_type), ["idea_brief", "research_note", "research_note"]);
assert.equal(packageRows[0].idea_id, "idea-2");
assert.equal(packageRows[0].organization_id, null);
assert.equal(packageRows[0].body.includes("자동 가림 처리"), true);
assert.equal(packageRows[0].body.includes("founder@example.com"), false);

console.log("Extracted idea artifact rows smoke passed.");
