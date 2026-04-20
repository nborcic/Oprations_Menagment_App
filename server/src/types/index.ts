import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

// user is optional here because Express doesn't know about our middleware at the type level.
// Routes that call authenticate first can safely use req.user! — it's always set by then.
export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};
