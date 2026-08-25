# Spec 16 — Frontend Gap Plan

Audit (2026-08-25) of every backend capability against existing frontend
surfaces, and the ordered build units that close the gaps. Evidence sources:
`app/api/[[...route]]/route.ts` + sub-routers, `app/` route tree,
`features/*`, `prisma/schema.prisma`.

Updated 2026-08-25: units **16.1, 16.2, 16.3, 16.4, 16.8 are shipped**;
remaining: 16.5 (audit-log viewer, in progress), 16.6 (API keys page),
16.7 (webhooks admin), 16.9 (settings persistence), 16.10 (orgs e2e).
Post-D roadmap continues in `17-next-gap-plan.md`.

## Gap Matrix

| Area | Backend capability | Existing frontend | Missing frontend |
|------|--------------------|-------------------|------------------|
| Auth | Better Auth: email/password, verification, reset, RBAC, Google OAuth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `(protected)` guard | None — complete |
| Blog ✅ | `posts` router: GET/POST `/api/posts`, GET/PATCH/DELETE `/api/posts/:id` | Admin CRUD pages (`/admin/posts*`), SSR reader at `/blog/[slug]`, public index at `/blog` (Unit 16.1 done) | None |
| Media | `upload` router: POST/GET `/api/upload`, DELETE `/api/upload/:id`; multi-provider storage | `/admin/media` grid with crop pipeline (`features/media/`) | Per-user "my files" surface (optional); none blocking |
| Search ✅ | `search` router: GET `/api/search?q=` (auth required) | `/search` page — debounced input, entity-type filters, grouped results with pagination (Unit 16.4 done) | None |
| Notifications ✅ | `notifications.ts` router mounted in route.ts: list / mark-read / read-all / unread-count | Bell popover + mobile Drawer in sidebar, `/notifications` page with cursor pagination + load-more, mark-read flows (Unit 16.3 done) | None |
| Dead code | `check-role.ts` router — **not mounted** (superseded by `authClient.admin.hasPermission`) | n/a | Delete or mount; document decision (cleanup pass) |
| Admin analytics | GET `/api/admin/stats`, per-user audit-logs/sessions/notifications endpoints | `/admin` overview consumes stats; `/admin/users/[id]` detail page | **Global audit-log viewer** (`/admin/audit-logs`) with filtering — Unit 16.5 |
| API keys | `api-keys` router: POST/GET/PATCH/DELETE `/api/keys` (hashed keys) | None | `/settings/api-keys` management page (create-once reveal, revoke, toggle) — Unit 16.6 |
| Webhooks | `webhooks` router: POST/GET/DELETE `/api/webhooks`, deliveries listing (admin-gated) | None | `/admin/webhooks` page + delivery log drawer — Unit 16.7 |
| Organizations | GET/POST `/api/orgs` live; Member/Invitation endpoints pending | Org switcher + role-aware nav shipped (Unit 16.2 done) | Member management + invitations UI — Unit 16.10 |
| Timeline ✅ | SystemMetric data seeded; audit logs exist | `/admin/activity` page — merged AuditLog+SystemMetric feed via `/api/timeline`, All/Audit/Metrics tabs, Previous/Next pagination (Unit 16.8 done) | None |
| Settings | `UserPreferences` model (timezone etc.); theme presets localStorage-only | Profile, password, sessions UI; notification toggles are **local state only** | Persist prefs (incl. theme preset → `UserPreferences.theme`), timezone picker — Unit 16.9 |
| Monitoring | SystemMetric writes via cron | Metrics surfaced on `/admin/activity` timeline | Charts on admin overview (recharts) — deferred unless needed |

## Build Units (ordered)

| # | Unit | Size | Status / Dependencies |
|---|------|------|----------------------|
| 16.1 | **Blog index** — `/blog` public listing | S | ✅ Complete 2026-08-25 |
| 16.2 | **Role/account switch** — see detailed plan below | M | ✅ Complete 2026-08-25 (org switcher + role-aware nav) |
| 16.3 | **Notifications** | M | ✅ Complete 2026-08-25 |
| 16.4 | **Search surface** | S | ✅ Complete 2026-08-25 |
| 16.5 | **Admin audit-log viewer** — see detailed plan below | M | Planned |
| 16.6 | **API keys settings page** — see detailed plan below | M | Planned |
| 16.7 | **Webhooks admin** — see detailed plan below | M | Planned (after 16.5 for table pattern reuse) |
| 16.8 | **Timeline page** | S | ✅ Complete 2026-08-25 |
| 16.9 | **Settings persistence** — see detailed plan below | M | Planned |
| 16.10 | **Organizations end-to-end** — see detailed plan below | L | Planned — last; depends on 16.2 switcher shell |

Recommended order (remaining): **16.5 → 16.6 → 16.7 → 16.9 → 16.10**
(16.10 last — largest, needs its own spec refinement).

## Completed Unit Summaries

### Unit 16.1 — Blog Index (done)
`app/blog/page.tsx` public listing of published posts with category/tag
metadata; Server Component reading Prisma directly.

### Unit 16.3 — Notifications (done)
Notifications router mounted in catch-all; TanStack Query hooks in
`features/notifications/`; bell popover with unread badge in app sidebar +
mobile Drawer variant; mark-read / read-all mutations; `/notifications` page
with cursor-paginated list and load-more.

### Unit 16.4 — Search Page (done)
`app/(protected)/search/page.tsx` with debounced query state (300ms),
entity-type filter tabs (All/Posts/Users/Audit Logs), grouped results with
pagination against `/api/search`; `lib/services/search.ts` broadened to three
entities; sidebar trigger + nav entry.

### Unit 16.8 — Timeline / Activity Page (done)
`app/api/[[...route]]/timeline.ts` admin-gated merged AuditLog + SystemMetric
feed (filter=all/audit/metric, page pagination, hasMore);
`app/(protected)/admin/activity/page.tsx` mounts `features/timeline`
components with filter tabs, Previous/Next controls, skeleton + empty states;
sidebar "Timeline" entry.

## Unit 16.2 — Role/Account Switch (detailed plan)

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
   Settings/API keys (lands with 16.6), and sign-out (exists) — plus
   "switch account context" entry point once orgs land.

Files touched: `features/nav/components/team-switcher.tsx`,
`nav-user.tsx`, `app-sidebar.tsx`; optional placeholder hook
`features/nav/hooks/use-orgs.ts`. Acceptance: USER-role demo login shows zero
admin surfaces; switching org updates visible context; sign-out returns to
`/login?callbackURL=…`.

## Unit 16.5 — Admin Audit-Log Viewer (detailed plan)

Global audit-log table at `/admin/audit-logs` (admin-gated server check).

- **API**: new sub-router `app/api/[[...route]]/audit-logs.ts` — GET with
  zod-validated query params: `page`, `actorId?`, `action?` (prefix match),
  date range `from?/to?`. Returns `{ success, data: { items, page, hasMore } }`.
  Reuse auth/RBAC helpers from `lib/auth/api-helpers.ts`.
- **Frontend**: `app/(protected)/admin/audit-logs/page.tsx` +
  `features/timeline/` (or new `features/audit/`) table component using the
  DataTable pattern (sorting by createdAt desc, filter selects, Previous/Next).
- **Nav**: sidebar "Audit Logs" entry under admin section.
- Acceptance: non-admin gets 403 from API and no nav entry; filters compose;
  pagination stable across filter changes.

## Unit 16.6 — API Keys Settings Page (detailed plan)

Management UI over the existing hashed-key `api-keys` router at `/settings/api-keys`.

- **Frontend**: `features/api-keys/` module — create form (name + permissions
  checkboxes), **one-time plaintext reveal dialog** (key shown once after
  creation; only prefix stored client-side afterwards), list with prefix
  display (`sk_live_abc12…`), last-used timestamp, enable/disable toggle,
  revoke with confirm.
- **State**: TanStack Query hook; optimistic toggle, invalidate list on mutate.
- **UX details**: copy-to-clipboard button with feedback; empty state linking
  to docs (`/docs/api-reference`); never render full key after initial reveal.
- Files touched: `features/api-keys/{components,hooks}/`, route page, settings
  nav section.
- Acceptance: created key works against a keys-gated endpoint; revoked key
  returns 401; refresh shows only prefixes.

## Unit 16.7 — Webhooks Admin (detailed plan)

`/admin/webhooks` management page over the admin-gated webhooks router.

- **List**: table of webhooks (url, events, enabled, created) with delete
  confirm.
- **Create dialog**: URL input (zod `.url()`), event-type multi-select,
  secret generated server-side and **shown once** in the success step.
- **Deliveries drawer**: per-webhook sheet listing `WebhookDelivery` rows —
  status, response code, attempts, timestamp; manual redeliver button if the
  router supports it, otherwise read-only.
- Files touched: `features/webhooks/{components,hooks,schemas}/`,
  `app/(protected)/admin/webhooks/page.tsx`, deliveries drawer component;
  sidebar "Webhooks" entry.
- Acceptance: creating a webhook persists with hashed secret; deliveries
  drawer reflects real delivery rows; non-admin blocked at API level.

## Unit 16.9 — Settings Persistence (detailed plan)

Persist notification toggles + theme preset (+ timezone picker) to
`UserPreferences`.

- **API**: extend preferences handling — either a small `preferences`
  sub-router (GET/PATCH `/api/preferences`) with zod schema `{ timezone?,
  notificationPrefs?, theme? }`, or Server Action in `action/`. PATCH must
  scope to session user id.
- **Theme preset**: write chosen preset id to `UserPreferences.theme`;
  `features/nav/lib/theme-preset.ts` gains an async hydrate path — server
  layout reads preference, sets `[data-theme]` before paint (no flash);
  localStorage remains the optimistic cache. Unknown values fall back to
  default.
- **Notification toggles**: wire existing local-state toggles in settings to
  PATCH + TanStack Query cache.
- **Timezone**: shadcn combobox over Intl timezone list; stored as IANA string.
- Files touched: `lib/auth.ts` (if Better Auth additional fields used),
  preferences router/action, `features/settings/` components,
  `features/nav/lib/theme-preset.ts`.
- Acceptance: toggles/theme/timezone survive logout + fresh browser;
  invalid values rejected by zod; no theme flash on reload.

## Unit 16.10 — Organizations End-to-End (detailed plan)

Full multi-tenant surface; largest unit — refine into its own mini-spec before
starting.

- **API**: new `orgs` sub-router — POST `/api/orgs` (create, creator becomes
  owner Member), GET list of my memberships, GET `/api/orgs/:id/members`,
  POST invite (email + role, creates Invitation row), DELETE member/invite
  (owner/admin gated). All zod-validated, ownership checked server-side.
- **Switcher**: replace 16.2's placeholder data source with real memberships;
  switching stores active org id (localStorage + cookie if needed server-side).
- **Member management**: `/settings/organizations` page — members table with
  roles, pending invitations list, invite dialog, leave-org action (owner
  blocked while sole owner).
- Files touched: `app/api/[[...route]]/orgs.ts`, `features/orgs/`
  (components/hooks/schemas), `team-switcher.tsx` final wiring,
  `app/(protected)/settings/organizations/page.tsx`.
- Acceptance: two demo users can share an org via invite flow; role changes
  enforced server-side; non-members cannot fetch org members (403).
