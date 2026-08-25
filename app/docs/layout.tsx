import type { ReactNode } from "react";
import { getDocsByCategory, docPages } from "@/features/docs/lib/docs-data";
import { DocsSidebar } from "@/features/docs/components/docs-sidebar";
import { DocsTocMobile, DocsTocRail } from "@/features/docs/components/docs-toc";
import { DocsSearch } from "@/features/docs/components/docs-search";

/**
 * Docs shell: sidebar (sticky desktop / collapsible <details> mobile) +
 * search + sticky TOC right rail. No heavy dependency — plain disclosure.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  const groups = getDocsByCategory().map((g) => ({
    category: g.category,
    pages: g.pages.map((p) => ({ slug: p.slug, title: p.title })),
  }));
  const searchable = docPages.map(({ slug, title, description }) => ({
    slug,
    title,
    description,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Mobile: collapsible nav with search */}
      <details className="mb-6 lg:hidden">
        <summary className="inline-flex min-h-[44px] cursor-pointer select-none items-center rounded-md border border-border px-4 py-2 text-sm font-medium">
          Documentation menu
        </summary>
        <div className="mt-3 rounded-md border border-border bg-card p-4">
          <DocsSearch docs={searchable} variant="nav" />
          <div className="mt-3">
            <DocsSidebar groups={groups} />
          </div>
        </div>
      </details>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 xl:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
            <DocsSearch docs={searchable} variant="nav" />
            <DocsSidebar groups={groups} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <DocsTocMobile />
          {children}
        </main>

        {/* Desktop TOC right rail */}
        <DocsTocRail />
      </div>
    </div>
  );
}
