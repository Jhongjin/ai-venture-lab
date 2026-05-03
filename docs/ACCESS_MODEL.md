# Access Model

The venture lab starts with one operator, but the data model is prepared for teams.

## Current Production Posture

- Public reads are enabled until `20260503030000_private_workspace_reads.sql` is applied.
- After the private read migration, server rendering uses Supabase SSR cookies so logged-in operators can read rows through authenticated RLS.
- Authenticated writes require row ownership through `created_by = auth.uid()`.
- Organization fields are additive. Existing rows can remain personal with `organization_id = null`.
- Audit events are generated for idea, risk, decision, and experiment inserts, updates, and deletes after the organization migration is applied.

## Organization Tables

- `organizations`: workspace boundary for a venture lab or client project.
- `organization_members`: user membership with `owner`, `admin`, `member`, or `viewer`.
- `audit_events`: append-only operational trail for venture records.
- `add_organization_member_by_email`: owner/admin RPC for adding an existing Supabase Auth user to a workspace.

Member management intentionally starts with existing Auth users only. For a new collaborator, create or confirm the user in Supabase Auth first, then add that email from the workspace panel.

## Policy Direction

Near-term:

1. Attach new records to the operator's default organization when one exists.
2. Let owners/admins manage records in their organization.
3. Preserve global seed rows for early orientation.
4. Keep personal rows readable only by their owner.

Hardening pass before sensitive data:

1. Attach or remove global seed rows.
2. Scope every real row to organization membership.
3. Add invite flow for users who do not already exist in Supabase Auth.
4. Add member removal, last-owner protection, and retention rules.
5. Add admin-only audit export.

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
