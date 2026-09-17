import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PeriodClosingController } from '../controllers/period-closing.controller';

export async function periodClosingRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Financial Years
  fastify.get('/financial-years', PeriodClosingController.getFinancialYears);
  fastify.post('/financial-years', PeriodClosingController.createFinancialYear);
  fastify.put('/financial-years/:id/status', PeriodClosingController.updateFinancialYearStatus);

  // Accounting Periods
  fastify.get('/periods', PeriodClosingController.getPeriods);

  // Centralized Posting Control Gatekeeper
  fastify.post('/validate-posting', PeriodClosingController.validatePosting);

  // Month-End Closing & 20-Point Checklist
  fastify.get('/periods/:periodId/checklist', PeriodClosingController.getMonthChecklist);
  fastify.put('/periods/:periodId/checklist/:itemId', PeriodClosingController.updateChecklistItem);
  fastify.post('/periods/:periodId/close', PeriodClosingController.closePeriod);
  fastify.post('/periods/:periodId/reopen', PeriodClosingController.reopenPeriod);

  // Year-End Readiness & Carry-Forward Engine
  fastify.get('/year-end/readiness', PeriodClosingController.getReadinessAudit);
  fastify.get('/year-end/carry-forward-preview', PeriodClosingController.getCarryForwardPreview);
  fastify.post('/year-end/execute-carry-forward', PeriodClosingController.executeCarryForward);
  fastify.get('/year-end/history', PeriodClosingController.getClosingHistory);

  // Live Audit Adjustment & Opening Balance Synchronization Engine
  fastify.get('/year-end/sync-diff', PeriodClosingController.getOpeningBalanceSyncDiff);
  fastify.get('/year-end/audit-adjustments', PeriodClosingController.getAuditAdjustments);
  fastify.post('/year-end/audit-adjustments', PeriodClosingController.postAuditAdjustment);
  fastify.post('/year-end/sync-opening-balances', PeriodClosingController.syncOpeningBalances);
}
