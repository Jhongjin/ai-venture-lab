import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const buildDeliveryUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const implementationMetadataUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;

const externalGuidePath = path.join(process.cwd(), "src/lib/external-production-package-guide.ts");
const externalGuideSource = readFileSync(externalGuidePath, "utf8").replace(
  'from "@/lib/build-delivery";',
  `from ${JSON.stringify(buildDeliveryUrl)};`,
);
const { outputText: externalGuideOutput } = ts.transpileModule(externalGuideSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: externalGuidePath,
});
const externalGuideUrl = `data:text/javascript;base64,${Buffer.from(externalGuideOutput).toString("base64")}`;

const modulePath = path.join(process.cwd(), "src/lib/development-auto-package-copy.ts");
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/external-production-package-guide";', `from ${JSON.stringify(externalGuideUrl)};`)
  .replace('from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationMetadataUrl)};`);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;

const { externalBuildToolProfiles } = await import(buildDeliveryUrl);
const { productSurfaceProfiles } = await import(productSurfaceUrl);
const { buildDevelopmentAutoPackageCopyState } = await import(moduleUrl);

const input = {
  activeBuildDeliveryDetail: "Cursor 연결 파일과 시작 지시문으로 넘깁니다.",
  activeBuildDeliveryLabel: "외부 개발 도구",
  backendCandidateLabel: "Supabase",
  buildDeliveryMode: "external_tool",
  externalBuildTool: externalBuildToolProfiles.cursor,
  firstBuildBridge: {
    decisionAnchor: "첫 제작 범위를 작게 고정",
    excludeNow: ["결제", "관리자 고급 기능"],
    firstTasks: ["AI 정리 화면", "저장 연결", "완료 보고"],
    stackReason: "저장과 권한 경계가 우선입니다.",
    stackTitle: "Next.js + Supabase",
  },
  hasValidationSummaryArtifact: true,
  productSurface: productSurfaceProfiles.automation,
};

const state = buildDevelopmentAutoPackageCopyState({
  developmentAutoNote: "첫 버전은 결제 없이 진행",
  ideaName: "AI Venture Lab",
  implementationTaskDrafts: [
    {
      acceptance_criteria: "사용자가 입력하고 저장 완료 상태를 본다",
      owner_role: "builder",
      priority: "high",
      task_type: "frontend",
      title: "T-001 시작 화면",
    },
  ],
  input,
});

assert.equal(state.developmentAutoProgressSteps.length, 5);
assert.match(state.developmentAutoProgressSteps[4].label, /Cursor/);
assert.deepEqual(
  state.developmentAutoSummaryCards.map((card) => card.label),
  ["검증 결과", "결과물 형태", "화면 구조", "기술 방향", "개발 방식", "제작 범위"],
);
assert.equal(state.developmentAutoBuildBridgeCards[0].items[0], "AI 정리 화면");
assert.equal(state.developmentAutoOutputItems.length, 3);
assert.match(state.developmentAutoTaskDraftLines, /T-001 시작 화면/);
assert.match(state.developmentAutoTaskDraftLines, /프론트/);
assert.match(state.developmentAutoSummaryDraft, /# 제작 실행 요약: AI Venture Lab/);
assert.match(state.developmentAutoSummaryDraft, /첫 버전은 결제 없이 진행/);
assert.match(state.developmentAutoSummaryDraft, /Cursor/);

const emptyState = buildDevelopmentAutoPackageCopyState({
  developmentAutoNote: "",
  ideaName: null,
  implementationTaskDrafts: [],
  input,
});
assert.equal(emptyState.developmentAutoSummaryDraft, "");
assert.match(emptyState.developmentAutoTaskDraftLines, /핵심 제작 범위/);

console.log("Development auto package copy smoke passed.");
