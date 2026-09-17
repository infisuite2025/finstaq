import { FastifyRequest, FastifyReply } from 'fastify';
import { pdcService } from '../services/pdc.service';

export class PdcController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const items = await pdcService.getPdcList(tenantId);
      return reply.send({ success: true, data: items });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const created = await pdcService.createPdc(tenantId, request.body as any);
      return reply.send({ success: true, data: created });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async promote(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const result = await pdcService.promoteToActiveVoucher(tenantId, request.params.id);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }
}

export const pdcController = new PdcController();
