# Security and Privacy

## Default Stance

- Do not commit secrets.
- Do not store real personal data in early prototypes.
- Do not scrape or ingest private data without explicit user consent.
- Do not build regulated advice flows without a domain review.
- Do not expose private env vars, service-role keys, auth tokens, or raw sensitive logs to the browser.
- Do not rely on UI checks alone for authorization.
- Enable RLS on every Supabase table exposed through the browser-facing Data API.

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
- How does the operator roll back a bad deployment or data migration?

## Supabase Gate

- Public-schema tables have RLS enabled.
- Policies are scoped to `authenticated` unless anonymous access is intentional.
- `insert` and `update` policies use `with check` for user or organization ownership.
- `service_role` is only used server-side and never in client bundles.
- Allowed and denied paths are tested before launch.

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
- Prompt injection and data poisoning paths are listed before enabling automation.
