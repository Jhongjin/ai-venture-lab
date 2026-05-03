alter table public.ideas
add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

alter table public.risks
add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

alter table public.decisions
add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

alter table public.experiments
add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

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
