export type Role = 'ADMIN' | 'STAFF';
export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { jobs: number };
  jobs?: Job[];
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  priority: Priority;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customer: { id: string; name: string };
  assignedToId?: string;
  assignedTo?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string };
  notes?: Note[];
  activityLogs?: ActivityLog[];
  _count?: { notes: number };
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  jobId: string;
  authorId: string;
  author: { id: string; name: string; role: Role };
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  userId: string;
  jobId?: string;
  user: { id: string; name: string; role: Role };
  job?: { id: string; title: string } | null;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
  customers: number;
}
