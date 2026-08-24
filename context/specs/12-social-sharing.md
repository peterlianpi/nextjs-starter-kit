# Unit 12: Social Sharing

## Goal

Add per-post social share buttons (X/Twitter, LinkedIn, Facebook, copy-link)
with a native `navigator.share()` fallback on supporting devices, backed by
correct Open Graph metadata on every blog post.

## Recommended Library

- `react-share` **^5.3.0**

**Compat notes:** react-share v5 supports React 18+; works with React 19.
If peer warnings appear under Bun, verify runtime behavior manually rather
than forcing overrides. Native sharing uses the standard Web Share API — no
extra dependency.

## Files touched

- `features/social/components/share-buttons.tsx` — icon buttons row (client component)
- `features/social/components/share-menu.tsx` — compact menu variant incl. native `navigator.share()` when available, clipboard copy fallback
- `app/blog/[slug]/page.tsx` — mount share buttons; ensure `generateMetadata` emits full OG + Twitter Card tags (title, description, url, image, type=article)
- Optional: `app/blog/[slug]/opengraph-image.tsx` using `next/og` for dynamic OG images
- `lib/site.ts` — reuse canonical URL helpers (no hardcoded URLs)

## DB impact

None.

## Risks

- Low. Metadata correctness is the main risk: shares look broken if OG image
  URL is relative instead of absolute — always resolve against the site URL
  from `lib/site.ts`.

## Done when

- [ ] Share buttons render on blog posts with correct absolute post URLs
- [ ] X, LinkedIn, Facebook intents open correct pre-filled share dialogs
- [ ] Mobile devices with Web Share API get native share sheet; desktop gets clipboard-copy fallback with feedback
- [ ] `generateMetadata` produces valid OG + Twitter tags (verified via view-source or opengraph.xyz)
- [ ] Buttons styled with project tokens via `cn()`, work in both themes, hidden in print output (Unit 11)
- [ ] `bun run lint` and `bun run build` pass

## Size

**S**
