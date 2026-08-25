# Next.js Starter Kit

A production-ready [Next.js 16](https://nextjs.org) starter kit: secure authentication, an admin panel, a TipTap-powered CMS blog, multi-theme support, and a type-safe Hono API — built to be extended, not rewritten.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 7 + PostgreSQL · Better Auth · Hono RPC · Tailwind CSS v4 + shadcn/ui · Resend/Nodemailer email · Cloudflare R2 / S3 / Cloudinary uploads

**Live demo:** https://nextjs-starter-kit-gules.vercel.app

**Creator:** Peter Pau Sian Lian

<!-- Screenshots: drop images into docs/screenshots/ and reference them here -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->
<!-- ![Blog post](docs/screenshots/blog-post.png) -->

## Features

- **Auth — Better Auth**: email/password with email verification, password reset, optional Google OAuth (opt-in via env), RBAC roles (USER → SUPER_ADMIN), protected route group with server-side session checks
- **CMS blog**: TipTap rich text editor, posts/categories/tags stored in Postgres, image uploads with crop pipeline (aspect presets + zoom), print stylesheet, social share buttons
- **Multi-theme system**: light/dark plus oklch preset themes (Sepia, Nord, Rosé Pine) via a theme switcher
- **Hono API**: all endpoints mounted under one catch-all route with Zod validation and type-safe RPC client (`hc<AppType>`)
- **Admin panel**: user management (roles, ban), media library backed by Cloudinary / R2 / S3 / local storage
- **Artisan-style CLI generators**: `make:model`, `make:migration`, `make:controller`, and more (Laravel DX)
- **Testing**: Playwright E2E suite
- **In-app docs**: full documentation served at `/docs`

## Quick Start

Requires [Bun](https://bun.sh) and a PostgreSQL database.

```bash
# 1. Install dependencies (also generates the Prisma client)
bun install

# 2. Configure environment
cp .env.example .env.local
# Fill in DATABASE_URL at minimum. Every variable is documented in docs/ENV-VARS.md

# 3. Set up the database schema
bunx prisma migrate dev

# 4. Seed demo data (4 loginable users, blog posts, org)
bun run db:seed

# 5. Start the dev server
bun run dev
```

Open http://localhost:3000. Demo accounts (all use password `demo1234`):

| Email                 | Role        |
| --------------------- | ----------- |
| admin@example.com     | SUPER_ADMIN |
| editor@example.com    | EDITOR      |
| mod@example.com       | MODERATOR   |
| user@example.com      | USER        |

## Scripts

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `bun run dev`         | Start the dev server                           |
| `bun run build`       | Production build                               |
| `bun run start`       | Serve the production build                     |
| `bun run lint`        | ESLint check                                   |
| `bun run db:test`     | Database connection smoke test                 |
| `bun run db:seed`     | Seed demo users, posts, categories, tags, org  |
| `bun run db:studio`   | Open Prisma Studio                             |
| `bun run test:e2e`    | Playwright end-to-end tests                    |
| `bun run make:model`  | Generate a Prisma model                        |
| `bun run make:migration` | Create a Prisma migration                   |
| `bun run make:controller` | Generate a Hono controller                 |
| `bun run make:component` | Generate a feature component                |
| `bun run make:action` | Generate a Server Action                       |
| `bun run make:seeder` | Generate a seeder                              |
| `bun run make:hook`   | Generate a React hook                          |
| `bun run make:schema` | Generate a Zod schema                          |

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (protected)/          # Auth-required routes (dashboard, admin, settings)
│   ├── api/[[...route]]/     # All Hono API endpoints (single catch-all)
│   ├── blog/[slug]/          # Public CMS-rendered blog posts
│   └── docs/                 # In-app documentation
├── features/                 # Feature-sliced modules (components/, hooks/, lib/, schemas/)
├── components/ui/            # shadcn/ui primitives (treated as generated — don't edit)
├── lib/                      # site config, auth, prisma singleton, services, utils
├── prisma/                   # schema.prisma, migrations, seed.ts
├── scripts/                  # CLI generators (make.ts) + test scripts
├── context/                  # Project context docs (architecture, standards, specs)
└── tests/e2e/                # Playwright specs
```

## Documentation

In-app docs (served from `/docs`): getting started, authentication, API & RPC, database, CMS features, CLI generators, deployment, environment variables, frontend roadmap, and more.

Repo-level guides:

- [`docs/ENV-VARS.md`](docs/ENV-VARS.md) — every environment variable explained
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel deployment walkthrough
- [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) — evidence-driven performance runbook
- [`docs/SECURITY-AGENTS.md`](docs/SECURITY-AGENTS.md) — security testing approach
- [`context/architecture.md`](context/architecture.md) — system structure and invariants

## Deployment

The project targets **Vercel** with zero config. Email is sent via Resend, uploads go to S3-compatible blob storage, and the database is managed Postgres (Neon works well). See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full guide.
