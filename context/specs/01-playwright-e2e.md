# Unit 01: Playwright E2E Setup

## Goal

Scaffold the Playwright E2E harness so smoke tests (health endpoint, auth guards)
can run against a dev server, without requiring a live database for setup itself.

## Design

- Config at repo root (`playwright.config.ts`) — standard Playwright location.
- Specs under `tests/e2e/` per `context/code-standards.md` testing table.
- Chromium-only project initially; firefox/webkit commented placeholders.
- `webServer` boots `bun run dev` and reuses an existing server locally.

## Implementation

### playwright.config.ts

- `testDir: ./tests/e2e`, parallel locally, retries + single worker + `github`
  reporter on CI.
- `baseURL` from `E2E_BASE_URL` env with `http://localhost:3000` default.
- `webServer`: command `bun run dev`, url `http://localhost:3000`,
  `reuseExistingServer: !process.env.CI`, 120s timeout.

### tests/e2e/health.spec.ts

- GET `/api/health` → expect `{ success: true, status: "ok" }`, string
  `timestamp`, numeric `uptime`.

### tests/e2e/auth.spec.ts

- Unauthenticated navigation to `/dashboard` must redirect to `/login`.
- `/login` renders email and password inputs.

### package.json

- Add `"test:e2e": "playwright test"`.

## Dependencies

- `@playwright/test` (already installed).

## Verify when done

- [x] Config + specs exist and typecheck
- [x] `bun run test:e2e` script present
- [ ] Full suite run deferred until a live DB is available (documented)
