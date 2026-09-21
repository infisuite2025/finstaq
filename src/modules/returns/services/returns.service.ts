// @ts-nocheck
import { AuditService } from '../../audit/services/audit.service';
import { AppError } from '../../../core/errors/app-error';
import { prisma } from '../../../core/database/prisma';

export interface PurchaseReturnItem {
  id: string;
  itemId?: string | null;
  sku?: string | null;
  description: string;
  hsnCode: string;
  uom: string;
  returnQty: number;
  unitPrice: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  reason: string;
}

export interface PurchaseReturn {
  id: string;
  tenantId: string;
  returnNumber: string;
  returnDate: string;
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  vendorAddress: string;
  originalPoNumber?: string | null;
  originalGrnNumber?: string | null;
  originalBillNumber?: string | null;
  warehouseId: string;
  warehouseName: string;
  vehicleNumber?: string;
  transporterName?: string;
  debitNoteNumber?: string | null;
  totalTaxableAmount: number;
  totalGstAmount: number;
  grandTotal: number;
  status: 'DISPATCHED' | 'ACKNOWLEDGED' | 'CANCELLED';
  remarks?: string;
  items: PurchaseReturnItem[];
  createdAt: string;
}

export interface SalesReturnItem {
  id: string;
  itemId?: string | null;
  sku?: string | null;
  description: string;
  hsnCode: string;
  uom: string;
  returnQty: number;
  unitPrice: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  qcDisposition: 'RESTOCK_GOOD' | 'MOVE_TO_SCRAP' | 'UNDER_REPAIR' | 'REJECTED';
  reason: string;
}

export interface SalesReturn {
  id: string;
  tenantId: string;
  returnNumber: string;
  returnDate: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerAddress: string;
  originalInvoiceNumber?: string | null;
  originalChallanNumber?: string | null;
  originalSoNumber?: string | null;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  creditNoteNumber?: string | null;
  totalTaxableAmount: number;
  totalGstAmount: number;
  grandTotal: number;
  status: 'RECEIVED' | 'INSPECTED' | 'RESTOCKED' | 'CANCELLED';
  remarks?: string;
  items: SalesReturnItem[];
  createdAt: string;
}

export class ReturnsService {
  public static async getPurchaseReturns(tenantId: string, search?: string): Promise<PurchaseReturn[]> {
    const list = await prisma.purchaseReturn.findMany({
      where: {
        tenantId,
        ...(search ? {
          OR: [
            { returnNumber: { contains: search } },
            { vendorName: { contains: search } },
            { originalBillNumber: { contains: search } },
          ],
        } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(pr => ({
      ...pr,
      returnDate: pr.returnDate.toISOString().split('T')[0],
      totalTaxableAmount: Number(pr.totalTaxableAmount),
      totalGstAmount: Number(pr.totalGstAmount),
      grandTotal: Number(pr.grandTotal),
      status: pr.status as any,
      createdAt: pr.createdAt.toISOString(),
      items: pr.items.map(i => ({
        ...i,
        returnQty: Number(i.returnQty),
        unitPrice: Number(i.unitPrice),
        taxableAmount: Number(i.taxableAmount),
        gstRatePercent: Number(i.gstRatePercent),
        cgstAmount: Number(i.cgstAmount),
        sgstAmount: Number(i.sgstAmount),
        igstAmount: Number(i.igstAmount),
        totalAmount: Number(i.totalAmount),
      }))
    }));
  }

  public static async getPurchaseReturnById(tenantId: string, id: string): Promise<PurchaseReturn | undefined> {
    const pr = await prisma.purchaseReturn.findFirst({
      where: { tenantId, id },
      include: { items: true },
    });
    if (!pr) return undefined;
    return {
      ...pr,
      returnDate: pr.returnDate.toISOString().split('T')[0],
      totalTaxableAmount: Number(pr.totalTaxableAmount),
      totalGstAmount: Number(pr.totalGstAmount),
      grandTotal: Number(pr.grandTotal),
      status: pr.status as any,
      createdAt: pr.createdAt.toISOString(),
      items: pr.items.map(i => ({
        ...i,
        returnQty: Number(i.returnQty),
        unitPrice: Number(i.unitPrice),
        taxableAmount: Number(i.taxableAmount),
        gstRatePercent: Number(i.gstRatePercent),
        cgstAmount: Number(i.cgstAmount),
        sgstAmount: Number(i.sgstAmount),
        igstAmount: Number(i.igstAmount),
        totalAmount: Number(i.totalAmount),
      }))
    };
  }

  public static async createPurchaseReturn(params: {
    tenantId: string;
    returnDate: string;
    vendorId: string;
    vendorName: string;
    vendorGstin: string;
    vendorAddress: string;
    originalPoNumber?: string | null;
    originalGrnNumber?: string | null;
    originalBillNumber?: string | null;
    warehouseId: string;
    warehouseName: string;
    vehicleNumber?: string;
    transporterName?: string;
    remarks?: string;
    items: Omit<PurchaseReturnItem, 'id'>[];
    userId: string;
    userName: string;
  }): Promise<PurchaseReturn> {
    const count = await prisma.purchaseReturn.count({ where: { tenantId: params.tenantId }});
    const returnNumber = 'PR-2026-' + String(count + 1).padStart(3, '0');
    const debitNoteNumber = 'DN-2026-' + String(count + 1).padStart(3, '0');

    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let grandTotal = 0;

    params.items.forEach((item) => {
      totalTaxableAmount += item.taxableAmount;
      totalGstAmount += item.cgstAmount + item.sgstAmount + item.igstAmount;
      grandTotal += item.totalAmount;
    });

    const pr = await prisma.purchaseReturn.create({
      data: {
        tenantId: params.tenantId,
        returnNumber,
        returnDate: new Date(params.returnDate),
        vendorId: params.vendorId,
        vendorName: params.vendorName,
        vendorGstin: params.vendorGstin,
        vendorAddress: params.vendorAddress,
        originalPoNumber: params.originalPoNumber,
        originalGrnNumber: params.originalGrnNumber,
        originalBillNumber: params.originalBillNumber,
        warehouseId: params.warehouseId,
        warehouseName: params.warehouseName,
        vehicleNumber: params.vehicleNumber,
        transporterName: params.transporterName,
        debitNoteNumber,
        totalTaxableAmount,
        totalGstAmount,
        grandTotal,
        status: 'DISPATCHED',
        remarks: params.remarks,
        items: {
          create: params.items.map(i => ({
            ...i,
          }))
        }
      },
      include: { items: true }
    });

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'CREATE',
      entityName: 'PURCHASE_RETURN',
      entityId: pr.id,
      entityNumber: pr.returnNumber,
      narration: `Created Purchase Return ${pr.returnNumber} for vendor ${pr.vendorName}`,
    }).catch(() => {});

    return await this.getPurchaseReturnById(params.tenantId, pr.id) as PurchaseReturn;
  }

  public static async getSalesReturns(tenantId: string, search?: string): Promise<SalesReturn[]> {
    const list = await prisma.salesReturn.findMany({
      where: {
        tenantId,
        ...(search ? {
          OR: [
            { returnNumber: { contains: search } },
            { customerName: { contains: search } },
            { originalInvoiceNumber: { contains: search } },
          ],
        } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(sr => ({
      ...sr,
      returnDate: sr.returnDate.toISOString().split('T')[0],
      totalTaxableAmount: Number(sr.totalTaxableAmount),
      totalGstAmount: Number(sr.totalGstAmount),
      grandTotal: Number(sr.grandTotal),
      status: sr.status as any,
      createdAt: sr.createdAt.toISOString(),
      items: sr.items.map(i => ({
        ...i,
        returnQty: Number(i.returnQty),
        unitPrice: Number(i.unitPrice),
        taxableAmount: Number(i.taxableAmount),
        gstRatePercent: Number(i.gstRatePercent),
        cgstAmount: Number(i.cgstAmount),
        sgstAmount: Number(i.sgstAmount),
        igstAmount: Number(i.igstAmount),
        totalAmount: Number(i.totalAmount),
      }))
    }));
  }

  public static async getSalesReturnById(tenantId: string, id: string): Promise<SalesReturn | undefined> {
    const sr = await prisma.salesReturn.findFirst({
      where: { tenantId, id },
      include: { items: true },
    });
    if (!sr) return undefined;
    return {
      ...sr,
      returnDate: sr.returnDate.toISOString().split('T')[0],
      totalTaxableAmount: Number(sr.totalTaxableAmount),
      totalGstAmount: Number(sr.totalGstAmount),
      grandTotal: Number(sr.grandTotal),
      status: sr.status as any,
      createdAt: sr.createdAt.toISOString(),
      items: sr.items.map(i => ({
        ...i,
        returnQty: Number(i.returnQty),
        unitPrice: Number(i.unitPrice),
        taxableAmount: Number(i.taxableAmount),
        gstRatePercent: Number(i.gstRatePercent),
        cgstAmount: Number(i.cgstAmount),
        sgstAmount: Number(i.sgstAmount),
        igstAmount: Number(i.igstAmount),
        totalAmount: Number(i.totalAmount),
      }))
    };
  }

  public static async createSalesReturn(params: {
    tenantId: string;
    returnDate: string;
    customerId: string;
    customerName: string;
    customerGstin: string;
    customerAddress: string;
    originalInvoiceNumber?: string | null;
    originalChallanNumber?: string | null;
    originalSoNumber?: string | null;
    destinationWarehouseId: string;
    destinationWarehouseName: string;
    remarks?: string;
    items: Omit<SalesReturnItem, 'id'>[];
    userId: string;
    userName: string;
  }): Promise<SalesReturn> {
    const count = await prisma.salesReturn.count({ where: { tenantId: params.tenantId }});
    const returnNumber = 'SR-2026-' + String(count + 1).padStart(3, '0');
    const creditNoteNumber = 'CN-2026-' + String(count + 1).padStart(3, '0');

    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let grandTotal = 0;

    params.items.forEach((item) => {
      totalTaxableAmount += item.taxableAmount;
      totalGstAmount += item.cgstAmount + item.sgstAmount + item.igstAmount;
      grandTotal += item.totalAmount;
    });

    const sr = await prisma.salesReturn.create({
      data: {
        tenantId: params.tenantId,
        returnNumber,
        returnDate: new Date(params.returnDate),
        customerId: params.customerId,
        customerName: params.customerName,
        customerGstin: params.customerGstin,
        customerAddress: params.customerAddress,
        originalInvoiceNumber: params.originalInvoiceNumber,
        originalChallanNumber: params.originalChallanNumber,
        originalSoNumber: params.originalSoNumber,
        destinationWarehouseId: params.destinationWarehouseId,
        destinationWarehouseName: params.destinationWarehouseName,
        creditNoteNumber,
        totalTaxableAmount,
        totalGstAmount,
        grandTotal,
        status: 'RECEIVED',
        remarks: params.remarks,
        items: {
          create: params.items.map(i => ({
            ...i,
          }))
        }
      },
      include: { items: true }
    });

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'CREATE',
      entityName: 'SALES_RETURN',
      entityId: sr.id,
      entityNumber: sr.returnNumber,
      narration: `Created Sales Return ${sr.returnNumber} for customer ${sr.customerName}`,
    }).catch(() => {});

    return await this.getSalesReturnById(params.tenantId, sr.id) as SalesReturn;
  }
}
