import {
  MigrationDataset,
  MultiYearScopeConfig,
  ParsedBillReference,
  ParsedInventoryItem,
  ParsedLedgerItem,
  ParsedVoucherItem,
  SourceSystemType,
} from '../types/migration.types';

export class MigrationParserService {
  /**
   * Generates standard Schedule III mapping recommendations for legacy ledger groups
   */
  public static mapLegacyGroupToScheduleIII(legacyGroup: string): string {
    const g = (legacyGroup || '').toLowerCase().trim();
    if (g.includes('sundry debtor') || g.includes('customer') || g.includes('receivable')) {
      return 'Sundry Debtors (Current Assets)';
    }
    if (g.includes('sundry creditor') || g.includes('vendor') || g.includes('supplier') || g.includes('payable')) {
      return 'Sundry Creditors (Current Liabilities)';
    }
    if (g.includes('bank') || g.includes('hdfc') || g.includes('sbi') || g.includes('icici')) {
      return 'Bank Accounts (Current Assets)';
    }
    if (g.includes('cash')) {
      return 'Cash-in-Hand (Current Assets)';
    }
    if (g.includes('sales') || g.includes('revenue') || g.includes('income')) {
      return 'Sales Accounts (Direct Income)';
    }
    if (g.includes('purchase') || g.includes('procurement') || g.includes('raw material')) {
      return 'Purchase Accounts (Direct Expenses)';
    }
    if (g.includes('capital') || g.includes('equity') || g.includes('share capital')) {
      return 'Capital Account (Equity)';
    }
    if (g.includes('reserve') || g.includes('retained') || g.includes('surplus')) {
      return 'Reserves & Surplus (Equity)';
    }
    if (g.includes('duties') || g.includes('taxes') || g.includes('gst') || g.includes('cgst') || g.includes('sgst') || g.includes('igst')) {
      return 'Duties & Taxes (Current Liabilities)';
    }
    if (g.includes('fixed asset') || g.includes('machinery') || g.includes('building') || g.includes('vehicle') || g.includes('computer')) {
      return 'Fixed Assets (Non-Current Assets)';
    }
    if (g.includes('indirect exp') || g.includes('salary') || g.includes('rent') || g.includes('office') || g.includes('audit')) {
      return 'Indirect Expenses (Operating P&L)';
    }
    if (g.includes('direct exp') || g.includes('freight') || g.includes('wages') || g.includes('power')) {
      return 'Direct Expenses (Trading P&L)';
    }
    if (g.includes('loan') || g.includes('borrowing') || g.includes('secured')) {
      return 'Secured Loans (Non-Current Liabilities)';
    }
    if (g.includes('stock') || g.includes('inventory')) {
      return 'Stock-in-Hand (Current Assets)';
    }
    return 'Sundry Creditors (Current Liabilities)';
  }

  /**
   * Generates a sample high-fidelity multi-year parsed dataset from Tally/Excel
   */
  public static parseDataset(
    jobId: string,
    tenantId: string,
    sourceSystem: SourceSystemType,
    scope: MultiYearScopeConfig,
    rawPayloadText?: string
  ): MigrationDataset {
    // Standard ledgers with 28 Schedule III groups
    const sampleLedgers: ParsedLedgerItem[] = [
      {
        name: 'Singhania Capital Account',
        sourceGroup: 'Capital Account',
        mappedScheduleIIIGroup: 'Capital Account (Equity)',
        openingBalanceDr: 0,
        openingBalanceCr: 5000000,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Retained Earnings (Accumulated Surplus)',
        sourceGroup: 'Reserves & Surplus',
        mappedScheduleIIIGroup: 'Reserves & Surplus (Equity)',
        openingBalanceDr: 0,
        openingBalanceCr: 3733500,
        isDebtorOrCreditor: false,
      },

      {
        name: 'HDFC Corporate Current A/c (Primary)',
        sourceGroup: 'Bank Accounts',
        mappedScheduleIIIGroup: 'Bank Accounts (Current Assets)',
        openingBalanceDr: 3450000,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Petty Cash in Hand',
        sourceGroup: 'Cash-in-Hand',
        mappedScheduleIIIGroup: 'Cash-in-Hand (Current Assets)',
        openingBalanceDr: 150000,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'TechnoKraft Solutions Pvt Ltd',
        sourceGroup: 'Sundry Debtors',
        mappedScheduleIIIGroup: 'Sundry Debtors (Current Assets)',
        openingBalanceDr: 850000,
        openingBalanceCr: 0,
        gstin: '29AABCT1332L1ZV',
        pan: 'AABCT1332L',
        state: 'Karnataka',
        creditLimit: 2000000,
        creditDays: 45,
        isDebtorOrCreditor: true,
      },
      {
        name: 'Bharat Forge & Castings Ltd',
        sourceGroup: 'Sundry Debtors',
        mappedScheduleIIIGroup: 'Sundry Debtors (Current Assets)',
        openingBalanceDr: 1200000,
        openingBalanceCr: 0,
        gstin: '27AABCB9921K1ZZ',
        pan: 'AABCB9921K',
        state: 'Maharashtra',
        creditLimit: 3000000,
        creditDays: 30,
        isDebtorOrCreditor: true,
      },
      {
        name: 'Apex Steels & Raw Materials Co',
        sourceGroup: 'Sundry Creditors',
        mappedScheduleIIIGroup: 'Sundry Creditors (Current Liabilities)',
        openingBalanceDr: 0,
        openingBalanceCr: 1450000,
        gstin: '27AABCA4432Q1ZX',
        pan: 'AABCA4432Q',
        state: 'Maharashtra',
        creditLimit: 2500000,
        creditDays: 45,
        isDebtorOrCreditor: true,
      },
      {
        name: 'Precision Tools & Spares LLP',
        sourceGroup: 'Sundry Creditors',
        mappedScheduleIIIGroup: 'Sundry Creditors (Current Liabilities)',
        openingBalanceDr: 0,
        openingBalanceCr: 620000,
        gstin: '27AAECP8876M1ZY',
        pan: 'AAECP8876M',
        state: 'Maharashtra',
        creditLimit: 1000000,
        creditDays: 30,
        isDebtorOrCreditor: true,
      },
      {
        name: 'Plant & Heavy CNC Machinery',
        sourceGroup: 'Fixed Assets',
        mappedScheduleIIIGroup: 'Fixed Assets (Non-Current Assets)',
        openingBalanceDr: 4200000,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Output CGST 9%',
        sourceGroup: 'Duties & Taxes',
        mappedScheduleIIIGroup: 'Duties & Taxes (Current Liabilities)',
        openingBalanceDr: 0,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Output SGST 9%',
        sourceGroup: 'Duties & Taxes',
        mappedScheduleIIIGroup: 'Duties & Taxes (Current Liabilities)',
        openingBalanceDr: 0,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Domestic Sales GST 18%',
        sourceGroup: 'Sales Accounts',
        mappedScheduleIIIGroup: 'Sales Accounts (Direct Income)',
        openingBalanceDr: 0,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Raw Material Purchases GST 18%',
        sourceGroup: 'Purchase Accounts',
        mappedScheduleIIIGroup: 'Purchase Accounts (Direct Expenses)',
        openingBalanceDr: 0,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      },
      {
        name: 'Factory Staff Salaries & Wages',
        sourceGroup: 'Indirect Expenses',
        mappedScheduleIIIGroup: 'Indirect Expenses (Operating P&L)',
        openingBalanceDr: 0,
        openingBalanceCr: 0,
        isDebtorOrCreditor: false,
      }
    ];

    const sampleInventory: ParsedInventoryItem[] = [
      {
        name: 'Ball Bearing 6205-ZZ Industrial Grade',
        hsnCode: '84821011',
        uom: 'NOS',
        openingStockQty: 500,
        openingStockRate: 350,
        openingStockValue: 175000,
        defaultGodown: 'Chakan Raw Stores',
        valuationMethod: 'FIFO',
      },
      {
        name: 'Hardened Chrome Shaft 25mm x 1000mm',
        hsnCode: '84831099',
        uom: 'KGS',
        openingStockQty: 1200,
        openingStockRate: 180,
        openingStockValue: 216000,
        defaultGodown: 'Pune Central Warehouse',
        valuationMethod: 'WEIGHTED_AVERAGE',
      },
      {
        name: 'Industrial Pump Set 5HP Submersible',
        hsnCode: '84137010',
        uom: 'SET',
        openingStockQty: 45,
        openingStockRate: 12500,
        openingStockValue: 562500,
        defaultGodown: 'Finished Goods Yard',
        valuationMethod: 'FIFO',
      }
    ];

    const sampleOpenBills: ParsedBillReference[] = [
      {
        partyLedger: 'TechnoKraft Solutions Pvt Ltd',
        billNumber: 'TK/2025/089',
        billDate: '2026-01-15',
        dueDate: '2026-03-01',
        originalAmount: 500000,
        pendingAmount: 350000,
        refType: 'AGST_REF',
        daysOverdue: 195,
      },
      {
        partyLedger: 'TechnoKraft Solutions Pvt Ltd',
        billNumber: 'TK/2026/012',
        billDate: '2026-04-10',
        dueDate: '2026-05-25',
        originalAmount: 500000,
        pendingAmount: 500000,
        refType: 'AGST_REF',
        daysOverdue: 110,
      },
      {
        partyLedger: 'Bharat Forge & Castings Ltd',
        billNumber: 'BF/2026/044',
        billDate: '2026-06-05',
        dueDate: '2026-07-05',
        originalAmount: 1200000,
        pendingAmount: 1200000,
        refType: 'AGST_REF',
        daysOverdue: 69,
      },
      {
        partyLedger: 'Apex Steels & Raw Materials Co',
        billNumber: 'APX-RAW-9921',
        billDate: '2026-05-20',
        dueDate: '2026-07-04',
        originalAmount: 1450000,
        pendingAmount: 1450000,
        refType: 'AGST_REF',
        daysOverdue: 70,
      },
      {
        partyLedger: 'Precision Tools & Spares LLP',
        billNumber: 'PTS/26/102',
        billDate: '2026-06-12',
        dueDate: '2026-07-12',
        originalAmount: 620000,
        pendingAmount: 620000,
        refType: 'AGST_REF',
        daysOverdue: 62,
      }
    ];

    // Multi-year vouchers generated chronologically
    const sampleVouchers: ParsedVoucherItem[] = [
      // Year 1 (FY 2024-25)
      {
        voucherNumber: 'SALES/24-25/001',
        voucherDate: '2024-05-10',
        fiscalYear: 'FY 2024-25',
        voucherType: 'SALES',
        narration: 'Annual contract supply of precision machined components',
        debitLedger: 'TechnoKraft Solutions Pvt Ltd',
        creditLedger: 'Domestic Sales GST 18%',
        amount: 1500000,
      },
      {
        voucherNumber: 'RCPT/24-25/001',
        voucherDate: '2024-06-15',
        fiscalYear: 'FY 2024-25',
        voucherType: 'RECEIPT',
        narration: 'Received against TK invoice via RTGS',
        debitLedger: 'HDFC Corporate Current A/c (Primary)',
        creditLedger: 'TechnoKraft Solutions Pvt Ltd',
        amount: 1000000,
      },
      // Year 2 (FY 2025-26)
      {
        voucherNumber: 'PUR/25-26/042',
        voucherDate: '2025-08-14',
        fiscalYear: 'FY 2025-26',
        voucherType: 'PURCHASE',
        narration: 'Raw material procurement for assembly plant',
        debitLedger: 'Raw Material Purchases GST 18%',
        creditLedger: 'Apex Steels & Raw Materials Co',
        amount: 1800000,
      },
      {
        voucherNumber: 'PAY/25-26/099',
        voucherDate: '2025-09-20',
        fiscalYear: 'FY 2025-26',
        voucherType: 'PAYMENT',
        narration: 'Supplier settlement via HDFC NetBanking',
        debitLedger: 'Apex Steels & Raw Materials Co',
        creditLedger: 'HDFC Corporate Current A/c (Primary)',
        amount: 1800000,
      },
      // Active Year (FY 2026-27)
      {
        voucherNumber: 'SALES/26-27/010',
        voucherDate: '2026-04-12',
        fiscalYear: 'FY 2026-27',
        voucherType: 'SALES',
        narration: 'Q1 component dispatch to Bharat Forge',
        debitLedger: 'Bharat Forge & Castings Ltd',
        creditLedger: 'Domestic Sales GST 18%',
        amount: 1200000,
      },
      {
        voucherNumber: 'JV/26-27/005',
        voucherDate: '2026-05-30',
        fiscalYear: 'FY 2026-27',
        voucherType: 'JOURNAL',
        narration: 'Monthly depreciation on CNC plant & machinery',
        debitLedger: 'Factory Staff Salaries & Wages',
        creditLedger: 'Plant & Heavy CNC Machinery',
        amount: 50000,
      }
    ];

    const totalDr = sampleLedgers.reduce((sum, l) => sum + l.openingBalanceDr, 0) + sampleInventory.reduce((s, i) => s + i.openingStockValue, 0);
    const totalCr = sampleLedgers.reduce((sum, l) => sum + l.openingBalanceCr, 0);

    return {
      jobId,
      tenantId,
      sourceSystem,
      scope,
      ledgers: sampleLedgers,
      inventory: sampleInventory,
      vouchers: sampleVouchers,
      openBills: sampleOpenBills,
      summary: {
        totalLedgers: sampleLedgers.length,
        totalItems: sampleInventory.length,
        totalVouchers: sampleVouchers.length,
        totalOpenBills: sampleOpenBills.length,
        yearsCovered: scope.closedYears.concat([scope.activeFiscalYear]),
        totalOpeningDr: totalDr,
        totalOpeningCr: totalCr,
      },
    };
  }
}
