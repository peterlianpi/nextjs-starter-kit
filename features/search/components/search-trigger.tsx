"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchTriggerProps {
  className?: string;
}

/**
 * Header icon button that navigates to the /search page.
 */
export function SearchTrigger({ className }: SearchTriggerProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label="Search"
      className={className}
    >
      <Link href="/search">
        <Search className="h-5 w-5" />
      </Link>
    </Button>
  );
}
