import prisma from "@/lib/prisma";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getApiSession } from "@/lib/auth/api-helpers";

// ============================================
// ORGANIZATIONS ROUTER (Unit 16.2)
// ============================================
// Minimal org surface for the sidebar switcher:
// list my memberships and create an organization
// (creator becomes "owner"). Full CRUD/members/invites
// land in Unit 16.10.

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, dashes")
    .optional(),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}

async function requireSession(cookieHeader: string | undefined) {
  const session = await getApiSession(cookieHeader);
  return session?.user ?? null;
}

const orgs = new Hono()
  // GET /api/orgs - List my organizations with my role in each
  .get("/", async (c) => {
    try {
      const user = await requireSession(c.req.header("cookie"));
      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
          },
          401,
        );
      }

      const memberships = await prisma.member.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          role: true,
          createdAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return c.json({
        success: true,
        data: {
          organizations: memberships.map((m) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            logo: m.organization.logo,
            role: m.role,
            joinedAt: m.createdAt,
          })),
        },
      });
    } catch (error) {
      console.error("[orgs] list failed:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch organizations",
          },
        },
        500,
      );
    }
  })

  // POST /api/orgs - Create an organization (creator becomes owner)
  .post("/", zValidator("json", createOrgSchema), async (c) => {
    try {
      const user = await requireSession(c.req.header("cookie"));
      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
          },
          401,
        );
      }

      const body = c.req.valid("json");
      const slug = body.slug ?? slugify(body.name);

      if (!slug) {
        return c.json(
          {
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Slug is required" },
          },
          422,
        );
      }

      const clash = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (clash) {
        return c.json(
          {
            success: false,
            error: { code: "CONFLICT", message: "Organization slug already in use" },
          },
          409,
        );
      }

      const created = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            id: crypto.randomUUID(),
            name: body.name,
            slug,
          },
          select: { id: true, name: true, slug: true },
        });
        const member = await tx.member.create({
          data: {
            id: crypto.randomUUID(),
            organizationId: org.id,
            userId: user.id,
            role: "owner",
          },
        });
        return { organization: org, member };
      });

      return c.json({ success: true, data: created }, 201);
    } catch (error) {
      console.error("[orgs] create failed:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create organization",
          },
        },
        500,
      );
    }
  });

export default orgs;
