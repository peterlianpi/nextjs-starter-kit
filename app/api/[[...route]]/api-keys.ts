import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const apiKeys = new Hono()

  // POST /api/keys - Create a new API key
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        expiresAt: z.string().datetime().optional(),
      }),
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return c.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
          401,
        );
      }

      const body = c.req.valid("json");

      // Generate a raw key (shown only once)
      const rawKey = `sk_${crypto.randomBytes(24).toString("hex")}`;
      const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
      const keyPrefix = rawKey.slice(0, 12);

      const apiKey = await prisma.apiKey.create({
        data: {
          name: body.name,
          key: hashedKey,
          keyPrefix,
          description: body.description,
          permissions: body.permissions ? JSON.parse(JSON.stringify(body.permissions)) : null,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          userId: session.user.id,
        },
      });

      return c.json({
        success: true,
        data: {
          ...apiKey,
          key: rawKey, // Only returned on creation
        },
      });
    },
  )

  // GET /api/keys - List user's API keys
  .get("/", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        401,
      );
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        description: true,
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: keys });
  })

  // DELETE /api/keys/:id - Revoke an API key
  .delete("/:id", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        401,
      );
    }

    const id = c.req.param("id");

    await prisma.apiKey.deleteMany({
      where: { id, userId: session.user.id },
    });

    return c.json({ success: true });
  })

  // PATCH /api/keys/:id - Toggle API key active status
  .patch("/:id", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        401,
      );
    }

    const id = c.req.param("id");

    const key = await prisma.apiKey.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!key) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "API key not found" } },
        404,
      );
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: !key.isActive },
    });

    return c.json({ success: true, data: updated });
  });

export default apiKeys;
