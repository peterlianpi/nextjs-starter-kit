import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

export const client = hc<AppType>("");

// ============================================
// ADMIN HELPERS
// ============================================

export interface AdminStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    newUsersToday: number;
  };
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  const response = await client.api.admin.stats.$get();

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }

  return (await response.json()) as AdminStatsResponse;
}

export interface AdminUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export async function getAdminUsers(
  params: AdminUsersParams = {},
): Promise<AdminUsersResponse> {
  const query: Record<string, string> = {};
  if (params.search) query.search = params.search;
  if (params.page) query.page = params.page.toString();
  if (params.limit) query.limit = params.limit.toString();

  const response = await client.api.admin.users.$get({ query });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return (await response.json()) as AdminUsersResponse;
}

// ============================================
// SEARCH HELPERS
// ============================================

export interface SearchParams {
  query: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function searchEntities(
  params: SearchParams,
): Promise<SearchResponse> {
  const query: Record<string, string> = { q: params.query };
  if (params.type) query.type = params.type;
  if (params.page) query.page = params.page.toString();
  if (params.limit) query.limit = params.limit.toString();

  const response = await client.api.search.$get({ query });

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return (await response.json()) as SearchResponse;
}

// ============================================
// HEALTH HELPERS
// ============================================

export async function checkHealth() {
  const response = await client.api.health.$get();
  if (!response.ok) throw new Error("Health check failed");
  return response.json();
}

export async function checkAuthHealth() {
  const response = await client.api.health.auth.$get();
  if (!response.ok) throw new Error("Auth health check failed");
  return response.json();
}
