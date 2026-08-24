import prisma from "@/lib/prisma";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { hasApiPermission, getApiSession } from "@/lib/auth/api-helpers";
import {
  createPostSchema,
  updatePostSchema,
} from "@/features/editor/schemas/post";

// ============================================
// POSTS ROUTER
// ============================================
// Blog post CRUD. TipTap document JSON is stored as a stringified
// `Post.content` (DB column is String); validated structurally by
// `postContentSchema` before persistence.

const listPostsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
});

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  status: true,
  publishedAt: true,
  featured: true,
  viewCount: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true } },
} as const;

async function requirePermission(
  cookieHeader: string | undefined,
  action: "create" | "read" | "update" | "delete" | "publish" | "list",
) {
  const allowed = await hasApiPermission(cookieHeader, {
    resource: "content",
    actions: [action],
  });
  if (allowed) {
    const session = await getApiSession(cookieHeader);
    if (session?.user) return session.user;
  }
  return null;
}

const posts = new Hono()

  // GET /api/posts - List posts (paginated, searchable)
  .get("/", zValidator("query", listPostsQuerySchema), async (c) => {
    try {
      const user = await requirePermission(c.req.header("cookie"), "list");
      if (!user) {
        return c.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Authentication required" },
          },
          401,
        );
      }

      const { search, page, limit } = c.req.valid("query");
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

      const where = {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { excerpt: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          select: postSelect,
          orderBy: [{ createdAt: "desc" }],
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.post.count({ where }),
      ]);

      return c.json({
        success: true,
        data: {
          posts,
          meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.max(1, Math.ceil(total / limitNum)),
          },
        },
      });
    } catch (error) {
      console.error("[posts] list failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to fetch posts" },
        },
        500,
      );
    }
  })

  // POST /api/posts - Create a post
  .post("/", zValidator("json", createPostSchema), async (c) => {
    try {
      const user = await requirePermission(c.req.header("cookie"), "create");
      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You do not have permission to create posts",
            },
          },
          401,
        );
      }

      const body = c.req.valid("json");

      const existing = await prisma.post.findFirst({
        where: { slug: body.slug, deletedAt: null },
        select: { id: true },
      });
      if (existing) {
        return c.json(
          {
            success: false,
            error: { code: "CONFLICT", message: "Slug already in use" },
          },
          409,
        );
      }

      const post = await prisma.post.create({
        data: {
          title: body.title,
          slug: body.slug,
          excerpt: body.excerpt,
          content: JSON.stringify(body.content),
          coverImage: body.coverImage ?? null,
          status: body.status ?? "DRAFT",
          publishedAt:
            body.status === "PUBLISHED"
              ? body.publishedAt
                ? new Date(body.publishedAt)
                : new Date()
              : body.publishedAt
                ? new Date(body.publishedAt)
                : null,
          featured: body.featured ?? false,
          authorId: user.id,
        },
        select: { id: true, slug: true },
      });

      return c.json({ success: true, data: post }, 201);
    } catch (error) {
      console.error("[posts] create failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to create post" },
        },
        500,
      );
    }
  })

  // GET /api/posts/:id - Get a single post (with content)
  .get("/:id", async (c) => {
    try {
      const user = await requirePermission(c.req.header("cookie"), "read");
      if (!user) {
        return c.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Authentication required" },
          },
          401,
        );
      }

      const id = c.req.param("id");
      const post = await prisma.post.findFirst({
        where: { id, deletedAt: null },
        include: {
          author: { select: { id: true, name: true } },
        },
      });

      if (!post) {
        return c.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Post not found" },
          },
          404,
        );
      }

      // Ownership check for non-privileged authors is covered by the
      // content:update permission gate; admins/editors manage all posts.
      return c.json({ success: true, data: post });
    } catch (error) {
      console.error("[posts] get failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to fetch post" },
        },
        500,
      );
    }
  })

  // PATCH /api/posts/:id - Update a post
  .patch("/:id", zValidator("json", updatePostSchema), async (c) => {
    try {
      const user = await requirePermission(c.req.header("cookie"), "update");
      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You do not have permission to update posts",
            },
          },
          401,
        );
      }

      const id = c.req.param("id");
      const existing = await prisma.post.findFirst({
        where: { id, deletedAt: null },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return c.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Post not found" },
          },
          404,
        );
      }

      const body = c.req.valid("json");

      if (body.slug && body.slug !== existing.slug) {
        const clash = await prisma.post.findFirst({
          where: { slug: body.slug, deletedAt: null, NOT: { id } },
          select: { id: true },
        });
        if (clash) {
          return c.json(
            {
              success: false,
              error: { code: "CONFLICT", message: "Slug already in use" },
            },
            409,
          );
        }
      }

      const post = await prisma.post.update({
        where: { id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.slug !== undefined && { slug: body.slug }),
          ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
          ...(body.content !== undefined && {
            content: JSON.stringify(body.content),
          }),
          ...(body.coverImage !== undefined && {
            coverImage: body.coverImage ?? null,
          }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.featured !== undefined && { featured: body.featured }),
          ...(body.publishedAt !== undefined && {
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
          }),
        },
        select: { id: true, slug: true },
      });

      return c.json({ success: true, data: post });
    } catch (error) {
      console.error("[posts] update failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to update post" },
        },
        500,
      );
    }
  })

  // DELETE /api/posts/:id - Soft-delete a post
  .delete("/:id", async (c) => {
    try {
      const user = await requirePermission(c.req.header("cookie"), "delete");
      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You do not have permission to delete posts",
            },
          },
          401,
        );
      }

      const id = c.req.param("id");
      const existing = await prisma.post.findFirst({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return c.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Post not found" },
          },
          404,
        );
      }

      await prisma.post.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return c.json({ success: true, data: { id } });
    } catch (error) {
      console.error("[posts] delete failed:", error);
      return c.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to delete post" },
        },
        500,
      );
    }
  });

export default posts;
