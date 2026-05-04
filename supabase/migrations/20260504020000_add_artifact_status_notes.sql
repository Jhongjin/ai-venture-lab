alter table public.venture_artifacts
add column if not exists status_note text not null default '';
