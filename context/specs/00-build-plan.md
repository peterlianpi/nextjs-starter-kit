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

**In progress:** 02-laravel-dx-cli

**Done:** 01-playwright-e2e, 03-build-verify, 04-env-audit
