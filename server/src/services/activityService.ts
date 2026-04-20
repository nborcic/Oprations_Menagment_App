import { prisma } from '../lib/prisma.js';

interface LogActivityParams {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  jobId?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      jobId: params.jobId,
      metadata: params.metadata,
    },
  });
}

export async function getRecentActivity(limit = 20) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, title: true } },
    },
  });
}
