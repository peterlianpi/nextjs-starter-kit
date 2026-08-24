import { z } from "zod";

// ============================================
// TIPTAP DOCUMENT JSON SCHEMA
// ============================================
// Structural (not exhaustive) validation of a TipTap doc: a "doc" node
// whose children are nodes. Deep recursion is intentionally avoided —
// the editor produces valid docs and rendering tolerates unknown nodes.

const tiptapNodeSchema = z.object({
  type: z.string(),
  // Note: shallow validation only (no z.lazy recursion) — recursive schemas
  // break Hono RPC ClientRequest inference and drop /posts from AppType.
  content: z.array(z.unknown()).optional(),
});

export const postContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(tiptapNodeSchema),
});

export type PostContent = z.infer<typeof postContentSchema>;

// ============================================
// POST FORM / API SCHEMAS
// ============================================

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  content: postContentSchema,
  coverImage: z.url().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  // ISO string input (JSON-serializable for Hono RPC); converted to Date at the mutation boundary.
  publishedAt: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
