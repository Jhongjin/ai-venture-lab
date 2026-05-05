create table if not exists public.implementation_tasks (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  source_artifact_id uuid references public.venture_artifacts(id) on delete set null,
  title text not null default '',
  task_type text not null default 'frontend' check (
    task_type in ('planning', 'design', 'frontend', 'backend', 'data', 'qa', 'security', 'deploy')
  ),
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high')
  ),
  status text not null default 'todo' check (
    status in ('todo', 'doing', 'blocked', 'done')
  ),
  owner_role text not null default '',
  acceptance_criteria text not null default '',
  evidence text not null default '',
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists implementation_tasks_idea_id_idx
on public.implementation_tasks(idea_id);

create index if not exists implementation_tasks_organization_id_idx
on public.implementation_tasks(organization_id);

create index if not exists implementation_tasks_created_by_idx
on public.implementation_tasks(created_by);

create index if not exists implementation_tasks_status_idx
on public.implementation_tasks(status);

create index if not exists implementation_tasks_priority_idx
on public.implementation_tasks(priority);

create index if not exists implementation_tasks_source_artifact_id_idx
on public.implementation_tasks(source_artifact_id);

drop trigger if exists implementation_tasks_set_updated_at on public.implementation_tasks;
create trigger implementation_tasks_set_updated_at
before update on public.implementation_tasks
for each row execute function public.set_updated_at();

drop trigger if exists implementation_tasks_set_organization_id on public.implementation_tasks;
create trigger implementation_tasks_set_organization_id
before insert on public.implementation_tasks
for each row execute function public.set_record_organization_id();

drop trigger if exists implementation_tasks_audit_events on public.implementation_tasks;
create trigger implementation_tasks_audit_events
after insert or update or delete on public.implementation_tasks
for each row execute function public.log_venture_change();

alter table public.implementation_tasks enable row level security;

drop policy if exists "Allow authenticated reads to accessible implementation tasks"
on public.implementation_tasks;

drop policy if exists "Allow authenticated inserts to owned implementation tasks"
on public.implementation_tasks;

drop policy if exists "Allow authenticated updates to owned implementation tasks"
on public.implementation_tasks;

drop policy if exists "Allow authenticated deletes to owned implementation tasks"
on public.implementation_tasks;

create policy "Allow authenticated reads to accessible implementation tasks"
on public.implementation_tasks for select
to authenticated
using (
  created_by = auth.uid()
  or (created_by is null and organization_id is null)
  or public.is_organization_member(organization_id)
);

create policy "Allow authenticated inserts to owned implementation tasks"
on public.implementation_tasks for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id)
  )
);

create policy "Allow authenticated updates to owned implementation tasks"
on public.implementation_tasks for update
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

create policy "Allow authenticated deletes to owned implementation tasks"
on public.implementation_tasks for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_admin(organization_id)
);
