"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/hono-client";

// ============================================
// TIMELINE HOOK (Unit 16.8)
// ============================================
// Page-paginated activity feed backed by GET /api/timeline
// (AuditLog entries + SystemMetric events, admin-gated).

export interface TimelineItem {
  id: string;
  kind: "audit" | "metric";
  title: string;
  description?: string;
  user?: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}

export type TimelineFilter = "all" | "audit" | "metric";

export const TIMELINE_PAGE_SIZE = 20;

export const timelineKeys = {
  all: ["timeline"] as const,
  page: (page: number, filter: TimelineFilter) =>
    [...timelineKeys.all, page, filter] as const,
};

interface TimelineResponse {
  success: boolean;
  data?: { items: TimelineItem[]; page: number; limit: number; hasMore: boolean };
  error?: { code: string; message: string };
}

async function fetchTimeline(page: number, filter: TimelineFilter) {
  const res = await client.api.timeline.$get({
    query: {
      page: String(page),
      limit: String(TIMELINE_PAGE_SIZE),
      filter,
    },
  });
  if (!res.ok) {
    let message = "Failed to load timeline";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }
  const body = (await res.json()) as TimelineResponse;
  if (!body.success || !body.data) {
    throw new Error("Unexpected timeline response");
  }
  return body.data;
}

/**
 * Paginated activity timeline. Pass `filter` to narrow to
 * audit entries ("audit") or service metrics ("metric").
 */
export function useTimeline(options?: {
  page?: number;
  filter?: TimelineFilter;
}) {
  const page = options?.page ?? 1;
  const filter = options?.filter ?? "all";

  const query = useQuery({
    queryKey: timelineKeys.page(page, filter),
    queryFn: () => fetchTimeline(page, filter),
    placeholderData: keepPreviousData,
  });

  return {
    items: query.data?.items ?? [],
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error:
      query.error instanceof Error ? query.error.message : null,
  };
}
