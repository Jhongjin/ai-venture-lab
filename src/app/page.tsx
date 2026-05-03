import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Database,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Radar,
  ShieldCheck,
} from "lucide-react";

import { getConsoleData, scoreIdea } from "@/lib/venture-data";
import type { DecisionStatus, IdeaStage, RiskSeverity } from "@/lib/supabase/types";
import { VentureConsoleActions } from "@/components/venture-console-actions";

export const dynamic = "force-dynamic";

const pipeline: Array<{ label: string; value: string; tone: string }> = [
  { label: "Intake", value: "Idea brief", tone: "bg-blue-50 text-blue-700" },
  { label: "Research", value: "Market + risk", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Score", value: "Kill or promote", tone: "bg-amber-50 text-amber-700" },
  { label: "Prototype", value: "MVP surface", tone: "bg-rose-50 text-rose-700" },
  { label: "Gate", value: "QA + security", tone: "bg-violet-50 text-violet-700" },
];

const gates = [
  "Problem frequency is explicit",
  "User and buyer are named",
  "MVP is testable within 14 days",
  "Regulatory and privacy risks are logged",
  "Prototype has a verification path",
];

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
  ship: "Ship",
  pivot: "Pivot",
  kill: "Kill",
  research_more: "Research",
  pending: "Pending",
};

const severityTone: Record<RiskSeverity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
  critical: "bg-red-600 text-white",
};

export default async function Home() {
  const { ideas, risks, source, error } = await getConsoleData();
  const topIdea = [...ideas].sort((a, b) => scoreIdea(b) - scoreIdea(a))[0];
  const openRisks = risks.filter((risk) => risk.status.toLowerCase() === "open").length;
  const highRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              <FlaskConical size={18} />
              AI Venture Lab
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Idea-to-MVP command center
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              A structured harness for screening app ideas, turning the best ones into
              specs, building prototypes, and running QA, debugging, privacy, and security
              gates before launch.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[560px]">
            {[
              ["Ideas", String(ideas.length)],
              ["Open risks", String(openRisks)],
              ["High risks", String(highRisks)],
              ["Data", source],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-2xl font-semibold capitalize text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </header>

        {error ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase read failed, so the console is showing seed data. Error: {error}
          </section>
        ) : null}

        <VentureConsoleActions />

        <section className="grid gap-4 lg:grid-cols-5">
          {pipeline.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${item.tone}`}>
                {item.label}
              </span>
              <p className="mt-4 text-lg font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Current portfolio</h2>
                <p className="mt-1 text-sm text-slate-500">Move each idea through the same evidence gate.</p>
              </div>
              <Radar className="text-blue-600" size={24} />
            </div>
            <div className="grid gap-3">
              {ideas.map((idea) => (
                <article
                  key={idea.id}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_132px]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">{idea.name}</h3>
                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {decisionLabels[idea.decision]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{idea.signal || idea.one_liner}</p>
                    <p className="mt-1 text-sm text-slate-500">Risk: {idea.risk_summary}</p>
                    <p className="mt-1 text-sm text-slate-500">Next: {idea.next_evidence}</p>
                  </div>
                  <div className="flex items-start gap-2 md:flex-col md:items-end">
                    <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {stageLabels[idea.stage]}
                    </span>
                    <span className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
                      Score {scoreIdea(idea)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Promotion gate</h2>
                <p className="mt-1 text-sm text-slate-300">No PRD until the idea clears the basics.</p>
              </div>
              <ClipboardCheck className="text-emerald-300" size={24} />
            </div>
            <div className="grid gap-3">
              {gates.map((gate) => (
                <div key={gate} className="flex items-start gap-3 rounded-lg bg-white/7 p-3">
                  <BadgeCheck className="mt-0.5 shrink-0 text-emerald-300" size={18} />
                  <span className="text-sm leading-6 text-slate-100">{gate}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-white/7 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Current leader
              </div>
              <div className="mt-2 text-lg font-semibold">{topIdea?.name ?? "No idea yet"}</div>
              <div className="mt-1 text-sm text-slate-300">
                {topIdea ? `Score ${scoreIdea(topIdea)} with ${decisionLabels[topIdea.decision]} decision` : "Add an idea to start scoring."}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Data connection</h2>
                <p className="mt-1 text-sm text-slate-500">The console reads Supabase when env and schema are ready.</p>
              </div>
              <Database className={source === "supabase" ? "text-emerald-600" : "text-slate-500"} size={24} />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Source: <span className="capitalize">{source}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If this says seed, run the migration in `supabase/migrations` and confirm Vercel env values.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Risk register</h2>
                <p className="mt-1 text-sm text-slate-500">Launch blockers stay visible from the first prototype.</p>
              </div>
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <div className="grid gap-3">
              {risks.map((risk) => (
                <div key={risk.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">{risk.title}</h3>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${severityTone[risk.severity]}`}>
                      {risk.severity}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {risk.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <GitBranch className="text-blue-600" size={24} />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Repo harness</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              AGENTS.md, docs, templates, skills, hooks, and scripts keep agent work repeatable.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <Activity className="text-amber-600" size={24} />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Quality loop</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use pnpm quality and pnpm harness:check before shipping meaningful changes.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="text-emerald-600" size={24} />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Security first</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sensitive domains require PII, consent, retention, abuse, and compliance review.
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole size={18} className="text-slate-500" />
            Keep secrets out of git. Add only public anon Supabase values to client-visible variables.
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            Next step: create first real idea workflow
            <ArrowRight size={16} />
          </div>
        </footer>
      </div>
    </main>
  );
}
