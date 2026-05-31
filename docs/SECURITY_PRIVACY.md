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
- Use `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md` before deleting, archiving, or intentionally retaining disposable smoke data.

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
- Is cleanup ownership recorded for write smoke, and does it avoid primary operator data?
- How does the operator roll back a bad deployment or data migration?

## Privacy Evidence Checklist

Before broader beta, record the beta-scope answer for:

- Data inventory: what personal or workspace-confidential data can be entered, generated, stored, exported, or sent to AI tooling?
- Consent boundary: what does the user knowingly provide, and what is generated automatically?
- Retention TTL: how long are workspace records, smoke data, telemetry events, and artifacts retained?
- Deletion path: how can a workspace owner request deletion or cleanup?
- AI/log exposure: what data may appear in model prompts, server logs, telemetry, screenshots, or external handoff packets?
- Redaction coverage: which obvious identifiers are redacted before durable source excerpts are saved?

Unknown values remain blockers for broader beta.

Validation keywords: `privacy_data_inventory_required`, `retention_ttl_unresolved`, `deletion_path_unresolved`, `consent_boundary_unresolved`, `ai_prompt_data_boundary_unresolved`.

## Evidence Secret Scan

Release readiness includes a docs/templates-only scan for obvious committed secret patterns. This is a guardrail, not proof that secrets are absent.

If the scan reports a possible secret pattern, stop and rotate or remove the value before relying on the evidence packet.

The scan must not read `.env*`, local terminal values, browser sessions, cookies, production dashboards, or external runtime secrets.

Validation keywords: `obvious_secret_pattern_scan`, `secret_scan_not_proof`, `possible_secret_blocks_evidence`, `no_env_file_readback`.

## Supabase Gate

- Public-schema tables have RLS enabled.
- Policies are scoped to `authenticated` unless anonymous access is intentional.
- `insert` and `update` policies use `with check` for user or organization ownership.
- `service_role` is only used server-side and never in client bundles.
- Allowed and denied paths are tested before launch, including private-read and cross-workspace denied cases before broader beta.
- Cross-workspace denied checks require two disposable accounts and a disposable workspace pair; missing fixtures block the check instead of widening permissions.
- Static policy review is not production proof. Confirm migrations are applied and old public-read policies are absent before relying on a denied-case smoke run or rerun.
- Smoke cleanup must never touch primary operator data, customer data, or uncertain records without explicit user approval and a disposable target boundary.

Validation keywords: `cleanup_ownership_required_for_write_smoke`, `no_primary_operator_data_cleanup`.

## External Build Sync Tokens

- External build sync tokens are bearer tokens scoped to one idea, one actor, one organization boundary, and one named tool: `cursor`, `codex`, `claude_code`, or `antigravity`.
- The token allows only `implementation_tasks` creation or update for the scoped idea. It does not grant idea edits, artifact edits, user reads, workspace management, telemetry ingest, or service-role access to the external project.
- The progress endpoint rechecks that the actor is still the idea creator or a workspace owner/admin before writing.
- Tokens are signed server-side and expire after the configured TTL. The current default is 30 days.
- When `public.build_sync_tokens` is applied, the raw token is not stored. The server stores only a SHA-256 token hash, status, expiry, and last-used metadata for individual revocation.
- Re-downloading a connection file issues a new active connection for that tool. Old connections can be revoked individually from the final execution screen after the token registry migration is applied.
- Before the token registry migration is applied, existing signed tokens continue in legacy mode so production handoffs do not abruptly break; individual revoke controls remain unavailable until SQL is applied.
- If a token or any `venture-lab-sync.json` file is exposed before individual revocation is available, rotate `BUILD_SYNC_TOKEN_SECRET` and redeploy. If that env var is absent, rotate the fallback signing secret that was in use.
- `.cursor`, `.codex`, `.claude`, and `.antigravity` sync/progress files must stay out of Git, screenshots, chat, and exported artifacts.

Validation keywords: `build_sync_token_scoped`, `build_sync_token_bearer_secret`, `build_sync_token_hash_registry`, `build_sync_individual_revocation`, `named_tool_sync_files_gitignored`.

## Payment Gate

- Stripe readiness panels may show required environment variable names and configured counts, but must never show secret values, price ID values, webhook secrets, or checkout session URLs in docs, screenshots, telemetry, or chat.
- Checkout remains disabled until server-side session creation, raw-body webhook signature verification, and server-side entitlement writes exist.
- A successful checkout redirect, client-side state, or user-controlled request body must not unlock Pro or Team access.
- Failed, canceled, expired, or incomplete checkout must leave the account on Free and keep the Pro interest path available.
- Test-mode checkout and webhook verification must run against a disposable account before any broader paid beta.

Validation keywords: `payment_secret_values_hidden`, `stripe_webhook_signature_required`, `client_side_entitlement_denied`, `checkout_incomplete_keeps_free`.

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
- First-use idea extraction telemetry stores only coarse counts and normalized engine/fallback labels. Do not store raw source text, candidate bodies, full API error messages, or copied user notes in telemetry properties.
- Run `pnpm smoke:source-redaction` after changing source excerpt redaction patterns or moving intake artifact save paths.
- Prompt injection and data poisoning paths are listed before enabling automation.
