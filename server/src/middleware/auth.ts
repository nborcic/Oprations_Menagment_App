import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthPayload } from '../types/index.js';

// Fallback only for local dev — always set JWT_SECRET in production env vars.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  // Expects "Authorization: Bearer <token>" — split grabs the token part after the space.
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
