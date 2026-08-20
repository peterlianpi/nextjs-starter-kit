import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hasApiPermission } from "@/lib/auth/api-helpers";

const webhooks = new Hono()

  // POST /api/webhooks - Create a new webhook
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        url: z.string().url(),
        description: z.string().optional(),
        events: z.array(z.string()).min(1),
        maxRetries: z.number().min(1).max(10).default(3),
        retryDelay: z.number().min(10).max(3600).default(60),
      }),
    ),
    async (c) => {
      const cookie = c.req.header("cookie");
      const canCreate = await hasApiPermission(cookie, { resource: "webhook", actions: ["create"] });

      if (!canCreate) {
        return c.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: webhook:create" } },
          401,
        );
      }

      const body = c.req.valid("json");
      const secret = crypto.randomUUID();

      const webhook = await prisma.webhook.create({
        data: {
          url: body.url,
          secret,
          description: body.description,
          events: JSON.parse(JSON.stringify(body.events)),
          maxRetries: body.maxRetries,
          retryDelay: body.retryDelay,
        },
      });

      return c.json({
        success: true,
        data: {
          ...webhook,
          secret, // Only returned on creation
        },
      });
    },
  )

  // GET /api/webhooks - List all webhooks
  .get("/", async (c) => {
    const cookie = c.req.header("cookie");
    const canList = await hasApiPermission(cookie, { resource: "webhook", actions: ["list"] });

    if (!canList) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: webhook:list" } },
        401,
      );
    }

    const webhooks = await prisma.webhook.findMany({
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: webhooks });
  })

  // DELETE /api/webhooks/:id - Delete a webhook
  .delete("/:id", async (c) => {
    const cookie = c.req.header("cookie");
    const canDelete = await hasApiPermission(cookie, { resource: "webhook", actions: ["delete"] });

    if (!canDelete) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: webhook:delete" } },
        401,
      );
    }

    const id = c.req.param("id");

    await prisma.webhook.delete({ where: { id } });

    return c.json({ success: true });
  })

  // GET /api/webhooks/:id/deliveries - List webhook deliveries
  .get("/:id/deliveries", async (c) => {
    const cookie = c.req.header("cookie");
    const canList = await hasApiPermission(cookie, { resource: "webhook", actions: ["list"] });

    if (!canList) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: webhook:list" } },
        401,
      );
    }

    const id = c.req.param("id");

    const deliveries = await prisma.webhookDelivery.findMany({
      where: { webhookId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return c.json({ success: true, data: deliveries });
  });

export default webhooks;
