import prisma from "@/lib/prisma";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { hasApiPermission, getApiSession } from "@/lib/auth/api-helpers";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const adminUsersQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
});

const roleUpdateSchema = z.object({
  role: z.enum(["USER", "VIEWER", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
});

const banUpdateSchema = z.object({
  banned: z.boolean(),
  reason: z.string().optional(),
});

// ============================================
// ADMIN ROUTER
// ============================================

const admin = new Hono()

  // GET /api/admin/check-admin - Check if current user is admin
  .get("/check-admin", async (c) => {
    const cookie = c.req.header("cookie");
    const isAdmin = await hasApiPermission(cookie, { resource: "user", actions: ["list"] });

    if (!isAdmin) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        401,
      );
    }

    return c.json({ success: true, isAdmin: true });
  })

  // GET /api/admin/stats - Get admin dashboard stats
  .get("/stats", async (c) => {
    const cookie = c.req.header("cookie");
    const canList = await hasApiPermission(cookie, { resource: "user", actions: ["list"] });

    if (!canList) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        401,
      );
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
      bannedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalFiles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { deletedAt: null, banned: false } }),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.fileUpload.count(),
    ]);

    return c.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        adminUsers,
        bannedUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalFiles,
      },
    });
  })

  // GET /api/admin/users - Get all users (admin only)
  .get(
    "/users",
    zValidator("query", adminUsersQuerySchema),
    async (c) => {
      const cookie = c.req.header("cookie");
      const canList = await hasApiPermission(cookie, { resource: "user", actions: ["list"] });

      if (!canList) {
        return c.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
          401,
        );
      }

      const { search, page, limit } = c.req.valid("query");
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return c.json({
        success: true,
        data: {
          users,
          meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    },
  )

  // GET /api/admin/users/:id - Get user detail with metrics
  .get("/users/:id", async (c) => {
    const cookie = c.req.header("cookie");
    const canGet = await hasApiPermission(cookie, { resource: "user", actions: ["get"] });

    if (!canGet) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        401,
      );
    }

    const id = c.req.param("id");

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            notifications: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        404,
      );
    }

    return c.json({ success: true, data: user });
  })

  // PATCH /api/admin/users/:id/role - Update user role
  .patch(
    "/users/:id/role",
    zValidator("json", roleUpdateSchema),
    async (c) => {
      const cookie = c.req.header("cookie");
      const canSetRole = await hasApiPermission(cookie, { resource: "user", actions: ["set-role"] });

      if (!canSetRole) {
        return c.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: user:set-role" } },
          401,
        );
      }

      const id = c.req.param("id");
      const { role } = c.req.valid("json");

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return c.json({ success: true, data: updated });
    },
  )

  // PATCH /api/admin/users/:id/ban - Ban/unban user
  .patch(
    "/users/:id/ban",
    zValidator("json", banUpdateSchema),
    async (c) => {
      const cookie = c.req.header("cookie");
      const canBan = await hasApiPermission(cookie, { resource: "user", actions: ["ban"] });

      if (!canBan) {
        return c.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: user:ban" } },
          401,
        );
      }

      const id = c.req.param("id");
      const { banned, reason } = c.req.valid("json");

      const updated = await prisma.user.update({
        where: { id },
        data: {
          banned,
          banReason: reason || null,
          banExpires: banned ? null : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          banned: true,
          banReason: true,
        },
      });

      return c.json({ success: true, data: updated });
    },
  )

  // GET /api/admin/users/:id/audit-logs - Get user's audit logs
  .get("/users/:id/audit-logs", async (c) => {
    const cookie = c.req.header("cookie");
    const canGet = await hasApiPermission(cookie, { resource: "user", actions: ["get"] });

    if (!canGet) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        401,
      );
    }

    const id = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "20");

    const auditLogs = await prisma.auditLog.findMany({
      where: { createdById: id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return c.json({ success: true, data: { auditLogs } });
  })

  // GET /api/admin/users/:id/notifications - Get user's notifications
  .get("/users/:id/notifications", async (c) => {
    const cookie = c.req.header("cookie");
    const canGet = await hasApiPermission(cookie, { resource: "user", actions: ["get"] });

    if (!canGet) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        401,
      );
    }

    const id = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "20");

    const notifications = await prisma.notification.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return c.json({ success: true, data: { notifications } });
  })

  // GET /api/admin/users/:id/sessions - Get user's active sessions
  .get("/users/:id/sessions", async (c) => {
    const cookie = c.req.header("cookie");
    const canGet = await hasApiPermission(cookie, { resource: "user", actions: ["get"] });

    if (!canGet) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        401,
      );
    }

    const id = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "10");

    const sessions = await prisma.session.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return c.json({ success: true, data: { sessions } });
  });

export default admin;
