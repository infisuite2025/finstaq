import {
  BackdatingPolicy,
  DateValidationResult,
  HardFreezeSettings,
  MonthlyPeriod,
  PeriodLockMatrix,
  PeriodStatus,
  UserRole,
  YearEndClosure
} from '../types/period-lock.types';
import { AuditService } from '../../audit/services/audit.service';
import { AppError } from '../../../core/errors/app-error';
import { prisma } from '../../../core/database/prisma';

function generateDefaultMonths(): MonthlyPeriod[] {
  // FY 2025-26 months
  return [
    { periodKey: '2025-04', fiscalYear: '2025-26', monthIndex: 1, monthName: 'April 2025', startDate: '2025-04-01', endDate: '2025-04-30', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-05', fiscalYear: '2025-26', monthIndex: 2, monthName: 'May 2025', startDate: '2025-05-01', endDate: '2025-05-31', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-06', fiscalYear: '2025-26', monthIndex: 3, monthName: 'June 2025', startDate: '2025-06-01', endDate: '2025-06-30', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-07', fiscalYear: '2025-26', monthIndex: 4, monthName: 'July 2025', startDate: '2025-07-01', endDate: '2025-07-31', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-08', fiscalYear: '2025-26', monthIndex: 5, monthName: 'August 2025', startDate: '2025-08-01', endDate: '2025-08-31', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-09', fiscalYear: '2025-26', monthIndex: 6, monthName: 'September 2025', startDate: '2025-09-01', endDate: '2025-09-30', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-10', fiscalYear: '2025-26', monthIndex: 7, monthName: 'October 2025', startDate: '2025-10-01', endDate: '2025-10-31', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-11', fiscalYear: '2025-26', monthIndex: 8, monthName: 'November 2025', startDate: '2025-11-01', endDate: '2025-11-30', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2025-12', fiscalYear: '2025-26', monthIndex: 9, monthName: 'December 2025', startDate: '2025-12-01', endDate: '2025-12-31', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2026-01', fiscalYear: '2025-26', monthIndex: 10, monthName: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31', status: 'CLOSED', gstFilingStatus: 'GSTR_3B_FILED' },
    { periodKey: '2026-02', fiscalYear: '2025-26', monthIndex: 11, monthName: 'February 2026', startDate: '2026-02-01', endDate: '2026-02-28', status: 'OPEN', gstFilingStatus: 'PENDING' },
    { periodKey: '2026-03', fiscalYear: '2025-26', monthIndex: 12, monthName: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31', status: 'OPEN', gstFilingStatus: 'PENDING' },
  ];
}

async function getTenantMatrix(tenantId: string): Promise<PeriodLockMatrix> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'PERIOD_LOCK_MATRIX' } }
  });

  if (record && record.value) {
    return record.value as any as PeriodLockMatrix;
  }

  const defaultMatrix: PeriodLockMatrix = {
    tenantId,
    currentFiscalYear: '2025-26',
    hardFreeze: {
      booksClosedDate: '2025-03-31',
      isHardFreezeActive: true,
      freezeReason: 'Statutory audit for FY 2024-25 finalized and filed with MCA.',
      updatedAt: '2025-04-15T10:00:00Z',
      updatedBy: 'Vikram Singhania (OWNER)',
    },
    backdatingPolicy: {
      enabled: true,
      maxBackdateDaysDefault: 7,
      roleBackdateLimits: { DATA_ENTRY: 3, ACCOUNTANT: 15, OWNER: 365 },
      allowFutureDating: true,
      maxFutureDays: 30,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Default',
    },
    months: generateDefaultMonths(),
    years: [
      { fiscalYear: '2024-25', startDate: '2024-04-01', endDate: '2025-03-31', status: 'LOCKED', isYearClosed: true, retainedEarningsTransferred: true },
      { fiscalYear: '2025-26', startDate: '2025-04-01', endDate: '2026-03-31', status: 'OPEN', isYearClosed: false, retainedEarningsTransferred: false },
    ],
  };

  await prisma.keyValueStore.create({
    data: { tenantId, key: 'PERIOD_LOCK_MATRIX', value: defaultMatrix as any }
  });

  return defaultMatrix;
}

async function saveTenantMatrix(tenantId: string, matrix: PeriodLockMatrix) {
  await prisma.keyValueStore.update({
    where: { tenantId_key: { tenantId, key: 'PERIOD_LOCK_MATRIX' } },
    data: { value: matrix as any }
  });
}

export class PeriodLockService {
  public static async getMatrix(tenantId: string): Promise<PeriodLockMatrix> {
    return await getTenantMatrix(tenantId);
  }

  public static async validateTransactionDate(params: {
    tenantId: string;
    transactionDate: string;
    userRole: UserRole | string;
    userId?: string;
  }): Promise<DateValidationResult> {
    const matrix = await getTenantMatrix(params.tenantId);
    const txDateStr = params.transactionDate.split('T')[0];
    const txDate = new Date(txDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (matrix.hardFreeze.isHardFreezeActive && matrix.hardFreeze.booksClosedDate) {
      const freezeDate = new Date(matrix.hardFreeze.booksClosedDate + 'T00:00:00');
      if (txDate <= freezeDate) {
        return { allowed: false, status: 'BLOCKED', errorCode: 'HARD_FREEZE_VIOLATION', reason: 'Frozen', details: {} };
      }
    }

    for (const yr of matrix.years) {
      if (yr.isYearClosed) {
        const yStart = new Date(yr.startDate + 'T00:00:00');
        const yEnd = new Date(yr.endDate + 'T00:00:00');
        if (txDate >= yStart && txDate <= yEnd) return { allowed: false, status: 'BLOCKED', errorCode: 'YEAR_CLOSED', reason: 'Year closed', details: {} };
      }
    }

    const txMonthKey = txDateStr.substring(0, 7);
    const monthPeriod = matrix.months.find((m) => m.periodKey === txMonthKey);
    if (monthPeriod && monthPeriod.status === 'CLOSED') {
      return { allowed: false, status: 'BLOCKED', errorCode: 'MONTH_CLOSED', reason: 'Month closed', details: {} };
    }

    return { allowed: true, status: 'ALLOWED', details: { txDate: txDateStr, userRole: params.userRole } };
  }

  public static async closeMonth(params: { tenantId: string; periodKey: string; userId: string; userName: string; userRole: UserRole | string; remarks?: string; }): Promise<MonthlyPeriod> {
    const matrix = await getTenantMatrix(params.tenantId);
    const month = matrix.months.find((m) => m.periodKey === params.periodKey);
    if (!month) throw new AppError('Period not found', 404);
    month.status = 'CLOSED';
    await saveTenantMatrix(params.tenantId, matrix);
    return month;
  }

  public static async reopenMonth(params: { tenantId: string; periodKey: string; userId: string; userName: string; userRole: UserRole | string; reason: string; }): Promise<MonthlyPeriod> {
    const matrix = await getTenantMatrix(params.tenantId);
    const month = matrix.months.find((m) => m.periodKey === params.periodKey);
    if (!month) throw new AppError('Period not found', 404);
    month.status = 'OPEN';
    await saveTenantMatrix(params.tenantId, matrix);
    return month;
  }

  public static async closeFiscalYear(params: { tenantId: string; fiscalYear: string; userId: string; userName: string; userRole: UserRole | string; remarks?: string; }): Promise<YearEndClosure> {
    const matrix = await getTenantMatrix(params.tenantId);
    const yr = matrix.years.find((y) => y.fiscalYear === params.fiscalYear);
    if (!yr) throw new AppError('Fiscal Year not found', 404);
    yr.isYearClosed = true;
    yr.status = 'LOCKED';
    await saveTenantMatrix(params.tenantId, matrix);
    return yr;
  }

  public static async updateBackdatingPolicy(tenantId: string, updates: Partial<BackdatingPolicy>, userId?: string): Promise<BackdatingPolicy> {
    const matrix = await getTenantMatrix(tenantId);
    matrix.backdatingPolicy = { ...matrix.backdatingPolicy, ...updates };
    await saveTenantMatrix(tenantId, matrix);
    return matrix.backdatingPolicy;
  }

  public static async updateHardFreeze(tenantId: string, params: { booksClosedDate: string; isHardFreezeActive: boolean; freezeReason?: string }, userId?: string): Promise<HardFreezeSettings> {
    const matrix = await getTenantMatrix(tenantId);
    matrix.hardFreeze = { booksClosedDate: params.booksClosedDate, isHardFreezeActive: params.isHardFreezeActive, freezeReason: params.freezeReason || matrix.hardFreeze.freezeReason, updatedAt: new Date().toISOString(), updatedBy: userId || 'OWNER' };
    await saveTenantMatrix(tenantId, matrix);
    return matrix.hardFreeze;
  }
}
