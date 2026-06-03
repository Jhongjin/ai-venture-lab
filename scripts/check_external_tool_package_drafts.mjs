import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function transpileToDataUrl(source, fileName) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName,
  });

  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const recordUtilsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/record-utils.ts")).href;
const downloadFileNameUrl = pathToFileURL(path.join(process.cwd(), "src/lib/download-file-name.ts")).href;
const implementationMetadataUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const cliScriptsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-cli-scripts.ts")).href;
const connectorConfigUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-connector-config.ts")).href;
const cursorMcpServerUrl = pathToFileURL(path.join(process.cwd(), "src/lib/cursor-mcp-server-script.ts")).href;

const externalProgressPath = path.join(process.cwd(), "src/lib/external-progress-import.ts");
const externalProgressSource = readFileSync(externalProgressPath, "utf8").replace(
  'from "@/lib/record-utils";',
  `from ${JSON.stringify(recordUtilsUrl)};`,
);
const externalProgressUrl = transpileToDataUrl(externalProgressSource, externalProgressPath);

const handoffPath = path.join(process.cwd(), "src/lib/external-tool-handoff-markdown.ts");
const handoffSource = readFileSync(handoffPath, "utf8")
  .replace('from "@/lib/download-file-name";', `from ${JSON.stringify(downloadFileNameUrl)};`)
  .replace('from "@/lib/external-progress-import";', `from ${JSON.stringify(externalProgressUrl)};`)
  .replace('from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationMetadataUrl)};`);
const handoffUrl = transpileToDataUrl(handoffSource, handoffPath);

const modulePath = path.join(process.cwd(), "src/lib/external-tool-package-drafts.ts");
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/external-tool-cli-scripts";', `from ${JSON.stringify(cliScriptsUrl)};`)
  .replace('from "@/lib/external-tool-connector-config";', `from ${JSON.stringify(connectorConfigUrl)};`)
  .replace('from "@/lib/cursor-mcp-server-script";', `from ${JSON.stringify(cursorMcpServerUrl)};`)
  .replace('from "@/lib/external-tool-handoff-markdown";', `from ${JSON.stringify(handoffUrl)};`);
const moduleUrl = transpileToDataUrl(source, modulePath);
const {
  buildExternalToolProjectContextLines,
  buildExternalToolProjectInfoSection,
  buildExternalToolRecordProgressExampleCommand,
  buildExternalToolSyncSecuritySection,
  buildExternalToolTaskBody,
  buildFallbackExternalToolTaskSection,
  buildSavedExternalToolTaskSection,
  formatExternalToolSyncExpiryText,
} = await import(handoffUrl);
const { buildExternalToolConnectorDrafts, buildExternalToolPackageDrafts } = await import(moduleUrl);

assert.equal(formatExternalToolSyncExpiryText(), "");
assert.equal(
  formatExternalToolSyncExpiryText("2026-06-03T00:00:00.000Z"),
  "\n- 자동 반영 토큰 만료: 2026-06-03T00:00:00.000Z",
);
assert.equal(
  buildExternalToolRecordProgressExampleCommand(".codex"),
  'node .codex/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "완료한 내용" --file src/app/page.tsx --verification "pnpm build passed"',
);
assert.match(buildExternalToolRecordProgressExampleCommand(".claude"), /\.claude\/venture-lab-cli\.mjs/);
assert.match(buildExternalToolRecordProgressExampleCommand(".antigravity"), /--task T-001/);
const connectorDrafts = buildExternalToolConnectorDrafts();
assert.match(connectorDrafts.cursorMcpConfigDraft, /ai-venture-lab/);
assert.match(connectorDrafts.cursorMcpServerDraft, /venture:\/\/package/);
assert.match(connectorDrafts.claudeMcpConfigDraft, /\.claude\/venture-lab-cli\.mjs/);
assert.match(connectorDrafts.antigravityMcpConfigDraft, /\.antigravity\/venture-lab-cli\.mjs/);

const idea = {
  buyer: "운영팀 리더",
  created_at: "2026-06-01T00:00:00.000Z",
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "고객 문의 자동 정리 콘솔",
  next_evidence: "실제 문의 20건으로 정확도 확인",
  one_liner: "문의 분류와 답변 초안을 만드는 운영 콘솔",
  organization_id: null,
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 3,
  risk_summary: "개인정보 마스킹 필요",
  signal: "반복 문의 정리 시간이 큽니다.",
  stage: "prototype",
  target_user: "쇼핑몰 CS 담당자",
  updated_at: "2026-06-01T00:00:00.000Z",
  willingness_to_pay: 4,
};
const productSurface = {
  key: "operator_console",
  label: "운영 콘솔",
  shortLabel: "콘솔",
  description: "운영자가 기록을 보고 처리하는 업무형 제품입니다.",
  iaHint: "현황판, 리스트, 상세, 상태 변경, 담당/권한 화면",
  firstBuild: "리스트, 상세, 상태 변경이 있는 콘솔형 첫 제작 범위",
  stackHint: "Next.js App Router, Supabase, Vercel",
  harnessFocus: "권한, 상태 변경, 감사 로그, 빈/오류/읽기 전용 상태",
  promptFocus: "대시보드, 리스트/상세, 상태 변경, 권한",
  handoffHint: "테이블/상세 계약, 상태 전환, 권한 정책, 운영 smoke",
};
assert.equal(
  buildExternalToolProjectContextLines({ idea, productSurface, projectKey: "venture-idea-1" }),
  "- 프로젝트 키: venture-idea-1\n- 아이디어: 고객 문의 자동 정리 콘솔\n- 결과물 형태: 운영 콘솔\n- 첫 제작 기준: 리스트, 상세, 상태 변경이 있는 콘솔형 첫 제작 범위",
);
assert.match(
  buildExternalToolProjectInfoSection({
    idea,
    productSurface,
    projectKey: "venture-idea-1",
    syncExpiresAt: "2026-06-03T00:00:00.000Z",
  }),
  /## 프로젝트 정보\n\n- 프로젝트 키: venture-idea-1[\s\S]+자동 반영 토큰 만료: 2026-06-03T00:00:00.000Z/,
);
assert.match(
  buildExternalToolSyncSecuritySection(".cursor/venture-lab-sync.json"),
  /## 보안 주의[\s\S]+\.cursor\/venture-lab-sync\.json[\s\S]+Git, Slack, 문서, 스크린샷/,
);
const tasks = [
  {
    acceptance_criteria: "T-001 첫 화면과 저장 흐름 확인",
    artifact_id: null,
    completed_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: null,
    dependencies: [],
    description: "첫 화면 제작",
    evidence: "",
    id: "task-1",
    idea_id: "idea-1",
    organization_id: null,
    owner_role: "frontend",
    priority: "high",
    sort_order: 1,
    status: "todo",
    task_type: "frontend",
    title: "첫 화면 제작",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const fallbackTasks = [
  {
    acceptance_criteria: "첫 화면과 저장 흐름 확인",
    owner_role: "frontend",
    priority: "high",
    task_type: "frontend",
    title: "첫 화면 제작",
  },
];
const savedTaskBody = buildExternalToolTaskBody({ fallbackTasks, tasks });
assert.match(savedTaskBody, /T-001 첫 화면 제작/);
assert.doesNotMatch(savedTaskBody, /아직 작업 보드에는 저장 전/);
assert.match(buildSavedExternalToolTaskSection(tasks[0], 0), /T-001 첫 화면 제작/);

const fallbackTaskBody = buildExternalToolTaskBody({ fallbackTasks, tasks: [] });
assert.match(fallbackTaskBody, /Venture Lab 저장 상태/);
assert.match(buildFallbackExternalToolTaskSection(fallbackTasks[0], 0), /venture_record_progress/);
assert.equal(
  buildExternalToolTaskBody({ fallbackTasks: [], tasks: [] }),
  "아직 저장된 제작 작업이 없습니다. Venture Lab STEP 6에서 작업 순서를 먼저 생성하세요.",
);

const drafts = buildExternalToolPackageDrafts({
  fallbackTasks,
  idea,
  productSurface,
  projectKey: "venture-idea-1",
  tasks,
});
assert.match(drafts.cursorTaskPackageDraft, /T-001/);
assert.match(drafts.cursorStartPromptDraft, /고객 문의 자동 정리 콘솔/);
assert.match(drafts.cursorRuleDraft, /AI Venture Lab/);
assert.match(drafts.cursorMcpConfigDraft, /ai-venture-lab/);
assert.match(drafts.cursorMcpServerDraft, /venture:\/\/tasks/);
assert.match(drafts.codexAgentInstructionsDraft, /Codex/);
assert.match(drafts.codexCliScriptDraft, /\.codex/);
assert.match(drafts.claudeInstructionsDraft, /Claude Code/);
assert.match(drafts.claudeMcpConfigDraft, /\.claude\/venture-lab-cli\.mjs/);
assert.match(drafts.antigravityAcceptanceDraft, /AI Venture Lab Acceptance Criteria/);
assert.match(drafts.antigravityCliScriptDraft, /\.antigravity/);

const emptyDrafts = buildExternalToolPackageDrafts({
  fallbackTasks,
  idea: null,
  productSurface,
  projectKey: "venture-empty",
  tasks,
});
assert.equal(emptyDrafts.cursorTaskPackageDraft, "");
assert.equal(emptyDrafts.codexStartPromptDraft, "");
assert.match(emptyDrafts.cursorMcpServerDraft, /venture:\/\/package/);

console.log("External tool package drafts smoke passed.");
