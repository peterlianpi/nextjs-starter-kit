"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "@/lib/api/hono-client";

// ============================================
// NOTIFICATIONS HOOK (Unit 16.3)
// ============================================
// Paginated list (cursor-based infinite query, optional
// type filter), unread count query, and mark-read /
// mark-all-read mutations with cache invalidation.

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export const NOTIFICATION_PAGE_SIZE = 20;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  filtered: (type: string) => [...notificationKeys.list(), type] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

interface NotificationsResponse {
  success: boolean;
  data?: { notifications: AppNotification[]; nextCursor?: string | null };
  error?: { code: string; message: string };
}

interface UnreadCountResponse {
  success: boolean;
  data?: { count: number };
  error?: { code: string; message: string };
}

async function parseError(res: Response, fallback: string): Promise<never> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message || fallback);
  } catch {
    throw new Error(fallback);
  }
}

async function fetchPage(cursor: string | undefined, type?: string) {
  const res = await client.api.notifications.$get({
    query: {
      limit: String(NOTIFICATION_PAGE_SIZE),
      ...(cursor ? { cursor } : {}),
      ...(type ? { type } : {}),
    },
  });
  if (!res.ok) await parseError(res, "Failed to load notifications");
  const body = (await res.json()) as NotificationsResponse;
  if (!body.success || !body.data) {
    throw new Error("Unexpected notifications response");
  }
  return {
    items: body.data.notifications,
    nextCursor: body.data.nextCursor ?? null,
  };
}

/**
 * Paginated notification feed. Pass a `type` to filter by
 * notification type ("info" | "warning" | "system" | ...);
 * pass undefined for all.
 */
export function useNotifications(options?: {
  type?: string;
  enabled?: boolean;
}) {
  const { type = "all", enabled = true } = options ?? {};
  const queryClient = useQueryClient();

  const filterType = type === "all" ? undefined : type;

  const listQuery = useInfiniteQuery({
    queryKey: notificationKeys.filtered(type),
    enabled,
    refetchOnWindowFocus: true,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => fetchPage(pageParam, filterType),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const unreadQuery = useQuery({
    queryKey: notificationKeys.unreadCount(),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await client.api.notifications["unread-count"].$get();
      if (!res.ok) await parseError(res, "Failed to load unread count");
      const body = (await res.json()) as UnreadCountResponse;
      if (!body.success || !body.data) {
        throw new Error("Unexpected unread count response");
      }
      return body.data.count;
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: notificationKeys.all,
    });
  };

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.notifications[":id"]["read"].$post({
        param: { id },
      });
      if (!res.ok) await parseError(res, "Failed to mark notification read");
      return (await res.json()) as { success: boolean };
    },
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await client.api.notifications["read-all"].$post({});
      if (!res.ok) await parseError(res, "Failed to mark all read");
      return (await res.json()) as { success: boolean; data?: { updatedCount: number } };
    },
    onSuccess: invalidate,
  });

  const notifications =
    listQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    notifications,
    unreadCount: unreadQuery.data ?? 0,
    isLoading: listQuery.isLoading || unreadQuery.isLoading,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    hasNextPage: listQuery.hasNextPage,
    fetchNextPage: listQuery.fetchNextPage,
    error:
      listQuery.error instanceof Error
        ? listQuery.error.message
        : unreadQuery.error instanceof Error
          ? unreadQuery.error.message
          : null,
    markRead,
    markAllRead,
  };
}
