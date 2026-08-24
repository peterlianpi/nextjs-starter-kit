# Performance Engineering — Methodology & Runbook

**Core principle: Measure first → Diagnose → Optimize → Verify — always.**

No optimization without profiling evidence. No blind caching, no speculative indexes, no timeout bumps, no framework swaps. Every performance claim is backed by a number taken from this system, at this commit, under realistic load.

This is the runbook for `perf-agent` and for any developer touching hot paths.

---

## 1. Investigation Loop

```
Observe → Measure → Profile → Correlate → Hypothesize → Validate → Fix → Verify
```

| Step | Action | Tooling in this stack |
|------|--------|----------------------|
| Observe | Detect the symptom (slow page, high p95, timeout) | Vercel Analytics, user reports, dashboards (recharts) |
| Measure | Quantify the problem with numbers + baseline | `next build --debug-prerender`, Vercel function logs, browser DevTools |
| Profile | Break down where time goes | Prisma query logs, `EXPLAIN ANALYZE`, React Profiler, `@next/bundle-analyzer` |
| Correlate | Match timing to a code path / deploy / data size | Vercel deployment history, git log, row counts |
| Hypothesize | One falsifiable cause per hypothesis ("Prisma fetches all Post rows because no select") | — |
| Validate | Prove the hypothesis before fixing | Reproduce locally with same data volume; targeted benchmark |
| Fix | Smallest change that addresses the confirmed root cause | — |
| Verify | Re-measure against baseline; confirm improvement or revert | Same tools as Measure |

If you cannot complete Measure/Profile, you are not ready to Fix.

## 2. Problem Classification

| Category | Typical symptom in this app | First probe |
|----------|----------------------------|-------------|
| DB (query) | Slow dashboard/table pages; Hono endpoint p95 high | Prisma query logs, `EXPLAIN ANALYZE`, `Neon_inspect_database` |
| CPU (server) | High function duration, low DB time | Vercel function logs (duration vs DB wait) |
| Memory | Function OOMs, GC pauses | Vercel memory metrics |
| Network | Fast server, slow TTFB client-side | DevTools waterfall, region latency |
| Rendering/hydration | Fast data load, slow interactive (TTI) | React Profiler, hydration warnings, bundle size |
| Build | Long `bun run build`, slow deploys | Build logs per phase |
| Serialization | Large RSC payloads / JSON responses | Response sizes in DevTools/network tab |

### Behavior patterns

| Pattern | Suggests |
|---------|----------|
| Constant overhead regardless of input | Fixed cost: cold start, middleware, connection setup |
| Degrades over session/time | Cache bloat, connection leak, growing in-memory state |
| Scales with data size | Unbounded queries (no pagination/select), N+1, missing index |
| Regression after a specific deploy | Diff that deploy; bisect if needed |

## 3. Baseline Metrics Checklist

Collect **before** changing anything:

- [ ] Latency percentiles: P50 / P95 / P99 per route (Vercel Analytics or synthetic)
- [ ] Throughput (req/s) and error rate at representative load
- [ ] DB query times for the top 10 slowest queries (`pg_stat_statements`)
- [ ] Production build time (`bun run build`) and bundle size (route-level JS KB)
- [ ] Cold vs warm function duration on Vercel
- [ ] Largest RSC payload and API response sizes

If a metric is missing: establish it first (even one manual measurement beats none). Record commit SHA + environment with every baseline.

## 4. Request-Path Breakdown Template

For "page X is slow", fill in each hop:

```
Client navigation .......... ____ ms
Vercel edge/middleware ..... ____ ms
Next.js server (RSC render) . ____ ms   ← split: data fetch vs render
Hono handler ............... ____ ms
Prisma query execution ..... ____ ms   ← per-query
Postgres ................... ____ ms   ← EXPLAIN ANALYZE
Serialization (JSON/RSC) ... ____ ms
Network transfer (payload __KB) ______ ms
Hydration (JS __KB) ........ ____ ms
TOTAL ...................... ____ ms
```

The largest unexplained gap is your next investigation target.

## 5. Evidence Hierarchy

Rank evidence strongest → weakest. Never present an inference as fact.

1. **Measured production/synthetic numbers** (logs, traces, EXPLAIN output)
2. **Reproduced locally with equivalent data volume**
3. **Code reading** (static reasoning about what must happen)
4. **Prior experience / heuristics**

Label every statement in a report as one of:

- **FACT** — directly measured/observed, with source
- **INFERENCE** — logically follows from facts (state the logic)
- **HYPOTHESIS** — testable guess, not yet validated
- **RECOMMENDATION** — proposed action tied to validated evidence

## 6. Stack-Specific Guidance

### Next.js 16 (App Router)

- Prefer Server Components + RSC for data fetching; adding `"use client"` moves data fetching to the browser — measure bundle impact before converting.
- Choose rendering mode by access pattern, then verify: static (SSG/prerendered) for stable content, dynamic/SSR only when request-time data demands it.
- Watch route-level JS: use dynamic imports for heavy client components (recharts, editors); alert on significant bundle increases between builds.
- Hydration cost is real: large trees re-rendering on the client show as long TTI despite fast TTFB — profile with React Profiler, don't assume.

### Prisma 7 / PostgreSQL

- Run `EXPLAIN ANALYZE` on any suspect query before writing a fix.
- N+1 detection: check Prisma logs for repeated similar queries; fix with `include`/`select` batching — but confirm the pattern exists in logs first.
- Always `select` only needed fields on list/dashboard endpoints; unbounded queries violate the pagination rule in code standards.
- Connection pool: single `lib/prisma.ts` singleton with driver adapter; investigate pool exhaustion via connection errors/timeouts before bumping pool size.
- Indexes need justification: propose only after EXPLAIN shows a sequential scan on a hot path with meaningful row counts; verify with the planner afterward.

### Hono API layer

- Break down endpoint latency: zod validation → auth check → business logic → Prisma → response serialization.
- All endpoints validate with `@hono/zod-validator`; heavy schemas on hot endpoints can be measurable — measure before micro-optimizing.
- Consistent `{ success, data?, error? }` shape; oversized `data` payloads are a common hidden cost — check response size.

### Vercel

- Cold starts: distinguish cold vs warm in function logs before optimizing init code.
- Function limits: duration/memory ceilings vary per plan — a timeout may be a ceiling, not a bug; measure which.
- Image optimization goes through Vercel's pipeline — check its cache-hit ratio before adding custom image handling.

### Build performance

- Track build phase durations (`bun run build` logs); regressions usually trace to new prerendering of dynamic routes or type-checking growth.
- Generated Prisma client (`lib/generated/prisma`) should never be type-checked into build analysis — it's generated; keep it out of lint/tsconfig scope drift debates unless measured as a problem.

## 7. RCA Report Template

```markdown
# RCA: <symptom>

## Confirmed Facts
- FACT: <measurement> (source: <tool/log>, date, commit <sha>)
- ...

## Symptoms
- <what was observed, where, since when>

## Root Cause Candidates
| # | Candidate | Confidence | Supporting evidence |
|---|-----------|------------|--------------------|
| 1 | ... | High/Medium/Low | ... |

## Missing Evidence
- <what would confirm/eliminate candidate N>

## Recommended Investigation
1. <ordered next steps>

## Fix
<change made, linked to validated candidate>

## Verification Plan
Before: <number> → Target: <number> → Measured after: <number>

## Long-Term Prevention
- <guardrail: test, budget, monitoring, code-standard addition>
```

## 8. Verification Format

Every optimization ships with:

```
Metric:      <e.g., /dashboard P95>
Before:      <measured value>
Target:      <value that justifies the change>
Success:     <criteria, e.g., "P95 ≤ 400ms sustained over 100 requests">
Measured:    <post-change value>  ✅ pass / ❌ revert
```

**Insufficient evidence rule:** if you cannot state Metric + Before + Target, the correct answer is *"Insufficient evidence to optimize"* — go back to Measure. Saying this is a valid outcome, not a failure.

## 9. HOT FIX Mode

When production is actively degraded:

1. Stabilize first (rollback, feature flag off, rate limit) — mitigation is allowed without full RCA.
2. Capture whatever evidence exists **before** it disappears (logs, metrics snapshots).
3. Run the abbreviated loop: Measure → Hypothesize → Validate → Fix → Verify.
4. Ship a full RCA within 48h; every HOT FIX gets a post-hoc verification entry.
