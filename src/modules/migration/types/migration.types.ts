export type SourceSystemType =
  | 'TALLY_PRIME'
  | 'TALLY_9'
  | 'BUSY'
  | 'ZOHO_BOOKS'
  | 'QUICKBOOKS'
  | 'UNIVERSAL_EXCEL';

export interface MultiYearScopeConfig {
  sourceSystem: SourceSystemType;
  historicalYearsCount: 1 | 2 | 3 | 4 | 5;
  startFiscalYear: string; // e.g. "FY 2023-24"
  activeFiscalYear: string; // e.g. "FY 2026-27"
  closedYears: string[]; // e.g. ["FY 2023-24", "FY 2024-25", "FY 2025-26"]
  preserveBillWisePending: boolean;
  enableAutoClosingRoll: boolean;
  strictDoubleEntrySanity: boolean;
}

export interface ParsedLedgerItem {
  name: string;
  sourceGroup: string;
  mappedScheduleIIIGroup: string;
  openingBalanceDr: number;
  openingBalanceCr: number;
  gstin?: string;
  pan?: string;
  state?: string;
  creditLimit?: number;
  creditDays?: number;
  isDebtorOrCreditor: boolean;
}

export interface ParsedInventoryItem {
  name: string;
  hsnCode?: string;
  uom: string;
  openingStockQty: number;
  openingStockRate: number;
  openingStockValue: number;
  defaultGodown: string;
  valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE';
}

export interface ParsedBillReference {
  partyLedger: string;
  billNumber: string;
  billDate: string; // YYYY-MM-DD
  dueDate: string;
  originalAmount: number;
  pendingAmount: number;
  refType: 'NEW_REF' | 'AGST_REF' | 'ADVANCE';
  daysOverdue: number;
}

export interface ParsedVoucherItem {
  voucherNumber: string;
  voucherDate: string; // YYYY-MM-DD
  fiscalYear: string;
  voucherType: 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA' | 'SALES' | 'PURCHASE';
  narration?: string;
  debitLedger: string;
  creditLedger: string;
  amount: number;
  billAllocations?: {
    billNo: string;
    amount: number;
    refType: 'NEW_REF' | 'AGST_REF' | 'ADVANCE';
  }[];
}

export interface MigrationDataset {
  jobId: string;
  tenantId: string;
  sourceSystem: SourceSystemType;
  scope: MultiYearScopeConfig;
  ledgers: ParsedLedgerItem[];
  inventory: ParsedInventoryItem[];
  vouchers: ParsedVoucherItem[];
  openBills: ParsedBillReference[];
  summary: {
    totalLedgers: number;
    totalItems: number;
    totalVouchers: number;
    totalOpenBills: number;
    yearsCovered: string[];
    totalOpeningDr: number;
    totalOpeningCr: number;
  };
}

export interface SanityRuleCheck {
  ruleId: string;
  ruleName: string;
  severity: 'PASSED' | 'WARNING' | 'ERROR';
  description: string;
  details?: string[];
  autoFixAvailable?: boolean;
}

export interface MigrationSanityReport {
  jobId: string;
  status: 'READY' | 'WARNINGS_DETECTED' | 'BLOCKING_ERRORS';
  totalRulesChecked: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  rules: SanityRuleCheck[];
  balanceSheetZeroDiff: boolean;
  deltaAmount: number;
}

export interface MigrationExecutionResult {
  jobId: string;
  status: 'SUCCESS' | 'FAILED';
  ingestedYears: string[];
  recordsCreated: {
    ledgersCreated: number;
    itemsCreated: number;
    vouchersPosted: number;
    billsAllocated: number;
    closingJvsGenerated: number;
    godownsMapped: number;
  };
  reconciliation: {
    sourceTotalDr: number;
    sourceTotalCr: number;
    finstaqTotalDr: number;
    finstaqTotalCr: number;
    varianceDelta: number;
  };
  certificateId: string;
  signedAt: string;
}
