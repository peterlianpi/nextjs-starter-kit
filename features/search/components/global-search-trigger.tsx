"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Compact global-search entry point for surfaces outside the protected
 * app shell (e.g. docs sidebar). Submitting navigates to /search?q=…
 */
export function GlobalSearchTrigger({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  return (
    <form
      role="search"
      className={cn("flex", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim().length >= 2) {
          router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        }
      }}
    >
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search…"
          aria-label="Search"
          autoComplete="off"
          className="h-11 pl-9 text-base sm:h-9 sm:text-sm"
        />
      </div>
    </form>
  );
}
