import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Idea } from "@/lib/venture-data";

export type WorkbenchEditState = Pick<
  Idea,
  | "decision"
  | "differentiation"
  | "frequency"
  | "mvp_speed"
  | "next_evidence"
  | "problem_intensity"
  | "product_surface"
  | "reachability"
  | "regulatory_risk"
  | "risk_summary"
  | "signal"
  | "stage"
  | "willingness_to_pay"
>;

export function toWorkbenchEditState(idea: Idea): WorkbenchEditState {
  return {
    stage: idea.stage,
    decision: idea.decision,
    problem_intensity: idea.problem_intensity,
    frequency: idea.frequency,
    reachability: idea.reachability,
    willingness_to_pay: idea.willingness_to_pay,
    mvp_speed: idea.mvp_speed,
    differentiation: idea.differentiation,
    regulatory_risk: idea.regulatory_risk,
    signal: idea.signal,
    risk_summary: idea.risk_summary,
    next_evidence: idea.next_evidence,
    product_surface: resolveProductSurfaceForIdea(idea).key,
  };
}

export function scoreWorkbenchState(state: WorkbenchEditState) {
  return (
    state.problem_intensity +
    state.frequency +
    state.reachability +
    state.willingness_to_pay +
    state.mvp_speed +
    state.differentiation -
    state.regulatory_risk
  );
}

export function recommendationForScore(score: number): DecisionStatus {
  if (score >= 22) {
    return "ship";
  }

  if (score >= 15) {
    return "research_more";
  }

  if (score >= 9) {
    return "pivot";
  }

  return "kill";
}

export function saveDecisionForScore(recommendation: DecisionStatus): DecisionStatus {
  return recommendation === "kill" ? "research_more" : recommendation;
}

export function buildWorkbenchScoringSavePatch({
  decision,
  idea,
  state,
}: {
  decision: DecisionStatus;
  idea: Idea;
  state: WorkbenchEditState;
}): WorkbenchEditState {
  return {
    ...state,
    stage: "score",
    decision,
    product_surface: resolveProductSurfaceForIdea(idea, state).key,
  };
}

export function isWorkbenchScoreEvaluationSaved({
  hasReachedScoreStage,
  idea,
  saveDecision,
  savedState,
  state,
}: {
  hasReachedScoreStage: boolean;
  idea: Idea | null;
  saveDecision: DecisionStatus;
  savedState: WorkbenchEditState | null;
  state: WorkbenchEditState | null;
}) {
  return Boolean(
    idea &&
      state &&
      savedState &&
      hasReachedScoreStage &&
      idea.decision === saveDecision &&
      idea.problem_intensity === state.problem_intensity &&
      idea.frequency === state.frequency &&
      idea.reachability === state.reachability &&
      idea.willingness_to_pay === state.willingness_to_pay &&
      idea.mvp_speed === state.mvp_speed &&
      idea.differentiation === state.differentiation &&
      idea.regulatory_risk === state.regulatory_risk &&
      idea.signal === state.signal &&
      idea.risk_summary === state.risk_summary &&
      idea.next_evidence === state.next_evidence &&
      savedState.product_surface === state.product_surface,
  );
}

export function missingEvidence(idea: Idea, state: WorkbenchEditState, riskCount: number) {
  const missing = [];

  if (!idea.one_liner.trim()) {
    missing.push("한 줄 설명");
  }

  if (!idea.target_user.trim()) {
    missing.push("대상 사용자");
  }

  if (!idea.buyer.trim()) {
    missing.push("구매자");
  }

  if (!state.signal.trim()) {
    missing.push("수요 신호");
  }

  if (!state.next_evidence.trim()) {
    missing.push("추가로 확인할 내용");
  }

  if (riskCount === 0) {
    missing.push("연결된 리스크");
  }

  return missing;
}
