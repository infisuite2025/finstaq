import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  Keyboard,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  X,
  Compass,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Building,
  Calendar,
  Lock,
  Boxes,
  FileDiff,
  UserCheck,
  TrendingUp,
  ShoppingBag,
  Send,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  Lightbulb,
  ExternalLink,
  Bot
} from 'lucide-react';

export interface HelpTopic {
  id: string;
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
  title: string;
  summary: string;
  keywords: string[];
  steps: string[];
  shortcuts?: string[];
  rulesAndTips?: string[];
  targetTab: string;
  targetActionLabel: string;
}

export const ERP_KNOWLEDGE_BASE: HelpTopic[] = [
  {
    "id": "topic-analytics",
    "category": "Executive Intelligence",
    "title": "Executive 360° Radar & BI Intelligence Command Center",
    "summary": "Monitor real-time cash runway, operating margins, DuPont ROE, working capital cycles, and predictive revenue trends.",
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
    "rulesAndTips": [
      "Executive data refreshes in real-time on every posted ledger transaction with sub-millisecond calculation."
    ],
    "targetTab": "analytics",
    "targetActionLabel": "Open Owner Analytics Hub"
  },
  {
    "id": "topic-masters",
    "category": "Masters & Structure",
    "title": "Master Data Hub (28 Schedule III Groups, Ledgers & Items)",
    "summary": "Manage Chart of Accounts, statutory groups, customer/vendor master profiles with GSTIN validation, and inventory items.",
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
    "rulesAndTips": [
      "Indian GSTIN format is automatically validated against state codes and check-digit algorithms."
    ],
    "targetTab": "masters",
    "targetActionLabel": "Open Master Data Hub"
  },
  {
    "id": "topic-voucher-matrix",
    "category": "Vouchers & Accounting",
    "title": "Voucher Matrix (Single/Double Entry, Bill-Wise & Bank Allocation)",
    "summary": "Post Single-Entry and Double-Entry vouchers (F4 Contra, F5 Payment, F6 Receipt, F7 Journal, F8 Sales, F9 Purchase) with bill allocations.",
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
    "rulesAndTips": [
      "Double-Entry Sanity: System strictly blocks saving un-balanced vouchers where Debit does not equal Credit."
    ],
    "targetTab": "voucher",
    "targetActionLabel": "Open Voucher Matrix"
  },
  {
    "id": "topic-upi-collections",
    "category": "Banking & Treasury",
    "title": "NPCI Dynamic UPI Payments & Instant Reconciliations",
    "summary": "Generate NPCI dynamic QR codes with embedded invoice reference and reconcile incoming customer UPI settlements instantly.",
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
    "rulesAndTips": [
      "Dynamic QR encodes exact paise amounts to eliminate rounding mismatches during reconciliation."
    ],
    "targetTab": "upi",
    "targetActionLabel": "Open UPI Payments Center"
  },
  {
    "id": "topic-pdc-registry",
    "category": "Banking & Treasury",
    "title": "Post-Dated Cheques (PDC) & Maturity Management",
    "summary": "Track incoming and outgoing post-dated cheques, monitor maturity alarms, and regularize to live ledgers upon bank deposit.",
    "keywords": [
      "pdc",
      "post dated cheque",
      "cheque maturity",
      "memoranda",
      "regularization",
      "clearing date",
      "cheque tracking"
    ],
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
    "rulesAndTips": [
      "PDC vouchers remain strictly off-balance-sheet until explicitly regularized on clearing date."
    ],
    "targetTab": "pdc",
    "targetActionLabel": "Open PDC Registry"
  },
  {
    "id": "topic-interest-calculation",
    "category": "Banking & Treasury",
    "title": "Interest Calculation Engine (MSME 18% p.a. Overdue Billing)",
    "summary": "Calculate overdue interest on delayed customer receivables, configure interest slabs, and auto-generate Interest Debit Notes.",
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
    "rulesAndTips": [
      "MSME Development Act 2006 mandates compound interest at 3x RBI repo rate on delayed supplier payments."
    ],
    "targetTab": "interest",
    "targetActionLabel": "Open Interest Engine"
  },
  {
    "id": "topic-banking-brs",
    "category": "Banking & Treasury",
    "title": "Bank Reconciliation (BRS) & Statement Auto-Matching",
    "summary": "Upload bank statements (CSV/OFX), auto-match entries against ERP cash book, and compute statutory BRS balances.",
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
    "rulesAndTips": [
      "Statutory BRS audit reports preserve the exact bank clearing date for audit verification."
    ],
    "targetTab": "banking",
    "targetActionLabel": "Open BRS Workspace"
  },
  {
    "id": "topic-cheque-management",
    "category": "Banking & Treasury",
    "title": "Cheque Book Management & Millimeter Print Calibration",
    "summary": "Register cheque books, issue and void leaves, and calibrate laser/deskjet cheque leaf printing with sub-millimeter precision.",
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
    "rulesAndTips": [
      "CTS-2010 Cheque standards require exact box positioning to prevent bank clearing rejections."
    ],
    "targetTab": "cheques",
    "targetActionLabel": "Open Cheque Hub"
  },
  {
    "id": "topic-cost-centers",
    "category": "Masters & Structure",
    "title": "Cost Centers & Multi-Dimensional Profitability P&L Matrix",
    "summary": "Set up Cost Categories, allocate multi-department expenses, and analyze segment P&L, project margins, and cost variance.",
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
    "rulesAndTips": [
      "Multi-dimensional cost allocation ensures 100% of expense is distributed without unallocated remainder."
    ],
    "targetTab": "cost-centers",
    "targetActionLabel": "Open Cost Centers Hub"
  },
  {
    "id": "topic-forex-multicurrency",
    "category": "Banking & Treasury",
    "title": "Multi-Currency & Forex Hub (AS 11 Gain/Loss)",
    "summary": "Post multi-currency sales/purchases, maintain daily exchange rates, and calculate AS 11 realized/unrealized forex fluctuations.",
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
    "rulesAndTips": [
      "Accounting Standard AS 11 mandates revaluation of all monetary foreign assets/liabilities at closing balance sheet rate."
    ],
    "targetTab": "forex",
    "targetActionLabel": "Open Forex Hub"
  },
  {
    "id": "topic-compliance-tax",
    "category": "Compliance & Tax",
    "title": "Statutory & Tax Hub (GST, E-Invoice, E-Way Bill & TDS/TCS)",
    "summary": "Prepare GSTR-1, GSTR-3B B2B/B2C JSON, generate NIC E-Way Bills & E-Invoices with IRN, and compute TDS Form 26Q / TCS 27EQ.",
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
    "rulesAndTips": [
      "E-Invoicing is mandatory for B2B transactions exceeding turnover thresholds per GST notification."
    ],
    "targetTab": "compliance",
    "targetActionLabel": "Open Statutory & Tax Hub"
  },
  {
    "id": "topic-debit-credit-notes",
    "category": "Vouchers & Accounting",
    "title": "Debit & Credit Notes (GST Section 34 Compliance)",
    "summary": "Issue GST Section 34 compliant Credit Notes (Sales returns, price reductions) and Debit Notes (Purchase returns, rate variance).",
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
    "rulesAndTips": [
      "GST Section 34 requires every credit/debit note to declare the original tax invoice number and date."
    ],
    "targetTab": "notes",
    "targetActionLabel": "Open Debit & Credit Notes Hub"
  },
  {
    "id": "topic-financial-reports",
    "category": "Financial Reports",
    "title": "Financial Reports (Schedule III Balance Sheet, P&L & AS 3 Cash Flow)",
    "summary": "Generate statutory Balance Sheet (Schedule III), Profit & Loss, 3-level drilldown Trial Balance, AS 3 Cash Flow, and Ratio Analysis.",
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
    "rulesAndTips": [
      "Role-based confidentiality: Junior operators are restricted from viewing full company Balance Sheet & P&L."
    ],
    "targetTab": "financial-reports",
    "targetActionLabel": "Open Financial Reports"
  },
  {
    "id": "topic-year-end-closing",
    "category": "Year-End & Periods",
    "title": "Financial Periods, 6-Step Year-End Wizard & Auditor Sync",
    "summary": "Execute SME Guided Year-End Close, P&L zero-reset, carry-forward Balance Sheet with zero difference, and sync ongoing auditor JVs.",
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
    "rulesAndTips": [
      "Zero-Difference Guarantee ensures debit-credit integrity across fiscal years without manual journal errors."
    ],
    "targetTab": "financial-periods",
    "targetActionLabel": "Open Year-End Closing Center"
  },
  {
    "id": "topic-procurement-operations",
    "category": "Procurement & Stores",
    "title": "Procurement Operations & 3-Way Matching (PO vs GRN vs Bill)",
    "summary": "Create Purchase Orders (PO), record Goods Receipt Notes (GRN), perform 3-Way Matching with supplier bills, and manage purchase returns.",
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
    "rulesAndTips": [
      "3-Way Match validation blocks booking vendor payments for unverified or excess deliveries."
    ],
    "targetTab": "procurement",
    "targetActionLabel": "Open Purchase Operations"
  },
  {
    "id": "topic-jobwork-itc04",
    "category": "Procurement & Stores",
    "title": "Job Work, Subcontracting & Form ITC-04 Compliance",
    "summary": "Manage job work outward challans, track semi-finished materials at subcontractor locations, and file statutory Form ITC-04.",
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
    "rulesAndTips": [
      "Under GST Law, inputs sent for job work must return within 1 year, and capital goods within 3 years, else treated as deemed sales."
    ],
    "targetTab": "jobwork",
    "targetActionLabel": "Open Job Work Center"
  },
  {
    "id": "topic-manufacturing-bom",
    "category": "Procurement & Stores",
    "title": "Manufacturing Operations, Multi-Level BOM & Production Journals",
    "summary": "Build multi-level Bill of Materials (BOM), schedule production orders, record assembly manufacturing journals, and analyze standard costing.",
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
    "rulesAndTips": [
      "Production journals preserve item batch numbers and compute per-unit finished goods cost automatically."
    ],
    "targetTab": "manufacturing",
    "targetActionLabel": "Open Manufacturing Hub"
  },
  {
    "id": "topic-stores-inventory",
    "category": "Procurement & Stores",
    "title": "Stores, Godowns & Inventory Valuation (FIFO / Weighted Avg)",
    "summary": "Manage multi-warehouse storage facilities, perform inter-godown stock transfers, monitor reorder levels, and execute stock counts.",
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
    "rulesAndTips": [
      "Stock valuation adheres to AS 2 (Valuation of Inventories) at Lower of Cost or Net Realizable Value."
    ],
    "targetTab": "inventory",
    "targetActionLabel": "Open Stores & Inventory Hub"
  },
  {
    "id": "topic-purchase-reports",
    "category": "Procurement & Stores",
    "title": "Purchase Department Reports & MSME 45-Day Compliance",
    "summary": "Audit Purchase Registers, analyze Vendor Ageing (0-30, 31-60, 61-90, >90 days), and enforce Section 43B(h) MSME 45-day payment rules.",
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
    "rulesAndTips": [
      "Income Tax Act Section 43B(h) disallows deduction of expenses unpaid to MSME suppliers beyond 45 days."
    ],
    "targetTab": "purchase-reports",
    "targetActionLabel": "Open Purchase Reports"
  },
  {
    "id": "topic-payroll-statutory",
    "category": "HR & Indian Payroll",
    "title": "HR Management & Indian Statutory Payroll (EPF, ESIC, PT, TDS)",
    "summary": "Manage employee profiles, biometric attendance, salary structures, EPF (12%), ESIC (0.75%), Professional Tax, and Section 192 TDS.",
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
    "rulesAndTips": [
      "Statutory EPF wage ceiling of ₹15,000 and ESIC limit of ₹21,000 are automatically calculated."
    ],
    "targetTab": "payroll",
    "targetActionLabel": "Open HR & Payroll Hub"
  },
  {
    "id": "topic-sales-operations",
    "category": "Sales & Revenue",
    "title": "Sales Operations, Quotations, Orders & Delivery Challans",
    "summary": "Manage end-to-end sales lifecycle: Quotations, Sales Orders (SO), Delivery Challans (DC), Dispatch Invoices, and Credit Limits.",
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
    "rulesAndTips": [
      "Customer credit limit checks block order processing if outstanding receivables plus new order exceed authorized ceiling."
    ],
    "targetTab": "sales",
    "targetActionLabel": "Open Sales Operations"
  },
  {
    "id": "topic-sales-reports-ageing",
    "category": "Sales & Revenue",
    "title": "Sales Department Reports & Customer Debtors Ageing",
    "summary": "Analyze Sales Registers, drill down into Customer Ageing (0-30, 31-60, 61-90, >90 days), and track unbilled Delivery Challans.",
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
    "rulesAndTips": [
      "Unbilled Delivery Challans report tracks dispatched goods for which tax invoices are yet to be raised."
    ],
    "targetTab": "sales-reports",
    "targetActionLabel": "Open Sales Reports Hub"
  },
  {
    "id": "topic-maker-checker",
    "category": "Approvals & Governance",
    "title": "Maker & Checker Dual Authorization (4-Eyes Governance)",
    "summary": "Configure dual authorization workflows, customize approval monetary thresholds, and prevent single-user payment fraud.",
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
    "rulesAndTips": [
      "Self-Approval Block: A Maker is strictly prohibited from approving their own transaction."
    ],
    "targetTab": "approvals",
    "targetActionLabel": "Open Maker-Checker Center"
  },
  {
    "id": "topic-period-lock",
    "category": "Approvals & Governance",
    "title": "Period Lock, Backdating Controls & Hard Freeze Books",
    "summary": "Freeze closed accounting periods, set backdating grace windows, and block unauthorized retrospective changes to audited books.",
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
    "rulesAndTips": [
      "Audited financial periods cannot be altered without leaving an immutable audit trail entry."
    ],
    "targetTab": "period-lock",
    "targetActionLabel": "Open Period Lock Controls"
  },
  {
    "id": "topic-communication-omni",
    "category": "Approvals & Governance",
    "title": "Communication Hub & Omni Alerts (WhatsApp, Email & SMS)",
    "summary": "Send automated WhatsApp invoices, payment reminders with dynamic UPI links, and broadcast circulars to clients and vendors.",
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
    "rulesAndTips": [
      "Automated payment reminders can reduce debtor DSO (Days Sales Outstanding) by up to 35%."
    ],
    "targetTab": "communication",
    "targetActionLabel": "Open Communication Hub"
  },
  {
    "id": "topic-audit-trail-mca",
    "category": "Compliance & Tax",
    "title": "Audit Trail & Edit Log (MCA 2024 / Companies Act Compliance)",
    "summary": "Inspect tamper-proof before/after JSON diffs, track creation, edits, deletions, user logins, and export statutory audit logs.",
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
    "rulesAndTips": [
      "MCA Audit Trail Rule (Companies Act 2013) mandates that accounting software cannot disable audit logging."
    ],
    "targetTab": "audit-trail",
    "targetActionLabel": "Open MCA Audit Trail"
  },
  {
    "id": "topic-ai-document-ocr",
    "category": "Approvals & Governance",
    "title": "AI Document Review & Intelligent OCR Invoice Scanner",
    "summary": "Scan supplier tax invoices and expense receipts with AI OCR, extract line items, taxes, and vendor details to auto-draft vouchers.",
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
    "rulesAndTips": [
      "AI OCR extracts both digital PDF text and photo receipts with automated GSTIN ledger matching."
    ],
    "targetTab": "document",
    "targetActionLabel": "Open AI Document Review"
  },
  {
    "id": "topic-flutter-mobile",
    "category": "Executive Intelligence",
    "title": "Flutter Mobile App & Executive Smartphone Companion",
    "summary": "Access executive KPIs, approve maker-checker vouchers, record on-the-go receipts, and view live ledger balances on iOS and Android.",
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
    "rulesAndTips": [
      "Mobile session uses biometric passkey authentication and enterprise token encryption."
    ],
    "targetTab": "mobile",
    "targetActionLabel": "Open Mobile Companion"
  },
  {
    "id": "topic-settings-soc2",
    "category": "Approvals & Governance",
    "title": "Settings, Security & SOC 2 Type II Trust Services Matrix",
    "summary": "Configure tenant profile, GSTINs, auto-numbering prefixes, RBAC permissions, and inspect the live SOC 2 Type II Trust Matrix.",
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
    "rulesAndTips": [
      "SOC 2 Type II architecture enforces AES-256 encryption at rest, TLS 1.3 in transit, and continuous audit logging."
    ],
    "targetTab": "settings",
    "targetActionLabel": "Open Settings & Security"
  },
  {
    "id": "topic-super-admin-saas",
    "category": "Approvals & Governance",
    "title": "Platform Control Center (SaaS Owner & Help Genie CMS)",
    "summary": "Manage multi-tenant subscriptions, zero-knowledge privacy isolation, SaaS MRR billing, and version-controlled Help Genie CMS.",
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
    "rulesAndTips": [
      "Zero-Knowledge Architecture ensures Platform Owner manages SaaS metrics without ever accessing tenant financial databases."
    ],
    "targetTab": "super-admin",
    "targetActionLabel": "Open Platform Control Center"
  }
];

export function HelpGenieDrawer({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dynamicTopics, setDynamicTopics] = useState<HelpTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(ERP_KNOWLEDGE_BASE[0]);
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'genie'; text: string; topic?: HelpTopic; timestamp: string }[]
  >([
    {
      sender: 'genie',
      text: 'Namaste! I am your Finstaq ERP Genie & Interactive AI Trainer. I can guide you through every feature in the application—including Bank Reconciliation (BRS), HR & Indian Statutory Payroll (EPF/ESIC/PT), Customer Debtors Ageing, Voucher Matrix, UPI QR, Manufacturing BOM, Year-End Closing, and Maker-Checker governance. Ask me anything or click any quick topic below!',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [customQuestion, setCustomQuestion] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch live custom knowledge topics published by Platform Owner / Super Admin
  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/help/topics')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const mapped: HelpTopic[] = data.data.map((item: any) => ({
              id: item.id,
              category: (item.category || 'Vouchers & Accounting') as HelpTopic['category'],
              title: item.title,
              summary: item.summary || (item.steps && item.steps[0]) || '',
              keywords: item.keywords || [],
              steps: item.steps || [],
              shortcuts: item.shortcuts || [],
              targetTab: item.tabTarget || 'voucher',
              targetActionLabel: `Open ${item.tabTarget || 'Workspace'}`,
            }));
            setDynamicTopics(mapped);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const allTopics = useMemo(() => {
    // Dynamic topics from Super Admin have precedence over default baseline
    const customIds = new Set(dynamicTopics.map((t) => t.id));
    const staticFiltered = ERP_KNOWLEDGE_BASE.filter((t) => !customIds.has(t.id));
    return [...dynamicTopics, ...staticFiltered];
  }, [dynamicTopics]);

  const categories = [
    'ALL',
    'Executive Intelligence',
    'Vouchers & Accounting',
    'Banking & Treasury',
    'Masters & Structure',
    'Procurement & Stores',
    'Sales & Revenue',
    'HR & Indian Payroll',
    'Financial Reports',
    'Year-End & Periods',
    'Compliance & Tax',
    'Approvals & Governance',
  ];

  // Quick feature direct launchers
  const quickPillTopics = [
    { label: '🏦 Bank Reconciliation (BRS)', topicId: 'topic-banking-brs' },
    { label: '👥 HR & Indian Payroll', topicId: 'topic-payroll-statutory' },
    { label: '⚡ UPI Dynamic QR', topicId: 'topic-upi-collections' },
    { label: '📊 Customer Debtors Ageing', topicId: 'topic-sales-reports-ageing' },
    { label: '🛒 3-Way Match POs', topicId: 'topic-procurement-operations' },
    { label: '🏭 Manufacturing & BOM', topicId: 'topic-manufacturing-bom' },
    { label: '📅 Year-End 6-Step Wizard', topicId: 'topic-year-end-closing' },
    { label: '🛡️ Maker-Checker & SOC 2', topicId: 'topic-maker-checker' },
    { label: '💳 CTS-2010 Cheque Print', topicId: 'topic-cheque-management' },
    { label: '📈 Interest Calculation 18%', topicId: 'topic-interest-calculation' },
  ];

  // Robust tokenized & bidirectional fuzzy search
  const filteredTopics = useMemo(() => {
    return allTopics.filter((t) => {
      const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
      const rawQuery = searchQuery.toLowerCase().trim();
      if (!rawQuery) return matchCat;

      const tokens = rawQuery.split(/\s+/).filter(Boolean);
      const titleLower = (t.title || '').toLowerCase();
      const summaryLower = (t.summary || '').toLowerCase();
      const catLower = (t.category || '').toLowerCase();
      const tabLower = (t.targetTab || '').toLowerCase();
      const keywordsLower = (t.keywords || []).map((k) => (k || '').toLowerCase());
      const stepsLower = (t.steps || []).map((s) => (s || '').toLowerCase()).join(' ');

      // Check if all tokens match anywhere in the topic data
      const allTokensMatch = tokens.every((tok) => {
        return (
          titleLower.includes(tok) ||
          summaryLower.includes(tok) ||
          catLower.includes(tok) ||
          tabLower.includes(tok) ||
          keywordsLower.some((k) => k.includes(tok) || tok.includes(k)) ||
          stepsLower.includes(tok)
        );
      });

      return matchCat && allTokensMatch;
    });
  }, [searchQuery, selectedCategory, allTopics]);

  const handleSelectTopic = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'user',
        text: `Tell me about: ${topic.title}`,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        sender: 'genie',
        text: `Here is the complete step-by-step walkthrough for "${topic.title}". You can also click the direct action button below to take you directly to that screen!`,
        topic,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleSelectById = (topicId: string) => {
    const found = allTopics.find((t) => t.id === topicId);
    if (found) {
      handleSelectTopic(found);
    }
  };

  const handleAskCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const q = customQuestion.trim();
    if (!q) return;

    const userMsg = { sender: 'user' as const, text: q, timestamp: new Date().toLocaleTimeString() };
    setCustomQuestion('');

    const qLower = q.toLowerCase();
    const tokens = qLower.split(/\s+/).filter(Boolean);

    // 1. Exact or keyword token match
    let bestMatch: HelpTopic | undefined = allTopics.find((t) => {
      const keywordsLower = (t.keywords || []).map((k) => (k || '').toLowerCase());
      return tokens.some((tok) =>
        keywordsLower.some((k) => k === tok || k.includes(tok) || tok.includes(k))
      );
    });

    // 2. Title, Summary, Category, or Tab match
    if (!bestMatch) {
      bestMatch = allTopics.find((t) => {
        const titleLower = (t.title || '').toLowerCase();
        const summaryLower = (t.summary || '').toLowerCase();
        const catLower = (t.category || '').toLowerCase();
        const tabLower = (t.targetTab || '').toLowerCase();
        return tokens.some((tok) =>
          titleLower.includes(tok) ||
          summaryLower.includes(tok) ||
          catLower.includes(tok) ||
          tabLower.includes(tok)
        );
      });
    }

    let answerText = '';
    if (bestMatch) {
      answerText = `I found the exact guide for you! Here is how to handle "${bestMatch.title}". Follow the numbered steps below:`;
      setSelectedTopic(bestMatch);
    } else {
      bestMatch = allTopics[0];
      answerText = `I understand you are asking about "${q}". In Finstaq ERP, you can perform this by navigating through our Financial Core or Operations modules. Here is a helpful guide from our knowledge base:`;
      setSelectedTopic(bestMatch);
    }

    setChatHistory((prev) => [
      ...prev,
      userMsg,
      {
        sender: 'genie',
        text: answerText,
        topic: bestMatch,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Genie Top Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-tight text-white">Finstaq ERP Help Genie</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AI Trainer & 30-Module Guide
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Instant guidance, live workflow navigation & shortcuts for all 30 sidebar modules
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Dropdown Picker & Filter Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          {/* Search Box & Module Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="relative sm:col-span-7">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search HR, BRS, Payroll, UPI, Ageing, BOM, JVs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
              />
            </div>

            <div className="sm:col-span-5">
              <select
                onChange={(e) => {
                  if (e.target.value) handleSelectById(e.target.value);
                }}
                defaultValue=""
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold cursor-pointer"
              >
                <option value="" disabled>
                  ⚡ Jump to any Sidebar Module...
                </option>
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Action Pills (Highlighting HR, BRS, UPI, Ageing, BOM, etc.) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            <span className="font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Fast Access:</span>
            </span>
            {quickPillTopics.map((pill) => (
              <button
                key={pill.topicId}
                type="button"
                onClick={() => handleSelectById(pill.topicId)}
                className="px-2.5 py-1 rounded-lg font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex space-x-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'ALL' ? '🌟 All 30 Modules' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Chat & Knowledge Viewer */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60 dark:bg-slate-950/60">
          {/* Category-Filtered Guides Grid */}
          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {selectedCategory === 'ALL'
                    ? `All Available Guides (${filteredTopics.length} of 30)`
                    : `${selectedCategory} (${filteredTopics.length} guides):`}
                </span>
              </div>
              <span className="text-[10px] text-indigo-500 font-semibold normal-case">
                Click any card to view detailed walkthrough & hotkeys
              </span>
            </div>

            {filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredTopics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTopic(t)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs group ${
                      selectedTopic?.id === t.id
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between">
                      <span className="truncate">{t.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                      {t.summary}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {t.category}
                      </span>
                      {t.shortcuts && t.shortcuts.length > 0 && (
                        <span className="text-[9px] font-mono font-bold text-indigo-500">
                          {t.shortcuts[0]}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No matching guides found for "{searchQuery}". Type your question below to ask the Genie!
              </div>
            )}
          </div>

          {/* Conversation History */}
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400">
                {msg.sender === 'genie' ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    <span>ERP Trainer Genie</span>
                  </>
                ) : (
                  <span>You</span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                }`}
              >
                <div>{msg.text}</div>

                {/* Render Topic Detailed Card */}
                {msg.topic && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {msg.topic.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {msg.topic.category}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {msg.topic.summary}
                    </p>

                    {/* Numbered Steps */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-850/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Step-by-Step Instructions:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-normal pl-1">
                        {msg.topic.steps.map((step, sIdx) => (
                          <li key={sIdx} className="pl-1">
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Shortcuts & Rules */}
                    {msg.topic.shortcuts && msg.topic.shortcuts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center text-[11px]">
                        <span className="font-bold text-slate-500 flex items-center space-x-1 mr-1">
                          <Keyboard className="w-3 h-3 text-indigo-500" />
                          <span>Shortcuts:</span>
                        </span>
                        {msg.topic.shortcuts.map((sc, scIdx) => (
                          <kbd
                            key={scIdx}
                            className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded font-mono font-bold text-[10px]"
                          >
                            {sc}
                          </kbd>
                        ))}
                      </div>
                    )}

                    {msg.topic.rulesAndTips && msg.topic.rulesAndTips.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                        <div className="font-bold flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Business & Statutory Rules:</span>
                        </div>
                        {msg.topic.rulesAndTips.map((rule, rIdx) => (
                          <div key={rIdx}>• {rule}</div>
                        ))}
                      </div>
                    )}

                    {/* Action Button: Take Me There */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(msg.topic!.targetTab);
                          onClose();
                        }}
                        className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>🚀 Take Me There: {msg.topic.targetActionLabel}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Question Input Form */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form onSubmit={handleAskCustomQuestion} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask Genie a question (e.g., How does BRS work?, HR & Payroll, Debtor Ageing)..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
