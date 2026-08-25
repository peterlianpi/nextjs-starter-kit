"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Client table of contents. Scans the rendered `main` for h2/h3 so it
 * works without plumbing props through the layout.
 *
 * Two placements:
 * - `DocsTocMobile` — collapsible <details>, shown below xl.
 * - `DocsTocRail`   — sticky right rail, xl and up.
 */
function useDocHeadings() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const els = Array.from(main.querySelectorAll("h2[id], h3[id]"));
    // Defer state update out of the effect body (react-hooks/set-state-in-effect)
    const raf = requestAnimationFrame(() => {
      setHeadings(
        els.map((el) => ({
          id: el.id,
          text: el.textContent ?? "",
          level: el.tagName === "H2" ? 2 : 3,
        })),
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [pathname]);

  return { headings, activeId };
}

function HeadingList({
  headings,
  activeId,
}: {
  headings: Heading[];
  activeId: string | null;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {headings.map((h) => (
        <li key={h.id} className={cn(h.level === 3 && "pl-4")}>
          <a
            href={`#${h.id}`}
            className={cn(
              "inline-block py-1.5 transition-colors hover:text-foreground xl:py-1",
              activeId === h.id
                ? "font-medium text-primary"
                : "text-muted-foreground",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DocsTocMobile() {
  const { headings, activeId } = useDocHeadings();
  if (headings.length === 0) return null;
  return (
    <details className="mb-6 rounded-md border border-border bg-card p-3 xl:hidden">
      <summary className="flex min-h-[44px] cursor-pointer select-none items-center text-sm font-medium">
        On this page
      </summary>
      <div className="mt-2">
        <HeadingList headings={headings} activeId={activeId} />
      </div>
    </details>
  );
}

export function DocsTocRail() {
  const { headings, activeId } = useDocHeadings();
  if (headings.length === 0) return null;
  return (
    <aside
      className="hidden w-52 shrink-0 xl:block"
      aria-label="Table of contents"
    >
      <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <HeadingList headings={headings} activeId={activeId} />
      </nav>
    </aside>
  );
}
