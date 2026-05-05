do $$
declare
  constraint_name text;
begin
  if to_regclass('public.venture_artifacts') is null then
    raise notice 'public.venture_artifacts does not exist. Run the base venture_artifacts migration first.';
    return;
  end if;

  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.venture_artifacts'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%artifact_type%'
  order by conname
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.venture_artifacts drop constraint %I', constraint_name);
  end if;

  alter table public.venture_artifacts
  add constraint venture_artifacts_artifact_type_check
  check (
    artifact_type in (
      'idea_brief',
      'research_note',
      'prd',
      'mvp_spec',
      'backend_decision',
      'design_brief',
      'tech_spec',
      'dev_runbook',
      'launch_checklist'
    )
  );
end $$;
