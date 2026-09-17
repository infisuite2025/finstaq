import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SalesController } from '../controllers/sales.controller';
import { salesReportsRoutes } from './sales-reports.routes';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAccountantOrOwner, requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function salesRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // All sales routes require authentication and tenant isolation scoping
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Summary & KPIs
  fastify.get('/summary', { preHandler: [requireAnyRole] }, SalesController.getSalesSummary);

  // Sales Orders (SO)
  fastify.get('/orders', { preHandler: [requireAnyRole] }, SalesController.getSalesOrders);
  fastify.post('/orders', { preHandler: [requireAnyRole] }, SalesController.createSalesOrder);

  // Delivery Challans (Outward Dispatch)
  fastify.get('/challans', { preHandler: [requireAnyRole] }, SalesController.getDeliveryChallans);
  fastify.post('/challans', { preHandler: [requireAnyRole] }, SalesController.createDeliveryChallan);

  // Sales Invoice Voucher Generation (Restricted to OWNER & ACCOUNTANT)
  fastify.post('/invoices/generate-voucher', { preHandler: [requireAccountantOrOwner] }, SalesController.generateSalesInvoiceVoucher);

  // Sales Department Reports (Enterprise Grade)
  fastify.register(salesReportsRoutes, { prefix: '/reports' });
}

