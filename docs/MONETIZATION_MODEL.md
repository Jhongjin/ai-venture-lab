# Monetization Model

AI Venture Lab should monetize execution depth, not confusion. The free path must still let a new user understand the product promise: paste a messy idea, receive an AI-prepared business review, and see the next validation or build action.

## Pricing Principle

- Keep idea intake and basic evaluation useful without payment.
- Gate expensive automation, repeated usage, external-tool execution, and durable team workflows.
- Do not sell vague AI output volume as the product. Sell validated execution packages and connected build progress.
- Keep upgrade moments tied to a clear user job: more market evidence, more saved ideas, production package export, external tool sync, or team collaboration.
- Never block safety basics. Risk summaries, privacy warnings, and kill/pivot guidance stay available even on the free path.

## Proposed Tiers

| Tier | Intended user | Included value | Natural limit |
| --- | --- | --- | --- |
| Free | First-time founder/operator testing one idea | Idea intake, AI candidate draft, basic business/risk review, one validation plan, lightweight saved artifacts | Limited active ideas, limited source-backed market scans, package preview only |
| Pro | Solo builder or small team preparing real builds | More saved ideas, source-backed market scans, production package download, named external tool setup files, progress write-back, STEP 8 outcome review | Personal workspace and fair-use automation limits |
| Team | Small venture studio or product team | Shared workspaces, role handoffs, audit history, connector management, reusable package templates, higher scan/export limits | Workspace-level billing and admin controls |

## Feature Boundaries

| Product area | Free | Pro | Team |
| --- | --- | --- | --- |
| STEP 1 idea discovery | AI prepares candidates and one saved idea | Higher monthly candidate runs and more saved ideas | Shared idea intake queue |
| STEP 2 business review | Basic score and risks | Deeper score history and comparison across ideas | Workspace portfolio view |
| Market and competition scan | Limited source-backed scans, fallback estimate still visible | More source-backed scans and saved research notes | Shared research library and usage controls |
| STEP 5 production package | In-app preview and summary | Downloadable production package and tool-specific files | Reusable package templates and approval trails |
| STEP 7 external tools | Preview of supported tools | Cursor, Codex, Claude Code, and Antigravity setup files with write-back | Connector admin, revoke history, and workspace policy |
| STEP 8 outcome review | Basic task/outcome view | Outcome signal connection guide and saved learning reports | Team learning reports and cross-idea comparison |

## Credit Pilot

Current implementation direction:

- Free users receive 100 Venture Credits per month.
- Opening one full production package for one idea costs 30 credits.
- The free path exposes the first 4 production inputs: idea brief, research brief, 7-day validation sprint, and validation summary.
- The full package target is 10 production materials, including PRD, IA/product structure, design direction, technical direction, first build scope, work order, external tool handoff, verification notes, launch checklist, and learning loop.
- STEP 5 shows the credit balance and unlock state. Before unlock, the full package save path is disabled when the credit schema is active.
- STEP 5 explains the 30-credit value path as three connected outcomes: open all 10 production materials, save the AI production package, then receive final external-tool connection files.
- The profile and STEP 5 credit panels show the remaining build-pass capacity for the current month and explain that one build pass opens PRD, IA/screen structure, design direction, technical direction, work order, and external tool handoff files.
- The profile page shows the current-period credit grant, current-period spend, and recent credit ledger entries so users can see how monthly credits and build-pass spends changed their balance.
- The profile page explains the upgrade trigger in user language: Free is for understanding and validating the first idea; Pro is for repeated production packages, external tool write-back, and source-backed market evidence.
- The profile page includes a low-friction Pro interest button that records `upgrade_interest_clicked` in `telemetry_events` without starting a payment flow. This is the pre-Stripe demand signal for repeated production-package usage.
- The profile page summarizes visible Pro interest signals by count, source, intent, and latest event. This uses the existing telemetry RLS boundary and is not a global admin revenue dashboard yet.
- The profile page now shows a Free/Pro conversion boundary before the interest button: what Free covers, where Pro value starts, and that actual checkout is not opened until payment setup is ready.
- STEP 5 also exposes the same Pro interest path when a user lacks enough credits for the next build pass, with `source=step5_credit_panel` and `intent=insufficient_credits_for_build_pass`.
- Profile and STEP 5 show the exact shortfall when the user has some credits but cannot afford the next 30-credit production build pass, so the upgrade moment is tied to a visible next action rather than a generic paywall.
- The public homepage shows the beta Venture Credits boundary before signup: Free 100 credits, 30-credit build pass, and 4/10 free production materials.
- The public homepage now also frames the Free, Pro, and Team boundary around the natural upgrade moment: Free for first validation, Pro for repeated production and external tool execution, Team for shared workflows.
- STEP 7 build-sync token enforcement is enabled in Vercel Production with `ENFORCE_CREDIT_BUILD_PASS=1`; production smoke verifies this only through disposable build-pass spend with `BUILD_SYNC_SMOKE_ALLOW_BUILD_PASS_SPEND=1`.
- Stripe checkout remains off until the setup boundary in `docs/STRIPE_PAYMENT_SETUP.md` is satisfied and webhook-backed entitlements are implemented.

## Upgrade Moments

- The user tries to save more active ideas than the free limit.
- The user asks for another source-backed market scan after the free allowance.
- The user wants to download the production package instead of only previewing it.
- The user selects an external development tool and wants installable setup files.
- The user wants automatic progress write-back from the external tool.
- The user wants shared workspace features or audit history.

## Product Copy Direction

Use value-based language:

- "제작 패키지 다운로드"
- "외부 개발 도구 자동 반영"
- "출처 기반 시장 점검 추가 실행"
- "팀 작업 공간과 승인 기록"

Avoid developer-first language:

- "토큰 발급"
- "레지스트리"
- "MCP 권한"
- "JSON 가져오기"
- "하네스 실행"

## Not Yet Decided

- Exact price points.
- Whether the 100 monthly credits and 30-credit build pass become final Free limits.
- Whether external tool setup files are Pro-only, credit-gated, or available as a one-time trial.
- Whether source-backed market scans use a monthly quota, credit bundle, or fair-use limit.
- Whether Team includes white-label package templates.
