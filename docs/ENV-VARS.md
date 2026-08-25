# Environment Variables Reference

Complete, audited list of every `process.env.*` read by the codebase (app/, features/, lib/, scripts/, prisma/, next.config.ts). Generated 2026-08-25.

---

## Why /login fails (diagnosis)

`/login` is a protected-route page that renders a client component calling `authClient`. On the server it imports `lib/auth.ts`, which at module load:

1. Imports `lib/prisma.ts` → constructs `new PrismaPg({ connectionString: process.env.DATABASE_URL })` and `new PrismaClient(...)` **at import time**.
2. Calls `betterAuth({...})` with the prisma adapter **at module load**.

**Top 3 candidate causes of the "server error" on `/login`, ranked:**

1. **`DATABASE_URL` missing or wrong on Vercel** — `lib/prisma.ts` builds the pg adapter from `process.env.DATABASE_URL` at module scope with no fallback and no try/catch. If it is `undefined` or an invalid/non-TCP URL (`prisma+postgres://` will fail), Prisma throws when the first auth query runs (`auth.api.getSession()` inside `(protected)`), surfacing as a generic 500 "server error". This is the most likely cause.
2. **`BETTER_AUTH_SECRET` missing** — Better Auth requires a secret in production; without it the server instance fails to sign sessions/tokens and Better Auth throws during request handling on `/api/auth/*`, which the login page surfaces as a server error.
3. **Base-URL mismatch** — `lib/auth-client.ts` uses `NEXT_BETTER_APP_URL` (no fallback; if unset the client falls back to same-origin, usually fine) while the server uses `BETTER_AUTH_URL`. If either is set to the wrong value (e.g. localhost left over from `.env.example`) on Vercel, auth calls go to the wrong origin and fail. Also verify `NEXT_PUBLIC_SITE_URL` is the production URL since `lib/site.ts` defaults to `http://localhost:3000`.

Note: none of these throw at build time — Next.js prerenders fine and the failure only appears at runtime, matching the observed behavior.

---

## Core / App URLs

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `NEXT_PUBLIC_SITE_URL` | Required (prod) | `https://nextjs-starter-kit-gules.vercel.app` | Your Vercel project URL | Defaults to `http://localhost:3000` (`lib/site.ts`) → broken canonical URLs, OG/Twitter tags, JSON-LD |
| `BETTER_AUTH_URL` | Required (prod) | Same production URL | Your Vercel project URL | Better Auth server base URL wrong → callbacks, verification links point to localhost |
| `NEXT_BETTER_APP_URL` | Required (prod) | Same production URL | Your Vercel project URL | `lib/auth-client.ts` baseURL undefined → client hits wrong origin for auth API |
| `NEXT_PUBLIC_API_URL` | Optional | Production URL | Your Vercel project URL | Fallback only (`lib/utils/domain.ts`); harmless if other URL vars are set |
| `NEXT_PUBLIC_APP_URL` | Optional | Production URL | Your Vercel project URL | Fallback only (`lib/utils/domain.ts`) |
| `NEXT_PUBLIC_BASE_URL` | Optional | Production URL | Your Vercel project URL | Last-resort fallback (`lib/utils/domain.ts`) |
| `NEXT_PUBLIC_APP_NAME` | Optional | `"Next.js Starter Kit"` | — | Falls back to hardcoded name |

## Better Auth

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `BETTER_AUTH_SECRET` | **Required** | Random ≥32-char string: `openssl rand -base64 32` | Generate locally | Auth cannot sign sessions/tokens → 500s on all auth endpoints incl. login |
| `BETTER_AUTH_API_KEY` | Optional (not read anywhere in code today) | API key string | Generate | Nothing currently; reserved |

## Database

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `DATABASE_URL` | **Required** | Standard TCP URL: `postgres://user:pass@host/db?sslmode=require` (never `prisma+postgres://`) | Neon/managed Postgres console | `lib/prisma.ts` constructs the adapter at import time → every DB-touching route 500s, including `/login` session check. Also used by `prisma/seed.ts` and migrations |

## Email — Resend (production provider)

Set `EMAIL_PROVIDER="resend"`.

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `EMAIL_PROVIDER` | Required | `"resend"` or `"nodemailer"` | — | Defaults to `nodemailer` → wrong provider path |
| `RESEND_API_KEY` | Required (if resend) | `re_xxxxxxxx` | resend.com dashboard | Verification/password-reset emails fail to send |
| `RESEND_FROM_EMAIL` | Recommended | `noreply@yourdomain.com` (verified domain) | Resend domains page | Falls back to `onboarding@resend.dev` (sandbox limits) |
| `RESEND_FROM_NAME` | Optional | `"Next.js Starter Kit"` | — | Falls back to app name |

### Email — Nodemailer alternative

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `SMTP_HOST` | Required (if nodemailer) | `smtp.gmail.com` | SMTP provider | Emails fail |
| `SMTP_PORT` | Optional | `587` (STARTTLS) / `465` (SSL) | SMTP provider | Defaults to 587 |
| `SMTP_USER` / `SMTP_PASSWORD` | Required (if nodemailer) | credentials | SMTP provider | Auth fails; note legacy mail lib reads `SMTP_PASS` instead |
| `SMTP_FROM_EMAIL` / `SMTP_FROM_NAME` | Optional | addresses | — | Falls back to `noreply@starterkit.dev`; legacy lib requires `SMTP_FROM` |

## Upload — AWS S3 (production provider)

Set `UPLOAD_PROVIDER="s3"`.

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `UPLOAD_PROVIDER` | Required | `"s3"` \| `"r2"` \| `"cloudinary"` \| `"local"` | — | Defaults to `local` (ephemeral on Vercel → lost uploads) |
| `S3_REGION` | Required | `us-east-1` | AWS console | Client creation fails |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Required | IAM keys | AWS IAM | Uploads fail |
| `S3_BUCKET_NAME` | Required | bucket name | AWS S3 | Uploads fail |
| `S3_ENDPOINT` | Optional | `https://s3.us-east-1.amazonaws.com` | — | AWS default endpoint used |
| `S3_PUBLIC_DOMAIN` | Recommended | public URL of bucket/CDN | — | Stored file URLs may be unusable publicly |

## Upload — R2 alternative

Same semantics as S3 via `upload-r2-s3.ts`: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN`, `R2_REGION` (default `auto`). Each falls back to its S3 twin if unset.

## Upload — Cloudinary alternative

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `CLOUDINARY_CLOUD_NAME` | Required (cloudinary) | cloud name | Cloudinary console | Server uploads fail |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Required | keys | Cloudinary console | Signed uploads fail |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Required for client widgets | cloud name | Cloudinary console | Client upload widget fails |

## Misc

| Var | Required? | Format / example | Where to get it | What breaks if missing |
|-----|-----------|------------------|-----------------|------------------------|
| `UPLOAD_DIR` | Optional (local provider only) | `./public/uploads` | — | Defaults to `./public/uploads` |
| `ENABLE_CRON_SECRET_CHECK` | Optional (currently unreferenced in code) | `true`\|`false` | — | Nothing today; documented in .env.example |
| `CRON_SECRET` | Optional (currently unreferenced in code) | random string | — | Nothing today |
| `CLEANUP_SOFT_DELETE_DAYS` | Optional (currently unreferenced in code) | integer days | — | Nothing today |
| `NODE_ENV` | Set automatically | `production` on Vercel | Vercel manages it | Do not set manually |
| `E2E_BASE_URL` | Optional (Playwright only) | `http://localhost:3000` | — | E2E defaults to localhost |
| `CI` | Optional (CI only) | `1` | CI runner | Playwright retry/reporter behavior |

---

## Copy-paste block for Vercel (Production environment)

```bash
# --- REQUIRED (fixes /login) ---
DATABASE_URL="postgres://USER:PASSWORD@HOST/DB?sslmode=require"
BETTER_AUTH_SECRET="<run: openssl rand -base64 32>"
BETTER_AUTH_URL="https://nextjs-starter-kit-gules.vercel.app"
NEXT_BETTER_APP_URL="https://nextjs-starter-kit-gules.vercel.app"
NEXT_PUBLIC_SITE_URL="https://nextjs-starter-kit-gules.vercel.app"

# --- Provider selection ---
EMAIL_PROVIDER="resend"
UPLOAD_PROVIDER="s3"

# --- Email (Resend) ---
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
RESEND_FROM_NAME="Next.js Starter Kit"

# --- Upload (AWS S3) ---
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
S3_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
S3_BUCKET_NAME="your-bucket-name"
S3_PUBLIC_DOMAIN="https://your-bucket.s3.us-east-1.amazonaws.com"

# --- Optional URL aliases (recommended so domain.ts resolves prod everywhere) ---
NEXT_PUBLIC_APP_URL="https://nextjs-starter-kit-gules.vercel.app"
NEXT_PUBLIC_API_URL="https://nextjs-starter-kit-gules.vercel.app"
NEXT_PUBLIC_BASE_URL="https://nextjs-starter-kit-gules.vercel.app"
```

A mirror of this block lives in `.env.production.template`. After adding vars in Vercel, **redeploy** (Settings → Deployments → Redeploy) so they take effect.
