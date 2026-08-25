# Progress Tracker — Next.js Starter Kit

Update this file after every meaningful implementation change.

## Current Phase

**Feature development** — Six-File Context scaffolded 2026-08-20; first feature milestone shipped (Unit 10 CMS rich text editor, 2026-08-24). Orchestra loop verified. Package manager standardized on Bun.

## Current Goal

- Unit 15 backlog; editor-side crop integration; theme preset DB persistence

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

- [x] CMS feature specs written: `context/specs/10-rich-text-editor.md` … `14-theme-system.md`; build plan Workstream C (order 10→13→11∥12, 14 independent) + Unit 15 backlog added; Next Up set to Unit 10 (2026-08-24)

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

- [x] Unit 10 — rich text editor complete (2026-08-24): TipTap editor module (`features/editor/` with schemas, hooks, components), posts CRUD API (`app/api/[[...route]]/posts.ts`, mounted in catch-all route), admin pages list/new/edit (`app/(protected)/admin/posts/`), `blog/[slug]` SSR render + `.prose-post` styles; lint + build green. Root cause note: Hono RPC calls go through `client.api.posts.*` because all routes mount under basePath `/api`.

- [x] Unit 13 — image crop complete (2026-08-24): `features/media/` module (use-crop.ts hook + helpers, image-cropper.tsx modal, upload-with-crop.tsx pipeline, media-library.tsx); admin media page routes dropped images through the crop pipeline via `cropFile` state → `<UploadWithCrop>` and prepends uploaded records to the existing grid/list. Note: `uploadImageFile()` in `features/editor/hooks/use-editor.ts` is the documented integration point for editor-side cropping.

- [x] Units 11 ∥ 12 complete (2026-08-25): Print — `features/print/components/print-button.tsx` (window.print()) + pure `@media print` block in globals.css (centralized hide-list, forced light tokens, break-inside rules, link URL expansion); Social — react-share@5.3.0, `features/social/components/share-buttons.tsx` (X/Facebook/LinkedIn/WhatsApp) + `share-menu.tsx` (native navigator.share on Web Share devices, copy-link fallback with feedback), mounted on blog post page; generateMetadata already emits full OG/Twitter tags. lint + build green.

- [x] Unit 14 — theme system complete (2026-08-25): three oklch preset token sets in globals.css under `[data-theme="sepia"|"nord"|"rose-pine"]` (complete palettes; `.dark` baseline untouched), themes config in `lib/site.ts` (`themePresets` id/label/swatch + `themeIds`), client helper `features/nav/lib/theme-preset.ts` (dataset.theme apply/validate/persist to localStorage key `theme-preset`; unknown values fall back to default), ModeToggle extended into dropdown with Light/Dark/System plus labeled swatch picker sourced from lib/site.ts. **Persistence: localStorage-only** (no preferences action/service existed; UserPreferences.theme write deferred). lint + build green.

- [x] In-app docs section complete (2026-08-25): `features/docs/` module (typed structured content in `lib/docs-data.ts`, 10 curated pages distilled from context/docs sources; server renderer `components/docs-content.tsx` reusing `.prose-post`; client sidebar `components/docs-sidebar.tsx` for active-link highlighting), routes `app/docs/page.tsx` (categorized card-grid index) + `app/docs/layout.tsx` (sticky desktop sidebar, mobile `<details>` collapsible nav) + `app/docs/[slug]/page.tsx` (generateStaticParams + generateMetadata, prev/next nav, Edit-on-GitHub link). Zero new deps. All 10 `/docs/*` routes prerendered SSG; lint + build green.


- [x] First Vercel deploy live (2026-08-25): production at https://nextjs-starter-kit-gules.vercel.app — config/docs wired (.env.example production block, project.yaml production env, docs/DEPLOYMENT.md, architecture, in-app docs Deployment page)

- [x] Docs usage-first content pass + theme audit (2026-08-25): added "How to use" walkthroughs to getting-started (full first-run steps), authentication (authClient/auth.api.getSession/checkIsAdmin code samples), api-and-rpc (add-endpoint example + client.api.* consumption with basePath gotcha), cms-features (author end-to-end, cropped uploads, programmatic theme switching), cli-generators (realistic model→migration→usage workflow), database (model+migration workflow); theme hardening — warning note text switched from amber palette colors to token-based text-foreground so notes stay readable under sepia/nord/rose-pine presets; all other docs surfaces verified token-only. lint + build green.

- [x] Build fix (2026-08-25): silenced 2 Turbopack "Dynamic filesystem access causes tracing of the whole project" warnings in `lib/services/upload.ts` local provider via `/*turbopackIgnore: true*/` on `path.join()` calls (~lines 60, 92). No behavior change; lint + build green, warnings gone.

- [x] Seeder rewrite (2026-08-25): `prisma/seed.ts` now seeds 4 loginable demo users (admin@example.com → SUPER_ADMIN, editor@example.com → EDITOR, mod@example.com → MODERATOR, user@example.com → USER) with Better Auth credential Account rows, all using password `demo1234`; 3 categories + 5 tags + 6 TipTap-HTML posts (PUBLISHED/DRAFT mix); "Acme Inc." org with owner/member + pending invitation. Old random-user generation removed; audit logs/notifications/system metrics are deleteMany'd and re-created idempotently scoped to the demo users. Added `db:seed` npm script (`bunx tsx prisma/seed.ts`). Verified against live DB 2026-08-25. lint green.

- [x] Google OAuth support (2026-08-25): Better Auth `socialProviders.google` in lib/auth.ts (conditional on GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET being set — feature is opt-in via env); Google sign-in buttons on login/register forms (rendered only when configured, surfaced via a server flag); GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET documented in .env.example and docs/ENV-VARS.md; in-app authentication doc page gained an "Enable Google sign-in" walkthrough (OAuth client creation, callback URIs for prod + localhost, env vars, redeploy, testing-mode consent caveat). lint + build green.

- [x] Card routing audit + fix (2026-08-25): home cards carry no hrefs and docs index derives slugs from `getDocsByCategory()` — both verified clean. Dashboard "Available Features" cards fixed: 7 placeholder `/dashboard` links rerouted to real targets (`/admin/media`, `/admin/posts`, `/docs/cms-features`, `/docs/database`, `/docs/api-and-rpc`). Seed attempt failed with P1017 (DATABASE_URL set but server closes connection — DB unreachable/paused locally); needs a reachable Postgres to run `bun run db:seed`. lint + build green.

- [x] Bug-fix round (2026-08-25): (1) P1017 connection pooling — `lib/prisma.ts` + `prisma/seed.ts` now create a `pg.Pool` and pass it to `PrismaPg` instead of a raw connection string; seed closes the pool via `pool.end()`. (2) auth-client duplicate client removed — `lib/auth-client.ts` re-exports signIn/signUp/signOut/useSession/requestPasswordReset/resetPassword/changePassword from the single configured `authClient` (was creating an unconfigured second client). (3) Conditional Google button — `lib/auth.ts` exports `isGoogleEnabled`; login/signup server pages pass `showGoogle={isGoogleEnabled}` through wrappers into `LoginPage`/`RegisterForm`, which render the divider + Google button only when enabled (defaults hidden when Google env vars are absent). lint + build green.

- [x] Email + DB + API test pass (2026-08-25): test email sent to peterpausianlian2020@gmail.com via SMTP (message ID 74ea99a1-197b-4ab8-89f7-7206c34aa5c8@gmail.com); `bunx tsx prisma/seed.ts` ran successfully against live DB for the first time (4 demo users, 3 categories, 5 tags, 6 posts, Acme Inc. org, 120 system metrics); `/api/health` returned 200; `/login` and `/blog/*` pages rendered. `scripts/test-email.ts` added for future SMTP verification. lint + build green.
- [x] Cloudflare R2 upload provider configured (2026-08-25): bucket `nextjs-starter-kit` at `nextjs-starter-kit-s3.peterlianpi.site`; `UPLOAD_PROVIDER=r2` in .env; `scripts/test-upload.ts` verifies upload + public access end-to-end; `.env.example` updated with R2 as active provider. Committed: `37129a5`.

- [x] Better Auth schema migration (2026-08-25): Added `issuer` field to Account model and `lastRequest` BigInt field to RateLimit model (required by Better Auth v1.7); seed updated to set `accountId: u.id` and `issuer: "local:credential"` for credential accounts; new migration `20260825055711_add_account_issuer` applied.

- [x] Better Auth audit round closed (2026-08-25): (a) Neon DB live — migrations + fresh seed applied, demo logins verified working via API (login 200, signup 200); (b) Better Auth v1.7 schema alignment — Account.issuer added, RateLimit.lastRequest BigInt, seed accountId=user.id + issuer="local:credential"; full field audit vs canonical schema found NO remaining gaps; (c) Google OAuth wired (conditional socialProviders in lib/auth.ts, login/register buttons, docs walkthrough).

- [x] db:test restored (2026-08-25): `scripts/test-database.ts` recreated (dotenv → pg Pool + PrismaPg adapter → `SELECT 1` + user.count() smoke query, clean exit 0/1, pool.end()); `bun run db:test` verified passing against live DB.

- [x] Editor-side image cropping wired (2026-08-25): TipTap toolbar image button now runs the Unit 13 crop pipeline — file pick → validateImageFile → ImageCropper modal (aspect presets/zoom) → getCroppedBlob canvas export → uploadImageFile with processed blob → URL inserted into editor; inline error message on validation/upload failure. lint + build green, dev server login 200.

- [x] Responsive frontend pass (2026-08-25): mobile-first fixes across nav sidebar/user/team-switcher, blog + docs h1 scaling, editor toolbar h-9 touch targets; token colors only. lint + build green.
- [x] OpenAPI docs (2026-08-25): hand-authored OpenAPI 3.1 spec in lib/openapi.ts (health/auth/posts/admin/upload/search/keys/webhooks), served as JSON at /api/openapi and rendered via @hono/swagger-ui at /api/docs with theme-aware styling (prefers-color-scheme + theme-preset); in-app docs gained an "API Reference" page with curl examples; README API bullet updated. lint + build green.

- [x] Unit 16.3 — notifications complete (2026-08-25): notifications router mounted in catch-all route and rewritten to house conventions; TanStack Query hook (`features/notifications/`); bell popover in app sidebar with unread badge; mark-read and mark-all-read flows. Runtime verified: build green; curl — list OK, read-all updatedCount:1, unread-count → 0.
- [x] Unit 16.3 finish (2026-08-25): cursor pagination API + infinite-query hook + notification-item/list load-more; mobile Drawer bell; `/notifications` page; Notifications (Bell) entry added to sidebar userNavMain. lint (0 errors) + build green.
- [x] Unit 16.8 — timeline complete (2026-08-25): admin activity page (`app/(protected)/admin/activity/page.tsx`) wired to `/api/timeline` (admin-gated AuditLog + SystemMetric feed) via `useTimeline` TanStack Query hook; All/Audit/Metrics filter tabs with page reset, Previous/Next pagination with `hasMore`, skeleton loading + empty states; `features/timeline/components/timeline.tsx` recolored to token-only classes (destructive for errors, muted/foreground otherwise — theme-preset safe); sidebar "Timeline" nav entry → `/admin/activity`. lint (0 errors) + build green.

- [x] Unit 16.4 — search page complete (2026-08-25): /search page with debounced input (300ms), type filters (All/Posts/Users/Audit Logs), grouped results with pagination, sidebar Search trigger + nav entry, lib/services/search.ts broadened to 3 entities.

- [x] Unit 16.8 — timeline complete (2026-08-25): `/api/timeline` router (merged AuditLog+SystemMetric items, filter tabs all/audit/metric, admin-gated), `/admin/activity` page mounting existing timeline components, sidebar entry. Placed under admin/ because audit logs expose other users' data.

## Next Up

Remaining Workstream D units, then Workstream E (`context/specs/17-next-gap-plan.md`):
1. 16.5 admin audit-log viewer → 16.6 API keys page → 16.7 webhooks admin
2. 16.9 settings persistence (notification toggles, theme preset → UserPreferences.theme)
3. 16.10 organizations end-to-end (members, invitations, roles) — last of 16.x
4. Workstream E: post revisions (PostVersion), scheduled publishing (Post.scheduledAt + cron), comments — then candidate new-gap units

Shipped 2026-08-25: ~~16.2 role/account switch~~ (org switcher + role-aware nav).

## Backend→Frontend Gap Audit (updated 2026-08-25)

Full matrix in `context/specs/16-frontend-gap-plan.md`; rendered in-app at `/docs/frontend-roadmap`. Completed since the original audit: ~~16.1 blog index~~ (`/blog` public listing), ~~16.2 role/account switch~~ (org switcher + role-aware nav, 2026-08-25), ~~16.3 notifications~~ (mounted router, bell popover + drawer, `/notifications` page), ~~16.4 search~~ (`/search` debounced page with type filters), ~~16.8 timeline~~ (`/admin/activity` with filter tabs). Remaining gaps: zero UI for webhooks (16.7) and API keys (16.6), no global audit-log viewer (16.5, in progress), settings notification toggles are local-only and theme preset localStorage-only (16.9); member/invite management pending (16.10). `check-role.ts` router remains dead code (unmounted) — delete in a cleanup pass.

## Open Questions

- ~~Actual production domain / Vercel project URL~~ — resolved 2026-08-25: https://nextjs-starter-kit-gules.vercel.app

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
- Dev server SMTP config: smtp.gmail.com:587 via pcore.system@gmail.com (app password)
- R2 bucket: nextjs-starter-kit, public domain nextjs-starter-kit-s3.peterlianpi.site