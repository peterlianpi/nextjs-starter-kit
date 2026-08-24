"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ac, roles } from "./access";

// ==========================================
// TYPES
// ==========================================

type Resource = "user" | "session" | "content" | "webhook" | "upload" | "settings";
type Action = string;

interface PermissionCheck {
  resource: Resource;
  actions: Action[];
}

// ==========================================
// SERVER-SIDE SESSION HELPER
// ==========================================

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

// ==========================================
// PERMISSION CHECKS
// ==========================================

/**
 * Check if the current user has specific permissions
 * Uses Better Auth's access control system
 */
export async function hasPermission(
  permissions: PermissionCheck | PermissionCheck[],
): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return false;
    }

    const userRole = session.user.role as string | undefined;
    if (!userRole) {
      return false;
    }

    const roleDefinition = roles[userRole as keyof typeof roles];
    if (!roleDefinition) {
      return false;
    }

    const checks = Array.isArray(permissions) ? permissions : [permissions];

    for (const check of checks) {
      const result = roleDefinition.authorize({
        [check.resource]: check.actions,
      });
      if (!result.success) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("[hasPermission] Error:", error);
    return false;
  }
}

/**
 * Check if the current user has any of the given admin permissions
 */
export async function checkIsAdmin(): Promise<boolean> {
  return hasPermission({ resource: "user", actions: ["list"] });
}

/**
 * Get current user role server-side
 * Returns "ADMIN", "USER", or null if not authenticated
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return null;
    }
    return (session.user.role as string) || null;
  } catch (error) {
    console.error("[getUserRole] Error:", error);
    return null;
  }
}

// ==========================================
// CONVENIENCE PERMISSION CHECKS
// ==========================================

export async function canManageUsers(): Promise<boolean> {
  return hasPermission({ resource: "user", actions: ["list"] });
}

export async function canSetRole(): Promise<boolean> {
  return hasPermission({ resource: "user", actions: ["set-role"] });
}

export async function canBanUsers(): Promise<boolean> {
  return hasPermission({ resource: "user", actions: ["ban"] });
}

export async function canManageWebhooks(): Promise<boolean> {
  return hasPermission({ resource: "webhook", actions: ["list", "create", "delete"] });
}

export async function canUploadFiles(): Promise<boolean> {
  return hasPermission({ resource: "upload", actions: ["create"] });
}

export async function canDeleteFiles(): Promise<boolean> {
  return hasPermission({ resource: "upload", actions: ["delete"] });
}
