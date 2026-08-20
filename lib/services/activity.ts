import prisma from "@/lib/prisma";

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string | null;
  timestamp: Date;
}

export async function getActivityFeed(params: {
  page?: number;
  limit?: number;
  entityType?: string;
  userId?: string;
}) {
  const { page = 1, limit = 20, entityType, userId } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (userId) where.createdById = userId;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      userName: item.createdBy?.name ?? null,
      timestamp: item.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
