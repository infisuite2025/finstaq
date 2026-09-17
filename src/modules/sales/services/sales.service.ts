import {
  AuditAction,
  DeliveryChallanStatus,
  Prisma,
  PrismaClient,
  SalesOrderStatus,
  VoucherType,
} from '@prisma/client';
import { prisma as defaultPrisma } from '../../../core/database/prisma';
import { AppError, NotFoundError } from '../../../core/errors/app-error';
import { AuditLoggerService } from '../../../core/audit/audit-logger';
import { TaxEngine } from '../../tax/tax.engine';

export interface CreateSoItemDto {
  inventoryItemId?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent?: number;
}

export interface CreateSoDto {
  tenantId: string;
  userId?: string;
  soNumber: string;
  customerLedgerId: string;
  orderDate: string | Date;
  deliveryDueDate?: string | Date;
  customerPoReference?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  items: CreateSoItemDto[];
}

export interface CreateChallanItemDto {
  inventoryItemId?: string;
  description: string;
  dispatchedQty: number;
  batchNumber?: string;
}

export interface CreateChallanDto {
  tenantId: string;
  userId?: string;
  challanNumber: string;
  soId?: string;
  customerLedgerId: string;
  dispatchDate: string | Date;
  vehicleNumber?: string;
  transporterName?: string;
  eWayBillNumber?: string;
  remarks?: string;
  items: CreateChallanItemDto[];
}

export interface GenerateInvoiceFromSoDto {
  tenantId: string;
  userId: string;
  soId: string;
  voucherNumber: string;
  date: string | Date;
  salesLedgerId: string;
  cgstLedgerId?: string;
  sgstLedgerId?: string;
  igstLedgerId?: string;
  narration?: string;
}

export class SalesService {
  /**
   * Creates an official Sales Order (SO) with statutory GST computations
   */
  public static async createSalesOrder(
    dto: CreateSoDto,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new AppError('Sales Order must contain at least one item line', 400);
    }

    let totalTaxable = 0;
    let totalTax = 0;

    const itemsData = dto.items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const rate = Number(item.taxRatePercent) ?? 18.0;

      const taxable = qty * price;
      const tax = (taxable * rate) / 100;
      const total = taxable + tax;

      totalTaxable += taxable;
      totalTax += tax;

      return {
        inventoryItemId: item.inventoryItemId || null,
        description: item.description,
        hsnCode: item.hsnCode || null,
        quantity: new Prisma.Decimal(qty),
        unitPrice: new Prisma.Decimal(price),
        taxRatePercent: new Prisma.Decimal(rate),
        taxableAmount: new Prisma.Decimal(taxable),
        taxAmount: new Prisma.Decimal(tax),
        totalAmount: new Prisma.Decimal(total),
      };
    });

    const grandTotal = totalTaxable + totalTax;

    return await prismaClient.$transaction(async (tx) => {
      // Validate customer ledger exists
      const customer = await tx.ledger.findFirst({
        where: { id: dto.customerLedgerId, tenantId: dto.tenantId },
      });

      if (!customer) {
        throw new NotFoundError('Customer Ledger not found in tenant');
      }

      // Check unique SO number
      const existing = await tx.salesOrder.findFirst({
        where: { tenantId: dto.tenantId, soNumber: dto.soNumber },
      });

      if (existing) {
        throw new AppError(`Sales Order #${dto.soNumber} already exists`, 409);
      }

      const so = await tx.salesOrder.create({
        data: {
          tenantId: dto.tenantId,
          soNumber: dto.soNumber,
          customerLedgerId: dto.customerLedgerId,
          orderDate: new Date(dto.orderDate),
          deliveryDueDate: dto.deliveryDueDate ? new Date(dto.deliveryDueDate) : null,
          status: SalesOrderStatus.CONFIRMED,
          totalTaxable: new Prisma.Decimal(totalTaxable),
          totalTax: new Prisma.Decimal(totalTax),
          grandTotal: new Prisma.Decimal(grandTotal),
          customerPoReference: dto.customerPoReference || null,
          paymentTerms: dto.paymentTerms || 'Payment due within 30 days of dispatch',
          shippingAddress: dto.shippingAddress || null,
          createdBy: dto.userId || null,
          items: {
            create: itemsData,
          },
        },
        include: {
          customerLedger: true,
          items: true,
        },
      });

      return so;
    });
  }

  
  /**
   * Creates a Delivery Challan (Outward Dispatch) with strict SO over-delivery and duplicate checks
   */
  public static async createDeliveryChallan(
    dto: CreateChallanDto,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new AppError('Delivery Challan must contain at least one item line', 400);
    }

    return await prismaClient.$transaction(async (tx) => {
      // Check duplicate Challan number
      const dupChallan = await tx.deliveryChallan.findFirst({
        where: { tenantId: dto.tenantId, challanNumber: dto.challanNumber },
      });
      if (dupChallan) {
        throw new AppError(`Duplicate Document Error: Delivery Challan #${dto.challanNumber} has already been registered in this tenant`, 409);
      }

      let linkedSo: any = null;
      if (dto.soId) {
        linkedSo = await tx.salesOrder.findFirst({
          where: { id: dto.soId, tenantId: dto.tenantId },
          include: {
            items: true,
            deliveryChallans: { include: { items: true } },
          },
        });
        if (!linkedSo) throw new NotFoundError('Linked Sales Order not found');

        // Strict SO Quantity Enforcement
        for (const incomingItem of dto.items) {
          const soItem = linkedSo.items.find((it: any) =>
            (it.inventoryItemId && it.inventoryItemId === incomingItem.inventoryItemId) ||
            (it.description && it.description.trim().toLowerCase() === incomingItem.description.trim().toLowerCase())
          ) || linkedSo.items[0];

          if (soItem) {
            const soOrderedQty = Number(soItem.quantity) || 0;

            // Sum previous dispatches for this line item
            let alreadyDispatched = 0;
            for (const prevChallan of (linkedSo.deliveryChallans || [])) {
              for (const prevItem of (prevChallan.items || [])) {
                if (prevItem.description?.trim().toLowerCase() === incomingItem.description.trim().toLowerCase()) {
                  alreadyDispatched += Number(prevItem.dispatchedQty) || 0;
                }
              }
            }

            const incomingQty = Number(incomingItem.dispatchedQty) || 0;
            const remainingBalance = Math.max(0, soOrderedQty - alreadyDispatched);

            if (incomingQty > remainingBalance) {
              throw new AppError(
                `Business Rule Violation: Dispatched quantity (${incomingQty}) for '${incomingItem.description}' exceeds the remaining un-dispatched balance (${remainingBalance}) of Sales Order #${linkedSo.soNumber} (Ordered: ${soOrderedQty}, Already Dispatched: ${alreadyDispatched}). Over-delivery is strictly prohibited.`,
                422
              );
            }
          }
        }
      }

      const itemsData = dto.items.map((item) => ({
        inventoryItemId: item.inventoryItemId || null,
        description: item.description,
        dispatchedQty: new Prisma.Decimal(Number(item.dispatchedQty) || 0),
        batchNumber: item.batchNumber || `BAT-OUT-${Date.now().toString().slice(-6)}`,
      }));

      // Create Challan
      const challan = await tx.deliveryChallan.create({
        data: {
          tenantId: dto.tenantId,
          challanNumber: dto.challanNumber,
          soId: dto.soId || null,
          customerLedgerId: dto.customerLedgerId,
          dispatchDate: new Date(dto.dispatchDate),
          vehicleNumber: dto.vehicleNumber || null,
          transporterName: dto.transporterName || null,
          eWayBillNumber: dto.eWayBillNumber || null,
          status: DeliveryChallanStatus.DISPATCHED,
          dispatchedBy: dto.userId || null,
          remarks: dto.remarks || null,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          customerLedger: true,
        },
      });

      // Atomically decrement stock in warehouse
      for (const item of itemsData) {
        if (item.inventoryItemId && Number(item.dispatchedQty) > 0) {
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              closingStockQty: {
                decrement: item.dispatchedQty,
              },
            },
          });
        }
      }

      // Update SO status if linked
      if (linkedSo) {
        await tx.salesOrder.update({
          where: { id: linkedSo.id },
          data: {
            status: SalesOrderStatus.COMPLETED,
          },
        });
      }

      return challan;
    });
  }


  /**
   * Generates a Double-Entry Sales Voucher from a Sales Order
   * (Debits Customer, Credits Sales Account and Duties/Taxes)
   */
  public static async generateSalesInvoiceVoucher(
    dto: GenerateInvoiceFromSoDto,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    return await prismaClient.$transaction(async (tx) => {
      const so = await tx.salesOrder.findFirst({
        where: { id: dto.soId, tenantId: dto.tenantId },
        include: { customerLedger: true, items: true },
      });

      if (!so) throw new NotFoundError('Sales Order not found');

      const totalTaxable = Number(so.totalTaxable);
      const totalTax = Number(so.totalTax);
      const grandTotal = Number(so.grandTotal);

      // Voucher Line Items:
      // 1. Debit: Customer (Sundry Debtors) -> Grand Total
      // 2. Credit: Sales Account -> Total Taxable
      // 3. Credit: GST Tax Ledgers -> Total Tax
      const voucherItems: Prisma.VoucherItemCreateWithoutVoucherInput[] = [
        {
          ledger: { connect: { id: so.customerLedgerId } },
          debitAmount: new Prisma.Decimal(grandTotal),
          creditAmount: new Prisma.Decimal(0),
          notes: `Sales Invoice against ${so.soNumber}`,
        },
        {
          ledger: { connect: { id: dto.salesLedgerId } },
          debitAmount: new Prisma.Decimal(0),
          creditAmount: new Prisma.Decimal(totalTaxable),
          notes: 'Sales Revenue',
        },
      ];

      if (totalTax > 0) {
        if (dto.igstLedgerId) {
          voucherItems.push({
            ledger: { connect: { id: dto.igstLedgerId } },
            debitAmount: new Prisma.Decimal(0),
            creditAmount: new Prisma.Decimal(totalTax),
            notes: 'Output IGST',
          });
        } else if (dto.cgstLedgerId && dto.sgstLedgerId) {
          const splitTax = totalTax / 2;
          voucherItems.push(
            {
              ledger: { connect: { id: dto.cgstLedgerId } },
              debitAmount: new Prisma.Decimal(0),
              creditAmount: new Prisma.Decimal(splitTax),
              notes: 'Output CGST',
            },
            {
              ledger: { connect: { id: dto.sgstLedgerId } },
              debitAmount: new Prisma.Decimal(0),
              creditAmount: new Prisma.Decimal(splitTax),
              notes: 'Output SGST',
            }
          );
        }
      }

      const voucher = await tx.voucher.create({
        data: {
          tenantId: dto.tenantId,
          type: VoucherType.SALES,
          voucherNumber: dto.voucherNumber,
          date: new Date(dto.date),
          narration: dto.narration || `Tax Invoice booked for Sales Order #${so.soNumber}`,
          createdBy: dto.userId,
          items: {
            create: voucherItems,
          },
        },
        include: {
          items: { include: { ledger: true } },
        },
      });

      return voucher;
    });
  }

  /**
   * Retrieves all Sales Orders
   */
  public static async getSalesOrders(
    tenantId: string,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    return prismaClient.salesOrder.findMany({
      where: { tenantId },
      include: { customerLedger: true, items: true, deliveryChallans: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieves all Delivery Challans
   */
  public static async getDeliveryChallans(
    tenantId: string,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    return prismaClient.deliveryChallan.findMany({
      where: { tenantId },
      include: { customerLedger: true, items: true, salesOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches Sales Department Overview and Executive KPIs
   */
  public static async getSalesSummary(
    tenantId: string,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    const [soCount, challanCount, openSos] = await Promise.all([
      prismaClient.salesOrder.count({ where: { tenantId } }),
      prismaClient.deliveryChallan.count({ where: { tenantId } }),
      prismaClient.salesOrder.findMany({
        where: { tenantId, status: { in: [SalesOrderStatus.CONFIRMED, SalesOrderStatus.PARTIALLY_DISPATCHED] } },
        include: { customerLedger: true, items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalRevenueResult = await prismaClient.salesOrder.aggregate({
      where: { tenantId },
      _sum: { grandTotal: true },
    });

    return {
      totalSalesOrders: soCount,
      totalDeliveryChallans: challanCount,
      totalSalesRevenue: Number(totalRevenueResult._sum.grandTotal) || 0,
      openSalesOrders: openSos,
    };
  }
}
