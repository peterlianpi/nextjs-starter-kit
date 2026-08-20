import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ============================================
// HEALTH CHECK ROUTER
// ============================================

const health = new Hono()

  // GET /api/health - Simple health check
  .get("/", async (c) => {
    return c.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })

  // GET /api/health/auth - Health check with auth context
  .get("/auth", async (c) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      return c.json({
        success: true,
        authenticated: !!session,
        user: session
          ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: session.user.role,
            }
          : null,
      });
    } catch {
      return c.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }
  })

  // POST /api/health/echo - Echo endpoint for testing
  .post(
    "/echo",
    zValidator(
      "json",
      z.object({
        message: z.string().min(1),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      return c.json({
        success: true,
        echo: body.message,
        timestamp: new Date().toISOString(),
      });
    },
  );

export default health;
