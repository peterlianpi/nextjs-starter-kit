import { themeIds } from "@/lib/site";

const STORAGE_KEY = "theme-preset";
const DEFAULT_PRESET = "default";

function isKnownTheme(id: string): boolean {
  return (themeIds as readonly string[]).includes(id);
}

/**
 * Applies a named theme preset via the `data-theme` attribute on <html>.
 * The "default" preset clears the attribute so :root/.dark tokens apply.
 */
export function applyThemePreset(id: string): void {
  if (!isKnownTheme(id)) return;
  const html = document.documentElement;
  if (id === DEFAULT_PRESET) {
    delete html.dataset.theme;
  } else {
    html.dataset.theme = id;
  }
}

/**
 * Reads the stored preset, falling back to "default" on unknown values
 * (spec: unknown stored values fall back to system default).
 */
export function getStoredThemePreset(): string {
  if (typeof window === "undefined") return DEFAULT_PRESET;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && isKnownTheme(stored) ? stored : DEFAULT_PRESET;
  } catch {
    return DEFAULT_PRESET;
  }
}

export function storeThemePreset(id: string): void {
  if (!isKnownTheme(id)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage unavailable — in-memory only for this session
  }
}
