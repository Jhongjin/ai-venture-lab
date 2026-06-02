import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function transpileModuleUrl(modulePath, replacements = []) {
  let source = readFileSync(path.join(process.cwd(), modulePath), "utf8");

  for (const [from, to] of replacements) {
    source = source.replace(from, to);
  }

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });

  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const buildDeliveryUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const moduleUrl = transpileModuleUrl("src/lib/manual-idea-artifact.ts", [
  ['from "@/lib/build-delivery";', `from ${JSON.stringify(buildDeliveryUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
]);
const {
  buildManualIdeaDirectionArtifactBody,
  buildManualIdeaDirectionArtifactRow,
  buildManualIdeaDirectionArtifactRowFromProfiles,
  buildManualIdeaInsertRow,
} = await import(moduleUrl);

const insertRow = buildManualIdeaInsertRow({
  form: {
    buyer: "  운영팀 리더  ",
    name: "  AI Venture Lab  ",
    next_evidence: "  인터뷰 3명  ",
    one_liner: "  아이디어를 검증 패키지로 정리합니다.  ",
    risk_summary: "  자동화 실패 리스크  ",
    signal: "  반복 업무 메모  ",
    target_user: "  1인 창업자  ",
  },
  organizationId: "org-1",
  productSurfaceKey: "operator_console",
});

assert.deepEqual(insertRow, {
  buyer: "운영팀 리더",
  decision: "pending",
  differentiation: 0,
  frequency: 0,
  mvp_speed: 0,
  name: "AI Venture Lab",
  next_evidence: "인터뷰 3명",
  one_liner: "아이디어를 검증 패키지로 정리합니다.",
  organization_id: "org-1",
  problem_intensity: 0,
  product_surface: "operator_console",
  reachability: 0,
  regulatory_risk: 0,
  risk_summary: "자동화 실패 리스크",
  signal: "반복 업무 메모",
  stage: "intake",
  target_user: "1인 창업자",
  willingness_to_pay: 0,
});

const body = buildManualIdeaDirectionArtifactBody({
  buildDeliveryMarkdown: "## 제작 방식\n\n- Cursor",
  buyer: "운영팀 리더",
  ideaName: "AI Venture Lab",
  nextEvidence: "",
  oneLiner: "아이디어를 검증 패키지로 정리합니다.",
  productSurfaceMarkdown: "## 결과물 형태\n\n- 웹앱",
  targetUser: "1인 창업자",
});

assert.match(body, /# 초기 제작 방향: AI Venture Lab/);
assert.match(body, /한 줄 설명: 아이디어를 검증 패키지로 정리합니다/);
assert.match(body, /대상 사용자: 1인 창업자/);
assert.match(body, /## 결과물 형태/);
assert.match(body, /## 제작 방식/);
assert.match(body, /사업성 평가에서 AI가 필요한 검증 질문을 다시 정리합니다/);

const row = buildManualIdeaDirectionArtifactRow({
  buildDeliveryMarkdown: "## 제작 방식\n\n- Venture Lab 내부",
  idea: {
    buyer: "",
    id: "idea-1",
    name: "Manual Intake",
    next_evidence: "인터뷰 3명",
    one_liner: "",
    organization_id: null,
    target_user: "",
  },
  productSurfaceMarkdown: "## 결과물 형태\n\n- 자동화",
});

assert.equal(row.idea_id, "idea-1");
assert.equal(row.organization_id, null);
assert.equal(row.artifact_type, "idea_brief");
assert.equal(row.source, "manual");
assert.equal(row.status, "draft");
assert.equal(row.version, 1);
assert.equal(row.title, "Manual Intake 초기 제작 방향");
assert.match(row.body, /한 줄 설명: 미정/);
assert.match(row.body, /다음 확인\n\n인터뷰 3명/);

const profileRow = buildManualIdeaDirectionArtifactRowFromProfiles({
  buildDeliveryPreference: {
    mode: "external_tool",
    externalTool: "cursor",
  },
  idea: {
    buyer: "운영팀",
    id: "idea-2",
    name: "Profile Intake",
    next_evidence: "반복 업무 영상 2건",
    one_liner: "반복 업무를 자동 처리합니다.",
    organization_id: "org-2",
    target_user: "운영 매니저",
  },
  productSurface: {
    key: "automation",
    label: "업무 자동화",
    shortLabel: "자동화",
    description: "반복 업무를 받아 처리하는 서비스입니다.",
    iaHint: "입력 출처, 처리 대기열, 사람 검토, 로그 화면을 둡니다.",
    firstBuild: "수동 운영이 가능한 작업 콘솔",
    stackHint: "Next.js 운영 화면과 queue/webhook을 검토합니다.",
    harnessFocus: "입력 출처, 처리 규칙, 사람 검토, 실패 복구 기준을 담습니다.",
    promptFocus: "자동화 트리거와 예외 처리를 우선 반영합니다.",
    handoffHint: "트리거, 처리 단계, 승인/재시도, 실패 로그를 함께 넘깁니다.",
  },
});

assert.equal(profileRow.idea_id, "idea-2");
assert.equal(profileRow.organization_id, "org-2");
assert.equal(profileRow.source, "manual");
assert.match(profileRow.body, /## 제작 형태/);
assert.match(profileRow.body, /권장 제작 형태: 업무 자동화/);
assert.match(profileRow.body, /## 제작 방식/);
assert.match(profileRow.body, /external_tool: cursor/);

console.log("Manual idea artifact smoke passed.");
