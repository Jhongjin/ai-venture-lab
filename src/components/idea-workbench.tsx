"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Beaker, CheckCircle2, Clipboard, ClipboardList, Flag, Layers3, RefreshCw, Save, ShieldAlert } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Decision, Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import type {
  Database,
  DecisionStatus,
  IdeaStage,
  OrchestrationPhase,
  OrchestrationStatus,
  RiskSeverity,
  VentureArtifactStatus,
  VentureArtifactType,
} from "@/lib/supabase/types";

type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];

const stages: IdeaStage[] = ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"];
const decisions: DecisionStatus[] = ["pending", "research_more", "ship", "pivot", "kill"];
const riskSeverities: RiskSeverity[] = ["low", "medium", "high", "critical"];
const orchestrationStatuses: OrchestrationStatus[] = ["planned", "running", "blocked", "done", "skipped"];
const artifactLabels: Record<VentureArtifactType, string> = {
  idea_brief: "Idea brief",
  research_note: "Research note",
  prd: "PRD",
  mvp_spec: "MVP spec",
  launch_checklist: "Launch checklist",
};
const artifactStatusLabels: Record<VentureArtifactStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  archived: "Archived",
};
const artifactStatusTone: Record<VentureArtifactStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  approved: "bg-emerald-100 text-emerald-800",
  archived: "bg-amber-100 text-amber-800",
};
const adminRoles = new Set(["owner", "admin"]);

const orchestrationPhaseConfigs: Array<{
  phase: OrchestrationPhase;
  label: string;
  ownerRole: string;
  objective: string;
}> = [
  {
    phase: "strategy",
    label: "Strategy",
    ownerRole: "strategy-reviewer",
    objective: "Define opportunity, decision criteria, constraints, and next commitment.",
  },
  {
    phase: "research",
    label: "Research",
    ownerRole: "market-research",
    objective: "Validate user pain, market pull, competitors, and regulatory facts with sources.",
  },
  {
    phase: "product",
    label: "Product",
    ownerRole: "prd-writer",
    objective: "Turn validated evidence into the smallest PRD and acceptance criteria.",
  },
  {
    phase: "design",
    label: "Design",
    ownerRole: "design-reviewer",
    objective: "Map flows, screens, empty states, and usability risks before implementation.",
  },
  {
    phase: "build",
    label: "Build",
    ownerRole: "prototype-builder",
    objective: "Build the smallest useful prototype that can test the current assumption.",
  },
  {
    phase: "qa",
    label: "QA",
    ownerRole: "qa-runner",
    objective: "Verify the core journey, regression surface, and launch checklist.",
  },
  {
    phase: "debug",
    label: "Debug",
    ownerRole: "qa-debug",
    objective: "Reproduce failures, isolate cause, patch, and record the verification path.",
  },
  {
    phase: "security",
    label: "Security",
    ownerRole: "security-reviewer",
    objective: "Review PII, secrets, permissions, abuse paths, retention, and compliance claims.",
  },
  {
    phase: "launch",
    label: "Launch",
    ownerRole: "launch-gate",
    objective: "Make the ship, pivot, kill, or research-more decision with evidence attached.",
  },
];
const phaseOrder = new Map(orchestrationPhaseConfigs.map((config, index) => [config.phase, index]));
const phaseLabels = Object.fromEntries(
  orchestrationPhaseConfigs.map((config) => [config.phase, config.label]),
) as Record<OrchestrationPhase, string>;
const runStatusTone: Record<OrchestrationStatus, string> = {
  planned: "bg-slate-100 text-slate-700",
  running: "bg-blue-100 text-blue-800",
  blocked: "bg-rose-100 text-rose-800",
  done: "bg-emerald-100 text-emerald-800",
  skipped: "bg-amber-100 text-amber-800",
};

const stageLabels: Record<IdeaStage, string> = {
  intake: "Intake",
  research: "Research",
  score: "Score",
  prd: "PRD",
  prototype: "Prototype",
  qa: "QA",
  launch: "Launch",
  paused: "Paused",
};

const decisionLabels: Record<DecisionStatus, string> = {
  pending: "Pending",
  research_more: "Research more",
  ship: "Ship",
  pivot: "Pivot",
  kill: "Kill",
};

type EditState = Pick<
  Idea,
  | "stage"
  | "decision"
  | "problem_intensity"
  | "frequency"
  | "reachability"
  | "willingness_to_pay"
  | "mvp_speed"
  | "differentiation"
  | "regulatory_risk"
  | "signal"
  | "risk_summary"
  | "next_evidence"
>;

type RiskDraft = {
  title: string;
  area: string;
  severity: RiskSeverity;
  mitigation: string;
};

type ExperimentDraft = {
  name: string;
  success_metric: string;
};

type RunDraft = {
  phase: OrchestrationPhase;
  owner_role: string;
  objective: string;
};

function toEditState(idea: Idea): EditState {
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
  };
}

function scoreState(state: EditState) {
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

function recommendationForScore(score: number): DecisionStatus {
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

function missingEvidence(idea: Idea, state: EditState, riskCount: number) {
  const missing = [];

  if (!idea.one_liner.trim()) {
    missing.push("one-liner");
  }

  if (!idea.target_user.trim()) {
    missing.push("target user");
  }

  if (!idea.buyer.trim()) {
    missing.push("buyer");
  }

  if (!state.signal.trim()) {
    missing.push("signal");
  }

  if (!state.next_evidence.trim()) {
    missing.push("next evidence");
  }

  if (riskCount === 0) {
    missing.push("linked risk");
  }

  return missing;
}

function buildIdeaBriefMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
}) {
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title} (${risk.severity}): ${risk.mitigation || "Mitigation TBD"}`).join("\n")
      : "- No linked risks yet.";

  return `# Idea Brief: ${idea.name}

## Summary

- One-liner: ${idea.one_liner || "TBD"}
- Target user: ${idea.target_user || "TBD"}
- Buyer: ${idea.buyer || "TBD"}
- Stage: ${stageLabels[state.stage]}
- Decision: ${decisionLabels[state.decision]}
- Score: ${score}
- Suggested decision: ${decisionLabels[recommendation]}

## Signal

${state.signal || "TBD"}

## Risk Summary

${state.risk_summary || "TBD"}

## Next Evidence

${state.next_evidence || "TBD"}

## Linked Risks

${riskLines}
`;
}

function buildPrdMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  runs,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title} (${risk.severity}, ${risk.status}): ${risk.mitigation || "TBD"}`).join("\n")
      : "- No linked risks yet.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map((experiment) => `- ${experiment.name} (${experiment.status}): ${experiment.success_metric || "Metric TBD"}`)
          .join("\n")
      : "- No experiments planned yet.";
  const runLines =
    runs.length > 0
      ? runs
          .map(
            (run) =>
              `### ${phaseLabels[run.phase]} (${run.status})\n\nOwner role: ${run.owner_role || "TBD"}\n\nObjective: ${
                run.objective || "TBD"
              }\n\nOutput:\n\n${run.output || "TBD"}`,
          )
          .join("\n\n")
      : "No orchestration runs created yet.";

  return `# PRD: ${idea.name}

## Goal

${idea.one_liner || "TBD"}

## Users

- Target user: ${idea.target_user || "TBD"}
- Buyer: ${idea.buyer || "TBD"}

## Problem Statement

${state.signal || "TBD"}

## Current Decision State

- Stage: ${stageLabels[state.stage]}
- Current decision: ${decisionLabels[state.decision]}
- Venture score: ${score}
- Suggested decision: ${decisionLabels[recommendation]}

## Non-goals

- Do not build beyond the smallest testable MVP until the evidence gaps are cleared.
- Do not collect sensitive personal data without explicit data handling notes.

## Requirements

### Functional

- Capture the core user problem and expected workflow.
- Support the smallest prototype needed to test the next evidence item.
- Keep risks, experiments, and decisions attached to the idea.

### Non-functional

- Keep the first version simple enough to test within 14 days.
- Preserve auth, workspace, RLS, audit, and rollback paths.

### Data

- Idea records
- Risks
- Experiments
- Decisions
- Orchestration runs

### Security and Privacy

${state.risk_summary || "TBD"}

## UX Notes

Use the design orchestration output as the source of truth before build work begins.

## Analytics

- Activation: user reaches the key workflow outcome.
- Validation: experiment success metric is met.
- Risk: unresolved high or critical risks remain visible.

## Verification Plan

${experimentLines}

## Orchestration Notes

${runLines}

## Launch Risks

${riskLines}

## Release Criteria

- Evidence gaps are resolved or explicitly accepted.
- High and critical risks are mitigated or blocked.
- QA and security runs are marked done.
- Final decision is recorded.

## Open Questions

${state.next_evidence || "TBD"}
`;
}

function buildMvpSpecMarkdown({
  idea,
  state,
  experiments,
  runs,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const buildRun = runs.find((run) => run.phase === "build");
  const designRun = runs.find((run) => run.phase === "design");
  const qaRun = runs.find((run) => run.phase === "qa");
  const securityRun = runs.find((run) => run.phase === "security");
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "Success metric TBD"}`)
          .join("\n")
      : "- Define one measurable experiment before build.";

  return `# MVP Spec: ${idea.name}

## Hypothesis

If we build the smallest workflow for ${idea.target_user || "the target user"}, then we can validate ${
    state.next_evidence || "the next evidence item"
  }.

## Must Have

- One focused user journey tied to: ${idea.one_liner || "TBD"}
- Data capture only for fields needed to test the hypothesis.
- Visible risk and experiment tracking for the selected idea.
- Authenticated workspace access.

## Should Have

- Clear empty and error states.
- Copyable or saved artifacts for handoff.
- Basic audit trail through Supabase records.

## Not Yet

- Broad multi-product navigation.
- Advanced automation that touches external accounts.
- Sensitive production data collection without security review.

## Screens

${designRun?.output || "Use the design orchestration output to define screens."}

## Data Model

- ideas
- risks
- decisions
- experiments
- orchestration_runs
- venture_artifacts

## Integrations

- Supabase Auth and Postgres
- Vercel deployment
- Future AI/model calls only after the manual harness is reliable

## Prototype Notes

${buildRun?.output || "Use the build orchestration output to define implementation scope."}

## Verification Plan

${experimentLines}

QA notes:

${qaRun?.output || "QA run output TBD."}

Security notes:

${securityRun?.output || state.risk_summary || "Security run output TBD."}

## Launch Gate

- PRD artifact saved.
- MVP spec artifact saved.
- At least one experiment is planned.
- QA and security runs are done or explicitly accepted as open risk.
`;
}

function buildLaunchChecklistMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
}) {
  const hasPrd = artifacts.some((artifact) => artifact.artifact_type === "prd");
  const hasApprovedPrd = artifacts.some((artifact) => artifact.artifact_type === "prd" && artifact.status === "approved");
  const hasMvpSpec = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasApprovedMvpSpec = artifacts.some(
    (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
  );
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity))
    .map((risk) => `- [ ] ${risk.title} (${risk.severity}, ${risk.status})`);
  const donePhases = new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
  const plannedExperimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- [ ] ${experiment.name}: ${experiment.success_metric || "Metric TBD"}`).join("\n")
      : "- [ ] Add one measurable experiment.";

  return `# Launch Checklist: ${idea.name}

## Decision

- Current decision: ${decisionLabels[state.decision]}
- Current stage: ${stageLabels[state.stage]}
- Next evidence: ${state.next_evidence || "TBD"}

## Product Artifacts

- [${hasPrd ? "x" : " "}] PRD artifact saved
- [${hasApprovedPrd ? "x" : " "}] PRD artifact approved
- [${hasMvpSpec ? "x" : " "}] MVP spec artifact saved
- [${hasApprovedMvpSpec ? "x" : " "}] MVP spec artifact approved
- [${artifacts.some((artifact) => artifact.artifact_type === "idea_brief") ? "x" : " "}] Idea brief artifact saved

## Orchestration Gates

- [${donePhases.has("strategy") ? "x" : " "}] Strategy run complete
- [${donePhases.has("research") ? "x" : " "}] Research run complete
- [${donePhases.has("product") ? "x" : " "}] Product run complete
- [${donePhases.has("design") ? "x" : " "}] Design run complete
- [${donePhases.has("build") ? "x" : " "}] Build run complete
- [${donePhases.has("qa") ? "x" : " "}] QA run complete
- [${donePhases.has("security") ? "x" : " "}] Security run complete
- [${donePhases.has("launch") ? "x" : " "}] Launch run complete

## Experiment Gate

${plannedExperimentLines}

## Risk Gate

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- [x] No high or critical linked risks currently visible."}

## Operational Gate

- [ ] Core journey tested in production-like environment
- [ ] Error and empty states reviewed
- [ ] Supabase RLS verified for workspace records
- [ ] Vercel environment variables verified
- [ ] Rollback path named
- [ ] Final decision recorded
`;
}

export function IdeaWorkbench({
  initialIdeas,
  initialRisks,
  initialDecisions,
  initialExperiments,
  initialOrchestrationRuns,
  initialArtifacts,
}: {
  initialIdeas: Idea[];
  initialRisks: Risk[];
  initialDecisions: Decision[];
  initialExperiments: Experiment[];
  initialOrchestrationRuns: OrchestrationRun[];
  initialArtifacts: VentureArtifact[];
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [risks, setRisks] = useState(initialRisks);
  const [decisionLog, setDecisionLog] = useState(initialDecisions);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [orchestrationRuns, setOrchestrationRuns] = useState(initialOrchestrationRuns);
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [selectedIdeaId, setSelectedIdeaId] = useState(initialIdeas[0]?.id ?? "");
  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId) ?? ideas[0] ?? null;
  const [editState, setEditState] = useState<EditState | null>(selectedIdea ? toEditState(selectedIdea) : null);
  const [riskDraft, setRiskDraft] = useState<RiskDraft>({
    title: "",
    area: "",
    severity: "medium",
    mitigation: "",
  });
  const [decisionReason, setDecisionReason] = useState("");
  const [experimentDraft, setExperimentDraft] = useState<ExperimentDraft>({ name: "", success_metric: "" });
  const [runDraft, setRunDraft] = useState<RunDraft>({
    phase: "strategy",
    owner_role: "strategy-reviewer",
    objective: orchestrationPhaseConfigs[0].objective,
  });
  const [runOutputs, setRunOutputs] = useState<Record<string, string>>(
    Object.fromEntries(initialOrchestrationRuns.map((run) => [run.id, run.output])),
  );
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMember[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "mine" | "read_only">("all");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    async function loadMemberships(nextUser: User | null) {
      if (!supabase || !nextUser) {
        setMemberships([]);
        return;
      }

      const { data } = await supabase.from("organization_members").select("*");
      setMemberships(data ?? []);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      void loadMemberships(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void loadMemberships(nextUser);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const selectedRisks = useMemo(
    () => risks.filter((risk) => risk.idea_id === selectedIdea?.id || risk.idea_id === null),
    [risks, selectedIdea?.id],
  );

  const selectedDecisions = useMemo(
    () => decisionLog.filter((entry) => entry.idea_id === selectedIdea?.id).slice(0, 4),
    [decisionLog, selectedIdea?.id],
  );

  const selectedExperiments = useMemo(
    () => experiments.filter((experiment) => experiment.idea_id === selectedIdea?.id).slice(0, 5),
    [experiments, selectedIdea?.id],
  );

  const selectedRuns = useMemo(
    () =>
      orchestrationRuns
        .filter((run) => run.idea_id === selectedIdea?.id)
        .sort((a, b) => (phaseOrder.get(a.phase) ?? 99) - (phaseOrder.get(b.phase) ?? 99)),
    [orchestrationRuns, selectedIdea?.id],
  );

  const selectedArtifactRecords = useMemo(
    () =>
      artifacts
        .filter((artifact) => artifact.idea_id === selectedIdea?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [artifacts, selectedIdea?.id],
  );
  const selectedArtifacts = useMemo(() => selectedArtifactRecords.slice(0, 8), [selectedArtifactRecords]);

  const canAdminSelectedOrganization = Boolean(
    user &&
      selectedIdea?.organization_id &&
      memberships.some(
        (membership) =>
          membership.user_id === user.id &&
          membership.organization_id === selectedIdea.organization_id &&
          adminRoles.has(membership.role),
      ),
  );
  const canEdit = Boolean(user && (selectedIdea?.created_by === user.id || canAdminSelectedOrganization));
  function canManageRecord(record: { created_by: string | null; organization_id: string | null }) {
    return Boolean(
      user &&
        (record.created_by === user.id ||
          (record.organization_id &&
            memberships.some(
              (membership) =>
                membership.user_id === user.id &&
                membership.organization_id === record.organization_id &&
                adminRoles.has(membership.role),
            ))),
    );
  }
  const currentScore = editState ? scoreState(editState) : 0;
  const scoreRecommendation = recommendationForScore(currentScore);
  const missing =
    selectedIdea && editState ? missingEvidence(selectedIdea, editState, selectedRisks.filter((risk) => risk.idea_id).length) : [];
  const ideaBrief = selectedIdea && editState
    ? buildIdeaBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedRisks.filter((risk) => risk.idea_id === selectedIdea.id),
      })
    : "";
  const prdDraft = selectedIdea && editState
    ? buildPrdMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedRisks.filter((risk) => risk.idea_id === selectedIdea.id),
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const mvpSpecDraft = selectedIdea && editState
    ? buildMvpSpecMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const launchChecklistDraft = selectedIdea && editState
    ? buildLaunchChecklistMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedRisks.filter((risk) => risk.idea_id === selectedIdea.id),
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const launchReadiness = selectedIdea && editState
    ? [
        {
          label: "Evidence complete",
          passed: missing.length === 0,
          detail: missing.length === 0 ? "No basic evidence gaps" : missing.join(", "),
        },
        {
          label: "PRD approved",
          passed: selectedArtifactRecords.some(
            (artifact) => artifact.artifact_type === "prd" && artifact.status === "approved",
          ),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "prd")
            ? "Draft saved, approval required"
            : "PRD artifact required",
        },
        {
          label: "MVP spec approved",
          passed: selectedArtifactRecords.some(
            (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
          ),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "mvp_spec")
            ? "Draft saved, approval required"
            : "MVP scope required",
        },
        {
          label: "Experiment planned",
          passed: selectedExperiments.length > 0,
          detail: selectedExperiments[0]?.success_metric || "Success metric required",
        },
        {
          label: "QA gate",
          passed: selectedRuns.some((run) => run.phase === "qa" && run.status === "done"),
          detail: "QA run must be done",
        },
        {
          label: "Security gate",
          passed: selectedRuns.some((run) => run.phase === "security" && run.status === "done"),
          detail: "Security run must be done",
        },
        {
          label: "High risks closed",
          passed: selectedRisks
            .filter((risk) => risk.idea_id === selectedIdea.id)
            .every((risk) => !["high", "critical"].includes(risk.severity) || risk.status === "closed"),
          detail: "High and critical risks must be closed or accepted",
        },
        {
          label: "Decision recorded",
          passed: editState.decision !== "pending" && selectedDecisions.length > 0,
          detail: `${decisionLabels[editState.decision]} / ${selectedDecisions.length} record(s)`,
        },
      ]
    : [];
  const launchReadinessScore =
    launchReadiness.length === 0
      ? 0
      : Math.round((launchReadiness.filter((check) => check.passed).length / launchReadiness.length) * 100);
  const visibleIdeas = useMemo(() => {
    if (filterMode === "mine") {
      return ideas.filter((idea) => user && idea.created_by === user.id);
    }

    if (filterMode === "read_only") {
      return ideas.filter((idea) => !user || idea.created_by !== user.id);
    }

    return ideas;
  }, [filterMode, ideas, user]);

  async function saveIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea || !editState) {
      setMessage("Select an idea first.");
      return;
    }

    if (!canEdit) {
      setMessage("This idea is read-only for the current operator.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("ideas")
      .update(editState)
      .eq("id", selectedIdea.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setIdeas((current) => current.map((idea) => (idea.id === data.id ? data : idea)));
    setMessage("Idea updated.");
    router.refresh();
  }

  async function addRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("Select an idea first.");
      return;
    }

    if (!user) {
      setMessage("Sign in before adding risk records.");
      return;
    }

    if (!riskDraft.title.trim()) {
      setMessage("Risk title is required.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("risks")
      .insert({
        idea_id: selectedIdea.id,
        title: riskDraft.title.trim(),
        area: riskDraft.area.trim(),
        severity: riskDraft.severity,
        mitigation: riskDraft.mitigation.trim(),
        status: "open",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRisks((current) => [data, ...current]);
    setRiskDraft({ title: "", area: "", severity: "medium", mitigation: "" });
    setMessage("Risk added.");
    router.refresh();
  }

  async function recordDecision() {
    if (!supabase || !selectedIdea || !editState) {
      setMessage("Select an idea first.");
      return;
    }

    if (!canEdit) {
      setMessage("Only the owner can record a decision for this idea.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const [ideaResult, decisionResult] = await Promise.all([
      supabase.from("ideas").update({ decision: editState.decision }).eq("id", selectedIdea.id).select().single(),
      supabase
        .from("decisions")
        .insert({
          idea_id: selectedIdea.id,
          decision: editState.decision,
          reason: decisionReason.trim(),
          organization_id: selectedIdea.organization_id,
        })
        .select()
        .single(),
    ]);
    setIsBusy(false);

    if (ideaResult.error || decisionResult.error) {
      setMessage(ideaResult.error?.message ?? decisionResult.error?.message ?? "Decision could not be recorded.");
      return;
    }

    setIdeas((current) => current.map((idea) => (idea.id === ideaResult.data.id ? ideaResult.data : idea)));
    setDecisionLog((current) => [decisionResult.data, ...current]);
    setDecisionReason("");
    setMessage("Decision recorded.");
    router.refresh();
  }

  async function addExperiment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("Select an idea first.");
      return;
    }

    if (!user) {
      setMessage("Sign in before adding experiments.");
      return;
    }

    if (!experimentDraft.name.trim()) {
      setMessage("Experiment name is required.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("experiments")
      .insert({
        idea_id: selectedIdea.id,
        name: experimentDraft.name.trim(),
        success_metric: experimentDraft.success_metric.trim(),
        status: "planned",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setExperiments((current) => [data, ...current]);
    setExperimentDraft({ name: "", success_metric: "" });
    setMessage("Experiment added.");
    router.refresh();
  }

  async function addOrchestrationRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("Select an idea first.");
      return;
    }

    if (!user) {
      setMessage("Sign in before adding orchestration runs.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .insert({
        idea_id: selectedIdea.id,
        phase: runDraft.phase,
        owner_role: runDraft.owner_role.trim(),
        objective: runDraft.objective.trim(),
        status: "planned",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => [data, ...current]);
    setRunOutputs((current) => ({ ...current, [data.id]: data.output }));
    setMessage("Orchestration run added.");
    router.refresh();
  }

  async function createRunbook() {
    if (!supabase || !selectedIdea) {
      setMessage("Select an idea first.");
      return;
    }

    if (!user) {
      setMessage("Sign in before creating an orchestration runbook.");
      return;
    }

    const existingPhases = new Set(selectedRuns.map((run) => run.phase));
    const missingRuns = orchestrationPhaseConfigs
      .filter((config) => !existingPhases.has(config.phase))
      .map((config) => ({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        phase: config.phase,
        owner_role: config.ownerRole,
        objective: config.objective,
        status: "planned" as OrchestrationStatus,
      }));

    if (missingRuns.length === 0) {
      setMessage("Full orchestration runbook already exists for this idea.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase.from("orchestration_runs").insert(missingRuns).select();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => [...(data ?? []), ...current]);
    setRunOutputs((current) => ({
      ...current,
      ...Object.fromEntries((data ?? []).map((run) => [run.id, run.output])),
    }));
    setMessage("Full orchestration runbook created.");
    router.refresh();
  }

  async function updateExperimentStatus(experiment: Experiment, status: string) {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (!canManageRecord(experiment)) {
      setMessage("Only the experiment owner or workspace admin can update this experiment.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("experiments")
      .update({
        status,
        started_at: status === "running" ? now : experiment.started_at,
        ended_at: status === "done" ? now : experiment.ended_at,
      })
      .eq("id", experiment.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setExperiments((current) => current.map((item) => (item.id === data.id ? data : item)));
    setMessage(`Experiment marked ${status}.`);
    router.refresh();
  }

  async function updateRunStatus(run: OrchestrationRun, status: OrchestrationStatus) {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("Only the run owner or workspace admin can update this orchestration run.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .update({ status })
      .eq("id", run.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.map((item) => (item.id === data.id ? data : item)));
    setMessage(`${phaseLabels[run.phase]} marked ${status}.`);
    router.refresh();
  }

  async function saveRunOutput(run: OrchestrationRun) {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("Only the run owner or workspace admin can save this orchestration output.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .update({ output: runOutputs[run.id] ?? "" })
      .eq("id", run.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.map((item) => (item.id === data.id ? data : item)));
    setRunOutputs((current) => ({ ...current, [data.id]: data.output }));
    setMessage(`${phaseLabels[run.phase]} output saved.`);
    router.refresh();
  }

  async function saveArtifactDraft(artifactType: VentureArtifactType, title: string, body: string, source: string) {
    if (!supabase || !selectedIdea) {
      setMessage("Select an idea first.");
      return;
    }

    if (!user) {
      setMessage("Sign in before saving artifacts.");
      return;
    }

    if (!body.trim()) {
      setMessage("Artifact body is empty.");
      return;
    }

    const nextVersion =
      Math.max(
        0,
        ...selectedArtifactRecords
          .filter((artifact) => artifact.artifact_type === artifactType)
          .map((artifact) => artifact.version ?? 1),
      ) + 1;

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("venture_artifacts")
      .insert({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        artifact_type: artifactType,
        status: "draft",
        version: nextVersion,
        title,
        body,
        source,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setArtifacts((current) => [data, ...current]);
    setMessage(`${artifactLabels[artifactType]} artifact v${nextVersion} saved.`);
    router.refresh();
  }

  async function updateArtifactStatus(artifact: VentureArtifact, status: VentureArtifactStatus) {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (!canManageRecord(artifact)) {
      setMessage("Only the artifact owner or workspace admin can update this artifact.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("venture_artifacts")
      .update({
        status,
        approved_by: status === "approved" ? user?.id ?? null : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", artifact.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setArtifacts((current) => current.map((item) => (item.id === data.id ? data : item)));
    setMessage(`${artifact.title || artifactLabels[artifact.artifact_type]} marked ${artifactStatusLabels[status]}.`);
    router.refresh();
  }

  async function updateRiskStatus(risk: Risk, status: string) {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (!canManageRecord(risk)) {
      setMessage("Only the risk owner or workspace admin can update this risk.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("risks")
      .update({ status })
      .eq("id", risk.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRisks((current) => current.map((item) => (item.id === data.id ? data : item)));
    setMessage(`Risk marked ${status}.`);
    router.refresh();
  }

  async function copyIdeaBrief() {
    if (!ideaBrief) {
      return;
    }

    await navigator.clipboard.writeText(ideaBrief);
    setCopyMessage("Idea brief copied.");
  }

  async function copyPrdDraft() {
    if (!prdDraft) {
      return;
    }

    await navigator.clipboard.writeText(prdDraft);
    setCopyMessage("PRD draft copied.");
  }

  async function copyMvpSpecDraft() {
    if (!mvpSpecDraft) {
      return;
    }

    await navigator.clipboard.writeText(mvpSpecDraft);
    setCopyMessage("MVP spec copied.");
  }

  async function copyLaunchChecklistDraft() {
    if (!launchChecklistDraft) {
      return;
    }

    await navigator.clipboard.writeText(launchChecklistDraft);
    setCopyMessage("Launch checklist copied.");
  }

  if (!selectedIdea || !editState) {
    return null;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Idea workbench</h2>
            <p className="mt-1 text-sm text-slate-500">Select an idea, score it, and move it through the lab.</p>
          </div>
          <ClipboardList className="text-blue-600" size={24} />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
          {[
            ["all", "All"],
            ["mine", "Mine"],
            ["read_only", "Read-only"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilterMode(value as "all" | "mine" | "read_only")}
              className={`h-9 rounded-md text-sm font-semibold transition ${
                filterMode === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {visibleIdeas.length > 0 ? (
            visibleIdeas.map((idea) => {
              const isOwned = Boolean(user && idea.created_by === user.id);
              const isOrgAdmin = Boolean(
                user &&
                  idea.organization_id &&
                  memberships.some(
                    (membership) =>
                      membership.user_id === user.id &&
                      membership.organization_id === idea.organization_id &&
                      adminRoles.has(membership.role),
                  ),
              );

              return (
            <button
              key={idea.id}
              type="button"
              onClick={() => {
                setSelectedIdeaId(idea.id);
                setEditState(toEditState(idea));
              }}
              className={`rounded-lg border p-4 text-left transition ${
                idea.id === selectedIdea.id
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-950">{idea.name}</span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {stageLabels[idea.stage]}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      isOwned || isOrgAdmin ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isOwned ? "Editable" : isOrgAdmin ? "Org admin" : "Read-only"}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{idea.one_liner || idea.signal}</p>
            </button>
              );
            })
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No ideas match this filter yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={saveIdea} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{selectedIdea.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {canEdit
                  ? "Editable by current operator."
                  : "Read-only unless you created this idea. Create a fresh idea to score it directly."}
              </p>
            </div>
            <button
              type="submit"
              disabled={isBusy || !canEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              Save score
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Stage"
              value={editState.stage}
              options={stages}
              labels={stageLabels}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, stage: value as IdeaStage })}
            />
            <SelectField
              label="Decision"
              value={editState.decision}
              options={decisions}
              labels={decisionLabels}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, decision: value as DecisionStatus })}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ScoreInput
              label="Problem"
              value={editState.problem_intensity}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, problem_intensity: value })}
            />
            <ScoreInput
              label="Frequency"
              value={editState.frequency}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, frequency: value })}
            />
            <ScoreInput
              label="Reachability"
              value={editState.reachability}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, reachability: value })}
            />
            <ScoreInput
              label="Willingness"
              value={editState.willingness_to_pay}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, willingness_to_pay: value })}
            />
            <ScoreInput
              label="MVP speed"
              value={editState.mvp_speed}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, mvp_speed: value })}
            />
            <ScoreInput
              label="Differentiation"
              value={editState.differentiation}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, differentiation: value })}
            />
            <ScoreInput
              label="Risk penalty"
              value={editState.regulatory_risk}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, regulatory_risk: value })}
            />
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Score</div>
              <div className="mt-2 text-3xl font-semibold text-blue-950">{currentScore}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[0.65fr_1.35fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Suggested decision
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">
                {decisionLabels[scoreRecommendation]}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The score gate is advisory. Record the final decision only after reviewing evidence and risk.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950">Evidence gaps</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {missing.length > 0 ? (
                  missing.map((item) => (
                    <span key={item} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Ready for PRD review
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <TextArea
              label="Signal"
              value={editState.signal}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, signal: value })}
            />
            <TextArea
              label="Risk summary"
              value={editState.risk_summary}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, risk_summary: value })}
            />
            <TextArea
              label="Next evidence"
              value={editState.next_evidence}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, next_evidence: value })}
            />
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Launch readiness</h2>
              <p className="mt-1 text-sm text-slate-500">A live gate summary from evidence, artifacts, risks, and runs.</p>
            </div>
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-right text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Ready</div>
              <div className="mt-1 text-2xl font-semibold">{launchReadinessScore}%</div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {launchReadiness.map((check) => (
              <div key={check.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400"}
                    size={18}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{check.label}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{check.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Orchestration board</h2>
              <p className="mt-1 text-sm text-slate-500">Track each specialist pass from strategy through launch.</p>
            </div>
            <button
              type="button"
              onClick={createRunbook}
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={18} />
              Create runbook
            </button>
          </div>

          <form onSubmit={addOrchestrationRun} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[0.75fr_1fr]">
              <SelectField
                label="Phase"
                value={runDraft.phase}
                options={orchestrationPhaseConfigs.map((config) => config.phase)}
                labels={phaseLabels}
                disabled={!user}
                onChange={(value) => {
                  const nextPhase = value as OrchestrationPhase;
                  const config = orchestrationPhaseConfigs.find((item) => item.phase === nextPhase);
                  setRunDraft({
                    phase: nextPhase,
                    owner_role: config?.ownerRole ?? runDraft.owner_role,
                    objective: config?.objective ?? runDraft.objective,
                  });
                }}
              />
              <InputField
                label="Owner role"
                value={runDraft.owner_role}
                onChange={(value) => setRunDraft({ ...runDraft, owner_role: value })}
              />
            </div>
            <TextArea
              label="Objective"
              value={runDraft.objective}
              disabled={!user}
              onChange={(value) => setRunDraft({ ...runDraft, objective: value })}
            />
            <button
              type="submit"
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={18} />
              Add phase
            </button>
          </form>

          <div className="mt-4 grid gap-3">
            {selectedRuns.length > 0 ? (
              selectedRuns.map((run) => (
                <div key={run.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">{phaseLabels[run.phase]}</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${runStatusTone[run.status]}`}>
                          {run.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{run.objective || "Objective TBD"}</p>
                      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {run.owner_role || "unassigned"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orchestrationStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateRunStatus(run, status)}
                          disabled={isBusy || !canManageRecord(run) || run.status === status}
                          className="h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <TextArea
                      label="Output"
                      value={runOutputs[run.id] ?? run.output}
                      disabled={!canManageRecord(run)}
                      onChange={(value) => setRunOutputs((current) => ({ ...current, [run.id]: value }))}
                    />
                    <button
                      type="button"
                      onClick={() => saveRunOutput(run)}
                      disabled={isBusy || !canManageRecord(run) || (runOutputs[run.id] ?? run.output) === run.output}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Save size={16} />
                      Save output
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No orchestration runs attached yet.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={addRisk} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Add risk</h2>
                <p className="mt-1 text-sm text-slate-500">Attach launch blockers to the selected idea.</p>
              </div>
              <ShieldAlert className="text-rose-600" size={22} />
            </div>
            <div className="grid gap-3">
              <InputField
                label="Title"
                value={riskDraft.title}
                onChange={(value) => setRiskDraft({ ...riskDraft, title: value })}
              />
              <InputField
                label="Area"
                value={riskDraft.area}
                onChange={(value) => setRiskDraft({ ...riskDraft, area: value })}
              />
              <SelectField
                label="Severity"
                value={riskDraft.severity}
                options={riskSeverities}
                disabled={!user}
                onChange={(value) => setRiskDraft({ ...riskDraft, severity: value as RiskSeverity })}
              />
              <TextArea
                label="Mitigation"
                value={riskDraft.mitigation}
                disabled={!user}
                onChange={(value) => setRiskDraft({ ...riskDraft, mitigation: value })}
              />
              <button
                type="submit"
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flag size={18} />
                Add risk
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Record decision</h2>
                <p className="mt-1 text-sm text-slate-500">Write down why this idea moves or stops.</p>
              </div>
              <CheckCircle2 className="text-emerald-600" size={22} />
            </div>
            <div className="grid gap-3">
              <TextArea
                label="Reason"
                value={decisionReason}
                disabled={!canEdit}
                onChange={(value) => setDecisionReason(value)}
              />
              <button
                type="button"
                onClick={recordDecision}
                disabled={isBusy || !canEdit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                Record {decisionLabels[editState.decision]}
              </button>
              <div className="mt-2 grid gap-2">
                {selectedDecisions.length > 0 ? (
                  selectedDecisions.map((entry) => (
                    <div key={entry.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-950">{decisionLabels[entry.decision]}</span>
                      {entry.reason ? ` - ${entry.reason}` : ""}
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No decisions recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Experiment plan</h2>
              <p className="mt-1 text-sm text-slate-500">Define the next smallest test for the selected idea.</p>
            </div>
            <Beaker className="text-violet-600" size={22} />
          </div>
          <form onSubmit={addExperiment} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <InputField
              label="Experiment"
              value={experimentDraft.name}
              onChange={(value) => setExperimentDraft({ ...experimentDraft, name: value })}
            />
            <InputField
              label="Success metric"
              value={experimentDraft.success_metric}
              onChange={(value) => setExperimentDraft({ ...experimentDraft, success_metric: value })}
            />
            <button
              type="submit"
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Beaker size={18} />
              Add test
            </button>
          </form>
          <div className="mt-4 grid gap-3">
            {selectedExperiments.length > 0 ? (
              selectedExperiments.map((experiment) => (
                <div key={experiment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{experiment.name}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {experiment.status}
                    </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["planned", "running", "done"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateExperimentStatus(experiment, status)}
                          disabled={isBusy || !canManageRecord(experiment) || experiment.status === status}
                          className="h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {experiment.success_metric || "Success metric TBD"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No experiments attached yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Relevant risks</h2>
          <div className="mt-4 grid gap-3">
            {selectedRisks.map((risk) => (
              <div key={risk.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{risk.title}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {risk.severity}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {risk.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["open", "mitigating", "closed"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateRiskStatus(risk, status)}
                        disabled={isBusy || !canManageRecord(risk) || risk.status === status}
                        className="h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Idea brief draft</h2>
              <p className="mt-1 text-sm text-slate-500">Copy this into the PRD or research workflow.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyIdeaBrief}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                Copy brief
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft("idea_brief", `${selectedIdea.name} idea brief`, ideaBrief, "workbench")
                }
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                Save artifact
              </button>
            </div>
          </div>
          <textarea
            value={ideaBrief}
            readOnly
            rows={12}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
          {copyMessage ? <p className="mt-3 text-sm text-slate-600">{copyMessage}</p> : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">PRD draft</h2>
              <p className="mt-1 text-sm text-slate-500">
                Generated from score, evidence, risks, experiments, and orchestration outputs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyPrdDraft}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                Copy PRD
              </button>
              <button
                type="button"
                onClick={() => saveArtifactDraft("prd", `${selectedIdea.name} PRD`, prdDraft, "workbench")}
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                Save artifact
              </button>
            </div>
          </div>
          <textarea
            value={prdDraft}
            readOnly
            rows={18}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">MVP spec draft</h2>
                <p className="mt-1 text-sm text-slate-500">Generated from PRD evidence, experiments, and build gates.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyMvpSpecDraft}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Clipboard size={18} />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft("mvp_spec", `${selectedIdea.name} MVP spec`, mvpSpecDraft, "workbench")
                  }
                  disabled={isBusy || !user}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>
            <textarea
              value={mvpSpecDraft}
              readOnly
              rows={16}
              className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Launch checklist draft</h2>
                <p className="mt-1 text-sm text-slate-500">Generated from artifacts, orchestration gates, risks, and tests.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLaunchChecklistDraft}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Clipboard size={18} />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "launch_checklist",
                      `${selectedIdea.name} launch checklist`,
                      launchChecklistDraft,
                      "workbench",
                    )
                  }
                  disabled={isBusy || !user}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>
            <textarea
              value={launchChecklistDraft}
              readOnly
              rows={16}
              className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">Artifact library</h2>
            <p className="mt-1 text-sm text-slate-500">Saved idea artifacts for the selected workspace record.</p>
          </div>
          <div className="grid gap-3">
            {selectedArtifacts.length > 0 ? (
              selectedArtifacts.map((artifact) => {
                const status = artifact.status ?? "draft";

                return (
                  <div key={artifact.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{artifact.title || "Untitled"}</span>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                            {artifactLabels[artifact.artifact_type]}
                          </span>
                          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${artifactStatusTone[status]}`}>
                            {artifactStatusLabels[status]}
                          </span>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                            v{artifact.version ?? 1}
                          </span>
                        </div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {artifact.source || "manual"} / {new Date(artifact.created_at).toLocaleDateString()}
                          {artifact.approved_at ? ` / approved ${new Date(artifact.approved_at).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(artifact.body)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                        >
                          <Clipboard size={14} />
                          Copy
                        </button>
                        {(["draft", "approved", "archived"] as VentureArtifactStatus[]).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            onClick={() => updateArtifactStatus(artifact, nextStatus)}
                            disabled={isBusy || !canManageRecord(artifact) || status === nextStatus}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {artifactStatusLabels[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No artifacts saved yet.
              </div>
            )}
          </div>
        </div>

        {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}

function clampScore(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(5, Math.max(0, value));
}

function ScoreInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span className="flex items-center justify-between gap-3">
        {label}
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{value}/5</span>
      </span>
      <input
        type="range"
        min={0}
        max={5}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampScore(Number(event.target.value)))}
      />
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        disabled={disabled}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  labels,
  disabled,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  labels?: Record<T, string>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
