# Stripe Payment Setup Boundary

AI Venture Lab does not open checkout yet. The current product collects Pro interest first, then enables payment only after Stripe products, price IDs, webhook handling, and entitlement updates are ready.

## Current Product State

- `/profile` shows the Free/Pro boundary and records Pro interest without payment.
- `/profile` also shows a payment readiness panel. It only displays required environment variable names and readiness counts, never secret values.
- STEP 5 and STEP 7 are gated by Venture Credits and build passes, not Stripe subscriptions.
- No checkout session route or webhook route is live yet.

## Required Stripe Setup

Use Stripe test mode first.

1. Create a Pro monthly price and a Team monthly price in Stripe.
2. Add these Vercel environment variables to Preview and Production:
   - `NEXT_PUBLIC_APP_URL`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_MONTHLY_PRICE_ID`
   - `STRIPE_TEAM_MONTHLY_PRICE_ID`
3. Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` server-only. Do not paste their values into chat, docs, screenshots, or client code.
4. After checkout code exists, configure the Stripe webhook endpoint in test mode first.
5. Redeploy Vercel after env changes, then run production smoke before exposing checkout buttons.

The readiness panel is a setup checklist, not a payment switch. Even when all env names are present, checkout stays off until the server-side checkout route, verified webhook handler, and server-side entitlement writes are implemented and tested.

## App Implementation Boundary

Checkout should not unlock Pro by client-side state alone.

- Checkout session creation must run server-side.
- Webhooks must verify the Stripe signature from the raw request body.
- Pro entitlement should be stored server-side and read from the billing boundary before unlocking repeated production packages or higher limits.
- Failed, canceled, or incomplete checkout must leave the user on Free with the existing Pro interest path still available.

## Verification Before Turning On Checkout

- `pnpm quality:full`
- `pnpm smoke:billing`
- Stripe test checkout succeeds with a test card.
- Stripe webhook test event updates only the intended disposable account.
- A canceled checkout does not grant Pro.
- Production smoke passes after Vercel env changes and redeploy.

## Current User Action

No Stripe secret is needed until checkout code is added. When payment implementation starts, prepare Stripe test-mode products and price IDs first, then add the env vars in Vercel without sharing their values.
