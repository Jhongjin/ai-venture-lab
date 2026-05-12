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

alter table public.organizations
add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

alter table public.organizations
alter column created_by set default auth.uid();

create index if not exists organizations_created_by_idx
on public.organizations(created_by);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_id_idx
on public.organization_members(user_id);

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

insert into public.organization_members (organization_id, user_id, role)
select id, created_by, 'owner'::public.organization_role
from public.organizations
where created_by is not null
on conflict (organization_id, user_id) do update
  set role = 'owner';

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

drop policy if exists "Allow members to read their organizations" on public.organizations;
drop policy if exists "Allow authenticated users to create organizations" on public.organizations;
drop policy if exists "Allow admins to update organizations" on public.organizations;
drop policy if exists "Allow admins to delete organizations" on public.organizations;
drop policy if exists "Allow members to read organization memberships" on public.organization_members;
drop policy if exists "Allow organization creators to add themselves" on public.organization_members;
drop policy if exists "Allow admins to manage organization memberships" on public.organization_members;

create policy "Allow members to read their organizations"
on public.organizations for select
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_member(id)
);

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
using (
  user_id = auth.uid()
  or public.is_organization_member(organization_id)
);

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
