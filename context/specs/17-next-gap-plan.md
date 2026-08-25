# Spec 17 — Next Gap Plan (post-Workstream-D)

Ordered roadmap for everything left after Workstream D's shipped units
(16.1–16.4, 16.8). Sizes: S ≈ half day, M ≈ a day, L ≈ multi-day.
Write a detailed unit spec before starting any Size L item.

## Status header (2026-08-25)

- **Shipped:** 16.1 blog index, 16.2 role/account switch, 16.3 notifications,
  16.4 search page, 16.8 timeline — Workstream D core surfaces are live.
- **Pending (16.x):** 16.5, 16.6, 16.7, 16.9, 16.10.
- **Backlog promoted:** post revisions, scheduled publishing, comments
  (formerly Unit 15 candidates).
- **New gaps spotted:** see "Candidate new-gap units" below.

## Ordered build units

| # | Unit | Size | Dependencies | Notes |
|---|------|------|--------------|-------|
| 1 | **16.5 Admin audit-log viewer** — `/admin/audit-logs` global table with actor/action/date filters + pagination | M | none (table pattern from timeline) | Reuses admin gating; per-user logs already exist |
| 2 | **16.6 API keys settings page** — `/settings/api-keys`: create-once reveal, prefix display, revoke, permissions toggles | M | none | `api-keys` router already mounted; hashed storage done |
| 3 | **16.7 Webhooks admin page** — `/admin/webhooks` CRUD + deliveries drawer with status/retry info | M | after 16.5 (table pattern reuse) | Router is admin-gated; delivery tracking exists |
| 4 | **16.9 Settings persistence** — notification toggles → `UserPreferences`, theme preset localStorage → `UserPreferences.theme` with server sync on login | M | none; touches theme-preset helper | Needs a preferences Server Action or Hono route |
| 5 | **16.10 Organizations end-to-end** — member management UI, invitation send/accept flows, per-org roles surfaced in switcher | L | depends on 16.2 switcher shell (done) | GET/POST `/api/orgs` live; Member/Invitation endpoints still needed. Write detailed spec first |

Recommended order: strictly 1→5 as listed above (16.10 last).

## Promoted backlog units (formerly Unit 15)

| # | Unit | Size | Dependencies | Notes |
|---|------|------|--------------|-------|
| 6 | **Post revisions** — `PostVersion` model, snapshot on publish/edit, diff view + restore in editor | L | schema migration | New spec required (`prisma-agent` first) |
| 7 | **Scheduled publishing** — `Post.scheduledAt`, cron job publishes due posts via existing cron endpoint pattern | M | revisions optional but pairs well | Cron scaffolding already exists under `app/api/[[...route]]/cron` |
| 8 | **Comments** — comment model scoped to Post, moderation queue for admins, public threaded rendering on `/blog/[slug]` | L | none hard; rate limiting exists | Consider auth-required commenting only (no anonymous spam surface) |

## Candidate new-gap units (spotted during audit — plan only, not committed)

- **Email preview/admin** — no surface to inspect sent mail or templates; a dev-only preview route for `features/mail/lib/templates.ts` would help (Size S)
- **Rate-limit observability** — `RateLimit` model exists with no visibility; small admin card/table showing recent limits hit (Size S)
- **Backup/export tooling** — no DB export path beyond Prisma Studio; scripted JSON/CSV dump of content tables (Size M)
- **Dead code cleanup** — unmounted `check-role.ts` router should be deleted in a chore pass (Size S)
- **Monitoring charts on admin overview** — recharts rendering of `SystemMetric` trends (deferred from gap-plan matrix) (Size M)
- **Per-user "my files" media view** — upload router supports it; admins currently see everything (Size S)

## Status

**In progress:** 16.5

**Done:** 16.1–16.4, 16.8
