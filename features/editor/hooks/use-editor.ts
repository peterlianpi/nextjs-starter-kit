"use client";

import { useEditor, type Editor } from "@tiptap/react";

import { buildExtensions, editorOnlyExtensions } from "../lib/extensions";

// ============================================
// UPLOAD WIRING
// ============================================
export interface UseEditorOptions {
  initialContent?: string | null;
  placeholder?: string;
  onUpdate?: (json: unknown) => void;
}

/**
 * Upload an image through the existing upload abstraction's HTTP surface
 * (`POST /api/upload`, which delegates to lib/services/upload.ts) and
 * return the hosted URL. Unit 13 (crop/processing) can replace this hook.
 */
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const payload = (await res.json()) as {
    success: boolean;
    data?: { url: string };
    error?: { message: string };
  };

  if (!res.ok || !payload.success || !payload.data?.url) {
    throw new Error(payload.error?.message ?? "Image upload failed");
  }

  return payload.data.url;
}

export function usePostEditor(options: UseEditorOptions = {}): Editor | null {
  const { initialContent, placeholder, onUpdate } = options;

  return useEditor({
    extensions: [...buildExtensions(), ...editorOnlyExtensions(placeholder)],
    content: initialContent ? safeParse(initialContent) : undefined,
    // The editor is dynamically imported with ssr: false, but guard anyway.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[320px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });
}

function safeParse(content: string): Record<string, unknown> | string {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return `<p>${content}</p>`;
  }
}
