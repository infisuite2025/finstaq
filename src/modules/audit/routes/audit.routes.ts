import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function auditRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  fastify.get('/logs', { preHandler: [requireAnyRole] }, AuditController.getAuditLogs);
  fastify.get('/entities/:entityName/:entityId', { preHandler: [requireAnyRole] }, AuditController.getEntityHistory);
  fastify.get('/sessions', { preHandler: [requireAnyRole] }, AuditController.getSessionLogs);
  fastify.get('/summary', { preHandler: [requireAnyRole] }, AuditController.getSummary);
  fastify.post('/events', { preHandler: [requireAnyRole] }, AuditController.recordEvent);
}
