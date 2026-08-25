import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import {
  getApiSession,
  checkApiIsAdmin,
} from "@/lib/auth/api-helpers";

// ============================================
// TIMELINE ROUTER
// ============================================
// Aggregated recent activity feed: AuditLog entries
// (user actions) merged with SystemMetric events
// (service health checks), sorted newest-first.
// Admin-gated — audit entries expose other users'
// actions, so they must never be public surface.

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  // "all" | "audit" (user actions) | "metric" (service health)
  filter: z.enum(["all", "audit", "metric"]).default("all"),
});

const unauthorized = (c: Context) =>
  c.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    },
    401,
  );

const forbidden = (c: Context) =>
  c.json(
    {
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required" },
    },
    403,
  );

interface ApiTimelineItem {
  id: string;
  kind: "audit" | "metric";
  title: string;
  description?: string;
  user?: string;
  // "info" | "success" | "warning" | "error"
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}

const timeline = new Hono()

  // GET /api/timeline?page=1&limit=20&filter=all|audit|metric
  .get("/", zValidator("query", listQuerySchema), async (c) => {
    try {
      const session = await getApiSession(c.req.header("cookie"));
      if (!session?.user) return unauthorized(c);

      const isAdmin = await checkApiIsAdmin(c.req.header("cookie"));
      if (!isAdmin) return forbidden(c);

      const { page, limit, filter } = c.req.valid("query");
      const skip = (page - 1) * limit;

      const includeAudit = filter !== "metric";
      const includeMetric = filter !== "audit";

      const [auditLogs, metrics] = await Promise.all([
        includeAudit
          ? prisma.auditLog.findMany({
              orderBy: { createdAt: "desc" },
              skip,
              take: limit,
              select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                action: true,
                createdBy: { select: { name: true, email: true } },
              },
            })
          : Promise.resolve([]),
        includeMetric
          ? prisma.systemMetric.findMany({
              orderBy: { recordedAt: "desc" },
              skip,
              take: limit,
              select: {
                id: true,
                service: true,
                status: true,
                responseTime: true,
                recordedAt: true,
              },
            })
          : Promise.resolve([]),
      ]);

      const auditItems: ApiTimelineItem[] = auditLogs.map((log) => ({
        id: log.id,
        kind: "audit",
        title: log.title,
        ...(log.description ? { description: log.description } : {}),
        user: log.createdBy?.name ?? log.createdBy?.email ?? undefined,
        type: "info",
        timestamp: log.createdAt.toISOString(),
      }));

      const metricStatusType: Record<
        string,
        ApiTimelineItem["type"]
      > = {
        ok: "success",
        degraded: "warning",
        down: "error",
      };

      const metricItems: ApiTimelineItem[] = metrics.map((m) => ({
        id: m.id,
        kind: "metric",
        title: `${m.service}: ${m.status}`,
        description: `${m.service} health check responded in ${m.responseTime}ms`,
        type: metricStatusType[m.status] ?? "info",
        timestamp: m.recordedAt.toISOString(),
      }));

      // Merge both sources, newest first, trim to page size
      const merged = [...auditItems, ...metricItems]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime(),
        )
        .slice(0, limit);

      // A next page plausibly exists if either source filled its window
      const sourceFilled =
        (includeAudit && auditLogs.length === limit) ||
        (includeMetric && metrics.length === limit);
      const hasMore = sourceFilled || merged.length === limit;

      return c.json({
        success: true,
        data: { items: merged, page, limit, hasMore },
      });
    } catch (error) {
      console.error("[Timeline] list failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL", message: "Failed to load timeline" },
        },
        500,
      );
    }
  });

export default timeline;
