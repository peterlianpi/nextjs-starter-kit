import { generateHTML as tiptapGenerateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";

import { buildExtensions, type TiptapJSON } from "./extensions";

// ============================================
// SERVER-SIDE RENDERING HELPER
// ============================================
// Renders stored TipTap doc JSON to HTML using the SAME extension list
// the client editor uses. Import this only in Server Components / route
// handlers — never in client bundle code.

export function renderPostContent(content: string | TiptapJSON): string {
  if (!content) return "";

  let doc: TiptapJSON;

  if (typeof content === "string") {
    // If content starts with '<' it's already HTML — return as-is
    if (content.trimStart().startsWith("<")) {
      return content;
    }
    try {
      doc = JSON.parse(content) as TiptapJSON;
    } catch {
      // Legacy plain-text content: render as a single paragraph.
      return `<p>${escapeHtml(content)}</p>`;
    }
  } else {
    doc = content;
  }

  if (!doc || doc.type !== "doc") {
    return "";
  }

  return tiptapGenerateHTML(doc as JSONContent, buildExtensions());
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
