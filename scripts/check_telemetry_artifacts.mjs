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
const { buildTelemetrySetupDrafts } = await import(moduleUrl);

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

console.log("Telemetry artifacts smoke passed.");
