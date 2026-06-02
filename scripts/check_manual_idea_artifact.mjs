import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/manual-idea-artifact.ts")).href;
const { buildManualIdeaDirectionArtifactBody, buildManualIdeaDirectionArtifactRow, buildManualIdeaInsertRow } =
  await import(moduleUrl);

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

console.log("Manual idea artifact smoke passed.");
