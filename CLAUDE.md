# CLAUDE.md — Next.js Starter Kit

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

0. `project.yaml` — project identity and orchestra profile
1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture.md` — system structure, boundaries, storage, and invariants
3. `context/ui-context.md` — theme, colors, typography, component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps
7. `context/specs/` — optional unit specs (one file per feature); see `specs/README.md`

Update `context/progress-tracker.md` after each meaningful implementation change.
Update `project.yaml` lifecycle stage and version when the project advances through SDLC phases.

If implementation changes architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## Project Overview

**Name:** nextjs-starter-kit
**Stack:** Next.js 16 (App Router), Prisma 7, PostgreSQL, Better Auth, Hono, TypeScript, React 19
**UI:** Tailwind CSS v4, shadcn/ui, Radix UI
**State:** TanStack Query, React Hook Form + Zod
**Email:** Nodemailer + Resend (configurable via `EMAIL_PROVIDER` env)
**Upload:** Cloudinary + R2 + S3 + Local (configurable via `UPLOAD_PROVIDER` env)
**Testing:** Playwright

## Architecture

- **App Router** (`app/`) — file-based routing, server-first
- **Hono RPC** (`app/api/[[...route]]/`) — type-safe API layer
- **Feature-sliced** (`features/`) — domain modules with api/, components/, hooks/, types/
- **Centralized config** (`lib/site.ts`) — site metadata, OG, Twitter, JSON-LD
- **Auth** (`lib/auth.ts`) — Better Auth with admin plugin, email OTP
- **Database** (`prisma/schema.prisma`) — User, Session, Account, Verification, Organization, Member, Invitation, Post, Category, Tag, PostTag, SystemMetric, Notification, AuditLog, RateLimit, UserPreferences, ApiKey, Webhook, WebhookDelivery, FileUpload

## Key Patterns

1. **Server Components by default** — `"use client"` only for interactivity
2. **Hono RPC client** — `hc<AppType>("")` for type-safe API calls
3. **Zod validation** — on every API endpoint and form
4. **TanStack Query** — server state with caching/invalidation
5. **Server Actions** — mutations with Zod + revalidatePath
6. **Feature-sliced design** — `features/<feature>/` with internal structure
7. **Provider abstraction** — email and upload services use abstraction layer with env-configurable providers

## Service Providers

### Email (via `lib/services/email.ts`)

| Provider | Package | Env Var | Best For |
|----------|---------|---------|----------|
| Nodemailer | `nodemailer` | `EMAIL_PROVIDER="nodemailer"` | Self-hosted SMTP, Gmail, custom mail servers |
| Resend | `resend` | `EMAIL_PROVIDER="resend"` | Modern email API, React Email, tracking |

**Resend Rules:**
- Import `Resend` from `resend` package
- Use `{ data, error }` pattern — never try/catch for SDK errors
- Use camelCase params (`replyTo`, `scheduledAt`)
- Add idempotency keys to prevent duplicates
- Test addresses: `delivered@resend.dev`, `bounced@resend.dev`

### Upload (via `lib/services/upload.ts`)

| Provider | Package | Env Var | Best For |
|----------|---------|---------|----------|
| Cloudinary | `next-cloudinary` | `UPLOAD_PROVIDER="cloudinary"` | Image/video transformations, CDN, auto-optimization |
| R2 (Cloudflare) | `@aws-sdk/client-s3` | `UPLOAD_PROVIDER="r2"` | No egress fees, S3-compatible, public assets |
| S3 (AWS) | `@aws-sdk/client-s3` | `UPLOAD_PROVIDER="s3"` | Enterprise storage, signed URLs |
| Local | `fs/promises` | `UPLOAD_PROVIDER="local"` | Development, simple deployments |

**Cloudinary Rules:**
- Use `next-cloudinary` package for Next.js integration
- `CldImage` for rendering with transformations
- `CldUploadWidget` / `CldUploadButton` for uploads
- Auto-optimizes: `f_auto`, `q_auto`, `c_limit`

**R2/S3 Rules:**
- Use `@aws-sdk/client-s3` for both (R2 is S3-compatible)
- Use `@aws-sdk/s3-request-presigner` for signed URLs
- R2 region: `auto` (Cloudflare default)

## Agent System

Full agent definitions in [AGENTS.md](./AGENTS.md). Key agents:

| Agent | Responsibility |
|-------|----------------|
| nextjs-agent | App development, routing, metadata |
| prisma-agent | Schema, migrations, queries |
| auth-agent | Better Auth, sessions, RBAC |
| api-agent | Hono routes, RPC, validation |
| ui-agent | shadcn/ui, Tailwind, responsive |
| form-agent | RHF, Zod schemas |
| test-agent | Playwright E2E, unit tests |
| whitehat-agent | Defensive security review |
| blackhat-agent | Offensive penetration testing |
| grayhat-agent | Logic flaws, edge cases |
| data-scientist-agent | ML, statistical analysis, predictive models |
| data-analyst-agent | Dashboards, BI, data visualization |
| email-agent | Email sending, Nodemailer + Resend abstraction |
| upload-agent | File uploads, Cloudinary + R2 + S3 + Local |
| search-agent | Full-text search, debouncing, result ranking |
| table-agent | Data tables, sorting, filtering, pagination |
| export-agent | CSV/JSON exports, streaming, formatting |
| webhook-agent | Webhook delivery, retry logic, HMAC signatures |
| api-key-agent | API key management, permissions, rate limiting |
| content-agent | CMS, SEO, i18n, metadata |

## Security

- All inputs validated with Zod (client + server)
- Session checks on protected routes
- Rate limiting on auth endpoints
- Audit logging for all mutations
- See [docs/SECURITY-AGENTS.md](./docs/SECURITY-AGENTS.md) for full security testing approach

## Quick Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # ESLint check
bunx prisma generate  # Regenerate Prisma client
bunx prisma migrate dev  # Apply migrations
bun run db:test      # Test database connection
bun run db:studio    # Open Prisma Studio
```

## Rules

1. Read `node_modules/next/dist/docs/` for version-specific APIs
2. Read existing files before modifying — follow conventions
3. No `any` types — use Zod for runtime validation
4. No secrets in code — use environment variables
5. Server Components default — `"use client"` only when needed
6. Import metadata from `lib/site.ts` — never hardcode
7. Use service abstractions for email and upload — never call providers directly
8. Configure providers via env vars (`EMAIL_PROVIDER`, `UPLOAD_PROVIDER`)
