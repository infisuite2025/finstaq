import { FastifyRequest, FastifyReply } from 'fastify';
import { ForexService, ForexGainLossCalculationInput } from '../services/forex.service';

export class ForexController {
  static async getCurrencies(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await ForexService.getCurrencies(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async updateRate(req: FastifyRequest<{
    Body: { code: string; exchangeRateToBase: number }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    try {
      const data = await ForexService.updateRate(tenantId || '27AABCF1234F1Z5', req.body.code, req.body.exchangeRateToBase);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  static async calculateGainLoss(req: FastifyRequest<{
    Body: ForexGainLossCalculationInput
  }>, reply: FastifyReply) {
    try {
      const data = ForexService.calculateRealizedGainLoss(req.body);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  static async getRevaluationReport(req: FastifyRequest<{
    Querystring: { asOfDate?: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await ForexService.getUnrealizedRevaluationReport(tenantId || '27AABCF1234F1Z5', req.query.asOfDate);
    return reply.send({ success: true, data });
  }
}
