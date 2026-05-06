create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  idea_id uuid references public.ideas(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  event_category text not null default 'learning',
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists telemetry_events_idea_occurred_idx
  on public.telemetry_events (idea_id, occurred_at desc);

create index if not exists telemetry_events_org_occurred_idx
  on public.telemetry_events (organization_id, occurred_at desc);

alter table public.telemetry_events enable row level security;

drop policy if exists "Allow telemetry inserts for signed-in operators" on public.telemetry_events;
drop policy if exists "Allow telemetry reads for actor or org members" on public.telemetry_events;

create policy "Allow telemetry inserts for signed-in operators"
on public.telemetry_events
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow telemetry reads for actor or org members"
on public.telemetry_events
for select
to authenticated
using (
  actor_id = auth.uid()
  or (
    organization_id is not null
    and public.is_organization_member(organization_id)
  )
);
