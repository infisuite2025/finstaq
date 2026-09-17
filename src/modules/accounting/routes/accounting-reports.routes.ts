import { FastifyInstance } from 'fastify';
import { AccountingReportsController } from '../controllers/accounting-reports.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';

export async function accountingReportsRoutes(fastify: FastifyInstance) {
  const controller = new AccountingReportsController();

  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // 1. Balance Sheet (Schedule III & T-Format)
  fastify.get('/balance-sheet', controller.getBalanceSheet);

  // 2. Profit & Loss Statement (Income Statement / Trading A/c)
  fastify.get('/profit-and-loss', controller.getProfitAndLoss);

  // 3. Trial Balance (4-Column Periodic Summary)
  fastify.get('/trial-balance', controller.getTrialBalance);

  // 4. Cash Flow Statement (AS-3 Standard)
  fastify.get('/cash-flow', controller.getCashFlow);

  // 5. General Ledger Statement & Day Book Extract
  fastify.get('/ledger-statement', controller.getLedgerStatement);
  fastify.get('/general-ledger', controller.getLedgerStatement);

  // 6. Bank Reconciliation Statement (BRS)
  fastify.get('/bank-reconciliation', controller.getBankReconciliation);

  // 7. Financial Ratio Analysis (KPI Dashboard)
  fastify.get('/ratio-analysis', controller.getRatioAnalysis);

  // 8. Group Summary & Chart of Accounts Rollup
  fastify.get('/group-summary', controller.getGroupSummary);

  // 9. Consolidated GST Computation (GSTR-3B Tax Matrix)
  fastify.get('/gst-computation', controller.getGstComputation);
}
