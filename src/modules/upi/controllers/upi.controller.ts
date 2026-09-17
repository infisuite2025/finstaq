import { FastifyRequest, FastifyReply } from 'fastify';
import { upiService } from '../services/upi.service';

export class UpiController {
  async generateQr(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = (request.body as any) || {};
      const result = upiService.generateUpiQr(body);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async validateVpa(request: FastifyRequest, reply: FastifyReply) {
    try {
      const vpa = (request.query as any)?.vpa || (request.body as any)?.vpa || 'company@upi';
      const result = upiService.validateVpa(vpa);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async getTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
      const txns = await upiService.getTransactions(tenantId);
      return reply.send({ success: true, data: txns });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async getVpaDirectory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
      const list = await upiService.getVpaDirectory(tenantId);
      return reply.send({ success: true, data: list });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async addVpa(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
      const item = await upiService.addVpa(tenantId, request.body as any);
      return reply.send({ success: true, data: item });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async processCollection(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
      const result = await upiService.processUpiCollection(tenantId, request.body as any);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async processPayout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
      const result = await upiService.processUpiPayout(tenantId, request.body as any);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }
}

export const upiController = new UpiController();
