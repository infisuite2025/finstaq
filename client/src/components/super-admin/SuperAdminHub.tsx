import React, { useState, useEffect } from 'react';
import {
  Globe,
  Building2,
  CreditCard,
  Sparkles,
  Plus,
  CheckCircle2,
  Search,
  ExternalLink,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Edit3,
  GitBranch,
  History,
  Eye,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  FileText,
  AlertTriangle,
  BadgeCheck,
  Sliders,
  Layers,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Download,
  Clock,
  UserCheck,
  HardDrive,
  Database,
  Server,
  Lock,
} from 'lucide-react';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

export interface HelpTopicVersion {
  version: string;
  title: string;
  summary: string;
  steps: string[];
  shortcuts?: string[];
  category: string;
  tabTarget: string;
  changeNotes?: string;
  author: string;
  timestamp: string;
}

export interface EnterpriseHelpTopic {
  id: string;
  currentLiveVersion: string;
  status: 'PUBLISHED' | 'DRAFT_PENDING_APPROVAL' | 'ARCHIVED';
  category:
    | 'Executive Intelligence'
    | 'Vouchers & Accounting'
    | 'Banking & Treasury'
    | 'Masters & Structure'
    | 'Procurement & Stores'
    | 'Sales & Revenue'
    | 'HR & Indian Payroll'
    | 'Financial Reports'
    | 'Year-End & Periods'
    | 'Compliance & Tax'
    | 'Approvals & Governance';
  tabTarget: string;
  keywords: string[];
  publishedContent: HelpTopicVersion;
  draftContent?: HelpTopicVersion;
  versionHistory: HelpTopicVersion[];
}

interface TenantAccount {
  id: string;
  name: string;
  subdomain: string;
  gstin: string;
  contactEmail: string;
  contactPhone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';
  subscriptionTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  monthlyAmount: number;
  currency: string;
  userCount: number;
  voucherCount: number;
  createdAt: string;
  suspendedReason?: string;
  storageAllocatedGB?: number;
  storageUsedGB?: number;
  maxFileSizeMB?: number;
  storageDriver?: 'local' | 's3' | 'azure';
}

interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  subdomain: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PAID' | 'DUE' | 'OVERDUE' | 'CANCELLED';
  billingPeriod: string;
  dueDate: string;
  paidAt?: string;
  paymentRef?: string;
}

interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  trialTenants: number;
  mrr: number;
  totalCollected: number;
  overdueAmount: number;
  totalUsers: number;
  totalVouchersProcessed: number;
}

const INITIAL_HELP_TOPICS: EnterpriseHelpTopic[] = [
  {
    "id": "topic-analytics",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Executive Intelligence",
    "tabTarget": "analytics",
    "keywords": [
      "analytics",
      "bi",
      "dashboard",
      "executive",
      "radar",
      "cash runway",
      "working capital",
      "dupont",
      "revenue",
      "ratios",
      "cash flow forecast"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Executive 360° Radar & BI Intelligence Command Center",
      "summary": "Monitor real-time cash runway, operating margins, DuPont ROE, working capital cycles, and predictive revenue trends.",
      "steps": [
        "Navigate to Executive Intelligence > Owner Analytics & BI in the left sidebar.",
        "Inspect the top KPI scorecards: Net Cash Runway (in days), Operating Margin %, Quick Ratio, and Net Working Capital.",
        "Toggle between Fiscal Years or quarterly views using the top period filter.",
        "Review the Cash Flow Forecast graph to identify anticipated liquidity peaks and troughs.",
        "Analyze the DuPont ROE Decomposition (Net Margin × Asset Turnover × Equity Multiplier).",
        "Check the Customer & Vendor Concentration metrics to mitigate single-party risk.",
        "Click \"Export Executive Brief\" to generate a board-ready PDF summary."
      ],
      "shortcuts": [
        "Ctrl+K (Search Analytics)",
        "Alt+E (Export Brief)"
      ],
      "category": "Executive Intelligence",
      "tabTarget": "analytics",
      "changeNotes": "Official baseline version 1.0 guide for Open Owner Analytics Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Executive 360° Radar & BI Intelligence Command Center",
        "summary": "Monitor real-time cash runway, operating margins, DuPont ROE, working capital cycles, and predictive revenue trends.",
        "steps": [
          "Navigate to Executive Intelligence > Owner Analytics & BI in the left sidebar.",
          "Inspect the top KPI scorecards: Net Cash Runway (in days), Operating Margin %, Quick Ratio, and Net Working Capital.",
          "Toggle between Fiscal Years or quarterly views using the top period filter.",
          "Review the Cash Flow Forecast graph to identify anticipated liquidity peaks and troughs.",
          "Analyze the DuPont ROE Decomposition (Net Margin × Asset Turnover × Equity Multiplier).",
          "Check the Customer & Vendor Concentration metrics to mitigate single-party risk.",
          "Click \"Export Executive Brief\" to generate a board-ready PDF summary."
        ],
        "shortcuts": [
          "Ctrl+K (Search Analytics)",
          "Alt+E (Export Brief)"
        ],
        "category": "Executive Intelligence",
        "tabTarget": "analytics",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-masters",
    "currentLiveVersion": "v1.0",
    "status": "DRAFT_PENDING_APPROVAL",
    "category": "Masters & Structure",
    "tabTarget": "masters",
    "keywords": [
      "masters",
      "chart of accounts",
      "ledger",
      "sundry debtors",
      "sundry creditors",
      "gstin",
      "pan",
      "uom",
      "hsn",
      "create ledger",
      "add customer",
      "add vendor"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Master Data Hub (28 Schedule III Groups, Ledgers & Items)",
      "summary": "Manage Chart of Accounts, statutory groups, customer/vendor master profiles with GSTIN validation, and inventory items.",
      "steps": [
        "Navigate to Financial Core > Master Data Hub in the left sidebar.",
        "Select the tab: \"Ledger Masters\", \"Cost Centers\", \"Godowns & Warehouses\", or \"Item Masters\".",
        "To create a new ledger, click \"+ New Ledger\" (or press Alt+C from any voucher screen).",
        "Enter Ledger Name (e.g. Acme Steels Pvt Ltd), select the Parent Group (e.g. Sundry Creditors / Sundry Debtors).",
        "Input GSTIN (e.g. 27AABCU9603R1ZM), State, PAN, Credit Limit (₹), and Credit Period (in days).",
        "Enable \"Maintain Balances Bill-by-Bill\" to support invoice-by-invoice settlement.",
        "Click \"Save Master\" to commit to the Chart of Accounts."
      ],
      "shortcuts": [
        "Alt+C (Quick Ledger Creation)",
        "Alt+M (Open Masters)"
      ],
      "category": "Masters & Structure",
      "tabTarget": "masters",
      "changeNotes": "Official baseline version 1.0 guide for Open Master Data Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "draftContent": {
      "version": "v1.1 (Draft)",
      "title": "Master Data Hub (28 Schedule III Groups, Ledgers & Items) [Updated with NPCI 2026 Standard]",
      "summary": "Manage Chart of Accounts, statutory groups, customer/vendor master profiles with GSTIN validation, and inventory items. Includes latest regulatory enhancement guidelines.",
      "steps": [
        "Navigate to Financial Core > Master Data Hub in the left sidebar.",
        "Select the tab: \"Ledger Masters\", \"Cost Centers\", \"Godowns & Warehouses\", or \"Item Masters\".",
        "To create a new ledger, click \"+ New Ledger\" (or press Alt+C from any voucher screen).",
        "Verify instant NPCI payload cryptographic checksum and settlement reference.",
        "Enter Ledger Name (e.g. Acme Steels Pvt Ltd), select the Parent Group (e.g. Sundry Creditors / Sundry Debtors).",
        "Input GSTIN (e.g. 27AABCU9603R1ZM), State, PAN, Credit Limit (₹), and Credit Period (in days).",
        "Enable \"Maintain Balances Bill-by-Bill\" to support invoice-by-invoice settlement.",
        "Click \"Save Master\" to commit to the Chart of Accounts."
      ],
      "shortcuts": [
        "Alt+C (Quick Ledger Creation)",
        "Alt+M (Open Masters)"
      ],
      "category": "Masters & Structure",
      "tabTarget": "masters",
      "changeNotes": "Enhanced with real-time settlement checksum audit validation",
      "author": "Vikram Singhania (CFO)",
      "timestamp": "2026-09-14T12:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Master Data Hub (28 Schedule III Groups, Ledgers & Items)",
        "summary": "Manage Chart of Accounts, statutory groups, customer/vendor master profiles with GSTIN validation, and inventory items.",
        "steps": [
          "Navigate to Financial Core > Master Data Hub in the left sidebar.",
          "Select the tab: \"Ledger Masters\", \"Cost Centers\", \"Godowns & Warehouses\", or \"Item Masters\".",
          "To create a new ledger, click \"+ New Ledger\" (or press Alt+C from any voucher screen).",
          "Enter Ledger Name (e.g. Acme Steels Pvt Ltd), select the Parent Group (e.g. Sundry Creditors / Sundry Debtors).",
          "Input GSTIN (e.g. 27AABCU9603R1ZM), State, PAN, Credit Limit (₹), and Credit Period (in days).",
          "Enable \"Maintain Balances Bill-by-Bill\" to support invoice-by-invoice settlement.",
          "Click \"Save Master\" to commit to the Chart of Accounts."
        ],
        "shortcuts": [
          "Alt+C (Quick Ledger Creation)",
          "Alt+M (Open Masters)"
        ],
        "category": "Masters & Structure",
        "tabTarget": "masters",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-voucher-matrix",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Vouchers & Accounting",
    "tabTarget": "voucher",
    "keywords": [
      "voucher",
      "matrix",
      "f4",
      "f5",
      "f6",
      "f7",
      "f8",
      "f9",
      "journal",
      "payment",
      "receipt",
      "sales",
      "purchase",
      "contra",
      "tally",
      "single entry",
      "bill-wise",
      "agst ref"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Voucher Matrix (Single/Double Entry, Bill-Wise & Bank Allocation)",
      "summary": "Post Single-Entry and Double-Entry vouchers (F4 Contra, F5 Payment, F6 Receipt, F7 Journal, F8 Sales, F9 Purchase) with bill allocations.",
      "steps": [
        "Navigate to Financial Core > Voucher Matrix in the left sidebar.",
        "Select Voucher Type using function keys: F4 (Contra), F5 (Payment), F6 (Receipt), F7 (Journal), F8 (Sales), or F9 (Purchase).",
        "Toggle Entry Mode: Press Ctrl+H to switch between Single-Entry (Account header) and Double-Entry (Dr/Cr table).",
        "In Single-Entry mode: Pick Cash/Bank account, then add party rows, amounts, and click \"Bill-wise\" to settle specific invoices (Agst Ref, Advance, New Ref).",
        "In Double-Entry mode: Allocate Dr and Cr legs, ensuring Total Debit = Total Credit (Δ = ₹0.00).",
        "Click \"Bank/BRS\" to input instrument numbers (Cheque leaf #, UTR, e-Transfer ref, Bank Date).",
        "Input mandatory transaction Narration for MCA compliance.",
        "Press Ctrl+A or click \"Accept Voucher\" to post to General Ledger."
      ],
      "shortcuts": [
        "F4 (Contra)",
        "F5 (Payment)",
        "F6 (Receipt)",
        "F7 (Journal)",
        "F8 (Sales)",
        "F9 (Purchase)",
        "Ctrl+H (Toggle Mode)",
        "Ctrl+A (Accept Voucher)",
        "Alt+C (Quick Ledger)"
      ],
      "category": "Vouchers & Accounting",
      "tabTarget": "voucher",
      "changeNotes": "Official baseline version 1.0 guide for Open Voucher Matrix",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Voucher Matrix (Single/Double Entry, Bill-Wise & Bank Allocation)",
        "summary": "Post Single-Entry and Double-Entry vouchers (F4 Contra, F5 Payment, F6 Receipt, F7 Journal, F8 Sales, F9 Purchase) with bill allocations.",
        "steps": [
          "Navigate to Financial Core > Voucher Matrix in the left sidebar.",
          "Select Voucher Type using function keys: F4 (Contra), F5 (Payment), F6 (Receipt), F7 (Journal), F8 (Sales), or F9 (Purchase).",
          "Toggle Entry Mode: Press Ctrl+H to switch between Single-Entry (Account header) and Double-Entry (Dr/Cr table).",
          "In Single-Entry mode: Pick Cash/Bank account, then add party rows, amounts, and click \"Bill-wise\" to settle specific invoices (Agst Ref, Advance, New Ref).",
          "In Double-Entry mode: Allocate Dr and Cr legs, ensuring Total Debit = Total Credit (Δ = ₹0.00).",
          "Click \"Bank/BRS\" to input instrument numbers (Cheque leaf #, UTR, e-Transfer ref, Bank Date).",
          "Input mandatory transaction Narration for MCA compliance.",
          "Press Ctrl+A or click \"Accept Voucher\" to post to General Ledger."
        ],
        "shortcuts": [
          "F4 (Contra)",
          "F5 (Payment)",
          "F6 (Receipt)",
          "F7 (Journal)",
          "F8 (Sales)",
          "F9 (Purchase)",
          "Ctrl+H (Toggle Mode)",
          "Ctrl+A (Accept Voucher)",
          "Alt+C (Quick Ledger)"
        ],
        "category": "Vouchers & Accounting",
        "tabTarget": "voucher",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-upi-collections",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Banking & Treasury",
    "tabTarget": "upi",
    "keywords": [
      "upi",
      "qr code",
      "npci",
      "vpa",
      "gpay",
      "phonepe",
      "bhim",
      "instant collection",
      "reconciliation",
      "payment link"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "NPCI Dynamic UPI Payments & Instant Reconciliations",
      "summary": "Generate NPCI dynamic QR codes with embedded invoice reference and reconcile incoming customer UPI settlements instantly.",
      "steps": [
        "Navigate to Financial Core > UPI Payments & Collections in the sidebar.",
        "Select the pending customer invoice from the Open Receivables list.",
        "Click \"Generate Dynamic QR\" — the system encodes VPA, Exact Payable Amount, and Invoice Reference into the NPCI payload.",
        "Display or send the QR code via WhatsApp/Email to the customer.",
        "When customer scans and pays via BHIM/GPay/PhonePe, webhook notification confirms the settlement.",
        "Click \"Instant Reconcile\" to auto-post the F6 Receipt voucher with UPI UTR reference."
      ],
      "shortcuts": [
        "Alt+Q (Generate QR)",
        "Ctrl+R (Reconcile UPI)"
      ],
      "category": "Banking & Treasury",
      "tabTarget": "upi",
      "changeNotes": "Official baseline version 1.0 guide for Open UPI Payments Center",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "NPCI Dynamic UPI Payments & Instant Reconciliations",
        "summary": "Generate NPCI dynamic QR codes with embedded invoice reference and reconcile incoming customer UPI settlements instantly.",
        "steps": [
          "Navigate to Financial Core > UPI Payments & Collections in the sidebar.",
          "Select the pending customer invoice from the Open Receivables list.",
          "Click \"Generate Dynamic QR\" — the system encodes VPA, Exact Payable Amount, and Invoice Reference into the NPCI payload.",
          "Display or send the QR code via WhatsApp/Email to the customer.",
          "When customer scans and pays via BHIM/GPay/PhonePe, webhook notification confirms the settlement.",
          "Click \"Instant Reconcile\" to auto-post the F6 Receipt voucher with UPI UTR reference."
        ],
        "shortcuts": [
          "Alt+Q (Generate QR)",
          "Ctrl+R (Reconcile UPI)"
        ],
        "category": "Banking & Treasury",
        "tabTarget": "upi",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-pdc-registry",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Banking & Treasury",
    "tabTarget": "pdc",
    "keywords": [
      "pdc",
      "post dated cheque",
      "cheque maturity",
      "memoranda",
      "regularization",
      "clearing date",
      "cheque tracking"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Post-Dated Cheques (PDC) & Maturity Management",
      "summary": "Track incoming and outgoing post-dated cheques, monitor maturity alarms, and regularize to live ledgers upon bank deposit.",
      "steps": [
        "Navigate to Financial Core > PDC & Memoranda Registry.",
        "To record an incoming PDC, click \"+ Register Received PDC\" and select Customer, Cheque No, Bank, and Maturity Date.",
        "The PDC is logged in the Memoranda registry without affecting live GL balances prematurely.",
        "Review the \"Upcoming Maturities (< 7 Days)\" dashboard alert banner.",
        "When the cheque is deposited and cleared in your bank account, click \"Regularize to GL\".",
        "The system automatically converts the memorandum into a posted F6 Receipt voucher."
      ],
      "shortcuts": [
        "Alt+P (Register PDC)",
        "Ctrl+Enter (Regularize PDC)"
      ],
      "category": "Banking & Treasury",
      "tabTarget": "pdc",
      "changeNotes": "Official baseline version 1.0 guide for Open PDC Registry",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Post-Dated Cheques (PDC) & Maturity Management",
        "summary": "Track incoming and outgoing post-dated cheques, monitor maturity alarms, and regularize to live ledgers upon bank deposit.",
        "steps": [
          "Navigate to Financial Core > PDC & Memoranda Registry.",
          "To record an incoming PDC, click \"+ Register Received PDC\" and select Customer, Cheque No, Bank, and Maturity Date.",
          "The PDC is logged in the Memoranda registry without affecting live GL balances prematurely.",
          "Review the \"Upcoming Maturities (< 7 Days)\" dashboard alert banner.",
          "When the cheque is deposited and cleared in your bank account, click \"Regularize to GL\".",
          "The system automatically converts the memorandum into a posted F6 Receipt voucher."
        ],
        "shortcuts": [
          "Alt+P (Register PDC)",
          "Ctrl+Enter (Regularize PDC)"
        ],
        "category": "Banking & Treasury",
        "tabTarget": "pdc",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-interest-calculation",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Banking & Treasury",
    "tabTarget": "interest",
    "keywords": [
      "interest",
      "msme interest",
      "18%",
      "overdue interest",
      "interest debit note",
      "samadhaan",
      "penal interest",
      "interest calculation"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Interest Calculation Engine (MSME 18% p.a. Overdue Billing)",
      "summary": "Calculate overdue interest on delayed customer receivables, configure interest slabs, and auto-generate Interest Debit Notes.",
      "steps": [
        "Navigate to Financial Core > Interest Calculation Engine.",
        "Select calculation parameters: Simple vs Compound Interest, Annual Rate (e.g. 18.00% p.a. or MSME 3x RBI Repo).",
        "Select Customer Ledger or run batch calculation across all Sundry Debtors.",
        "Specify calculation cut-off date (e.g., today).",
        "Review the invoice-by-invoice breakdown: Due Date, Days Overdue, Principal (₹), and Accrued Interest (₹).",
        "Click \"Generate Interest Debit Note\" to post an official tax-adjusted debit note to the customer ledger."
      ],
      "shortcuts": [
        "Alt+I (Calculate Interest)",
        "Ctrl+G (Generate Note)"
      ],
      "category": "Banking & Treasury",
      "tabTarget": "interest",
      "changeNotes": "Official baseline version 1.0 guide for Open Interest Engine",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Interest Calculation Engine (MSME 18% p.a. Overdue Billing)",
        "summary": "Calculate overdue interest on delayed customer receivables, configure interest slabs, and auto-generate Interest Debit Notes.",
        "steps": [
          "Navigate to Financial Core > Interest Calculation Engine.",
          "Select calculation parameters: Simple vs Compound Interest, Annual Rate (e.g. 18.00% p.a. or MSME 3x RBI Repo).",
          "Select Customer Ledger or run batch calculation across all Sundry Debtors.",
          "Specify calculation cut-off date (e.g., today).",
          "Review the invoice-by-invoice breakdown: Due Date, Days Overdue, Principal (₹), and Accrued Interest (₹).",
          "Click \"Generate Interest Debit Note\" to post an official tax-adjusted debit note to the customer ledger."
        ],
        "shortcuts": [
          "Alt+I (Calculate Interest)",
          "Ctrl+G (Generate Note)"
        ],
        "category": "Banking & Treasury",
        "tabTarget": "interest",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-banking-brs",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Banking & Treasury",
    "tabTarget": "banking",
    "keywords": [
      "brs",
      "bank reconciliation",
      "bank statement",
      "unreconciled",
      "auto match",
      "cleared date",
      "utr match",
      "bank balance"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Bank Reconciliation (BRS) & Statement Auto-Matching",
      "summary": "Upload bank statements (CSV/OFX), auto-match entries against ERP cash book, and compute statutory BRS balances.",
      "steps": [
        "Navigate to Financial Core > Bank Reconciliation (BRS).",
        "Select the corporate Bank Ledger (e.g., HDFC Current A/c).",
        "Click \"Upload Bank Statement\" and choose your bank CSV/Excel/OFX statement file.",
        "Click \"Run 4-Parameter Auto-Match\" (matches Date window, Exact Amount, Cheque/UTR, and Party).",
        "Review the Auto-Matched transactions and confirm matching with 1 click.",
        "For unmatched bank lines, click \"Create Quick Voucher\" or adjust clearing date.",
        "Inspect the BRS Statement: Balance as per ERP Company Books + Unpresented Cheques - Uncredited Cheques = Balance as per Bank Statement (Δ = ₹0.00)."
      ],
      "shortcuts": [
        "Ctrl+U (Upload Statement)",
        "Alt+M (Run Auto-Match)"
      ],
      "category": "Banking & Treasury",
      "tabTarget": "banking",
      "changeNotes": "Official baseline version 1.0 guide for Open BRS Workspace",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Bank Reconciliation (BRS) & Statement Auto-Matching",
        "summary": "Upload bank statements (CSV/OFX), auto-match entries against ERP cash book, and compute statutory BRS balances.",
        "steps": [
          "Navigate to Financial Core > Bank Reconciliation (BRS).",
          "Select the corporate Bank Ledger (e.g., HDFC Current A/c).",
          "Click \"Upload Bank Statement\" and choose your bank CSV/Excel/OFX statement file.",
          "Click \"Run 4-Parameter Auto-Match\" (matches Date window, Exact Amount, Cheque/UTR, and Party).",
          "Review the Auto-Matched transactions and confirm matching with 1 click.",
          "For unmatched bank lines, click \"Create Quick Voucher\" or adjust clearing date.",
          "Inspect the BRS Statement: Balance as per ERP Company Books + Unpresented Cheques - Uncredited Cheques = Balance as per Bank Statement (Δ = ₹0.00)."
        ],
        "shortcuts": [
          "Ctrl+U (Upload Statement)",
          "Alt+M (Run Auto-Match)"
        ],
        "category": "Banking & Treasury",
        "tabTarget": "banking",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-cheque-management",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Banking & Treasury",
    "tabTarget": "cheques",
    "keywords": [
      "cheque",
      "cheque book",
      "cts 2010",
      "print cheque",
      "leaf register",
      "void cheque",
      "stop payment",
      "print calibration"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Cheque Book Management & Millimeter Print Calibration",
      "summary": "Register cheque books, issue and void leaves, and calibrate laser/deskjet cheque leaf printing with sub-millimeter precision.",
      "steps": [
        "Navigate to Financial Core > Cheque & Print Hub.",
        "To add a new bank cheque book, click \"+ Register Cheque Book\", specify Bank A/c, Prefix, Start Leaf #, and Total Leaves (e.g., 50 or 100).",
        "View the Leaf Status Register: Available, Issued, Cleared, Void / Cancelled, or Stale.",
        "To print a cheque leaf, select the issued payment voucher and click \"Calibrate & Print\".",
        "Adjust millimeter offsets: Payee Name X/Y, Date DD-MM-YYYY boxes, Amount in Words, and Amount in Figures.",
        "Preview the CTS-2010 overlay and send to laser/deskjet printer."
      ],
      "shortcuts": [
        "Alt+C (Cheque Register)",
        "Ctrl+P (Print Cheque)"
      ],
      "category": "Banking & Treasury",
      "tabTarget": "cheques",
      "changeNotes": "Official baseline version 1.0 guide for Open Cheque Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Cheque Book Management & Millimeter Print Calibration",
        "summary": "Register cheque books, issue and void leaves, and calibrate laser/deskjet cheque leaf printing with sub-millimeter precision.",
        "steps": [
          "Navigate to Financial Core > Cheque & Print Hub.",
          "To add a new bank cheque book, click \"+ Register Cheque Book\", specify Bank A/c, Prefix, Start Leaf #, and Total Leaves (e.g., 50 or 100).",
          "View the Leaf Status Register: Available, Issued, Cleared, Void / Cancelled, or Stale.",
          "To print a cheque leaf, select the issued payment voucher and click \"Calibrate & Print\".",
          "Adjust millimeter offsets: Payee Name X/Y, Date DD-MM-YYYY boxes, Amount in Words, and Amount in Figures.",
          "Preview the CTS-2010 overlay and send to laser/deskjet printer."
        ],
        "shortcuts": [
          "Alt+C (Cheque Register)",
          "Ctrl+P (Print Cheque)"
        ],
        "category": "Banking & Treasury",
        "tabTarget": "cheques",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-cost-centers",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Masters & Structure",
    "tabTarget": "cost-centers",
    "keywords": [
      "cost center",
      "cost category",
      "department pnl",
      "profitability",
      "project margin",
      "allocation",
      "segment",
      "department"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Cost Centers & Multi-Dimensional Profitability P&L Matrix",
      "summary": "Set up Cost Categories, allocate multi-department expenses, and analyze segment P&L, project margins, and cost variance.",
      "steps": [
        "Navigate to Financial Core > Cost Centers & P&L.",
        "Click \"+ New Cost Category\" (e.g. \"Departments\", \"Projects\", \"Branches\", \"Sales Regions\").",
        "Add Cost Centers under categories (e.g. Pune Project, Bangalore R&D, Marketing Mumbai).",
        "When entering any Expense or Revenue voucher in Voucher Matrix, enable Cost Allocation and tag percentages or amounts.",
        "View the \"Multi-Dimensional Profitability Matrix\" tab to inspect segment-wise Revenue, Direct Costs, Overhead, and Segment EBIT."
      ],
      "shortcuts": [
        "Alt+K (Cost Allocation)",
        "Ctrl+Shift+P (P&L Matrix)"
      ],
      "category": "Masters & Structure",
      "tabTarget": "cost-centers",
      "changeNotes": "Official baseline version 1.0 guide for Open Cost Centers Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Cost Centers & Multi-Dimensional Profitability P&L Matrix",
        "summary": "Set up Cost Categories, allocate multi-department expenses, and analyze segment P&L, project margins, and cost variance.",
        "steps": [
          "Navigate to Financial Core > Cost Centers & P&L.",
          "Click \"+ New Cost Category\" (e.g. \"Departments\", \"Projects\", \"Branches\", \"Sales Regions\").",
          "Add Cost Centers under categories (e.g. Pune Project, Bangalore R&D, Marketing Mumbai).",
          "When entering any Expense or Revenue voucher in Voucher Matrix, enable Cost Allocation and tag percentages or amounts.",
          "View the \"Multi-Dimensional Profitability Matrix\" tab to inspect segment-wise Revenue, Direct Costs, Overhead, and Segment EBIT."
        ],
        "shortcuts": [
          "Alt+K (Cost Allocation)",
          "Ctrl+Shift+P (P&L Matrix)"
        ],
        "category": "Masters & Structure",
        "tabTarget": "cost-centers",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-forex-multicurrency",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Banking & Treasury",
    "tabTarget": "forex",
    "keywords": [
      "forex",
      "multi currency",
      "exchange rate",
      "as 11",
      "forex gain loss",
      "usd",
      "eur",
      "gbp",
      "unrealized",
      "foreign currency"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Multi-Currency & Forex Hub (AS 11 Gain/Loss)",
      "summary": "Post multi-currency sales/purchases, maintain daily exchange rates, and calculate AS 11 realized/unrealized forex fluctuations.",
      "steps": [
        "Navigate to Financial Core > Multi-Currency & Forex.",
        "Configure Currencies (USD $, EUR €, GBP £, AED د.إ) and input Current Exchange Rates (₹/USD).",
        "Post Foreign Currency Invoices in Voucher Matrix (amount in foreign currency, automatically converted to INR base).",
        "When customer pays at a different settlement exchange rate, the engine calculates Realized Forex Gain/Loss.",
        "At month-end / year-end, run the \"AS 11 Periodical Revaluation\" to compute Unrealized Forex Gain/Loss on open balances."
      ],
      "shortcuts": [
        "Alt+F (Forex Rates)",
        "Ctrl+G (Post Forex Gain/Loss)"
      ],
      "category": "Banking & Treasury",
      "tabTarget": "forex",
      "changeNotes": "Official baseline version 1.0 guide for Open Forex Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Multi-Currency & Forex Hub (AS 11 Gain/Loss)",
        "summary": "Post multi-currency sales/purchases, maintain daily exchange rates, and calculate AS 11 realized/unrealized forex fluctuations.",
        "steps": [
          "Navigate to Financial Core > Multi-Currency & Forex.",
          "Configure Currencies (USD $, EUR €, GBP £, AED د.إ) and input Current Exchange Rates (₹/USD).",
          "Post Foreign Currency Invoices in Voucher Matrix (amount in foreign currency, automatically converted to INR base).",
          "When customer pays at a different settlement exchange rate, the engine calculates Realized Forex Gain/Loss.",
          "At month-end / year-end, run the \"AS 11 Periodical Revaluation\" to compute Unrealized Forex Gain/Loss on open balances."
        ],
        "shortcuts": [
          "Alt+F (Forex Rates)",
          "Ctrl+G (Post Forex Gain/Loss)"
        ],
        "category": "Banking & Treasury",
        "tabTarget": "forex",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-compliance-tax",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Compliance & Tax",
    "tabTarget": "compliance",
    "keywords": [
      "gst",
      "gstr1",
      "gstr3b",
      "e-invoice",
      "irn",
      "e-way bill",
      "tds",
      "tcs",
      "26q",
      "27eq",
      "194c",
      "194j",
      "206c",
      "tax filing"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Statutory & Tax Hub (GST, E-Invoice, E-Way Bill & TDS/TCS)",
      "summary": "Prepare GSTR-1, GSTR-3B B2B/B2C JSON, generate NIC E-Way Bills & E-Invoices with IRN, and compute TDS Form 26Q / TCS 27EQ.",
      "steps": [
        "Navigate to Financial Core > Statutory & Tax Hub.",
        "GST Filing: Click \"GSTR-1\" or \"GSTR-3B\", review Table 4 (B2B Invoices), Table 5 (B2C), Table 6 (Exports), and Table 7.",
        "Click \"Export GST JSON\" to download GST portal upload file.",
        "E-Invoice & E-Way Bill: Select dispatched tax invoices and click \"Generate NIC E-Way Bill / E-Invoice IRN\".",
        "TDS/TCS: Review Form 26Q quarterly deductions under Section 194C (Contractors), 194J (Professionals), 194I (Rent), and Section 206C(1H) TCS.",
        "Click \"Export NSDL TDS Text File\" for TIN-FC upload."
      ],
      "shortcuts": [
        "Alt+G (GST Workspace)",
        "Ctrl+T (TDS Register)"
      ],
      "category": "Compliance & Tax",
      "tabTarget": "compliance",
      "changeNotes": "Official baseline version 1.0 guide for Open Statutory & Tax Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Statutory & Tax Hub (GST, E-Invoice, E-Way Bill & TDS/TCS)",
        "summary": "Prepare GSTR-1, GSTR-3B B2B/B2C JSON, generate NIC E-Way Bills & E-Invoices with IRN, and compute TDS Form 26Q / TCS 27EQ.",
        "steps": [
          "Navigate to Financial Core > Statutory & Tax Hub.",
          "GST Filing: Click \"GSTR-1\" or \"GSTR-3B\", review Table 4 (B2B Invoices), Table 5 (B2C), Table 6 (Exports), and Table 7.",
          "Click \"Export GST JSON\" to download GST portal upload file.",
          "E-Invoice & E-Way Bill: Select dispatched tax invoices and click \"Generate NIC E-Way Bill / E-Invoice IRN\".",
          "TDS/TCS: Review Form 26Q quarterly deductions under Section 194C (Contractors), 194J (Professionals), 194I (Rent), and Section 206C(1H) TCS.",
          "Click \"Export NSDL TDS Text File\" for TIN-FC upload."
        ],
        "shortcuts": [
          "Alt+G (GST Workspace)",
          "Ctrl+T (TDS Register)"
        ],
        "category": "Compliance & Tax",
        "tabTarget": "compliance",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-debit-credit-notes",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Vouchers & Accounting",
    "tabTarget": "notes",
    "keywords": [
      "credit note",
      "debit note",
      "sec 34",
      "sales return",
      "purchase return",
      "price adjustment",
      "gst note",
      "dr note",
      "cr note"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Debit & Credit Notes (GST Section 34 Compliance)",
      "summary": "Issue GST Section 34 compliant Credit Notes (Sales returns, price reductions) and Debit Notes (Purchase returns, rate variance).",
      "steps": [
        "Navigate to Financial Core > Debit & Credit Notes.",
        "Click \"+ New Note\" and choose \"Credit Note\" (for customer) or \"Debit Note\" (for vendor).",
        "Select the Original Tax Invoice Number from the search picker to link the note.",
        "Select Reason Code per GST rules: 01-Sales Return, 02-Post Sale Discount, 03-Deficiency in Services, 04-Correction in Invoice.",
        "Enter Item quantities or differential value and verify tax adjustment legs.",
        "Press Ctrl+A to save and update both inventory lots and General Ledger."
      ],
      "shortcuts": [
        "Alt+D (Debit Note)",
        "Alt+R (Credit Note)",
        "Ctrl+A (Save Note)"
      ],
      "category": "Vouchers & Accounting",
      "tabTarget": "notes",
      "changeNotes": "Official baseline version 1.0 guide for Open Debit & Credit Notes Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Debit & Credit Notes (GST Section 34 Compliance)",
        "summary": "Issue GST Section 34 compliant Credit Notes (Sales returns, price reductions) and Debit Notes (Purchase returns, rate variance).",
        "steps": [
          "Navigate to Financial Core > Debit & Credit Notes.",
          "Click \"+ New Note\" and choose \"Credit Note\" (for customer) or \"Debit Note\" (for vendor).",
          "Select the Original Tax Invoice Number from the search picker to link the note.",
          "Select Reason Code per GST rules: 01-Sales Return, 02-Post Sale Discount, 03-Deficiency in Services, 04-Correction in Invoice.",
          "Enter Item quantities or differential value and verify tax adjustment legs.",
          "Press Ctrl+A to save and update both inventory lots and General Ledger."
        ],
        "shortcuts": [
          "Alt+D (Debit Note)",
          "Alt+R (Credit Note)",
          "Ctrl+A (Save Note)"
        ],
        "category": "Vouchers & Accounting",
        "tabTarget": "notes",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-financial-reports",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Financial Reports",
    "tabTarget": "financial-reports",
    "keywords": [
      "balance sheet",
      "pnl",
      "profit and loss",
      "trial balance",
      "cash flow",
      "as 3",
      "schedule iii",
      "drilldown",
      "ratios",
      "financial statement"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Financial Reports (Schedule III Balance Sheet, P&L & AS 3 Cash Flow)",
      "summary": "Generate statutory Balance Sheet (Schedule III), Profit & Loss, 3-level drilldown Trial Balance, AS 3 Cash Flow, and Ratio Analysis.",
      "steps": [
        "Navigate to Financial Core > Financial Reports in the sidebar.",
        "Select report tab: \"1. Balance Sheet\", \"2. Profit & Loss\", \"3. Trial Balance\", \"4. AS 3 Cash Flow\", or \"5. Ratio Analysis\".",
        "Select the active or historical Fiscal Year and reporting date range.",
        "In Trial Balance: Check the Δ = ₹0.00 double-entry balance guarantee.",
        "Drilldown: Click on ANY group or ledger line to instantly open the 3-Level Ledger Statement modal with voucher line items.",
        "Click \"Print / PDF\" or \"Export Excel\" for CA certification and board presentation."
      ],
      "shortcuts": [
        "Alt+B (Balance Sheet)",
        "Alt+P (P&L)",
        "Alt+T (Trial Balance)"
      ],
      "category": "Financial Reports",
      "tabTarget": "financial-reports",
      "changeNotes": "Official baseline version 1.0 guide for Open Financial Reports",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Financial Reports (Schedule III Balance Sheet, P&L & AS 3 Cash Flow)",
        "summary": "Generate statutory Balance Sheet (Schedule III), Profit & Loss, 3-level drilldown Trial Balance, AS 3 Cash Flow, and Ratio Analysis.",
        "steps": [
          "Navigate to Financial Core > Financial Reports in the sidebar.",
          "Select report tab: \"1. Balance Sheet\", \"2. Profit & Loss\", \"3. Trial Balance\", \"4. AS 3 Cash Flow\", or \"5. Ratio Analysis\".",
          "Select the active or historical Fiscal Year and reporting date range.",
          "In Trial Balance: Check the Δ = ₹0.00 double-entry balance guarantee.",
          "Drilldown: Click on ANY group or ledger line to instantly open the 3-Level Ledger Statement modal with voucher line items.",
          "Click \"Print / PDF\" or \"Export Excel\" for CA certification and board presentation."
        ],
        "shortcuts": [
          "Alt+B (Balance Sheet)",
          "Alt+P (P&L)",
          "Alt+T (Trial Balance)"
        ],
        "category": "Financial Reports",
        "tabTarget": "financial-reports",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-year-end-closing",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Year-End & Periods",
    "tabTarget": "financial-periods",
    "keywords": [
      "year end",
      "closing wizard",
      "pnl reset",
      "retained earnings",
      "carry forward",
      "auditor sync",
      "opening balance",
      "fiscal year"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Financial Periods, 6-Step Year-End Wizard & Auditor Sync",
      "summary": "Execute SME Guided Year-End Close, P&L zero-reset, carry-forward Balance Sheet with zero difference, and sync ongoing auditor JVs.",
      "steps": [
        "Navigate to Financial Core > Financial Periods & Year-End.",
        "Click \"SME Guided Year-End Wizard (6 Steps)\".",
        "Step 1: Select source FY (e.g. FY 2025-26) and target FY (e.g. FY 2026-27).",
        "Step 2: Run the 18-Category Pre-Close Health Audit (checks Trial Balance, unbilled GRNs, unposted drafts).",
        "Step 3: Verify the Zero-Difference Balance Sheet Roll (Closing Assets = Opening Assets, Δ = ₹0.00).",
        "Step 4: Carry forward open invoice receivables, vendor payables, multi-godown stock lots, and asset Gross Block.",
        "Step 5: Business Owner confirms authorization; engine generates Closing JV and resets nominal P&L ledgers to ₹0.00.",
        "If auditors later provide year-end adjustment JVs, use the \"Audit Adjustments & Live Opening Sync\" tab to synchronize opening balances with 1 click."
      ],
      "shortcuts": [
        "Alt+Y (Year End Wizard)",
        "Ctrl+S (Sync Opening Balances)"
      ],
      "category": "Year-End & Periods",
      "tabTarget": "financial-periods",
      "changeNotes": "Official baseline version 1.0 guide for Open Year-End Closing Center",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Financial Periods, 6-Step Year-End Wizard & Auditor Sync",
        "summary": "Execute SME Guided Year-End Close, P&L zero-reset, carry-forward Balance Sheet with zero difference, and sync ongoing auditor JVs.",
        "steps": [
          "Navigate to Financial Core > Financial Periods & Year-End.",
          "Click \"SME Guided Year-End Wizard (6 Steps)\".",
          "Step 1: Select source FY (e.g. FY 2025-26) and target FY (e.g. FY 2026-27).",
          "Step 2: Run the 18-Category Pre-Close Health Audit (checks Trial Balance, unbilled GRNs, unposted drafts).",
          "Step 3: Verify the Zero-Difference Balance Sheet Roll (Closing Assets = Opening Assets, Δ = ₹0.00).",
          "Step 4: Carry forward open invoice receivables, vendor payables, multi-godown stock lots, and asset Gross Block.",
          "Step 5: Business Owner confirms authorization; engine generates Closing JV and resets nominal P&L ledgers to ₹0.00.",
          "If auditors later provide year-end adjustment JVs, use the \"Audit Adjustments & Live Opening Sync\" tab to synchronize opening balances with 1 click."
        ],
        "shortcuts": [
          "Alt+Y (Year End Wizard)",
          "Ctrl+S (Sync Opening Balances)"
        ],
        "category": "Year-End & Periods",
        "tabTarget": "financial-periods",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-procurement-operations",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Procurement & Stores",
    "tabTarget": "procurement",
    "keywords": [
      "procurement",
      "purchase order",
      "po",
      "grn",
      "goods receipt",
      "3 way match",
      "vendor bill",
      "purchase return",
      "purchase bill"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Procurement Operations & 3-Way Matching (PO vs GRN vs Bill)",
      "summary": "Create Purchase Orders (PO), record Goods Receipt Notes (GRN), perform 3-Way Matching with supplier bills, and manage purchase returns.",
      "steps": [
        "Navigate to Procurement & Stores > Purchase Operations.",
        "Click \"+ New Purchase Order (PO)\", select Vendor, Godown/Warehouse, Item list, Quantities, and Negotiated Rates.",
        "When items arrive at the godown, click \"Create GRN\" against the PO. (Rule: GRN quantity cannot exceed PO quantity).",
        "When the vendor invoice is received, create the Purchase Bill linked to the GRN.",
        "The 3-Way Match engine validates: PO Rate == Invoice Rate, GRN Qty == Invoice Qty.",
        "If defective goods are received, generate a Purchase Return Debit Note against the GRN."
      ],
      "shortcuts": [
        "Alt+O (New PO)",
        "Alt+G (New GRN)",
        "Ctrl+A (Save Bill)"
      ],
      "category": "Procurement & Stores",
      "tabTarget": "procurement",
      "changeNotes": "Official baseline version 1.0 guide for Open Purchase Operations",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Procurement Operations & 3-Way Matching (PO vs GRN vs Bill)",
        "summary": "Create Purchase Orders (PO), record Goods Receipt Notes (GRN), perform 3-Way Matching with supplier bills, and manage purchase returns.",
        "steps": [
          "Navigate to Procurement & Stores > Purchase Operations.",
          "Click \"+ New Purchase Order (PO)\", select Vendor, Godown/Warehouse, Item list, Quantities, and Negotiated Rates.",
          "When items arrive at the godown, click \"Create GRN\" against the PO. (Rule: GRN quantity cannot exceed PO quantity).",
          "When the vendor invoice is received, create the Purchase Bill linked to the GRN.",
          "The 3-Way Match engine validates: PO Rate == Invoice Rate, GRN Qty == Invoice Qty.",
          "If defective goods are received, generate a Purchase Return Debit Note against the GRN."
        ],
        "shortcuts": [
          "Alt+O (New PO)",
          "Alt+G (New GRN)",
          "Ctrl+A (Save Bill)"
        ],
        "category": "Procurement & Stores",
        "tabTarget": "procurement",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-jobwork-itc04",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Procurement & Stores",
    "tabTarget": "jobwork",
    "keywords": [
      "jobwork",
      "subcontracting",
      "itc-04",
      "job worker",
      "challan",
      "job work out",
      "job work in",
      "scrap loss",
      "subcontractor"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Job Work, Subcontracting & Form ITC-04 Compliance",
      "summary": "Manage job work outward challans, track semi-finished materials at subcontractor locations, and file statutory Form ITC-04.",
      "steps": [
        "Navigate to Procurement & Stores > Job Work & Subcontracting.",
        "Click \"+ New Job Work Outward Challan\", select Job Worker / Subcontractor, Raw Material items, and Process required (e.g. Heat Treatment, Powder Coating).",
        "Track the job work inventory held at subcontractor premises.",
        "When finished goods return, create a \"Job Work Inward Challan\", recording received finished items, scrap generated, and process charges.",
        "Navigate to the \"ITC-04 Statutory Register\" tab to verify 1-year capital goods and 3-year inputs return deadlines.",
        "Export the GST Form ITC-04 JSON/Excel for portal filing."
      ],
      "shortcuts": [
        "Alt+J (New Job Work Challan)",
        "Ctrl+I (ITC-04 Export)"
      ],
      "category": "Procurement & Stores",
      "tabTarget": "jobwork",
      "changeNotes": "Official baseline version 1.0 guide for Open Job Work Center",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Job Work, Subcontracting & Form ITC-04 Compliance",
        "summary": "Manage job work outward challans, track semi-finished materials at subcontractor locations, and file statutory Form ITC-04.",
        "steps": [
          "Navigate to Procurement & Stores > Job Work & Subcontracting.",
          "Click \"+ New Job Work Outward Challan\", select Job Worker / Subcontractor, Raw Material items, and Process required (e.g. Heat Treatment, Powder Coating).",
          "Track the job work inventory held at subcontractor premises.",
          "When finished goods return, create a \"Job Work Inward Challan\", recording received finished items, scrap generated, and process charges.",
          "Navigate to the \"ITC-04 Statutory Register\" tab to verify 1-year capital goods and 3-year inputs return deadlines.",
          "Export the GST Form ITC-04 JSON/Excel for portal filing."
        ],
        "shortcuts": [
          "Alt+J (New Job Work Challan)",
          "Ctrl+I (ITC-04 Export)"
        ],
        "category": "Procurement & Stores",
        "tabTarget": "jobwork",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-manufacturing-bom",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Procurement & Stores",
    "tabTarget": "manufacturing",
    "keywords": [
      "manufacturing",
      "bom",
      "bill of materials",
      "assembly",
      "production order",
      "manufacturing journal",
      "scrap",
      "standard cost",
      "production"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Manufacturing Operations, Multi-Level BOM & Production Journals",
      "summary": "Build multi-level Bill of Materials (BOM), schedule production orders, record assembly manufacturing journals, and analyze standard costing.",
      "steps": [
        "Navigate to Procurement & Stores > Manufacturing & BOM.",
        "Click \"+ New Bill of Materials (BOM)\", name the finished product (e.g. Industrial Pump Set 5HP), and add component items with exact ratios.",
        "Add additional production costs: Direct Labor, Machine Electricity, and Factory Overheads.",
        "Create a Production Order and allocate raw materials from the Raw Material Godown.",
        "Post a Manufacturing Journal (Assembly Journal): Raw materials are consumed (credited from stock) and Finished Goods are added (debited to stock) at net cost.",
        "Inspect the Cost Variance report (Standard BOM Cost vs Actual Production Cost)."
      ],
      "shortcuts": [
        "Alt+B (Create BOM)",
        "Alt+M (Manufacturing Journal)"
      ],
      "category": "Procurement & Stores",
      "tabTarget": "manufacturing",
      "changeNotes": "Official baseline version 1.0 guide for Open Manufacturing Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Manufacturing Operations, Multi-Level BOM & Production Journals",
        "summary": "Build multi-level Bill of Materials (BOM), schedule production orders, record assembly manufacturing journals, and analyze standard costing.",
        "steps": [
          "Navigate to Procurement & Stores > Manufacturing & BOM.",
          "Click \"+ New Bill of Materials (BOM)\", name the finished product (e.g. Industrial Pump Set 5HP), and add component items with exact ratios.",
          "Add additional production costs: Direct Labor, Machine Electricity, and Factory Overheads.",
          "Create a Production Order and allocate raw materials from the Raw Material Godown.",
          "Post a Manufacturing Journal (Assembly Journal): Raw materials are consumed (credited from stock) and Finished Goods are added (debited to stock) at net cost.",
          "Inspect the Cost Variance report (Standard BOM Cost vs Actual Production Cost)."
        ],
        "shortcuts": [
          "Alt+B (Create BOM)",
          "Alt+M (Manufacturing Journal)"
        ],
        "category": "Procurement & Stores",
        "tabTarget": "manufacturing",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-stores-inventory",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Procurement & Stores",
    "tabTarget": "inventory",
    "keywords": [
      "inventory",
      "stores",
      "godown",
      "stock valuation",
      "fifo",
      "weighted average",
      "stock transfer",
      "reorder level",
      "physical count",
      "warehouse"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Stores, Godowns & Inventory Valuation (FIFO / Weighted Avg)",
      "summary": "Manage multi-warehouse storage facilities, perform inter-godown stock transfers, monitor reorder levels, and execute stock counts.",
      "steps": [
        "Navigate to Procurement & Stores > Stores & Inventory.",
        "View the real-time stock summary across all Godowns (e.g. Chakan Plant, Pune Central, Bhosari Warehouse).",
        "Filter stock valuation by method: FIFO (First-In First-Out) or Weighted Average Costing.",
        "To move stock between facilities, click \"+ Inter-Godown Stock Transfer\", pick Source Godown, Destination Godown, and Item quantities.",
        "Review items marked with \"⚠️ Low Stock Reorder Alarm\" to initiate purchase requisitions.",
        "Click \"Physical Stock Count\" to input annual verification counts and generate Stock Adjustment Vouchers."
      ],
      "shortcuts": [
        "Alt+S (Stock Summary)",
        "Ctrl+T (Stock Transfer)"
      ],
      "category": "Procurement & Stores",
      "tabTarget": "inventory",
      "changeNotes": "Official baseline version 1.0 guide for Open Stores & Inventory Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Stores, Godowns & Inventory Valuation (FIFO / Weighted Avg)",
        "summary": "Manage multi-warehouse storage facilities, perform inter-godown stock transfers, monitor reorder levels, and execute stock counts.",
        "steps": [
          "Navigate to Procurement & Stores > Stores & Inventory.",
          "View the real-time stock summary across all Godowns (e.g. Chakan Plant, Pune Central, Bhosari Warehouse).",
          "Filter stock valuation by method: FIFO (First-In First-Out) or Weighted Average Costing.",
          "To move stock between facilities, click \"+ Inter-Godown Stock Transfer\", pick Source Godown, Destination Godown, and Item quantities.",
          "Review items marked with \"⚠️ Low Stock Reorder Alarm\" to initiate purchase requisitions.",
          "Click \"Physical Stock Count\" to input annual verification counts and generate Stock Adjustment Vouchers."
        ],
        "shortcuts": [
          "Alt+S (Stock Summary)",
          "Ctrl+T (Stock Transfer)"
        ],
        "category": "Procurement & Stores",
        "tabTarget": "inventory",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-purchase-reports",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Procurement & Stores",
    "tabTarget": "purchase-reports",
    "keywords": [
      "purchase reports",
      "purchase register",
      "vendor ageing",
      "msme",
      "43b(h)",
      "45 days",
      "creditors ageing",
      "supplier statement",
      "payables"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Purchase Department Reports & MSME 45-Day Compliance",
      "summary": "Audit Purchase Registers, analyze Vendor Ageing (0-30, 31-60, 61-90, >90 days), and enforce Section 43B(h) MSME 45-day payment rules.",
      "steps": [
        "Navigate to Procurement & Stores > Purchase Reports.",
        "Select the report view: \"Purchase Register\", \"Vendor Ageing Matrix\", or \"MSME 45-Day Compliance Tracker\".",
        "In Vendor Ageing: Inspect outstanding bills categorized into 0-30, 31-60, 61-90, and >90 days overdue slabs.",
        "In MSME Compliance Tracker: Monitor pending payments to registered Micro and Small enterprises.",
        "Highlight invoices approaching the 45-day (written agreement) or 15-day (no agreement) statutory deadline.",
        "Click \"Export MSME 43B(h) Compliance Schedule\" for income tax return filing."
      ],
      "shortcuts": [
        "Alt+R (Purchase Register)",
        "Alt+A (Vendor Ageing)"
      ],
      "category": "Procurement & Stores",
      "tabTarget": "purchase-reports",
      "changeNotes": "Official baseline version 1.0 guide for Open Purchase Reports",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Purchase Department Reports & MSME 45-Day Compliance",
        "summary": "Audit Purchase Registers, analyze Vendor Ageing (0-30, 31-60, 61-90, >90 days), and enforce Section 43B(h) MSME 45-day payment rules.",
        "steps": [
          "Navigate to Procurement & Stores > Purchase Reports.",
          "Select the report view: \"Purchase Register\", \"Vendor Ageing Matrix\", or \"MSME 45-Day Compliance Tracker\".",
          "In Vendor Ageing: Inspect outstanding bills categorized into 0-30, 31-60, 61-90, and >90 days overdue slabs.",
          "In MSME Compliance Tracker: Monitor pending payments to registered Micro and Small enterprises.",
          "Highlight invoices approaching the 45-day (written agreement) or 15-day (no agreement) statutory deadline.",
          "Click \"Export MSME 43B(h) Compliance Schedule\" for income tax return filing."
        ],
        "shortcuts": [
          "Alt+R (Purchase Register)",
          "Alt+A (Vendor Ageing)"
        ],
        "category": "Procurement & Stores",
        "tabTarget": "purchase-reports",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-payroll-statutory",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "HR & Indian Payroll",
    "tabTarget": "payroll",
    "keywords": [
      "payroll",
      "hr",
      "salary",
      "epf",
      "esic",
      "professional tax",
      "pt",
      "tds 192",
      "payslip",
      "attendance",
      "form 16",
      "employee master"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "HR Management & Indian Statutory Payroll (EPF, ESIC, PT, TDS)",
      "summary": "Manage employee profiles, biometric attendance, salary structures, EPF (12%), ESIC (0.75%), Professional Tax, and Section 192 TDS.",
      "steps": [
        "Navigate to Human Resources & Payroll > HR & Indian Payroll.",
        "Add or view Employees: input UAN (PF), ESIC IP Number, PAN, Bank A/c, and Designation.",
        "Define Salary Components: Basic Pay, HRA, Dearness Allowance, Special Allowance, and Performance Bonus.",
        "Import or record monthly Attendance (Present, Leave, Loss of Pay days).",
        "Click \"Run Monthly Payroll Engine\" — the system computes EPF (12% employee + 12% employer), ESIC (0.75% / 3.25%), State PT slab, and Section 192 TDS.",
        "Click \"Post Payroll JV\" to debit Salary Expense and credit PF/ESIC/PT Payable and Net Salaries Payable.",
        "Click \"Generate Bulk Payslips\" to export password-protected PDF payslips."
      ],
      "shortcuts": [
        "Alt+P (Run Payroll)",
        "Ctrl+Shift+P (Payslips)"
      ],
      "category": "HR & Indian Payroll",
      "tabTarget": "payroll",
      "changeNotes": "Official baseline version 1.0 guide for Open HR & Payroll Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "HR Management & Indian Statutory Payroll (EPF, ESIC, PT, TDS)",
        "summary": "Manage employee profiles, biometric attendance, salary structures, EPF (12%), ESIC (0.75%), Professional Tax, and Section 192 TDS.",
        "steps": [
          "Navigate to Human Resources & Payroll > HR & Indian Payroll.",
          "Add or view Employees: input UAN (PF), ESIC IP Number, PAN, Bank A/c, and Designation.",
          "Define Salary Components: Basic Pay, HRA, Dearness Allowance, Special Allowance, and Performance Bonus.",
          "Import or record monthly Attendance (Present, Leave, Loss of Pay days).",
          "Click \"Run Monthly Payroll Engine\" — the system computes EPF (12% employee + 12% employer), ESIC (0.75% / 3.25%), State PT slab, and Section 192 TDS.",
          "Click \"Post Payroll JV\" to debit Salary Expense and credit PF/ESIC/PT Payable and Net Salaries Payable.",
          "Click \"Generate Bulk Payslips\" to export password-protected PDF payslips."
        ],
        "shortcuts": [
          "Alt+P (Run Payroll)",
          "Ctrl+Shift+P (Payslips)"
        ],
        "category": "HR & Indian Payroll",
        "tabTarget": "payroll",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-sales-operations",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Sales & Revenue",
    "tabTarget": "sales",
    "keywords": [
      "sales",
      "sales order",
      "quotation",
      "estimate",
      "delivery challan",
      "dc",
      "dispatch",
      "credit limit",
      "tax invoice",
      "so"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Sales Operations, Quotations, Orders & Delivery Challans",
      "summary": "Manage end-to-end sales lifecycle: Quotations, Sales Orders (SO), Delivery Challans (DC), Dispatch Invoices, and Credit Limits.",
      "steps": [
        "Navigate to Sales & Revenue > Sales Operations.",
        "Click \"+ New Sales Quotation\" to send a price estimate with item rates and GST breakdown.",
        "Convert approved Quotation into a confirmed Sales Order (SO).",
        "When dispatching goods from the warehouse, click \"Create Delivery Challan (DC)\". (Rule: Dispatched quantity cannot exceed SO quantity).",
        "Verify customer Credit Limit before generating the final Tax Invoice.",
        "Convert Delivery Challan into a GST Tax Invoice and generate E-Way Bill dispatch documents."
      ],
      "shortcuts": [
        "Alt+Q (New Quotation)",
        "Alt+S (New SO)",
        "Alt+C (New Challan)"
      ],
      "category": "Sales & Revenue",
      "tabTarget": "sales",
      "changeNotes": "Official baseline version 1.0 guide for Open Sales Operations",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Sales Operations, Quotations, Orders & Delivery Challans",
        "summary": "Manage end-to-end sales lifecycle: Quotations, Sales Orders (SO), Delivery Challans (DC), Dispatch Invoices, and Credit Limits.",
        "steps": [
          "Navigate to Sales & Revenue > Sales Operations.",
          "Click \"+ New Sales Quotation\" to send a price estimate with item rates and GST breakdown.",
          "Convert approved Quotation into a confirmed Sales Order (SO).",
          "When dispatching goods from the warehouse, click \"Create Delivery Challan (DC)\". (Rule: Dispatched quantity cannot exceed SO quantity).",
          "Verify customer Credit Limit before generating the final Tax Invoice.",
          "Convert Delivery Challan into a GST Tax Invoice and generate E-Way Bill dispatch documents."
        ],
        "shortcuts": [
          "Alt+Q (New Quotation)",
          "Alt+S (New SO)",
          "Alt+C (New Challan)"
        ],
        "category": "Sales & Revenue",
        "tabTarget": "sales",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-sales-reports-ageing",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Sales & Revenue",
    "tabTarget": "sales-reports",
    "keywords": [
      "sales reports",
      "debtor ageing",
      "customer ageing",
      "sales register",
      "unbilled challans",
      "receivables",
      "dso",
      "pending invoices",
      "outstanding"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Sales Department Reports & Customer Debtors Ageing",
      "summary": "Analyze Sales Registers, drill down into Customer Ageing (0-30, 31-60, 61-90, >90 days), and track unbilled Delivery Challans.",
      "steps": [
        "Navigate to Sales & Revenue > Sales Reports.",
        "Select report view: \"Sales Register\", \"Debtor Ageing Matrix\", or \"Unbilled Delivery Challans\".",
        "In Debtor Ageing: Analyze outstanding invoices grouped by aging brackets (0-30, 31-60, 61-90, >90 days).",
        "Review Days Sales Outstanding (DSO) and overdue risk badges.",
        "Click on any customer row to view their full Ledger Statement and itemized pending bill details.",
        "Click \"Send Automated Payment Reminders\" to trigger WhatsApp/Email reminders with dynamic UPI links."
      ],
      "shortcuts": [
        "Alt+R (Sales Register)",
        "Alt+A (Debtor Ageing)"
      ],
      "category": "Sales & Revenue",
      "tabTarget": "sales-reports",
      "changeNotes": "Official baseline version 1.0 guide for Open Sales Reports Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Sales Department Reports & Customer Debtors Ageing",
        "summary": "Analyze Sales Registers, drill down into Customer Ageing (0-30, 31-60, 61-90, >90 days), and track unbilled Delivery Challans.",
        "steps": [
          "Navigate to Sales & Revenue > Sales Reports.",
          "Select report view: \"Sales Register\", \"Debtor Ageing Matrix\", or \"Unbilled Delivery Challans\".",
          "In Debtor Ageing: Analyze outstanding invoices grouped by aging brackets (0-30, 31-60, 61-90, >90 days).",
          "Review Days Sales Outstanding (DSO) and overdue risk badges.",
          "Click on any customer row to view their full Ledger Statement and itemized pending bill details.",
          "Click \"Send Automated Payment Reminders\" to trigger WhatsApp/Email reminders with dynamic UPI links."
        ],
        "shortcuts": [
          "Alt+R (Sales Register)",
          "Alt+A (Debtor Ageing)"
        ],
        "category": "Sales & Revenue",
        "tabTarget": "sales-reports",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-maker-checker",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Approvals & Governance",
    "tabTarget": "approvals",
    "keywords": [
      "maker checker",
      "approval",
      "4 eyes",
      "dual authorization",
      "segregation of duties",
      "threshold",
      "fraud prevention",
      "pending approvals"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Maker & Checker Dual Authorization (4-Eyes Governance)",
      "summary": "Configure dual authorization workflows, customize approval monetary thresholds, and prevent single-user payment fraud.",
      "steps": [
        "Navigate to Intelligence & Admin > Maker & Checker.",
        "Review the Dual Authorization Policy Matrix: enable maker-checker per voucher type (Payments, Purchases, JVs, Returns).",
        "Set the monetary threshold (e.g. Transactions > ₹50,000 require Senior Checker authorization).",
        "Maker (Accountant / Operator) posts the transaction; it is placed into the \"Pending Authorization\" queue.",
        "Checker (CFO / Business Owner) receives an alert, inspects debit-credit legs and invoice attachments, and approves or rejects with reason.",
        "Approved vouchers post immediately to live GL; rejected entries return to Maker with audit notes."
      ],
      "shortcuts": [
        "Alt+A (Pending Approvals)",
        "Ctrl+Enter (Approve Voucher)"
      ],
      "category": "Approvals & Governance",
      "tabTarget": "approvals",
      "changeNotes": "Official baseline version 1.0 guide for Open Maker-Checker Center",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Maker & Checker Dual Authorization (4-Eyes Governance)",
        "summary": "Configure dual authorization workflows, customize approval monetary thresholds, and prevent single-user payment fraud.",
        "steps": [
          "Navigate to Intelligence & Admin > Maker & Checker.",
          "Review the Dual Authorization Policy Matrix: enable maker-checker per voucher type (Payments, Purchases, JVs, Returns).",
          "Set the monetary threshold (e.g. Transactions > ₹50,000 require Senior Checker authorization).",
          "Maker (Accountant / Operator) posts the transaction; it is placed into the \"Pending Authorization\" queue.",
          "Checker (CFO / Business Owner) receives an alert, inspects debit-credit legs and invoice attachments, and approves or rejects with reason.",
          "Approved vouchers post immediately to live GL; rejected entries return to Maker with audit notes."
        ],
        "shortcuts": [
          "Alt+A (Pending Approvals)",
          "Ctrl+Enter (Approve Voucher)"
        ],
        "category": "Approvals & Governance",
        "tabTarget": "approvals",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-period-lock",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Approvals & Governance",
    "tabTarget": "period-lock",
    "keywords": [
      "period lock",
      "freeze books",
      "backdating",
      "grace window",
      "locked period",
      "mca freeze",
      "gatekeeper",
      "lock accounting"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Period Lock, Backdating Controls & Hard Freeze Books",
      "summary": "Freeze closed accounting periods, set backdating grace windows, and block unauthorized retrospective changes to audited books.",
      "steps": [
        "Navigate to Intelligence & Admin > Period Lock & Backdating.",
        "Toggle \"Allow Backdated Postings\" on or off.",
        "Set the \"Backdating Grace Window\" (e.g. 5 days for routine invoice adjustments).",
        "Set the \"Hard Freeze Books Date\" (e.g. 31-March-2026). Transactions on or before this date are completely locked.",
        "Any attempt by users to post or edit a voucher in a locked period is blocked by the Posting Control Gatekeeper.",
        "Only the Business Owner / Super Admin can unlock a frozen period with an audited override reason."
      ],
      "shortcuts": [
        "Alt+L (Lock Period)",
        "Ctrl+Shift+F (Hard Freeze)"
      ],
      "category": "Approvals & Governance",
      "tabTarget": "period-lock",
      "changeNotes": "Official baseline version 1.0 guide for Open Period Lock Controls",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Period Lock, Backdating Controls & Hard Freeze Books",
        "summary": "Freeze closed accounting periods, set backdating grace windows, and block unauthorized retrospective changes to audited books.",
        "steps": [
          "Navigate to Intelligence & Admin > Period Lock & Backdating.",
          "Toggle \"Allow Backdated Postings\" on or off.",
          "Set the \"Backdating Grace Window\" (e.g. 5 days for routine invoice adjustments).",
          "Set the \"Hard Freeze Books Date\" (e.g. 31-March-2026). Transactions on or before this date are completely locked.",
          "Any attempt by users to post or edit a voucher in a locked period is blocked by the Posting Control Gatekeeper.",
          "Only the Business Owner / Super Admin can unlock a frozen period with an audited override reason."
        ],
        "shortcuts": [
          "Alt+L (Lock Period)",
          "Ctrl+Shift+F (Hard Freeze)"
        ],
        "category": "Approvals & Governance",
        "tabTarget": "period-lock",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-communication-omni",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Approvals & Governance",
    "tabTarget": "communication",
    "keywords": [
      "communication",
      "whatsapp",
      "email",
      "sms",
      "reminders",
      "payment link",
      "broadcast",
      "notification",
      "omni alerts"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Communication Hub & Omni Alerts (WhatsApp, Email & SMS)",
      "summary": "Send automated WhatsApp invoices, payment reminders with dynamic UPI links, and broadcast circulars to clients and vendors.",
      "steps": [
        "Navigate to Intelligence & Admin > Communication Hub.",
        "Select channel: \"WhatsApp Business API\", \"Email Dispatch\", or \"SMS Gateway\".",
        "To send payment reminders, click \"Broadcast Payment Reminders\", filter debtors overdue >30 days, and select template.",
        "Review the message preview containing Customer Name, Overdue Amount (₹), Invoice Numbers, and NPCI UPI payment link.",
        "Click \"Send Broadcast\" to dispatch messages via official verified WhatsApp/Email routes.",
        "Monitor delivery status (Sent, Delivered, Read) in the live Communication Log."
      ],
      "shortcuts": [
        "Alt+C (Open Comms)",
        "Ctrl+B (Broadcast Reminders)"
      ],
      "category": "Approvals & Governance",
      "tabTarget": "communication",
      "changeNotes": "Official baseline version 1.0 guide for Open Communication Hub",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Communication Hub & Omni Alerts (WhatsApp, Email & SMS)",
        "summary": "Send automated WhatsApp invoices, payment reminders with dynamic UPI links, and broadcast circulars to clients and vendors.",
        "steps": [
          "Navigate to Intelligence & Admin > Communication Hub.",
          "Select channel: \"WhatsApp Business API\", \"Email Dispatch\", or \"SMS Gateway\".",
          "To send payment reminders, click \"Broadcast Payment Reminders\", filter debtors overdue >30 days, and select template.",
          "Review the message preview containing Customer Name, Overdue Amount (₹), Invoice Numbers, and NPCI UPI payment link.",
          "Click \"Send Broadcast\" to dispatch messages via official verified WhatsApp/Email routes.",
          "Monitor delivery status (Sent, Delivered, Read) in the live Communication Log."
        ],
        "shortcuts": [
          "Alt+C (Open Comms)",
          "Ctrl+B (Broadcast Reminders)"
        ],
        "category": "Approvals & Governance",
        "tabTarget": "communication",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-audit-trail-mca",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Compliance & Tax",
    "tabTarget": "audit-trail",
    "keywords": [
      "audit trail",
      "edit log",
      "mca 2024",
      "companies act",
      "rule 3",
      "tamper evident",
      "before after diff",
      "checksum",
      "audit logs"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Audit Trail & Edit Log (MCA 2024 / Companies Act Compliance)",
      "summary": "Inspect tamper-proof before/after JSON diffs, track creation, edits, deletions, user logins, and export statutory audit logs.",
      "steps": [
        "Navigate to Intelligence & Admin > Audit Trail & Edit Log.",
        "View the real-time chronological event feed tracking every action across the ERP.",
        "Filter by Event Category: VOUCHER_CREATED, RECORD_MODIFIED, RECORD_DELETED, PERIOD_CLOSED, USER_LOGIN.",
        "Click on any event to inspect the visual Before-vs-After JSON Diff highlighting changed field values in red and green.",
        "Review metadata: Timestamp, User Email, Role, IP Address, and Cryptographic SHA-256 Checksum.",
        "Click \"Export Statutory MCA Audit Report\" to download compliance packages for statutory auditors."
      ],
      "shortcuts": [
        "Alt+A (Audit Trail)",
        "Ctrl+E (Export Audit Log)"
      ],
      "category": "Compliance & Tax",
      "tabTarget": "audit-trail",
      "changeNotes": "Official baseline version 1.0 guide for Open MCA Audit Trail",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Audit Trail & Edit Log (MCA 2024 / Companies Act Compliance)",
        "summary": "Inspect tamper-proof before/after JSON diffs, track creation, edits, deletions, user logins, and export statutory audit logs.",
        "steps": [
          "Navigate to Intelligence & Admin > Audit Trail & Edit Log.",
          "View the real-time chronological event feed tracking every action across the ERP.",
          "Filter by Event Category: VOUCHER_CREATED, RECORD_MODIFIED, RECORD_DELETED, PERIOD_CLOSED, USER_LOGIN.",
          "Click on any event to inspect the visual Before-vs-After JSON Diff highlighting changed field values in red and green.",
          "Review metadata: Timestamp, User Email, Role, IP Address, and Cryptographic SHA-256 Checksum.",
          "Click \"Export Statutory MCA Audit Report\" to download compliance packages for statutory auditors."
        ],
        "shortcuts": [
          "Alt+A (Audit Trail)",
          "Ctrl+E (Export Audit Log)"
        ],
        "category": "Compliance & Tax",
        "tabTarget": "audit-trail",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-ai-document-ocr",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Approvals & Governance",
    "tabTarget": "document",
    "keywords": [
      "ocr",
      "ai document",
      "invoice scanner",
      "receipt scan",
      "pdf extract",
      "auto draft",
      "gemini vision",
      "document review"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "AI Document Review & Intelligent OCR Invoice Scanner",
      "summary": "Scan supplier tax invoices and expense receipts with AI OCR, extract line items, taxes, and vendor details to auto-draft vouchers.",
      "steps": [
        "Navigate to Intelligence & Admin > AI Document Review.",
        "Drag and drop or upload a Vendor Tax Invoice or Receipt (PDF, PNG, JPEG).",
        "The AI OCR engine scans the document in real time.",
        "Review the extracted data: Vendor Name, GSTIN, Invoice Number, Date, Line Items, HSN Codes, Quantities, Rates, and CGST/SGST/IGST.",
        "Verify field confidence scores and correct any flagged values.",
        "Click \"Generate Draft Purchase Voucher (F9)\" to auto-populate Voucher Matrix and attach the original document."
      ],
      "shortcuts": [
        "Alt+U (Upload Invoice)",
        "Ctrl+G (Generate Voucher)"
      ],
      "category": "Approvals & Governance",
      "tabTarget": "document",
      "changeNotes": "Official baseline version 1.0 guide for Open AI Document Review",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "AI Document Review & Intelligent OCR Invoice Scanner",
        "summary": "Scan supplier tax invoices and expense receipts with AI OCR, extract line items, taxes, and vendor details to auto-draft vouchers.",
        "steps": [
          "Navigate to Intelligence & Admin > AI Document Review.",
          "Drag and drop or upload a Vendor Tax Invoice or Receipt (PDF, PNG, JPEG).",
          "The AI OCR engine scans the document in real time.",
          "Review the extracted data: Vendor Name, GSTIN, Invoice Number, Date, Line Items, HSN Codes, Quantities, Rates, and CGST/SGST/IGST.",
          "Verify field confidence scores and correct any flagged values.",
          "Click \"Generate Draft Purchase Voucher (F9)\" to auto-populate Voucher Matrix and attach the original document."
        ],
        "shortcuts": [
          "Alt+U (Upload Invoice)",
          "Ctrl+G (Generate Voucher)"
        ],
        "category": "Approvals & Governance",
        "tabTarget": "document",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-flutter-mobile",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Executive Intelligence",
    "tabTarget": "mobile",
    "keywords": [
      "mobile",
      "flutter",
      "ios",
      "android",
      "app",
      "mobile app",
      "companion",
      "mobile approvals",
      "smartphone",
      "mobile view"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Flutter Mobile App & Executive Smartphone Companion",
      "summary": "Access executive KPIs, approve maker-checker vouchers, record on-the-go receipts, and view live ledger balances on iOS and Android.",
      "steps": [
        "Navigate to Intelligence & Admin > Flutter Mobile App (or open Finstaq on any mobile browser).",
        "On mobile viewports (< 768px), the app automatically switches to the native Flutter mobile UI.",
        "Executive Tab: View live Bank Balance, Today’s Collections, Pending Invoices, and Net Margin %.",
        "Approvals Tab: Authorize or reject pending maker-checker payment vouchers with 1 tap.",
        "Vouchers Tab: Quick-post Receipt and Cash Payment vouchers with phone camera receipt uploads.",
        "Customers Tab: Look up customer phone numbers, outstanding balance, and share WhatsApp payment reminders."
      ],
      "shortcuts": [
        "Alt+M (Mobile Simulator)",
        "Ctrl+Shift+M (Toggle Mobile View)"
      ],
      "category": "Executive Intelligence",
      "tabTarget": "mobile",
      "changeNotes": "Official baseline version 1.0 guide for Open Mobile Companion",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Flutter Mobile App & Executive Smartphone Companion",
        "summary": "Access executive KPIs, approve maker-checker vouchers, record on-the-go receipts, and view live ledger balances on iOS and Android.",
        "steps": [
          "Navigate to Intelligence & Admin > Flutter Mobile App (or open Finstaq on any mobile browser).",
          "On mobile viewports (< 768px), the app automatically switches to the native Flutter mobile UI.",
          "Executive Tab: View live Bank Balance, Today’s Collections, Pending Invoices, and Net Margin %.",
          "Approvals Tab: Authorize or reject pending maker-checker payment vouchers with 1 tap.",
          "Vouchers Tab: Quick-post Receipt and Cash Payment vouchers with phone camera receipt uploads.",
          "Customers Tab: Look up customer phone numbers, outstanding balance, and share WhatsApp payment reminders."
        ],
        "shortcuts": [
          "Alt+M (Mobile Simulator)",
          "Ctrl+Shift+M (Toggle Mobile View)"
        ],
        "category": "Executive Intelligence",
        "tabTarget": "mobile",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-settings-soc2",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Approvals & Governance",
    "tabTarget": "settings",
    "keywords": [
      "settings",
      "soc2",
      "trust matrix",
      "security",
      "rbac",
      "prefix",
      "company profile",
      "gstin setup",
      "encryption",
      "user roles"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Settings, Security & SOC 2 Type II Trust Services Matrix",
      "summary": "Configure tenant profile, GSTINs, auto-numbering prefixes, RBAC permissions, and inspect the live SOC 2 Type II Trust Matrix.",
      "steps": [
        "Navigate to Intelligence & Admin > Settings & Security in the sidebar.",
        "Tab \"Company Profile\": Update Registered Legal Name, Corporate Office, CIN, and Currency.",
        "Tab \"GST & Tax Configuration\": Manage State-wise GSTIN registrations and filing frequencies.",
        "Tab \"Voucher Numbering\": Set customized auto-increment prefixes (e.g. SI/26-27/0001, PV/26-27/0001).",
        "Tab \"User Access & Roles\": Configure RBAC permissions for Owner, Senior Accountant, and Data Entry.",
        "Tab \"SOC 2 Type II Compliance\": Inspect live controls across all 5 Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy / DPDP Act 2023)."
      ],
      "shortcuts": [
        "Alt+S (Open Settings)",
        "Ctrl+, (Preferences)"
      ],
      "category": "Approvals & Governance",
      "tabTarget": "settings",
      "changeNotes": "Official baseline version 1.0 guide for Open Settings & Security",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Settings, Security & SOC 2 Type II Trust Services Matrix",
        "summary": "Configure tenant profile, GSTINs, auto-numbering prefixes, RBAC permissions, and inspect the live SOC 2 Type II Trust Matrix.",
        "steps": [
          "Navigate to Intelligence & Admin > Settings & Security in the sidebar.",
          "Tab \"Company Profile\": Update Registered Legal Name, Corporate Office, CIN, and Currency.",
          "Tab \"GST & Tax Configuration\": Manage State-wise GSTIN registrations and filing frequencies.",
          "Tab \"Voucher Numbering\": Set customized auto-increment prefixes (e.g. SI/26-27/0001, PV/26-27/0001).",
          "Tab \"User Access & Roles\": Configure RBAC permissions for Owner, Senior Accountant, and Data Entry.",
          "Tab \"SOC 2 Type II Compliance\": Inspect live controls across all 5 Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy / DPDP Act 2023)."
        ],
        "shortcuts": [
          "Alt+S (Open Settings)",
          "Ctrl+, (Preferences)"
        ],
        "category": "Approvals & Governance",
        "tabTarget": "settings",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  },
  {
    "id": "topic-super-admin-saas",
    "currentLiveVersion": "v1.0",
    "status": "PUBLISHED",
    "category": "Approvals & Governance",
    "tabTarget": "super-admin",
    "keywords": [
      "super admin",
      "platform owner",
      "saas",
      "multi tenant",
      "billing",
      "mrr",
      "cms",
      "version control",
      "zero knowledge",
      "knowledge base"
    ],
    "publishedContent": {
      "version": "v1.0",
      "title": "Platform Control Center (SaaS Owner & Help Genie CMS)",
      "summary": "Manage multi-tenant subscriptions, zero-knowledge privacy isolation, SaaS MRR billing, and version-controlled Help Genie CMS.",
      "steps": [
        "Log in as Platform Owner (Role: SUPER_ADMIN) and navigate to Platform Control Center in the sidebar.",
        "Tenant Accounts Hub: View tenant organizations, active user counts, voucher consumption, and subscription status.",
        "Strict Privacy: Tenant financial ledgers, vouchers, and transactions are strictly zero-knowledge isolated and invisible to super admin.",
        "Subscription Billing: Generate SaaS platform invoices, record subscription collections, and manage tier upgrades.",
        "Help Genie CMS Hub: Create, edit, draft, diff-review, and publish version-controlled knowledge base topics for the entire ERP.",
        "Rollback: Restore previous topic versions with zero downtime."
      ],
      "shortcuts": [
        "Alt+S (Super Admin Hub)",
        "Ctrl+Shift+C (Genie CMS)"
      ],
      "category": "Approvals & Governance",
      "tabTarget": "super-admin",
      "changeNotes": "Official baseline version 1.0 guide for Open Platform Control Center",
      "author": "Platform Editorial Board & Chief Architect",
      "timestamp": "2026-04-01T10:00:00Z"
    },
    "versionHistory": [
      {
        "version": "v1.0",
        "title": "Platform Control Center (SaaS Owner & Help Genie CMS)",
        "summary": "Manage multi-tenant subscriptions, zero-knowledge privacy isolation, SaaS MRR billing, and version-controlled Help Genie CMS.",
        "steps": [
          "Log in as Platform Owner (Role: SUPER_ADMIN) and navigate to Platform Control Center in the sidebar.",
          "Tenant Accounts Hub: View tenant organizations, active user counts, voucher consumption, and subscription status.",
          "Strict Privacy: Tenant financial ledgers, vouchers, and transactions are strictly zero-knowledge isolated and invisible to super admin.",
          "Subscription Billing: Generate SaaS platform invoices, record subscription collections, and manage tier upgrades.",
          "Help Genie CMS Hub: Create, edit, draft, diff-review, and publish version-controlled knowledge base topics for the entire ERP.",
          "Rollback: Restore previous topic versions with zero downtime."
        ],
        "shortcuts": [
          "Alt+S (Super Admin Hub)",
          "Ctrl+Shift+C (Genie CMS)"
        ],
        "category": "Approvals & Governance",
        "tabTarget": "super-admin",
        "changeNotes": "Initial production publication",
        "author": "System Initializer",
        "timestamp": "2026-01-01T00:00:00Z"
      }
    ]
  }
];

export const SuperAdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'billing' | 'genie-cms' | 'storage-quotas'>('genie-cms');
  const [metrics, setMetrics] = useState<PlatformMetrics | null>({
    totalTenants: 3,
    activeTenants: 2,
    inactiveTenants: 1,
    trialTenants: 0,
    mrr: 37000,
    totalCollected: 29500,
    overdueAmount: 5900,
    totalUsers: 29,
    totalVouchersProcessed: 2280
  });

  const [tenants, setTenants] = useState<TenantAccount[]>([
    {
      id: 't-1',
      name: 'Nova Retail Ventures',
      subdomain: 'novaretail',
      gstin: '06XYZPA9988H1Z1',
      contactEmail: 'admin@novaretail.com',
      contactPhone: '+91 98110 44221',
      status: 'SUSPENDED',
      subscriptionTier: 'STARTER',
      monthlyAmount: 5000,
      currency: 'INR',
      userCount: 3,
      voucherCount: 210,
      createdAt: '2026-01-15T00:00:00Z',
      storageAllocatedGB: 10,
      storageUsedGB: 2.1,
      maxFileSizeMB: 10,
      storageDriver: 'local',
    },
    {
      id: 't-2',
      name: 'Zenith Logistics & Supply Co.',
      subdomain: 'zenith',
      gstin: '29ABCDE5678G2Z3',
      contactEmail: 'finance@zenithlogistics.in',
      contactPhone: '+91 99201 55432',
      status: 'ACTIVE',
      subscriptionTier: 'PROFESSIONAL',
      monthlyAmount: 12000,
      currency: 'INR',
      userCount: 8,
      voucherCount: 650,
      createdAt: '2026-02-10T00:00:00Z',
      storageAllocatedGB: 25,
      storageUsedGB: 8.4,
      maxFileSizeMB: 15,
      storageDriver: 'local',
    },
    {
      id: 't-3',
      name: 'Apex Industries Ltd.',
      subdomain: 'apex',
      gstin: '27AABCF1234F1Z5',
      contactEmail: 'accounts@apexindustries.com',
      contactPhone: '+91 20 4910 8800',
      status: 'ACTIVE',
      subscriptionTier: 'ENTERPRISE',
      monthlyAmount: 25000,
      currency: 'INR',
      userCount: 18,
      voucherCount: 1420,
      createdAt: '2026-01-01T00:00:00Z',
      storageAllocatedGB: 50,
      storageUsedGB: 14.8,
      maxFileSizeMB: 25,
      storageDriver: 'local',
    }
  ]);

  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([
    {
      id: 'inv-s01',
      invoiceNumber: 'SUB-2026-0041',
      tenantId: 't-3',
      tenantName: 'Apex Industries Ltd.',
      subdomain: 'apex',
      amount: 25000,
      taxAmount: 4500,
      totalAmount: 29500,
      status: 'PAID',
      billingPeriod: 'September 2026',
      dueDate: '2026-09-15',
      paidAt: '2026-09-10T11:00:00Z',
      paymentRef: 'HDFC-NEFT-991823'
    },
    {
      id: 'inv-s02',
      invoiceNumber: 'SUB-2026-0042',
      tenantId: 't-2',
      tenantName: 'Zenith Logistics & Supply Co.',
      subdomain: 'zenith',
      amount: 12000,
      taxAmount: 2160,
      totalAmount: 14160,
      status: 'DUE',
      billingPeriod: 'September 2026',
      dueDate: '2026-09-25'
    },
    {
      id: 'inv-s03',
      invoiceNumber: 'SUB-2026-0043',
      tenantId: 't-1',
      tenantName: 'Nova Retail Ventures',
      subdomain: 'novaretail',
      amount: 5000,
      taxAmount: 900,
      totalAmount: 5900,
      status: 'OVERDUE',
      billingPeriod: 'August 2026',
      dueDate: '2026-08-25'
    }
  ]);

  // Enterprise Help Genie Topics with Staging & Version History
  const [helpTopics, setHelpTopics] = useState<EnterpriseHelpTopic[]>(INITIAL_HELP_TOPICS);
  const [cmsFilterCategory, setCmsFilterCategory] = useState<string>('ALL');
  const [cmsSearchTerm, setCmsSearchTerm] = useState<string>('');

  // Modals
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<EnterpriseHelpTopic | null>(null);
  const [reviewingDiffTopic, setReviewingDiffTopic] = useState<EnterpriseHelpTopic | null>(null);
  const [viewingHistoryTopic, setViewingHistoryTopic] = useState<EnterpriseHelpTopic | null>(null);
  const [editingStorageTenant, setEditingStorageTenant] = useState<TenantAccount | null>(null);
  const [storageFormData, setStorageFormData] = useState({
    storageAllocatedGB: 50,
    maxFileSizeMB: 25,
    storageDriver: 'local' as 'local' | 's3' | 'azure',
  });

  // Handle Save Storage Quota
  const handleSaveStorageQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStorageTenant) return;
    setTenants((prev) =>
      prev.map((t) =>
        t.id === editingStorageTenant.id
          ? {
              ...t,
              storageAllocatedGB: storageFormData.storageAllocatedGB,
              maxFileSizeMB: storageFormData.maxFileSizeMB,
              storageDriver: storageFormData.storageDriver,
            }
          : t
      )
    );
    setEditingStorageTenant(null);
  };

  // New / Edit Topic Form State
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    category: 'Vouchers & Accounting' as EnterpriseHelpTopic['category'],
    summary: '',
    stepsText: '',
    shortcutsText: '',
    keywordsText: '',
    tabTarget: 'voucher',
    changeNotes: '',
  });

  const [newTenant, setNewTenant] = useState({
    name: '',
    subdomain: '',
    gstin: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionTier: 'ENTERPRISE' as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
    monthlyAmount: 25000,
  });

  const [newInvoice, setNewInvoice] = useState({
    tenantId: 't-3',
    amount: 25000,
    billingPeriod: 'October 2026',
    dueDate: '2026-10-15',
  });

  // Open Edit Draft Modal
  const handleOpenEditModal = (topic: EnterpriseHelpTopic) => {
    setEditingTopic(topic);
    const contentToEdit = topic.draftContent || topic.publishedContent;
    setTopicFormData({
      title: contentToEdit.title,
      category: topic.category,
      summary: contentToEdit.summary,
      stepsText: contentToEdit.steps.join('\n'),
      shortcutsText: (contentToEdit.shortcuts || []).join(', '),
      keywordsText: topic.keywords.join(', '),
      tabTarget: topic.tabTarget,
      changeNotes: topic.draftContent?.changeNotes || '',
    });
  };

  // Save Draft (Maker Stage)
  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    const steps = topicFormData.stepsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const shortcuts = topicFormData.shortcutsText.split(',').map((s) => s.trim()).filter(Boolean);
    const keywords = topicFormData.keywordsText.split(',').map((s) => s.trim()).filter(Boolean);

    const currentMajor = parseInt(editingTopic.currentLiveVersion.replace('v', '').split('.')[0]) || 1;
    const currentMinor = parseInt(editingTopic.currentLiveVersion.replace('v', '').split('.')[1]) || 0;
    const nextDraftVersion = `v${currentMajor}.${currentMinor + 1} (Draft)`;

    const updatedDraft: HelpTopicVersion = {
      version: nextDraftVersion,
      title: topicFormData.title,
      summary: topicFormData.summary,
      steps,
      shortcuts,
      category: topicFormData.category,
      tabTarget: topicFormData.tabTarget,
      changeNotes: topicFormData.changeNotes || 'Revisions pending approval',
      author: 'Super Admin (Editor)',
      timestamp: new Date().toISOString(),
    };

    setHelpTopics((prev) =>
      prev.map((t) =>
        t.id === editingTopic.id
          ? {
              ...t,
              category: topicFormData.category,
              tabTarget: topicFormData.tabTarget,
              keywords,
              status: 'DRAFT_PENDING_APPROVAL',
              draftContent: updatedDraft,
            }
          : t
      )
    );

    setEditingTopic(null);
  };

  // Approve & Publish Live (Checker Stage)
  const handleApproveAndPublish = (topic: EnterpriseHelpTopic) => {
    if (!topic.draftContent) return;

    const currentMajor = parseInt(topic.currentLiveVersion.replace('v', '').split('.')[0]) || 1;
    const currentMinor = parseInt(topic.currentLiveVersion.replace('v', '').split('.')[1]) || 0;
    const newPublishedVersion = `v${currentMajor}.${currentMinor + 1}`;

    const newlyPublished: HelpTopicVersion = {
      ...topic.draftContent,
      version: newPublishedVersion,
      timestamp: new Date().toISOString(),
      author: 'Super Admin (Approved & Published)',
    };

    setHelpTopics((prev) =>
      prev.map((t) =>
        t.id === topic.id
          ? {
              ...t,
              currentLiveVersion: newPublishedVersion,
              status: 'PUBLISHED',
              publishedContent: newlyPublished,
              draftContent: undefined,
              versionHistory: [topic.publishedContent, ...topic.versionHistory],
            }
          : t
      )
    );

    setReviewingDiffTopic(null);
  };

  // Rollback to Previous Version
  const handleRollback = (topic: EnterpriseHelpTopic, targetVersion: HelpTopicVersion) => {
    const confirm = window.confirm(`Are you sure you want to rollback to ${targetVersion.version}? This will make ${targetVersion.version} the live published version.`);
    if (!confirm) return;

    const rolledBackPublished: HelpTopicVersion = {
      ...targetVersion,
      changeNotes: `Rolled back to snapshot of ${targetVersion.version}`,
      timestamp: new Date().toISOString(),
      author: 'Super Admin (Rollback Action)',
    };

    setHelpTopics((prev) =>
      prev.map((t) =>
        t.id === topic.id
          ? {
              ...t,
              currentLiveVersion: targetVersion.version,
              status: 'PUBLISHED',
              publishedContent: rolledBackPublished,
              draftContent: undefined,
              versionHistory: [topic.publishedContent, ...topic.versionHistory],
            }
          : t
      )
    );

    setViewingHistoryTopic(null);
  };

  // Filtered Topics
  const filteredTopics = helpTopics.filter((t) => {
    if (cmsFilterCategory !== 'ALL' && t.category !== cmsFilterCategory) return false;
    if (cmsSearchTerm) {
      const q = cmsSearchTerm.toLowerCase();
      const matchTitle = t.publishedContent.title.toLowerCase().includes(q);
      const matchSummary = t.publishedContent.summary.toLowerCase().includes(q);
      const matchKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchKeywords;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Standard Platform Owner Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-xs">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Platform Owner & Super Admin Control Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                SaaS Multi-Tenant Hub
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-tenant subdomain routing, SaaS subscription billing, and version-controlled Dynamic Help Genie CMS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddTenantModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Tenant</span>
          </button>
        </div>
      </div>

      {/* Top Platform KPI Scorecards (Executive 360° Benchmark) */}
      {metrics && (
        <KPIGrid columns={4}>
          <KPIScorecard
            label="TOTAL TENANTS"
            value={`${metrics.totalTenants} Orgs`}
            icon={<Building2 className="w-3.5 h-3.5" />}
            badge="SaaS Fleet"
            badgeVariant="indigo"
            footerLeft="Active Status:"
            footerRight={`${metrics.activeTenants} Active`}
          />
          <KPIScorecard
            label="MONTHLY RECURRING REVENUE"
            value={`₹ ${metrics.mrr.toLocaleString('en-IN')}`}
            icon={<CreditCard className="w-3.5 h-3.5" />}
            variant="emerald"
            badge="MRR"
            badgeVariant="emerald"
            footerLeft="Billing Cycle:"
            footerRight="Contracted MRR"
          />
          <KPIScorecard
            label="TOTAL COLLECTED"
            value={`₹ ${metrics.totalCollected.toLocaleString('en-IN')}`}
            icon={<BadgeCheck className="w-3.5 h-3.5" />}
            badge="Settled"
            badgeVariant="blue"
            footerLeft="Collections:"
            footerRight="100% Reconciled"
          />
          <KPIScorecard
            label="OVERDUE SUBSCRIPTIONS"
            value={`₹ ${metrics.overdueAmount.toLocaleString('en-IN')}`}
            icon={<ShieldAlert className="w-3.5 h-3.5" />}
            variant={metrics.overdueAmount > 0 ? 'rose' : 'default'}
            badge="Action Required"
            badgeVariant="rose"
            footerLeft="Notice Queue:"
            footerRight="1 Tenant Pending"
          />
        </KPIGrid>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 flex flex-wrap gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('genie-cms')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'genie-cms'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Dynamic Help Genie CMS & Versioned Knowledge Base ({helpTopics.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'tenants'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Directory & Subdomains ({tenants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription & Billing ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('storage-quotas')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'storage-quotas'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Storage & Quotas (AES-256)</span>
        </button>
      </div>

      {/* TAB 1: Dynamic Help Genie CMS (Enterprise Version-Controlled) */}
      {activeTab === 'genie-cms' && (
        <div className="space-y-6">
          {/* Staging & Workflow Explainer Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white rounded-2xl p-5 border border-indigo-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-black">Enterprise Maker-Checker Versioning & Staging Protocol</h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Zero Downtime Protection
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  When a knowledge topic is edited, changes are safely staged in <strong>Draft (Pending Approval)</strong>. The <strong>previous Live version remains active for all tenants</strong> until approved and published by Super Admin.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                Live Engine: Active
              </span>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search knowledge base across all modules..."
                value={cmsSearchTerm}
                onChange={(e) => setCmsSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1">
              <span className="text-xs font-bold text-slate-400 shrink-0">Module Filter:</span>
              {['ALL', 'Vouchers & Accounting', 'Banking & Reconciliation', 'Cost Centers & P&L', 'Closing & Year-End', 'SOC 2 & Audit Trail'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCmsFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    cmsFilterCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Modules (100% ERP)' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTopics.map((topic) => {
              const hasDraft = topic.status === 'DRAFT_PENDING_APPROVAL' && topic.draftContent;
              const displayContent = topic.publishedContent;

              return (
                <div
                  key={topic.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Category Badge, Version & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {topic.category}
                      </span>

                      <div className="flex items-center space-x-2">
                        {/* Live Version Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Live: {topic.currentLiveVersion}</span>
                        </span>

                        {/* Draft Status Badge */}
                        {hasDraft && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{topic.draftContent?.version} Pending Approval</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Topic Title & Summary */}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {displayContent.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {displayContent.summary}
                      </p>
                    </div>

                    {/* Guided Steps Snippet */}
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 text-xs border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Guided Steps Preview ({displayContent.steps.length} steps):
                      </div>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {displayContent.steps.slice(0, 3).map((step, idx) => (
                          <li key={idx} className="line-clamp-1">{step}</li>
                        ))}
                      </ol>
                      {displayContent.steps.length > 3 && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          + {displayContent.steps.length - 3} more guided steps in Help Genie
                        </div>
                      )}
                    </div>

                    {/* Live Version Author & Timestamp */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <span>Author: {displayContent.author}</span>
                      <span>{displayContent.timestamp.split('T')[0]}</span>
                    </div>

                    {/* Pending Draft Notice if applicable */}
                    {hasDraft && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <div className="font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Draft Revision Awaiting Approval:</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{topic.draftContent?.changeNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingHistoryTopic(topic)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History ({topic.versionHistory.length + 1})</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(topic)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Draft</span>
                      </button>

                      {hasDraft ? (
                        <button
                          type="button"
                          onClick={() => setReviewingDiffTopic(topic)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer animate-bounce"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Review & Publish</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-600 font-bold px-2 py-1">
                          ✓ Published
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Tenant Directory & Subdomains */}
      {activeTab === 'tenants' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Provisioned Tenants</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px] font-mono">
                  <th className="p-3.5">Tenant Company</th>
                  <th className="p-3.5">Subdomain Access</th>
                  <th className="p-3.5">Tier</th>
                  <th className="p-3.5 text-right">Monthly Fee</th>
                  <th className="p-3.5">Encrypted Storage Vault</th>
                  <th className="p-3.5 text-center">Users / Txns</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {tenants.map((t) => {
                  const usedGB = t.storageUsedGB || 0;
                  const allocGB = t.storageAllocatedGB || 25;
                  const pct = Math.min(100, Math.round((usedGB / allocGB) * 100));

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{t.gstin}</div>
                      </td>
                      <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {t.subdomain}.finstaq.com
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800">
                          {t.subscriptionTier}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{t.monthlyAmount.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{usedGB} GB / {allocGB} GB</span>
                            <span className="text-slate-400">{pct}%</span>
                          </div>
                          <div className="w-28 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {t.userCount} users • {t.voucherCount} txns
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStorageTenant(t);
                              setStorageFormData({
                                storageAllocatedGB: t.storageAllocatedGB || 25,
                                maxFileSizeMB: t.maxFileSizeMB || 25,
                                storageDriver: t.storageDriver || 'local',
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                            title="Configure Storage Quota & Limits"
                          >
                            <HardDrive className="w-3.5 h-3.5 inline mr-1" />
                            Storage
                          </button>
                          <button
                            onClick={() => alert(`Tenant ${t.name} status updated.`)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            {t.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Subscription & Billing */}
      {activeTab === 'billing' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Platform SaaS Invoices</h3>
            <button
              onClick={() => setShowAddInvoiceModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
            >
              + Generate Subscription Bill
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px] font-mono">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Tenant Organization</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5 text-right">Base Amount (₹)</th>
                  <th className="p-3.5 text-right">GST 18% (₹)</th>
                  <th className="p-3.5 text-right">Total (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {inv.tenantName} ({inv.subdomain}.finstaq.com)
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{inv.billingPeriod}</td>
                    <td className="p-3.5 text-right font-mono font-semibold">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-mono text-slate-500">₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.status === 'DUE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Encrypted Storage Vault & Multi-Tenant Quotas */}
      {activeTab === 'storage-quotas' && (
        <div className="space-y-6">
          {/* Security & Infrastructure Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <HardDrive className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black">Zero-Trust Encrypted Storage Vault Management</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      AES-256-GCM Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Multi-tenant storage isolation policy. Files are encrypted at rest with per-tenant isolation keys, SHA-256 tamper checksums, and zero public web exposure.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-500/30 text-indigo-300">
                  Default Driver: Local Encrypted Vault (Dev/Self-Hosted)
                </span>
              </div>
            </div>

            {/* Storage Platform Metrics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-indigo-800/40 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Platform Quota</span>
                <div className="font-mono font-black text-lg text-white mt-1">
                  {tenants.reduce((acc, t) => acc + (t.storageAllocatedGB || 0), 0)} GB
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Space Consumed</span>
                <div className="font-mono font-black text-lg text-emerald-400 mt-1">
                  {tenants.reduce((acc, t) => acc + (t.storageUsedGB || 0), 0).toFixed(1)} GB
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Free Available Headroom</span>
                <div className="font-mono font-black text-lg text-indigo-300 mt-1">
                  {(tenants.reduce((acc, t) => acc + (t.storageAllocatedGB || 0), 0) - tenants.reduce((acc, t) => acc + (t.storageUsedGB || 0), 0)).toFixed(1)} GB
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Storage Drivers Supported</span>
                <div className="font-mono font-bold text-xs text-amber-300 mt-1.5">
                  Local / AWS S3 / Azure Blob
                </div>
              </div>
            </div>
          </div>

          {/* Tenants Storage Quota Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Tenant Storage Quotas & Upload Limits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize per-tenant storage caps, single-file size thresholds, and storage drivers.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px] font-mono">
                    <th className="p-3.5">Tenant Organization</th>
                    <th className="p-3.5">Subdomain</th>
                    <th className="p-3.5">Storage Driver</th>
                    <th className="p-3.5 text-right">Allocated Quota</th>
                    <th className="p-3.5 text-right">Used Storage</th>
                    <th className="p-3.5">Utilization Bar</th>
                    <th className="p-3.5 text-center">Max File Size</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {tenants.map((t) => {
                    const usedGB = t.storageUsedGB || 0;
                    const allocGB = t.storageAllocatedGB || 25;
                    const pct = Math.min(100, Math.round((usedGB / allocGB) * 100));

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{t.gstin}</div>
                        </td>
                        <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          {t.subdomain}.finstaq.com
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.storageDriver === 'local' ? '📁 Local Encrypted' : t.storageDriver === 's3' ? '☁️ AWS S3' : '☁️ Azure Blob'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {allocGB} GB
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                          {usedGB} GB
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>{pct}% Used</span>
                              <span>{(allocGB - usedGB).toFixed(1)} GB Free</span>
                            </div>
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {t.maxFileSizeMB || 25} MB
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStorageTenant(t);
                              setStorageFormData({
                                storageAllocatedGB: t.storageAllocatedGB || 25,
                                maxFileSizeMB: t.maxFileSizeMB || 25,
                                storageDriver: t.storageDriver || 'local',
                              });
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Edit Quota</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Draft (Maker Stage) */}
      {editingTopic && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <span>Edit Draft Knowledge Topic</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Editing creates a staged Draft (Pending Review). The live version remains active for users.
                </p>
              </div>
              <button onClick={() => setEditingTopic(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  value={topicFormData.title}
                  onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category / Feature Area</label>
                  <select
                    value={topicFormData.category}
                    onChange={(e) => setTopicFormData({ ...topicFormData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Vouchers & Accounting">Vouchers & Accounting</option>
                    <option value="Masters & Structure">Masters & Structure</option>
                    <option value="Banking & Reconciliation">Banking & Reconciliation</option>
                    <option value="Cost Centers & P&L">Cost Centers & P&L</option>
                    <option value="Procurement & Stores">Procurement & Stores</option>
                    <option value="Inventory & Godowns">Inventory & Godowns</option>
                    <option value="Sales & Invoicing">Sales & Invoicing</option>
                    <option value="HR & Indian Payroll">HR & Indian Payroll</option>
                    <option value="Statutory & Tax Hub">Statutory & Tax Hub</option>
                    <option value="Closing & Year-End">Closing & Year-End</option>
                    <option value="Governance & Approvals">Governance & Approvals</option>
                    <option value="SOC 2 & Audit Trail">SOC 2 & Audit Trail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Take Me There Target Tab</label>
                  <select
                    value={topicFormData.tabTarget}
                    onChange={(e) => setTopicFormData({ ...topicFormData, tabTarget: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="voucher">Voucher Matrix</option>
                    <option value="masters">Master Data Hub</option>
                    <option value="banking">Bank Reconciliation (BRS)</option>
                    <option value="cheques">Cheque & Print Hub</option>
                    <option value="cost-centers">Cost Centers & P&L</option>
                    <option value="financial-reports">Financial Reports</option>
                    <option value="financial-periods">Financial Periods & Closing</option>
                    <option value="procurement">Purchase Operations</option>
                    <option value="sales">Sales Operations</option>
                    <option value="payroll">HR & Payroll</option>
                    <option value="approvals">Maker & Checker</option>
                    <option value="settings">Settings & SOC 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Summary (1-2 sentences)</label>
                <textarea
                  rows={2}
                  required
                  value={topicFormData.summary}
                  onChange={(e) => setTopicFormData({ ...topicFormData, summary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Guided Steps (one per line)</label>
                <textarea
                  rows={5}
                  required
                  value={topicFormData.stepsText}
                  onChange={(e) => setTopicFormData({ ...topicFormData, stepsText: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-amber-700 dark:text-amber-400 font-bold mb-1">
                  Revision Notes / Changelog Summary (Mandatory for Review Gate)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Updated steps to reflect 2026 GST E-Way Bill threshold changes"
                  value={topicFormData.changeNotes}
                  onChange={(e) => setTopicFormData({ ...topicFormData, changeNotes: e.target.value })}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Staged Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Diff Review & Approval Gate (Checker Stage) */}
      {reviewingDiffTopic && reviewingDiffTopic.draftContent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Maker-Checker Approval & Diff Review
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Pre-Publish Verification
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compare currently live {reviewingDiffTopic.currentLiveVersion} vs proposed {reviewingDiffTopic.draftContent.version} before publishing.
                </p>
              </div>
              <button onClick={() => setReviewingDiffTopic(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Change Summary Alert */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300">Proposed Change Summary:</span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{reviewingDiffTopic.draftContent.changeNotes}</p>
            </div>

            {/* Side-by-Side Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left: Currently Live Version */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Current Live Version ({reviewingDiffTopic.currentLiveVersion})</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Serving all tenants</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Title</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{reviewingDiffTopic.publishedContent.title}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Summary</span>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{reviewingDiffTopic.publishedContent.summary}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Guided Steps ({reviewingDiffTopic.publishedContent.steps.length})</span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300 mt-1">
                    {reviewingDiffTopic.publishedContent.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Right: Proposed Draft Version */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border-2 border-emerald-500/50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Proposed New Revision ({reviewingDiffTopic.draftContent.version})</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Staged</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Title</span>
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">{reviewingDiffTopic.draftContent.title}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Summary</span>
                  <div className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">{reviewingDiffTopic.draftContent.summary}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Guided Steps ({reviewingDiffTopic.draftContent.steps.length})</span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-900 dark:text-slate-100 mt-1 font-semibold">
                    {reviewingDiffTopic.draftContent.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Approving will immediately promote this draft to Live and archive the previous version.
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setReviewingDiffTopic(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold"
                >
                  Reject / Close
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveAndPublish(reviewingDiffTopic)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center space-x-2"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Approve & Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Version History & Rollback Modal */}
      {viewingHistoryTopic && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <span>Version History & Rollback: {viewingHistoryTopic.publishedContent.title}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect historical publication snapshots and rollback to any previous version.
                </p>
              </div>
              <button onClick={() => setViewingHistoryTopic(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Current Live Item */}
              <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                    <span>Version {viewingHistoryTopic.currentLiveVersion} (Currently Live)</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{viewingHistoryTopic.publishedContent.timestamp.split('T')[0]}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{viewingHistoryTopic.publishedContent.summary}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Published By: {viewingHistoryTopic.publishedContent.author}
                </div>
              </div>

              {/* Past Snapshots */}
              {viewingHistoryTopic.versionHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  No previous versions archived yet. This is the initial publication.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Archived Releases:</div>
                  {viewingHistoryTopic.versionHistory.map((hist, hIdx) => (
                    <div key={hIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Version {hist.version}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{hist.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{hist.summary}</p>
                      <div className="text-[11px] text-slate-400 font-mono italic">
                        Notes: {hist.changeNotes || 'Standard update'} • By {hist.author}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRollback(viewingHistoryTopic, hist)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rollback to {hist.version}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Onboard Tenant */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Provision New SaaS Tenant Organization</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowAddTenantModal(false); alert('Tenant provisioned successfully.'); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bharat Dynamics Technologies Pvt Ltd"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Dedicated Subdomain</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="bharatdyn"
                    value={newTenant.subdomain}
                    onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value.toLowerCase() })}
                    className="flex-1 p-2.5 rounded-l-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                  <span className="p-2.5 bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-300 dark:border-slate-700 rounded-r-xl text-slate-500 font-mono text-xs">
                    .finstaq.com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tenant GSTIN</label>
                  <input
                    type="text"
                    required
                    placeholder="27AAACB1234F1Z9"
                    value={newTenant.gstin}
                    onChange={(e) => setNewTenant({ ...newTenant, gstin: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono uppercase text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Plan Tier</label>
                  <select
                    value={newTenant.subscriptionTier}
                    onChange={(e) => setNewTenant({ ...newTenant, subscriptionTier: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="STARTER">STARTER (₹5,000/mo)</option>
                    <option value="PROFESSIONAL">PROFESSIONAL (₹12,000/mo)</option>
                    <option value="ENTERPRISE">ENTERPRISE (₹25,000/mo)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Generate Invoice */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Generate Subscription Invoice</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowAddInvoiceModal(false); alert('Invoice generated.'); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Tenant</label>
                <select
                  value={newInvoice.tenantId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, tenantId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain}.finstaq.com)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Base Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Billing Period</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.billingPeriod}
                    onChange={(e) => setNewInvoice({ ...newInvoice, billingPeriod: e.target.value })}
                    placeholder="October 2026"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Edit Tenant Storage Quota & Driver Limits */}
      {editingStorageTenant && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tenant Storage Allocation & Quotas
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingStorageTenant.name} ({editingStorageTenant.subdomain}.finstaq.com)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStorageTenant(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStorageQuota} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Zero-Trust Encryption Active (AES-256-GCM)</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Tenant files are isolated at <span className="font-mono font-bold">data/vault/tenants/{editingStorageTenant.id}/</span> with unique cryptographic salt and checksum validation.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Allocated Storage Cap (in GB)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={storageFormData.storageAllocatedGB}
                    onChange={(e) =>
                      setStorageFormData({
                        ...storageFormData,
                        storageAllocatedGB: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm"
                  />
                  <span className="font-mono text-slate-400 font-bold text-xs">GB</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Currently used: {editingStorageTenant.storageUsedGB || 0} GB</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Max Single File Upload Size (in MB)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={storageFormData.maxFileSizeMB}
                    onChange={(e) =>
                      setStorageFormData({
                        ...storageFormData,
                        maxFileSizeMB: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm"
                  />
                  <span className="font-mono text-slate-400 font-bold text-xs">MB</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Prevents server memory spikes & large upload DoS.</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Storage Backend Driver
                </label>
                <select
                  value={storageFormData.storageDriver}
                  onChange={(e) =>
                    setStorageFormData({
                      ...storageFormData,
                      storageDriver: e.target.value as any,
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="local">📁 Local Encrypted Disk Vault (Dev / On-Premise / Localhost)</option>
                  <option value="s3">☁️ AWS S3 Encrypted Bucket (SSE-KMS / IAM Isolated)</option>
                  <option value="azure">☁️ Azure Blob Storage (Customer-Managed Key / Encrypted)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStorageTenant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Update Quota Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
