import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/telemetry-ingest-utils.ts")).href;
const { safeTelemetryIngestIsoDate } = await import(moduleUrl);

const fallbackDate = new Date("2026-06-03T00:00:00.000Z");

assert.equal(safeTelemetryIngestIsoDate("2026-06-02T12:30:00.000Z", fallbackDate), "2026-06-02T12:30:00.000Z");
assert.equal(safeTelemetryIngestIsoDate("", fallbackDate), "2026-06-03T00:00:00.000Z");
assert.equal(safeTelemetryIngestIsoDate("not-a-date", fallbackDate), "2026-06-03T00:00:00.000Z");
assert.equal(
  safeTelemetryIngestIsoDate("  2026-06-02T12:30:00.000Z\n\n", fallbackDate),
  "2026-06-02T12:30:00.000Z",
);

const ingestRoutePath = path.join(process.cwd(), "src/app/api/telemetry/ingest/route.ts");
const ingestRouteSource = fs.readFileSync(ingestRoutePath, "utf8");
assert.equal(
  ingestRouteSource.includes("new Date("),
  false,
  "telemetry ingest route should delegate date parsing to telemetry-ingest-utils",
);

console.log("Telemetry ingest utils smoke passed.");
