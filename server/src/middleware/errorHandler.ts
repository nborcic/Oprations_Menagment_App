import { Request, Response, NextFunction } from 'express';

// Four parameters are required — Express uses the arity to detect error-handling middleware.
// Removing any parameter causes Express to treat this as a regular middleware and skip it on errors.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
}
