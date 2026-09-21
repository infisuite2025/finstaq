import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { CommunicationController } from '../controllers/communication.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function communicationRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  fastify.get('/templates', { preHandler: [requireAnyRole] }, CommunicationController.getTemplates);
  fastify.post('/send', { preHandler: [requireAnyRole] }, CommunicationController.sendMessage);
  fastify.get('/logs', { preHandler: [requireAnyRole] }, CommunicationController.getLogs);

  // In-App Notifications
  fastify.get('/notifications', { preHandler: [requireAnyRole] }, CommunicationController.getNotifications);
  fastify.post('/notifications', { preHandler: [requireAnyRole] }, CommunicationController.createNotification);
  fastify.patch('/notifications/:id/read', { preHandler: [requireAnyRole] }, CommunicationController.markAsRead);
  fastify.put('/notifications/:id/read', { preHandler: [requireAnyRole] }, CommunicationController.markAsRead);
  fastify.post('/notifications/read-all', { preHandler: [requireAnyRole] }, CommunicationController.markAllAsRead);
}
