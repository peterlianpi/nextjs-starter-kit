import { auth } from "@/lib/auth";
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
// API ROUTE HELPERS
// ==========================================

/**
 * Get session from Hono context (reads cookie header)
 */
export async function getApiSession(cookieHeader: string | undefined) {
  const headers: Record<string, string> = cookieHeader
    ? { Cookie: cookieHeader }
    : {};
  return auth.api.getSession({ headers });
}

/**
 * Check if the current API request user has specific permissions
 * Use this in Hono route handlers
 */
export async function hasApiPermission(
  cookieHeader: string | undefined,
  permissions: PermissionCheck | PermissionCheck[],
): Promise<boolean> {
  try {
    const session = await getApiSession(cookieHeader);

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
    console.error("[hasApiPermission] Error:", error);
    return false;
  }
}

/**
 * Check if the API request user is an admin
 */
export async function checkApiIsAdmin(cookieHeader: string | undefined): Promise<boolean> {
  return hasApiPermission(cookieHeader, { resource: "user", actions: ["list"] });
}
