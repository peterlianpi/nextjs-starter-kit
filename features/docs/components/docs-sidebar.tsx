"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DocCategory } from "@/features/docs/lib/docs-data";

export type SidebarGroup = {
  category: DocCategory;
  pages: Array<{ slug: string; title: string }>;
};

/**
 * Docs navigation sidebar. Client component only for active-link
 * highlighting via the current pathname.
 */
export function DocsSidebar({
  groups,
  className,
}: {
  groups: SidebarGroup[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className={cn("flex flex-col gap-6", className)}>
      {groups.map((group) => (
        <div key={group.category}>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.category}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.pages.map((page) => {
              const href = `/docs/${page.slug}`;
              const active = pathname === href;
              return (
                <li key={page.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-2 text-sm transition-colors lg:py-1.5",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
