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

---

## P-Core Orchestra Loop

This project uses P-Core Orchestra (global, installed at `~/.config/opencode/`). Implementation/fix/build/refactor prompts auto-run the loop — no command needed.

| Phase | Agent | Role |
|-------|-------|------|
| 1 | `orchestra-planner` | Plan only (read-only) → short implementation plan |
| 2 | `orchestra-implementer` | Implement + commit before done |
| 3 | `orchestra-verifier` | Tests / lint; VERIFY_FAIL if dirty tree |
| 4 | `orchestra-reviewer` | Read-only final gate |

**Commands**

```powershell
node $env:USERPROFILE\.cursor\hooks\orchestra-enable.js status   # loop state
node $env:USERPROFILE\.cursor\hooks\orchestra-enable.js tokens   # token usage
node $env:USERPROFILE\.cursor\hooks\orchestra-enable.js stop     # stop loop
```

- Opt out per prompt: `no orchestra`
- Disable ambient: `disable orchestra` / `node ...\orchestra-enable.js ambient-off`
- Every phase transition is recorded in `~/.config/opencode/hooks/state/orchestra.json`
- After `ORCHESTRA_COMPLETE` the parent summarizes and runs `stop`

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent System — Next.js Starter Kit

## 1. Core Development Agents

### nextjs-agent
**Responsibility:** Next.js app development, routing, server/client components, metadata, middleware
**Scope:** `app/`, `lib/site.ts`, `next.config.ts`, `proxy.ts`
**Rules:**
1. Read `node_modules/next/dist/docs/` for version-specific APIs before writing
2. App Router only — no Pages Router patterns
3. Server-first: default to Server Components; `"use client"` only for interactivity
4. Import metadata from `lib/site.ts` — never hardcode site config in layouts
5. Use `next/headers` (headers, cookies) only in Server Components/Route Handlers
6. Layout chain awareness: understand parent `layout.tsx` before adding routes

### prisma-agent
**Responsibility:** Database schema design, migrations, queries, seeding
**Scope:** `prisma/`, `lib/prisma.ts`, `lib/generated/`
**Rules:**
1. `prisma/schema.prisma` is the single source of truth
2. Always run `bunx prisma migrate dev` after schema changes
3. Use `lib/prisma.ts` singleton — never instantiate `PrismaClient` directly
4. Generated client outputs to `lib/generated/prisma`
5. Keep `prisma/seed.ts` updated for new models
6. Core models to preserve: `User`, `Session`, `Account`, `Verification`, `Organization`, `Member`, `Invitation`, `Post`, `Category`, `Tag`, `PostTag`, `SystemMetric`, `Notification`, `AuditLog`, `RateLimit`, `UserPreferences`, `ApiKey`, `Webhook`, `WebhookDelivery`, `FileUpload`
7. Use `provider = "prisma-client"` (not `prisma-client-js`)
8. Import from `./generated/prisma/client` (with `/client`)
9. Use `@prisma/adapter-pg` driver adapter with `adapter` property
10. Wrap all database calls in try-catch blocks
11. No `url` in datasource block — configured in `prisma.config.ts`
12. Use standard TCP URLs (`postgres://...`) — never `prisma+postgres://`

### auth-agent
**Responsibility:** Authentication flows, Better Auth config, session management, RBAC
**Scope:** `lib/auth.ts`, `lib/auth-client.ts`, `lib/auth/`, `app/api/auth/`, `app/login/`, `app/signup/`, `app/forgot-password/`, `app/reset-password/`, `app/verify-email/`
**Rules:**
1. Server config in `lib/auth.ts`, client in `lib/auth-client.ts`
2. Protected routes use `(protected)/` route group with server-side session check
3. Session validation server-side before any sensitive operation
4. Better Auth plugins: `admin` (USER/ADMIN roles), `emailOTP` (verification)
5. Email templates in `features/mail/lib/templates.ts`
6. Rate limiting configured in Better Auth server config

### api-agent
**Responsibility:** Hono API routes, RPC client, validation, error handling
**Scope:** `app/api/[[...route]]/`, `lib/api/hono-client.ts`
**Rules:**
1. All API routes mount via catch-all `app/api/[[...route]]/route.ts`
2. Use `@hono/zod-validator` for input validation on every endpoint
3. Export `AppType` from route.ts for Hono RPC type inference
4. Client uses `hc<AppType>("")` — no manual fetch code
5. Consistent response shape: `{ success: boolean, data?: T, error?: { code, message } }`
6. Health check endpoint at `/api/health` for monitoring

### ui-agent
**Responsibility:** Component development, Tailwind CSS, shadcn/ui, responsive design
**Scope:** `components/`, `components/ui/`, `features/*/components/`
**Rules:**
1. shadcn/ui primitives in `components/ui/` — do not modify
2. Feature-specific UI in `features/<feature>/components/`
3. All interactive elements: keyboard accessible + screen reader friendly
4. Mobile-first responsive with Tailwind breakpoints
5. Use `cn()` from `lib/utils.ts` for conditional class merging
6. Dark mode via `next-themes` — test both themes

### form-agent
**Responsibility:** React Hook Form integration, Zod schemas, validation patterns
**Scope:** `features/form/`, `features/*/schemas/`, form components across features
**Rules:**
1. Zod schemas in `features/<feature>/schemas/` or co-located
2. Use `@hookform/resolvers/zod` for resolver
3. Reusable `FormField` component from `features/form/components/form-field.tsx`
4. Server Actions for mutations with Zod validation
5. Client-side validation + server-side re-validation (defense in depth)

## 2. Infrastructure Agents

### test-agent
**Responsibility:** Unit tests, integration tests, E2E tests with Playwright
**Scope:** `tests/`, `playwright.config.ts`, `*.test.ts`, `*.spec.ts`
**Rules:**
1. E2E tests with Playwright in `tests/e2e/`
2. Test auth flows, protected routes, admin access
3. Mock external services (email, database) for unit tests
4. Run `bun run build` before E2E tests
5. Test both light and dark themes

### deploy-agent
**Responsibility:** Deployment config, environment variables, CI/CD, Vercel
**Scope:** `.env.example`, `next.config.ts`, CI configs
**Rules:**
1. `.env` never committed — use `.env.example` as template
2. `NEXT_PUBLIC_` prefix for client-exposed vars only
3. Validate env at startup — fail fast on missing required vars
4. Database migrations run before deployment completes
5. Email provider configured via `EMAIL_PROVIDER` env (`nodemailer` | `resend`)
6. Upload provider configured via `UPLOAD_PROVIDER` env (`cloudinary` | `r2` | `s3` | `local`)
7. All provider credentials stored as env vars — never hardcoded

### perf-agent
**Responsibility:** Performance optimization, caching, bundle analysis, image optimization
**Scope:** All files — focuses on performance aspects
**Rules:**
1. Server Components for data fetching (no client bundle bloat)
2. Use `revalidatePath` / `revalidateTag` for cache invalidation
3. Dynamic imports for heavy client components
4. Monitor bundle size — alert on significant increases
5. Database query optimization: proper indexes, avoid N+1

## 3. Security Agents (Hat-Based)

### whitehat-agent
**Responsibility:** Defensive security, vulnerability scanning, secure code review, compliance
**Scope:** Entire codebase
**Rules:**
1. Scan for: SQL injection, XSS, CSRF, SSRF, IDOR, authentication bypass
2. Verify all inputs validated with Zod on both client and server
3. Check auth guards on every protected route and API endpoint
4. Review secrets handling — no hardcoded credentials
5. Verify CORS, CSP, and security headers
6. Audit dependencies for known vulnerabilities
7. Check rate limiting on auth endpoints
8. Verify session security (secure cookies, httpOnly, sameSite)
9. Review file upload handling (if any) for type/size restrictions
10. Ensure audit logging captures security-relevant events

### blackhat-agent
**Responsibility:** Offensive security testing, penetration testing, attack simulation
**Scope:** Entire codebase — simulates attacker perspective
**Rules:**
1. Test authentication bypass: tampered cookies, expired tokens, missing sessions
2. Attempt IDOR: access other users' data by manipulating IDs
3. Test SQL injection via Hono API inputs
4. Attempt XSS through form inputs, URL parameters, user-generated content
5. Test privilege escalation: USER → ADMIN via API manipulation
6. Attempt CSRF on state-changing operations
7. Test rate limit bypass on auth endpoints
8. Attempt path traversal in file operations
9. Test session fixation and session hijacking scenarios
10. Simulate brute force attacks on login/password reset
11. Test Open Redirect vulnerabilities
12. Attempt mass assignment on API endpoints

### grayhat-agent
**Responsibility:** Balanced security testing, edge cases, business logic vulnerabilities, configuration review
**Scope:** Entire codebase — focuses on logic flaws and misconfigurations
**Rules:**
1. Test business logic: can users bypass workflow steps?
2. Check for information leakage in error messages
3. Verify email verification flow cannot be bypassed
4. Test password reset token reuse and expiration
5. Review admin panel access controls — can non-admins reach admin APIs?
6. Check for timing attacks on authentication
7. Test concurrent session handling
8. Verify audit logs cannot be tampered with or deleted by non-admins
9. Check notification system for information disclosure
10. Test edge cases in form validation (empty strings, unicode, long inputs)
11. Review environment variable exposure in client bundle
12. Check for debug/error pages leaking stack traces in production

## 4. Data & Analytics Agents

### data-scientist-agent
**Responsibility:** Data modeling, statistical analysis, machine learning pipelines, predictive analytics
**Scope:** `lib/services/`, `lib/analytics/`, data export endpoints, audit log analysis, user behavior tracking
**Rules:**
1. Use Prisma for data extraction — never raw SQL unless performance requires it
2. All data exports use streaming for large datasets (no memory overload)
3. Statistical analysis uses proper sampling methods
4. Model training data is anonymized (no PII in ML datasets)
5. Predictive models include confidence intervals
6. Data pipelines are idempotent — safe to re-run
7. Feature engineering documented with rationale
8. A/B test results use proper statistical significance testing (p < 0.05)
9. Time-series data respects timezone (`UserPreferences.timezone`)
10. Data quality checks: null rates, outliers, distribution shifts

**Key Use Cases:**
- User engagement analysis (login frequency, feature usage)
- Content performance prediction (which articles will trend)
- Anomaly detection in audit logs (suspicious activity patterns)
- User segmentation (behavior-based clustering)
- Churn prediction (users likely to stop engaging)
- Traffic pattern analysis (peak hours, seasonal trends)

### data-analyst-agent
**Responsibility:** Business intelligence, dashboards, reporting, data visualization, KPI tracking
**Scope:** Dashboard components, admin stats, reporting endpoints, chart components, CSV/JSON exports
**Rules:**
1. All charts use `recharts` library (already in dependencies)
2. Dashboard queries are optimized — use Prisma `select` to limit fields
3. Date ranges respect user timezone preferences
4. Export formats: CSV, JSON, PDF (via server-side generation)
5. KPIs calculated consistently — single source of truth per metric
6. Reports include: total count, period-over-period change, trend direction
7. Pagination on all data tables (never load all rows at once)
8. Null values handled explicitly — show "N/A" not blank
9. Numbers formatted with proper locale (e.g., `en-US`, `en-GB`)
10. Dashboard data cached with `revalidateTag` — invalidate on data changes

**Key Use Cases:**
- Admin dashboard: user growth, activity metrics, system health
- Content analytics: page views, engagement rates, popular articles
- User analytics: registration trends, verification rates, role distribution
- Audit analytics: action frequency, error rates, security events
- Email analytics: delivery rates, open rates, bounce rates
- Performance metrics: API response times, error rates, uptime

**Dashboard Components Pattern:**
```
features/analytics/
├── components/
│   ├── stats-card.tsx        # Reusable metric card
│   ├── trend-chart.tsx       # Line/area chart with trend
│   ├── bar-chart.tsx         # Categorical comparison
│   ├── pie-chart.tsx         # Distribution visualization
│   └── data-table.tsx        # Paginated sortable table
├── hooks/
│   ├── use-dashboard-data.ts # Dashboard data fetching
│   └── use-export-data.ts    # Export functionality
└── lib/
    ├── metrics.ts            # KPI calculation functions
    └── formatters.ts         # Number/date formatting
```

## 5. Feature Agents

### email-agent
**Responsibility:** Email sending, templates, provider abstraction (Nodemailer + Resend)
**Scope:** `lib/services/email*.ts`, `action/mail.ts`, `features/mail/`
**Rules:**
1. Use `lib/services/email.ts` abstraction — never call providers directly
2. Configure provider via `EMAIL_PROVIDER` env: `"nodemailer"` | `"resend"`
3. **Nodemailer**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD env vars
4. **Resend**: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_FROM_NAME env vars
5. Always use `{ data, error }` pattern for Resend — never try/catch for SDK errors
6. Use idempotency keys for Resend to prevent duplicate emails
7. Store API keys in environment variables — never hardcode
8. Use camelCase parameters for Resend (`replyTo`, `scheduledAt`)
9. Test addresses: `delivered@resend.dev`, `bounced@resend.dev`
10. Rate limit: 5 req/s per team for Resend

### upload-agent
**Responsibility:** File upload handling, storage management, validation, multi-provider support
**Scope:** `features/upload/`, `lib/services/upload*.ts`, upload API routes
**Rules:**
1. Use `lib/services/upload.ts` abstraction — supports Cloudinary, R2, S3, local
2. Configure provider via `UPLOAD_PROVIDER` env: `"cloudinary"` | `"r2"` | `"s3"` | `"local"`
3. Validate file type and size before upload using `lib/services/file-upload.ts`
4. Generate unique filenames (UUID) to prevent collisions
5. Track uploads in `FileUpload` model with metadata
6. Support progress tracking for large files

**Cloudinary:**
- Use `next-cloudinary` package for Next.js integration
- `CldImage` for image rendering with transformations
- `CldUploadWidget` or `CldUploadButton` for uploads
- Env: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Auto-optimizes images: `f_auto`, `q_auto`, `c_limit`

**R2 (Cloudflare):**
- Uses AWS SDK with S3-compatible API
- Env: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN`
- Region: `auto` (Cloudflare default)
- No egress fees — ideal for public assets

**S3 (AWS):**
- Uses AWS SDK v3 (`@aws-sdk/client-s3`)
- Env: `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_PUBLIC_DOMAIN`
- Supports signed URLs for private content
- Use `@aws-sdk/s3-request-presigner` for presigned URLs

### search-agent
**Responsibility:** Search functionality, full-text search, result ranking, debouncing
**Scope:** `features/search/`, `lib/services/search.ts`, `/api/search`
**Rules:**
1. Use PostgreSQL full-text search via Prisma
2. Debounce search queries (300ms minimum)
3. Return paginated results with total count
4. Support entity type filtering
5. Highlight matching text in results
6. Cache frequent searches

### table-agent
**Responsibility:** Data table components, sorting, filtering, pagination
**Scope:** `features/table/`, `features/pagination/`
**Rules:**
1. Use `DataTable` component from `features/table/components/data-table.tsx`
2. Server-side sorting and filtering for large datasets
3. Client-side for small datasets (< 100 rows)
4. Loading states with skeleton placeholders
5. Empty states with helpful messages
6. Export integration with `features/export/`

### export-agent
**Responsibility:** Data export utilities, CSV/JSON generation, file downloads
**Scope:** `features/export/`, export API routes
**Rules:**
1. Use `exportToCSV` and `exportToJSON` from `features/export/lib/export-utils.ts`
2. Stream large exports (never load all data into memory)
3. Proper CSV escaping for special characters
4. Include headers in all exports
5. Support date range filtering for exports
6. Log export actions to audit log

### webhook-agent
**Responsibility:** Webhook system, event delivery, retry logic, signature verification
**Scope:** `app/api/webhooks/`, webhook models, delivery tracking
**Rules:**
1. HMAC signature verification for all incoming webhooks
2. Retry with exponential backoff (max 3 attempts)
3. Track delivery status in `WebhookDelivery` model
4. Support multiple event types per webhook
5. Idempotent delivery handling
6. Admin dashboard for webhook monitoring

### api-key-agent
**Responsibility:** API key management, permissions, rate limiting, usage tracking
**Scope:** `app/api/keys/`, ApiKey model, key validation middleware
**Rules:**
1. Store hashed keys only (never plaintext)
2. Show key prefix for identification (e.g., `sk_live_abc12...`)
3. Support granular permissions via JSON field
4. Track last used timestamp for analytics
5. Support key expiration and revocation
6. Rate limit per API key

## 6. Domain-Specific Agents

### content-agent
**Responsibility:** Content management features, CMS integration, SEO, metadata, i18n
**Scope:** Content-related features, `lib/site.ts`, metadata, SEO
**Rules:**
1. Centralize site config in `lib/site.ts`
2. Per-page metadata overrides via `generateMetadata`
3. JSON-LD structured data for rich results
4. Open Graph + Twitter Card on every page
5. i18n support for multiple languages
6. Breadcrumb navigation on content pages
7. Sitemap generation for SEO
8. Canonical URLs on all pages

## 7. Agent Coordination Rules

1. **No agent works in isolation** — coordinate changes that span multiple domains
2. **Security agents run on every PR** — whitehat review before merge
3. **prisma-agent coordinates with auth-agent** — schema changes affect auth
4. **api-agent coordinates with form-agent** — API validation matches form schemas
5. **ui-agent coordinates with perf-agent** — component choices affect bundle size
6. **content-agent coordinates with data-analyst-agent** — content performance informs strategy
7. **blackhat-agent findings go to whitehat-agent** for remediation
8. **grayhat-agent findings go to relevant domain agent** for fixes
9. **data-scientist-agent provides models to data-analyst-agent** for visualization
10. **data-analyst-agent dashboards inform content-agent** on content performance
11. **perf-agent optimizes data queries** from data-scientist-agent and data-analyst-agent
12. **whitehat-agent reviews data exports** for PII leakage before release
13. **upload-agent coordinates with api-key-agent** — API keys for upload access
14. **webhook-agent coordinates with audit-log** — all webhook events logged
15. **search-agent coordinates with table-agent** — search results in data tables
16. **export-agent coordinates with data-analyst-agent** — export dashboard data
17. **email-agent coordinates with auth-agent** — verification and password reset emails
18. **deploy-agent coordinates with email-agent** — provider credentials as env vars
19. **upload-agent coordinates with content-agent** — media library integration
20. **email-agent uses Resend rules** — `{ data, error }` pattern, camelCase params, idempotency keys

## 8. Service Provider Skills

### Email Provider Rules (Resend)
- Import `Resend` from `resend` — never `@resend/node`
- Store API key in `RESEND_API_KEY` env var — never hardcode
- Use `await resend.emails.send()` — always async/await
- Handle `{ data, error }` response — never try/catch for SDK errors
- Use camelCase params: `replyTo`, `scheduledAt` — never snake_case
- Use verified domain in `from` address for production
- Add idempotency keys to prevent duplicate emails
- Test addresses: `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`, `suppressed@resend.dev`
- Do not send `html`, `text`, or `react` alongside `template`
- Rate limit: 5 requests/second per team

### Prisma v7 Rules
- Use `provider = "prisma-client"` — never `prisma-client-js`
- Import from `./generated/prisma/client` — must include `/client`
- Use `@prisma/adapter-pg` driver adapter
- No `url` in datasource block — use `prisma.config.ts`
- No `engine` property in `prisma.config.ts`
- Use standard TCP URLs (`postgres://...`) — never `prisma+postgres://`
- Wrap all database calls in try-catch blocks
- Use global singleton from `lib/prisma.ts`

### Upload Provider Rules
- Use `lib/services/upload.ts` abstraction — never call providers directly
- Configure via `UPLOAD_PROVIDER` env var
- Validate file type and size before upload
- Generate unique filenames (UUID)
- Track uploads in `FileUpload` model
- Cloudinary: use `next-cloudinary` for Next.js integration
- R2/S3: use `@aws-sdk/client-s3` (R2 is S3-compatible)
