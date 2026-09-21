import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SalesService } from '../services/sales.service';
import { ValidationError } from '../../../core/errors/app-error';

const createSoSchema = z.object({
  soNumber: z.string().min(1),
  customerLedgerId: z.string().min(1),
  orderDate: z.string(),
  deliveryDueDate: z.string().optional(),
  customerPoReference: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingAddress: z.string().optional(),
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

const createChallanSchema = z.object({
  challanNumber: z.string().min(1),
  soId: z.string().optional(),
  customerLedgerId: z.string().min(1),
  dispatchDate: z.string(),
  vehicleNumber: z.string().optional(),
  transporterName: z.string().optional(),
  eWayBillNumber: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      inventoryItemId: z.string().optional(),
      description: z.string().min(1),
      dispatchedQty: z.coerce.number().positive(),
      batchNumber: z.string().optional(),
    })
  ).min(1),
});

const generateInvoiceSchema = z.object({
  soId: z.string().min(1),
  voucherNumber: z.string().min(1),
  date: z.string(),
  salesLedgerId: z.string().min(1),
  cgstLedgerId: z.string().optional(),
  sgstLedgerId: z.string().optional(),
  igstLedgerId: z.string().optional(),
  narration: z.string().optional(),
});

export class SalesController {
  public static async createSalesOrder(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createSoSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid Sales Order payload', parseResult.error.format());
    }

    const so = await SalesService.createSalesOrder({
      tenantId: request.tenantId,
      userId: request.user.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: 'Sales Order created successfully',
      data: so,
    });
  }

  public static async getSalesOrders(request: FastifyRequest, reply: FastifyReply) {
    const sos = await SalesService.getSalesOrders(request.tenantId);
    return reply.send({ success: true, data: sos });
  }

  public static async createDeliveryChallan(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createChallanSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid Delivery Challan payload', parseResult.error.format());
    }

    const challan = await SalesService.createDeliveryChallan({
      tenantId: request.tenantId,
      userId: request.user.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: 'Delivery Challan issued and inventory stock updated',
      data: challan,
    });
  }

  public static async getDeliveryChallans(request: FastifyRequest, reply: FastifyReply) {
    const challans = await SalesService.getDeliveryChallans(request.tenantId);
    return reply.send({ success: true, data: challans });
  }

  public static async generateSalesInvoiceVoucher(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = generateInvoiceSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid Sales Invoice payload', parseResult.error.format());
    }

    const voucher = await SalesService.generateSalesInvoiceVoucher({
      tenantId: request.tenantId,
      userId: request.user.userId,
      ...parseResult.data,
    });

    return reply.status(201).send({
      success: true,
      message: 'Sales Invoice Voucher booked into Double-Entry Ledger',
      data: voucher,
    });
  }

  public static async getSalesSummary(request: FastifyRequest, reply: FastifyReply) {
    const summary = await SalesService.getSalesSummary(request.tenantId);
    return reply.send({ success: true, data: summary });
  }
}
