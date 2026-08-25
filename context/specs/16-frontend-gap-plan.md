# Spec 16 — Frontend Gap Plan

Audit (2026-08-25) of every backend capability against existing frontend
surfaces, and the ordered build units that close the gaps. Evidence sources:
`app/api/[[...route]]/route.ts` + sub-routers, `app/` route tree,
`features/*`, `prisma/schema.prisma`.

## Gap Matrix

| Area | Backend capability | Existing frontend | Missing frontend |
|------|--------------------|-------------------|------------------|
| Auth | Better Auth: email/password, verification, reset, RBAC, Google OAuth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `(protected)` guard | None — complete |
| Blog | `posts` router: GET/POST `/api/posts`, GET/PATCH/DELETE `/api/posts/:id` | Admin CRUD pages (`/admin/posts*`), SSR reader at `/blog/[slug]` | **Public blog index** (`/blog` listing) — no page exists |
| Media | `upload` router: POST/GET `/api/upload`, DELETE `/api/upload/:id`; multi-provider storage | `/admin/media` grid with crop pipeline (`features/media/`) | Per-user "my files" surface (optional); none blocking |
| Search | `search` router: GET `/api/search?q=` (auth required) | `features/search/components/search-bar.tsx` + hook exist but **mounted nowhere** | A search surface (command palette or `/dashboard` search panel) |
| Notifications | `notifications.ts` router: list / mark-read / read-all / unread-count — **NOT mounted in route.ts** | None (no feature module, no UI) | Mount router; bell dropdown in sidebar header; optional `/notifications` page |
| Dead code | `check-role.ts` router — **not mounted** (superseded by `authClient.admin.hasPermission`) | n/a | Delete or mount; document decision |
| Admin analytics | GET `/api/admin/stats`, per-user audit-logs/sessions/notifications endpoints | `/admin` overview consumes stats; `/admin/users/[id]` detail page | **Global audit-log viewer** (`/admin/audit-logs`) with filtering |
| API keys | `api-keys` router: POST/GET/PATCH/DELETE `/api/keys` (hashed keys) | None | `/settings/api-keys` management page (create-once reveal, revoke, toggle) |
| Webhooks | `webhooks` router: POST/GET/DELETE `/api/webhooks`, deliveries listing (admin-gated) | None | `/admin/webhooks` page + delivery log drawer |
| Organizations | DB models only (`Organization`, `Member`, `Invitation`) — **no API endpoints** | `team-switcher.tsx` is a static placeholder dropdown | Org CRUD/membership API + org switcher + member management + invitations |
| Timeline | SystemMetric data seeded; audit logs exist | `features/timeline/components/timeline.tsx` exists but **no page uses it** | `/dashboard/timeline` or `/admin/activity` page wiring the component to data |
| Settings | `UserPreferences` model (timezone etc.); theme presets localStorage-only | Profile, password, sessions UI; notification toggles are **local state only** | Persist prefs (incl. theme preset → `UserPreferences.theme`), timezone picker |
| Monitoring | SystemMetric writes via cron | No monitoring dashboard UI | Charts on admin overview (recharts) — deferred unless needed |

## Build Units (ordered)

| # | Unit | Size | Dependencies |
|---|------|------|--------------|
| 16.1 | **Blog index** — `/blog` public listing (published posts, pagination, category/tag filter hooks already in schema). Server Component reading Prisma directly. | S | none |
| 16.2 | **Role/account switch** — see breakdown below | M | none |
| 16.3 | **Notifications** — mount router in catch-all, `features/notifications/` module, bell icon w/ unread badge in sidebar header, mark-read actions | M | none |
| 16.4 | **Search surface** — mount existing search-bar in dashboard (or cmd-k palette) hitting `/api/search` | S | none |
| 16.5 | **Admin audit-log viewer** — `/admin/audit-logs` table w/ actor/action/date filters (reuse table-agent DataTable) | M | none |
| 16.6 | **API keys settings page** — `/settings/api-keys`: create form, one-time key reveal, list w/ prefix, toggle/revoke | M | none |
| 16.7 | **Webhooks admin** — `/admin/webhooks`: list, create dialog (secret shown once), deliveries drawer | M | 16.5 pattern |
| 16.8 | **Timeline page** — route mounting `timeline.tsx` fed by audit-log/SystemMetric queries | S | none |
| 16.9 | **Settings persistence** — notification prefs + theme preset + timezone persisted to `UserPreferences` via Server Action | M | none |
| 16.10 | **Organizations end-to-end** — org API sub-router (CRUD + members + invites), real org switcher replacing static team-switcher, `/settings/organizations` member mgmt + invite flow | L | 16.2 |

Recommended order: 16.1 → 16.2 → 16.3 → 16.4 → 16.8 (quick wins first),
then 16.5 → 16.6 → 16.7 → 16.9, then 16.10 last (largest, needs its own spec).

## Unit 16.2 — Role/Account Switch (detailed)

DB already has `Organization`/`Member`/`Invitation`. Deliver three pieces in
`features/nav/`:

1. **Org switcher dropdown** — replace the static `team-switcher.tsx`
   placeholder: fetch memberships (via new endpoint from 16.10 or a
   placeholder empty-state until then), persist active org id in
   localStorage, render current org name/plan. Keep the existing
   SidebarMenuButton layout.
2. **Role-aware nav items** — `app-sidebar.tsx` already gates `adminNavItems`
   behind `useAdminStatus()`; extend so USER sees no admin links anywhere and
   future items (e.g. editor-only links) follow the same permission check
   pattern. Never rely on client-side hiding alone — routes keep server-side
   checks.
3. **Account menu** — extend `nav-user.tsx` dropdown with session info
   (name/email/avatar already present): add role badge, active org, links to
   Settings/API keys, and sign-out (exists) — plus "switch account context"
   entry point once orgs land.

Acceptance: USER-role demo login shows zero admin surfaces; switching org
updates visible context; sign-out returns to `/login?callbackURL=…`.
