import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAccountantOrOwner, requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function documentRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Upload document & initiate AI extraction (All authenticated roles)
  fastify.post('/upload', { preHandler: [requireAnyRole] }, DocumentController.uploadDocument);

  // Get drafts list
  fastify.get('/drafts', { preHandler: [requireAnyRole] }, DocumentController.getDrafts);

  // Get single draft
  fastify.get('/drafts/:id', { preHandler: [requireAnyRole] }, DocumentController.getDraftById);

  // Approve and Post (Restricted to OWNER and ACCOUNTANT)
  fastify.post('/drafts/:id/post', { preHandler: [requireAccountantOrOwner] }, DocumentController.approveAndPost);
}
