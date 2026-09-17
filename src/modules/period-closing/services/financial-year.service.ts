import {
  AccountingPeriod,
  FinancialYear,
  FinancialYearStatus,
  PeriodStatus
} from '../types/period-closing.types';
import { AuditService } from '../../audit/services/audit.service';
import { AppError } from '../../../core/errors/app-error';
import { prisma } from '../../../core/database/prisma';

export class FinancialYearService {
  public static async getFinancialYears(tenantId: string): Promise<FinancialYear[]> {
    const fys = await prisma.financialYearMaster.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' }
    });
    
    return fys.map((fy: any) => ({
      id: fy.id,
      tenantId: fy.tenantId,
      code: fy.yearCode,
      name: fy.yearName,
      startDate: fy.startDate.toISOString().split('T')[0],
      endDate: fy.endDate.toISOString().split('T')[0],
      status: fy.status as FinancialYearStatus,
      isCurrent: fy.isCurrent,
      retainedEarningsLedgerId: 'led-retained-earnings', // Mock
      retainedEarningsLedgerName: 'Retained Earnings / Reserves & Surplus', // Mock
      createdBy: 'system',
      createdAt: fy.createdAt.toISOString(),
      updatedBy: 'system',
      updatedAt: fy.createdAt.toISOString(),
    }));
  }

  public static async getFinancialYearById(tenantId: string, fyId: string): Promise<FinancialYear | undefined> {
    const fy = await prisma.financialYearMaster.findFirst({
      where: {
        tenantId,
        OR: [{ id: fyId }, { yearCode: fyId }]
      }
    });
    if (!fy) return undefined;
    return {
      id: fy.id,
      tenantId: fy.tenantId,
      code: fy.yearCode,
      name: fy.yearName,
      startDate: fy.startDate.toISOString().split('T')[0],
      endDate: fy.endDate.toISOString().split('T')[0],
      status: fy.status as FinancialYearStatus,
      isCurrent: fy.isCurrent,
      retainedEarningsLedgerId: 'led-retained-earnings',
      retainedEarningsLedgerName: 'Retained Earnings / Reserves & Surplus',
      createdBy: 'system',
      createdAt: fy.createdAt.toISOString(),
      updatedBy: 'system',
      updatedAt: fy.createdAt.toISOString(),
    };
  }

  public static async getPeriods(tenantId: string, fyId?: string): Promise<AccountingPeriod[]> {
    let where: any = {};
    if (fyId) {
      const fy = await this.getFinancialYearById(tenantId, fyId);
      if (fy) {
        where.financialYearId = fy.id;
      }
    } else {
       // get all periods for tenant FYs
       const fys = await prisma.financialYearMaster.findMany({ where: { tenantId }});
       where.financialYearId = { in: fys.map(f => f.id) };
    }
    
    const periods = await prisma.accountingPeriodMaster.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: { financialYear: true }
    });
    
    return periods.map(p => ({
      id: p.id,
      tenantId: p.financialYear.tenantId,
      financialYearId: p.financialYearId,
      sequence: p.periodNumber,
      periodName: p.periodName,
      monthName: `${p.periodName} ${p.year}`,
      startDate: p.startDate.toISOString().split('T')[0],
      endDate: p.endDate.toISOString().split('T')[0],
      status: p.isLocked ? 'FINAL_CLOSED' : 'OPEN',
      gstFilingStatus: p.isLocked ? 'GSTR_3B_FILED' : 'PENDING',
      lockedBy: p.isLocked ? 'usr-admin' : undefined,
      lockedByName: p.isLocked ? 'Admin' : undefined,
      lockedAt: p.isLocked ? new Date().toISOString() : undefined,
    }));
  }

  public static async createFinancialYear(params: {
    tenantId: string;
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    retainedEarningsLedgerId?: string;
    retainedEarningsLedgerName?: string;
    userId: string;
    userName: string;
  }): Promise<FinancialYear> {
    const existing = await prisma.financialYearMaster.findFirst({
      where: { tenantId: params.tenantId, yearCode: params.code }
    });
    if (existing) {
      throw new AppError(`Financial Year ${params.code} already exists`, 400);
    }
    
    const fy = await prisma.financialYearMaster.create({
      data: {
        tenantId: params.tenantId,
        yearCode: params.code,
        yearName: params.name,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        isCurrent: false,
        status: 'OPEN',
      }
    });

    const months = [
      { seq: 1, name: 'April', start: '-04-01', end: '-04-30', yrOffset: 0 },
      { seq: 2, name: 'May', start: '-05-01', end: '-05-31', yrOffset: 0 },
      { seq: 3, name: 'June', start: '-06-01', end: '-06-30', yrOffset: 0 },
      { seq: 4, name: 'July', start: '-07-01', end: '-07-31', yrOffset: 0 },
      { seq: 5, name: 'August', start: '-08-01', end: '-08-31', yrOffset: 0 },
      { seq: 6, name: 'September', start: '-09-01', end: '-09-30', yrOffset: 0 },
      { seq: 7, name: 'October', start: '-10-01', end: '-10-31', yrOffset: 0 },
      { seq: 8, name: 'November', start: '-11-01', end: '-11-30', yrOffset: 0 },
      { seq: 9, name: 'December', start: '-12-01', end: '-12-31', yrOffset: 0 },
      { seq: 10, name: 'January', start: '-01-01', end: '-01-31', yrOffset: 1 },
      { seq: 11, name: 'February', start: '-02-01', end: '-02-28', yrOffset: 1 },
      { seq: 12, name: 'March', start: '-03-01', end: '-03-31', yrOffset: 1 },
    ];
  
    const startYear = parseInt(params.startDate.split('-')[0], 10);
    const periodsToCreate = months.map(m => {
       const year = startYear + m.yrOffset;
       const startStr = `${year}${m.start}`;
       const endStr = `${year}${m.end}`;
       return {
          financialYearId: fy.id,
          periodNumber: m.seq,
          periodName: m.name,
          month: parseInt(m.start.split('-')[1], 10),
          year: year,
          startDate: new Date(startStr),
          endDate: new Date(endStr),
          isLocked: false
       };
    });

    await prisma.accountingPeriodMaster.createMany({
       data: periodsToCreate
    });

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'CREATE',
      entityName: 'FINANCIAL_YEAR',
      entityId: fy.id,
      entityNumber: fy.yearCode,
      narration: `Created new Financial Year ${fy.yearCode}`,
    }).catch(() => {});

    return {
      id: fy.id,
      tenantId: fy.tenantId,
      code: fy.yearCode,
      name: fy.yearName,
      startDate: params.startDate,
      endDate: params.endDate,
      status: 'OPEN',
      isCurrent: false,
      retainedEarningsLedgerId: params.retainedEarningsLedgerId || 'led-retained-earnings',
      retainedEarningsLedgerName: params.retainedEarningsLedgerName || 'Retained Earnings / Reserves & Surplus',
      createdBy: params.userId,
      createdAt: new Date().toISOString(),
      updatedBy: params.userName,
      updatedAt: new Date().toISOString(),
    };
  }

  public static async updateFinancialYearStatus(params: {
    tenantId: string;
    financialYearId: string;
    status: FinancialYearStatus;
    userId: string;
    userName: string;
    userRole: string;
    remarks?: string;
  }): Promise<FinancialYear> {
    if (params.userRole !== 'OWNER') {
      throw new AppError('Only the Business OWNER can update Financial Year status', 403);
    }
    
    const existing = await this.getFinancialYearById(params.tenantId, params.financialYearId);
    if (!existing) throw new AppError(`Financial Year ${params.financialYearId} not found`, 404);

    await prisma.financialYearMaster.update({
      where: { id: existing.id },
      data: { status: params.status, isClosed: params.status === 'FINAL_CLOSED' }
    });

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'UPDATE',
      entityName: 'FINANCIAL_YEAR',
      entityId: existing.id,
      entityNumber: existing.code,
      narration: `Transitioned FY ${existing.code} status to ${params.status} (${params.remarks || 'Status update'})`,
    }).catch(() => {});

    return { ...existing, status: params.status };
  }
}
