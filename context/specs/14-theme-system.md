# Unit 14: Theme System

## Goal

Extend the current light/dark setup into a multi-theme system (e.g. sepia,
nord, rose-pine) driven by a `data-theme` attribute, with a swatch-picker
dropdown and per-user persistence in `UserPreferences.theme`.

## Recommended Library

- `next-themes` **^0.4.6** (already installed)

**Compat notes / RISK:** next-themes toggles the `.dark` class for dark mode.
The migration must **keep `.dark` class behavior backward-compatible** while
adding `data-theme="..."` attribute switching. This is the highest-risk unit
in the batch — every page must be tested in both light and dark modes plus
each named theme.

## Files touched

- `app/globals.css` — token sets per theme: `[data-theme="sepia"]`,
  `[data-theme="nord"]`, `[data-theme="rose-pine"]`, etc., overriding the
  existing CSS variables (background, foreground, primary, accent, border…).
  Keep default light + `.dark` untouched as baseline.
- `lib/site.ts` — themes config array (id, label, swatch colors) — single source of truth
- Theme toggle upgrade → dropdown with swatches (`components/theme-toggle.tsx` or feature location per existing structure)
- Appearance settings surface (protected settings page or dropdown-only) persisting choice
- `UserPreferences.theme` — string field write/read via existing preferences service/action

## DB impact

- **No migration.** `UserPreferences.theme` already exists as a string field.
  Store the theme id (`"sepia" | "nord" | "rose-pine" | ...`); empty/null = follow system default.

## Behavior

1. On load: localStorage (next-themes) wins for instant paint; logged-in users' saved preference syncs on hydration and on explicit change.
2. Changing theme updates `data-theme` on `<html>` and, if authenticated, persists to `UserPreferences.theme` via Server Action (Zod validated).
3. Unknown stored values fall back to system default — validate against `lib/site.ts` theme ids.

## Risks

- Dark mode regression: any component hardcoding `dark:` variants may clash with named themes — audit during implementation.
- Flash of wrong theme (FOUC) if `data-theme` isn't set by next-themes' injected script — configure `attribute={["class", "data-theme"]}`.
- Both modes must be visually verified per theme.

## Done when

- [ ] At least three named themes selectable alongside light/dark/system
- [ ] `.dark` class dark mode still works exactly as before (backward compat verified)
- [ ] Toggle dropdown shows labeled swatches sourced from `lib/site.ts`
- [ ] Logged-in users' theme persists to `UserPreferences.theme` and restores on login
- [ ] Anonymous users' theme persists via localStorage only
- [ ] No FOUC on reload; SSR HTML carries correct attributes
- [ ] All existing pages checked in light, dark, and each named theme
- [ ] `bun run lint` and `bun run build` pass

## Size

**M**
