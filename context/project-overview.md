# Next.js Starter Kit

## Overview

A production-ready Next.js 16 starter kit providing secure authentication (Better Auth), an admin panel, file uploads, email notifications, and a modular feature architecture. It ships with Prisma + PostgreSQL, Hono API routes, shadcn/ui, and dark mode so teams can extend a coherent foundation instead of assembling one from scratch.

## Goals

1. Provide a secure, production-grade auth foundation (email/password, email verification, password reset, RBAC)
2. Ship an opinionated, feature-sliced structure teams extend without guesswork
3. Keep site config, API validation, and database access centralized and consistent

## Core User Flow

1. Visitor signs up (email/password) → email verification link sent
2. User verifies email and logs in via `/login`
3. User lands on the protected dashboard `/dashboard`
4. Admin manages users and media from `/admin`
5. Scheduled cron jobs handle service monitoring and reminder emails

## Features

### Authentication
- Better Auth: email/password, email verification, forgot/reset password
- RBAC roles: USER, VIEWER, EDITOR, MODERATOR, ADMIN, SUPER_ADMIN
- Protected route group `(protected)/` with server-side session checks

### Admin
- User management (list, view, ban, role assignment)
- Media library (file uploads with multi-provider storage)

### API & Infrastructure
- Hono API routes mounted at `app/api/[[...route]]/route.ts` with Zod validation
- Webhooks with delivery tracking, API keys with hashed storage, audit logging, rate limiting, notifications
- Cron endpoints under `app/api/[[...route]]/cron` for scheduled jobs (service monitoring / reminders)

### Organizations
- Multi-tenant organizations backed by `Organization`, `Member`, `Invitation` models
- Membership roles and invitation flow per organization

### Blog
- DB-stored blog content via `Post`, `Category`, `Tag`, `PostTag` models
- Categories and many-to-many tagging; content lives in the database, media in blob storage

### Monitoring & Timeline
- Service monitoring with metrics recorded in `SystemMetric`
- Timeline feature module (`features/timeline/`) surfacing activity/history views

### Notifications & Files
- Email via Nodemailer or Resend (`EMAIL_PROVIDER`)
- Uploads via Cloudinary, R2, S3, or local (`UPLOAD_PROVIDER`)

### UI & Analytics
- shadcn/ui + Tailwind v4, light/dark themes (next-themes)
- Dashboard analytics with recharts, data tables with sorting/filtering/pagination

## Scope

### In Scope

- Auth, RBAC, admin panel, uploads, email, Hono API, cron, webhooks, API keys
- Blog content (posts, categories, tags) and multi-tenant organizations
- Service monitoring and timeline views
- shadcn/ui component library with both light and dark themes

### Out of Scope

- Payment / billing integration
- i18n beyond the single `en` locale
- Real-time collaboration

## Success Criteria

1. A new developer runs auth + admin + uploads locally from `.env.example` without code changes
2. All protected routes and admin APIs enforce server-side session checks
3. `bun run lint` and `bun run build` pass for both themes