"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPostSchema, updatePostSchema } from "../schemas/post";

// TipTap touches the DOM on mount and cannot render on the server.
const TiptapEditor = dynamic(() => import("./tiptap-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] rounded-md border border-input bg-muted/40 animate-pulse" />
  ),
});

export interface PostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: unknown;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
}

interface PostFormProps {
  mode: "create" | "edit";
  initial?: Partial<PostFormValues> & { initialContent?: string | null };
  onSubmit: (values: Record<string, unknown>) => Promise<{ error?: string }>;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostForm({ mode, initial, onSubmit }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState<unknown>(null);
  const [status, setStatus] = useState<PostFormValues["status"]>(
    initial?.status ?? "DRAFT",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Defense in depth: validate on the client before hitting the API
    // (the API re-validates with the same Zod schemas).
    const parsed =
      mode === "create"
        ? createPostSchema.safeParse({
            title,
            slug: slugify(slug || title),
            excerpt,
            content,
            status,
            featured,
          })
        : updatePostSchema.safeParse({
            title,
            slug: slugify(slug || title),
            excerpt,
            content,
            status,
            featured,
          });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    const result = await onSubmit(parsed.data as Record<string, unknown>);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "New Post" : "Edit Post"}</CardTitle>
          <CardDescription>
            Compose content with the rich text editor below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-slug">Slug</Label>
            <Input
              id="post-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => setSlug((s) => slugify(s))}
              placeholder={slugify(title) || "kebab-case-slug"}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary shown in lists and search results"
              rows={3}
              maxLength={500}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-content">Content</Label>
            <div id="post-content">
              <TiptapEditor
                initialContent={
                  initial?.initialContent ??
                  (typeof content === "string" ? content : null)
                }
                onChange={(json) => setContent(json)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="post-status"
              checked={status === "PUBLISHED"}
              onCheckedChange={(checked) =>
                setStatus(checked ? "PUBLISHED" : "DRAFT")
              }
            />
            <Label htmlFor="post-status">Published</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="post-featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
            <Label htmlFor="post-featured">Featured</Label>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
