create extension if not exists pgcrypto;

do $$
begin
  create type public.idea_stage as enum (
    'intake',
    'research',
    'score',
    'prd',
    'prototype',
    'qa',
    'launch',
    'paused'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.decision_status as enum (
    'ship',
    'pivot',
    'kill',
    'research_more',
    'pending'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.risk_severity as enum (
    'low',
    'medium',
    'high',
    'critical'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  one_liner text not null default '',
  target_user text not null default '',
  buyer text not null default '',
  stage public.idea_stage not null default 'intake',
  decision public.decision_status not null default 'pending',
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
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade,
  title text not null,
  area text not null default '',
  severity public.risk_severity not null default 'medium',
  mitigation text not null default '',
  status text not null default 'open',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete set null,
  decision public.decision_status not null,
  reason text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  decided_at timestamptz not null default now()
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade,
  name text not null,
  status text not null default 'planned',
  success_metric text not null default '',
  started_at timestamptz,
  ended_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ideas add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();
alter table public.risks add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();
alter table public.decisions add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();
alter table public.experiments add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ideas_set_updated_at on public.ideas;
create trigger ideas_set_updated_at
before update on public.ideas
for each row execute function public.set_updated_at();

drop trigger if exists risks_set_updated_at on public.risks;
create trigger risks_set_updated_at
before update on public.risks
for each row execute function public.set_updated_at();

drop trigger if exists experiments_set_updated_at on public.experiments;
create trigger experiments_set_updated_at
before update on public.experiments
for each row execute function public.set_updated_at();

alter table public.ideas enable row level security;
alter table public.risks enable row level security;
alter table public.decisions enable row level security;
alter table public.experiments enable row level security;

drop policy if exists "Allow public read access to venture lab ideas" on public.ideas;
drop policy if exists "Allow public read access to venture lab risks" on public.risks;
drop policy if exists "Allow public read access to venture lab decisions" on public.decisions;
drop policy if exists "Allow public read access to venture lab experiments" on public.experiments;
drop policy if exists "Allow authenticated writes to ideas" on public.ideas;
drop policy if exists "Allow authenticated writes to risks" on public.risks;
drop policy if exists "Allow authenticated writes to decisions" on public.decisions;
drop policy if exists "Allow authenticated writes to experiments" on public.experiments;
drop policy if exists "Allow authenticated inserts to owned ideas" on public.ideas;
drop policy if exists "Allow authenticated updates to owned ideas" on public.ideas;
drop policy if exists "Allow authenticated deletes to owned ideas" on public.ideas;
drop policy if exists "Allow authenticated inserts to owned risks" on public.risks;
drop policy if exists "Allow authenticated updates to owned risks" on public.risks;
drop policy if exists "Allow authenticated deletes to owned risks" on public.risks;
drop policy if exists "Allow authenticated inserts to owned decisions" on public.decisions;
drop policy if exists "Allow authenticated updates to owned decisions" on public.decisions;
drop policy if exists "Allow authenticated deletes to owned decisions" on public.decisions;
drop policy if exists "Allow authenticated inserts to owned experiments" on public.experiments;
drop policy if exists "Allow authenticated updates to owned experiments" on public.experiments;
drop policy if exists "Allow authenticated deletes to owned experiments" on public.experiments;

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

create policy "Allow authenticated inserts to owned ideas"
on public.ideas for insert
to authenticated
with check (created_by = auth.uid());

create policy "Allow authenticated updates to owned ideas"
on public.ideas for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Allow authenticated deletes to owned ideas"
on public.ideas for delete
to authenticated
using (created_by = auth.uid());

create policy "Allow authenticated inserts to owned risks"
on public.risks for insert
to authenticated
with check (created_by = auth.uid());

create policy "Allow authenticated updates to owned risks"
on public.risks for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Allow authenticated deletes to owned risks"
on public.risks for delete
to authenticated
using (created_by = auth.uid());

create policy "Allow authenticated inserts to owned decisions"
on public.decisions for insert
to authenticated
with check (created_by = auth.uid());

create policy "Allow authenticated updates to owned decisions"
on public.decisions for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Allow authenticated deletes to owned decisions"
on public.decisions for delete
to authenticated
using (created_by = auth.uid());

create policy "Allow authenticated inserts to owned experiments"
on public.experiments for insert
to authenticated
with check (created_by = auth.uid());

create policy "Allow authenticated updates to owned experiments"
on public.experiments for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Allow authenticated deletes to owned experiments"
on public.experiments for delete
to authenticated
using (created_by = auth.uid());

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
)
select
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
where not exists (select 1 from public.ideas where name = 'Care ops console');

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
)
select
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
where not exists (select 1 from public.ideas where name = 'Conversation coach');

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
)
select
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
where not exists (select 1 from public.ideas where name = 'Subscription agent');

insert into public.risks (title, area, severity, mitigation, status)
select 'Personal data leakage', 'Privacy', 'high', 'Avoid real PII in early prototypes and document retention before launch.', 'open'
where not exists (select 1 from public.risks where title = 'Personal data leakage');

insert into public.risks (title, area, severity, mitigation, status)
select 'Regulated advice claims', 'Legal', 'high', 'Avoid medical, legal, financial, or therapy claims without qualified review.', 'open'
where not exists (select 1 from public.risks where title = 'Regulated advice claims');

insert into public.risks (title, area, severity, mitigation, status)
select 'Secret exposure', 'Security', 'high', 'Use Vercel environment variables and keep .env files out of git.', 'open'
where not exists (select 1 from public.risks where title = 'Secret exposure');

do $$
begin
  create type public.organization_role as enum (
    'owner',
    'admin',
    'member',
    'viewer'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null default auth.uid(),
  entity_table text not null,
  entity_id uuid,
  action text not null,
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ideas add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.risks add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.decisions add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.experiments add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create index if not exists organizations_created_by_idx on public.organizations(created_by);
create index if not exists organization_members_user_id_idx on public.organization_members(user_id);
create index if not exists ideas_organization_id_idx on public.ideas(organization_id);
create index if not exists risks_organization_id_idx on public.risks(organization_id);
create index if not exists decisions_organization_id_idx on public.decisions(organization_id);
create index if not exists experiments_organization_id_idx on public.experiments(organization_id);
create index if not exists audit_events_organization_id_idx on public.audit_events(organization_id);
create index if not exists audit_events_actor_id_idx on public.audit_events(actor_id);

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_organization_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.default_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

create or replace function public.add_organization_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.organization_members (organization_id, user_id, role)
    values (new.id, new.created_by, 'owner')
    on conflict (organization_id, user_id) do update
      set role = 'owner';
  end if;

  return new;
end;
$$;

drop trigger if exists organizations_add_owner on public.organizations;
create trigger organizations_add_owner
after insert on public.organizations
for each row execute function public.add_organization_owner();

create or replace function public.set_record_organization_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_idea_id uuid;
begin
  linked_idea_id := nullif(to_jsonb(new) ->> 'idea_id', '')::uuid;

  if new.organization_id is null and linked_idea_id is not null then
    select organization_id
    into new.organization_id
    from public.ideas
    where id = linked_idea_id;
  end if;

  if new.organization_id is null then
    new.organization_id := public.default_organization_id();
  end if;

  return new;
end;
$$;

drop trigger if exists ideas_set_organization_id on public.ideas;
create trigger ideas_set_organization_id
before insert on public.ideas
for each row execute function public.set_record_organization_id();

drop trigger if exists risks_set_organization_id on public.risks;
create trigger risks_set_organization_id
before insert on public.risks
for each row execute function public.set_record_organization_id();

drop trigger if exists decisions_set_organization_id on public.decisions;
create trigger decisions_set_organization_id
before insert on public.decisions
for each row execute function public.set_record_organization_id();

drop trigger if exists experiments_set_organization_id on public.experiments;
create trigger experiments_set_organization_id
before insert on public.experiments
for each row execute function public.set_record_organization_id();

create or replace function public.log_venture_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_data jsonb;
  record_id uuid;
  record_organization_id uuid;
  record_label text;
begin
  if tg_op = 'DELETE' then
    record_data := to_jsonb(old);
  else
    record_data := to_jsonb(new);
  end if;

  record_id := nullif(record_data ->> 'id', '')::uuid;
  record_organization_id := nullif(record_data ->> 'organization_id', '')::uuid;
  record_label := coalesce(
    record_data ->> 'name',
    record_data ->> 'title',
    record_data ->> 'decision',
    record_data ->> 'status',
    record_id::text,
    'record'
  );

  insert into public.audit_events (
    organization_id,
    actor_id,
    entity_table,
    entity_id,
    action,
    summary,
    metadata
  )
  values (
    record_organization_id,
    auth.uid(),
    tg_table_name,
    record_id,
    lower(tg_op),
    tg_table_name || ' ' || lower(tg_op) || ': ' || record_label,
    jsonb_build_object('record', record_data)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists ideas_audit_events on public.ideas;
create trigger ideas_audit_events
after insert or update or delete on public.ideas
for each row execute function public.log_venture_change();

drop trigger if exists risks_audit_events on public.risks;
create trigger risks_audit_events
after insert or update or delete on public.risks
for each row execute function public.log_venture_change();

drop trigger if exists decisions_audit_events on public.decisions;
create trigger decisions_audit_events
after insert or update or delete on public.decisions
for each row execute function public.log_venture_change();

drop trigger if exists experiments_audit_events on public.experiments;
create trigger experiments_audit_events
after insert or update or delete on public.experiments
for each row execute function public.log_venture_change();

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "Allow members to read their organizations" on public.organizations;
drop policy if exists "Allow authenticated users to create organizations" on public.organizations;
drop policy if exists "Allow admins to update organizations" on public.organizations;
drop policy if exists "Allow admins to delete organizations" on public.organizations;
drop policy if exists "Allow members to read organization memberships" on public.organization_members;
drop policy if exists "Allow admins to manage organization memberships" on public.organization_members;
drop policy if exists "Allow organization creators to add themselves" on public.organization_members;
drop policy if exists "Allow members to read audit events" on public.audit_events;
drop policy if exists "Allow authenticated users to insert audit events" on public.audit_events;

create policy "Allow members to read their organizations"
on public.organizations for select
to authenticated
using (public.is_organization_member(id));

create policy "Allow authenticated users to create organizations"
on public.organizations for insert
to authenticated
with check (created_by = auth.uid());

create policy "Allow admins to update organizations"
on public.organizations for update
to authenticated
using (public.is_organization_admin(id))
with check (public.is_organization_admin(id));

create policy "Allow admins to delete organizations"
on public.organizations for delete
to authenticated
using (public.is_organization_admin(id));

create policy "Allow members to read organization memberships"
on public.organization_members for select
to authenticated
using (public.is_organization_member(organization_id));

create policy "Allow organization creators to add themselves"
on public.organization_members for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.organizations
    where id = organization_id
      and created_by = auth.uid()
  )
);

create policy "Allow admins to manage organization memberships"
on public.organization_members for all
to authenticated
using (public.is_organization_admin(organization_id))
with check (public.is_organization_admin(organization_id));

create policy "Allow members to read audit events"
on public.audit_events for select
to authenticated
using (
  organization_id is null
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated users to insert audit events"
on public.audit_events for insert
to authenticated
with check (
  actor_id = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

drop policy if exists "Allow authenticated inserts to owned ideas" on public.ideas;
drop policy if exists "Allow authenticated updates to owned ideas" on public.ideas;
drop policy if exists "Allow authenticated deletes to owned ideas" on public.ideas;
drop policy if exists "Allow authenticated inserts to owned risks" on public.risks;
drop policy if exists "Allow authenticated updates to owned risks" on public.risks;
drop policy if exists "Allow authenticated deletes to owned risks" on public.risks;
drop policy if exists "Allow authenticated inserts to owned decisions" on public.decisions;
drop policy if exists "Allow authenticated updates to owned decisions" on public.decisions;
drop policy if exists "Allow authenticated deletes to owned decisions" on public.decisions;
drop policy if exists "Allow authenticated inserts to owned experiments" on public.experiments;
drop policy if exists "Allow authenticated updates to owned experiments" on public.experiments;
drop policy if exists "Allow authenticated deletes to owned experiments" on public.experiments;

create policy "Allow authenticated inserts to owned ideas"
on public.ideas for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned ideas"
on public.ideas for update
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
)
with check (
  (
    created_by = auth.uid()
    or public.is_organization_admin(organization_id)
  )
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated deletes to owned ideas"
on public.ideas for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);

create policy "Allow authenticated inserts to owned risks"
on public.risks for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned risks"
on public.risks for update
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
)
with check (
  (
    created_by = auth.uid()
    or public.is_organization_admin(organization_id)
  )
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated deletes to owned risks"
on public.risks for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);

create policy "Allow authenticated inserts to owned decisions"
on public.decisions for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned decisions"
on public.decisions for update
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
)
with check (
  (
    created_by = auth.uid()
    or public.is_organization_admin(organization_id)
  )
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated deletes to owned decisions"
on public.decisions for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);

create policy "Allow authenticated inserts to owned experiments"
on public.experiments for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned experiments"
on public.experiments for update
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
)
with check (
  (
    created_by = auth.uid()
    or public.is_organization_admin(organization_id)
  )
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated deletes to owned experiments"
on public.experiments for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);

drop policy if exists "Allow public read access to venture lab ideas" on public.ideas;
drop policy if exists "Allow public read access to venture lab risks" on public.risks;
drop policy if exists "Allow public read access to venture lab decisions" on public.decisions;
drop policy if exists "Allow public read access to venture lab experiments" on public.experiments;

drop policy if exists "Allow authenticated reads to accessible ideas" on public.ideas;
drop policy if exists "Allow authenticated reads to accessible risks" on public.risks;
drop policy if exists "Allow authenticated reads to accessible decisions" on public.decisions;
drop policy if exists "Allow authenticated reads to accessible experiments" on public.experiments;

create policy "Allow authenticated reads to accessible ideas"
on public.ideas for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated reads to accessible risks"
on public.risks for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated reads to accessible decisions"
on public.decisions for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated reads to accessible experiments"
on public.experiments for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);
