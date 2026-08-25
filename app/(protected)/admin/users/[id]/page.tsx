"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Bell,
  FileText,
  Globe,
  Key,
  Ban,
  Settings,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  banned: boolean | null;
  banReason?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  image?: string | null;
  _count: {
    sessions: number;
    notifications: number;
    auditLogs: number;
  };
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [banReason, setBanReason] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return data.data as UserDetail;
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["admin-user-audit-logs", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/audit-logs?limit=10`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.auditLogs ?? [];
    },
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ["admin-user-notifications", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/notifications?limit=10`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.notifications ?? [];
    },
    enabled: !!user,
  });

  const { data: sessions } = useQuery({
    queryKey: ["admin-user-sessions", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/sessions?limit=5`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.sessions ?? [];
    },
    enabled: !!user,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated successfully");
      setShowRoleDialog(false);
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: async ({
      userId,
      banned,
      reason,
    }: {
      userId: string;
      banned: boolean;
      reason?: string;
    }) => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned, reason }),
      });
      if (!res.ok) throw new Error("Failed to update ban status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        variables.banned ? "User banned successfully" : "User unbanned successfully",
      );
      setShowBanDialog(false);
      setBanReason("");
    },
    onError: () => {
      toast.error("Failed to update ban status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-0">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-0">
        <h2 className="text-xl font-bold mb-2">User not found</h2>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  const getAuditLogIcon = (action: string) => {
    switch (action) {
      case "login":
        return <Key className="h-4 w-4" />;
      case "update":
        return <Settings className="h-4 w-4" />;
      case "delete":
        return <XCircle className="h-4 w-4" />;
      case "ban":
        return <Ban className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
            {user.role}
          </Badge>
          {user.banned && (
            <Badge variant="destructive">Banned</Badge>
          )}
          {user.emailVerified && (
            <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count?.sessions ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Current active sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count?.notifications ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Total notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count?.auditLogs ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Total actions logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Status
            </CardTitle>
            {user.emailVerified ? (
              <CheckCircle className="h-4 w-4 text-primary" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.emailVerified ? "Verified" : "Unverified"}
            </div>
            <p className="text-xs text-muted-foreground">
              Email verification status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="details" className="flex-1 whitespace-nowrap">Details</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 whitespace-nowrap">Activity</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 whitespace-nowrap">Notifications</TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1 whitespace-nowrap">Sessions</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Basic user details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Management */}
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Manage user permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Role</label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === "ADMIN" ? "destructive" : "secondary"}
                      className="text-sm"
                    >
                      {user.role}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewRole(user.role);
                        setShowRoleDialog(true);
                      }}
                    >
                      Change Role
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ban Status</label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.banned ? "destructive" : "default"}
                      className="text-sm"
                    >
                      {user.banned ? "Banned" : "Active"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBanDialog(true)}
                    >
                      {user.banned ? "Unban" : "Ban"} User
                    </Button>
                  </div>
                  {user.banned && user.banReason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {user.banReason}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    User ID: <code className="text-xs bg-muted px-1 py-0.5 rounded break-all">{user.id}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log: AuditLog) => (
                    <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {getAuditLogIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)} {log.resource}
                        </p>
                        {log.metadata && (
                          <p className="text-xs text-muted-foreground truncate">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notifications sent to this user</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification: Notification) => (
                    <div key={notification.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        notification.read ? "bg-muted" : "bg-primary/10"
                      }`}>
                        <Bell className={`h-4 w-4 ${notification.read ? "text-muted-foreground" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs py-0">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notifications
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Current active sessions for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session: Session) => (
                    <div key={session.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {session.userAgent?.split(" ")[0] || "Unknown Browser"}
                        </p>
                        {session.ipAddress && (
                          <p className="text-xs text-muted-foreground">
                            IP: {session.ipAddress}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {format(new Date(session.expiresAt), "PPP")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active sessions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new role for {user.name}. This will change their
              permissions immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                updateRoleMutation.mutate({ userId, role: newRole })
              }
              disabled={updateRoleMutation.isPending || !newRole}
            >
              {updateRoleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.banned ? "Unban User" : "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.banned
                ? `Are you sure you want to unban ${user.name}? They will regain access to the system.`
                : `Are you sure you want to ban ${user.name}? They will lose access to the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!user.banned && (
            <div className="py-4">
              <Input
                type="text"
                placeholder="Ban reason (optional)"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                toggleBanMutation.mutate({
                  userId,
                  banned: !user.banned,
                  reason: banReason,
                })
              }
              disabled={toggleBanMutation.isPending}
              className={
                !user.banned
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {toggleBanMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {user.banned ? "Unban" : "Ban"} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
