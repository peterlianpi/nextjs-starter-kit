# Progress Tracker — Next.js Starter Kit

Update this file after every meaningful implementation change.

## Current Phase

**Bootstrap** — Six-File Context scaffolded 2026-08-20 and upgraded to the JS Mastery methodology structure. Orchestra loop verified. Package manager standardized on Bun.

## Current Goal

- Deploy to Vercel with Resend + S3 (config documented; actual deploy pending)

## Completed

- [x] P-Core Six-File bootstrap (2026-08-20)
- [x] `project.yaml` identity + version (0.1.0, dev)
- [x] Existing codebase audit → project-overview, architecture, ui-context, code-standards
- [x] AGENTS.md agent system in place (core/prisma/auth/api/ui/form + security agents)
- [x] Context files upgraded to JS Mastery methodology structure (2026-08-20)
- [x] Orchestra health check passes; project detected (6/6 context files + project.yaml)
- [x] Package manager standardized on Bun (`bun run`, `bunx prisma`) across docs
- [x] Schema rearchitecture: blog content (Post/Category/Tag/PostTag), organizations (Organization/Member/Invitation), monitoring (SystemMetric) documented in architecture + project-overview (2026-08-24)
- [x] Doc sync: CLAUDE.md, AGENTS.md, code-standards, ui-context, project.yaml updated to match rearchitected schema (2026-08-24)
- [x] Infra unit 1: Playwright e2e scaffold (playwright.config.ts, tests/e2e/, package.json script) (2026-08-24)
- [x] Infra unit 2: context/specs/* rewritten to build-plan structure (2026-08-24)
- [x] Infra unit 3: .env.example audit (2026-08-24)
- [x] Infra unit 4: build-drift fixes — hono-client AdminStatsResponse, admin.ts auditLog createdById, features/mail/lib/appointment.ts, appointment.ts createAuditLog required title field (2026-08-24)
- [x] BLOCKER resolved: Appointment feature surface removed (8 files deleted, templates.ts truncated, hono-client typing fixed); email-resend.ts idempotencyKey moved to send options arg (Resend v6.10.0 signature); lint + build green (2026-08-24)

- [x] Laravel DX CLI framework: scripts/make.ts (make:model + make:migration), package.json scripts make:model/make:migration (2026-08-24)
- [x] Laravel DX CLI: all six remaining generators implemented (make:controller, make:component, make:action, make:seeder, make:hook, make:schema); smoke-tested + reverted; lint + build green (2026-08-24)
- [x] Registered project in portfolio tracking (`D:\peter-gtg\context\assignments.md`, A-007) (2026-08-24)
- [x] Deployment config wired: Vercel target, Resend + S3 marked as production defaults in `.env.example`; `docs/DEPLOYMENT.md` added; architecture decision recorded (2026-08-24)
- [x] Performance engineering methodology: `docs/PERFORMANCE.md` runbook (measure-first loop, classification, baselines, RCA/verification templates); perf-agent upgraded to evidence-driven rules; Performance section in code-standards; architecture invariant #9 (2026-08-24)

- [x] Dependency upgrade round complete (2026-08-24): recharts 3 + react-day-picker 10 deferred (break generated `components/ui/*`, invariant forbids editing), `@vercel/config` removed as dead dep, hono bumped to 4.13.4; lint+build green, Playwright chromium installed, e2e 3/3 passed

### Dependency Upgrade Summary

| Package | From → To | Status | Reason |
|---------|-----------|--------|--------|
| recharts | 2.15.4 → 3.10.1 | **Deferred** | Breaks generated `components/ui/chart.tsx` (10 TS errors); fix requires editing components/ui — invariant violation |
| react-day-picker | 9.14.0 → 10.0.1 | **Deferred** | Breaks generated `components/ui/calendar.tsx` (`table` classNames key removed) — same invariant |
| @vercel/config | 0.0.29 → 0.6.1 | **Removed** | Dead dependency, no code usage anywhere |
| hono | 4.13.3 → 4.13.4 | Upgraded | Safe patch bump |
| typescript | 5.9.3 → 7.0.2 | Deferred | Major breaking (documented previously) |
| eslint | 9.39.5 → 10.9.0 | Deferred | Major breaking (documented previously) |

**Playwright binary status:** Chromium headless shell v1234 installed successfully (`bunx playwright install chromium`). E2E suite runs against dev server: 3 passed / 0 failed.

## In Progress

- (none)

## Next Up

1. Create Vercel project, provision Neon Postgres, verify Resend domain, create S3 bucket + IAM keys, first deploy

## Open Questions

- Actual production domain / Vercel project URL (pending first deploy)

## Architecture Decisions

- Bun is the package manager (package.json uses `bun.lock`, `bun prisma generate` in postinstall)
- Hono catch-all at `app/api/[[...route]]/route.ts` is the only API surface
- Prisma 7 with `prisma-client` provider, driver adapter, generated client in `lib/generated/prisma`
- Blog content is DB-stored (`Post`/`Category`/`Tag`/`PostTag`) — no file-based content
- Multi-tenancy via `Organization`/`Member`/`Invitation` models
- Monitoring metrics recorded in `SystemMetric`; surfaced via timeline/dashboard views

## Session Notes

- Bootstrap: `D:\peter-gtg\pcore\bootstrap-project.ps1`
- Portfolio assignment tracking: `D:\peter-gtg\context\assignments.md`