import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApprovalController } from '../controllers/approval.controller';

export async function approvalRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Policy & Rules management
  fastify.get('/rules', ApprovalController.getRules);
  fastify.post('/rules/reset', ApprovalController.resetRules);
  fastify.put('/rules', ApprovalController.updateRulesBulk);
  fastify.put('/rules/:documentType', ApprovalController.updateRule);

  // Stats
  fastify.get('/stats', ApprovalController.getStats);

  // Transaction Evaluation
  fastify.post('/evaluate', ApprovalController.evaluate);

  // Authorizations Queue
  fastify.get('/pending', ApprovalController.getPending);
  fastify.get('/history', ApprovalController.getHistory);

  // Checker Decisions
  fastify.post('/:id/approve', ApprovalController.approve);
  fastify.post('/:id/reject', ApprovalController.reject);
}
