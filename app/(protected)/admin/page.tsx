"use client";

import Link from "next/link";
import { 
  Users, 
  Shield, 
  Activity, 
  UserPlus, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Upload,
  CheckCircle,
  UserX,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { StatsCard } from "@/features/dashboard/components/stats-card";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/api/hono-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const totalUsers = stats?.data?.totalUsers ?? 0;
  const activeUsers = stats?.data?.activeUsers ?? 0;
  const verifiedUsers = stats?.data?.verifiedUsers ?? 0;
  const adminUsers = stats?.data?.adminUsers ?? 0;
  const bannedUsers = stats?.data?.bannedUsers ?? 0;
  const newUsersToday = stats?.data?.newUsersToday ?? 0;
  const newUsersThisWeek = stats?.data?.newUsersThisWeek ?? 0;
  const newUsersThisMonth = stats?.data?.newUsersThisMonth ?? 0;
  const totalFiles = stats?.data?.totalFiles ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-0">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={isLoading ? "..." : totalUsers}
          description="All registered users"
          icon={Users}
          isLoading={isLoading}
          error={!!error}
        />
        <StatsCard
          title="Active Users"
          value={isLoading ? "..." : activeUsers}
          description="Active accounts"
          icon={Activity}
          isLoading={isLoading}
          error={!!error}
        />
        <StatsCard
          title="Verified Users"
          value={isLoading ? "..." : verifiedUsers}
          description="Email verified"
          icon={CheckCircle}
          isLoading={isLoading}
          error={!!error}
        />
        <StatsCard
          title="Admin Users"
          value={isLoading ? "..." : adminUsers}
          description="With admin role"
          icon={Shield}
          isLoading={isLoading}
          error={!!error}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="New Today"
          value={isLoading ? "..." : newUsersToday}
          description="Registered today"
          icon={UserPlus}
          isLoading={isLoading}
          error={!!error}
        />
        <StatsCard
          title="This Week"
          value={isLoading ? "..." : newUsersThisWeek}
          description="Registered this week"
          icon={Calendar}
          isLoading={isLoading}
          error={!!error}
        />
        <StatsCard
          title="This Month"
          value={isLoading ? "..." : newUsersThisMonth}
          description="Registered this month"
          icon={TrendingUp}
          isLoading={isLoading}
          error={!!error}
        />
        <StatsCard
          title="Total Files"
          value={isLoading ? "..." : totalFiles}
          description="Uploaded files"
          icon={ImageIcon}
          isLoading={isLoading}
          error={!!error}
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">User Management</CardTitle>
                  <CardDescription className="text-sm">
                    View, edit, and manage users
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/media" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Media Library</CardTitle>
                  <CardDescription className="text-sm">
                    Upload and manage files
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Analytics</CardTitle>
                  <CardDescription className="text-sm">
                    View system analytics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/settings" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Audit Logs</CardTitle>
                  <CardDescription className="text-sm">
                    View system activity
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Admin Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage users, media, and system settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">User Distribution</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium">{activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-medium">{verifiedUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banned</span>
                  <span className="font-medium text-destructive">{bannedUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admins</span>
                  <span className="font-medium">{adminUsers}</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Growth</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-medium">+{newUsersToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-medium">+{newUsersThisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium">+{newUsersThisMonth}</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-3">
                <ImageIcon className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Storage</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Files</span>
                  <span className="font-medium">{totalFiles}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
