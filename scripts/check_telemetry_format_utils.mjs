import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/telemetry-format.ts")).href;
const {
  buildLearningSignalCards,
  buildProductTelemetryFunnelRows,
  buildProductTelemetryDerivedState,
  buildProductTelemetryTaxonomyRows,
  buildTelemetryEventInsertRow,
  buildTelemetryWindowCounts,
  countTelemetryEventsByName,
  filterProductTelemetryEvents,
  getProductTelemetryMaxCount,
  sanitizeTelemetryProperties,
} = await import(moduleUrl);

function event({ category = "product", id, name, occurredAt }) {
  return {
    created_at: occurredAt,
    event_category: category,
    event_name: name,
    id,
    idea_id: "idea-1",
    occurred_at: occurredAt,
    properties: {},
  };
}

const events = [
  event({ id: "visit-1", name: "product_page_view", occurredAt: "2026-06-30T00:00:00.000Z" }),
  event({ id: "visit-2", name: "product_page_view", occurredAt: "2026-06-29T00:00:00.000Z" }),
  event({ id: "signup", name: "product_signup_started", occurredAt: "2026-06-20T00:00:00.000Z" }),
  event({ category: "artifact", id: "artifact", name: "artifact_saved", occurredAt: "2026-06-29T00:00:00.000Z" }),
  event({ category: "learning", id: "prefixed", name: "product_feedback", occurredAt: "2026-05-20T00:00:00.000Z" }),
];

assert.deepEqual(sanitizeTelemetryProperties({ kept: "yes", missing: undefined, count: 2 }), {
  count: 2,
  kept: "yes",
});
assert.deepEqual(
  buildTelemetryEventInsertRow({
    eventCategory: "experiment",
    eventName: "experiment_created",
    idea: { id: "idea-1", organization_id: "org-1" },
    properties: { count: 1, skipped: undefined },
    userId: "user-1",
  }),
  {
    actor_id: "user-1",
    event_category: "experiment",
    event_name: "experiment_created",
    idea_id: "idea-1",
    organization_id: "org-1",
    properties: { count: 1 },
  },
);
assert.deepEqual(
  buildTelemetryEventInsertRow({
    eventCategory: "extraction",
    eventName: "idea_extraction_started",
    idea: null,
    organizationId: "org-console",
    properties: { source: "manual", skipped: undefined },
    userId: "user-1",
  }),
  {
    actor_id: "user-1",
    event_category: "extraction",
    event_name: "idea_extraction_started",
    idea_id: null,
    organization_id: "org-console",
    properties: { source: "manual" },
  },
);

const productEvents = filterProductTelemetryEvents(events);
assert.deepEqual(
  productEvents.map((item) => item.id),
  ["visit-1", "visit-2", "signup", "prefixed"],
);

const counts = countTelemetryEventsByName(productEvents);
assert.equal(counts.get("product_page_view"), 2);
assert.equal(counts.get("product_signup_started"), 1);

const funnelRows = buildProductTelemetryFunnelRows(counts);
assert.equal(funnelRows[0].eventName, "product_page_view");
assert.equal(funnelRows[0].count, 2);
assert.equal(funnelRows[0].conversion, null);
assert.equal(funnelRows[1].eventName, "product_signup_started");
assert.equal(funnelRows[1].count, 1);
assert.equal(funnelRows[1].conversion, 50);
assert.equal(getProductTelemetryMaxCount(funnelRows), 2);

const taxonomyRows = buildProductTelemetryTaxonomyRows(counts);
assert.equal(taxonomyRows.find((row) => row.eventName === "product_page_view").count, 2);
assert.equal(taxonomyRows.find((row) => row.eventName === "product_feedback").count, 1);

const windowCounts = buildTelemetryWindowCounts(events);
assert.deepEqual(windowCounts, { sevenDays: 3, fourteenDays: 4, thirtyDays: 4 });

const cards = buildLearningSignalCards({
  openRiskCount: 2,
  productEventCount: productEvents.length,
  telemetryWindowCounts: windowCounts,
});
assert.deepEqual(
  cards.map((card) => card.value),
  ["4개", "3개", "4개", "4개", "2개"],
);

const derivedState = buildProductTelemetryDerivedState({
  events,
  openRiskCount: 2,
});
assert.deepEqual(
  derivedState.selectedProductTelemetryEvents.map((item) => item.id),
  ["visit-1", "visit-2", "signup", "prefixed"],
);
assert.equal(derivedState.productTelemetryEventCounts.get("product_page_view"), 2);
assert.deepEqual(
  derivedState.productTelemetryFunnelRows.map((row) => [row.eventName, row.count, row.conversion]),
  funnelRows.map((row) => [row.eventName, row.count, row.conversion]),
);
assert.equal(derivedState.productTelemetryMaxCount, 2);
assert.equal(derivedState.productTelemetryTaxonomyRows.find((row) => row.eventName === "product_feedback").count, 1);
assert.deepEqual(derivedState.telemetryWindowCounts, windowCounts);
assert.deepEqual(
  derivedState.learningSignalCards.map((card) => card.value),
  ["4개", "3개", "4개", "4개", "2개"],
);

console.log("Telemetry format utils smoke passed.");
