# Deployment — Vercel (Resend + S3)

Chosen deployment target: **Vercel**. Primary providers: **Resend** (email) and **AWS S3** (uploads). Vercel deploys Next.js with zero config — no `vercel.json` is required.

## 1. Vercel Project Setup

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected). Build command `bun run build` / `next build`, output: default.
3. Add all environment variables below in **Project → Settings → Environment Variables** for Production (+ Preview as needed).
4. Deploy. Set the production domain once assigned — it feeds the URL vars below.

> Note: `postinstall` runs Prisma generate, so the generated client (`lib/generated/prisma`) is built on Vercel automatically.

## 2. Required Environment Variables

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgres://user:pass@host:5432/db` | Standard TCP URL — never `prisma+postgres://` |
| `BETTER_AUTH_URL` | `https://yourdomain.com` | Production URL |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com` | |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` | Fallback used by `lib/utils/domain.ts` |
| `NEXT_PUBLIC_APP_NAME` | `Next.js Starter Kit` | |
| `NEXT_BETTER_APP_URL` | `https://yourdomain.com` | Better Auth client base URL |
| `BETTER_AUTH_SECRET` | (random ≥32 chars) | Rotate per environment |
| `BETTER_AUTH_API_KEY` | (random) | |
| `EMAIL_PROVIDER` | `resend` | Chosen provider |
| `RESEND_API_KEY` | `re_...` | From Resend dashboard |
| `RESEND_FROM_EMAIL` | `noreply@yourdomain.com` | Must be on a verified domain |
| `RESEND_FROM_NAME` | `Next.js Starter Kit` | |
| `UPLOAD_PROVIDER` | `s3` | Chosen provider |
| `S3_REGION` | `us-east-1` | Match your bucket region |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | IAM keys | Scoped to the bucket (see §5) |
| `S3_BUCKET_NAME` | `your-bucket-name` | |
| `S3_ENDPOINT` | `https://s3.us-east-1.amazonaws.com` | Regional endpoint |
| `S3_PUBLIC_DOMAIN` | `https://your-bucket.s3.us-east-1.amazonaws.com` | Or CDN domain |
| `ENABLE_CRON_SECRET_CHECK` | `false` | Only if cron endpoints are added later |
| `CRON_SECRET` | (random) | Only if cron endpoints are added later |
| `CLEANUP_SOFT_DELETE_DAYS` | `30` | Used by cleanup job when present |

## 3. PostgreSQL

Any managed Postgres reachable over standard TCP works:

- **Neon** — serverless, branchable; connection string is already a standard TCP URL. Recommended.
- **Vercel Postgres** — also fine; copy its pooled `DATABASE_URL`.
- Supabase / RDS — use the **direct/pooled TCP** connection string (not the Prisma Accelerate `prisma+postgres://` scheme).

Run migrations from your machine or CI against the production database before/with first deploy:

```bash
DATABASE_URL="postgres://..." bunx prisma migrate deploy
```

## 4. Resend Setup

1. Create an API key at resend.com/api-keys → set `RESEND_API_KEY`.
2. **Verify your sending domain** (Resend → Domains): add the DKIM/SPF DNS records Resend provides, then wait for verification.
3. Set `RESEND_FROM_EMAIL` to an address on that verified domain (e.g. `noreply@yourdomain.com`). The `onboarding@resend.dev` sandbox address works only for testing.
4. Test addresses for smoke checks: `delivered@resend.dev`, `bounced@resend.dev`.

## 5. S3 Setup

1. Create a bucket in your chosen region; note `S3_BUCKET_NAME` + `S3_REGION`.
2. Public reads: either enable public read on objects (bucket policy) and use the bucket URL as `S3_PUBLIC_DOMAIN`, or put CloudFront in front and use its domain.
3. Create an IAM user/role with least-privilege access:

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::your-bucket-name/*"
}
```

4. Set the generated keys as `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`. Presigned URLs are issued via `@aws-sdk/s3-request-presigner` using these credentials — no extra config needed.

> Local storage (`UPLOAD_PROVIDER="local"`) does not work on Vercel — the filesystem is ephemeral.

## 6. Cron Jobs

The appointment-feature removal deleted all endpoints under `app/api/[[...route]]/cron/`; **no cron endpoints currently exist**, so no `vercel.json` cron config is needed today. If scheduled jobs are reintroduced under `/api`:

1. Protect them with `CRON_SECRET` (set `ENABLE_CRON_SECRET_CHECK=true`) and verify the `Authorization: Bearer <CRON_SECRET>` header server-side.
2. Add a `crons` array to a new `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }] }
```

## 7. Pre-Deploy Checklist

- [ ] All env vars from §2 added on Vercel
- [ ] `bunx prisma migrate deploy` run against production DB
- [ ] Resend domain verified, from-address set
- [ ] S3 bucket + IAM policy live, upload smoke-tested
- [ ] `bun run lint` and `bun run build` green
- [ ] Auth login/signup verified on the production domain
