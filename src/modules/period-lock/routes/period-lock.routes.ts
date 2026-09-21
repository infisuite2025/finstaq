import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PeriodLockController } from '../controllers/period-lock.controller';

export async function periodLockRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  fastify.get('/matrix', PeriodLockController.getMatrix);
  fastify.post('/validate-date', PeriodLockController.validateDate);
  fastify.post('/months/:periodKey/close', PeriodLockController.closeMonth);
  fastify.post('/months/:periodKey/reopen', PeriodLockController.reopenMonth);
  fastify.post('/years/:fiscalYear/close', PeriodLockController.closeFiscalYear);
  fastify.get('/backdate-policy', PeriodLockController.getBackdatePolicy);
  fastify.put('/backdate-policy', PeriodLockController.updateBackdatingPolicy);
  fastify.get('/hard-freeze', PeriodLockController.getHardFreeze);
  fastify.put('/hard-freeze', PeriodLockController.updateHardFreeze);
}
