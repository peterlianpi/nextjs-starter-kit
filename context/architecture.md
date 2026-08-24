# Architecture — Next.js Starter Kit

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| Framework | Next.js 16 (App Router, React 19) | Routing, RSC, server components |
| UI | Tailwind CSS v4 + shadcn/ui | Styling and accessible primitives |
| Auth | Better Auth (`lib/auth.ts` / `lib/auth-client.ts`) | Sessions, email/password, RBAC |
| Database | PostgreSQL + Prisma 7 (`provider = "prisma-client"`, `@prisma/adapter-pg`) | Persistence, migrations |
| API | Hono 4 (`app/api/[[...route]]/route.ts`) | Type-safe REST + RPC client |
| Forms | React Hook Form + Zod (`@hookform/resolvers/zod`) | Client/server validation |
| Email | Nodemailer or Resend (`EMAIL_PROVIDER`) | Transactional email |
| Uploads | Cloudinary / R2 / S3 / local (`UPLOAD_PROVIDER`) | File storage |
| Runtime | Node (Bun) | Dev + build, Vercel-ready |

## Deployment (decided 2026-08-24)

- Target platform: **Vercel** (zero-config Next.js deploy; no `vercel.json` needed today).
- Email provider: **Resend** (`EMAIL_PROVIDER="resend"`).
- Upload provider: **AWS S3** (`UPLOAD_PROVIDER="s3"`); local storage is dev-only.
- Database: managed Postgres over standard TCP URL (Neon recommended). See `docs/DEPLOYMENT.md`.

## System Boundaries

- `app/` — Next.js App Router pages and route groups. `(protected)/` requires a session.
- `app/api/[[...route]]/` — all Hono API endpoints mount here. No ad-hoc route handlers.
- `features/<feature>/` — feature modules: `components/`, `hooks/`, `lib/`, `schemas/`, `types/`, `api/`.
- `components/ui/` — shadcn/ui primitives. **Do not modify**.
- `lib/` — `site.ts` (config), `auth.ts` (server), `auth/access.ts`, `auth/admin.ts`, `auth/api-helpers.ts` (auth/RBAC helpers), `prisma.ts` (singleton), `api/`, `services/` (incl. `activity.ts` audit/activity logging), `utils/`.
- `prisma/` — `schema.prisma` (single source of truth), `seed.ts`, migrations.
- `action/` — Server Actions for mutations.
- `providers/` — React providers (theme via next-themes).

## Storage Model

- **Database (PostgreSQL)**: users, sessions, accounts, verifications, organizations/members/invitations, blog content (posts, categories, tags), system metrics, notifications, audit logs, rate limits, preferences, API keys, webhooks, deliveries, file uploads metadata. Blog content is DB-stored (not files). See `prisma/schema.prisma`.
- **File/blob storage**: uploaded files (Cloudinary / R2 / S3 / local via `UPLOAD_PROVIDER`). Only metadata + URL stored in DB.
- **No cache layer in scope yet** — in-memory/page cache via Next.js.

## Auth and Access Model

- Every request to `(protected)/` routes validates the session server-side.
- Roles: USER, VIEWER, EDITOR, MODERATOR, ADMIN, SUPER_ADMIN (enforced via Better Auth `admin` plugin).
- Mutations via Hono endpoints validate input with `@hono/zod-validator` and check auth/ownership before acting.
- Admin APIs verify role before returning data — never rely on client-side checks alone.

## Invariants

Rules that must not be broken without updating this file:

1. **Server-first** — default to Server Components; `"use client"` only for interactivity.
2. **Auth at every mutation boundary** — server-side session check before any protected operation.
3. **Validate all input** — every Hono endpoint uses `@hono/zod-validator`; response shape `{ success, data?, error? }`.
4. **Single Prisma client** — use `lib/prisma.ts` singleton with driver adapter; never instantiate `PrismaClient` directly.
5. **Centralized config** — import site metadata from `lib/site.ts`; never hardcode in layouts.
6. **Do not modify `components/ui/`** — shadcn primitives are treated as generated.
7. **Prisma 7 conventions** — `provider = "prisma-client"`, import from `./generated/prisma/client` (with `/client`).
8. **No secrets in git** — `.env` is gitignored; `.env.example` is the only template.

## Data model (summary)

Core models: `User` (role, ban, soft delete), `Session`, `Account`, `Verification`, `Organization`, `Member`, `Invitation`, `Post`, `Category`, `Tag`, `PostTag`, `SystemMetric`, `Notification`, `AuditLog`, `RateLimit`, `UserPreferences`, `ApiKey`, `Webhook`, `WebhookDelivery`, `FileUpload`. Full definition in `prisma/schema.prisma`; generated client at `lib/generated/prisma`.