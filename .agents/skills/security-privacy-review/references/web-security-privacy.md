# Web Security and Privacy Gate

## Data Classification

- Public: safe to show to anonymous users.
- Workspace-confidential: visible only to members of an organization.
- Personal: tied to an identifiable person.
- Sensitive: care, health, finance, legal, location, family, employment, children, identity, or private communications.
- Regulated: may require qualified review or jurisdiction-specific compliance.

## Boundary Checks

- Browser: no service role, no private secrets, no hidden assumptions about auth.
- Server: validate user, organization, ownership, and input.
- Database: RLS enabled, grants limited, `using` and `with check` policies present.
- Logs: do not log secrets, tokens, magic links, raw PII, or sensitive prompts.
- Exports: redact sensitive fields unless the user explicitly requested the export and has permission.

## Abuse Cases

- Prompt injection or instruction override
- Unauthorized row creation or ownership swap
- Bulk scraping or mass export
- Expensive AI/model calls or spam actions
- False regulated advice or unsafe automation
- Data poisoning through uploaded or pasted text

## Required Mitigations

- Minimize data collection.
- Explain consent and purpose before sensitive input.
- Provide deletion or retention path.
- Keep irreversible actions behind human review.
- Add audit trail for admin or organization-wide changes.
