# UI Context — Next.js Starter Kit

## Theme

Light + dark mode via `next-themes` (`.dark` class variant). Default light; dark is a first-class theme. Both must be tested after UI changes.

## Colors

All colors are CSS custom properties defined in `app/globals.css` and mapped in `@theme inline` (`--color-*`). Use tokens only — no hardcoded hex/oklch in components.

| Role | Variable |
|------|----------|
| Page background | `--background` |
| Foreground text | `--foreground` |
| Primary / brand | `--primary`, `--primary-foreground` |
| Secondary | `--secondary`, `--secondary-foreground` |
| Muted text | `--muted-foreground` |
| Card / surface | `--card`, `--card-foreground` |
| Popover | `--popover`, `--popover-foreground` |
| Border | `--border` |
| Input | `--input` |
| Ring / focus | `--ring` |
| Destructive / error | `--destructive` |
| Chart series | `--chart-1` … `--chart-5` |
| Sidebar | `--sidebar`, `--sidebar-*` |

## Typography

| Role | Font | Variable |
|------|------|----------|
| UI text | Geist Sans (via `next/font`) | `--font-sans` |
| Code / mono | Geist Mono | `--font-mono` |

## Border Radius

| Context | Class |
|---------|-------|
| Inline / small UI | `rounded-sm`, `rounded-md` |
| Cards / panels | `rounded-lg` |
| Modals / overlays | `rounded-xl` |

Base `--radius: 0.625rem`; scale derived in `@theme inline` (`--radius-*`).

## Component Library

shadcn/ui on top of Tailwind v4. Components live in `components/ui/` — use the shadcn CLI to add new ones, do not hand-write primitives. Feature-specific UI goes in `features/<feature>/components/`. Use `cn()` from `lib/utils.ts` for class merging.

## Layout Patterns

- **App shell**: sidebar navigation (shadcn `sidebar`) + top bar, composed in `app/providers.tsx`
- **Landing**: `app/page.tsx` (marketing/landing)
- **Protected area**: `(protected)/` route group — dashboard, admin, settings
- **Auth pages**: centered card layouts (`/login`, `/signup`, etc.)
- **Mobile-first**: Tailwind breakpoints; sidebar collapses on small screens

## Feature UI

- **Nav** (`features/nav/`): app sidebar built on shadcn `sidebar` primitives — `app-sidebar.tsx` plus `nav-main.tsx`, `nav-user.tsx`, `nav-projects.tsx`, `team-switcher.tsx`, `admin-switch.tsx`; theme toggle in `theme-toggle.tsx`. Uses the `--sidebar-*` color tokens.
- **Org switcher** (`team-switcher.tsx`): functional dropdown fed by `use-orgs.ts` (GET/POST `/api/orgs`); shows role badge per org (Owner/Admin/Member), persists active org id to localStorage, offers create-org dialog when empty.
- **Role-aware sidebar**: `app-sidebar.tsx` gates nav items by session role (ADMIN/SUPER_ADMIN → admin section, EDITOR → posts); `nav-user.tsx` shows a role `Badge`. Client-side gating is convenience only — routes keep server-side checks.
- **Notification bell** (`features/notifications/components/notification-bell.tsx`): sidebar popover with unread count badge, mark-read/mark-all-read; links to `/notifications`.
- **Timeline** (`features/timeline/`): activity/history views rendered with card/list layouts using standard surface tokens (`--card`, `--muted`) and Lucide icons.
- **Docs** (`features/docs/`): in-app docs at `/docs` — categorized card-grid index, sticky desktop sidebar + mobile `<details>` collapsible nav (`components/docs-sidebar.tsx`), server-rendered structured content (`components/docs-content.tsx`) reusing `.prose-post` styles.
- **Search** (`features/search/`): `/search` page — debounced input (300ms), entity-type filter tabs, grouped results with pagination; token-only styling.
- **Notifications** (`features/notifications/`): sidebar bell popover with unread badge, mobile Drawer bell variant, notification list with load-more; mark-read via TanStack Query mutations.

## Icons

Lucide React. Stroke-based icons only. Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons.

## Accessibility

- All interactive elements keyboard accessible + screen reader friendly
- WCAG AA contrast minimum for text in both themes
- Focus visible states via `--ring`

## Skills

When building UI, prefer: `ui-ux-pro-max`, `brand`, `design-system`, `ui-styling`, `shadcn`, `web-design-guidelines`.

Persist chosen tokens in this file.