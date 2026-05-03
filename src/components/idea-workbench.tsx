"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Beaker, CheckCircle2, Clipboard, ClipboardList, Flag, RefreshCw, Save, ShieldAlert } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Decision, Experiment, Idea, Risk } from "@/lib/venture-data";
import type { DecisionStatus, IdeaStage, RiskSeverity } from "@/lib/supabase/types";

const stages: IdeaStage[] = ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"];
const decisions: DecisionStatus[] = ["pending", "research_more", "ship", "pivot", "kill"];
const riskSeverities: RiskSeverity[] = ["low", "medium", "high", "critical"];

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

export function IdeaWorkbench({
  initialIdeas,
  initialRisks,
  initialDecisions,
  initialExperiments,
}: {
  initialIdeas: Idea[];
  initialRisks: Risk[];
  initialDecisions: Decision[];
  initialExperiments: Experiment[];
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [risks, setRisks] = useState(initialRisks);
  const [decisionLog, setDecisionLog] = useState(initialDecisions);
  const [experiments, setExperiments] = useState(initialExperiments);
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
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "mine" | "read_only">("all");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  const canEdit = Boolean(user && selectedIdea?.created_by === user.id);
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

  async function updateExperimentStatus(experiment: Experiment, status: string) {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (!user || experiment.created_by !== user.id) {
      setMessage("Only the experiment owner can update this experiment.");
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

  async function copyIdeaBrief() {
    if (!ideaBrief) {
      return;
    }

    await navigator.clipboard.writeText(ideaBrief);
    setCopyMessage("Idea brief copied.");
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
                      isOwned ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isOwned ? "Editable" : "Read-only"}
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
                          disabled={isBusy || !user || experiment.created_by !== user.id || experiment.status === status}
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-950">{risk.title}</span>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    {risk.severity}
                  </span>
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
            <button
              type="button"
              onClick={copyIdeaBrief}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Clipboard size={18} />
              Copy brief
            </button>
          </div>
          <textarea
            value={ideaBrief}
            readOnly
            rows={12}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
          {copyMessage ? <p className="mt-3 text-sm text-slate-600">{copyMessage}</p> : null}
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
