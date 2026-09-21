export interface DateFilterDto {
  fromDate?: string;
  toDate?: string;
  ledgerId?: string;
  groupId?: string;
}

export class AccountingReportsService {
  /**
   * 1. BALANCE SHEET (Schedule III & Horizontal / Vertical T-Format)
   */
  public static async getBalanceSheet(tenantId: string, filter: DateFilterDto = {}) {
    const liabilities = [
      { groupName: "Shareholders' Funds", subGroups: [
        { name: 'Share Capital (Equity)', amount: 5000000 },
        { name: 'Reserves & Surplus (Retained Earnings)', amount: 2450000 },
      ], total: 7450000 },
      { groupName: 'Non-Current Liabilities', subGroups: [
        { name: 'Long Term Bank Borrowings (Term Loans)', amount: 1500000 },
      ], total: 1500000 },
      { groupName: 'Current Liabilities', subGroups: [
        { name: 'Sundry Creditors (Trade Payables)', amount: 433860 },
        { name: 'Duties & Taxes (Net GST Output Liability)', amount: 147280 },
        { name: 'Outstanding Operational Expenses', amount: 85000 },
      ], total: 666140 },
    ];

    const assets = [
      { groupName: 'Non-Current / Fixed Assets', subGroups: [
        { name: 'Plant, Machinery & Industrial Equipment', amount: 4200000 },
        { name: 'Office Furniture, Computers & Fixtures', amount: 450000 },
        { name: 'Less: Accumulated Depreciation', amount: -650000 },
      ], total: 4000000 },
      { groupName: 'Current Assets', subGroups: [
        { name: 'Closing Inventory (Raw Materials & Finished Goods)', amount: 2450000 },
        { name: 'Sundry Debtors (Trade Receivables)', amount: 1156400 },
        { name: 'Cash in Hand (Petty Cash)', amount: 65000 },
        { name: 'Bank Accounts (HDFC Current & ICICI Escrow)', amount: 1814740 },
        { name: 'Input Tax Credit (ITC) Electronic Ledger', amount: 130000 },
      ], total: 5616140 },
    ];

    const totalLiabilities = liabilities.reduce((acc, l) => acc + l.total, 0);
    const totalAssets = assets.reduce((acc, a) => acc + a.total, 0);
    const difference = Math.abs(totalLiabilities - totalAssets);

    return {
      summary: {
        asOfDate: filter.toDate || '2026-09-30',
        totalLiabilities,
        totalAssets,
        difference,
        isBalanced: difference === 0,
      },
      liabilities,
      assets,
    };
  }

  /**
   * 2. PROFIT & LOSS STATEMENT (Trading & Income Statement)
   */
  public static async getProfitAndLoss(tenantId: string, filter: DateFilterDto = {}) {
    const revenue = [
      { category: 'Revenue from Operations (Gross Sales)', amount: 10464000 },
      { category: 'Less: Sales Returns & Rebates', amount: -20414 },
      { category: 'Other Operating Income (Export Incentives, Scraps)', amount: 125000 },
    ];
    const totalRevenue = revenue.reduce((acc, r) => acc + r.amount, 0);

    const directExpenses = [
      { category: 'Opening Stock (Raw Materials & WIP)', amount: 1850000 },
      { category: 'Purchase of Raw Materials & Consumables', amount: 5286000 },
      { category: 'Direct Factory Wages & Contract Labor', amount: 720000 },
      { category: 'Freight Inward & Logistics Customs', amount: 145000 },
      { category: 'Less: Closing Stock of Inventory', amount: -2450000 },
    ];
    const costOfGoodsSold = directExpenses.reduce((acc, d) => acc + d.amount, 0);
    const grossProfit = totalRevenue - costOfGoodsSold;
    const grossMarginPercent = Number(((grossProfit / totalRevenue) * 100).toFixed(2));

    const operatingExpenses = [
      { category: 'Salaries, Allowances & Employee Benefits', amount: 1450000 },
      { category: 'Power, Fuel & Factory Utilities', amount: 280000 },
      { category: 'Rent, Rates & Office Overhead', amount: 360000 },
      { category: 'Selling & Distribution Freight Outward', amount: 195000 },
      { category: 'Legal, Professional & Audit Fees', amount: 85000 },
      { category: 'Depreciation & Amortization Expense', amount: 240000 },
      { category: 'Finance Costs & Bank Charges', amount: 120000 },
    ];
    const totalOperatingExpenses = operatingExpenses.reduce((acc, o) => acc + o.amount, 0);
    const netProfitBeforeTax = grossProfit - totalOperatingExpenses;
    const provisionForTax = Math.round(netProfitBeforeTax * 0.25);
    const netProfitAfterTax = netProfitBeforeTax - provisionForTax;
    const netMarginPercent = Number(((netProfitAfterTax / totalRevenue) * 100).toFixed(2));

    return {
      summary: {
        totalRevenue,
        costOfGoodsSold,
        grossProfit,
        grossMarginPercent,
        totalOperatingExpenses,
        netProfitBeforeTax,
        provisionForTax,
        netProfitAfterTax,
        netMarginPercent,
      },
      revenue,
      directExpenses,
      operatingExpenses,
    };
  }

  /**
   * 3. TRIAL BALANCE (4-Column Periodic Summary & Tree Hierarchy)
   */
  public static async getTrialBalance(tenantId: string, filter: DateFilterDto = {}) {
    const groups = [
      { groupName: 'Capital Account & Reserves', openingDr: 0, openingCr: 7000000, periodDr: 0, periodCr: 450000, closingDr: 0, closingCr: 7450000 },
      { groupName: 'Loans & Borrowings', openingDr: 0, openingCr: 1800000, periodDr: 300000, periodCr: 0, closingDr: 0, closingCr: 1500000 },
      { groupName: 'Fixed Assets (Tangible)', openingDr: 4500000, openingCr: 0, periodDr: 150000, periodCr: 650000, closingDr: 4000000, closingCr: 0 },
      { groupName: 'Sundry Creditors (Trade Payables)', openingDr: 0, openingCr: 380000, periodDr: 4850000, periodCr: 4903860, closingDr: 0, closingCr: 433860 },
      { groupName: 'Duties & Taxes (GST Accounts)', openingDr: 0, openingCr: 80000, periodDr: 1250000, periodCr: 1317280, closingDr: 0, closingCr: 147280 },
      { groupName: 'Sundry Debtors (Trade Receivables)', openingDr: 980000, openingCr: 0, periodDr: 10464000, periodCr: 10287600, closingDr: 1156400, closingCr: 0 },
      { groupName: 'Closing Stock Inventory', openingDr: 1850000, openingCr: 0, periodDr: 5286000, periodCr: 4686000, closingDr: 2450000, closingCr: 0 },
      { groupName: 'Bank & Cash Accounts', openingDr: 1200000, openingCr: 0, periodDr: 9850000, periodCr: 9170260, closingDr: 1879740, closingCr: 0 },
    ];

    const totalOpeningDr = groups.reduce((acc, g) => acc + g.openingDr, 0);
    const totalOpeningCr = groups.reduce((acc, g) => acc + g.openingCr, 0);
    const totalPeriodDr = groups.reduce((acc, g) => acc + g.periodDr, 0);
    const totalPeriodCr = groups.reduce((acc, g) => acc + g.periodCr, 0);
    const totalClosingDr = groups.reduce((acc, g) => acc + g.closingDr, 0);
    const totalClosingCr = groups.reduce((acc, g) => acc + g.closingCr, 0);

    return {
      summary: {
        totalOpeningDr,
        totalOpeningCr,
        totalPeriodDr,
        totalPeriodCr,
        totalClosingDr,
        totalClosingCr,
        isBalanced: totalClosingDr === totalClosingCr,
      },
      groups,
    };
  }

  /**
   * 4. CASH FLOW STATEMENT (AS-3 / Ind AS 7 Direct/Indirect Method)
   */
  public static async getCashFlow(tenantId: string, filter: DateFilterDto = {}) {
    const operatingActivities = [
      { description: 'Net Profit Before Tax & Extraordinary Items', amount: 2178586 },
      { description: 'Add: Non-Cash Depreciation & Amortization', amount: 240000 },
      { description: 'Add: Finance Interest Expense', amount: 120000 },
      { description: 'Operating Profit Before Working Capital Changes', amount: 2538586 },
      { description: '(Increase) in Sundry Debtors (Receivables)', amount: -176400 },
      { description: '(Increase) in Inventory (Stock Holding)', amount: -600000 },
      { description: 'Increase in Sundry Creditors (Trade Payables)', amount: 53860 },
      { description: 'Increase in Statutory GST & Expense Provisions', amount: 67280 },
      { description: 'Cash Generated from Operations', amount: 1883326 },
      { description: 'Less: Direct Corporate Taxes Paid', amount: -544646 },
    ];
    const netOperatingCash = 1338680;

    const investingActivities = [
      { description: 'Purchase of New CNC Machine & Equipment (CapEx)', amount: -450000 },
      { description: 'Proceeds from Sale of Depreciated Tooling', amount: 50000 },
    ];
    const netInvestingCash = -400000;

    const financingActivities = [
      { description: 'Repayment of Long-Term Term Loans', amount: -300000 },
      { description: 'Finance Interest Paid to Lenders', amount: -120000 },
      { description: 'Capital Injected by Promoters / Equity', amount: 161060 },
    ];
    const netFinancingCash = -258940;

    const netChangeInCash = netOperatingCash + netInvestingCash + netFinancingCash;
    const openingCashBank = 1200000;
    const closingCashBank = openingCashBank + netChangeInCash;

    return {
      summary: {
        netOperatingCash,
        netInvestingCash,
        netFinancingCash,
        netChangeInCash,
        openingCashBank,
        closingCashBank,
      },
      operatingActivities,
      investingActivities,
      financingActivities,
    };
  }

  /**
   * 5. GENERAL LEDGER STATEMENT & DAY BOOK EXTRACT
   */
  public static async getLedgerStatement(tenantId: string, filter: DateFilterDto = {}) {
    const entries = [
      { date: '2026-09-01', voucherNo: 'OB-2026-001', voucherType: 'OPENING', particulars: 'Opening Balance b/f', debit: 1200000, credit: 0, balance: 1200000, balanceType: 'Dr' },
      { date: '2026-09-02', voucherNo: 'RCP-2026-0041', voucherType: 'RECEIPT', particulars: 'To Reliance Industries Limited (Inv #101)', debit: 413000, credit: 0, balance: 1613000, balanceType: 'Dr' },
      { date: '2026-09-03', voucherNo: 'PMT-2026-0038', voucherType: 'PAYMENT', particulars: 'By Tata Steel BSL Limited (Bill #85)', debit: 0, credit: 133340, balance: 1479660, balanceType: 'Dr' },
      { date: '2026-09-05', voucherNo: 'PMT-2026-0039', voucherType: 'PAYMENT', particulars: 'By Steel Kraft Components Ltd', debit: 0, credit: 147500, balance: 1332160, balanceType: 'Dr' },
      { date: '2026-09-08', voucherNo: 'RCP-2026-0042', voucherType: 'RECEIPT', particulars: 'To Mahindra & Mahindra Automotive', debit: 230100, credit: 0, balance: 1562260, balanceType: 'Dr' },
      { date: '2026-09-10', voucherNo: 'PMT-2026-0040', voucherType: 'PAYMENT', particulars: 'By Monthly Factory Power & Utilities', debit: 0, credit: 82520, balance: 1479740, balanceType: 'Dr' },
      { date: '2026-09-10', voucherNo: 'RCP-2026-0043', voucherType: 'RECEIPT', particulars: 'To BHEL New Delhi (Immediate Net)', debit: 182900, credit: 0, balance: 1662640, balanceType: 'Dr' },
      { date: '2026-09-12', voucherNo: 'JRN-2026-0019', voucherType: 'JOURNAL', particulars: 'By Petty Cash Transfer to Plant', debit: 0, credit: 50000, balance: 1612640, balanceType: 'Dr' },
    ];

    const totalDebits = entries.reduce((acc, e) => acc + e.debit, 0);
    const totalCredits = entries.reduce((acc, e) => acc + e.credit, 0);
    const closingBalance = 1612640;

    return {
      summary: {
        ledgerName: 'HDFC Bank - Current A/c #50200012345678',
        accountGroup: 'Bank Accounts',
        totalDebits,
        totalCredits,
        closingBalance,
        balanceType: 'Dr',
      },
      entries,
    };
  }

  /**
   * 6. CASH & BANK BOOK WITH BANK RECONCILIATION STATEMENT (BRS)
   */
  public static async getBankReconciliation(tenantId: string) {
    const brsItems = [
      { date: '2026-09-08', chqNo: 'CHQ-449102', particulars: 'Cheque Issued to Global Tech (Not yet presented by vendor)', bookAmount: -100300, type: 'UNPRESENTED_CHEQUE' },
      { date: '2026-09-10', chqNo: 'NEFT-88912', particulars: 'Customer Wire from Larsen & Toubro (Pending bank clearance)', bookAmount: 330400, type: 'UNCLEARED_DEPOSIT' },
      { date: '2026-09-11', chqNo: 'DIRECT-DEBIT', particulars: 'Bank Monthly Service & Locker Charges debited by bank', bookAmount: -2500, type: 'BANK_CHARGES' },
    ];

    const balanceAsPerCompanyBooks = 1612640;
    const unpresentedChequesTotal = 100300;
    const unclearedDepositsTotal = 330400;
    const bankChargesTotal = 2500;
    const balanceAsPerBankStatement = balanceAsPerCompanyBooks + unpresentedChequesTotal - unclearedDepositsTotal + bankChargesTotal;

    return {
      summary: {
        bankName: 'HDFC Bank - Current Account (A/c #50200012345678)',
        balanceAsPerCompanyBooks,
        unpresentedChequesTotal,
        unclearedDepositsTotal,
        balanceAsPerBankStatement,
        reconciliationStatus: 'RECONCILED',
      },
      brsItems,
    };
  }

  /**
   * 7. FINANCIAL RATIO ANALYSIS (Executive Financial Health KPIs)
   */
  public static async getRatioAnalysis(tenantId: string) {
    const ratios = [
      { name: 'Current Ratio', category: 'Liquidity', value: '8.43 : 1', benchmark: '> 1.5 : 1', status: 'EXCELLENT', description: 'Current Assets (₹56.16L) / Current Liabilities (₹6.66L)' },
      { name: 'Quick / Acid-Test Ratio', category: 'Liquidity', value: '4.75 : 1', benchmark: '> 1.0 : 1', status: 'EXCELLENT', description: '(Cash + Bank + Debtors) / Current Liabilities' },
      { name: 'Gross Profit Margin', category: 'Profitability', value: '47.1%', benchmark: '> 30.0%', status: 'HEALTHY', description: 'Gross Profit / Operating Turnover' },
      { name: 'Net Profit Margin (NPAT)', category: 'Profitability', value: '15.6%', benchmark: '> 10.0%', status: 'HEALTHY', description: 'Net Profit After Tax / Net Revenue' },
      { name: 'Return on Equity (ROE)', category: 'Profitability', value: '21.9%', benchmark: '> 15.0%', status: 'EXCELLENT', description: 'Net Annualized Profit / Shareholders Equity' },
      { name: 'Debt to Equity Ratio', category: 'Solvency', value: '0.20 : 1', benchmark: '< 1.0 : 1', status: 'CONSERVATIVE', description: 'Total Debt (₹15L) / Shareholders Funds (₹74.5L)' },
      { name: 'Debtor Collection Period', category: 'Working Capital', value: '40 Days', benchmark: '< 60 Days', status: 'EFFICIENT', description: 'Average time taken to collect receivables from customers' },
      { name: 'Creditor Payment Period', category: 'Working Capital', value: '30 Days', benchmark: '< 45 Days', status: 'ON_TIME', description: 'Average time taken to settle supplier bills' },
    ];

    return {
      summary: {
        overallHealthScore: 'A+ (Prime Investment Grade)',
        workingCapitalCycle: '10 Days',
        solvencyGrade: 'Low Debt Leverage',
      },
      ratios,
    };
  }

  /**
   * 8. GROUP SUMMARY & CHART OF ACCOUNTS ROLLUP
   */
  public static async getGroupSummary(tenantId: string) {
    const groups = [
      { groupName: 'Current Assets', ledgerCount: 8, debitTotal: 5616140, creditTotal: 0, netBalance: 5616140, nature: 'DEBIT' },
      { groupName: 'Fixed Assets', ledgerCount: 3, debitTotal: 4000000, creditTotal: 0, netBalance: 4000000, nature: 'DEBIT' },
      { groupName: 'Current Liabilities', ledgerCount: 5, debitTotal: 0, creditTotal: 666140, netBalance: 666140, nature: 'CREDIT' },
      { groupName: 'Share Capital & Reserves', ledgerCount: 4, debitTotal: 0, creditTotal: 7450000, netBalance: 7450000, nature: 'CREDIT' },
      { groupName: 'Direct Expenses (COGS)', ledgerCount: 6, debitTotal: 5471000, creditTotal: 0, netBalance: 5471000, nature: 'DEBIT' },
      { groupName: 'Indirect Expenses', ledgerCount: 12, debitTotal: 2814414, creditTotal: 0, netBalance: 2814414, nature: 'DEBIT' },
      { groupName: 'Sales Accounts (Revenue)', ledgerCount: 2, debitTotal: 0, creditTotal: 10464000, netBalance: 10464000, nature: 'CREDIT' },
    ];

    return {
      summary: {
        totalActiveGroups: groups.length,
        totalLedgerCount: 40,
      },
      groups,
    };
  }

  /**
   * 9. CONSOLIDATED GST COMPUTATION & GSTR-3B TAX MATRIX
   */
  public static async getGstComputation(tenantId: string, filter: DateFilterDto = {}) {
    const outwardLiability = {
      taxableTurnover: 2750000,
      cgst: 184800,
      sgst: 184800,
      igst: 97200,
      totalOutputTax: 466800,
    };

    const inwardItc = {
      taxableBase: 820000,
      cgst: 57300,
      sgst: 57300,
      igst: 20160,
      totalInputTaxCredit: 134760,
    };

    const netGstPayable = {
      cgstPayable: outwardLiability.cgst - inwardItc.cgst,
      sgstPayable: outwardLiability.sgst - inwardItc.sgst,
      igstPayable: outwardLiability.igst - inwardItc.igst,
      totalNetCashPayable: outwardLiability.totalOutputTax - inwardItc.totalInputTaxCredit,
    };

    return {
      summary: {
        outwardTaxableTurnover: outwardLiability.taxableTurnover,
        totalOutputTax: outwardLiability.totalOutputTax,
        totalInputTaxCredit: inwardItc.totalInputTaxCredit,
        totalNetGstPayable: netGstPayable.totalNetCashPayable,
      },
      outwardLiability,
      inwardItc,
      netGstPayable,
    };
  }
}
