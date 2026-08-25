"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export type SearchableDoc = {
  slug: string;
  title: string;
  description: string;
};

/**
 * Client-side filter over doc titles/descriptions.
 * - `variant="nav"` (default): compact list of matching links for the sidebar.
 *   Renders nothing until the user types.
 * - `variant="page"`: search box + result cards; hides results when the
 *   query is empty so the static grid below remains the default view.
 */
export function DocsSearch({
  docs,
  variant = "nav",
}: {
  docs: SearchableDoc[];
  variant?: "nav" | "page";
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [docs, query]);

  if (variant === "page") {
    return (
      <div className="mb-8">
        <label htmlFor="docs-search" className="sr-only">
          Search documentation
        </label>
        <Input
          id="docs-search"
          type="search"
          placeholder="Search documentation…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 max-w-md sm:h-10"
          autoComplete="off"
        />
        {query.trim() !== "" && (
          <div className="mt-4" role="region" aria-live="polite">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pages match “{query}”.
              </p>
            ) : (
              <ul className="space-y-2">
                {results.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/docs/${d.slug}`}
                      className="block rounded-md border border-border p-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
                    >
                      <span className="font-medium">{d.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground line-clamp-2">
                        {d.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  // nav variant — only shows matches while typing
  if (query.trim() === "") return null;
  return (
    <div className="mt-3">
      {results.length > 0 ? (
        <ul className="space-y-1">
          {results.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/docs/${d.slug}`}
                className="block min-h-[44px] rounded px-2 py-2 text-sm transition-colors hover:bg-accent lg:min-h-0 lg:py-1.5"
              >
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 py-1.5 text-sm text-muted-foreground">
          No matches.
        </p>
      )}
    </div>
  );
}
