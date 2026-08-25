"use client";

import * as React from "react";
import { BellOff, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  type AppNotification,
} from "@/features/notifications/lib/use-notifications";
import { NotificationItem } from "@/features/notifications/components/notification-item";

// ============================================
// NOTIFICATIONS LIST (Unit 16.3)
// ============================================
// Dropdown body: cursor-paginated notifications with
// unread dot, type icon, time-ago, click-to-mark-read,
// mark-all-read, load-more, empty state.

interface NotificationsListProps {
  onNavigate?: () => void;
}

export function NotificationsList({ onNavigate }: NotificationsListProps) {
  const {
    notifications,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    markRead,
    markAllRead,
  } = useNotifications();

  const hasUnread = notifications.some((n) => !n.read);

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    onNavigate?.();
  };

  return (
    <div className="w-[calc(100vw-2rem)] max-w-sm sm:w-96" role="region" aria-label="Notifications">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Notifications</p>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 gap-1.5 text-xs text-muted-foreground"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          <CheckCheck className="size-3.5" aria-hidden />
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : error ? (
        <p className="p-4 text-sm text-muted-foreground">{error}</p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <BellOff className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs text-muted-foreground">
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-80">
          <ul className="divide-y">
            {notifications.map((n) => (
              <li key={n.id}>
                <NotificationItem notification={n} onClick={handleItemClick} />
              </li>
            ))}
          </ul>
          {hasNextPage && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full min-h-11 text-xs text-muted-foreground"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage && (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                )}
                Load more
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
