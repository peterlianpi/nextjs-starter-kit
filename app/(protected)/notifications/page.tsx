"use client";

import * as React from "react";
import { BellOff, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  type AppNotification,
} from "@/features/notifications/lib/use-notifications";
import {
  NotificationItem,
  NotificationTypeIcon,
} from "@/features/notifications/components/notification-item";

// ============================================
// NOTIFICATIONS PAGE (Unit 16.3)
// ============================================
// Full-page notification feed: type filter pills,
// cursor-paginated list (Load more), mark-all-read.
// Mobile-first: single column → two columns on lg.

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "system", label: "System" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warnings" },
  { value: "alert", label: "Alerts" },
];

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = React.useState("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    markRead,
    markAllRead,
  } = useNotifications({ type: typeFilter });

  const hasUnread = notifications.some((n) => !n.read);

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 p-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay on top of what&apos;s happening in your workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" aria-live="polite">
              {unreadCount} unread
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 gap-1.5"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-4" aria-hidden />
            Mark all read
          </Button>
        </div>
      </div>

      {/* Type filter pills */}
      <div
        role="tablist"
        aria-label="Filter notifications by type"
        className="flex flex-wrap items-center gap-2"
      >
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            role="tab"
            aria-selected={typeFilter === filter.value}
            variant={typeFilter === filter.value ? "default" : "outline"}
            size="sm"
            className="min-h-9 gap-1.5"
            onClick={() => setTypeFilter(filter.value)}
          >
            {filter.value !== "all" && (
              <NotificationTypeIcon
                type={filter.value}
                className={cn(
                  "size-3.5",
                  typeFilter === filter.value &&
                    "text-primary-foreground",
                )}
              />
            )}
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          {error}
        </p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-14 text-center">
          <BellOff className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs text-muted-foreground">
            {typeFilter === "all"
              ? "You're all caught up."
              : `No ${typeFilter} notifications.`}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-3 lg:grid-cols-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/40"
              >
                <NotificationItem notification={n} onClick={handleItemClick} />
              </li>
            ))}
          </ul>

          {hasNextPage && (
            <div className="flex justify-center pb-4">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 gap-1.5"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
