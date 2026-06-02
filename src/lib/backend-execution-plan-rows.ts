import type { BackendExecutionPlan } from "@/lib/backend-planning";

export type BackendExecutionPlanSummaryRow = {
  detail: string;
  label: string;
};

export function buildBackendExecutionPlanSummaryRows(
  plan: BackendExecutionPlan,
): BackendExecutionPlanSummaryRow[] {
  return [
    { label: "로컬 검증", detail: plan.localCommand },
    { label: "프로덕션 점검", detail: plan.productionGate },
    { label: "롤백 기준", detail: plan.rollback },
  ];
}
