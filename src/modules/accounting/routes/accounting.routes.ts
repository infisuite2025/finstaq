import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AccountingController } from '../controllers/voucher.controller';
import { accountingReportsRoutes } from './accounting-reports.routes';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAccountantOrOwner, requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function accountingRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // All accounting routes require authentication and tenant isolation scoping
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Read routes (Accessible by OWNER, ACCOUNTANT, DATA_ENTRY)
  fastify.get('/ledgers', { preHandler: [requireAnyRole] }, AccountingController.getLedgers);
  fastify.get('/ledger-groups', { preHandler: [requireAnyRole] }, AccountingController.getLedgerGroups);
  fastify.get('/vouchers', { preHandler: [requireAnyRole] }, AccountingController.getVouchers);
  fastify.post('/calculate-tax', { preHandler: [requireAnyRole] }, AccountingController.calculateTax);

  // Voucher submission & Adjustment JV (Accessible by OWNER, ACCOUNTANT, DATA_ENTRY)
  fastify.post('/vouchers', { preHandler: [requireAnyRole] }, AccountingController.createVoucher);
  fastify.post('/vouchers/adjust', { preHandler: [requireAnyRole] }, AccountingController.createAdjustmentVoucher);

  // Ledger creation (Restricted to OWNER and ACCOUNTANT)
  fastify.post('/ledgers', { preHandler: [requireAccountantOrOwner] }, AccountingController.createLedger);

  // Accounting & Financial Reports (Schedule III Standard)
  fastify.register(accountingReportsRoutes, { prefix: '/reports' });
}
