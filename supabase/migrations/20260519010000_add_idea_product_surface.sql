alter table public.ideas
add column if not exists product_surface text;

alter table public.ideas
drop constraint if exists ideas_product_surface_check;

alter table public.ideas
add constraint ideas_product_surface_check
check (
  product_surface is null
  or product_surface in (
    'web_app',
    'mobile_app',
    'web_site',
    'automation',
    'operator_console',
    'mcp_handoff'
  )
);

create index if not exists ideas_product_surface_idx
on public.ideas(product_surface);
