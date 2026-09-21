export type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';
export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export interface BackdatingPolicy {
  enabled: boolean;
  maxBackdateDaysDefault: number;
  roleBackdateLimits: {
    DATA_ENTRY: number;
    ACCOUNTANT: number;
    OWNER: number;
  };
  allowFutureDating: boolean;
  maxFutureDays: number;
  updatedAt: string;
  updatedBy: string;
}

export interface MonthlyPeriod {
  periodKey: string; // e.g. '2025-04', '2026-01'
  fiscalYear: string; // e.g. '2025-26'
  monthIndex: number; // 1 to 12
  monthName: string; // e.g. 'April 2025'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: PeriodStatus;
  gstFilingStatus: 'NOT_APPLICABLE' | 'PENDING' | 'GSTR_1_FILED' | 'GSTR_3B_FILED' | 'RECONCILED';
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  closedByRole?: UserRole | string;
  closingRemarks?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
}

export interface YearEndClosure {
  fiscalYear: string; // e.g. '2024-25', '2025-26'
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  isYearClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  closingRemarks?: string;
  retainedEarningsTransferred: boolean;
  retainedEarningsVoucherId?: string;
}

export interface HardFreezeSettings {
  booksClosedDate: string; // YYYY-MM-DD (No transactions allowed on or before this date)
  isHardFreezeActive: boolean;
  freezeReason: string;
  updatedAt: string;
  updatedBy: string;
}

export interface DateValidationResult {
  allowed: boolean;
  status: 'ALLOWED' | 'BLOCKED';
  reason?: string;
  errorCode?: 'HARD_FREEZE_VIOLATION' | 'MONTH_CLOSED' | 'YEAR_CLOSED' | 'BACKDATING_EXCEEDED' | 'FUTURE_DATE_EXCEEDED' | 'BACKDATING_DISABLED';
  details?: Record<string, any>;
}

export interface PeriodLockMatrix {
  tenantId: string;
  currentFiscalYear: string;
  hardFreeze: HardFreezeSettings;
  backdatingPolicy: BackdatingPolicy;
  months: MonthlyPeriod[];
  years: YearEndClosure[];
}
