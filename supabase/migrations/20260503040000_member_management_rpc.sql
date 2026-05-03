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
