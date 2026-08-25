"use client";

import * as React from "react";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/features/notifications/lib/use-notifications";

// ============================================
// NOTIFICATION ITEM (Unit 16.3)
// ============================================
// Reusable single-notification row: type icon, unread dot,
// time-ago, click-to-mark-read. Used by the bell dropdown
// list and the full /notifications page.

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function NotificationTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  switch (type) {
    case "warning":
    case "alert":
      return (
        <AlertTriangle
          aria-hidden
          className={cn("size-4 shrink-0 text-muted-foreground", className)}
        />
      );
    case "info":
      return (
        <Info
          aria-hidden
          className={cn("size-4 shrink-0 text-muted-foreground", className)}
        />
      );
    default:
      // "system" and any unknown types fall back to the bell glyph
      return (
        <Bell
          aria-hidden
          className={cn("size-4 shrink-0 text-muted-foreground", className)}
        />
      );
  }
}

interface NotificationItemProps {
  notification: AppNotification;
  onClick?: (notification: AppNotification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { read } = notification;

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      aria-label={`${notification.title}${read ? "" : " (unread)"}`}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
        !read && "bg-muted/40",
      )}
    >
      <span className="relative mt-0.5">
        <NotificationTypeIcon type={notification.type} />
        {!read && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 size-2 rounded-full bg-primary"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {notification.title}
        </span>
        <span className="line-clamp-2 block text-xs text-muted-foreground">
          {notification.description}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}
