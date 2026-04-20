import { JobStatus, Priority } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface JobInput {
  title: string;
  description?: string;
  status?: JobStatus;
  priority?: Priority;
  scheduledDate?: string;
  customerId: string;
  assignedToId?: string;
  createdById: string;
}

export interface JobFilters {
  status?: JobStatus;
  priority?: Priority;
  assignedToId?: string;
  customerId?: string;
  scheduledFrom?: string;
  scheduledTo?: string;
  search?: string;
}

export async function getJobs(filters: JobFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.customerId) where.customerId = filters.customerId;

  if (filters.scheduledFrom || filters.scheduledTo) {
    where.scheduledDate = {
      ...(filters.scheduledFrom ? { gte: new Date(filters.scheduledFrom) } : {}),
      ...(filters.scheduledTo ? { lte: new Date(filters.scheduledTo) } : {}),
    };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.job.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { notes: true } },
    },
    // High-priority jobs first, then soonest scheduled, then newest as tiebreaker.
    orderBy: [{ priority: 'desc' }, { scheduledDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true } },
      notes: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30, // Cap at 30 — detail page only shows recent history, full log isn't needed.
      },
    },
  });
}

export async function createJob(data: JobInput) {
  return prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status ?? JobStatus.OPEN,
      priority: data.priority ?? Priority.MEDIUM,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      customerId: data.customerId,
      assignedToId: data.assignedToId,
      createdById: data.createdById,
    },
    include: {
      customer: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

export async function updateJob(id: string, data: Partial<Omit<JobInput, 'createdById'>>) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.scheduledDate) {
    updateData.scheduledDate = new Date(data.scheduledDate);
  }
  // Auto-stamp completedDate when status is set to COMPLETED — not editable by the caller.
  if (data.status === JobStatus.COMPLETED) {
    updateData.completedDate = new Date();
  }
  return prisma.job.update({
    where: { id },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

export async function deleteJob(id: string) {
  return prisma.job.delete({ where: { id } });
}

export async function addNote(jobId: string, content: string, authorId: string) {
  return prisma.note.create({
    data: { content, jobId, authorId },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
}

// Run all counts in parallel — a single await Promise.all is faster than 6 sequential queries.
export async function getDashboardStats() {
  const [total, open, inProgress, completed, overdue, customers] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: JobStatus.OPEN } }),
    prisma.job.count({ where: { status: JobStatus.IN_PROGRESS } }),
    prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
    prisma.job.count({ where: { status: JobStatus.OVERDUE } }),
    prisma.customer.count(),
  ]);

  return { total, open, inProgress, completed, overdue, customers };
}
