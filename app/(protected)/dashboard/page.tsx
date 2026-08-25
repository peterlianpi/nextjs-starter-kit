"use client";

import Link from "next/link";
import { Users, Shield, Activity, ArrowRight, Search, Upload, Table2, FileSpreadsheet, Clock, Key, Webhook } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ActionCard } from "@/features/dashboard/components/action-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 p-0">
      {/* Welcome Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session?.user?.name || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your starter kit
          </p>
        </div>
        <Badge variant="secondary">
          {(session?.user as { role?: string } | undefined)?.role || "USER"}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="text-2xl font-bold">
                {session?.user?.emailVerified ? "Verified" : "Unverified"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-2xl font-bold">
                {(session?.user as { role?: string } | undefined)?.role || "USER"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            href="/settings"
            icon={Users}
            title="Profile Settings"
            description="Update your name, email, and password"
            buttonText="Open Settings"
          />
          <ActionCard
            href="/settings/change-password"
            icon={Shield}
            title="Security"
            description="Change your password and manage sessions"
            buttonText="Security Settings"
            iconColor="text-blue-500"
          />
          <ActionCard
            href="/dashboard"
            icon={Activity}
            title="Dashboard"
            description="View your account overview"
            buttonText="View Dashboard"
          />
        </div>
      </div>

      {/* Available Features */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Available Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard href="/docs/cms-features" icon={Search} title="Search" description="Full-text search across entities" buttonText="Explore" />
          <ActionCard href="/admin/media" icon={Upload} title="File Upload" description="Upload files with drag & drop" buttonText="Upload" />
          <ActionCard href="/admin/posts" icon={Table2} title="Data Tables" description="Sortable, filterable tables" buttonText="View" />
          <ActionCard href="/admin/posts" icon={FileSpreadsheet} title="Export" description="Export data to CSV or JSON" buttonText="Export" />
          <ActionCard href="/docs/database" icon={Clock} title="Activity Feed" description="Timeline of system events" buttonText="View" />
          <ActionCard href="/docs/api-and-rpc" icon={Key} title="API Keys" description="Manage API key access" buttonText="Manage" />
          <ActionCard href="/docs/api-and-rpc" icon={Webhook} title="Webhooks" description="Event-driven integrations" buttonText="Configure" />
          <ActionCard href="/settings" icon={Shield} title="Preferences" description="User settings and preferences" buttonText="Settings" />
        </div>
      </div>

      {/* Getting Started */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Getting Started
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
              1
            </span>
            <p className="text-sm text-muted-foreground">
              Explore the <code className="text-xs">features/</code> directory to
              see how modules are organized
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
              2
            </span>
            <p className="text-sm text-muted-foreground">
              Check <code className="text-xs">lib/site.ts</code> for centralized
              site configuration and metadata
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
              3
            </span>
            <p className="text-sm text-muted-foreground">
              Use the Hono RPC pattern in{" "}
              <code className="text-xs">app/api/[[...route]]/</code> for
              type-safe APIs
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
              4
            </span>
            <p className="text-sm text-muted-foreground">
              Follow the feature-sliced design pattern:{" "}
              <code className="text-xs">
                features/{'<feature>'}/
              </code>
              {" "}/{'api, components, hooks, types'}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/docs" className="flex items-center gap-2">
              Read Documentation <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
