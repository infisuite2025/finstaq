import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AiDocumentExtractorService } from '../services/ai-extractor.service';
import { NotFoundError, ValidationError } from '../../../core/errors/app-error';
import { prisma } from '../../../core/database/prisma';

const approveAndPostSchema = z.object({
  voucherNumber: z.string().min(1),
  date: z.string(),
  vendorLedgerId: z.string().uuid(),
  purchaseLedgerId: z.string().uuid(),
  taxLedgerId: z.string().uuid().optional(),
  narration: z.string().optional(),
  items: z.array(
    z.object({
      inventoryItemId: z.string().uuid().optional(),
      description: z.string(),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().nonnegative(),
      amount: z.coerce.number().nonnegative(),
    })
  ),
  totalAmount: z.coerce.number().positive(),
  taxAmount: z.coerce.number().nonnegative().optional(),
});

function isValidDocumentSignature(buf: Buffer): boolean {
  if (!buf || buf.length < 4) return true;
  // PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return true;
  // PNG: \x89PNG (0x89 0x50 0x4E 0x47)
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
  // JPEG: \xFF\xD8\xFF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
  // WebP: RIFF
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return true;
  return false;
}

function sanitizeFilename(raw: string): string {
  return raw.replace(/[/\\?%*:|"<>]/g, '_').replace(/\0/g, '').slice(0, 150);
}

export class DocumentController {
  /**
   * Accepts image/PDF upload (via multipart or JSON payload) and extracts structured data
   */
  public static async uploadDocument(request: FastifyRequest, reply: FastifyReply) {
    let filename = 'invoice.pdf';
    let fileUrl = 'https://storage.finstaq.internal/documents/sample-po.pdf';
    let fileBuffer: Buffer | string = 'sample-buffer';

    // Handle Multipart or JSON body
    if (request.isMultipart && request.isMultipart()) {
      const data = await (request as any).file();
      if (data) {
        filename = sanitizeFilename(data.filename);
        const buf = await data.toBuffer();
        if (Buffer.isBuffer(buf) && !isValidDocumentSignature(buf)) {
          throw new ValidationError('Invalid document file type. Only PDF and image formats are permitted.');
        }
        fileBuffer = buf;
        fileUrl = `https://storage.finstaq.internal/documents/${Date.now()}_${filename}`;
      }
    } else if (request.body && typeof request.body === 'object') {
      const body = request.body as any;
      if (body.filename) filename = sanitizeFilename(body.filename);
      if (body.fileUrl) fileUrl = body.fileUrl;
      if (body.fileBase64) fileBuffer = body.fileBase64;
    }

    const result = await AiDocumentExtractorService.processAndSaveDraft(
      request.tenantId,
      request.user.userId,
      fileUrl,
      fileBuffer,
      filename,
      request.db as any
    );


    return reply.status(201).send({
      success: true,
      message: 'Document parsed and draft created successfully',
      data: result,
    });
  }

  /**
   * Lists pending document drafts
   */
  public static async getDrafts(request: FastifyRequest, reply: FastifyReply) {
    const drafts = await prisma.documentDraft.findMany({
      where: { tenantId: request.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reply.send({
      success: true,
      data: drafts,
    });
  }

  /**
   * Gets specific draft by ID
   */
  public static async getDraftById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const draft = await prisma.documentDraft.findFirst({
      where: { id, tenantId: request.tenantId },
    });

    if (!draft) {
      throw new NotFoundError('Document draft not found');
    }

    return reply.send({
      success: true,
      data: draft,
    });
  }

  /**
   * Converts approved draft to official purchase voucher and updates inventory
   */
  public static async approveAndPost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parseResult = approveAndPostSchema.safeParse(request.body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid approval payload', parseResult.error.format());
    }

    const result = await AiDocumentExtractorService.approveAndPostDraft(
      {
        draftId: id,
        tenantId: request.tenantId,
        userId: request.user.userId,
        ...parseResult.data,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
      prisma
    );

    return reply.status(200).send({
      success: true,
      message: 'Draft approved and official Purchase Voucher created',
      data: result,
    });
  }
}
