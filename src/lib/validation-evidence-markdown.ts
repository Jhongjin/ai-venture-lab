import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Experiment, Idea } from "@/lib/venture-data";
import {
  decisionLabels,
  evidenceConfidenceLabels,
  experimentStatusLabels,
  stageLabels,
  type EvidenceConfidence,
} from "@/lib/workbench-labels";

type ValidationEvidenceState = Pick<
  Idea,
  "stage" | "decision" | "signal" | "risk_summary" | "next_evidence" | "product_surface"
>;

type EvidenceNoteDraft = {
  title: string;
  source: string;
  evidence: string;
  implication: string;
  confidence: EvidenceConfidence;
};

type ExperimentResultMarkdownDraft = {
  experiment_id?: string;
  result: string;
  learning: string;
  next_decision: DecisionStatus;
  next_action: string;
};

export function buildEvidenceNoteMarkdown({
  idea,
  state,
  draft,
}: {
  idea: Idea;
  state: ValidationEvidenceState;
  draft: EvidenceNoteDraft;
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);

  return `# 근거 기록: ${draft.title || "제목 미정"}

## 아이디어 맥락

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

${productSurfaceMarkdown(productSurface)}

## 출처

${draft.source || "미정"}

## 관찰한 근거

${draft.evidence || "미정"}

## 해석과 영향

${draft.implication || "미정"}

## 확신도

- ${evidenceConfidenceLabels[draft.confidence]}

## 다음 행동

${state.next_evidence || "이 근거가 진행, 추가 조사, 전환, 중단 중 어떤 판단을 강화하는지 결정하세요."}
`;
}

export function buildExperimentResultMarkdown({
  idea,
  state,
  experiment,
  draft,
}: {
  idea: Idea;
  state: ValidationEvidenceState;
  experiment: Experiment;
  draft: ExperimentResultMarkdownDraft;
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);

  return `# 실험 결과: ${experiment.name}

## 아이디어 맥락

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

${productSurfaceMarkdown(productSurface)}

## 실험

- 이름: ${experiment.name}
- 상태: ${experimentStatusLabels[experiment.status] ?? experiment.status}
- 성공 지표: ${experiment.success_metric || "미정"}
- 시작: ${experiment.started_at || "미정"}
- 종료: ${experiment.ended_at || "미정"}

## 결과

${draft.result || "미정"}

## 배운 점

${draft.learning || "미정"}

## 다음 판단

- ${decisionLabels[draft.next_decision]}

## 다음 행동

${draft.next_action || state.next_evidence || "다음 검증, 제품 기획서 수정, 리스크 완화, 중단/전환 중 하나를 기록하세요."}
`;
}
