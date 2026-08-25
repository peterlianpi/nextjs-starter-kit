"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import {
  useOrgs,
  type MyOrg,
} from "@/features/nav/lib/use-orgs";

// ============================================
// ORG SWITCHER (Unit 16.2)
// ============================================
// Replaces the static team-switcher placeholder: lists the
// user's real organization memberships, persists the active
// selection in localStorage, and offers create-org when empty.

export function TeamSwitcher() {
  const { data: session, isPending } = useSession();
  const isAuthenticated = !isPending && !!session?.user;
  const { orgs, activeOrg, isLoading, error, setActiveOrg, createOrg } =
    useOrgs(isAuthenticated);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  if (isPending || (isAuthenticated && isLoading && orgs.length === 0)) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
            <Spinner className="size-4" />
            {!isPending && <span className="text-sm">Loading…</span>}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Signed out or session unavailable — nothing to switch
  if (!isAuthenticated) {
    return null;
  }

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    const result = await createOrg(newName.trim());
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.error ?? "Failed to create organization");
      return;
    }
    setNewName("");
    setCreateOpen(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg ? activeOrg.name : "Next.js Starter Kit"}
                </span>
                <span className="truncate text-xs">
                  {activeOrg ? activeOrg.role : "Personal"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-lg" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>

            {error && (
              <div className="px-2 py-1.5 text-xs text-destructive">{error}</div>
            )}

            {orgs.map((org) => (
              <OrgMenuItem
                key={org.id}
                org={org}
                active={org.id === activeOrg?.id}
                onSelect={() => setActiveOrg(org)}
              />
            ))}

            <DropdownMenuSeparator />
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setCreateOpen(true);
                  }}
                >
                  <Plus />
                  Create organization
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create organization</DialogTitle>
                  <DialogDescription>
                    You will become the owner of this organization.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Acme Inc."
                  maxLength={100}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={creating || newName.trim().length < 2}>
                    {creating && <Spinner className="size-4" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function OrgMenuItem({
  org,
  active,
  onSelect,
}: {
  org: MyOrg;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="items-center gap-2">
      <Check className={`size-4 ${active ? "" : "invisible"}`} />
      <span className="flex-1 truncate">{org.name}</span>
      <Badge variant="outline" className="ml-auto shrink-0 text-[10px] uppercase">
        {org.role}
      </Badge>
    </DropdownMenuItem>
  );
}
