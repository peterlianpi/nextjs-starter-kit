# Unit 03: Build Verification

## Goal

Establish a green baseline: `bun run lint` and `bun run build` pass; any
failures fixed at root cause only (no workarounds), results recorded in the
progress tracker.

## Implementation

1. Run `bun run lint`. Fix all errors/warnings that indicate real issues;
   do not disable rules to silence findings.
2. Run `bun run build`. Next.js 16 build surfaces route/type/prerender errors —
   fix each at its source (types, imports, server/client boundaries).
3. Record outcomes in `../progress-tracker.md` under Completed.

## Verify when done

- [x] `bun run lint` exits 0
- [x] `bun run build` exits 0
- [x] Results noted in progress tracker
