"use client";

import Link from "next/link";
import { FileText, ScrollText, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type {
  SearchEntityTypeFilter,
  SearchResult,
} from "@/features/search/hooks/use-search";
import { cn } from "@/lib/utils";

const TYPE_FILTERS: { value: SearchEntityTypeFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "post", label: "Posts" },
  { value: "user", label: "Users" },
  { value: "auditlog", label: "Audit Logs" },
];

const ENTITY_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  post: { label: "Post", icon: FileText },
  user: { label: "User", icon: User },
  auditlog: { label: "Audit Log", icon: ScrollText },
};

const MIN_QUERY_LENGTH = 2;

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: SearchEntityTypeFilter;
  onTypeFilterChange: (value: SearchEntityTypeFilter) => void;
  loading: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  loading,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search posts, users, audit logs…"
          aria-label="Search"
          autoComplete="off"
          className="h-11 pl-9 text-base sm:h-10 sm:text-sm"
        />
      </div>

      {/* Type filter chips — wrap on mobile, min 44px touch targets */}
      <div
        role="group"
        aria-label="Filter by type"
        className="flex flex-wrap gap-2"
      >
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => onTypeFilterChange(f.value)}
            aria-pressed={typeFilter === f.value}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              typeFilter === f.value
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background text-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <p role="status" className="sr-only">
          Searching…
        </p>
      )}
    </div>
  );
}

function ResultRow({ item }: { item: SearchResult }) {
  const meta = ENTITY_META[item.entityType];
  const Icon = meta?.icon ?? FileText;

  const content = (
    <div className="flex items-start gap-3 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {item.description}
        </p>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {meta?.label ?? item.entityType}
      </Badge>
    </div>
  );

  if (item.url) {
    return (
      <Link
        href={item.url}
        className="block rounded-lg border transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/20">{content}</div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="mb-2 h-5 w-2/3" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      ))}
    </div>
  );
}

export function groupResults(results: SearchResult[]) {
  const groups = new Map<string, SearchResult[]>();
  for (const item of results) {
    const list = groups.get(item.entityType) ?? [];
    list.push(item);
    groups.set(item.entityType, list);
  }
  return Array.from(groups.entries());
}

interface SearchResultsPanelProps {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  loading: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function SearchResults({
  results,
  total,
  page,
  totalPages,
  query,
  loading,
  isFetching,
  onPageChange,
}: SearchResultsPanelProps) {
  if (loading || (isFetching && results.length === 0)) {
    return <ResultsSkeleton />;
  }

  if (query.trim().length < MIN_QUERY_LENGTH) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No results for “{query.trim()}”
      </div>
    );
  }

  const groups = groupResults(results);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground" role="status">
        {total} result{total === 1 ? "" : "s"}
      </p>

      {groups.map(([entityType, items]) => {
        const meta = ENTITY_META[entityType];
        return (
          <section key={entityType} aria-labelledby={`group-${entityType}`}>
            <h3
              id={`group-${entityType}`}
              className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {meta?.icon && <meta.icon className="h-4 w-4" />}
              {meta?.label ?? entityType}
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <ResultRow key={`${item.entityType}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      {totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
                aria-disabled={page <= 1}
                className={cn(
                  "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                  "min-h-11 px-4",
                )}
              />
            </PaginationItem>
            <PaginationItem className="flex min-h-11 items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
                aria-disabled={page >= totalPages}
                className={cn(
                  "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                  "min-h-11 px-4",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export function SearchEmptyHint() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <Search className="mx-auto mb-3 h-8 w-8 opacity-50" />
      <p>Type at least {MIN_QUERY_LENGTH} characters to search.</p>
      <p className="text-sm">Search covers posts, users, and audit logs.</p>
    </div>
  );
}
