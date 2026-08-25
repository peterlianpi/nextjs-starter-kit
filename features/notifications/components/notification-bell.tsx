"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/features/notifications/lib/use-notifications";
import { NotificationsList } from "@/features/notifications/components/notifications-list";

// ============================================
// NOTIFICATION BELL (Unit 16.3)
// ============================================
// Sidebar-header bell with unread badge. Opens a Drawer
// (vaul) on mobile, a Popover on desktop. Unread count
// refetches on window focus + every 60s.

function BellButton({ unreadCount }: { unreadCount: number }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      className="relative size-11 shrink-0"
    >
      <Bell className="size-5" aria-hidden />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center",
            "rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white",
            unreadCount > 99 && "text-[9px]",
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );
}

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const { isMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <BellButton unreadCount={unreadCount} />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>Your recent notifications</DrawerDescription>
          </DrawerHeader>
          <div className="pb-4">
            <NotificationsList onNavigate={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <BellButton unreadCount={unreadCount} />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="p-0">
        <NotificationsList onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
