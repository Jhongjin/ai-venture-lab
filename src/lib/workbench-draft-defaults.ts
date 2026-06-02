import type { DecisionStatus, OrchestrationPhase, RiskSeverity } from "@/lib/supabase/types";
import type { EvidenceConfidence } from "@/lib/workbench-labels";

export type RiskDraft = {
  title: string;
  area: string;
  severity: RiskSeverity;
  mitigation: string;
};

export type ExperimentDraft = {
  name: string;
  success_metric: string;
};

export type RunDraft = {
  phase: OrchestrationPhase;
  owner_role: string;
  objective: string;
};

export type EvidenceDraft = {
  title: string;
  source: string;
  evidence: string;
  implication: string;
  confidence: EvidenceConfidence;
};

export type ExperimentResultDraft = {
  experiment_id: string;
  result: string;
  learning: string;
  next_decision: DecisionStatus;
  next_action: string;
};

export function createDefaultRiskDraft(): RiskDraft {
  return {
    title: "",
    area: "",
    severity: "medium",
    mitigation: "",
  };
}

export function createDefaultExperimentDraft(): ExperimentDraft {
  return { name: "", success_metric: "" };
}

export function createDefaultRunDraft(): RunDraft {
  return {
    phase: "strategy",
    owner_role: "strategy-reviewer",
    objective: "기회, 판단 기준, 제약 조건, 다음 실행 약속을 정의합니다.",
  };
}

export function createDefaultEvidenceDraft(): EvidenceDraft {
  return {
    title: "",
    source: "",
    evidence: "",
    implication: "",
    confidence: "medium",
  };
}

export function createDefaultExperimentResultDraft(experimentId = ""): ExperimentResultDraft {
  return {
    experiment_id: experimentId,
    result: "",
    learning: "",
    next_decision: "research_more",
    next_action: "",
  };
}
