"use client";

import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { client } from "@/lib/api/hono-client";
import { PostForm } from "@/features/editor/components/post-form";

interface PostResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    featured: boolean;
  };
  error?: { code: string; message: string };
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<PostResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await client.api.posts[":id"].$get({ param: { id } });
      const payload = (await res.json()) as PostResponse;
      if (cancelled) return;
      if (!res.ok || !payload.success || !payload.data) {
        setError(payload.error?.message ?? "Failed to load post");
        return;
      }
      setPost(payload.data);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p role="alert" className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!post) {
    return (
      <div className="space-y-3 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0 max-w-4xl">
      <PostForm
        mode="edit"
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          status: post.status,
          featured: post.featured,
          initialContent: post.content,
        }}
        onSubmit={async (values) => {
          const res = await client.api.posts[":id"].$patch({
            param: { id },
            json: values as never,
          });
          const payload = (await res.json()) as {
            success: boolean;
            error?: { message: string };
          };
          if (!res.ok || !payload.success) {
            return { error: payload.error?.message ?? "Failed to update post" };
          }
          return {};
        }}
      />
    </div>
  );
}
