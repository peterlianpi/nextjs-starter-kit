import prisma from "@/lib/prisma";

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
  score?: number;
}

export async function searchEntities(params: SearchParams) {
  const { query, entityType, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, page, limit, totalPages: 0 };
  }

  const searchFilter = {
    OR: [
      { title: { contains: query, mode: "insensitive" as const } },
      { description: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const where = entityType
    ? { ...searchFilter, entityType }
    : searchFilter;

  const [results, total] = await Promise.all([
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
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    results: results.map((r) => ({
      id: r.id,
      entityType: r.entityType,
      entityId: r.entityId,
      title: `${r.action} ${r.entityType}`,
      description: `Entity ID: ${r.entityId}`,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
