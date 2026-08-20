import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchEntities } from "@/lib/services/search";

const search = new Hono()

  // GET /api/search - Search across entities
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        q: z.string().min(2),
        type: z.string().optional(),
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
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

      const { q, type, page, limit } = c.req.valid("query");

      const results = await searchEntities({
        query: q,
        entityType: type,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return c.json({
        success: true,
        data: results,
      });
    },
  );

export default search;
