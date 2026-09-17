// @ts-nocheck
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReturnsController } from '../controllers/returns.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function returnsRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  fastify.get('/purchase', { preHandler: [requireAnyRole] }, ReturnsController.getPurchaseReturns);
  fastify.post('/purchase', { preHandler: [requireAnyRole] }, ReturnsController.createPurchaseReturn);

  fastify.get('/sales', { preHandler: [requireAnyRole] }, ReturnsController.getSalesReturns);
  fastify.post('/sales', { preHandler: [requireAnyRole] }, ReturnsController.createSalesReturn);
}
