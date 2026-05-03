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
