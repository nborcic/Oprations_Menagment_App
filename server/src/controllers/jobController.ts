import { Response } from 'express';
import { z } from 'zod';
import { JobStatus, Priority } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  addNote,
  getDashboardStats,
} from '../services/jobService.js';
import { logActivity, getRecentActivity } from '../services/activityService.js';

const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  scheduledDate: z.string().optional(),
  customerId: z.string().min(1),
  assignedToId: z.string().optional(),
});

const noteSchema = z.object({
  content: z.string().min(1),
});

export async function list(req: AuthRequest, res: Response) {
  const { status, priority, assignedToId, customerId, scheduledFrom, scheduledTo, search } = req.query as Record<string, string>;
  const jobs = await getJobs({ status: status as JobStatus, priority: priority as Priority, assignedToId, customerId, scheduledFrom, scheduledTo, search });
  res.json(jobs);
}

export async function get(req: AuthRequest, res: Response) {
  const job = await getJobById(req.params.id);
  if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
  res.json(job);
}

export async function create(req: AuthRequest, res: Response) {
  const result = jobSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const job = await createJob({ ...result.data, createdById: req.user!.userId });
  await logActivity({
    action: 'JOB_CREATED',
    entityType: 'Job',
    entityId: job.id,
    userId: req.user!.userId,
    jobId: job.id,
    metadata: { title: job.title },
  });
  res.status(201).json(job);
}

export async function update(req: AuthRequest, res: Response) {
  const result = jobSchema.partial().safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  try {
    const existing = await getJobById(req.params.id);
    if (!existing) { res.status(404).json({ error: 'Job not found' }); return; }

    const job = await updateJob(req.params.id, result.data);

    // Log separate events for status changes and assignment changes so the
    // activity timeline can display meaningful "from → to" transitions.
    if (result.data.status && result.data.status !== existing.status) {
      await logActivity({
        action: 'JOB_STATUS_CHANGED',
        entityType: 'Job',
        entityId: job.id,
        userId: req.user!.userId,
        jobId: job.id,
        metadata: { from: existing.status, to: result.data.status },
      });
    } else {
      await logActivity({
        action: 'JOB_UPDATED',
        entityType: 'Job',
        entityId: job.id,
        userId: req.user!.userId,
        jobId: job.id,
        metadata: { title: job.title },
      });
    }

    if (result.data.assignedToId && result.data.assignedToId !== existing.assignedToId) {
      await logActivity({
        action: 'JOB_ASSIGNED',
        entityType: 'Job',
        entityId: job.id,
        userId: req.user!.userId,
        jobId: job.id,
        metadata: { assignedToId: result.data.assignedToId },
      });
    }

    res.json(job);
  } catch {
    res.status(404).json({ error: 'Job not found' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await deleteJob(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch {
    res.status(404).json({ error: 'Job not found' });
  }
}

export async function createNote(req: AuthRequest, res: Response) {
  const result = noteSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: 'Note content is required' }); return; }

  const note = await addNote(req.params.id, result.data.content, req.user!.userId);
  await logActivity({
    action: 'NOTE_ADDED',
    entityType: 'Note',
    entityId: req.params.id,
    userId: req.user!.userId,
    jobId: req.params.id,
    // Truncate preview so activity feed stays readable without a join to Note.
    metadata: { preview: result.data.content.slice(0, 60) },
  });
  res.status(201).json(note);
}

export async function stats(_req: AuthRequest, res: Response) {
  const data = await getDashboardStats();
  res.json(data);
}

export async function activity(_req: AuthRequest, res: Response) {
  const logs = await getRecentActivity(30);
  res.json(logs);
}
