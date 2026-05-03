import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Idea = Database["public"]["Tables"]["ideas"]["Row"];
export type Risk = Database["public"]["Tables"]["risks"]["Row"];

type ConsoleData = {
  ideas: Idea[];
  risks: Risk[];
  source: "supabase" | "seed";
  error: string | null;
};

const now = new Date("2026-05-03T00:00:00.000Z").toISOString();

const seedIdeas: Idea[] = [
  {
    id: "seed-care-ops",
    name: "Care ops console",
    one_liner: "A trust and operations console for family-caregiver-care center communication.",
    target_user: "Families coordinating elder care and small care centers",
    buyer: "Care centers or family coordinators",
    stage: "research",
    decision: "research_more",
    problem_intensity: 5,
    frequency: 4,
    reachability: 3,
    willingness_to_pay: 4,
    mvp_speed: 3,
    differentiation: 4,
    regulatory_risk: 4,
    signal: "High structural demand with a regulated workflow.",
    risk_summary: "Long-term care rules, PII handling, and operational accountability.",
    next_evidence: "Confirm workflow constraints around care centers and family communications.",
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-conversation-coach",
    name: "Conversation coach",
    one_liner: "Role-play and script preparation for high-stakes daily conversations.",
    target_user: "Professionals preparing difficult conversations",
    buyer: "Individual professionals or small teams",
    stage: "score",
    decision: "research_more",
    problem_intensity: 4,
    frequency: 4,
    reachability: 4,
    willingness_to_pay: 3,
    mvp_speed: 5,
    differentiation: 3,
    regulatory_risk: 2,
    signal: "Fast MVP path with clear daily utility.",
    risk_summary: "Avoid therapy, legal, medical, or HR advice claims.",
    next_evidence: "Pick one high-frequency niche and define a measurable outcome.",
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-subscription-agent",
    name: "Subscription agent",
    one_liner: "Find recurring charges and guide users through low-friction cancellation.",
    target_user: "Busy consumers with many digital subscriptions",
    buyer: "Consumers",
    stage: "intake",
    decision: "research_more",
    problem_intensity: 4,
    frequency: 3,
    reachability: 4,
    willingness_to_pay: 4,
    mvp_speed: 4,
    differentiation: 3,
    regulatory_risk: 4,
    signal: "Clear money-saving hook.",
    risk_summary: "Account access, payment data, consent, and cancellation reliability.",
    next_evidence: "Map consent, account access, and payment data constraints.",
    created_by: null,
    created_at: now,
    updated_at: now,
  },
];

const seedRisks: Risk[] = [
  {
    id: "seed-risk-pii",
    idea_id: null,
    title: "Personal data leakage",
    area: "Privacy",
    severity: "high",
    mitigation: "Avoid real PII in early prototypes and document retention before launch.",
    status: "open",
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-risk-advice",
    idea_id: null,
    title: "Regulated advice claims",
    area: "Legal",
    severity: "high",
    mitigation: "Avoid medical, legal, financial, or therapy claims without qualified review.",
    status: "open",
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-risk-secrets",
    idea_id: null,
    title: "Secret exposure",
    area: "Security",
    severity: "high",
    mitigation: "Use Vercel environment variables and keep .env files out of git.",
    status: "open",
    created_by: null,
    created_at: now,
    updated_at: now,
  },
];

export function scoreIdea(idea: Idea) {
  return (
    idea.problem_intensity +
    idea.frequency +
    idea.reachability +
    idea.willingness_to_pay +
    idea.mvp_speed +
    idea.differentiation -
    idea.regulatory_risk
  );
}

export async function getConsoleData(): Promise<ConsoleData> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      ideas: seedIdeas,
      risks: seedRisks,
      source: "seed",
      error: null,
    };
  }

  const [ideasResult, risksResult] = await Promise.all([
    supabase.from("ideas").select("*").order("created_at", { ascending: true }),
    supabase.from("risks").select("*").order("created_at", { ascending: true }),
  ]);

  if (ideasResult.error || risksResult.error) {
    return {
      ideas: seedIdeas,
      risks: seedRisks,
      source: "seed",
      error: ideasResult.error?.message ?? risksResult.error?.message ?? "Unknown Supabase error",
    };
  }

  return {
    ideas: ideasResult.data ?? [],
    risks: risksResult.data ?? [],
    source: "supabase",
    error: null,
  };
}
