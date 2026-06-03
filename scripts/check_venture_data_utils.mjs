import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/venture-data.ts");
const supabaseServerStub = "data:text/javascript;base64," + Buffer.from("export async function getSupabaseServerClient() { return null; }").toString("base64");
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/supabase/server";',
  `from ${JSON.stringify(supabaseServerStub)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { compareIdeasByWorkflow, scoreIdea, sortIdeasByWorkflow, workflowStageOrder } = await import(moduleUrl);

function idea({ createdAt, id, name, stage }) {
  return {
    buyer: "",
    created_at: createdAt,
    created_by: null,
    decision: "pending",
    differentiation: 4,
    frequency: 3,
    id,
    mvp_speed: 5,
    name,
    next_evidence: "",
    one_liner: "",
    organization_id: null,
    problem_intensity: 5,
    product_surface: null,
    reachability: 4,
    regulatory_risk: 2,
    risk_summary: "",
    signal: "",
    stage,
    target_user: "",
    updated_at: createdAt,
    willingness_to_pay: 3,
  };
}

const ideas = [
  idea({ createdAt: "2026-06-01T00:00:00.000Z", id: "prd-old", name: "제품 자료", stage: "prd" }),
  idea({ createdAt: "2026-06-03T00:00:00.000Z", id: "score-new", name: "점수 새", stage: "score" }),
  idea({ createdAt: "2026-06-02T00:00:00.000Z", id: "score-old", name: "점수 옛", stage: "score" }),
  idea({ createdAt: "2026-06-04T00:00:00.000Z", id: "launch-new", name: "출시", stage: "launch" }),
];

assert.deepEqual(workflowStageOrder, ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"]);
assert.deepEqual(
  sortIdeasByWorkflow(ideas).map((item) => item.id),
  ["score-new", "score-old", "prd-old", "launch-new"],
);
assert.equal(compareIdeasByWorkflow(ideas[1], ideas[0]) < 0, true);
assert.equal(compareIdeasByWorkflow(ideas[1], ideas[2]) < 0, true);
assert.equal(scoreIdea(ideas[0]), 22);

console.log("Venture data utils smoke passed.");
