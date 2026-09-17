import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PurchaseController } from '../controllers/purchase.controller';
import { purchaseReportsRoutes } from './purchase-reports.routes';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAccountantOrOwner, requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function purchaseRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // All procurement routes require authentication and tenant isolation scoping
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Summary and KPIs
  fastify.get('/summary', { preHandler: [requireAnyRole] }, PurchaseController.getProcurementSummary);

  // Purchase Orders
  fastify.get('/orders', { preHandler: [requireAnyRole] }, PurchaseController.getPurchaseOrders);
  fastify.post('/orders', { preHandler: [requireAnyRole] }, PurchaseController.createPurchaseOrder);

  // Goods Receipt Notes (GRN)
  fastify.get('/grn', { preHandler: [requireAnyRole] }, PurchaseController.getGoodsReceiptNotes);
  fastify.post('/grn', { preHandler: [requireAnyRole] }, PurchaseController.createGoodsReceiptNote);

  // Purchase Invoices / Vendor Bill Booking & AP Management
  fastify.get('/invoices', { preHandler: [requireAnyRole] }, PurchaseController.getPurchaseInvoices);
  fastify.post('/invoices', { preHandler: [requireAnyRole] }, PurchaseController.createPurchaseInvoice);
  fastify.get('/invoices/:id', { preHandler: [requireAnyRole] }, PurchaseController.getPurchaseInvoiceById);
  fastify.post('/invoices/:id/pay', { preHandler: [requireAccountantOrOwner] }, PurchaseController.recordInvoicePayment);
  fastify.post('/debit-notes', { preHandler: [requireAccountantOrOwner] }, PurchaseController.createDebitNote);

  // Automated 3-Way Matching Engine
  fastify.post('/three-way-match', { preHandler: [requireAccountantOrOwner] }, PurchaseController.performThreeWayMatch);

  // Purchase Department Reports (Enterprise Grade)
  fastify.register(purchaseReportsRoutes, { prefix: '/reports' });
}
