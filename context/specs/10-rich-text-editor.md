# Unit 10: Rich Text Editor

## Goal

Replace plain-textarea post authoring in the admin panel with a TipTap-based
rich text editor that persists content as structured JSON in `Post.content`,
and render published posts server-side from the stored JSON.

## Recommended Library

- `@tiptap/react` **^3.30.3** + `@tiptap/starter-kit`
- Extensions: image, link, placeholder, typography, table,
  code-block-lowlight (`lowlight` dep), highlight

**Compat notes:**
- TipTap v3 targets React 19 — compatible with this project.
- Editor bundle adds ~200–400KB client-side. **Dynamic import with
  `ssr: false` is mandatory** for the editor component; never import it into
  a Server Component's module scope.
- Image insertion must route through `lib/services/upload.ts` (existing
  abstraction) — no direct provider calls from the editor.

## Files touched

- `features/editor/components/tiptap-editor.tsx` — client editor shell
- `features/editor/components/toolbar.tsx` — formatting toolbar (bold/italic/headings/lists/quote/code/link/image/table)
- `features/editor/components/editor-content.tsx` — read-only preview of stored JSON
- `features/editor/hooks/use-editor.ts` — editor instance + upload wiring hook
- `features/editor/lib/extensions.ts` — extension list, single source of truth
- Admin post new/edit pages (`app/(protected)/admin/posts/new`, `.../[id]/edit`) — swap textarea for dynamic-imported editor
- `app/blog/[slug]/page.tsx` — SSR render via `generateHTML()` from `@tiptap/html` (or equivalent v3 entry) using the same `extensions.ts` list
- Zod schema for post form accepts JSON content (`features/editor/schemas/` or co-located)

## DB impact

- None structurally. `Post.content` stores a JSON string (TipTap doc JSON).
- Seed posts should be updated to valid TipTap JSON so blog rendering works out of the box.

## Risks

- Bundle size regression on admin routes — verify with build output analysis.
- `generateHTML` on the server needs the exact same extension set as the
  client or rendering silently drops nodes — keep one shared `extensions.ts`.
- Lowlight language registration can bloat the bundle — register only common languages.

## Done when

- [ ] Editor loads in admin new/edit pages via `next/dynamic` with `ssr: false`
- [ ] Toolbar covers headings, bold/italic/strike, lists, blockquote, inline code, links, images, tables, highlights
- [ ] Image button uploads through `lib/services/upload.ts` and inserts the returned URL
- [ ] Content saves as TipTap JSON and round-trips edit → save → edit losslessly
- [ ] Blog `[slug]` page renders stored JSON server-side via `generateHTML()`
- [ ] Placeholder text shows on empty document
- [ ] No TypeScript errors; `bun run lint` passes; `bun run build` passes
- [ ] Works in light and dark themes

## Size

**L**
