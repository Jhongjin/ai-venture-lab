import {
  productSurfaceProfiles,
  resolveProductSurfaceForIdea,
  type ProductSurfaceProfile,
} from "@/lib/product-surface";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Idea } from "@/lib/venture-data";
import { isIdeaStageAtOrAfter } from "@/lib/workbench-list-utils";

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

export type WorkbenchScoreInputField =
  | "problem_intensity"
  | "frequency"
  | "reachability"
  | "willingness_to_pay"
  | "mvp_speed"
  | "differentiation"
  | "regulatory_risk";

export type WorkbenchScoreInputFieldConfig = {
  description: string;
  field: WorkbenchScoreInputField;
  label: string;
  value: WorkbenchEditState[WorkbenchScoreInputField];
};
export type WorkbenchScoringNoteField = "signal" | "risk_summary" | "next_evidence";
export type WorkbenchScoringNoteFieldConfig = {
  field: WorkbenchScoringNoteField;
  label: string;
  value: WorkbenchEditState[WorkbenchScoringNoteField];
};
export type WorkbenchScoringReviewCardState = {
  description: string;
  label: string;
  value: string;
};
export type WorkbenchScoringNotePanelState = {
  description: string;
  summaryLabel: string;
};
export type WorkbenchScoringHelpSectionState = {
  body: string | null;
  items: string[];
  title: string;
  variant: "muted" | "plain";
};

const workbenchScoreInputFields: Array<Pick<WorkbenchScoreInputFieldConfig, "field" | "label">> = [
  { field: "problem_intensity", label: "문제 강도" },
  { field: "frequency", label: "발생 빈도" },
  { field: "reachability", label: "도달 가능성" },
  { field: "willingness_to_pay", label: "지불 의향" },
  { field: "mvp_speed", label: "첫 제작 속도" },
  { field: "differentiation", label: "차별성" },
  { field: "regulatory_risk", label: "리스크 감점" },
];
const workbenchScoringNoteFields: Array<Pick<WorkbenchScoringNoteFieldConfig, "field" | "label">> = [
  { field: "signal", label: "수요 신호" },
  { field: "risk_summary", label: "리스크 요약" },
  { field: "next_evidence", label: "추가로 확인할 내용" },
];

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

export function buildWorkbenchScoreInputFieldConfigs({
  descriptions,
  state,
}: {
  descriptions: Record<WorkbenchScoreInputField, string>;
  state: WorkbenchEditState;
}): WorkbenchScoreInputFieldConfig[] {
  return workbenchScoreInputFields.map(({ field, label }) => ({
    description: descriptions[field],
    field,
    label,
    value: state[field],
  }));
}

export function buildWorkbenchScoringNoteFieldConfigs(state: WorkbenchEditState): WorkbenchScoringNoteFieldConfig[] {
  return workbenchScoringNoteFields.map(({ field, label }) => ({
    field,
    label,
    value: state[field],
  }));
}

export function buildWorkbenchScoringReviewCards({
  scoreDecisionLabel,
}: {
  scoreDecisionLabel: string;
}): WorkbenchScoringReviewCardState[] {
  return [
    {
      description: "지금 화면에서는 사용자가 고르지 않습니다. 저장하면 이 아이디어는 사업성 평가 단계로 기록됩니다.",
      label: "저장되는 단계",
      value: "STEP 2 사업성 평가",
    },
    {
      description: "아래 평가값으로 계산한 추천입니다. 평가가 낮아도 자동 삭제하지 않고, 삭제는 사용자가 직접 선택합니다.",
      label: "AI 추천 판단",
      value: scoreDecisionLabel,
    },
  ];
}

export function buildWorkbenchScoringCurrentScoreCard({
  currentScore,
}: {
  currentScore: number;
}): WorkbenchScoringReviewCardState {
  return {
    description: "위 6개 항목에서 리스크를 반영한 참고값입니다. 저장하면 AI가 다음 검증 계획의 기준으로 사용합니다.",
    label: "현재 평가",
    value: String(currentScore),
  };
}

export function buildWorkbenchScoringNextActionCard(): WorkbenchScoringReviewCardState {
  return {
    description:
      "AI가 채운 값을 그대로 쓰거나 필요한 부분만 수정한 뒤 저장하세요. 다음 단계의 실험과 리스크 초안은 AI가 이어서 준비합니다.",
    label: "다음 행동",
    value: "사업성 평가를 저장하면 됩니다",
  };
}

export function buildWorkbenchScoringNotePanelState(): WorkbenchScoringNotePanelState {
  return {
    description: "AI가 만든 초안을 직접 보완하고 싶을 때만 여기를 수정하세요.",
    summaryLabel: "추가 메모 열기",
  };
}

export function buildWorkbenchScoringHelpSections(): WorkbenchScoringHelpSectionState[] {
  return [
    {
      body: null,
      items: [
        "처음 값은 AI가 원문을 보고 채운 추천값입니다. 그대로 써도 되고 직접 바꿔도 됩니다.",
        "작게 만들기 쉽지만 차별성이 낮다면 범위를 줄이거나 대상을 좁히는 쪽이 좋습니다.",
        "리스크 감점이 높다면 검증 계획보다 개인정보, 법무, 운영 리스크를 먼저 확인하세요.",
      ],
      title: "평가값 읽는 법",
      variant: "muted",
    },
    {
      body: "사업성 평가를 저장하면 AI가 다음 검증 계획에서 첫 확인 방법과 성공 기준을 이어서 준비합니다. 여기서는 현재 평가값만 확인하면 충분합니다.",
      items: [],
      title: "다음 판단",
      variant: "plain",
    },
  ];
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

export function buildWorkbenchScoringTelemetryProperties(idea: Idea) {
  return {
    stage: idea.stage,
    decision: idea.decision,
    score: scoreWorkbenchState(toWorkbenchEditState(idea)),
    regulatory_risk: idea.regulatory_risk,
  };
}

export function buildWorkbenchScoringSavedMessage({ usedProductSurfaceFallback }: { usedProductSurfaceFallback: boolean }) {
  return usedProductSurfaceFallback
    ? "사업성 평가는 저장했습니다. 결과물 형태는 DB 마이그레이션 적용 후 저장됩니다."
    : "사업성 평가를 저장했습니다.";
}

export function buildWorkbenchScoringEditGuidanceMessage({ canEdit }: { canEdit: boolean }) {
  return canEdit
    ? "아래 값은 AI가 원문을 분석해 먼저 채운 추천값입니다. 그대로 저장해도 되고, 다르게 판단되면 직접 수정하세요."
    : "이 기록은 보기 전용입니다. 본인이 만든 아이디어나 팀 관리자 권한이 있는 기록만 편집할 수 있습니다.";
}

export type WorkbenchScoringSaveButtonState = {
  disabled: boolean;
  icon: "loading" | "saved" | "save";
  label: string;
  toneClassName: "avl-btn-primary" | "avl-btn-secondary";
};
export type WorkbenchScoringReadinessPill = {
  label: string;
  toneClassName: "avl-pill-success" | "avl-pill-warning";
};
export type WorkbenchScoringRecommendationPanelState = {
  description: string;
  eyebrow: string;
  killWarningMessage: string | null;
  readinessPills: WorkbenchScoringReadinessPill[];
  scoreDecisionLabel: string;
};

export function buildWorkbenchScoringSaveButtonState({
  canEdit,
  isBusy,
  isScoreEvaluationSaved,
}: {
  canEdit: boolean;
  isBusy: boolean;
  isScoreEvaluationSaved: boolean;
}): WorkbenchScoringSaveButtonState {
  return {
    disabled: isBusy || !canEdit || isScoreEvaluationSaved,
    icon: isBusy ? "loading" : isScoreEvaluationSaved ? "saved" : "save",
    label: isScoreEvaluationSaved ? "저장 완료" : "사업성 평가 저장",
    toneClassName: isScoreEvaluationSaved ? "avl-btn-secondary" : "avl-btn-primary",
  };
}

export function buildWorkbenchScoringRecommendationPanelState({
  missing,
  scoreDecisionLabel,
  scoreRecommendation,
}: {
  missing: string[];
  scoreDecisionLabel: string;
  scoreRecommendation: DecisionStatus;
}): WorkbenchScoringRecommendationPanelState {
  return {
    description: "현재 평가값으로 계산한 추천입니다. 저장하면 AI가 이 판단을 기준으로 다음 단계를 준비합니다.",
    eyebrow: "AI 추천 판단",
    killWarningMessage:
      scoreRecommendation === "kill"
        ? "현재 평가만 보면 중단에 가깝지만, 아이디어를 바로 삭제하지는 않습니다. 삭제는 상단 삭제 버튼을 눌렀을 때만 진행됩니다."
        : null,
    readinessPills:
      missing.length > 0
        ? missing.map((label) => ({ label, toneClassName: "avl-pill-warning" as const }))
        : [{ label: "기획 전환 준비 완료", toneClassName: "avl-pill-success" }],
    scoreDecisionLabel,
  };
}

export type WorkbenchScoreEvaluationState = {
  activeProductSurface: ProductSurfaceProfile;
  currentScore: number;
  isScoreEvaluationSaved: boolean;
  missing: string[];
  scoreRecommendation: DecisionStatus;
  scoreSaveDecision: DecisionStatus;
  selectedProductSurface: ProductSurfaceProfile | null;
};

export function buildWorkbenchScoreEvaluationState({
  idea,
  riskCount,
  state,
}: {
  idea: Idea | null;
  riskCount: number;
  state: WorkbenchEditState | null;
}): WorkbenchScoreEvaluationState {
  const currentScore = state ? scoreWorkbenchState(state) : 0;
  const scoreRecommendation = recommendationForScore(currentScore);
  const scoreSaveDecision = saveDecisionForScore(scoreRecommendation);
  const savedEditState = idea ? toWorkbenchEditState(idea) : null;
  const selectedProductSurface = idea && state ? resolveProductSurfaceForIdea(idea, state) : null;
  const hasReachedScoreStage = idea ? isIdeaStageAtOrAfter(idea.stage, "score") : false;

  return {
    activeProductSurface: selectedProductSurface ?? productSurfaceProfiles.web_app,
    currentScore,
    isScoreEvaluationSaved: isWorkbenchScoreEvaluationSaved({
      hasReachedScoreStage,
      idea,
      saveDecision: scoreSaveDecision,
      savedState: savedEditState,
      state,
    }),
    missing: idea && state ? missingEvidence(idea, state, riskCount) : [],
    scoreRecommendation,
    scoreSaveDecision,
    selectedProductSurface,
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
