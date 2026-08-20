import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// ==========================================
// ACCESS CONTROL STATEMENTS
// ==========================================

export const statements = {
  ...defaultStatements,
  content: ["create", "read", "update", "delete", "publish", "list"],
  webhook: ["create", "list", "delete"],
  upload: ["create", "list", "delete"],
  settings: ["read", "update"],
} as const;

// ==========================================
// ACCESS CONTROL INSTANCE
// ==========================================

export const ac = createAccessControl(statements);

// ==========================================
// ROLE DEFINITIONS
// ==========================================

// Super Admin: unrestricted access, can manage other admins
export const superAdminRole = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  content: ["create", "read", "update", "delete", "publish", "list"],
  webhook: ["create", "list", "delete"],
  upload: ["create", "list", "delete"],
  settings: ["read", "update"],
});

// Admin: full management, cannot impersonate other admins
export const adminRole = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  content: ["create", "read", "update", "delete", "publish", "list"],
  webhook: ["create", "list", "delete"],
  upload: ["create", "list", "delete"],
  settings: ["read", "update"],
});

// Moderator: user moderation, read content
export const moderatorRole = ac.newRole({
  user: ["list", "get", "ban", "update"],
  session: ["list"],
  content: ["read", "list", "update"],
  webhook: ["list"],
  upload: ["create", "list", "delete"],
  settings: ["read"],
});

// Editor: content management, own uploads
export const editorRole = ac.newRole({
  user: [],
  session: [],
  content: ["create", "read", "update", "delete", "publish", "list"],
  webhook: [],
  upload: ["create", "list", "delete"],
  settings: ["read"],
});

// Viewer: read-only access
export const viewerRole = ac.newRole({
  user: [],
  session: [],
  content: ["read", "list"],
  webhook: [],
  upload: ["list"],
  settings: [],
});

// User: basic user, own resources only
export const userRole = ac.newRole({
  user: [],
  session: [],
  content: ["read"],
  webhook: [],
  upload: ["create", "list", "delete"],
  settings: [],
});

// ==========================================
// ROLE MAP
// ==========================================

export const roles = {
  SUPER_ADMIN: superAdminRole,
  ADMIN: adminRole,
  MODERATOR: moderatorRole,
  EDITOR: editorRole,
  VIEWER: viewerRole,
  USER: userRole,
} as const;

export type UserRole = keyof typeof roles;

// ==========================================
// ROLE HIERARCHY (for UI display)
// ==========================================

export const roleHierarchy: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MODERATOR: 60,
  EDITOR: 40,
  VIEWER: 20,
  USER: 10,
};

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
}
