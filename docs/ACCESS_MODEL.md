# Access Model

The venture lab starts with one operator, but the data model is prepared for teams.

## Current Production Posture

- Public reads are still enabled for portfolio tables so the deployed console can render before authenticated server-side reads are added.
- Authenticated writes require row ownership through `created_by = auth.uid()`.
- Organization fields are additive. Existing rows can remain personal with `organization_id = null`.
- Audit events are generated for idea, risk, decision, and experiment inserts, updates, and deletes after the organization migration is applied.

## Organization Tables

- `organizations`: workspace boundary for a venture lab or client project.
- `organization_members`: user membership with `owner`, `admin`, `member`, or `viewer`.
- `audit_events`: append-only operational trail for venture records.

## Policy Direction

Near-term:

1. Keep public reads while the app is a public portfolio console.
2. Attach new records to the operator's default organization when one exists.
3. Let owners/admins manage records in their organization.
4. Preserve personal rows for early single-operator testing.

Hardening pass before sensitive data:

1. Move portfolio reads behind authenticated Supabase session context.
2. Remove public read policies from `ideas`, `risks`, `decisions`, and `experiments`.
3. Scope all reads to organization membership.
4. Add invite flow, member removal, and retention rules.

## Manual Operator Bootstrap

After running `20260503020000_add_organization_access_model.sql`, create the first workspace from SQL.

For SQL Editor, replace the email and slug values:

```sql
with operator as (
  select id
  from auth.users
  where email = 'masterjhj@gmail.com'
  limit 1
),
created_org as (
  insert into public.organizations (name, slug, created_by)
  select 'AI Venture Lab', 'ai-venture-lab', id
  from operator
  on conflict (slug) do update
    set name = excluded.name
  returning id
)
insert into public.organization_members (organization_id, user_id, role)
select created_org.id, operator.id, 'owner'
from created_org, operator
on conflict (organization_id, user_id) do update
  set role = 'owner';
```

Existing personal rows can be attached later once the workspace is confirmed:

```sql
update public.ideas
set organization_id = (
  select id from public.organizations where slug = 'ai-venture-lab'
)
where organization_id is null;

update public.risks
set organization_id = (
  select id from public.organizations where slug = 'ai-venture-lab'
)
where organization_id is null;

update public.decisions
set organization_id = (
  select id from public.organizations where slug = 'ai-venture-lab'
)
where organization_id is null;

update public.experiments
set organization_id = (
  select id from public.organizations where slug = 'ai-venture-lab'
)
where organization_id is null;
```
