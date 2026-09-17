import {
  AuditAction,
  BillReferenceType,
  GroupNature,
  Prisma,
  PrismaClient,
  VoucherType,
} from '@prisma/client';
import { prisma as defaultPrisma } from '../../../core/database/prisma';
import { AppError, NotFoundError, UnbalancedVoucherError } from '../../../core/errors/app-error';
import { AuditLoggerService } from '../../../core/audit/audit-logger';

export interface CreateVoucherItemDto {
  ledgerId: string;
  debitAmount: number;
  creditAmount: number;
  billReferenceType?: BillReferenceType;
  referenceNumber?: string;
  notes?: string;
}

export interface CreateVoucherDto {
  tenantId: string;
  userId: string;
  type: VoucherType;
  voucherNumber: string;
  date: string | Date;
  narration?: string;
  isSystemGenerated?: boolean;
  sourceModule?: string;
  sourceDocumentId?: string;
  sourceDocumentNumber?: string;
  adjustmentReferenceVoucherId?: string;
  items: CreateVoucherItemDto[];
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateAdjustmentVoucherDto {
  tenantId: string;
  userId: string;
  sourceVoucherId: string;
  voucherNumber: string;
  date: string | Date;
  narration: string;
  items: CreateVoucherItemDto[];
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateLedgerDto {
  tenantId: string;
  groupId: string;
  name: string;
  code?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export interface GetVouchersQuery {
  tenantId: string;
  type?: VoucherType;
  isSystemGenerated?: boolean;
  sourceModule?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AccountingService {
  /**
   * Helper to round monetary decimals to 4 precision points
   */
  public static roundDecimal(value: number): number {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
  }

  /**
   * Strictly validates double-entry balance:
   * 1. At least 2 line items.
   * 2. Sum(Debit) === Sum(Credit) within 0.0001 precision.
   * 3. Both Total Debit and Total Credit must be strictly > 0.
   * 4. No negative amounts allowed.
   */
  public static validateDoubleEntry(items: CreateVoucherItemDto[]): {
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  } {
    if (!items || items.length < 2) {
      throw new AppError(
        'Double-Entry Violation: A valid financial voucher requires at least two line items (Debit & Credit legs)',
        400
      );
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const item of items) {
      const debit = Number(item.debitAmount) || 0;
      const credit = Number(item.creditAmount) || 0;

      if (debit < 0 || credit < 0) {
        throw new AppError('Accounting Sanity Error: Line item amounts cannot be negative', 400);
      }

      if (debit > 0 && credit > 0) {
        throw new AppError(
          'Accounting Sanity Error: A single line item cannot contain both Debit and Credit amounts',
          400
        );
      }

      if (debit === 0 && credit === 0) {
        throw new AppError(
          'Accounting Sanity Error: Every line item must have either a Debit or Credit amount greater than 0',
          400
        );
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    totalDebit = this.roundDecimal(totalDebit);
    totalCredit = this.roundDecimal(totalCredit);

    if (totalDebit <= 0 || totalCredit <= 0) {
      throw new AppError(
        'Double-Entry Violation: Total transaction amount must be greater than zero',
        400
      );
    }

    const diff = Math.abs(totalDebit - totalCredit);
    const isBalanced = diff < 0.0001;

    if (!isBalanced) {
      throw new UnbalancedVoucherError(totalDebit, totalCredit);
    }

    return { totalDebit, totalCredit, isBalanced: true };
  }

  /**
   * Calculates new ledger balance based on accounting nature:
   * - ASSET / EXPENSE: Normal Debit Balance (+Debit, -Credit)
   * - LIABILITY / EQUITY / INCOME: Normal Credit Balance (+Credit, -Debit)
   */
  public static computeNewBalance(
    currentBalance: number,
    nature: GroupNature,
    debitAmount: number,
    creditAmount: number
  ): number {
    const isDebitNormal = nature === GroupNature.ASSET || nature === GroupNature.EXPENSE;
    if (isDebitNormal) {
      return currentBalance + debitAmount - creditAmount;
    } else {
      return currentBalance + creditAmount - debitAmount;
    }
  }

  /**
   * Enforces immutability on system-generated / auto-posted vouchers.
   * Auto-posted JVs (from GRNs, Bills, Invoices, TDS) cannot be edited or deleted directly.
   */
  public static assertVoucherEditable(voucher: {
    id: string;
    voucherNumber: string;
    isSystemGenerated: boolean;
    sourceModule?: string | null;
    sourceDocumentNumber?: string | null;
  }) {
    if (voucher.isSystemGenerated) {
      const source = voucher.sourceModule
        ? `${voucher.sourceModule} (${voucher.sourceDocumentNumber || 'Auto-Sync'})`
        : 'Upstream ERP Subsystem';
      throw new AppError(
        `Statutory Accounting Compliance Error: Voucher '${voucher.voucherNumber}' was automatically posted from ${source} and is strictly locked. Direct modifications or deletions are prohibited. To adjust this transaction, please post a manual Adjustment Journal Voucher (JV).`,
        403
      );
    }
  }

  /**
   * Creates a transaction-safe Voucher and updates affected Ledgers inside atomic prisma.$transaction
   */
  public static async createVoucher(
    dto: CreateVoucherDto,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    const { totalDebit, totalCredit } = this.validateDoubleEntry(dto.items);

    const voucherDate = new Date(dto.date);
    if (isNaN(voucherDate.getTime())) {
      throw new AppError('Invalid voucher date provided', 400);
    }

    // Execute strictly inside an atomic transaction
    return await prismaClient.$transaction(async (tx) => {
      // 1. Fetch and validate all ledgers and their group natures
      const ledgerIds = Array.from(new Set(dto.items.map((i) => i.ledgerId)));
      const ledgers = await tx.ledger.findMany({
        where: {
          id: { in: ledgerIds },
          tenantId: dto.tenantId,
        },
        include: { group: true },
      });

      if (ledgers.length !== ledgerIds.length) {
        throw new NotFoundError('One or more specified Ledgers do not exist in this tenant');
      }

      const ledgerMap = new Map(ledgers.map((l) => [l.id, l]));

      // 2. Check for unique voucher number in tenant
      const existing = await tx.voucher.findFirst({
        where: {
          tenantId: dto.tenantId,
          type: dto.type,
          voucherNumber: dto.voucherNumber,
        },
      });

      if (existing) {
        throw new AppError(
          `Voucher number '${dto.voucherNumber}' already exists for type '${dto.type}'`,
          409
        );
      }

      // 3. Create the Voucher with system generation & source tracking
      const voucher = await tx.voucher.create({
        data: {
          tenantId: dto.tenantId,
          type: dto.type,
          voucherNumber: dto.voucherNumber,
          date: voucherDate,
          narration: dto.narration,
          isSystemGenerated: dto.isSystemGenerated ?? false,
          sourceModule: dto.sourceModule || null,
          sourceDocumentId: dto.sourceDocumentId || null,
          sourceDocumentNumber: dto.sourceDocumentNumber || null,
          adjustmentReferenceVoucherId: dto.adjustmentReferenceVoucherId || null,
          createdBy: dto.userId,
          items: {
            create: dto.items.map((item) => ({
              ledgerId: item.ledgerId,
              debitAmount: new Prisma.Decimal(item.debitAmount),
              creditAmount: new Prisma.Decimal(item.creditAmount),
              billReferenceType: item.billReferenceType,
              referenceNumber: item.referenceNumber,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: {
            include: {
              ledger: {
                include: { group: true },
              },
            },
          },
        },
      });

      // 4. Update balances for each ledger atomically
      for (const item of dto.items) {
        const ledger = ledgerMap.get(item.ledgerId)!;
        const currentBalNum = Number(ledger.currentBalance);
        const newBalance = this.computeNewBalance(
          currentBalNum,
          ledger.group.nature,
          Number(item.debitAmount) || 0,
          Number(item.creditAmount) || 0
        );

        await tx.ledger.update({
          where: { id: ledger.id },
          data: {
            currentBalance: new Prisma.Decimal(newBalance),
          },
        });
      }

      // 5. Immutable Audit Log Creation inside transaction
      await AuditLoggerService.log(
        {
          tenantId: dto.tenantId,
          userId: dto.userId,
          action: AuditAction.CREATE,
          entityName: 'Voucher',
          entityId: voucher.id,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          after: {
            voucherNumber: voucher.voucherNumber,
            type: voucher.type,
            date: voucher.date.toISOString(),
            isSystemGenerated: voucher.isSystemGenerated,
            sourceModule: voucher.sourceModule,
            sourceDocumentNumber: voucher.sourceDocumentNumber,
            totalDebit,
            totalCredit,
            itemCount: voucher.items.length,
          },
        },
        tx as unknown as PrismaClient
      );

      return voucher;
    });
  }

  /**
   * Posts an Adjustment / Reversal Journal Voucher referencing a locked system voucher.
   * Strict double-entry validation is applied.
   */
  public static async createAdjustmentVoucher(
    dto: CreateAdjustmentVoucherDto,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    const sourceVoucher = await prismaClient.voucher.findFirst({
      where: {
        id: dto.sourceVoucherId,
        tenantId: dto.tenantId,
      },
      include: { items: true },
    });

    if (!sourceVoucher) {
      throw new NotFoundError(`Source voucher ID '${dto.sourceVoucherId}' not found for adjustment`);
    }

    const narration = `[ADJUSTMENT JV FOR ${sourceVoucher.voucherNumber}] ${dto.narration}`.trim();

    return this.createVoucher(
      {
        tenantId: dto.tenantId,
        userId: dto.userId,
        type: VoucherType.JOURNAL,
        voucherNumber: dto.voucherNumber,
        date: dto.date,
        narration,
        isSystemGenerated: false, // Adjustment JVs are explicit manual accountant entries
        sourceModule: 'ADJUSTMENT_JV',
        sourceDocumentId: sourceVoucher.id,
        sourceDocumentNumber: sourceVoucher.voucherNumber,
        adjustmentReferenceVoucherId: sourceVoucher.id,
        items: dto.items,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
      prismaClient
    );
  }

  /**
   * Retrieves vouchers with double-entry summary and audit lock indicators
   */
  public static async getVouchers(
    query: GetVouchersQuery,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    const { tenantId, type, isSystemGenerated, sourceModule, startDate, endDate, search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VoucherWhereInput = {
      tenantId,
      ...(type && { type }),
      ...(isSystemGenerated !== undefined && { isSystemGenerated }),
      ...(sourceModule && { sourceModule }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
      ...(search && {
        OR: [
          { voucherNumber: { contains: search } },
          { narration: { contains: search } },
          { sourceDocumentNumber: { contains: search } },
        ],
      }),
    };

    const [total, vouchers] = await Promise.all([
      prismaClient.voucher.count({ where }),
      prismaClient.voucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          items: {
            include: {
              ledger: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  group: { select: { name: true, nature: true } },
                },
              },
            },
          },
          creator: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const formatted = vouchers.map((v) => {
      let totalDr = 0;
      let totalCr = 0;
      for (const item of v.items) {
        totalDr += Number(item.debitAmount) || 0;
        totalCr += Number(item.creditAmount) || 0;
      }

      totalDr = this.roundDecimal(totalDr);
      totalCr = this.roundDecimal(totalCr);
      const isBalanced = Math.abs(totalDr - totalCr) < 0.0001;

      return {
        id: v.id,
        voucherNumber: v.voucherNumber,
        type: v.type,
        date: v.date.toISOString().split('T')[0],
        narration: v.narration,
        isSystemGenerated: v.isSystemGenerated,
        sourceModule: v.sourceModule,
        sourceDocumentId: v.sourceDocumentId,
        sourceDocumentNumber: v.sourceDocumentNumber,
        adjustmentReferenceVoucherId: v.adjustmentReferenceVoucherId,
        isReversed: v.isReversed,
        totalDebit: totalDr,
        totalCredit: totalCr,
        isBalanced,
        itemCount: v.items.length,
        items: v.items.map((i) => ({
          id: i.id,
          ledgerId: i.ledgerId,
          ledgerName: i.ledger.name,
          ledgerGroup: i.ledger.group.name,
          ledgerNature: i.ledger.group.nature,
          debitAmount: Number(i.debitAmount),
          creditAmount: Number(i.creditAmount),
          billReferenceType: i.billReferenceType,
          referenceNumber: i.referenceNumber,
          notes: i.notes,
        })),
        createdAt: v.createdAt.toISOString(),
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      vouchers: formatted,
    };
  }

  /**
   * Quick-creates a new Ledger (for Alt+C inline creation modal)
   */
  public static async createLedger(
    dto: CreateLedgerDto,
    userId: string,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    const group = await prismaClient.ledgerGroup.findFirst({
      where: { id: dto.groupId, tenantId: dto.tenantId },
    });

    if (!group) {
      throw new NotFoundError('Selected Ledger Group not found');
    }

    const opening = dto.openingBalance || 0;

    const ledger = await prismaClient.ledger.create({
      data: {
        tenantId: dto.tenantId,
        groupId: dto.groupId,
        name: dto.name.trim(),
        code: dto.code?.trim() || null,
        openingBalance: new Prisma.Decimal(opening),
        currentBalance: new Prisma.Decimal(opening),
        isActive: dto.isActive ?? true,
      },
      include: {
        group: true,
      },
    });

    await AuditLoggerService.log(
      {
        tenantId: dto.tenantId,
        userId,
        action: AuditAction.CREATE,
        entityName: 'Ledger',
        entityId: ledger.id,
        after: {
          name: ledger.name,
          groupId: ledger.groupId,
          openingBalance: opening,
        },
      },
      prismaClient
    );

    return ledger;
  }

  /**
   * Retrieves all ledgers for a tenant
   */
  public static async getLedgers(tenantId: string, prismaClient: PrismaClient = defaultPrisma) {
    return prismaClient.ledger.findMany({
      where: { tenantId, isActive: true },
      include: {
        group: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Retrieves all ledger groups for a tenant
   */
  public static async getLedgerGroups(tenantId: string, prismaClient: PrismaClient = defaultPrisma) {
    return prismaClient.ledgerGroup.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }
}
