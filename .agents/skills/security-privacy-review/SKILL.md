---
name: security-privacy-review
description: Use when reviewing sensitive workflows, auth, secrets, PII, payments, healthcare, caregiving, finance, digital inheritance, or AI safety risk.
---

# Security and Privacy Review

Review:

- Secrets and environment variables
- PII collection and minimization
- Consent and deletion flows
- Auth and authorization
- Data retention
- Prompt injection and model misuse
- Regulated advice claims
- Abuse cases
- RLS and database grants
- Server/client boundary and cache exposure
- Rate limiting and resource abuse
- Audit logging and incident/rollback readiness

Return launch blockers separately from improvements.

Launch blockers:

- Secrets committed to git or exposed through `NEXT_PUBLIC_`.
- Sensitive data readable from a client path without RLS or server authorization.
- Public-schema table exposed through Supabase Data API without RLS.
- Insert/update policies that let users write rows for another user or organization.
- Firestore/Storage path exposed to clients without Security Rules and allowed/denied tests.
- Firebase server SDK or Admin SDK used in an untrusted client or without IAM review.
- Missing consent, retention, or deletion path for sensitive personal data.
- Regulated medical, legal, financial, care, therapy, inheritance, or employment claims presented as qualified advice.
- AI output that can take irreversible action without user review.

Review method:

- Classify data: public, workspace-confidential, personal, sensitive, regulated.
- Trace data flow: browser, server component, action/route, Supabase table, logs, Vercel env, exports.
- Check least privilege: anon, authenticated, service role, organization roles, admin paths.
- Check abuse cases: prompt injection, mass writes, scraping, spam, account takeover, data poisoning.
- Define mitigation: block, reduce scope, add consent, add policy, add audit, add manual review, or defer.
