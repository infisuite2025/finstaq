import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '@prisma/client';
import { UnauthorizedError } from '../errors/app-error';
import { env } from '../../config/env';

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthenticatedUser;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthenticatedUser;
  }
}

/**
 * Fastify preHandler hook to verify JWT authentication token
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<AuthenticatedUser>();
    if (!payload || !payload.userId || !payload.tenantId) {
      throw new UnauthorizedError('Invalid authentication token payload');
    }
    request.user = payload;
    (request as any).tenantId = payload.tenantId;
  } catch (err: any) {
    // In production mode, strictly reject requests lacking a valid cryptographic JWT
    if (env.NODE_ENV === 'production') {
      if (err instanceof UnauthorizedError) {
        throw err;
      }
      throw new UnauthorizedError('A valid authentication token is required');
    }

    // In development / testing environments, allow header-based developer scoping
    const headerTenant = (request.headers['x-tenant-id'] as string) || 'tenant-default-01';
    const headerUser = (request.headers['x-user-id'] as string) || 'usr-owner-01';
    const headerRole = ((request.headers['x-user-role'] as any) || 'OWNER') as UserRole;

    if (request.headers['x-tenant-id'] || headerTenant) {
      request.user = {
        userId: headerUser,
        tenantId: headerTenant,
        email: 'developer@finstaq.internal',
        role: headerRole,
      };
      (request as any).tenantId = headerTenant;
      return;
    }

    if (err instanceof UnauthorizedError) {
      throw err;
    }
    throw new UnauthorizedError(err.message || 'Authentication failed');
  }
}

