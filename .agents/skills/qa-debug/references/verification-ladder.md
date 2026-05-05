# Verification Ladder

Use the lowest rung that can catch the risk, then climb when blast radius grows.

1. Static inspection for obvious contract mismatch
2. Focused unit or pure function check
3. Component or local browser reproduction
4. Auth/RLS allowed-denied database check
5. `pnpm lint`
6. `pnpm typecheck`
7. `pnpm build`
8. `pnpm harness:check`
9. Browser or Playwright smoke test
10. Preview deployment smoke test
11. Production smoke test after deploy

Stop only when the remaining risk is lower than the cost of another check, and state that tradeoff.
