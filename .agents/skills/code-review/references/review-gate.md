# Review Gate

Use this checklist before approving code that changes product behavior.

## Correctness

- Does the change satisfy the PRD/MVP acceptance criteria?
- Are optimistic updates, refreshes, and stale states handled?
- Are empty, loading, error, permission, read-only, and mobile states visible?

## Architecture

- Does the code follow existing module boundaries and naming?
- Are server and client responsibilities separated?
- Did the change avoid unnecessary dependencies and abstractions?

## Data

- Are migrations reversible or at least operationally recoverable?
- Are table ownership, organization boundaries, and indexes clear?
- Are data writes idempotent or protected from duplicate submissions where needed?

## Security

- Is every mutation authorized at the boundary?
- Are RLS, grants, and `with check` policies present for exposed tables?
- Are secrets and service role keys server-only?

## Verification

- Was the smallest relevant test run?
- Was `lint`, `typecheck`, `build`, and harness check run when behavior changed?
- Is there a production smoke path after deploy?
