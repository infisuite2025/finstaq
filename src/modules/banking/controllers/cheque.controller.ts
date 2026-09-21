import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ChequeService } from '../services/cheque.service';

const createBookSchema = z.object({
  bankLedgerId: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  bookSeries: z.string().min(1),
  fromChequeNo: z.coerce.number().min(1),
  toChequeNo: z.coerce.number().min(1),
});

const issueChequeSchema = z.object({
  bookId: z.string().min(1),
  chequeNumber: z.string().optional(),
  voucherNumber: z.string().min(1),
  payeeName: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isCrossed: z.boolean().default(true),
  remarks: z.string().optional(),
});

const cancelChequeSchema = z.object({
  chequeId: z.string().min(1),
  reason: z.string().min(1),
});

export class ChequeController {
  public static async listBooks(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const books = await ChequeService.listChequeBooks(tenantId);
    return reply.send({ success: true, data: books });
  }

  public static async createBook(request: FastifyRequest, reply: FastifyReply) {
    const parse = createBookSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ success: false, error: parse.error.format() });
    }
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const book = await ChequeService.addChequeBook(tenantId, parse.data);
    return reply.send({ success: true, data: book });
  }

  public static async listCheques(request: FastifyRequest, reply: FastifyReply) {
    const { bookId, status } = request.query as { bookId?: string; status?: string };
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const cheques = await ChequeService.listCheques(tenantId, bookId, status);
    return reply.send({ success: true, data: cheques });
  }

  public static async issueCheque(request: FastifyRequest, reply: FastifyReply) {
    const parse = issueChequeSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ success: false, error: parse.error.format() });
    }
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const result = await ChequeService.issueCheque(tenantId, parse.data);
    return reply.send({ success: true, data: result });
  }

  public static async cancelCheque(request: FastifyRequest, reply: FastifyReply) {
    const parse = cancelChequeSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ success: false, error: parse.error.format() });
    }
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const result = await ChequeService.cancelCheque(tenantId, parse.data.chequeId, parse.data.reason);
    return reply.send({ success: true, data: result });
  }

  public static async getTemplates(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const templates = await ChequeService.getTemplates(tenantId);
    return reply.send({ success: true, data: templates });
  }

  public static async saveTemplate(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const result = await ChequeService.saveTemplate(tenantId, request.body as any);
    return reply.send({ success: true, data: result });
  }

  public static async preparePrint(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const result = await ChequeService.preparePrintPayload(tenantId, request.body as any);
    return reply.send({ success: true, data: result });
  }
}
