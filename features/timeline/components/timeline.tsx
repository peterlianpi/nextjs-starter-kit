"use client";

import {
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  user?: string;
  type?: "info" | "success" | "warning" | "error";
}

interface TimelineProps {
  items: TimelineItem[];
  loading?: boolean;
  className?: string;
}

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  info: { icon: Clock, color: "text-blue-500" },
  success: { icon: CheckCircle2, color: "text-green-500" },
  warning: { icon: AlertCircle, color: "text-yellow-500" },
  error: { icon: XCircle, color: "text-red-500" },
};

export function Timeline({ items, loading, className }: TimelineProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse bg-muted rounded" />
              <div className="h-3 w-64 animate-pulse bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <FileText className="h-8 w-8 mx-auto mb-2" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => {
        const config = typeConfig[item.type || "info"];
        const Icon = config.icon;
        const timestamp = new Date(item.timestamp);

        return (
          <div key={item.id} className="flex gap-4">
            <div className="relative">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                  config.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {index < items.length - 1 && (
                <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{item.title}</p>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {timestamp.toLocaleDateString()}{" "}
                  {timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
              {item.user && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {item.user}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
