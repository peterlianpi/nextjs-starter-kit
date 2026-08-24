# Unit 02: Laravel DX CLI (scripts/make.ts)

> **Status: IMPLEMENTED (all generators) — 2026-08-24.**
> Framework + make:model + make:migration shipped first; the six remaining
> generators (controller, component, action, seeder, hook, schema) were added
> the same day. Extend the `GENERATORS` registry in `scripts/make.ts` for new ones.

## Goal

Port the ergonomics of `php artisan make:*` to this stack via a Bun-run
generator CLI. All generators are implemented: the framework plus
`make:model` and `make:migration` shipped first, followed by
`make:controller`, `make:component`, `make:action`, `make:seeder`,
`make:hook`, and `make:schema`. Extend the `GENERATORS` registry in
`scripts/make.ts` for new ones.

## Usage

Every generator is runnable directly via `bun run` (args pass through to
`scripts/make.ts`, e.g. `bun run make:hook SmokeTest` →
`bun scripts/make.ts make:hook SmokeTest`):

| Script | Generator |
|---|---|
| `bun run make <generator> <name>` | any generator |
| `bun run make:model <Name> [-m]` | Prisma model stub (+ optional migration) |
| `bun run make:migration <name>` | guided migration |
| `bun run make:controller <name>` | Hono sub-router |
| `bun run make:component <Name>` | Server Component (`--client` for client) |
| `bun run make:action <name>` | Server Action |
| `bun run make:seeder <name>` | DB seeder stub |
| `bun run make:hook <name>` | TanStack Query hook |
| `bun run make:schema <name>` | Zod schema |

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

### make:controller `<name>` (implemented 2026-08-24)

- Hono sub-router stub `app/api/[[...route]]/<kebab>.ts` with zValidator,
  `{ success, data?, error: { code, message } }` response shape, typed default
  export. NOT auto-mounted — prints manual mount instructions for route.ts.

### make:component `<PascalCaseName>` (implemented 2026-08-24)

- Server Component at `features/<kebab>/components/<kebab>.tsx`; `--client`
  adds the `"use client"` directive.

### make:action `<name>` (implemented 2026-08-24)

- Server Action `action/<kebab>.ts` with Zod safeParse input validation and
  revalidatePath pattern, returning `ActionResult<T>`.

### make:seeder `<name>` (implemented 2026-08-24)

- Seeder stub `prisma/seeders/<camel>.seeder.ts` importing the prisma
  singleton; NOT auto-registered — prints wiring hint for prisma/seed.ts.

### make:hook `<name>` (implemented 2026-08-24)

- TanStack Query hook `features/<kebab>/hooks/use-<kebab>.ts` (`"use client"`),
  typed fetch + useQuery with queryKey.

### make:schema `<name>` (implemented 2026-08-24)

- Zod schema `features/<kebab>/schemas/<kebab>.schema.ts` with inferred types.

## Dependencies

- None new (Bun runtime + Prisma CLI already present).

## Verify when done

- [x] `bun run make --help` lists generators
- [x] `bun run make model example` produces schema stub + service module
- [x] Generated code passes lint/typecheck
- [x] No destructive behavior on existing schema entries
- [x] All six remaining generators smoke-tested (generated → inspected → reverted); duplicate-file refusal and name validation verified (2026-08-24)
