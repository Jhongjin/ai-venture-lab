create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  idea_id uuid references public.ideas(id) on delete set null,
  entry_type text not null check (
    entry_type in ('monthly_grant', 'build_pass_spend', 'refund', 'adjustment')
  ),
  amount integer not null check (amount <> 0),
  period_key text not null default '',
  idempotency_key text not null unique,
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_id_idx
on public.credit_ledger(user_id);

create index if not exists credit_ledger_organization_id_idx
on public.credit_ledger(organization_id);

create index if not exists credit_ledger_idea_id_idx
on public.credit_ledger(idea_id);

create index if not exists credit_ledger_entry_type_idx
on public.credit_ledger(entry_type);

create table if not exists public.idea_build_passes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  purchased_by uuid not null references auth.users(id) on delete cascade,
  credit_ledger_id uuid references public.credit_ledger(id) on delete set null,
  cost_credits integer not null default 30 check (cost_credits >= 0),
  created_at timestamptz not null default now(),
  unique (idea_id)
);

create index if not exists idea_build_passes_organization_id_idx
on public.idea_build_passes(organization_id);

create index if not exists idea_build_passes_purchased_by_idx
on public.idea_build_passes(purchased_by);

comment on table public.credit_ledger is
'Monthly free credits, build-pass spend entries, and future credit adjustments. Amount is positive for grants/refunds and negative for spend.';

comment on table public.idea_build_passes is
'Unlocks the full production package and external development-tool execution for one idea after the credit spend is recorded.';

alter table public.credit_ledger enable row level security;
alter table public.idea_build_passes enable row level security;

drop policy if exists "Allow users to read own credit ledger"
on public.credit_ledger;

drop policy if exists "Allow users to read accessible idea build passes"
on public.idea_build_passes;

create policy "Allow users to read own credit ledger"
on public.credit_ledger for select
to authenticated
using (user_id = auth.uid());

create policy "Allow users to read accessible idea build passes"
on public.idea_build_passes for select
to authenticated
using (
  purchased_by = auth.uid()
  or (
    organization_id is not null
    and public.is_organization_member(organization_id)
  )
  or exists (
    select 1
    from public.ideas
    where ideas.id = idea_build_passes.idea_id
      and ideas.created_by = auth.uid()
  )
);

create or replace function public.get_venture_credit_balance(target_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0)::integer
  from public.credit_ledger
  where user_id = target_user_id;
$$;

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
  safe_period text;
  next_balance integer;
begin
  viewer_id := auth.uid();

  if viewer_id is null then
    raise exception 'LOGIN_REQUIRED' using errcode = '28000';
  end if;

  if grant_amount <= 0 then
    raise exception 'INVALID_GRANT_AMOUNT' using errcode = '22023';
  end if;

  safe_period := coalesce(nullif(regexp_replace(target_period, '[^0-9-]', '', 'g'), ''), to_char(now(), 'YYYY-MM'));

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
    grant_amount,
    safe_period,
    'monthly-free:' || viewer_id::text || ':' || safe_period,
    'Free monthly Venture Credits',
    viewer_id
  )
  on conflict (idempotency_key) do nothing;

  next_balance := public.get_venture_credit_balance(viewer_id);

  return jsonb_build_object(
    'balance', next_balance,
    'periodKey', safe_period
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
begin
  viewer_id := auth.uid();

  if viewer_id is null then
    raise exception 'LOGIN_REQUIRED' using errcode = '28000';
  end if;

  if target_idea_id is null then
    raise exception 'IDEA_REQUIRED' using errcode = '22023';
  end if;

  if spend_amount <= 0 then
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

  if next_balance < spend_amount then
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
    -spend_amount,
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
    spend_amount
  )
  on conflict (idea_id) do update
    set idea_id = excluded.idea_id
  returning * into pass_row;

  next_balance := public.get_venture_credit_balance(viewer_id);

  return jsonb_build_object(
    'ok', true,
    'alreadyUnlocked', false,
    'chargedCredits', spend_amount,
    'balance', next_balance,
    'ideaId', target_idea_id,
    'passId', pass_row.id
  );
end;
$$;

revoke all on function public.get_venture_credit_balance(uuid) from public;
revoke all on function public.grant_monthly_free_credits(text, integer) from public;
revoke all on function public.spend_credits_for_idea_build_pass(uuid, integer) from public;

grant execute on function public.grant_monthly_free_credits(text, integer) to authenticated;
grant execute on function public.spend_credits_for_idea_build_pass(uuid, integer) to authenticated;
