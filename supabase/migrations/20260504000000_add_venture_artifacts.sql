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

create index if not exists venture_artifacts_idea_id_idx
on public.venture_artifacts(idea_id);

create index if not exists venture_artifacts_organization_id_idx
on public.venture_artifacts(organization_id);

create index if not exists venture_artifacts_created_by_idx
on public.venture_artifacts(created_by);

create index if not exists venture_artifacts_artifact_type_idx
on public.venture_artifacts(artifact_type);

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
