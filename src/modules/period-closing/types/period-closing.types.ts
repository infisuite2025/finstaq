export type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';

export type FinancialYearStatus =
  | 'PLANNED'
  | 'OPEN'
  | 'SOFT_CLOSED'
  | 'FINANCE_REVIEW'
  | 'FINAL_CLOSED'
  | 'AUDIT_LOCKED'
  | 'REOPENED';

export type PeriodStatus =
  | 'OPEN'
  | 'SOFT_CLOSED'
  | 'FINANCE_REVIEW'
  | 'FINAL_CLOSED'
  | 'AUDIT_LOCKED'
  | 'REOPENED';

export type ReadinessSeverity = 'SUCCESS' | 'WARNING' | 'ERROR' | 'BLOCKER';

export type ReopeningScope =
  | 'ENTIRE_PERIOD'
  | 'ADJUSTMENT_JOURNALS_ONLY'
  | 'SPECIFIC_LEDGER'
  | 'SINGLE_VOUCHER';

export interface FinancialYear {
  id: string;
  tenantId: string;
  code: string; // e.g., '2024-25', '2025-26', '2026-27'
  name: string; // e.g., 'Financial Year 2025-26'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  previousYearId?: string;
  nextYearId?: string;
  status: FinancialYearStatus;
  isCurrent: boolean;
  retainedEarningsLedgerId: string;
  retainedEarningsLedgerName: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AccountingPeriod {
  id: string;
  tenantId: string;
  financialYearId: string;
  sequence: number; // 1 to 12
  periodName: string; // e.g., 'Period 01 - April 2025'
  monthName: string; // e.g., 'April 2025'
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  gstFilingStatus: 'NOT_APPLICABLE' | 'PENDING' | 'GSTR_1_FILED' | 'GSTR_3B_FILED' | 'RECONCILED';
  softCloseDate?: string;
  finalCloseDate?: string;
  lockedBy?: string;
  lockedByName?: string;
  lockedAt?: string;
  reopenedBy?: string;
  reopenedByName?: string;
  reopenedAt?: string;
  reopenReason?: string;
  reopenScope?: ReopeningScope;
}

export interface MonthEndChecklistItem {
  id: string;
  tenantId: string;
  periodId: string;
  category: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXCEPTION' | 'WAIVED';
  isApplicable: boolean;
  isMandatory: boolean;
  assignedTo: string;
  assignedRole: UserRole;
  completedAt?: string;
  completedBy?: string;
  comments?: string;
  supportingRef?: string;
}

export interface ReadinessCategoryResult {
  category: string;
  title: string;
  severity: ReadinessSeverity;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'BLOCKED';
  pendingCount: number;
  monetaryValue?: number;
  isBlocker: boolean;
  message: string;
  actionRequired?: string;
}

export interface YearEndReadinessAudit {
  financialYearId: string;
  financialYearCode: string;
  readinessPercentage: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  errorChecks: number;
  blockerChecks: number;
  isReadyForFinalClose: boolean;
  categories: ReadinessCategoryResult[];
  auditedAt: string;
}

export interface YearEndAdjustmentDto {
  id: string;
  tenantId: string;
  financialYearId: string;
  adjustmentType: 'ACCRUED_EXPENSE' | 'PREPAID_EXPENSE' | 'PROVISION' | 'DEPRECIATION' | 'BAD_DEBT' | 'FOREX_REVALUATION' | 'AUDIT_ADJUSTMENT';
  voucherNumber: string;
  date: string;
  narration: string;
  debitLedgerId: string;
  debitLedgerName: string;
  creditLedgerId: string;
  creditLedgerName: string;
  amount: number;
  preparerId: string;
  preparerName: string;
  approverId?: string;
  approverName?: string;
  status: 'DRAFT' | 'APPROVED' | 'POSTED';
  createdAt: string;
}

export interface CustomerOpenItem {
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  originalAmount: number;
  settledAmount: number;
  outstandingAmount: number;
  currency: string;
  ageingBucket: '0-30' | '31-60' | '61-90' | '90+';
  sourceFinancialYear: string;
}

export interface VendorOpenItem {
  vendorId: string;
  vendorName: string;
  billId: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  originalAmount: number;
  settledAmount: number;
  outstandingAmount: number;
  currency: string;
  sourceFinancialYear: string;
}

export interface InventoryOpeningLayer {
  itemId: string;
  sku: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  batchNo?: string;
  lotNo?: string;
  serialNo?: string;
  quantity: number;
  uom: string;
  valuationRate: number;
  totalValuation: number;
  costingMethod: 'FIFO' | 'WEIGHTED_AVERAGE';
}

export interface AssetOpeningBalance {
  assetId: string;
  assetCode: string;
  assetName: string;
  acquisitionCost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  usefulLifeYears: number;
  remainingLifeYears: number;
  depreciationMethod: string;
}

export interface CarryForwardPreviewAccount {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  groupNature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  accountCategory: 'BALANCE_SHEET' | 'PROFIT_LOSS';
  closingBalanceFY: number;
  carryForwardType: 'BALANCE_CARRY_FORWARD' | 'RESET_TO_ZERO' | 'TRANSFERRED_TO_RETAINED_EARNINGS';
  newOpeningBalance: number;
  difference: number;
  status: 'PASS' | 'FLAGGED';
}

export interface CarryForwardRun {
  runId: string;
  tenantId: string;
  sourceFinancialYearId: string;
  sourceFinancialYearCode: string;
  targetFinancialYearId: string;
  targetFinancialYearCode: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: string;
  totalBalanceSheetClosing: number;
  totalBalanceSheetOpening: number;
  netProfitLossTransferred: number;
  retainedEarningsAccount: string;
  closingVoucherId: string;
  openingVoucherId: string;
  openCustomerItemsCount: number;
  openVendorItemsCount: number;
  inventoryLayersCount: number;
  fixedAssetsCount: number;
  zeroDifferenceCheckPassed: boolean;
  status: 'COMPLETED' | 'RECALCULATED' | 'REVERSED';
}

export interface PeriodPostingValidation {
  isAllowed: boolean;
  status: 'ALLOWED' | 'BLOCKED';
  financialYear?: FinancialYear;
  period?: AccountingPeriod;
  reason?: string;
  errorCode?: string;
}


export interface AuditAdjustmentEntry {
  id: string;
  tenantId: string;
  financialYearCode: string;
  voucherNumber: string;
  date: string;
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  accountCategory: 'BALANCE_SHEET' | 'PROFIT_LOSS';
  groupNature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  auditorReference?: string;
  postedBy: string;
  postedByName: string;
  postedAt: string;
}

export interface AccountVarianceItem {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  accountCategory: 'BALANCE_SHEET' | 'PROFIT_LOSS';
  groupNature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  initialClosingFY: number;
  auditAdjustmentsTotal: number;
  revisedClosingFY: number;
  currentOpeningFY: number;
  varianceDelta: number;
  isOutOfSync: boolean;
  impactOnRetainedEarnings: number;
}

export interface OpeningBalanceSyncDiff {
  sourceFY: string;
  targetFY: string;
  isOutOfSync: boolean;
  totalAuditAdjustmentsCount: number;
  totalAdjustmentValue: number;
  initialNetProfit: number;
  revisedNetProfit: number;
  netProfitDelta: number;
  initialRetainedEarnings: number;
  revisedRetainedEarnings: number;
  retainedEarningsDelta: number;
  variances: AccountVarianceItem[];
  auditAdjustments: AuditAdjustmentEntry[];
  lastSyncedAt?: string;
}

export interface OpeningBalanceSyncResult {
  syncId: string;
  tenantId: string;
  sourceFY: string;
  targetFY: string;
  syncedAt: string;
  syncedBy: string;
  syncedByName: string;
  voucherNumber: string;
  adjustedAccountsCount: number;
  previousNetProfit: number;
  revisedNetProfit: number;
  netProfitAdjustment: number;
  newRetainedEarningsBalance: number;
  zeroDifferenceVerified: boolean;
  status: 'SYNCHRONIZED';
}
