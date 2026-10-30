import { FastifyInstance } from 'fastify';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../core/middleware/auth.middleware';
import { createWorkspaceUser, listWorkspaceUsers, loginWithPassword } from './auth.service';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', async (request, reply) => {
    const body = (request.body || {}) as { email?: string; password?: string; subdomain?: string };
    const session = await loginWithPassword(body.email || '', body.password || '', body.subdomain);
    const token = await reply.jwtSign({
      userId: session.userId,
      tenantId: session.tenantId,
      email: session.email,
      role: session.role === 'SUPER_ADMIN' ? 'OWNER' : session.role,
    });
    return reply.send({ success: true, data: { ...session, token } });
  });

  fastify.get('/auth/users', { preHandler: authenticate }, async (request, reply) => {
    const users = await listWorkspaceUsers(request.user.tenantId);
    return reply.send({ success: true, data: users });
  });

  fastify.post('/auth/users', { preHandler: authenticate }, async (request, reply) => {
    const body = (request.body || {}) as {
      email?: string;
      password?: string;
      role?: UserRole;
      firstName?: string;
      lastName?: string;
    };
    const actorRole = String(request.user?.role || request.headers['x-user-role'] || '');
    const user = await createWorkspaceUser(actorRole, request.user.tenantId, {
      email: body.email || '',
      password: body.password || '',
      role: body.role || 'DATA_ENTRY',
      firstName: body.firstName || '',
      lastName: body.lastName || '',
    });
    return reply.code(201).send({ success: true, data: user });
  });
}
