import { FastifyReply, FastifyRequest } from 'fastify';
import { superAdminService } from '../services/super-admin.service';

export class SuperAdminController {
  // Tenants
  async getTenants(_req: FastifyRequest, reply: FastifyReply) {
    const tenants = await superAdminService.listTenants();
    return reply.send({ success: true, count: tenants.length, data: tenants });
  }

  async resolveSubdomain(req: FastifyRequest<{ Params: { subdomain: string } }>, reply: FastifyReply) {
    const { subdomain } = req.params;
    const tenant = await superAdminService.getTenantBySubdomain(subdomain);
    if (!tenant) {
      return reply.status(404).send({ success: false, error: `No tenant found for subdomain '${subdomain}.finstaq.com'` });
    }
    return reply.send({ success: true, data: tenant });
  }

  async updateTenantStatus(req: FastifyRequest<{ Params: { id: string }; Body: { status: any; suspendedReason?: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const { status, suspendedReason } = req.body;
    try {
      const updated = await superAdminService.updateTenantStatus(id, status, suspendedReason);
      return reply.send({ success: true, message: `Tenant ${updated.name} status changed to ${status}`, data: updated });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async createTenant(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const created = await superAdminService.createTenant(req.body as any);
      return reply.status(201).send({ success: true, message: 'Tenant onboarded successfully', data: created });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  // Invoices & Billing
  async getInvoices(req: FastifyRequest<{ Querystring: { tenantId?: string } }>, reply: FastifyReply) {
    const invoices = await superAdminService.listInvoices(req.query.tenantId);
    return reply.send({ success: true, count: invoices.length, data: invoices });
  }

  async createInvoice(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const invoice = await superAdminService.createInvoice(req.body as any);
      return reply.status(201).send({ success: true, message: 'Subscription invoice generated', data: invoice });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async recordPayment(req: FastifyRequest<{ Params: { id: string }; Body: { paymentRef: string } }>, reply: FastifyReply) {
    try {
      const invoice = await superAdminService.recordPayment(req.params.id, (req.body as any)?.paymentRef);
      return reply.send({ success: true, message: 'Payment recorded and marked as PAID', data: invoice });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  // Help Topics & Knowledge CMS
  async getHelpTopics(req: FastifyRequest<{ Querystring: { query?: string; category?: string } }>, reply: FastifyReply) {
    const { query, category } = req.query;
    const topics = await superAdminService.listHelpTopics(query, category);
    return reply.send({ success: true, count: topics.length, data: topics });
  }

  async upsertHelpTopic(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const topic = await superAdminService.upsertHelpTopic(req.body as any);
      return reply.send({ success: true, message: 'Knowledge topic saved successfully', data: topic });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async deleteHelpTopic(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const success = await superAdminService.deleteHelpTopic(req.params.id);
    return reply.send({ success, message: success ? 'Topic deleted' : 'Topic not found' });
  }

  // Metrics
  async getMetrics(_req: FastifyRequest, reply: FastifyReply) {
    const metrics = await superAdminService.getPlatformMetrics();
    return reply.send({ success: true, data: metrics });
  }
}

export const superAdminController = new SuperAdminController();
