alter table public.build_sync_tokens
drop constraint if exists build_sync_tokens_tool_check;

alter table public.build_sync_tokens
add constraint build_sync_tokens_tool_check
check (tool in ('cursor', 'codex', 'claude_code', 'antigravity'));

comment on column public.build_sync_tokens.tool is
'External build tool that owns the scoped sync token. Currently supports cursor, codex, claude_code, and antigravity.';
