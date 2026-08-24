"use client";

import { EditorContent } from "@tiptap/react";

import { usePostEditor } from "../hooks/use-editor";
import { Toolbar } from "./toolbar";

interface TiptapEditorProps {
  initialContent?: string | null;
  placeholder?: string;
  onChange?: (json: unknown) => void;
}

/**
 * Client-only TipTap editor shell: toolbar + editable surface.
 * Import via `next/dynamic` with `{ ssr: false }` — TipTap touches
 * the DOM on mount and cannot render on the server.
 */
export default function TiptapEditor({ initialContent, placeholder, onChange }: TiptapEditorProps) {
  const editor = usePostEditor({
    initialContent,
    placeholder,
    onUpdate: (json) => onChange?.(json),
  });

  return (
    <div className="rounded-md">
      <Toolbar editor={editor} />
      <div className="rounded-b-md border border-t-0 border-input">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
