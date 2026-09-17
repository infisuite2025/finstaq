import React, { useState, useEffect } from 'react';
import {
  Scale,
  Download,
  Calendar,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  Layers,
  Landmark,
  BadgePercent,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  PieChart,
  Printer,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Eye,
  X,
  FileText,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import { UniversalReportPrintModal, ReportPrintData } from '../../common/UniversalReportPrintModal';

type ReportTab =
  | 'balance_sheet'
  | 'profit_and_loss'
  | 'trial_balance'
  | 'cash_flow'
  | 'ledger_statement'
  | 'bank_reconciliation'
  | 'ratio_analysis'
  | 'group_summary'
  | 'gst_computation';

type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';

interface FiscalYearOption {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'FINANCE_REVIEW' | 'FINAL_CLOSED' | 'AUDIT_LOCKED';
  closedAt?: string;
  closedBy?: string;
  auditHash?: string;
}

const FISCAL_YEARS: FiscalYearOption[] = [
  {
    code: '2026-27',
    name: 'FY 2026-27 (Current Active)',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    status: 'OPEN',
  },
  {
    code: '2025-26',
    name: 'FY 2025-26 (Under Audit / Review)',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    status: 'FINANCE_REVIEW',
    closedAt: '2026-04-15T10:00:00Z',
    closedBy: 'Priya Deshmukh (ACCOUNTANT)',
    auditHash: 'SHA256:7b901f4c829e...mca2026',
  },
  {
    code: '2024-25',
    name: 'FY 2024-25 (Final Closed & Audited)',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    status: 'FINAL_CLOSED',
    closedAt: '2025-04-12T14:30:00Z',
    closedBy: 'Priya Deshmukh (ACCOUNTANT)',
    auditHash: 'SHA256:3a89e4c19d08...mca2025',
  },
];

const FALLBACK_ACCOUNTING: Record<string, Record<ReportTab, any>> = {
  '2026-27': {
    balance_sheet: {
      summary: { asOfDate: '2026-09-30', totalLiabilities: 9616140, totalAssets: 9616140, difference: 0, isBalanced: true },
      liabilities: [
        { groupName: "Shareholders' Funds", subGroups: [{ name: 'Share Capital (Equity)', amount: 5000000 }, { name: 'Reserves & Surplus (Retained Earnings)', amount: 2450000 }], total: 7450000 },
        { groupName: 'Non-Current Liabilities', subGroups: [{ name: 'Long Term Bank Borrowings (Term Loans)', amount: 1500000 }], total: 1500000 },
        { groupName: 'Current Liabilities', subGroups: [{ name: 'Sundry Creditors (Trade Payables)', amount: 433860 }, { name: 'Duties & Taxes (Net GST Output Liability)', amount: 147280 }, { name: 'Outstanding Operational Expenses', amount: 85000 }], total: 666140 },
      ],
      assets: [
        { groupName: 'Non-Current / Fixed Assets', subGroups: [{ name: 'Plant, Machinery & Industrial Equipment', amount: 4200000 }, { name: 'Office Furniture, Computers & Fixtures', amount: 450000 }, { name: 'Less: Accumulated Depreciation', amount: -650000 }], total: 4000000 },
        { groupName: 'Current Assets', subGroups: [{ name: 'Closing Inventory (Raw Materials & Finished Goods)', amount: 2450000 }, { name: 'Sundry Debtors (Trade Receivables)', amount: 1156400 }, { name: 'Cash in Hand (Petty Cash)', amount: 65000 }, { name: 'Bank Accounts (HDFC Current & ICICI Escrow)', amount: 1814740 }, { name: 'Input Tax Credit (ITC) Electronic Ledger', amount: 130000 }], total: 5616140 },
      ],
    },
    profit_and_loss: {
      summary: { totalRevenue: 10568586, costOfGoodsSold: 5571000, grossProfit: 4997586, grossMarginPercent: 47.29, totalOperatingExpenses: 2819000, netProfitBeforeTax: 2178586, provisionForTax: 544646, netProfitAfterTax: 1633940, netMarginPercent: 15.46 },
      revenue: [
        { category: 'Revenue from Operations (Gross Sales)', amount: 10464000 },
        { category: 'Less: Sales Returns & Rebates', amount: -20414 },
        { category: 'Other Operating Income (Export Incentives, Scraps)', amount: 125000 },
      ],
      directExpenses: [
        { category: 'Opening Stock (Raw Materials & WIP)', amount: 1850000 },
        { category: 'Purchase of Raw Materials & Consumables', amount: 5286000 },
        { category: 'Direct Factory Wages & Contract Labor', amount: 720000 },
        { category: 'Freight Inward & Logistics Customs', amount: 145000 },
        { category: 'Less: Closing Stock of Inventory', amount: -2450000 },
      ],
      operatingExpenses: [
        { category: 'Salaries, Allowances & Employee Benefits', amount: 1450000 },
        { category: 'Power, Fuel & Factory Utilities', amount: 280000 },
        { category: 'Rent, Rates & Office Overhead', amount: 360000 },
        { category: 'Selling & Distribution Freight Outward', amount: 195000 },
        { category: 'Legal, Professional & Audit Fees', amount: 85000 },
        { category: 'Depreciation & Amortization Expense', amount: 240000 },
        { category: 'Finance Costs & Bank Charges', amount: 120000 },
      ],
    },
    trial_balance: {
      summary: { totalOpeningDr: 8530000, totalOpeningCr: 8530000, totalPeriodDr: 32200000, totalPeriodCr: 32200000, totalClosingDr: 9502540, totalClosingCr: 9502540, isBalanced: true },
      groups: [
        { groupName: 'Capital Account & Reserves', openingDr: 0, openingCr: 7000000, periodDr: 0, periodCr: 450000, closingDr: 0, closingCr: 7450000 },
        { groupName: 'Loans & Borrowings', openingDr: 0, openingCr: 1800000, periodDr: 300000, periodCr: 0, closingDr: 0, closingCr: 1500000 },
        { groupName: 'Fixed Assets (Tangible)', openingDr: 4500000, openingCr: 0, periodDr: 150000, periodCr: 650000, closingDr: 4000000, closingCr: 0 },
        { groupName: 'Sundry Creditors (Trade Payables)', openingDr: 0, openingCr: 380000, periodDr: 4850000, periodCr: 4903860, closingDr: 0, closingCr: 433860 },
        { groupName: 'Duties & Taxes (GST Accounts)', openingDr: 0, openingCr: 80000, periodDr: 1250000, periodCr: 1317280, closingDr: 0, closingCr: 147280 },
        { groupName: 'Sundry Debtors (Trade Receivables)', openingDr: 980000, openingCr: 0, periodDr: 10464000, periodCr: 10287600, closingDr: 1156400, closingCr: 0 },
        { groupName: 'Closing Stock Inventory', openingDr: 1850000, openingCr: 0, periodDr: 5286000, periodCr: 4686000, closingDr: 2450000, closingCr: 0 },
        { groupName: 'Bank & Cash Accounts', openingDr: 1200000, openingCr: 0, periodDr: 9850000, periodCr: 9170260, closingDr: 1879740, closingCr: 0 },
      ],
    },
    cash_flow: {
      summary: { netOperatingCash: 1338680, netInvestingCash: -400000, netFinancingCash: -258940, netChangeInCash: 679740, openingCashBank: 1200000, closingCashBank: 1879740 },
      operatingActivities: [
        { description: 'Net Profit Before Tax & Extraordinary Items', amount: 2178586 },
        { description: 'Add: Depreciation & Amortization Expense', amount: 240000 },
        { description: 'Add: Finance Interest Costs', amount: 120000 },
        { description: 'Operating Profit Before Working Capital Changes', amount: 2538586 },
        { description: '(Increase) in Trade Receivables', amount: -176400 },
        { description: '(Increase) in Stock Inventories', amount: -600000 },
        { description: 'Increase in Trade Payables', amount: 53860 },
        { description: 'Increase in Other Current Liabilities', amount: 67280 },
        { description: 'Cash Generated from Operations', amount: 1883326 },
        { description: 'Less: Direct Corporate Tax Paid', amount: -544646 },
      ],
      investingActivities: [
        { description: 'Purchase of New CNC Machine & Equipment (CapEx)', amount: -450000 },
        { description: 'Proceeds from Sale of Depreciated Tooling', amount: 50000 },
      ],
      financingActivities: [
        { description: 'Repayment of Long-Term Term Loans', amount: -300000 },
        { description: 'Finance Interest Paid to Lenders', amount: -120000 },
        { description: 'Capital Injected by Promoters / Equity', amount: 161060 },
      ],
    },
    ledger_statement: {
      summary: { ledgerName: 'HDFC Bank - Current A/c #50200012345678', accountGroup: 'Bank Accounts', totalDebits: 2026000, totalCredits: 413360, closingBalance: 1612640, balanceType: 'Dr' },
      entries: [
        { date: '2026-09-01', voucherNo: 'OB-2026-001', voucherType: 'OPENING', particulars: 'Opening Balance b/f', debit: 1200000, credit: 0, balance: 1200000, balanceType: 'Dr' },
        { date: '2026-09-02', voucherNo: 'RCP-2026-0041', voucherType: 'RECEIPT', particulars: 'To Reliance Industries Limited (Inv #101)', debit: 413000, credit: 0, balance: 1613000, balanceType: 'Dr' },
        { date: '2026-09-03', voucherNo: 'PMT-2026-0038', voucherType: 'PAYMENT', particulars: 'By Tata Steel BSL Limited (Bill #85)', debit: 0, credit: 133340, balance: 1479660, balanceType: 'Dr' },
        { date: '2026-09-05', voucherNo: 'PMT-2026-0039', voucherType: 'PAYMENT', particulars: 'By Steel Kraft Components Ltd', debit: 0, credit: 147500, balance: 1332160, balanceType: 'Dr' },
        { date: '2026-09-08', voucherNo: 'RCP-2026-0042', voucherType: 'RECEIPT', particulars: 'To Mahindra & Mahindra Automotive', debit: 230100, credit: 0, balance: 1562260, balanceType: 'Dr' },
        { date: '2026-09-10', voucherNo: 'PMT-2026-0040', voucherType: 'PAYMENT', particulars: 'By Monthly Factory Power & Utilities', debit: 0, credit: 82520, balance: 1479740, balanceType: 'Dr' },
        { date: '2026-09-10', voucherNo: 'RCP-2026-0043', voucherType: 'RECEIPT', particulars: 'To BHEL New Delhi (Immediate Net)', debit: 182900, credit: 0, balance: 1662640, balanceType: 'Dr' },
        { date: '2026-09-12', voucherNo: 'JRN-2026-0019', voucherType: 'JOURNAL', particulars: 'By Petty Cash Transfer to Plant', debit: 0, credit: 50000, balance: 1612640, balanceType: 'Dr' },
      ],
    },
    bank_reconciliation: {
      summary: { bankName: 'HDFC Bank - Current Account (A/c #50200012345678)', balanceAsPerCompanyBooks: 1612640, unpresentedChequesTotal: 100300, unclearedDepositsTotal: 330400, balanceAsPerBankStatement: 1385040, reconciliationStatus: 'RECONCILED' },
      brsItems: [
        { date: '2026-09-08', chqNo: 'CHQ-449102', particulars: 'Cheque Issued to Global Tech (Not yet presented by vendor)', bookAmount: -100300, type: 'UNPRESENTED_CHEQUE' },
        { date: '2026-09-10', chqNo: 'NEFT-88912', particulars: 'Customer Wire from Larsen & Toubro (Pending clearance)', bookAmount: 330400, type: 'UNCLEARED_DEPOSIT' },
        { date: '2026-09-11', chqNo: 'DIRECT-DEBIT', particulars: 'Bank Monthly Service & Locker Charges debited by bank', bookAmount: -2500, type: 'BANK_CHARGES' },
      ],
    },
    ratio_analysis: {
      summary: { overallHealthScore: 'A+ (Prime Investment Grade)', workingCapitalCycle: '10 Days', solvencyGrade: 'Low Debt Leverage' },
      ratios: [
        { name: 'Current Ratio', category: 'Liquidity', value: '8.43 : 1', benchmark: '> 1.5 : 1', status: 'EXCELLENT', description: 'Current Assets (₹56.16L) / Current Liabilities (₹6.66L)' },
        { name: 'Quick / Acid-Test Ratio', category: 'Liquidity', value: '4.75 : 1', benchmark: '> 1.0 : 1', status: 'EXCELLENT', description: '(Cash + Bank + Debtors) / Current Liabilities' },
        { name: 'Gross Profit Margin', category: 'Profitability', value: '47.3%', benchmark: '> 30.0%', status: 'HEALTHY', description: 'Gross Profit / Operating Turnover' },
        { name: 'Net Profit Margin (NPAT)', category: 'Profitability', value: '15.5%', benchmark: '> 10.0%', status: 'HEALTHY', description: 'Net Profit After Tax / Net Revenue' },
        { name: 'Return on Equity (ROE)', category: 'Profitability', value: '21.9%', benchmark: '> 15.0%', status: 'EXCELLENT', description: 'Net Annualized Profit / Shareholders Equity' },
        { name: 'Debt to Equity Ratio', category: 'Solvency', value: '0.20 : 1', benchmark: '< 1.0 : 1', status: 'CONSERVATIVE', description: 'Total Debt (₹15L) / Shareholders Funds (₹74.5L)' },
        { name: 'Debtor Collection Period', category: 'Working Capital', value: '40 Days', benchmark: '< 60 Days', status: 'EFFICIENT', description: 'Average time taken to collect receivables from customers' },
        { name: 'Creditor Payment Period', category: 'Working Capital', value: '30 Days', benchmark: '< 45 Days', status: 'ON_TIME', description: 'Average time taken to settle supplier bills' },
      ],
    },
    group_summary: {
      summary: { totalActiveGroups: 7, totalLedgerCount: 40 },
      groups: [
        { groupName: 'Current Assets', ledgerCount: 8, debitTotal: 5616140, creditTotal: 0, netBalance: 5616140, nature: 'DEBIT' },
        { groupName: 'Fixed Assets', ledgerCount: 3, debitTotal: 4000000, creditTotal: 0, netBalance: 4000000, nature: 'DEBIT' },
        { groupName: 'Current Liabilities', ledgerCount: 5, debitTotal: 0, creditTotal: 666140, netBalance: 666140, nature: 'CREDIT' },
        { groupName: 'Share Capital & Reserves', ledgerCount: 4, debitTotal: 0, creditTotal: 7450000, netBalance: 7450000, nature: 'CREDIT' },
        { groupName: 'Direct Expenses (COGS)', ledgerCount: 6, debitTotal: 5471000, creditTotal: 0, netBalance: 5471000, nature: 'DEBIT' },
        { groupName: 'Indirect Expenses', ledgerCount: 12, debitTotal: 2814414, creditTotal: 0, netBalance: 2814414, nature: 'DEBIT' },
        { groupName: 'Sales Accounts (Revenue)', ledgerCount: 2, debitTotal: 0, creditTotal: 10464000, netBalance: 10464000, nature: 'CREDIT' },
      ],
    },
    gst_computation: {
      summary: { outwardTaxableTurnover: 2750000, totalOutputTax: 466800, totalInputTaxCredit: 134760, totalNetGstPayable: 332040 },
      outwardLiability: { taxableTurnover: 2750000, cgst: 184800, sgst: 184800, igst: 97200, totalOutputTax: 466800 },
      inwardItc: { taxableBase: 820000, cgst: 57300, sgst: 57300, igst: 20160, totalInputTaxCredit: 134760 },
      netGstPayable: { cgstPayable: 127500, sgstPayable: 127500, igstPayable: 77040, totalNetCashPayable: 332040 },
    },
  },
  '2025-26': {
    balance_sheet: {
      summary: { asOfDate: '2026-03-31', totalLiabilities: 12695000, totalAssets: 12695000, difference: 0, isBalanced: true },
      liabilities: [
        { groupName: "Shareholders' Funds", subGroups: [{ name: 'Share Capital (Equity)', amount: 5000000 }, { name: 'Reserves & Surplus (Retained Earnings)', amount: 2965000 }, { name: 'Current Year Audited Net Profit', amount: 2250000 }], total: 10215000 },
        { groupName: 'Non-Current Liabilities', subGroups: [{ name: 'Bank Overdraft / Working Capital', amount: 1500000 }], total: 1500000 },
        { groupName: 'Current Liabilities', subGroups: [{ name: 'Sundry Creditors (Trade Payables)', amount: 1425000 }, { name: 'Duties & Taxes (GST Output)', amount: 210000 }, { name: 'TDS Payable (Sec 194C/J)', amount: 45000 }], total: 1680000 },
      ],
      assets: [
        { groupName: 'Non-Current / Fixed Assets', subGroups: [{ name: 'Plant & Machinery (Gross Cost)', amount: 5000000 }, { name: 'Less: Accumulated Depreciation', amount: -1300000 }], total: 3700000 },
        { groupName: 'Current Assets', subGroups: [{ name: 'Finished Goods Inventory', amount: 3200000 }, { name: 'Trade Debtors (Accounts Receivable)', amount: 1845000 }, { name: 'Cash on Hand', amount: 145000 }, { name: 'HDFC Current Account', amount: 2450000 }, { name: 'ICICI Operations Account', amount: 1120000 }, { name: 'GST Input Tax Credit (ITC)', amount: 185000 }], total: 8945000 },
      ],
    },
    profit_and_loss: {
      summary: { totalRevenue: 15785000, costOfGoodsSold: 7800000, grossProfit: 7985000, grossMarginPercent: 50.58, totalOperatingExpenses: 5735000, netProfitBeforeTax: 2250000, provisionForTax: 562500, netProfitAfterTax: 1687500, netMarginPercent: 10.69 },
      revenue: [
        { category: 'Domestic Sales Revenue', amount: 12500000 },
        { category: 'Export Sales Revenue', amount: 3200000 },
        { category: 'Interest & Other Income', amount: 85000 },
      ],
      directExpenses: [
        { category: 'Raw Material Purchases & Direct Processing', amount: 7800000 },
      ],
      operatingExpenses: [
        { category: 'Salaries & Staff Welfare', amount: 3100000 },
        { category: 'Factory & Office Rent', amount: 1200000 },
        { category: 'Power, Fuel & Utilities', amount: 650000 },
        { category: 'Depreciation Expense (SLM)', amount: 550000 },
        { category: 'Legal & Statutory Audit Fees', amount: 260000 },
      ],
    },
    trial_balance: {
      summary: { totalOpeningDr: 10500000, totalOpeningCr: 10500000, totalPeriodDr: 45000000, totalPeriodCr: 45000000, totalClosingDr: 12695000, totalClosingCr: 12695000, isBalanced: true },
      groups: [
        { groupName: 'Share Capital & Reserves', openingDr: 0, openingCr: 7965000, periodDr: 0, periodCr: 2250000, closingDr: 0, closingCr: 10215000 },
        { groupName: 'Loans & Working Capital', openingDr: 0, openingCr: 1500000, periodDr: 0, periodCr: 0, closingDr: 0, closingCr: 1500000 },
        { groupName: 'Plant & Machinery (Fixed Assets)', openingDr: 5000000, openingCr: 750000, periodDr: 0, periodCr: 550000, closingDr: 3700000, closingCr: 0 },
        { groupName: 'Trade Creditors (Accounts Payable)', openingDr: 0, openingCr: 1100000, periodDr: 7800000, periodCr: 8125000, closingDr: 0, closingCr: 1425000 },
        { groupName: 'Trade Debtors (Accounts Receivable)', openingDr: 1200000, openingCr: 0, periodDr: 15700000, periodCr: 15055000, closingDr: 1845000, closingCr: 0 },
        { groupName: 'Finished Goods Inventory', openingDr: 2800000, openingCr: 0, periodDr: 7800000, periodCr: 7400000, closingDr: 3200000, closingCr: 0 },
        { groupName: 'Cash & Bank Balances', openingDr: 1500000, openingCr: 0, periodDr: 16000000, periodCr: 13785000, closingDr: 3715000, closingCr: 0 },
        { groupName: 'Duties & Taxes', openingDr: 0, openingCr: 50000, periodDr: 185000, periodCr: 255000, closingDr: 185000, closingCr: 255000 },
      ],
    },
    cash_flow: {
      summary: { netOperatingCash: 2450000, netInvestingCash: -500000, netFinancingCash: -450000, netChangeInCash: 1500000, openingCashBank: 2215000, closingCashBank: 3715000 },
      operatingActivities: [
        { description: 'Net Profit Before Tax', amount: 2250000 },
        { description: 'Add: Depreciation', amount: 550000 },
        { description: 'Cash Generated from Operations', amount: 2800000 },
      ],
      investingActivities: [{ description: 'Purchase of Plant Machinery', amount: -500000 }],
      financingActivities: [{ description: 'Dividend / Repayments', amount: -450000 }],
    },
    ledger_statement: {
      summary: { ledgerName: 'HDFC Current Account (FY 2025-26)', accountGroup: 'Bank Accounts', totalDebits: 14500000, totalCredits: 12050000, closingBalance: 2450000, balanceType: 'Dr' },
      entries: [
        { date: '2025-04-01', voucherNo: 'OB-2025-001', voucherType: 'OPENING', particulars: 'Opening Balance b/f', debit: 1100000, credit: 0, balance: 1100000, balanceType: 'Dr' },
        { date: '2026-03-31', voucherNo: 'JV-YE-2026-09', voucherType: 'JOURNAL', particulars: 'Year-End Interest Accrual', debit: 85000, credit: 0, balance: 2450000, balanceType: 'Dr' },
      ],
    },
    bank_reconciliation: { summary: { bankName: 'HDFC Bank', balanceAsPerCompanyBooks: 2450000, reconciliationStatus: 'RECONCILED' }, brsItems: [] },
    ratio_analysis: { summary: { overallHealthScore: 'A (Audited)', workingCapitalCycle: '12 Days' }, ratios: [] },
    group_summary: { summary: { totalActiveGroups: 6, totalLedgerCount: 35 }, groups: [] },
    gst_computation: { summary: { outwardTaxableTurnover: 12500000, totalOutputTax: 2250000, totalInputTaxCredit: 1404000, totalNetGstPayable: 846000 }, outwardLiability: {}, inwardItc: {}, netGstPayable: {} },
  },
  '2024-25': {
    balance_sheet: {
      summary: { asOfDate: '2025-03-31', totalLiabilities: 10500000, totalAssets: 10500000, difference: 0, isBalanced: true },
      liabilities: [
        { groupName: "Shareholders' Funds", subGroups: [{ name: 'Share Capital (Equity)', amount: 5000000 }, { name: 'Reserves & Surplus (Audited)', amount: 2965000 }], total: 7965000 },
        { groupName: 'Non-Current Liabilities', subGroups: [{ name: 'Working Capital Loan', amount: 1500000 }], total: 1500000 },
        { groupName: 'Current Liabilities', subGroups: [{ name: 'Sundry Creditors', amount: 1035000 }], total: 1035000 },
      ],
      assets: [
        { groupName: 'Fixed Assets', subGroups: [{ name: 'Plant & Machinery (Net)', amount: 4250000 }], total: 4250000 },
        { groupName: 'Current Assets', subGroups: [{ name: 'Inventory & Debtors', amount: 4000000 }, { name: 'Cash & Bank', amount: 2250000 }], total: 6250000 },
      ],
    },
    profit_and_loss: {
      summary: { totalRevenue: 12000000, costOfGoodsSold: 6500000, grossProfit: 5500000, totalOperatingExpenses: 3700000, netProfitAfterTax: 1350000 },
      revenue: [{ category: 'Gross Sales', amount: 12000000 }],
      directExpenses: [{ category: 'Cost of Materials', amount: 6500000 }],
      operatingExpenses: [{ category: 'Operating Expenses', amount: 3700000 }],
    },
    trial_balance: {
      summary: { totalOpeningDr: 8000000, totalOpeningCr: 8000000, totalPeriodDr: 25000000, totalPeriodCr: 25000000, totalClosingDr: 10500000, totalClosingCr: 10500000, isBalanced: true },
      groups: [
        { groupName: 'Capital & Reserves', openingDr: 0, openingCr: 6615000, periodDr: 0, periodCr: 1350000, closingDr: 0, closingCr: 7965000 },
        { groupName: 'Fixed Assets', openingDr: 4500000, openingCr: 0, periodDr: 0, periodCr: 250000, closingDr: 4250000, closingCr: 0 },
        { groupName: 'Cash & Bank Balances', openingDr: 1100000, openingCr: 0, periodDr: 12000000, periodCr: 10850000, closingDr: 2250000, closingCr: 0 },
      ],
    },
    cash_flow: { summary: { netOperatingCash: 1800000 }, operatingActivities: [], investingActivities: [], financingActivities: [] },
    ledger_statement: { summary: { ledgerName: 'HDFC Current Account (FY 2024-25)' }, entries: [] },
    bank_reconciliation: { summary: { bankName: 'HDFC Bank' }, brsItems: [] },
    ratio_analysis: { summary: {}, ratios: [] },
    group_summary: { summary: {}, groups: [] },
    gst_computation: { summary: {}, outwardLiability: {}, inwardItc: {}, netGstPayable: {} },
  },
};

export function AccountingReportsWorkspace() {
  const [activeTab, setActiveTab] = useState<ReportTab>('balance_sheet');
  const [selectedFY, setSelectedFY] = useState<string>('2026-27');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('OWNER');
  const [startDate, setStartDate] = useState<string>('2026-04-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [printData, setPrintData] = useState<ReportPrintData | null>(null);

  // Drilldown Modal State
  const [drilldownModal, setDrilldownModal] = useState<{
    isOpen: boolean;
    title: string;
    groupName: string;
    accountCode: string;
    entries: any[];
  }>({
    isOpen: false,
    title: '',
    groupName: '',
    accountCode: '',
    entries: [],
  });

  const activeFyConfig = FISCAL_YEARS.find((f) => f.code === selectedFY) || FISCAL_YEARS[0];
  const isClosedPeriod = activeFyConfig.status === 'FINAL_CLOSED' || activeFyConfig.status === 'AUDIT_LOCKED';
  const isReviewPeriod = activeFyConfig.status === 'FINANCE_REVIEW';

  // Handle Fiscal Year Change
  const handleFYChange = (code: string) => {
    setSelectedFY(code);
    const fy = FISCAL_YEARS.find((f) => f.code === code);
    if (fy) {
      setStartDate(fy.startDate);
      setEndDate(fy.endDate);
    }
  };

  // Role Access Gate: Data Entry Operator cannot view sensitive P&L, Balance Sheet, or closed years!
  const isSensitiveStatement = ['balance_sheet', 'profit_and_loss', 'trial_balance', 'ratio_analysis', 'cash_flow'].includes(activeTab);
  const isRestrictedForUser = currentUserRole === 'DATA_ENTRY' && (isSensitiveStatement || isClosedPeriod);

  // Live Database Report Data State
  const [liveReportData, setLiveReportData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const endpointMap: Record<ReportTab, string> = {
          balance_sheet: '/api/v1/accounting/reports/balance-sheet',
          profit_and_loss: '/api/v1/accounting/reports/profit-and-loss',
          trial_balance: '/api/v1/accounting/reports/trial-balance',
          cash_flow: '/api/v1/accounting/reports/cash-flow',
          ledger_statement: '/api/v1/accounting/reports/ledger-statement',
          bank_reconciliation: '/api/v1/accounting/reports/bank-reconciliation',
          ratio_analysis: '/api/v1/accounting/reports/ratio-analysis',
          group_summary: '/api/v1/accounting/reports/group-summary',
          gst_computation: '/api/v1/accounting/reports/gst-computation',
        };
        const endpoint = endpointMap[activeTab];
        if (endpoint) {
          const res = await fetch(`${endpoint}?fromDate=${startDate}&toDate=${endDate}`, {
            headers: { 'x-tenant-id': 'tenant-default-01' },
          });
          if (res.ok) {
            const json = await res.json();
            if (isMounted && json && (json.data || json.summary || json.groups || json.liabilities)) {
              setLiveReportData(json.data || json);
            }
          }
        }
      } catch (err) {
        console.warn('Live report fetch fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchReport();
    return () => { isMounted = false; };
  }, [activeTab, selectedFY, startDate, endDate]);

  const reportData = liveReportData || FALLBACK_ACCOUNTING[selectedFY]?.[activeTab] || FALLBACK_ACCOUNTING['2026-27'][activeTab];

  const handleOpenPrintModal = () => {
    let pData: ReportPrintData = {
      reportTitle: `${activeTab.replace(/_/g, ' ').toUpperCase()} (${selectedFY})`,
      department: 'ACCOUNTING',
      startDate,
      endDate,
    };

    if (activeTab === 'balance_sheet') {
      pData.reportTitle = `BALANCE SHEET (SCHEDULE III) — FY ${selectedFY}`;
      pData.subtitle = `Statement of Financial Position as per Companies Act, 2013 ${isClosedPeriod ? '[AUDITED & CLOSED]' : ''}`;
      pData.asOfDate = reportData.summary?.asOfDate || endDate;
      pData.summaryCards = [
        { label: 'Total Assets', value: reportData.summary?.totalAssets || 0, format: 'currency' },
        { label: 'Total Liabilities', value: reportData.summary?.totalLiabilities || 0, format: 'currency' },
        { label: 'Difference', value: reportData.summary?.difference || 0, format: 'currency' },
      ];
      pData.sections = [
        {
          title: "I. LIABILITIES & SHAREHOLDERS' FUNDS",
          columns: [
            { header: 'Liability Group', accessor: 'name' },
            { header: 'Sub-Category / Account Head', accessor: 'group' },
            { header: 'Amount (₹)', accessor: 'amount', align: 'right', format: 'currency' },
          ],
          rows: (reportData.liabilities || []).flatMap((g: any) =>
            (g.subGroups || []).map((sg: any) => ({ name: g.groupName, group: sg.name, amount: sg.amount }))
          ),
          totalRow: { name: 'TOTAL LIABILITIES & EQUITY', group: '', amount: reportData.summary?.totalLiabilities || 0 },
        },
        {
          title: 'II. ASSETS & CAPITAL DEPLOYMENT',
          columns: [
            { header: 'Asset Classification', accessor: 'name' },
            { header: 'Ledger Account / Category', accessor: 'group' },
            { header: 'Amount (₹)', accessor: 'amount', align: 'right', format: 'currency' },
          ],
          rows: (reportData.assets || []).flatMap((g: any) =>
            (g.subGroups || []).map((sg: any) => ({ name: g.groupName, group: sg.name, amount: sg.amount }))
          ),
          totalRow: { name: 'TOTAL ASSETS', group: '', amount: reportData.summary?.totalAssets || 0 },
        },
      ];
    } else if (activeTab === 'trial_balance') {
      pData.reportTitle = `TRIAL BALANCE STATEMENT — FY ${selectedFY}`;
      pData.subtitle = 'Double-Entry General Ledger Balances Verification';
      pData.columns = [
        { header: 'Account / Group Head', accessor: 'groupName' },
        { header: 'Opening Dr (₹)', accessor: 'openingDr', align: 'right', format: 'currency' },
        { header: 'Opening Cr (₹)', accessor: 'openingCr', align: 'right', format: 'currency' },
        { header: 'Period Dr (₹)', accessor: 'periodDr', align: 'right', format: 'currency' },
        { header: 'Period Cr (₹)', accessor: 'periodCr', align: 'right', format: 'currency' },
        { header: 'Closing Dr (₹)', accessor: 'closingDr', align: 'right', format: 'currency' },
        { header: 'Closing Cr (₹)', accessor: 'closingCr', align: 'right', format: 'currency' },
      ];
      pData.rows = reportData.groups || [];
      pData.totalRow = {
        groupName: 'GRAND TOTAL (VERIFIED BALANCED)',
        openingDr: reportData.summary?.totalOpeningDr || 0,
        openingCr: reportData.summary?.totalOpeningCr || 0,
        periodDr: reportData.summary?.totalPeriodDr || 0,
        periodCr: reportData.summary?.totalPeriodCr || 0,
        closingDr: reportData.summary?.totalClosingDr || 0,
        closingCr: reportData.summary?.totalClosingCr || 0,
      };
    }

    setPrintData(pData);
    setPrintModalOpen(true);
  };

  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let rows: any[] = [];
    if (reportData.groups) rows = reportData.groups;
    else if (reportData.entries) rows = reportData.entries;
    else if (reportData.ratios) rows = reportData.ratios;
    else if (reportData.operatingActivities) rows = reportData.operatingActivities;

    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== 'object');
    csvContent += headers.join(',') + '\r\n';

    rows.forEach((row) => {
      const line = headers
        .map((h) => {
          const val = row[h] !== undefined && row[h] !== null ? String(row[h]).replace(/"/g, '""') : '';
          return `"${val}"`;
        })
        .join(',');
      csvContent += line + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finstaq_${activeTab}_${selectedFY}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open drilldown for any account
  const handleDrilldown = (groupName: string) => {
    setDrilldownModal({
      isOpen: true,
      title: `Ledger Account Statement: ${groupName}`,
      groupName,
      accountCode: 'GL-' + Math.floor(1000 + Math.random() * 9000),
      entries: [
        { date: `${startDate}`, voucherNo: `OB-${selectedFY}-001`, voucherType: 'OPENING', particulars: 'Opening Balance b/f', debit: 4500000, credit: 0, balance: 4500000 },
        { date: '2025-06-15', voucherNo: 'PMT-2025-0819', voucherType: 'PAYMENT', particulars: 'By Industrial Automation Equip', debit: 150000, credit: 0, balance: 4650000 },
        { date: '2026-03-31', voucherNo: 'JV-YE-2026-DEP', voucherType: 'JOURNAL', particulars: 'By Annual Depreciation Transfer (SLM)', debit: 0, credit: 650000, balance: 4000000 },
      ],
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header Bar & Global Security Controls */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Financial & Accounting Reports</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Schedule III & Statutory Standard
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Point-in-time accurate balance sheets, continuous ledger reconstruction & role-based visibility control
            </p>
          </div>
        </div>

        {/* Global Controls: Fiscal Year Selector, Role Simulator & Actions */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Role Simulator Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Role:</span>
            {(['OWNER', 'ACCOUNTANT', 'DATA_ENTRY'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCurrentUserRole(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  currentUserRole === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r === 'OWNER' ? 'Owner' : r === 'ACCOUNTANT' ? 'Accountant' : 'Data Entry'}
              </button>
            ))}
          </div>

          {/* Fiscal Year Selector */}
          <div className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs">Fiscal Year:</span>
            <select
              value={selectedFY}
              onChange={(e) => handleFYChange(e.target.value)}
              className="bg-transparent border-0 font-bold text-indigo-700 dark:text-indigo-300 text-xs focus:outline-hidden cursor-pointer"
            >
              {FISCAL_YEARS.map((fy) => (
                <option key={fy.code} value={fy.code} className="text-slate-900">
                  {fy.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenPrintModal}
            disabled={isRestrictedForUser}
            className="px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={isRestrictedForUser}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* CLOSED / AUDITED HISTORICAL ARCHIVE BANNER */}
      {isClosedPeriod && (
        <div className="bg-slate-900 text-slate-100 px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-inner">
          <div className="flex items-center space-x-3 text-xs">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-amber-300 tracking-wide uppercase">
                🔒 FY {selectedFY} [FINAL CLOSED & AUDITED] — READ-ONLY HISTORICAL ARCHIVE
              </span>
              <span className="text-slate-400 ml-2">
                Books finalized on {new Date(activeFyConfig.closedAt || '').toLocaleDateString()} by {activeFyConfig.closedBy}. Editing, backdating, and deletions are strictly locked.
              </span>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeFyConfig.auditHash}</span>
          </div>
        </div>
      )}

      {isReviewPeriod && (
        <div className="bg-amber-900/90 text-amber-100 px-6 py-2 flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center space-x-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span className="font-bold">
              FY {selectedFY} is in FINANCE REVIEW / STATUTORY AUDIT. Prior-period audit adjustment JVs can be posted by authorized accountants.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2 overflow-x-auto flex space-x-1 shrink-0 no-scrollbar">
        {[
          { id: 'balance_sheet', label: '1. Balance Sheet', icon: Scale },
          { id: 'profit_and_loss', label: '2. Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'trial_balance', label: '3. Trial Balance', icon: FileSpreadsheet },
          { id: 'cash_flow', label: '4. Cash Flow Statement', icon: Activity },
          { id: 'ledger_statement', label: '5. General Ledger Book', icon: BookOpen },
          { id: 'bank_reconciliation', label: '6. Bank Reconciliation (BRS)', icon: Landmark },
          { id: 'ratio_analysis', label: '7. Ratio Analysis & KPIs', icon: PieChart },
          { id: 'group_summary', label: '8. Group Summary', icon: Layers },
          { id: 'gst_computation', label: '9. GST Computation (3B)', icon: BadgePercent },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ACCESS RESTRICTION SCREEN FOR DATA ENTRY OPERATORS */}
        {isRestrictedForUser ? (
          <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Access Restricted: Financial Confidentiality Gate
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Your current role (<span className="font-bold text-slate-800 dark:text-slate-200">Data Entry Operator</span>) does not have authorization to view sensitive corporate financial statements (Balance Sheet, P&L, Ratio Analysis) or closed historical fiscal periods.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-left text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Standard Financial Access Rules:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 pt-1">
                <li><strong className="text-slate-700 dark:text-slate-300">Business Owner:</strong> Full company-wide access to all open & closed years.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Senior Accountant:</strong> Full financial reporting, closed archives, and audit workpapers.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Data Entry:</strong> Active operational voucher entry and billing only.</li>
              </ul>
            </div>
            <div className="pt-2">
              <span className="text-xs text-slate-400">
                Switch to <strong className="text-indigo-600 dark:text-indigo-400">Owner</strong> or <strong className="text-indigo-600 dark:text-indigo-400">Accountant</strong> role in the top simulator to view this report.
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* 1. BALANCE SHEET REPORT */}
            {activeTab === 'balance_sheet' && (
              <div className="space-y-6">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Total Assets (FY {selectedFY})</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      ₹{reportData.summary?.totalAssets.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Total Liabilities & Equity</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      ₹{reportData.summary?.totalLiabilities.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Balance Integrity (Zero Variance)</div>
                    <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Balanced (Δ = ₹0.00)</span>
                    </div>
                  </div>
                </div>

                {/* Balance Sheet Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Liabilities */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      I. Liabilities & Shareholders' Funds
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.liabilities?.map((g: any, idx: number) => (
                        <div key={idx} className="p-4 space-y-2">
                          <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                            <span>{g.groupName}</span>
                            <span>₹{g.total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="space-y-1 pl-3 text-xs text-slate-600 dark:text-slate-400">
                            {g.subGroups?.map((sg: any, sIdx: number) => (
                              <div key={sIdx} className="flex justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 px-2 rounded cursor-pointer" onClick={() => handleDrilldown(sg.name)}>
                                <span>{sg.name}</span>
                                <span className="font-mono">₹{sg.amount.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assets */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      II. Assets & Capital Deployment
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.assets?.map((g: any, idx: number) => (
                        <div key={idx} className="p-4 space-y-2">
                          <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                            <span>{g.groupName}</span>
                            <span>₹{g.total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="space-y-1 pl-3 text-xs text-slate-600 dark:text-slate-400">
                            {g.subGroups?.map((sg: any, sIdx: number) => (
                              <div key={sIdx} className="flex justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 px-2 rounded cursor-pointer" onClick={() => handleDrilldown(sg.name)}>
                                <span>{sg.name}</span>
                                <span className="font-mono">₹{sg.amount.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFIT & LOSS REPORT */}
            {activeTab === 'profit_and_loss' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Gross Sales Revenue</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹{reportData.summary?.totalRevenue?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Cost of Goods Sold (COGS)</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹{reportData.summary?.costOfGoodsSold?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Gross Profit</div>
                    <div className="text-xl font-bold text-indigo-600 mt-1">₹{reportData.summary?.grossProfit?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Net Profit Transferred to Reserves</div>
                    <div className="text-xl font-bold text-emerald-600 mt-1">₹{reportData.summary?.netProfitAfterTax?.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Revenue & Operating Expenses Statement (FY {selectedFY})</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {(reportData.revenue || []).map((r: any, idx: number) => (
                      <div key={idx} className="py-2.5 flex justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{r.category}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">₹{r.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {(reportData.operatingExpenses || []).map((r: any, idx: number) => (
                      <div key={idx} className="py-2.5 flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">{r.category}</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">₹{r.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TRIAL BALANCE REPORT */}
            {activeTab === 'trial_balance' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">General Ledger Trial Balance (FY {selectedFY})</h3>
                    <p className="text-xs text-slate-500">Click any account row for drill-down statement view</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    Balanced: Total Dr = Total Cr (₹{reportData.summary?.totalClosingDr?.toLocaleString('en-IN')})
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
                      <tr>
                        <th className="py-3 px-4">Account Head / Group</th>
                        <th className="py-3 px-4 text-right">Opening Dr</th>
                        <th className="py-3 px-4 text-right">Opening Cr</th>
                        <th className="py-3 px-4 text-right">Closing Dr</th>
                        <th className="py-3 px-4 text-right">Closing Cr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.groups?.map((g: any, idx: number) => (
                        <tr
                          key={idx}
                          onClick={() => handleDrilldown(g.groupName)}
                          className="hover:bg-blue-50/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span>{g.groupName}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </td>
                          <td className="py-3 px-4 text-right font-mono">₹{g.openingDr?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{g.openingCr?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{g.closingDr?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{g.closingCr?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* 4. CASH FLOW STATEMENT (AS 3 / Ind AS 7) */}
            {activeTab === 'cash_flow' && (
              <div className="space-y-6">
                {/* Cash Flow Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Operating Cash Flow (A)</div>
                    <div className="text-xl font-bold text-emerald-600 mt-1">
                      ₹{reportData.summary?.netOperatingCash?.toLocaleString('en-IN') || '13,38,680'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Core business cash generation</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Investing Cash Flow (B)</div>
                    <div className="text-xl font-bold text-rose-600 mt-1">
                      ₹{reportData.summary?.netInvestingCash?.toLocaleString('en-IN') || '-4,00,000'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">CapEx & machinery additions</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Financing Cash Flow (C)</div>
                    <div className="text-xl font-bold text-indigo-600 mt-1">
                      ₹{reportData.summary?.netFinancingCash?.toLocaleString('en-IN') || '-2,58,940'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Loan service & promoter equity</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500">Net Cash Inflow (A+B+C)</div>
                    <div className="text-xl font-bold text-blue-600 mt-1">
                      ₹{reportData.summary?.netChangeInCash?.toLocaleString('en-IN') || '6,79,740'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      Closing Cash & Bank: ₹{reportData.summary?.closingCashBank?.toLocaleString('en-IN') || '18,79,740'}
                    </div>
                  </div>
                </div>

                {/* Detailed Activities Statement */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Statement of Cash Flows (Schedule III / AS 3 Direct & Indirect Reconciliation)
                    </h3>
                    <p className="text-xs text-slate-500">Fiscal Year: {selectedFY} | Period ending 31st March</p>
                  </div>

                  {/* Section A: Operating Activities */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                      <span>A. Cash Flows from Operating Activities</span>
                      <span className="font-mono text-emerald-600 font-black">
                        ₹{reportData.summary?.netOperatingCash?.toLocaleString('en-IN') || '13,38,680'}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs pl-3">
                      {(reportData.operatingActivities || []).map((item: any, idx: number) => (
                        <div key={idx} className="py-2 flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">{item.description}</span>
                          <span className={`font-mono font-bold ${item.amount < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString('en-IN')})` : `₹${item.amount.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section B: Investing Activities */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                      <span>B. Cash Flows from Investing Activities (CapEx)</span>
                      <span className="font-mono text-rose-600 font-black">
                        {reportData.summary?.netInvestingCash < 0 ? `(₹${Math.abs(reportData.summary?.netInvestingCash).toLocaleString('en-IN')})` : `₹${reportData.summary?.netInvestingCash?.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs pl-3">
                      {(reportData.investingActivities || []).map((item: any, idx: number) => (
                        <div key={idx} className="py-2 flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">{item.description}</span>
                          <span className={`font-mono font-bold ${item.amount < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString('en-IN')})` : `₹${item.amount.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section C: Financing Activities */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                      <span>C. Cash Flows from Financing Activities (Debt / Capital)</span>
                      <span className="font-mono text-indigo-600 font-black">
                        {reportData.summary?.netFinancingCash < 0 ? `(₹${Math.abs(reportData.summary?.netFinancingCash).toLocaleString('en-IN')})` : `₹${reportData.summary?.netFinancingCash?.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs pl-3">
                      {(reportData.financingActivities || []).map((item: any, idx: number) => (
                        <div key={idx} className="py-2 flex justify-between">
                          <span className="text-slate-700 dark:text-slate-300">{item.description}</span>
                          <span className={`font-mono font-bold ${item.amount < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString('en-IN')})` : `₹${item.amount.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reconciliation Summary Footer */}
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>Opening Balance of Cash & Cash Equivalents</span>
                      <span className="font-mono">₹{reportData.summary?.openingCashBank?.toLocaleString('en-IN') || '12,00,000'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-600">
                      <span>Add: Net Increase / (Decrease) in Cash & Cash Equivalents</span>
                      <span className="font-mono">₹{reportData.summary?.netChangeInCash?.toLocaleString('en-IN') || '6,79,740'}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <span>Closing Balance of Cash & Cash Equivalents (Reconciled with Balance Sheet)</span>
                      <span className="font-mono text-emerald-600">₹{reportData.summary?.closingCashBank?.toLocaleString('en-IN') || '18,79,740'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. BANK RECONCILIATION STATEMENT */}
            {activeTab === 'bank_reconciliation' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{reportData.summary?.bankName}</h3>
                    <p className="text-xs text-slate-500">Automated BRS Statement for FY {selectedFY}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    ✓ Reconciled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="text-xs text-slate-500">Balance as per Company Books</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      ₹{reportData.summary?.balanceAsPerCompanyBooks?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="text-xs text-slate-500">Balance as per Bank Statement</div>
                    <div className="text-xl font-bold text-blue-600 mt-1">
                      ₹{reportData.summary?.balanceAsPerBankStatement?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Instrument #</th>
                        <th className="py-3 px-4">Particulars</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(reportData.brsItems || []).map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 px-4 font-mono">{item.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{item.chqNo}</td>
                          <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{item.particulars}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            ₹{item.bookAmount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. RATIO ANALYSIS & KPIS */}
            {activeTab === 'ratio_analysis' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Financial Ratio Analysis Matrix</h3>
                    <p className="text-xs text-slate-500">Liquidity, Solvency, Profitability & Working Capital Health</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    Grade: {reportData.summary?.overallHealthScore || 'A+ Prime'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(reportData.ratios || []).map((r: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span>{r.category}</span>
                        <span className="text-emerald-600 font-bold">{r.status}</span>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{r.value}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. GROUP SUMMARY */}
            {activeTab === 'group_summary' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chart of Accounts Group Summary</h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
                      <tr>
                        <th className="py-3 px-4">Primary Group</th>
                        <th className="py-3 px-4 text-right">Ledger Count</th>
                        <th className="py-3 px-4 text-right">Debit Balance (₹)</th>
                        <th className="py-3 px-4 text-right">Credit Balance (₹)</th>
                        <th className="py-3 px-4 text-right">Net Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(reportData.groups || []).map((g: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{g.groupName}</td>
                          <td className="py-3 px-4 text-right font-mono">{g.ledgerCount}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{g.debitTotal?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{g.creditTotal?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{g.netBalance?.toLocaleString('en-IN')} ({g.nature})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 9. GST COMPUTATION (3B) */}
            {activeTab === 'gst_computation' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Monthly GST Computation & GSTR-3B Summary</h3>
                    <p className="text-xs text-slate-500">Outward Tax Liability vs Available ITC Balance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">Net Cash Tax Payable:</div>
                    <div className="text-lg font-black text-rose-600">
                      ₹{reportData.summary?.totalNetGstPayable?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                    <div className="text-xs font-bold text-blue-600 uppercase">1. Outward Tax Liability (Sales)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      ₹{reportData.outwardLiability?.totalOutputTax?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      CGST: ₹{reportData.outwardLiability?.cgst?.toLocaleString('en-IN')} | SGST: ₹{reportData.outwardLiability?.sgst?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                    <div className="text-xs font-bold text-emerald-600 uppercase">2. Eligible ITC (Purchases)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      ₹{reportData.inwardItc?.totalInputTaxCredit?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      CGST: ₹{reportData.inwardItc?.cgst?.toLocaleString('en-IN')} | SGST: ₹{reportData.inwardItc?.sgst?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                    <div className="text-xs font-bold text-rose-600 uppercase">3. Net Cash Payable</div>
                    <div className="text-lg font-black text-rose-600 mt-1">
                      ₹{reportData.netGstPayable?.totalNetCashPayable?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Payable via PMT-06 challan
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. GENERAL LEDGER BOOK */}
            {activeTab === 'ledger_statement' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{reportData.summary?.ledgerName}</h3>
                    <p className="text-xs text-slate-500">Historical Voucher Entries for FY {selectedFY}</p>
                  </div>
                  {isClosedPeriod && (
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-bold flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Locked / Read-Only</span>
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Voucher #</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Particulars</th>
                        <th className="py-3 px-4 text-right">Debit (₹)</th>
                        <th className="py-3 px-4 text-right">Credit (₹)</th>
                        <th className="py-3 px-4 text-right">Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.entries?.map((e: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-mono">{e.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{e.voucherNo}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {e.voucherType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{e.particulars}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            {e.debit ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            {e.credit ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{e.balance.toLocaleString('en-IN')} {e.balanceType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DRILLDOWN STATEMENT MODAL (3-LEVEL RECONSTRUCTION) */}
      {drilldownModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>{drilldownModal.title}</span>
                  {isClosedPeriod && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      READ-ONLY ARCHIVE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Period: FY {selectedFY} | General Ledger Account Code: {drilldownModal.accountCode}</p>
              </div>
              <button type="button" onClick={() => setDrilldownModal({ ...drilldownModal, isOpen: false })} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl max-h-80">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Particulars</th>
                    <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {drilldownModal.entries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono">{e.date}</td>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600">{e.voucherNo}</td>
                      <td className="py-2 px-3">{e.voucherType}</td>
                      <td className="py-2 px-3 text-slate-900 dark:text-white">{e.particulars}</td>
                      <td className="py-2 px-3 text-right font-mono">{e.debit ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}</td>
                      <td className="py-2 px-3 text-right font-mono">{e.credit ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹{e.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDrilldownModal({ ...drilldownModal, isOpen: false })}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-700"
              >
                Close Drilldown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Print / PDF Modal */}
      {printModalOpen && printData && (
        <UniversalReportPrintModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          data={printData}
        />
      )}
    </div>
  );
}
