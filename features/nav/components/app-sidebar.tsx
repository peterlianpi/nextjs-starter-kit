"use client";

import * as React from "react";
import { LayoutDashboard, Settings2, BarChart3, Users, Image } from "lucide-react";
import { NavMain } from "@/features/nav/components/nav-main";
import { NavUser } from "@/features/nav/components/nav-user";
import { TeamSwitcher } from "@/features/nav/components/team-switcher";
import {
  AdminSwitch,
  useAdminStatus,
} from "@/features/nav/components/admin-switch";
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
      {
        title: "Media Library",
        url: "/admin/media",
        icon: Image,
      },
    ],
  },
];

const teams = [
  {
    name: "Next.js Starter Kit",
    logo: LayoutDashboard,
    plan: "Starter",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession();
  const isAdmin = useAdminStatus();

  const navMain = React.useMemo(() => {
    const items = [...userNavMain];
    if (isAdmin) {
      const settingsIndex = items.findIndex(
        (item) => item.title === "Settings",
      );
      if (settingsIndex >= 0) {
        items.splice(settingsIndex, 0, ...adminNavItems);
      } else {
        items.push(...adminNavItems);
      }
    }
    return items;
  }, [isAdmin]);

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
        <TeamSwitcher teams={teams} />
        <AdminSwitch
          isAdmin={!!isAdmin}
          isLoading={isPending || isAdmin === null}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>{!isPending && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
