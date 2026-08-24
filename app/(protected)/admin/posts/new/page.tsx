"use client";

import { client } from "@/lib/api/hono-client";
import { PostForm } from "@/features/editor/components/post-form";

export default function NewPostPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-0 max-w-4xl">
      <PostForm
        mode="create"
        onSubmit={async (values) => {
          const res = await client.api.posts.$post({ json: values as never });
          const payload = (await res.json()) as {
            success: boolean;
            error?: { message: string };
          };
          if (!res.ok || !payload.success) {
            return { error: payload.error?.message ?? "Failed to create post" };
          }
          return {};
        }}
      />
    </div>
  );
}
