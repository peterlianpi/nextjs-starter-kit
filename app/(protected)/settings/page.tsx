"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  User,
  Shield,
  Lock,
  Laptop,
  LogOut,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useSession } from "@/lib/auth-client";
import { useSessions } from "@/features/auth/hooks/use-sessions";
import { updateProfileName, updateProfileEmail } from "@/action/profile";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    data: session,
    isPending: isLoadingSession,
    refetch: refetchSession,
  } = useSession();
  const {
    sessions,
    isLoading: isLoadingSessions,
    refreshSessions,
    signOutSession,
    signOutAllDevices,
  } = useSessions();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Notification preferences (local only for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Sync profile form with session
  useEffect(() => {
    if (session?.user) {
      const userName = session.user.name || "";
      const names = userName.split(" ");
      setFirstName(names.slice(0, -1).join(" ") || "");
      setLastName(names.slice(-1).join(" ") || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName !== session?.user?.name) {
        const result = await updateProfileName(fullName);
        if (!result.success) {
          throw new Error(result.error || "Failed to update name");
        }
      }

      if (email !== session?.user?.email) {
        const result = await updateProfileEmail(email);
        if (!result.success) {
          throw new Error(result.error || "Failed to update email");
        }
      }

      toast.success("Profile updated successfully");
      await refetchSession();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSessions();
    setIsRefreshing(false);
  };

  const handleSignOutAll = async () => {
    const success = await signOutAllDevices();
    if (success) {
      window.location.href = "/login";
    }
  };

  const formatSessionDate = (date: Date | string) => {
    const d = new Date(date);
    return format(d, "MMM d, yyyy 'at' h:mm a");
  };

  const getDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    if (userAgent.includes("Edge")) return "Edge Browser";
    return "Unknown Device";
  };

  return (
    <div className="p-0">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Separator />

        {/* Profile Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoadingSession}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoadingSession}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingSession}
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={isLoadingSession || isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/settings/change-password">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Laptop className="h-5 w-5" />
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Current Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  {isLoadingSessions
                    ? "Loading..."
                    : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full sm:w-auto h-10"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>

            {sessions.length > 0 && (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Laptop className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getDeviceInfo(session.userAgent)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.ipAddress || "Unknown IP"} •{" "}
                          {formatSessionDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signOutSession(session.id)}
                      disabled={isLoadingSessions}
                      className="sm:flex-shrink-0 w-full sm:w-auto h-10 sm:h-9"
                    >
                      <LogOut className="h-4 w-4 mr-2 sm:mr-0 sm:hidden" />
                      <span className="sm:hidden">Sign Out</span>
                      <LogOut className="h-4 w-4 hidden sm:block" />
                    </Button>
                  </div>
                ))}
                {sessions.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    And {sessions.length - 5} more...
                  </p>
                )}
              </div>
            )}

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="justify-start h-11">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="truncate">Sign out of other devices</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Sign out of other devices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all other devices except this
                      one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRefresh}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="justify-start h-11">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="truncate">Sign out of all devices</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Sign out of all devices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all devices including this one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSignOutAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sign out all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the app
                </p>
              </div>
              <Switch
                checked={inAppNotifications}
                onCheckedChange={setInAppNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
