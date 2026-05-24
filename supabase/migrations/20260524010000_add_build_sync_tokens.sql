create table if not exists public.build_sync_tokens (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid not null references auth.users(id) on delete cascade,
  tool text not null check (tool in ('cursor')),
  token_hash text not null unique,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists build_sync_tokens_idea_id_idx
on public.build_sync_tokens(idea_id);

create index if not exists build_sync_tokens_organization_id_idx
on public.build_sync_tokens(organization_id);

create index if not exists build_sync_tokens_actor_id_idx
on public.build_sync_tokens(actor_id);

create index if not exists build_sync_tokens_status_idx
on public.build_sync_tokens(status);

create index if not exists build_sync_tokens_expires_at_idx
on public.build_sync_tokens(expires_at);

drop trigger if exists build_sync_tokens_set_updated_at on public.build_sync_tokens;
create trigger build_sync_tokens_set_updated_at
before update on public.build_sync_tokens
for each row execute function public.set_updated_at();

alter table public.build_sync_tokens enable row level security;

comment on table public.build_sync_tokens is
'Stores hashed external build tool bearer tokens for per-connection revocation. Raw tokens are never stored.';

comment on column public.build_sync_tokens.token_hash is
'SHA-256 hash of the signed build sync token. The bearer token itself is only shown once in the generated connection file.';
