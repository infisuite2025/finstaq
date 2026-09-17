// @ts-nocheck
import { FastifyRequest, FastifyReply } from 'fastify';
import { ReturnsService } from '../services/returns.service';
import { AppError } from '../../../core/errors/app-error';

export class ReturnsController {
  public static async createPurchaseReturn(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;

    const pr = await ReturnsService.createPurchaseReturn({
      tenantId: request.user?.tenantId || 'unknown-tenant',
      userId: request.user?.userId || 'unknown-user',
      userName: request.user?.email || 'Unknown User',
      returnDate: data.returnDate || new Date().toISOString(),
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      vendorGstin: data.vendorGstin || '',
      vendorAddress: data.vendorAddress || '',
      originalPoNumber: data.originalPoNumber,
      originalGrnNumber: data.originalGrnNumber,
      originalBillNumber: data.originalBillNumber,
      reasonForReturn: data.reasonForReturn,
      warehouseId: data.warehouseId,
      warehouseName: data.warehouseName,
      items: data.items,
      freightCharges: data.freightCharges,
      otherCharges: data.otherCharges,
      debitNoteNumber: data.debitNoteNumber,
    });
    return reply.send({ success: true, data: pr });
  }

  public static async createSalesReturn(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;

    const sr = await ReturnsService.createSalesReturn({
      tenantId: request.user?.tenantId || 'unknown-tenant',
      userId: request.user?.userId || 'unknown-user',
      userName: request.user?.email || 'Unknown User',
      returnDate: data.returnDate || new Date().toISOString(),
      customerId: data.customerId,
      customerName: data.customerName,
      customerGstin: data.customerGstin || '',
      customerAddress: data.customerAddress || '',
      originalSoNumber: data.originalSoNumber,
      originalInvoiceNumber: data.originalInvoiceNumber,
      originalChallanNumber: data.originalChallanNumber,
      reasonForReturn: data.reasonForReturn,
      destinationWarehouseId: data.destinationWarehouseId,
      destinationWarehouseName: data.destinationWarehouseName,
      items: data.items,
      freightCharges: data.freightCharges,
      otherCharges: data.otherCharges,
      creditNoteNumber: data.creditNoteNumber,
    });
    return reply.send({ success: true, data: sr });
  }

  public static async getPurchaseReturns(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant ID missing', 400);
    const returns = await ReturnsService.getPurchaseReturns(tenantId);
    return reply.send({ success: true, data: returns });
  }

  public static async getSalesReturns(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant ID missing', 400);
    const returns = await ReturnsService.getSalesReturns(tenantId);
    return reply.send({ success: true, data: returns });
  }
}
