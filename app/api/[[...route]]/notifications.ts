import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getApiSession } from "@/lib/auth/api-helpers";

// ============================================
// NOTIFICATIONS ROUTER
// ============================================
// Per-user notification list + read-state mutations.
// All endpoints require a session; ownership is enforced
// server-side on every mutation boundary.

const idParamSchema = z.object({
  id: z.string().min(1),
});

const listQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.string().min(1).optional(),
});

import type { Context } from "hono";

const unauthorized = (c: Context) =>
  c.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    },
    401,
  );

const notifications = new Hono()

  // GET /api/notifications - Cursor-paginated list for current user
  // Query: ?cursor=<id>&limit=<n>&type=<type> → { notifications, nextCursor }
  .get("/", zValidator("query", listQuerySchema), async (c) => {
    try {
      const session = await getApiSession(c.req.header("cookie"));
      if (!session?.user) return unauthorized(c);

      const { cursor, limit, type } = c.req.valid("query");

      // Fetch limit+1 so we can tell whether another page exists
      const items = await prisma.notification.findMany({
        where: {
          userId: session.user.id,
          ...(type ? { type } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor
          ? { cursor: { id: cursor }, skip: 1 }
          : {}),
      });

      const hasMore = items.length > limit;
      const pageItems = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null;

      return c.json({
        success: true,
        data: { notifications: pageItems, nextCursor },
      });
    } catch (error) {
      console.error("[Notifications] list failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL", message: "Failed to load notifications" },
        },
        500,
      );
    }
  })

  // POST /api/notifications/:id/read - Mark one as read (idempotent)
  .post("/:id/read", zValidator("param", idParamSchema), async (c) => {
    try {
      const session = await getApiSession(c.req.header("cookie"));
      if (!session?.user) return unauthorized(c);

      const { id: notificationId } = c.req.valid("param");

      // Serializable transaction prevents double-read races
      const result = await prisma.$transaction(
        async (tx) => {
          const notification = await tx.notification.findUnique({
            where: { id: notificationId },
          });

          if (!notification) {
            return { success: false, code: "NOT_FOUND" as const };
          }

          if (notification.userId !== session.user.id) {
            return { success: false, code: "FORBIDDEN" as const };
          }

          if (notification.readAt !== null) {
            return { success: true, code: "ALREADY_READ" as const };
          }

          const updated = await tx.notification.updateMany({
            where: { id: notificationId, readAt: null },
            data: { read: true, readAt: new Date() },
          });

          return {
            success: true,
            code: updated.count === 0 ? ("ALREADY_READ" as const) : ("UPDATED" as const),
          };
        },
        { isolationLevel: "Serializable" },
      );

      if (result.code === "NOT_FOUND") {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Notification not found",
            },
          },
          404,
        );
      }

      if (result.code === "FORBIDDEN") {
        return c.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "Not your notification" },
          },
          403,
        );
      }

      // Idempotent success either way
      return c.json({ success: true, data: { status: result.code } });
    } catch (error) {
      console.error("[Notifications] mark-read failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL", message: "Failed to mark notification read" },
        },
        500,
      );
    }
  })

  // POST /api/notifications/read-all - Mark all unread as read (idempotent)
  .post("/read-all", async (c) => {
    try {
      const session = await getApiSession(c.req.header("cookie"));
      if (!session?.user) return unauthorized(c);

      const result = await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true, readAt: new Date() },
      });

      return c.json({ success: true, data: { updatedCount: result.count } });
    } catch (error) {
      console.error("[Notifications] read-all failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL", message: "Failed to mark all read" },
        },
        500,
      );
    }
  })

  // GET /api/notifications/unread-count - Unread count badge
  .get("/unread-count", async (c) => {
    try {
      const session = await getApiSession(c.req.header("cookie"));
      if (!session?.user) return unauthorized(c);

      const count = await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      });

      return c.json({ success: true, data: { count } });
    } catch (error) {
      console.error("[Notifications] unread-count failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL", message: "Failed to count notifications" },
        },
        500,
      );
    }
  });

export default notifications;
