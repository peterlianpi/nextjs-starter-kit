# Unit 02: Laravel DX CLI (scripts/make.ts)

> **Status: IMPLEMENTED (framework + make:model + make:migration) — 2026-08-24.**
> Deferred generators below are still planned; extend the `GENERATORS` registry
> in `scripts/make.ts` per build unit.

## Goal

Port the ergonomics of `php artisan make:*` to this stack via a Bun-run
generator CLI. This round ships the framework plus `make:model` and
`make:migration`; remaining generators are deferred (see 00-build-plan.md).

## Design

- Single entrypoint: `scripts/make.ts`, run as `bun run make <generator> <name>`
  (`"make": "bun scripts/make.ts"` script in package.json).
- Generators are pure functions in a registry — easy to extend per build unit.
- Output follows project conventions from `context/architecture.md`:
  feature-sliced folders, Prisma single-source-of-truth schema, Hono sub-routers.

## Implementation

### scripts/make.ts

- Parse `process.argv`: `[generator, ...args]`.
- Flags: `--migration` / `-m` (model), others reserved for deferred generators.
- Unknown generator → print available generators and exit 1.

### make:model `<name>`

- Appends a Prisma model stub to `prisma/schema.prisma`:

  ```prisma
  model Post {
    id        String   @id @default(cuid())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("posts")
  }
  ```

- With `--migration`: runs `bunx prisma migrate dev --name create_<plural>_table`.
- Creates service module at `features/<name>/lib/<name>.service.ts` with a
  typed Prisma wrapper skeleton using the `lib/prisma.ts` singleton and
  try-catch pattern.

### make:migration `<name>`

- Prompts/instructs that `prisma/schema.prisma` must be edited first, then runs
  `bunx prisma migrate dev --name <name>` (schema is the single source of truth,
  mirroring Laravel's migration flow but declarative).

### Deferred generators (not in scope this round)

- make:controller → Hono sub-router `app/api/[[...route]]/<name>.ts`
- make:component → `features/<feature>/components/`
- make:action → Server Action `action/<name>.ts`
- make:seeder → seeder + `prisma/seed.ts` registration
- make:hook → `features/<feature>/hooks/`
- make:schema → Zod schema `features/<feature>/schemas/`

## Dependencies

- None new (Bun runtime + Prisma CLI already present).

## Verify when done

- [ ] `bun run make --help` lists generators
- [ ] `bun run make model example` produces schema stub + service module
- [ ] Generated code passes lint/typecheck
- [ ] No destructive behavior on existing schema entries
