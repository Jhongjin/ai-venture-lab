$ErrorActionPreference = "Stop"

pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
pnpm release:check
