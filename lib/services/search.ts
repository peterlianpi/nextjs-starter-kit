import prisma from "@/lib/prisma";
import type { AuditAction } from "../generated/prisma/client";

export type SearchEntityType = "post" | "user" | "auditlog";

export interface SearchParams {
  query: string;
  entityType?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  url?: string;
}

export interface SearchResponseData {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MIN_QUERY_LENGTH = 2;

function emptyResult(page: number, limit: number): SearchResponseData {
  return { results: [], total: 0, page, limit, totalPages: 0 };
}

async function searchPosts(
  query: string,
  skip: number,
  take: number,
): Promise<{ rows: SearchResult[]; total: number }> {
  const where = {
    OR: [
      { title: { contains: query, mode: "insensitive" as const } },
      { excerpt: { contains: query, mode: "insensitive" as const } },
    ],
  };
  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: { id: true, title: true, excerpt: true, slug: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.post.count({ where }),
  ]);
  return {
    rows: rows.map((p) => ({
      id: p.id,
      entityType: "post",
      entityId: p.id,
      title: p.title,
      description: p.excerpt,
      url: `/blog/${p.slug}`,
    })),
    total,
  };
}

async function searchUsers(
  query: string,
  skip: number,
  take: number,
): Promise<{ rows: SearchResult[]; total: number }> {
  const where = {
    deletedAt: null,
    OR: [
      { name: { contains: query, mode: "insensitive" as const } },
      { email: { contains: query, mode: "insensitive" as const } },
    ],
  };
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, image: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  return {
    rows: rows.map((u) => ({
      id: u.id,
      entityType: "user",
      entityId: u.id,
      title: u.name,
      description: u.email,
      url: `/admin/users`,
    })),
    total,
  };
}

async function searchAuditLogs(
  query: string,
  skip: number,
  take: number,
): Promise<{ rows: SearchResult[]; total: number }> {
  const KNOWN_ACTIONS: readonly AuditAction[] = [
    "LOGIN",
    "LOGOUT",
    "REGISTER",
    "CREATE",
    "READ",
    "UPDATE",
    "DELETE",
    "BAN",
    "UNBAN",
    "IMPERSONATE",
    "PASSWORD_RESET",
    "EMAIL_VERIFY",
    "EXPORT",
    "IMPORT",
    "SETTINGS_UPDATE",
    "API_KEY_CREATE",
    "WEBHOOK_CREATE",
    "FILE_UPLOAD",
    "ROLE_CHANGE",
    "MONITOR_CHECK",
  ] as const;
  const lowerQuery = query.toLowerCase();
  const matchingActions = KNOWN_ACTIONS.filter((a) => a.toLowerCase().includes(lowerQuery));
  const where = {
    OR: [
      ...(matchingActions.length > 0 ? [{ action: { in: matchingActions } }] : []),
      { entityType: { contains: query, mode: "insensitive" as const } },
    ],
  };
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return {
    rows: rows.map((r) => ({
      id: r.id,
      entityType: "auditlog",
      entityId: r.entityId,
      title: `${r.action} ${r.entityType}`,
      description: `Entity ID: ${r.entityId}`,
    })),
    total,
  };
}

export async function searchEntities(params: SearchParams): Promise<SearchResponseData> {
  const { query, entityType, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return emptyResult(page, limit);
  }

  const q = query.trim();

  try {
    let rows: SearchResult[] = [];
    let total = 0;

    if (entityType === "post") {
      ({ rows, total } = await searchPosts(q, skip, limit));
    } else if (entityType === "user") {
      ({ rows, total } = await searchUsers(q, skip, limit));
    } else if (entityType === "auditlog") {
      ({ rows, total } = await searchAuditLogs(q, skip, limit));
    } else {
      // No type filter: run all three searches in parallel and merge,
      // each type getting an equal share of the page.
      const perType = Math.ceil(limit / 3) + 2;
      const [posts, users, logs] = await Promise.all([
        searchPosts(q, skip, perType),
        searchUsers(q, skip, perType),
        searchAuditLogs(q, skip, perType),
      ]);
      rows = [...posts.rows, ...users.rows, ...logs.rows].slice(0, limit);
      total = posts.total + users.total + logs.total;
    }

    return { results: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (err) {
    console.error("search error:", err);
    return emptyResult(page, limit);
  }
}
