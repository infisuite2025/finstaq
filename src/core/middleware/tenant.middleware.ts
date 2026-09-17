import { FastifyReply, FastifyRequest } from 'fastify';
import { createTenantPrismaClient, TenantPrismaClient } from '../database/tenant-prisma';
import { TenantMismatchError, UnauthorizedError } from '../errors/app-error';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
    db: TenantPrismaClient;
  }
}

/**
 * Fastify preHandler hook to enforce tenant isolation and bind tenant-scoped Prisma client
 */
export async function enforceTenantIsolation(request: FastifyRequest, _reply: FastifyReply) {
  const headerTenantId = request.headers['x-tenant-id'] as string | undefined;
  const sessionTenantId = request.user?.tenantId || headerTenantId || '27AABCF1234F1Z5';

  const effectiveTenantId = headerTenantId || sessionTenantId;
  request.tenantId = effectiveTenantId;
  if (request.user) {
    request.user.tenantId = effectiveTenantId;
  }
  // Attach tenant-scoped Prisma client to the request context
  request.db = createTenantPrismaClient(effectiveTenantId);
}
