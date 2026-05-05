# Development Principles

Use these as source-informed anchors for implementation prompts and code changes.

## Next.js

- Prefer Server Components for non-interactive data reads.
- Keep Client Components close to the UI that needs browser state or events.
- Use Server Actions or Route Handlers for mutations, and verify auth/authorization inside each boundary.
- Be intentional about caching, dynamic rendering, request-time APIs, and refresh behavior after writes.
- Add accessible loading, error, not-found, and recovery states for production workflows.

## Supabase

- Treat RLS as the database safety boundary for browser-accessible data.
- Enable RLS on every exposed table and grant only required operations.
- Use `with check` for inserts and updates when user or organization ownership matters.
- Keep service role access server-side only and avoid it in ordinary client workflows.
- Confirm both allowed and denied cases during QA.

## Firebase

- Consider Firebase when mobile-first delivery, realtime/offline sync, push notifications, analytics, crash reporting, remote config, test distribution, or Google Cloud integration are central to the app.
- Use Firebase App Hosting for Firebase-centered full-stack Next.js experiments, and keep Vercel when Vercel-native Next.js operations are the priority.
- Use Firestore or Realtime Database when document/realtime sync is the natural model.
- Use Firebase SQL Connect when the app needs PostgreSQL plus Firebase SDKs, realtime sync, local tooling, and Google Cloud integration.
- Security Rules protect client access to Firestore/Storage; server SDKs require IAM and trusted backend review because they bypass Security Rules.
- Consider App Check for public clients that directly access Firebase resources.

## Vercel

- Keep secrets in environment variables, not source code.
- Understand that env changes apply to new deployments only.
- Use Preview before Production when risky UI, data, auth, or migration changes land.
- Maintain a rollback path and a short incident response note for production changes.

## Testing and Quality

- Verify user-visible behavior rather than implementation details.
- Use resilient selectors and role/label based interactions for browser tests.
- Track Core Web Vitals basics: loading, interactivity, and layout stability.
- Treat accessibility errors, form recovery, and mobile layout failures as product bugs.
