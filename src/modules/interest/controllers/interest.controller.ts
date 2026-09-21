import { FastifyRequest, FastifyReply } from 'fastify';
import { interestService } from '../services/interest.service';

export class InterestController {
  async getOverdueBills(request: FastifyRequest<{ Querystring: { asOfDate?: string } }>, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const bills = interestService.getOverdueBills(tenantId, request.query.asOfDate);
      return reply.send({ success: true, data: bills });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }

  async generateDebitNote(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = interestService.generateInterestDebitNote(request.body as any);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  }
}

export const interestController = new InterestController();
