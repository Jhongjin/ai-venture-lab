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
