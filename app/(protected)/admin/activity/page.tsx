"use client";

import * as React from "react";
import { History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/features/timeline/components/timeline";
import {
  useTimeline,
  type TimelineFilter,
} from "@/features/timeline/lib/use-timeline";

// ============================================
// ACTIVITY TIMELINE PAGE (Unit 16.8)
// ============================================
// Admin-only aggregated activity feed: audit-log
// entries + system-metric events. Filter tabs +
// page pagination via /api/timeline.

const FILTERS: { value: TimelineFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "audit", label: "User activity" },
  { value: "metric", label: "Service health" },
];

export default function ActivityTimelinePage() {
  const [filter, setFilter] = React.useState<TimelineFilter>("all");
  const [page, setPage] = React.useState(1);

  const { items, hasMore, isLoading, isFetching, error } = useTimeline({
    page,
    filter,
  });

  // Reset to first page when the filter changes
  const handleFilterChange = (next: TimelineFilter) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Timeline</h1>
        <p className="text-muted-foreground">
          Recent user actions and service health events across the platform
        </p>
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter timeline by event source"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            className="min-h-11"
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Feed */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 overflow-hidden">
        {error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : (
          <Timeline items={items} loading={isLoading} />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between gap-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 gap-1.5"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            Page {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 gap-1.5"
            disabled={!hasMore || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            Next
          </Button>
        </div>
      )}

      {/* Empty state hint when no data at all */}
      {!isLoading && !error && items.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-10 text-center">
          <History className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No activity recorded yet</p>
          <p className="text-xs text-muted-foreground">
            Audit log entries and service health checks will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
