import { FastifyInstance } from 'fastify';
import { superAdminController } from '../controllers/super-admin.controller';

export async function superAdminRoutes(fastify: FastifyInstance) {
  // Public/Tenant Accessible Knowledge & Subdomain Resolution
  fastify.get('/help/topics', (req, rep) => superAdminController.getHelpTopics(req as any, rep));
  fastify.get('/tenants/resolve/:subdomain', (req, rep) => superAdminController.resolveSubdomain(req as any, rep));

  // Platform Owner / Super Admin APIs
  fastify.get('/super-admin/metrics', (req, rep) => superAdminController.getMetrics(req, rep));
  fastify.get('/super-admin/tenants', (req, rep) => superAdminController.getTenants(req, rep));
  fastify.post('/super-admin/tenants', (req, rep) => superAdminController.createTenant(req as any, rep));
  fastify.patch('/super-admin/tenants/:id/status', (req, rep) => superAdminController.updateTenantStatus(req as any, rep));

  fastify.get('/super-admin/invoices', (req, rep) => superAdminController.getInvoices(req as any, rep));
  fastify.post('/super-admin/invoices', (req, rep) => superAdminController.createInvoice(req as any, rep));
  fastify.patch('/super-admin/invoices/:id/pay', (req, rep) => superAdminController.recordPayment(req as any, rep));

  fastify.post('/super-admin/help/topics', (req, rep) => superAdminController.upsertHelpTopic(req as any, rep));
  fastify.delete('/super-admin/help/topics/:id', (req, rep) => superAdminController.deleteHelpTopic(req as any, rep));
}
