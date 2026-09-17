import { FastifyRequest, FastifyReply } from 'fastify';
import { jobWorkService } from '../services/jobwork.service';

export class JobWorkController {
  async getChallans(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const items = await jobWorkService.getChallans(tenantId);
      return reply.send({ success: true, data: items });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async getReceipts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const items = await jobWorkService.getReceipts(tenantId);
      return reply.send({ success: true, data: items });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async createChallan(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const created = await jobWorkService.createChallan(tenantId, request.body as any);
      return reply.send({ success: true, data: created });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async recordReceipt(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const created = await jobWorkService.recordReceipt(tenantId, request.body as any);
      return reply.send({ success: true, data: created });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async getFormItc04(request: FastifyRequest<{ Querystring: { quarter?: string; year?: string } }>, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const query = (request.query || {}) as any;
      const result = await jobWorkService.generateFormItc04(tenantId, query.quarter || 'Q1', query.year || '2026-27');
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }
}

export const jobWorkController = new JobWorkController();
