import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AccountingService } from '../services/accounting.service';
import { TaxEngine } from '../../tax/tax.engine';
import { BillReferenceType, VoucherType } from '@prisma/client';
import { ValidationError } from '../../../core/errors/app-error';

// Zod Validation Schemas
const voucherItemSchema = z.object({
  ledgerId: z.string().uuid(),
  debitAmount: z.coerce.number().min(0).default(0),
  creditAmount: z.coerce.number().min(0).default(0),
  billReferenceType: z.nativeEnum(BillReferenceType).optional(),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(255).optional(),
});

const createVoucherSchema = z.object({
  type: z.nativeEnum(VoucherType),
  voucherNumber: z.string().min(1).max(100),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  narration: z.string().max(1000).optional(),
  isSystemGenerated: z.boolean().optional().default(false),
  sourceModule: z.string().max(50).optional(),
  sourceDocumentId: z.string().max(100).optional(),
  sourceDocumentNumber: z.string().max(100).optional(),
  items: z.array(voucherItemSchema).min(2, 'At least 2 line items are required for double-entry (Dr and Cr legs)'),
});

const createAdjustmentVoucherSchema = z.object({
  sourceVoucherId: z.string().uuid(),
  voucherNumber: z.string().min(1).max(100),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  narration: z.string().min(1, 'Narration explaining the adjustment reason is mandatory').max(1000),
  items: z.array(voucherItemSchema).min(2, 'At least 2 line items are required for double-entry adjustment'),
});

const createLedgerSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional(),
  openingBalance: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

const calculateTaxSchema = z.object({
  supplierGstIn: z.string().optional(),
  customerGstIn: z.string().optional(),
  placeOfSupplyState: z.string().optional(),
  items: z.array(
    z.object({
      ledgerId: z.string(),
      taxableAmount: z.coerce.number().min(0),
      hsnCode: z.string().optional(),
      taxRatePercent: z.coerce.number().min(0).max(100),
    })
  ),
});

export class AccountingController {
  /**
   * Submits a transaction-safe voucher with strict double-entry Dr=Cr sanity checks
   */
  public static async createVoucher(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createVoucherSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid voucher submission payload', parseResult.error.format());
    }

    const { type, voucherNumber, date, narration, isSystemGenerated, sourceModule, sourceDocumentId, sourceDocumentNumber, items } = parseResult.data;

    const voucher = await AccountingService.createVoucher({
      tenantId: request.tenantId,
      userId: request.user.userId,
      type,
      voucherNumber,
      date,
      narration,
      isSystemGenerated,
      sourceModule,
      sourceDocumentId,
      sourceDocumentNumber,
      items,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.status(201).send({
      success: true,
      message: 'Voucher posted successfully with double-entry balance validation',
      data: voucher,
    });
  }

  /**
   * Posts a manual Adjustment / Reversal Journal Voucher referencing a locked system voucher
   */
  public static async createAdjustmentVoucher(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createAdjustmentVoucherSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid adjustment voucher payload', parseResult.error.format());
    }

    const voucher = await AccountingService.createAdjustmentVoucher({
      tenantId: request.tenantId,
      userId: request.user.userId,
      ...parseResult.data,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.status(201).send({
      success: true,
      message: 'Adjustment Journal Voucher (JV) posted successfully',
      data: voucher,
    });
  }

  /**
   * Retrieves vouchers register with system generation tags and Dr/Cr balances
   */
  public static async getVouchers(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const result = await AccountingService.getVouchers({
      tenantId: request.tenantId,
      type: query.type,
      isSystemGenerated: query.isSystemGenerated !== undefined ? query.isSystemGenerated === 'true' : undefined,
      sourceModule: query.sourceModule,
      startDate: query.startDate,
      endDate: query.endDate,
      search: query.search,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
    });

    return reply.send({
      success: true,
      data: result,
    });
  }

  /**
   * Retrieves tenant ledgers
   */
  public static async getLedgers(request: FastifyRequest, reply: FastifyReply) {
    const ledgers = await AccountingService.getLedgers(request.tenantId);
    return reply.send({
      success: true,
      data: ledgers,
    });
  }

  /**
   * Retrieves tenant ledger groups (Chart of accounts)
   */
  public static async getLedgerGroups(request: FastifyRequest, reply: FastifyReply) {
    const groups = await AccountingService.getLedgerGroups(request.tenantId);
    return reply.send({
      success: true,
      data: groups,
    });
  }

  /**
   * Quick-creates a new ledger inline (Alt+C)
   */
  public static async createLedger(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createLedgerSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid ledger creation payload', parseResult.error.format());
    }

    const ledger = await AccountingService.createLedger(
      {
        tenantId: request.tenantId,
        ...parseResult.data,
      },
      request.user.userId
    );

    return reply.status(201).send({
      success: true,
      message: 'Ledger created successfully',
      data: ledger,
    });
  }

  /**
   * Calculates GST breakdown on the fly
   */
  public static async calculateTax(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = calculateTaxSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid tax calculation payload', parseResult.error.format());
    }

    const result = TaxEngine.calculateTax(parseResult.data);
    return reply.send({
      success: true,
      data: result,
    });
  }
}
