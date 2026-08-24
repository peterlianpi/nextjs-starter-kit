import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { common, createLowlight } from "lowlight";

// ============================================
// LOWLIGHT (code syntax highlighting)
// ============================================
// Register only the common language set to keep the bundle lean.
const lowlight = createLowlight(common);

// ============================================
// SHARED EXTENSION LIST — SINGLE SOURCE OF TRUTH
// ============================================
// This exact list MUST be used both by the client editor AND by the
// server-side generateHTML renderer (`lib/render.ts`). If they drift,
// nodes silently disappear when rendering stored documents.
export function buildExtensions() {
  return [
    // StarterKit v3 includes Link + Underline; disable its codeBlock in
    // favor of the lowlight variant configured below.
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    Typography,
    Highlight,
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}

/**
 * Editor-only extras (placeholder hint). Not needed for server rendering.
 */
export function editorOnlyExtensions(placeholder = "Write your post…") {
  return [Placeholder.configure({ placeholder })];
}

export type TiptapJSON = {
  type: "doc";
  content?: unknown[];
};
