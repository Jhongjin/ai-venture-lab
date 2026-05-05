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
  '돌봄 운영 콘솔',
  '가족, 요양보호사, 센터 간 돌봄 일정과 기록을 관리하는 신뢰 기반 운영 콘솔입니다.',
  '돌봄을 조율하는 가족과 소규모 방문요양센터',
  '방문요양센터 또는 가족 돌봄 관리자',
  'research',
  'research_more',
  5,
  4,
  3,
  4,
  3,
  4,
  4,
  '규제 업무와 가족 커뮤니케이션이 겹치는 구조적 수요가 큽니다.',
  '장기요양 규정, 개인정보 처리, 운영 책임 소재가 핵심 리스크입니다.',
  '방문요양센터와 가족 커뮤니케이션의 실제 제약을 확인합니다.'
where not exists (select 1 from public.ideas where name in ('돌봄 운영 콘솔', 'Care ops console'));

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
  '대화 코칭',
  '중요한 일상 대화를 미리 연습하고 스크립트를 준비하는 역할극 코치입니다.',
  '어려운 대화를 준비하는 직장인과 개인 사용자',
  '개인 전문가 또는 소규모 팀',
  'score',
  'research_more',
  4,
  4,
  4,
  3,
  5,
  3,
  2,
  'MVP 구현이 빠르고 일상 효용이 명확합니다.',
  '상담, 법률, 의료, HR 조언처럼 보이는 주장을 피해야 합니다.',
  '반복 빈도가 높은 세부 상황 하나를 고르고 측정 가능한 결과를 정의합니다.'
where not exists (select 1 from public.ideas where name in ('대화 코칭', 'Conversation coach'));

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
  '구독 관리 에이전트',
  '반복 결제를 찾아내고 낮은 마찰로 해지 절차를 안내하는 개인 지출 에이전트입니다.',
  '디지털 구독이 많은 바쁜 소비자',
  '개인 소비자',
  'intake',
  'research_more',
  4,
  3,
  4,
  4,
  4,
  3,
  4,
  '절약 금액이 바로 보이는 명확한 후킹 포인트가 있습니다.',
  '계정 접근, 결제 데이터, 동의, 해지 안정성이 핵심 리스크입니다.',
  '동의, 계정 접근, 결제 데이터 처리 제약을 맵핑합니다.'
where not exists (select 1 from public.ideas where name in ('구독 관리 에이전트', 'Subscription agent'));

insert into public.risks (title, area, severity, mitigation, status)
select '개인정보 유출', '개인정보', 'high', '초기 프로토타입에서는 실제 개인정보를 쓰지 않고 출시 전 보관 정책을 문서화합니다.', 'open'
where not exists (select 1 from public.risks where title in ('개인정보 유출', 'Personal data leakage'));

insert into public.risks (title, area, severity, mitigation, status)
select '규제 대상 조언 주장', '법무', 'high', '자격 검토 없이 의료, 법률, 금융, 심리상담 조언으로 보이는 표현을 피합니다.', 'open'
where not exists (select 1 from public.risks where title in ('규제 대상 조언 주장', 'Regulated advice claims'));

insert into public.risks (title, area, severity, mitigation, status)
select '비밀값 노출', '보안', 'high', 'Vercel 환경변수를 사용하고 .env 파일은 git에 넣지 않습니다.', 'open'
where not exists (select 1 from public.risks where title in ('비밀값 노출', 'Secret exposure'));

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

alter table public.organization_members
add column if not exists email text;

update public.organization_members member
set email = auth_user.email
from auth.users auth_user
where member.user_id = auth_user.id
  and (member.email is null or member.email = '');

create index if not exists organization_members_email_idx
on public.organization_members (lower(email));

create or replace function public.add_organization_member_by_email(
  target_organization_id uuid,
  target_email text,
  target_role public.organization_role default 'member'
)
returns public.organization_members
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text;
  target_user_id uuid;
  inserted_member public.organization_members;
begin
  normalized_email := lower(trim(target_email));

  if normalized_email = '' then
    raise exception 'Member email is required';
  end if;

  if not public.is_organization_admin(target_organization_id) then
    raise exception 'Only workspace owners and admins can add members';
  end if;

  if target_role not in ('admin', 'member', 'viewer') then
    raise exception 'Supported member roles are admin, member, and viewer';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if target_user_id is null then
    raise exception 'No confirmed Auth user found for %', normalized_email;
  end if;

  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    email
  )
  values (
    target_organization_id,
    target_user_id,
    target_role,
    normalized_email
  )
  on conflict (organization_id, user_id) do update
    set role = excluded.role,
        email = excluded.email
  returning * into inserted_member;

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
    target_organization_id,
    auth.uid(),
    'organization_members',
    target_user_id,
    'member_upsert',
    'organization member upsert: ' || normalized_email || ' as ' || target_role::text,
    jsonb_build_object('email', normalized_email, 'role', target_role)
  );

  return inserted_member;
end;
$$;

revoke all on function public.add_organization_member_by_email(uuid, text, public.organization_role) from public;
grant execute on function public.add_organization_member_by_email(uuid, text, public.organization_role) to authenticated;

create or replace function public.update_organization_member_role(
  target_organization_id uuid,
  target_user_id uuid,
  target_role public.organization_role
)
returns public.organization_members
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.organization_role;
  current_role public.organization_role;
  owner_count integer;
  updated_member public.organization_members;
begin
  select role
  into actor_role
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = auth.uid();

  if actor_role not in ('owner', 'admin') then
    raise exception 'Only workspace owners and admins can update member roles';
  end if;

  if target_role not in ('admin', 'member', 'viewer') then
    raise exception 'Supported member roles are admin, member, and viewer';
  end if;

  select role
  into current_role
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = target_user_id;

  if current_role is null then
    raise exception 'Workspace member was not found';
  end if;

  if current_role = 'owner' and actor_role <> 'owner' then
    raise exception 'Only owners can change an owner role';
  end if;

  if current_role = 'owner' then
    select count(*)
    into owner_count
    from public.organization_members
    where organization_id = target_organization_id
      and role = 'owner';

    if owner_count <= 1 then
      raise exception 'A workspace must keep at least one owner';
    end if;
  end if;

  update public.organization_members
  set role = target_role
  where organization_id = target_organization_id
    and user_id = target_user_id
  returning * into updated_member;

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
    target_organization_id,
    auth.uid(),
    'organization_members',
    target_user_id,
    'member_role_update',
    'organization member role update: ' || coalesce(updated_member.email, target_user_id::text) || ' to ' || target_role::text,
    jsonb_build_object('user_id', target_user_id, 'role', target_role)
  );

  return updated_member;
end;
$$;

create or replace function public.remove_organization_member(
  target_organization_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.organization_role;
  current_role public.organization_role;
  current_email text;
  owner_count integer;
begin
  select role
  into actor_role
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = auth.uid();

  if actor_role not in ('owner', 'admin') then
    raise exception 'Only workspace owners and admins can remove members';
  end if;

  select role, email
  into current_role, current_email
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = target_user_id;

  if current_role is null then
    raise exception 'Workspace member was not found';
  end if;

  if current_role = 'owner' and actor_role <> 'owner' then
    raise exception 'Only owners can remove an owner';
  end if;

  if current_role = 'owner' then
    select count(*)
    into owner_count
    from public.organization_members
    where organization_id = target_organization_id
      and role = 'owner';

    if owner_count <= 1 then
      raise exception 'A workspace must keep at least one owner';
    end if;
  end if;

  delete from public.organization_members
  where organization_id = target_organization_id
    and user_id = target_user_id;

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
    target_organization_id,
    auth.uid(),
    'organization_members',
    target_user_id,
    'member_remove',
    'organization member removed: ' || coalesce(current_email, target_user_id::text),
    jsonb_build_object('user_id', target_user_id, 'email', current_email, 'role', current_role)
  );
end;
$$;

revoke all on function public.update_organization_member_role(uuid, uuid, public.organization_role) from public;
revoke all on function public.remove_organization_member(uuid, uuid) from public;
grant execute on function public.update_organization_member_role(uuid, uuid, public.organization_role) to authenticated;
grant execute on function public.remove_organization_member(uuid, uuid) to authenticated;

create table if not exists public.orchestration_runs (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  phase text not null check (
    phase in (
      'strategy',
      'research',
      'product',
      'design',
      'build',
      'qa',
      'debug',
      'security',
      'launch'
    )
  ),
  status text not null default 'planned' check (
    status in ('planned', 'running', 'blocked', 'done', 'skipped')
  ),
  owner_role text not null default '',
  objective text not null default '',
  output text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orchestration_runs_idea_id_idx
on public.orchestration_runs(idea_id);

create index if not exists orchestration_runs_organization_id_idx
on public.orchestration_runs(organization_id);

create index if not exists orchestration_runs_created_by_idx
on public.orchestration_runs(created_by);

drop trigger if exists orchestration_runs_set_updated_at on public.orchestration_runs;
create trigger orchestration_runs_set_updated_at
before update on public.orchestration_runs
for each row execute function public.set_updated_at();

drop trigger if exists orchestration_runs_set_organization_id on public.orchestration_runs;
create trigger orchestration_runs_set_organization_id
before insert on public.orchestration_runs
for each row execute function public.set_record_organization_id();

drop trigger if exists orchestration_runs_audit_events on public.orchestration_runs;
create trigger orchestration_runs_audit_events
after insert or update or delete on public.orchestration_runs
for each row execute function public.log_venture_change();

alter table public.orchestration_runs enable row level security;

drop policy if exists "Allow authenticated reads to accessible orchestration runs"
on public.orchestration_runs;

drop policy if exists "Allow authenticated inserts to owned orchestration runs"
on public.orchestration_runs;

drop policy if exists "Allow authenticated updates to owned orchestration runs"
on public.orchestration_runs;

drop policy if exists "Allow authenticated deletes to owned orchestration runs"
on public.orchestration_runs;

create policy "Allow authenticated reads to accessible orchestration runs"
on public.orchestration_runs for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated inserts to owned orchestration runs"
on public.orchestration_runs for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned orchestration runs"
on public.orchestration_runs for update
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

create policy "Allow authenticated deletes to owned orchestration runs"
on public.orchestration_runs for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);

create table if not exists public.venture_artifacts (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  artifact_type text not null check (
    artifact_type in (
      'idea_brief',
      'research_note',
      'prd',
      'mvp_spec',
      'launch_checklist'
    )
  ),
  title text not null default '',
  body text not null default '',
  source text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.venture_artifacts
add column if not exists status text not null default 'draft';

alter table public.venture_artifacts
add column if not exists version integer not null default 1;

alter table public.venture_artifacts
add column if not exists approved_by uuid references auth.users(id) on delete set null;

alter table public.venture_artifacts
add column if not exists approved_at timestamptz;

alter table public.venture_artifacts
add column if not exists status_note text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'venture_artifacts_status_check'
      and conrelid = 'public.venture_artifacts'::regclass
  ) then
    alter table public.venture_artifacts
    add constraint venture_artifacts_status_check
    check (status in ('draft', 'approved', 'archived'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'venture_artifacts_version_check'
      and conrelid = 'public.venture_artifacts'::regclass
  ) then
    alter table public.venture_artifacts
    add constraint venture_artifacts_version_check
    check (version >= 1);
  end if;
end $$;

create index if not exists venture_artifacts_idea_id_idx
on public.venture_artifacts(idea_id);

create index if not exists venture_artifacts_organization_id_idx
on public.venture_artifacts(organization_id);

create index if not exists venture_artifacts_created_by_idx
on public.venture_artifacts(created_by);

create index if not exists venture_artifacts_artifact_type_idx
on public.venture_artifacts(artifact_type);

create index if not exists venture_artifacts_status_idx
on public.venture_artifacts(status);

create index if not exists venture_artifacts_approved_by_idx
on public.venture_artifacts(approved_by);

drop trigger if exists venture_artifacts_set_updated_at on public.venture_artifacts;
create trigger venture_artifacts_set_updated_at
before update on public.venture_artifacts
for each row execute function public.set_updated_at();

drop trigger if exists venture_artifacts_set_organization_id on public.venture_artifacts;
create trigger venture_artifacts_set_organization_id
before insert on public.venture_artifacts
for each row execute function public.set_record_organization_id();

drop trigger if exists venture_artifacts_audit_events on public.venture_artifacts;
create trigger venture_artifacts_audit_events
after insert or update or delete on public.venture_artifacts
for each row execute function public.log_venture_change();

alter table public.venture_artifacts enable row level security;

drop policy if exists "Allow authenticated reads to accessible venture artifacts"
on public.venture_artifacts;

drop policy if exists "Allow authenticated inserts to owned venture artifacts"
on public.venture_artifacts;

drop policy if exists "Allow authenticated updates to owned venture artifacts"
on public.venture_artifacts;

drop policy if exists "Allow authenticated deletes to owned venture artifacts"
on public.venture_artifacts;

create policy "Allow authenticated reads to accessible venture artifacts"
on public.venture_artifacts for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated inserts to owned venture artifacts"
on public.venture_artifacts for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned venture artifacts"
on public.venture_artifacts for update
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

create policy "Allow authenticated deletes to owned venture artifacts"
on public.venture_artifacts for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);
