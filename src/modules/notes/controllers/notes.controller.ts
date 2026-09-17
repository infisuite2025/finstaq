import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { NotesService } from '../services/notes.service';
import { ValidationError } from '../../../core/errors/app-error';

const createNoteSchema = z.object({
  noteType: z.enum(['DEBIT_NOTE', 'CREDIT_NOTE']),
  noteDate: z.string().optional(),
  partyLedgerId: z.string().min(1),
  partyName: z.string().min(1),
  partyGstin: z.string().default('27AABCF1234F1Z5'),
  partyAddress: z.string().default('Maharashtra, India'),
  originalInvoiceNumber: z.string().min(1),
  originalInvoiceDate: z.string().min(1),
  reason: z.enum(['SALES_RETURN', 'PURCHASE_RETURN', 'DEFICIENCY_IN_SERVICE', 'POST_SALE_DISCOUNT', 'CORRECTION_IN_INVOICE', 'RATE_DIFFERENCE', 'OTHER']),
  reasonDescription: z.string().max(500).optional(),
  placeOfSupply: z.string().default('27-Maharashtra'),
  isInterstate: z.boolean().default(false),
  items: z.array(z.object({
    itemId: z.string().optional(),
    sku: z.string().optional(),
    description: z.string().min(1),
    hsnCode: z.string().default('72142090'),
    uom: z.string().default('NOS'),
    qty: z.number().positive(),
    unitRate: z.number().positive(),
    gstRatePercent: z.number().min(0).default(18.0),
  })).min(1),
});

export class NotesController {
  public static async getNotes(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const tenantId = request.user?.tenantId || (request.headers['x-tenant-id'] as string);
    const notes = await NotesService.getNotes(tenantId, query.type, query.search);
    return reply.send({ success: true, data: notes });
  }

  public static async getNoteById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const tenantId = request.user?.tenantId || (request.headers['x-tenant-id'] as string);
    const note = await NotesService.getNoteById(tenantId, id);
    if (!note) {
      return reply.status(404).send({ success: false, message: 'Debit/Credit Note not found' });
    }
    return reply.send({ success: true, data: note });
  }

  public static async createNote(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createNoteSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid Debit/Credit Note payload', parseResult.error.format());
    }

    const note = await NotesService.createNote({
      tenantId: request.tenantId,
      userId: request.user?.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: `${parseResult.data.noteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} ${note.noteNumber} posted successfully`,
      data: note,
    });
  }
}
