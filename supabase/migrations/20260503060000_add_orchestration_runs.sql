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
