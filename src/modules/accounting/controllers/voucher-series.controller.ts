import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { VoucherSeriesService } from '../services/voucher-series.service';

const saveSeriesSchema = z.object({
  id: z.string().optional(),
  voucherType: z.string().min(1),
  seriesName: z.string().min(1),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  startNumber: z.coerce.number().min(1).default(1),
  paddingDigits: z.coerce.number().min(1).max(10).default(4),
  restartFrequency: z.enum(['NEVER', 'DAILY', 'MONTHLY', 'YEARLY']).default('YEARLY'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export class VoucherSeriesController {
  public static async listSeries(request: FastifyRequest, reply: FastifyReply) {
    const { voucherType } = request.query as { voucherType?: string };
    const list = await VoucherSeriesService.listSeries(request.tenantId, voucherType);
    return reply.send({ success: true, data: list });
  }

  public static async saveSeries(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = saveSeriesSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ success: false, error: parseResult.error.format() });
    }
    const result = await VoucherSeriesService.saveSeries(request.tenantId, parseResult.data as any);
    return reply.send({ success: true, data: result });
  }

  public static async getNextNumber(request: FastifyRequest, reply: FastifyReply) {
    const { voucherType = 'JOURNAL', seriesId, increment = 'false' } = request.query as {
      voucherType?: string;
      seriesId?: string;
      increment?: string;
    };
    const shouldIncrement = increment === 'true';
    const result = await VoucherSeriesService.getNextVoucherNumber(
      request.tenantId,
      voucherType,
      seriesId,
      shouldIncrement
    );
    return reply.send({ success: true, data: result });
  }
}
