# Build Plan 00

Ordered build units for the Next.js Starter Kit, covering both workstreams:
infrastructure hardening and the Laravel-style DX CLI. Mark `[x]` when a unit
is complete. Detailed specs live in sibling `NN-*.md` files.

## Workstream A — Infrastructure (units 1–4)

1. [x] **01-playwright-e2e** — Playwright config, health + auth guard specs (`01-playwright-e2e.md`)
2. [ ] **02-laravel-dx-cli** — Laravel-style generators: `scripts/make.ts` framework + make:model + make:migration this round; make:controller/component/action/seeder/hook/schema deferred (`02-laravel-dx-cli.md`)
3. [x] **03-build-verify** — `bun run lint` + `bun run build` green; fix root causes (`03-build-verify.md`)
4. [x] **04-env-audit** — `.env.example` audited against actual env var usage (`04-env-audit.md`)

## Workstream B — Laravel DX (deferred generators)

After unit 2 lands, extend `scripts/make.ts` with the remaining generators:

5. [ ] **make:controller** → Hono sub-router stub at `app/api/[[...route]]/<name>.ts`
6. [ ] **make:component** → feature component in `features/<name>/components/`
7. [ ] **make:action** → Server Action in `action/<name>.ts`
8. [ ] **make:seeder** → seeder registered in `prisma/seed.ts`
9. [ ] **make:hook** → hook in `features/<name>/hooks/`
10. [ ] **make:schema** → Zod schema in `features/<name>/schemas/`

## Workstream C — CMS features (units 10–14)

Recommended order: **10 → 13 → (11 ∥ 12)**; **14 is independent** and can run
any time, but its dark-mode migration must be tested in both modes.

1. [ ] **10-rich-text-editor** — TipTap v3 editor + SSR blog rendering (`10-rich-text-editor.md`) — Size L
2. [ ] **13-image-crop** — react-easy-crop + Canvas resize, media library, editor upload hook (`13-image-crop.md`) — Size M
3. [ ] **11-print-support** — `@media print` CSS (+ optional react-to-print) (`11-print-support.md`) — Size S
4. [ ] **12-social-sharing** — react-share + native share fallback + OG metadata (`12-social-sharing.md`) — Size S
5. [ ] **14-theme-system** — multi-theme via `data-theme`, keep `.dark` compat; persists to `UserPreferences.theme` (`14-theme-system.md`) — Size M. **RISK: test both modes.**

## Workstream D — Frontend gaps (units 16.x)

Ordered from the backend-to-frontend audit (`16-frontend-gap-plan.md`).
Quick wins first, orgs last (largest, needs its own detailed spec before start).

1. [x] **16.1 blog-index** — public `/blog` listing page — Size S
2. [x] **16.2 role-account-switch** — org switcher, role-aware nav, account menu — Size M
3. [x] **16.3 notifications-ui** — mount router + bell dropdown — Size M
4. [x] **16.4 search-surface** — mount search bar on dashboard — Size S
5. [x] **16.8 timeline-page** — wire timeline component to a route — Size S
6. [ ] **16.5 admin-audit-log-viewer** — Size M
7. [ ] **16.6 api-keys-settings** — Size M
8. [ ] **16.7 webhooks-admin** — Size M
9. [ ] **16.9 settings-persistence** — UserPreferences writes (incl. theme) — Size M
10. [ ] **16.10 organizations-e2e** — org API + member mgmt + invites — Size L (write spec first)

## Workstream E — Next gap plan (post-Workstream-D)

Ordered roadmap with sizes and dependencies lives in `17-next-gap-plan.md`.
It covers the remaining 16.x units (16.5 → 16.10), the Unit 15 backlog
(revisions, scheduled publishing, comments), and candidate new-gap units
spotted during the 2026-08-25 audit.

## Unit 15 — Backlog (not yet specced)

Candidates for future units; write specs when scheduled:

- Post revisions / draft history
- Scheduled publishing
- Comments
- Media management enhancements
- Auto-generated excerpts from content JSON
- SEO preview panel

## Laravel → project mapping

| Artisan command | This project | Output |
|-----------------|--------------|--------|
| `php artisan make:model Post -m` | `bun run make model post --migration` | Prisma model stub appended to `prisma/schema.prisma`; migration via `bunx prisma migrate dev`; service module at `features/post/lib/post.service.ts` |
| `php artisan make:controller PostController` | `bun run make controller post` | Hono sub-router at `app/api/[[...route]]/post.ts`, mounted in catch-all route.ts |
| `php artisan make:migration create_posts_table` | `bun run make migration <name>` | Guided edit of `prisma/schema.prisma` + run `bunx prisma migrate dev --name <name>` |
| `php artisan make:seeder PostSeeder` | `bun run make seeder post` | Seeder file + registration in `prisma/seed.ts` |
| `php artisan make:component` | `bun run make component <feature>/<Name>` | Component in `features/<feature>/components/` |
| `php artisan make:action` (custom) | `bun run make action <name>` | Server Action in `action/<name>.ts` with Zod validation scaffold |
| `make:hook` / `make:schema` (custom) | `bun run make hook\|schema ...` | Hook / Zod schema inside the matching feature folder |

## Status

**In progress:** 16.1 blog-index (Workstream D)

**Done:** 01-playwright-e2e, 03-build-verify, 04-env-audit, Workstream C (10–14)
