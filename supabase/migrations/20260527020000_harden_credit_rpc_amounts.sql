create or replace function public.grant_monthly_free_credits(
  target_period text,
  grant_amount integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid;
  expected_period text;
  requested_period text;
  fixed_grant_amount integer := 100;
  next_balance integer;
begin
  viewer_id := auth.uid();

  if viewer_id is null then
    raise exception 'LOGIN_REQUIRED' using errcode = '28000';
  end if;

  expected_period := to_char(timezone('utc', now()), 'YYYY-MM');
  requested_period := nullif(btrim(coalesce(target_period, '')), '');

  if requested_period is null then
    requested_period := expected_period;
  end if;

  if requested_period !~ '^[0-9]{4}-[0-9]{2}$' or requested_period <> expected_period then
    raise exception 'INVALID_CREDIT_PERIOD' using errcode = '22023';
  end if;

  if grant_amount is not null and grant_amount <> fixed_grant_amount then
    raise exception 'INVALID_GRANT_AMOUNT' using errcode = '22023';
  end if;

  insert into public.credit_ledger (
    user_id,
    entry_type,
    amount,
    period_key,
    idempotency_key,
    note,
    created_by
  )
  values (
    viewer_id,
    'monthly_grant',
    fixed_grant_amount,
    expected_period,
    'monthly-free:' || viewer_id::text || ':' || expected_period,
    'Free monthly Venture Credits',
    viewer_id
  )
  on conflict (idempotency_key) do nothing;

  next_balance := public.get_venture_credit_balance(viewer_id);

  return jsonb_build_object(
    'balance', next_balance,
    'periodKey', expected_period
  );
end;
$$;

create or replace function public.spend_credits_for_idea_build_pass(
  target_idea_id uuid,
  spend_amount integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid;
  target_idea record;
  existing_pass record;
  next_balance integer;
  ledger_id uuid;
  pass_row record;
  fixed_spend_amount integer := 30;
begin
  viewer_id := auth.uid();

  if viewer_id is null then
    raise exception 'LOGIN_REQUIRED' using errcode = '28000';
  end if;

  if target_idea_id is null then
    raise exception 'IDEA_REQUIRED' using errcode = '22023';
  end if;

  if spend_amount is not null and spend_amount <> fixed_spend_amount then
    raise exception 'INVALID_SPEND_AMOUNT' using errcode = '22023';
  end if;

  select id, name, organization_id, created_by
  into target_idea
  from public.ideas
  where id = target_idea_id;

  if not found then
    raise exception 'IDEA_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not (
    target_idea.created_by = viewer_id
    or (
      target_idea.organization_id is not null
      and public.is_organization_admin(target_idea.organization_id)
    )
  ) then
    raise exception 'BUILD_PASS_PERMISSION_DENIED' using errcode = '42501';
  end if;

  select *
  into existing_pass
  from public.idea_build_passes
  where idea_id = target_idea_id;

  if found then
    next_balance := public.get_venture_credit_balance(viewer_id);

    return jsonb_build_object(
      'ok', true,
      'alreadyUnlocked', true,
      'chargedCredits', 0,
      'balance', next_balance,
      'ideaId', target_idea_id,
      'passId', existing_pass.id
    );
  end if;

  next_balance := public.get_venture_credit_balance(viewer_id);

  if next_balance < fixed_spend_amount then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;

  insert into public.credit_ledger (
    user_id,
    organization_id,
    idea_id,
    entry_type,
    amount,
    idempotency_key,
    note,
    created_by
  )
  values (
    viewer_id,
    target_idea.organization_id,
    target_idea_id,
    'build_pass_spend',
    -fixed_spend_amount,
    'idea-build-pass:' || target_idea_id::text,
    'Full production package and external development-tool execution unlock',
    viewer_id
  )
  on conflict (idempotency_key) do nothing
  returning id into ledger_id;

  if ledger_id is null then
    select id
    into ledger_id
    from public.credit_ledger
    where idempotency_key = 'idea-build-pass:' || target_idea_id::text;
  end if;

  insert into public.idea_build_passes (
    idea_id,
    organization_id,
    purchased_by,
    credit_ledger_id,
    cost_credits
  )
  values (
    target_idea_id,
    target_idea.organization_id,
    viewer_id,
    ledger_id,
    fixed_spend_amount
  )
  on conflict (idea_id) do update
    set idea_id = excluded.idea_id
  returning * into pass_row;

  next_balance := public.get_venture_credit_balance(viewer_id);

  return jsonb_build_object(
    'ok', true,
    'alreadyUnlocked', false,
    'chargedCredits', fixed_spend_amount,
    'balance', next_balance,
    'ideaId', target_idea_id,
    'passId', pass_row.id
  );
end;
$$;

revoke all on function public.grant_monthly_free_credits(text, integer) from public;
revoke all on function public.spend_credits_for_idea_build_pass(uuid, integer) from public;

grant execute on function public.grant_monthly_free_credits(text, integer) to authenticated;
grant execute on function public.spend_credits_for_idea_build_pass(uuid, integer) to authenticated;
