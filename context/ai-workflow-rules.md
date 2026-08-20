# AI Workflow Rules — Next.js Starter Kit

## Approach

Build this project incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current state of progress. Always implement against specs — do not infer or invent behavior from scratch. The orchestra loop (plan → implement → verify → review) runs on build/fix/refactor prompts unless you say `no orchestra`.

## Agent system

This project uses a multi-agent system documented in `AGENTS.md`. Every change is reviewed by its governing agent:

- **nextjs-agent** — routing, RSC boundaries, metadata, middleware
- **prisma-agent** — schema, migrations, queries (coordinate with auth-agent)
- **auth-agent** — Better Auth, sessions, RBAC
- **api-agent** — Hono routes, RPC client, validation
- **ui-agent** — components, Tailwind, shadcn/ui
- **form-agent** — React Hook Form + Zod schemas
- Security agents (whitehat / blackhat / grayhat) — auth bypass, IDOR, injection, CSRF, rate limiting

## Scoping Rules

- Work on one feature unit at a time (`context/specs/NN-*.md`)
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Do not install new dependencies unless the active spec requires them

## When to Split Work

Split an implementation step if it combines:

- UI changes and database schema changes
- Multiple unrelated API routes
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing
- Read `node_modules/next/dist/docs/` for version-specific Next.js APIs — do not assume training-data APIs work

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*` — generated shadcn/ui primitives
- `lib/generated/` — generated Prisma client
- Third-party library internals inside `node_modules`

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

| Change | Update |
|--------|--------|
| Feature / scope | `project-overview.md` |
| Structure / boundary / invariant | `architecture.md` |
| Tokens / layout | `ui-context.md` |
| Convention / standard | `code-standards.md` |
| Progress / status | `progress-tracker.md` |
| Version / lifecycle | `project.yaml` |

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `bun run lint` and `bun run build` pass

## Standard prompts

**Implement unit:**

```
Read AGENTS.md and context/specs/NN-feature-name.md.
Update context/progress-tracker.md — mark unit in progress.
Implement exactly as specified.
```

**Close unit:**

```
Unit NN verified. Mark complete in context/progress-tracker.md.
```