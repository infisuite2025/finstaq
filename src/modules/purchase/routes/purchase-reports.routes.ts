import { FastifyInstance } from 'fastify';
import { PurchaseReportsController } from '../controllers/purchase-reports.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';

export async function purchaseReportsRoutes(fastify: FastifyInstance) {
  const controller = new PurchaseReportsController();

  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // 1. Purchase Register
  fastify.get('/register', controller.getPurchaseRegister);

  // 2. PO Outstanding & Pending Matrix
  fastify.get('/po-outstanding', controller.getPOOutstanding);

  // 3. GRN Inward & QC Rejection Register
  fastify.get('/grn-rejections', controller.getGRNRejection);

  // 4. Purchase Bills Pending (Uninvoiced GRNs / GR-IR Accruals)
  fastify.get('/bills-pending', controller.getBillsPending);

  // 5. Vendor-wise Purchase Spend Summary
  fastify.get('/vendor-spend', controller.getVendorSpendSummary);

  // 6. Item / Product-wise Purchase Summary
  fastify.get('/item-summary', controller.getItemPurchaseSummary);

  // 7. 3-Way Reconciliation Variance Audit
  fastify.get('/three-way-variance', controller.getThreeWayVariance);

  // 8. Vendor Payables Aging Analysis (Sundry Creditors)
  fastify.get('/vendor-aging', controller.getVendorAging);

  // 9. Input Tax Credit (ITC) / Inward GST Summary
  fastify.get('/itc-summary', controller.getITCSummary);
}
