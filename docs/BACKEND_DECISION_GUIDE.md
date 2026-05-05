# Backend Decision Guide

Use this guide before committing a new venture idea to Supabase, Firebase, or a hybrid backend.

## Current Default

AI Venture Lab itself stays on Supabase for now because it already uses Postgres tables, SQL migrations, ownership columns, organization membership, RLS policies, and relational joins across ideas, risks, experiments, orchestration runs, and artifacts.

## Choose Supabase When

- The app is primarily relational and SQL-first.
- You need Postgres migrations, SQL constraints, joins, views, or extensions early.
- RLS is the main authorization layer.
- Operators need direct table inspection, SQL editor workflows, or simple Postgres exports.
- The product is a B2B or operations console with multi-tenant organization boundaries.

## Choose Firebase When

- The app is mobile-first or cross-platform with Android/iOS/web parity.
- You need Google Analytics, Crashlytics, Cloud Messaging, Remote Config, App Distribution, Test Lab, or App Check as first-class product surfaces.
- Realtime document sync, offline-friendly UX, and client SDK velocity matter more than relational SQL ergonomics.
- The team wants Firebase Authentication, Cloud Functions, Storage, Extensions, and Google Cloud integration in one console.
- A prototype benefits from Firebase App Hosting for a full-stack web app tied to GitHub.

## Consider Firebase SQL Connect When

- The app needs PostgreSQL but also benefits from Firebase client SDKs, realtime sync, generated SDKs, local emulators, and Google Cloud integration.
- You want a Firebase-native path while keeping relational modeling.
- You can accept Cloud SQL/Firebase operational shape instead of the existing Supabase migration/RLS setup.

## Firestore Caveats

- Model around documents and collections, not normalized relational joins.
- Security Rules are powerful but separate from SQL/RLS thinking; server SDKs bypass Security Rules and require IAM discipline.
- Complex reporting, cross-entity joins, and ad hoc SQL-style analysis may need BigQuery export, denormalization, or a relational service.

## Firebase SQL Connect Caveats

- It is promising for Postgres-backed Firebase apps, but it is a different operational model from Supabase.
- Evaluate pricing, region, Cloud SQL requirements, generated SDK workflow, local emulator support, realtime/offline behavior, and migration ownership before switching.
- Do not migrate the existing venture lab until a target app specifically benefits from Firebase's ecosystem.

## Decision Matrix

| Question | Supabase leaning | Firebase leaning |
| --- | --- | --- |
| Data model | Relational, SQL, multi-table joins | Document, realtime, offline, app-event driven |
| Authorization | Postgres RLS and SQL policies | Security Rules, IAM, App Check, Firebase Auth |
| Product type | B2B console, internal tool, workflow system | Consumer/mobile app, realtime collaboration, push-heavy app |
| Analytics/run stack | Bring your own analytics | Google Analytics, Crashlytics, Remote Config, Test Lab |
| Hosting | Vercel-first Next.js | Firebase App Hosting or Google Cloud-centered |
| AI/agent workflow | SQL/RLS plus app code | Firebase Genkit, SQL Connect, Google AI integration |

## Required Output

Every technical spec must include a backend choice:

- Selected backend:
- Why this backend:
- Rejected backend and why:
- Auth boundary:
- Data authorization boundary:
- Local development and emulator plan:
- Deployment and rollback plan:
- Migration or exit plan:
