# Unit 11: Print Support

## Goal

Make key pages (blog posts first) print cleanly: navigation, sidebars, and UI
chrome are hidden, content prints in forced light mode, and long documents
break across pages without cutting elements.

## Recommended Library

- **Primary approach: pure CSS `@media print` rules** — zero JS cost.
- `react-to-print` **^3.3.0** is *optional*, only if a dedicated
  "print this section" button targeting a specific subtree is needed.
  Prefer `window.print()` behind a small client component otherwise.

**Compat notes:** react-to-print v3 requires React ≥16.8 and forwards refs —
compatible with React 19. Skip it unless needed.

## Files touched

- `features/print/components/print-button.tsx` — client component calling `window.print()` (or react-to-print wrapper)
- `app/globals.css` — `@media print` block:
  - hide `nav`, sidebar, header/footer, share buttons, theme toggle
  - force light color tokens (print always uses light palette regardless of active `data-theme`)
  - `break-inside: avoid` on cards/images/code blocks; sensible `page-break` rules for headings
  - expand link URLs after anchor text (`a[href^="http"]::after`)
- Blog post layout — add `<PrintButton />` alongside social share (Unit 12 integration point)

## DB impact

None.

## Risks

- Low. Pure CSS. Main risk is forgetting to hide newly added UI chrome later — keep the hide-list centralized in one `@media print` block.

## Done when

- [ ] Printing `/blog/[slug]` shows only article content, title, and metadata
- [ ] Nav, sidebar, footer, share buttons, and theme controls are excluded from print output
- [ ] Printed output uses light-mode tokens even when dark theme is active
- [ ] Code blocks, tables, and images do not split awkwardly across pages
- [ ] Print button triggers the browser print dialog and is itself hidden in print output
- [ ] `bun run lint` and `bun run build` pass
- [ ] Verified via browser print preview in both themes

## Size

**S**
