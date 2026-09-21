import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PurchaseService } from '../services/purchase.service';
import { ValidationError } from '../../../core/errors/app-error';

const createPoSchema = z.object({
  poNumber: z.string().min(1),
  vendorLedgerId: z.string().min(1),
  orderDate: z.string(),
  expectedDeliveryDate: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(
    z.object({
      inventoryItemId: z.string().optional(),
      description: z.string().min(1),
      hsnCode: z.string().optional(),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().positive(),
      taxRatePercent: z.coerce.number().min(0).default(18),
    })
  ).min(1),
});

const createGrnSchema = z.object({
  grnNumber: z.string().min(1),
  poId: z.string().optional(),
  vendorLedgerId: z.string().min(1),
  receivedDate: z.string(),
  vehicleNumber: z.string().optional(),
  challanNumber: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      inventoryItemId: z.string().optional(),
      description: z.string().min(1),
      receivedQty: z.coerce.number().positive(),
      rejectedQty: z.coerce.number().min(0).default(0),
      rejectionReason: z.string().optional(),
      batchNumber: z.string().optional(),
    })
  ).min(1),
});

const threeWayMatchSchema = z.object({
  poId: z.string().min(1),
  grnId: z.string().min(1),
  invoicedTotalAmount: z.coerce.number().positive(),
  invoicedItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().positive(),
    })
  ),
  voucherId: z.string().optional(),
});

const createPurchaseInvoiceSchema = z.object({
  vendorInvoiceNumber: z.string().min(1),
  vendorLedgerId: z.string().min(1),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  poId: z.string().optional(),
  grnId: z.string().optional(),
  paymentTerms: z.string().optional(),
  tdsSection: z.string().optional(),
  tdsRatePercent: z.coerce.number().min(0).optional(),
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      inventoryItemId: z.string().optional(),
      description: z.string().min(1),
      hsnCode: z.string().optional(),
      uom: z.string().optional(),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().positive(),
      discountPercent: z.coerce.number().min(0).max(100).default(0),
      taxRatePercent: z.coerce.number().min(0).default(18),
    })
  ).min(1),
});

const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentMode: z.string().default('BANK_TRANSFER'),
  referenceNo: z.string().min(1),
  paymentDate: z.string(),
});

const createDebitNoteSchema = z.object({
  invoiceId: z.string().min(1),
  reason: z.string().min(1),
  amount: z.coerce.number().positive(),
  taxAmount: z.coerce.number().min(0).default(0),
});

export class PurchaseController {
  // PO Endpoints
  public static async createPurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createPoSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid PO payload', parseResult.error.format());
    }

    const po = await PurchaseService.createPurchaseOrder({
      tenantId: request.tenantId,
      userId: request.user?.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: 'Purchase Order created successfully',
      data: po,
    });
  }

  public static async getPurchaseOrders(request: FastifyRequest, reply: FastifyReply) {
    const pos = await PurchaseService.getPurchaseOrders(request.tenantId);
    return reply.send({ success: true, data: pos });
  }

  // GRN Endpoints
  public static async createGoodsReceiptNote(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createGrnSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid GRN payload', parseResult.error.format());
    }

    const grn = await PurchaseService.createGoodsReceiptNote({
      tenantId: request.tenantId,
      userId: request.user?.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: 'Goods Receipt Note created and stock updated successfully',
      data: grn,
    });
  }

  public static async getGoodsReceiptNotes(request: FastifyRequest, reply: FastifyReply) {
    const grns = await PurchaseService.getGoodsReceiptNotes(request.tenantId);
    return reply.send({ success: true, data: grns });
  }

  // 3-Way Matching Engine
  public static async performThreeWayMatch(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = threeWayMatchSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid 3-Way Match payload', parseResult.error.format());
    }

    const match = await PurchaseService.performThreeWayMatch({
      tenantId: request.tenantId,
      ...parseResult.data,
    });

    return reply.send({
      success: true,
      message: '3-Way Matching executed successfully',
      data: match,
    });
  }

  // Purchase Invoice / Vendor Bill Booking
  public static async createPurchaseInvoice(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createPurchaseInvoiceSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid Purchase Invoice booking payload', parseResult.error.format());
    }

    const invoice = await PurchaseService.createPurchaseInvoice({
      tenantId: request.tenantId,
      userId: request.user?.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: `Purchase Invoice ${invoice.invoiceNumber} booked and posted to GL successfully`,
      data: invoice,
    });
  }

  public static async getPurchaseInvoices(request: FastifyRequest, reply: FastifyReply) {
    const { vendorId, status } = request.query as { vendorId?: string; status?: string };
    const invoices = await PurchaseService.getPurchaseInvoices(request.tenantId, { vendorId, status });
    return reply.send({ success: true, data: invoices });
  }

  public static async getPurchaseInvoiceById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const invoice = await PurchaseService.getPurchaseInvoiceById(request.tenantId, id);
    return reply.send({ success: true, data: invoice });
  }

  public static async recordInvoicePayment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parseResult = recordPaymentSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid payment recording payload', parseResult.error.format());
    }

    const updatedInvoice = await PurchaseService.recordInvoicePayment(
      request.tenantId,
      id,
      parseResult.data
    );

    return reply.send({
      success: true,
      message: 'Vendor bill payment recorded successfully',
      data: updatedInvoice,
    });
  }

  public static async createDebitNote(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createDebitNoteSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid Debit Note payload', parseResult.error.format());
    }

    const debitNote = await PurchaseService.createDebitNote(request.tenantId, parseResult.data);
    return reply.status(201).send({
      success: true,
      message: 'Debit Note issued and vendor ledger credited successfully',
      data: debitNote,
    });
  }

  // Summary
  public static async getProcurementSummary(request: FastifyRequest, reply: FastifyReply) {
    const summary = await PurchaseService.getProcurementSummary(request.tenantId);
    return reply.send({ success: true, data: summary });
  }
}
