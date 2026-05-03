import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Radar,
  ShieldCheck,
} from "lucide-react";

const pipeline = [
  { label: "Intake", value: "Idea brief", tone: "bg-blue-50 text-blue-700" },
  { label: "Research", value: "Market + risk", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Score", value: "Kill or promote", tone: "bg-amber-50 text-amber-700" },
  { label: "Prototype", value: "MVP surface", tone: "bg-rose-50 text-rose-700" },
  { label: "Gate", value: "QA + security", tone: "bg-violet-50 text-violet-700" },
];

const ideas = [
  {
    name: "Care ops console",
    stage: "Research",
    signal: "High structural demand, regulated workflow",
    risk: "Long-term care rules and PII handling",
  },
  {
    name: "Conversation coach",
    stage: "Score",
    signal: "Fast MVP, clear daily utility",
    risk: "Must avoid therapy or legal advice claims",
  },
  {
    name: "Subscription agent",
    stage: "Intake",
    signal: "Clear money-saving hook",
    risk: "Account access, payment data, consent",
  },
];

const gates = [
  "Problem frequency is explicit",
  "User and buyer are named",
  "MVP is testable within 14 days",
  "Regulatory and privacy risks are logged",
  "Prototype has a verification path",
];

export default function Home() {
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
            {[
              ["Ideas", "3"],
              ["Active gates", "5"],
              ["Skills", "8"],
              ["Decision", "pending"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </header>

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
                  key={idea.name}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_120px]"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{idea.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{idea.signal}</p>
                    <p className="mt-1 text-sm text-slate-500">Risk: {idea.risk}</p>
                  </div>
                  <div className="flex items-start md:justify-end">
                    <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {idea.stage}
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
            Keep secrets out of git. Add Supabase values in Vercel environment variables.
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            Next step: connect Vercel + Supabase
            <ArrowRight size={16} />
          </div>
        </footer>
      </div>
    </main>
  );
}
