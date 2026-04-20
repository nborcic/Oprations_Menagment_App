import { PrismaClient } from '@prisma/client';

// Reuse the same PrismaClient across hot-reloads in dev.
// Without this, each file save creates a new connection pool and exhausts DB connections.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
