"use client";

import * as React from "react";
import { LayoutDashboard, Settings2, BarChart3, Users, Image, FileText } from "lucide-react";
import { NavMain } from "@/features/nav/components/nav-main";
import { NavUser } from "@/features/nav/components/nav-user";
import { TeamSwitcher } from "@/features/nav/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";

const userNavMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "/settings",
      },
      {
        title: "Security",
        url: "/settings/change-password",
      },
    ],
  },
];

// Editor-level content management (EDITOR and above)
const editorNavItems = [
  {
    title: "Posts",
    url: "/admin/posts",
    icon: FileText,
    items: [] as { title: string; url: string }[],
  },
];

// Full admin surface (ADMIN / SUPER_ADMIN only)
const adminNavItems = [
  {
    title: "Admin Panel",
    url: "/admin",
    icon: BarChart3,
    isActive: false,
    items: [
      {
        title: "Overview",
        url: "/admin",
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
      },
      ...editorNavItems,
      {
        title: "Media Library",
        url: "/admin/media",
        icon: Image,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession();

  const role = session?.user?.role ?? null;

  const navMain = React.useMemo(() => {
    const items = [...userNavMain];

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      // Full admin surface (includes Posts)
      const settingsIndex = items.findIndex(
        (item) => item.title === "Settings",
      );
      if (settingsIndex >= 0) {
        items.splice(settingsIndex, 0, ...adminNavItems);
      } else {
        items.push(...adminNavItems);
      }
    } else if (role === "EDITOR") {
      // Editors get a Posts-only management group
      const settingsIndex = items.findIndex(
        (item) => item.title === "Settings",
      );
      if (settingsIndex >= 0) {
        items.splice(settingsIndex, 0, ...editorNavItems);
      } else {
        items.push(...editorNavItems);
      }
    }
    // USER / MODERATOR / signed-out: no admin or editor section

    return items;
  }, [role]);

  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "user@example.com",
        avatar: session.user.image || "",
      }
    : {
        name: "User",
        email: "user@example.com",
        avatar: "",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>{!isPending && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
