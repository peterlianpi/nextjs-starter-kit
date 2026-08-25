import type { ReactNode } from "react";
import { getDocsByCategory } from "@/features/docs/lib/docs-data";
import { DocsSidebar } from "@/features/docs/components/docs-sidebar";

/**
 * Docs shell: sticky sidebar on desktop, collapsible <details> on mobile.
 * No heavy dependency — plain disclosure element.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  const groups = getDocsByCategory().map((g) => ({
    category: g.category,
    pages: g.pages.map((p) => ({ slug: p.slug, title: p.title })),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Mobile: collapsible nav */}
      <details className="mb-6 lg:hidden">
        <summary className="inline-flex cursor-pointer select-none items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium">
          Documentation menu
        </summary>
        <div className="mt-3 rounded-md border border-border bg-card p-4">
          <DocsSidebar groups={groups} />
        </div>
      </details>

      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
            <DocsSidebar groups={groups} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
