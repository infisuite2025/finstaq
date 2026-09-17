import { FastifyInstance } from 'fastify';
import { SalesReportsController } from '../controllers/sales-reports.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';

export async function salesReportsRoutes(fastify: FastifyInstance) {
  const controller = new SalesReportsController();

  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // 1. Sales Register (Day Book & Periodic Monthly Summary)
  fastify.get('/register', controller.getSalesRegister);

  // 2. Sales Order Outstanding & Pending Fulfillment Matrix
  fastify.get('/so-outstanding', controller.getSOOutstanding);

  // 3. Delivery Challan & Outward Dispatch Register
  fastify.get('/challans', controller.getDeliveryChallans);

  // 4. Sales Bills Pending (Goods Delivered but Unbilled)
  fastify.get('/bills-pending', controller.getBillsPending);

  // 5. Customer-wise Sales Revenue & Pareto Distribution
  fastify.get('/customer-sales', controller.getCustomerSalesSummary);

  // 6. Item / Product-wise Sales Analysis & Gross Margin
  fastify.get('/item-sales', controller.getItemSalesSummary);

  // 7. Customer Receivables Aging Analysis (Sundry Debtors)
  fastify.get('/customer-aging', controller.getCustomerAging);

  // 8. Statutory Outward GST Summary (GSTR-1 Matrix)
  fastify.get('/gstr1-summary', controller.getGstr1Summary);

  // 9. Credit Notes & Sales Returns Register
  fastify.get('/returns', controller.getSalesReturns);
}
