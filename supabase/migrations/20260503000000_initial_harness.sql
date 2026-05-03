create extension if not exists pgcrypto;

create type idea_stage as enum (
  'intake',
  'research',
  'score',
  'prd',
  'prototype',
  'qa',
  'launch',
  'paused'
);

create type decision_status as enum (
  'ship',
  'pivot',
  'kill',
  'research_more',
  'pending'
);

create type risk_severity as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  one_liner text not null default '',
  target_user text not null default '',
  buyer text not null default '',
  stage idea_stage not null default 'intake',
  decision decision_status not null default 'pending',
  problem_intensity integer not null default 0 check (problem_intensity between 0 and 5),
  frequency integer not null default 0 check (frequency between 0 and 5),
  reachability integer not null default 0 check (reachability between 0 and 5),
  willingness_to_pay integer not null default 0 check (willingness_to_pay between 0 and 5),
  mvp_speed integer not null default 0 check (mvp_speed between 0 and 5),
  differentiation integer not null default 0 check (differentiation between 0 and 5),
  regulatory_risk integer not null default 0 check (regulatory_risk between 0 and 5),
  signal text not null default '',
  risk_summary text not null default '',
  next_evidence text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade,
  title text not null,
  area text not null default '',
  severity risk_severity not null default 'medium',
  mitigation text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete set null,
  decision decision_status not null,
  reason text not null default '',
  decided_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade,
  name text not null,
  status text not null default 'planned',
  success_metric text not null default '',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ideas_set_updated_at
before update on public.ideas
for each row execute function public.set_updated_at();

create trigger risks_set_updated_at
before update on public.risks
for each row execute function public.set_updated_at();

create trigger experiments_set_updated_at
before update on public.experiments
for each row execute function public.set_updated_at();

alter table public.ideas enable row level security;
alter table public.risks enable row level security;
alter table public.decisions enable row level security;
alter table public.experiments enable row level security;

create policy "Allow public read access to venture lab ideas"
on public.ideas for select
using (true);

create policy "Allow public read access to venture lab risks"
on public.risks for select
using (true);

create policy "Allow public read access to venture lab decisions"
on public.decisions for select
using (true);

create policy "Allow public read access to venture lab experiments"
on public.experiments for select
using (true);

create policy "Allow authenticated writes to ideas"
on public.ideas for all
to authenticated
using (true)
with check (true);

create policy "Allow authenticated writes to risks"
on public.risks for all
to authenticated
using (true)
with check (true);

create policy "Allow authenticated writes to decisions"
on public.decisions for all
to authenticated
using (true)
with check (true);

create policy "Allow authenticated writes to experiments"
on public.experiments for all
to authenticated
using (true)
with check (true);

insert into public.ideas (
  name,
  one_liner,
  target_user,
  buyer,
  stage,
  decision,
  problem_intensity,
  frequency,
  reachability,
  willingness_to_pay,
  mvp_speed,
  differentiation,
  regulatory_risk,
  signal,
  risk_summary,
  next_evidence
) values
  (
    'Care ops console',
    'A trust and operations console for family-caregiver-care center communication.',
    'Families coordinating elder care and small care centers',
    'Care centers or family coordinators',
    'research',
    'research_more',
    5,
    4,
    3,
    4,
    3,
    4,
    4,
    'High structural demand with a regulated workflow.',
    'Long-term care rules, PII handling, and operational accountability.',
    'Confirm workflow constraints around care centers and family communications.'
  ),
  (
    'Conversation coach',
    'Role-play and script preparation for high-stakes daily conversations.',
    'Professionals preparing difficult conversations',
    'Individual professionals or small teams',
    'score',
    'research_more',
    4,
    4,
    4,
    3,
    5,
    3,
    2,
    'Fast MVP path with clear daily utility.',
    'Avoid therapy, legal, medical, or HR advice claims.',
    'Pick one high-frequency niche and define a measurable outcome.'
  ),
  (
    'Subscription agent',
    'Find recurring charges and guide users through low-friction cancellation.',
    'Busy consumers with many digital subscriptions',
    'Consumers',
    'intake',
    'research_more',
    4,
    3,
    4,
    4,
    4,
    3,
    4,
    'Clear money-saving hook.',
    'Account access, payment data, consent, and cancellation reliability.',
    'Map consent, account access, and payment data constraints.'
  );

insert into public.risks (title, area, severity, mitigation, status)
values
  ('Personal data leakage', 'Privacy', 'high', 'Avoid real PII in early prototypes and document retention before launch.', 'open'),
  ('Regulated advice claims', 'Legal', 'high', 'Avoid medical, legal, financial, or therapy claims without qualified review.', 'open'),
  ('Secret exposure', 'Security', 'high', 'Use Vercel environment variables and keep .env files out of git.', 'open');
