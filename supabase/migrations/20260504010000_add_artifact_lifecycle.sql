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

create index if not exists venture_artifacts_status_idx
on public.venture_artifacts(status);

create index if not exists venture_artifacts_approved_by_idx
on public.venture_artifacts(approved_by);
