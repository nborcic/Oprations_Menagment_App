import { Request, Response } from 'express';
import { z } from 'zod';
import { loginUser, getUserById, getAllStaff } from '../services/authService.js';
import { AuthRequest } from '../types/index.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid email or password format' });
    return;
  }
  try {
    const { token, user } = await loginUser(result.data.email, result.data.password);
    res.json({ token, user });
  } catch {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await getUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}

export async function listStaff(_req: Request, res: Response) {
  const staff = await getAllStaff();
  res.json(staff);
}
