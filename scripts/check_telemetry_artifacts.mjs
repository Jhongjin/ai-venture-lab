import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/telemetry-artifacts.ts");
const telemetryFormatUrl = pathToFileURL(path.join(process.cwd(), "src/lib/telemetry-format.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/telemetry-format";',
  `from ${JSON.stringify(telemetryFormatUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { buildTelemetryArtifactSaveDrafts, buildTelemetryReportDraftState, buildTelemetrySetupDrafts } = await import(moduleUrl);

assert.deepEqual(buildTelemetrySetupDrafts(null), {
  telemetryAdapterGuideDraft: "",
  telemetryEnvSnippet: "",
  telemetryNextRouteSnippet: "",
  telemetryClientHelperSnippet: "",
  telemetrySmokeCommandSnippet: "",
});

const idea = { id: "idea-telemetry-1", name: "텔레메트리 검증" };
const setupDrafts = buildTelemetrySetupDrafts(idea);

assert.match(setupDrafts.telemetryAdapterGuideDraft, /MVP 제품 이벤트 연결 가이드/);
assert.match(setupDrafts.telemetryAdapterGuideDraft, /idea-telemetry-1/);
assert.match(setupDrafts.telemetryEnvSnippet, /TELEMETRY_INGEST_SECRET=replace-with-shared-server-secret/);
assert.match(setupDrafts.telemetryNextRouteSnippet, /app\/api\/product-events\/route\.ts/);
assert.match(setupDrafts.telemetryNextRouteSnippet, /idea-telemetry-1/);
assert.match(setupDrafts.telemetryClientHelperSnippet, /trackProductEvent/);
assert.match(setupDrafts.telemetrySmokeCommandSnippet, /TELEMETRY_SMOKE_IDEA_ID="idea-telemetry-1"/);

assert.deepEqual(
  buildTelemetryReportDraftState({
    events: [],
    experiments: [],
    idea: null,
    implementationTasks: [],
    openRisks: [],
    productEvents: [],
  }),
  {
    learningTelemetryReportDraft: "",
    productTelemetryFunnelDraft: "",
  },
);

const event = {
  created_at: "2026-06-02T00:00:00.000Z",
  event_category: "product",
  event_name: "product_page_view",
  id: "event-1",
  idea_id: "idea-telemetry-1",
  occurred_at: "2026-06-02T00:00:00.000Z",
  properties: { path: "/workspace" },
};
const reportDrafts = buildTelemetryReportDraftState({
  events: [event],
  experiments: [{ status: "running" }],
  idea,
  implementationTasks: [{ status: "done" }, { status: "todo" }],
  openRisks: [{ status: "open" }],
  productEvents: [event],
});

assert.match(reportDrafts.learningTelemetryReportDraft, /# 출시 후 학습 리포트: 텔레메트리 검증/);
assert.match(reportDrafts.learningTelemetryReportDraft, /최근 7일 이벤트: 1개/);
assert.match(reportDrafts.productTelemetryFunnelDraft, /# 제품 이벤트 퍼널 리포트: 텔레메트리 검증/);
assert.match(reportDrafts.productTelemetryFunnelDraft, /product_page_view/);

const saveDrafts = buildTelemetryArtifactSaveDrafts({
  ideaName: idea.name,
  learningTelemetryReportDraft: reportDrafts.learningTelemetryReportDraft,
  productTelemetryFunnelDraft: reportDrafts.productTelemetryFunnelDraft,
  telemetryAdapterGuideDraft: setupDrafts.telemetryAdapterGuideDraft,
});
assert.equal(saveDrafts.telemetryAdapterGuideSaveDraft.artifactType, "tech_spec");
assert.equal(saveDrafts.telemetryAdapterGuideSaveDraft.title, "텔레메트리 검증 성과 신호 연결 가이드");
assert.equal(saveDrafts.telemetryAdapterGuideSaveDraft.source, "telemetry_adapter");
assert.match(saveDrafts.telemetryAdapterGuideSaveDraft.body, /MVP 제품 이벤트 연결 가이드/);
assert.equal(saveDrafts.productTelemetryFunnelSaveDraft.artifactType, "research_note");
assert.equal(saveDrafts.productTelemetryFunnelSaveDraft.title, "텔레메트리 검증 제품 사용 퍼널");
assert.equal(saveDrafts.productTelemetryFunnelSaveDraft.source, "product_telemetry_funnel");
assert.match(saveDrafts.productTelemetryFunnelSaveDraft.body, /# 제품 이벤트 퍼널 리포트: 텔레메트리 검증/);
assert.equal(saveDrafts.learningTelemetryReportSaveDraft.artifactType, "research_note");
assert.equal(saveDrafts.learningTelemetryReportSaveDraft.title, "텔레메트리 검증 학습 리포트");
assert.equal(saveDrafts.learningTelemetryReportSaveDraft.source, "post_launch_learning");
assert.match(saveDrafts.learningTelemetryReportSaveDraft.body, /# 출시 후 학습 리포트: 텔레메트리 검증/);

assert.deepEqual(
  buildTelemetryArtifactSaveDrafts({
    ideaName: null,
    learningTelemetryReportDraft: "",
    productTelemetryFunnelDraft: "",
    telemetryAdapterGuideDraft: "",
  }),
  {
    learningTelemetryReportSaveDraft: null,
    productTelemetryFunnelSaveDraft: null,
    telemetryAdapterGuideSaveDraft: null,
  },
);

console.log("Telemetry artifacts smoke passed.");
