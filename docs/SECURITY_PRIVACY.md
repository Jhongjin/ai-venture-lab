# Security and Privacy

## Default Stance

- Do not commit secrets.
- Do not store real personal data in early prototypes.
- Do not scrape or ingest private data without explicit user consent.
- Do not build regulated advice flows without a domain review.
- Do not expose private env vars, service-role keys, auth tokens, or raw sensitive logs to the browser.
- Do not copy `.env.local`, browser-smoke passwords, telemetry secrets, service-role keys, cookies, sessions, signed URLs, or bearer tokens into docs, artifacts, screenshots, chat, or Build Relay packets.
- Do not rely on UI checks alone for authorization.
- Enable RLS on every Supabase table exposed through the browser-facing Data API.
- Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` before beta smoke, authenticated smoke, telemetry smoke, or deployment evidence collection.
- Use `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md` before any cross-workspace, second-account, or denied-case smoke.
- Use `docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md` before claiming private-read beta readiness from Supabase policy files.
- Use `docs/RLS_DISPOSABLE_FIXTURE_HANDOFF.md` before asking the operator to provide real RLS smoke fixtures.

## Sensitive Domains

Extra review is required for:

- Caregiving, health, senior care, disability, or care worker workflows.
- Finance, subscriptions, payments, account access, or cancellation flows.
- Digital inheritance, death planning, account recovery, or family access.
- Psychological coaching, conflict mediation, or relationship guidance.

## Launch Questions

- What data is collected?
- Why is each field necessary?
- Where is it stored?
- Who can access it?
- How can the user delete it?
- What happens if the model is wrong?
- Which role can select, insert, update, and delete each row?
- Do insert/update policies prevent ownership or organization spoofing?
- What is logged, retained, exported, or sent to AI tools?
- Does the smoke or deployment evidence follow `beta_env_smoke_boundary_docs_only`, `names_only_no_values`, and `no_secret_output`?
- Does private-read beta evidence follow `rls_allowed_denied_smoke_plan`, `summary_only_rls_evidence`, and `cross_workspace_denied_case` without service-role bypass?
- If authenticated smoke writes data, is it using `disposable_beta_account_only` with explicit per-run approval and cleanup ownership?
- How does the operator roll back a bad deployment or data migration?

## Supabase Gate

- Public-schema tables have RLS enabled.
- Policies are scoped to `authenticated` unless anonymous access is intentional.
- `insert` and `update` policies use `with check` for user or organization ownership.
- `service_role` is only used server-side and never in client bundles.
- Allowed and denied paths are tested before launch, including private-read and cross-workspace denied cases before broader beta.
- Cross-workspace denied checks require two disposable accounts and a disposable workspace pair; missing fixtures block the check instead of widening permissions.
- Static policy review is not production proof. Confirm migrations are applied and old public-read policies are absent before relying on real denied-case smoke.

## Firebase Gate

- Firestore or Storage writes require Security Rules before launch.
- Rules must check `request.auth`, ownership, organization membership, and incoming data shape where relevant.
- Server SDKs bypass Firestore Security Rules, so server access requires IAM review and trusted backend boundaries.
- App Check is considered for public web/mobile clients that call Firebase resources directly.
- Cloud Functions that mutate sensitive data require auth, authorization, validation, logging, and rollback notes.
- Firebase SQL Connect projects need generated SDK, auth, schema, mutation, realtime/offline, pricing, and Cloud SQL region review.

## AI Gate

- AI output is advisory unless a reviewed PRD explicitly allows action.
- User can edit, retry, discard, or override generated output.
- Prompt input and output are treated as sensitive when they contain personal, care, finance, legal, family, or workplace data.
- Source excerpts saved from automatic idea extraction are redacted for obvious email, phone, card, account, password, passport, and identity-number patterns before becoming durable artifacts.
- Prompt injection and data poisoning paths are listed before enabling automation.
