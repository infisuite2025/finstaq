import { FastifyRequest, FastifyReply } from 'fastify';
import { tdsTcsService } from '../services/tds-tcs.service';

export class TdsTcsController {
  async getSections(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const sections = tdsTcsService.getSections();
      return reply.send({ success: true, data: sections });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async calculateDeduction(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = tdsTcsService.calculateDeduction(request.body as any);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async calculateTcs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const result = await tdsTcsService.calculateTcs(tenantId, request.body as any);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  async getForm26q(request: FastifyRequest<{ Querystring: { quarter?: string; fy?: string } }>, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const query = (request.query || {}) as any;
      const data = await tdsTcsService.getForm26q(tenantId, query.quarter || 'Q4', query.fy || '2025-2026');
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async getForm27eq(request: FastifyRequest<{ Querystring: { quarter?: string; fy?: string } }>, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const query = (request.query || {}) as any;
      const data = await tdsTcsService.getForm27Eq(tenantId, query.quarter || 'Q1', query.fy || '2026-2027');
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }
}

export const tdsTcsController = new TdsTcsController();
