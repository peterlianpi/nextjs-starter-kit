# Code Standards — Next.js Starter Kit

## General

- Keep modules small and single-purpose — feature-sliced per `features/<feature>/`
- Fix root causes, do not layer workarounds
- Do not mix unrelated concerns in one component or route
- Server-first by default; add `"use client"` only when browser interactivity requires it

## TypeScript

- Strict mode throughout the project
- Avoid `any` — use explicit interfaces or narrowly scoped types
- Validate unknown external input at system boundaries (Zod) before trusting it
- Read `node_modules/next/dist/docs/` for version-specific Next.js APIs before writing (this version has breaking changes)

## Next.js

- App Router only — no Pages Router patterns
- Protected routes live in `(protected)/` route group with server-side session check
- Keep route handlers focused on a single responsibility
- Import metadata from `lib/site.ts` — never hardcode site config in layouts

## Styling

- Use CSS variable tokens from `app/globals.css` — no hardcoded hex/oklch values in components
- Follow the border-radius scale defined in `ui-context.md`
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Dark mode via `next-themes` — test both themes

## API Routes (Hono)

- Validate and parse request input with `@hono/zod-validator` before any logic runs
- Enforce auth and ownership before any mutation
- Return consistent response shape: `{ success: boolean, data?: T, error?: { code, message } }`
- Export `AppType` from `app/api/[[...route]]/route.ts`; client uses `hc<AppType>("")`

## Data and Storage

- `prisma/schema.prisma` is the single source of truth
- Run `bunx prisma migrate dev` after schema changes; keep `prisma/seed.ts` updated
- Use `lib/prisma.ts` singleton (`@prisma/adapter-pg`) — never instantiate `PrismaClient` directly
- Import generated client from `./generated/prisma/client` (with `/client`)
- Wrap all database calls in try-catch blocks
- Metadata belongs in the database; large generated content belongs in file/blob storage

## File Organization

- `app/` — pages, route groups, Hono catch-all
- `features/<feature>/` — feature modules (components/, hooks/, lib/, schemas/, types/)
- `components/` + `components/ui/` — shared + shadcn primitives (do not modify `ui/`)
- `lib/` — config, auth, prisma, api, services, utils
- `prisma/` — schema, migrations, seed
- `tests/` — Playwright E2E specs

## Testing

| Type | Command |
|------|---------|
| Lint | `bun run lint` (eslint) |
| Build | `bun run build` (next build) |
| DB smoke | `bun run db:test` (tsx) |
| E2E | Playwright (`@playwright/test`) — run `bun run build` first |

## Git commits

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Verification before merge

- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] `context/progress-tracker.md` updated
- [ ] No secrets or `.env` committed