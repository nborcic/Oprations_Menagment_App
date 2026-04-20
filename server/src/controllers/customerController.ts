import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types/index.js';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customerService.js';
import { logActivity } from '../services/activityService.js';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function list(req: AuthRequest, res: Response) {
  const search = req.query.search as string | undefined;
  const customers = await getCustomers(search);
  res.json(customers);
}

export async function get(req: AuthRequest, res: Response) {
  const customer = await getCustomerById(req.params.id);
  if (!customer) { res.status(404).json({ error: 'Customer not found' }); return; }
  res.json(customer);
}

export async function create(req: AuthRequest, res: Response) {
  const result = customerSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const customer = await createCustomer(result.data);
  await logActivity({
    action: 'CUSTOMER_CREATED',
    entityType: 'Customer',
    entityId: customer.id,
    userId: req.user!.userId,
    metadata: { name: customer.name },
  });
  res.status(201).json(customer);
}

export async function update(req: AuthRequest, res: Response) {
  const result = customerSchema.partial().safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  try {
    const customer = await updateCustomer(req.params.id, result.data);
    await logActivity({
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: customer.id,
      userId: req.user!.userId,
      metadata: { name: customer.name },
    });
    res.json(customer);
  } catch {
    res.status(404).json({ error: 'Customer not found' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await deleteCustomer(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch {
    res.status(404).json({ error: 'Customer not found' });
  }
}
