# Unit 04: Env Audit

## Goal

Ensure `.env.example` is a complete template of every env var actually read by
the app, so a new developer runs locally from `.env.example` alone (success
criterion #1 in project-overview). Never commit real secrets.

## Method

Grep `process.env.*` across `lib/services/*`, `lib/auth*.ts`, `next.config.ts`,
cron endpoints, and feature modules; diff against `.env.example`; add missing
entries with comments explaining which subsystem consumes them.

## Findings (2026-08-24)

Vars referenced in code but missing from `.env.example`:

| Var | Used by | Added |
|-----|---------|-------|
| `NEXT_PUBLIC_BASE_URL` | `lib/utils/domain.ts` fallback chain | yes |
| `NEXT_PUBLIC_APP_NAME` | `lib/utils/domain.ts` app-name fallback | yes |
| `NEXT_BETTER_APP_URL` | `lib/auth-client.ts` baseURL | yes |
| `SMTP_PASS` | legacy `features/mail/lib/index.ts` SMTP transport | yes (noted alias of `SMTP_PASSWORD`) |
| `SMTP_FROM` | `features/mail/lib/index.ts` sender | yes |
| `CLOUDINARY_CLOUD_NAME` | `lib/services/upload-cloudinary.ts` server config | yes |
| `R2_REGION` / `S3_REGION` | `lib/services/upload-r2-s3.ts` region resolution | yes |
| `CLEANUP_SOFT_DELETE_DAYS` | `app/api/[[...route]]/cron/cleanup.ts` | yes |

## Rules

- `.env` stays gitignored; only `.env.example` carries placeholder values.
- New env vars must be added here before their consuming code merges.

## Verify when done

- [x] Every `process.env.X` reference has a matching `.env.example` entry or documented default
- [x] No real secrets introduced
