import { FastifyRequest, FastifyReply } from 'fastify';
import { nicComplianceService, EWayBillInput, EInvoiceInput } from '../services/nic-compliance.service';

export class ComplianceController {
  async generateEWayBill(req: FastifyRequest<{
    Body: EWayBillInput
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    if (!tenantId) return reply.status(400).send({ error: 'Tenant ID required' });

    try {
      const result = await nicComplianceService.generateEWayBillJson(tenantId, req.body);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async generateEInvoice(req: FastifyRequest<{
    Body: EInvoiceInput
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    if (!tenantId) return reply.status(400).send({ error: 'Tenant ID required' });

    try {
      const result = await nicComplianceService.generateEInvoiceJson(tenantId, req.body);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async getRecords(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    if (!tenantId) return reply.status(400).send({ error: 'Tenant ID required' });

    const records = await nicComplianceService.getComplianceRecords(tenantId);
    return reply.send({ success: true, data: records });
  }
}

export const complianceController = new ComplianceController();
