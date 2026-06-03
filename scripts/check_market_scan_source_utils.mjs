import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/market-scan-source-utils.ts")).href;
const { getMarketScanSourceQualityScore, sortMarketScanSourcesByQuality } = await import(moduleUrl);

assert.equal(getMarketScanSourceQualityScore({ source_type: "primary", strength: "high" }), 35);
assert.equal(getMarketScanSourceQualityScore({ source_type: "news", strength: "medium" }), 24);
assert.equal(getMarketScanSourceQualityScore({ source_type: "unknown", strength: "low" }), 11);

const sortedSources = sortMarketScanSourcesByQuality(
  [
    { source_type: "secondary", strength: "medium", title: "Secondary" },
    { source_type: "primary", strength: "high", title: "Primary" },
    { source_type: "directory", strength: "low", title: "Directory" },
    { source_type: "news", strength: "medium", title: "News" },
  ],
  3,
);

assert.deepEqual(
  sortedSources.map((source) => source.title),
  ["Primary", "News", "Secondary"],
);

const routePath = path.join(process.cwd(), "src/app/api/ideas/market-scan/route.ts");
const routeSource = fs.readFileSync(routePath, "utf8");
assert.equal(
  routeSource.includes(".sort("),
  false,
  "market-scan route should delegate source sorting to market-scan-source-utils",
);

console.log("Market scan source utils smoke passed.");
