import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/backend-execution-plan-rows.ts")).href;
const { buildBackendExecutionPlanSummaryRows } = await import(moduleUrl);

const rows = buildBackendExecutionPlanSummaryRows({
  backend: {
    key: "supabase",
    label: "Supabase",
    score: 90,
    summary: "운영 콘솔 첫 버전",
    strengths: [],
    cautions: [],
  },
  checks: [],
  envVars: [],
  localCommand: "pnpm lint && pnpm typecheck && pnpm build",
  productionGate: "Production에서 로그인 사용자 insert/update와 타인 데이터 차단을 재확인합니다.",
  rollback: "직전 migration/policy 백업과 Vercel 직전 Ready 배포로 되돌립니다.",
});

assert.deepEqual(
  rows.map((row) => row.label),
  ["로컬 검증", "프로덕션 점검", "롤백 기준"],
);
assert.equal(rows[0].detail, "pnpm lint && pnpm typecheck && pnpm build");
assert.match(rows[1].detail, /Production/);
assert.match(rows[2].detail, /Vercel/);

console.log("Backend execution plan rows smoke passed.");
