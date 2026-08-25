"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  SearchBar,
  SearchEmptyHint,
  SearchResults,
} from "@/features/search/components/search-bar";
import {
  useSearch,
  type SearchEntityTypeFilter,
} from "@/features/search/hooks/use-search";

// ============================================
// SEARCH PAGE (Unit 16.4)
// ============================================
// Debounced full-text search across posts, users,
// and audit logs with type filter chips, grouped
// results, and pagination.

const VALID_TYPES: SearchEntityTypeFilter[] = ["post", "user", "auditlog"];

function readTypeParam(raw: string | null): SearchEntityTypeFilter {
  return VALID_TYPES.includes(raw as SearchEntityTypeFilter)
    ? (raw as SearchEntityTypeFilter)
    : "";
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(() => searchParams.get("q") ?? "");
  const [typeFilter, setTypeFilter] = React.useState<SearchEntityTypeFilter>(() =>
    readTypeParam(searchParams.get("type")),
  );
  const [page, setPage] = React.useState(
    () => Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  // Reset to page 1 whenever the query or filter changes
  React.useEffect(() => {
    setPage(1);
  }, [query, typeFilter]);

  const { data, isLoading, isFetching } = useSearch({
    query,
    entityType: typeFilter,
    page,
    limit: 10,
  });

  const results = data?.results ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Find posts, users, and audit log entries
        </p>
      </div>

      {/* Input + filter chips */}
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        loading={isFetching}
      />

      {/* Results */}
      {query.trim().length < 2 ? (
        <SearchEmptyHint />
      ) : (
        <SearchResults
          results={results}
          total={data?.total ?? 0}
          page={data?.page ?? page}
          totalPages={data?.totalPages ?? 0}
          query={query}
          loading={isLoading}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      )}

    </div>
  );
}
