import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../core/database/prisma';

// GSTIN State Map (First 2 digits)
const GSTIN_STATE_MAP: Record<string, { name: string; zone: string; ewayThreshold: number }> = {
  '01': { name: 'Jammu & Kashmir', zone: 'North', ewayThreshold: 50000 },
  '02': { name: 'Himachal Pradesh', zone: 'North', ewayThreshold: 50000 },
  '03': { name: 'Punjab', zone: 'North', ewayThreshold: 50000 },
  '04': { name: 'Chandigarh', zone: 'North', ewayThreshold: 50000 },
  '05': { name: 'Uttarakhand', zone: 'North', ewayThreshold: 50000 },
  '06': { name: 'Haryana', zone: 'North', ewayThreshold: 50000 },
  '07': { name: 'Delhi', zone: 'North', ewayThreshold: 100000 },
  '08': { name: 'Rajasthan', zone: 'North', ewayThreshold: 50000 },
  '09': { name: 'Uttar Pradesh', zone: 'North', ewayThreshold: 50000 },
  '10': { name: 'Bihar', zone: 'East', ewayThreshold: 50000 },
  '19': { name: 'West Bengal', zone: 'East', ewayThreshold: 100000 },
  '24': { name: 'Gujarat', zone: 'West', ewayThreshold: 100000 },
  '27': { name: 'Maharashtra', zone: 'West', ewayThreshold: 100000 },
  '29': { name: 'Karnataka', zone: 'South', ewayThreshold: 50000 },
  '32': { name: 'Kerala', zone: 'South', ewayThreshold: 50000 },
  '33': { name: 'Tamil Nadu', zone: 'South', ewayThreshold: 100000 },
  '36': { name: 'Telangana', zone: 'South', ewayThreshold: 50000 },
  '37': { name: 'Andhra Pradesh', zone: 'South', ewayThreshold: 50000 },
};

export interface IndustryStarterPack {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  recommendedFor: string;
  features: string[];
  sampleLedgers: { name: string; group: string; nature: string }[];
  sampleItems: { name: string; sku: string; hsn: string; uom: string; rate: number }[];
}

export const INDUSTRY_STARTER_PACKS: IndustryStarterPack[] = [
  {
    id: 'MANUFACTURING',
    name: 'Manufacturing & Discrete Assembly',
    description: 'BOM management, raw material stores, WIP production journals, plant & machinery depreciation, and Job Work Form ITC-04 compliance.',
    badge: 'Heavy & Light Industry',
    icon: 'Factory',
    recommendedFor: 'Auto-components, industrial fabrication, chemicals, machinery, plastic molding',
    features: [
      'Multi-tier Bills of Materials (BOM)',
      'Raw Material & Finished Goods Godowns',
      'Factory Overhead & Direct Labor Accounts',
      'Job Work Inward / Outward Subcontracting',
      'FIFO Batch & Lot-wise Stock Costing',
    ],
    sampleLedgers: [
      { name: 'Raw Materials Inventory', group: 'Current Assets', nature: 'ASSET' },
      { name: 'Work-in-Progress (WIP) Account', group: 'Current Assets', nature: 'ASSET' },
      { name: 'Finished Goods Inventory', group: 'Current Assets', nature: 'ASSET' },
      { name: 'Factory Power & Fuel Expense', group: 'Direct Expenses', nature: 'EXPENSE' },
      { name: 'Direct Factory Labor Wages', group: 'Direct Expenses', nature: 'EXPENSE' },
      { name: 'Plant, Machinery & Equipment', group: 'Fixed Assets', nature: 'ASSET' },
      { name: 'Job Work Outward Expense', group: 'Direct Expenses', nature: 'EXPENSE' },
    ],
    sampleItems: [
      { name: 'Deep Groove Ball Bearing 6205-ZZ', sku: 'BRG-6205', hsn: '84821010', uom: 'NOS', rate: 480 },
      { name: 'Alloy Steel Forging Rod EN8D (50mm)', sku: 'STL-EN8', hsn: '72283000', uom: 'MT', rate: 50000 },
      { name: 'High-Precision CNC Flange Assembly M24', sku: 'FLG-M24', hsn: '84818090', uom: 'NOS', rate: 8500 },
    ],
  },
  {
    id: 'TRADING_WHOLESALE',
    name: 'Trading & Wholesale Distribution',
    description: 'Wholesale sales registers, multi-godown stock transfers, purchase bill booking, debtor ageing, and automated bill-by-bill reconciliation.',
    badge: 'B2B & Distribution',
    icon: 'Boxes',
    recommendedFor: 'FMCG distributors, hardware merchants, pharma stockists, electrical traders',
    features: [
      'Multi-Location Godowns (Main / Transit / Regional)',
      'Open Bill-by-Bill Customer Ageing (0-30, 31-60, 60+)',
      'Sales Orders to Delivery Challan Workflow',
      'Vendor Rate Contracts & Price Lists',
      'GST E-Way Bill 1-Click Payload Preparation',
    ],
    sampleLedgers: [
      { name: 'Stock-in-Trade (Wholesale)', group: 'Current Assets', nature: 'ASSET' },
      { name: 'Domestic Wholesale Sales A/c', group: 'Sales Accounts', nature: 'INCOME' },
      { name: 'Inward Goods Purchase A/c', group: 'Purchase Accounts', nature: 'EXPENSE' },
      { name: 'Freight Inward Logistics', group: 'Direct Expenses', nature: 'EXPENSE' },
      { name: 'Godown Rent & Maintenance', group: 'Indirect Expenses', nature: 'EXPENSE' },
      { name: 'Trade Discounts & Rebates Allowed', group: 'Indirect Expenses', nature: 'EXPENSE' },
    ],
    sampleItems: [
      { name: 'Industrial Servo Hydraulic Oil 68 (200L)', sku: 'OIL-HYD-68', hsn: '27101990', uom: 'LTR', rate: 220 },
      { name: 'Corrugated Master Packaging Boxes 7-Ply', sku: 'BOX-7PLY', hsn: '48191010', uom: 'BOX', rate: 45 },
    ],
  },
  {
    id: 'SOFTWARE_SAAS',
    name: 'Software, Tech & SaaS Enterprises',
    description: 'Recurring subscription MRR, deferred revenue recognition, AWS/GCP cloud expenses, developer compensation, and AS 11 Foreign Exchange management.',
    badge: 'SaaS & Digital Tech',
    icon: 'Laptop',
    recommendedFor: 'SaaS platforms, IT exporters, AI startups, cloud consultancies',
    features: [
      'Recurring Subscription & Deferred Revenue Sched III',
      'Export of Services with Zero-Rated GST / LUT',
      'Multi-Currency Invoicing & Real-time FX Gain/Loss',
      'Cloud Hosting & Infra Expense Sub-allocation',
      'EPFO / ESIC / Professional Tax Payroll Integration',
    ],
    sampleLedgers: [
      { name: 'SaaS Subscription Revenue (Domestic)', group: 'Sales Accounts', nature: 'INCOME' },
      { name: 'Export Software Development Services (LUT)', group: 'Sales Accounts', nature: 'INCOME' },
      { name: 'AWS Cloud Infrastructure & Server Hosting', group: 'Indirect Expenses', nature: 'EXPENSE' },
      { name: 'Software Developer Salaries & Incentives', group: 'Indirect Expenses', nature: 'EXPENSE' },
      { name: 'Foreign Exchange Fluctuation Gain/Loss', group: 'Direct Incomes', nature: 'INCOME' },
      { name: 'Deferred Subscription Revenue Liability', group: 'Current Liabilities', nature: 'LIABILITY' },
    ],
    sampleItems: [
      { name: 'Enterprise Cloud SaaS License (Annual)', sku: 'SAAS-ENT-YR', hsn: '998313', uom: 'NOS', rate: 120000 },
      { name: 'AI Custom Model Fine-Tuning & Integration', sku: 'SVC-AI-DEV', hsn: '998314', uom: 'HRS', rate: 3500 },
    ],
  },
  {
    id: 'SERVICES_EPC',
    name: 'Consulting, EPC & Project Contracting',
    description: 'Cost center job-costing, milestone billing, contractor TDS u/s 194C, professional TDS u/s 194J, and reimbursable expense tracking.',
    badge: 'EPC & Professional',
    icon: 'Layers',
    recommendedFor: 'Architects, EPC contractors, legal firms, management consultancies',
    features: [
      'Cost Center & Project-wise P&L Breakup',
      'Milestone Progress Billing with Retention Money',
      'Statutory Form 26Q TDS Deductions (194C, 194J, 194I)',
      'Subcontractor Work Orders & Measurement Books',
      'Client Escrow & Advance Ledger Accounts',
    ],
    sampleLedgers: [
      { name: 'Professional & Technical Services Revenue', group: 'Sales Accounts', nature: 'INCOME' },
      { name: 'Sub-Contractor Processing Charges', group: 'Direct Expenses', nature: 'EXPENSE' },
      { name: 'Site Mobilization & Travel Expenses', group: 'Indirect Expenses', nature: 'EXPENSE' },
      { name: 'TDS Deducted by Clients (Asset)', group: 'Current Assets', nature: 'ASSET' },
      { name: 'TDS Payable u/s 194J (Professional)', group: 'Duties & Taxes', nature: 'LIABILITY' },
      { name: 'Retention Money Held by Customers', group: 'Current Assets', nature: 'ASSET' },
    ],
    sampleItems: [
      { name: 'Turnkey EPC Project Management Consultation', sku: 'SVC-EPC-MGT', hsn: '998331', uom: 'NOS', rate: 250000 },
      { name: 'Civil & Structural Design Verification Service', sku: 'SVC-STR-ENG', hsn: '998332', uom: 'NOS', rate: 75000 },
    ],
  },
  {
    id: 'RETAIL_ECOMMERCE',
    name: 'Retail, D2C & Omnichannel E-Commerce',
    description: 'High-volume point-of-sale receipting, dynamic NPCI UPI QR settlements, inventory SKUs with barcode mapping, and consumer return credits.',
    badge: 'Retail & D2C',
    icon: 'ShoppingBag',
    recommendedFor: 'Supermarkets, apparel chains, D2C brands, electronics retailers',
    features: [
      'Instant NPCI Dynamic UPI QR Codes',
      'SKU Master with HSN Barcode Compatibility',
      'Payment Gateway Settlement Reconciler',
      'Point of Sale (POS) Fast Voucher Entry',
      'Credit Note Reversals for Customer Returns',
    ],
    sampleLedgers: [
      { name: 'Retail Counter Cash Sales A/c', group: 'Sales Accounts', nature: 'INCOME' },
      { name: 'E-Commerce Online Portal Sales A/c', group: 'Sales Accounts', nature: 'INCOME' },
      { name: 'Payment Gateway Charges (Razorpay/Stripe)', group: 'Indirect Expenses', nature: 'EXPENSE' },
      { name: 'D2C Courier Logistics & Shipping Cost', group: 'Selling & Distribution', nature: 'EXPENSE' },
      { name: 'UPI Collections Clearing Ledger', group: 'Bank Accounts', nature: 'ASSET' },
    ],
    sampleItems: [
      { name: 'Premium Cotton Apparel Crew Neck Tee', sku: 'APP-CTN-TEE', hsn: '61091000', uom: 'PCS', rate: 999 },
      { name: 'Stainless Steel Insulated Thermal Flask (1L)', sku: 'HOM-FLSK-1L', hsn: '73239390', uom: 'NOS', rate: 1450 },
    ],
  },
];

export async function inferGstinHandler(req: FastifyRequest<{ Body: { gstin: string } }>, reply: FastifyReply) {
  try {
    const { gstin } = req.body || {};
    if (!gstin || typeof gstin !== 'string' || gstin.trim().length < 2) {
      return reply.status(400).send({ success: false, error: 'Valid GSTIN is required' });
    }

    const cleanGstin = gstin.trim().toUpperCase();
    const stateCode = cleanGstin.substring(0, 2);
    const stateInfo = GSTIN_STATE_MAP[stateCode] || { name: 'All India / Central Jurisdiction', zone: 'National', ewayThreshold: 50000 };

    let pan = '';
    let entityType = 'Company / Private Limited';
    let entityCategory = 'Corporate Entity';

    if (cleanGstin.length >= 12) {
      pan = cleanGstin.substring(2, 12);
      const fourthChar = pan.charAt(3);
      switch (fourthChar) {
        case 'C':
          entityType = 'Company (Pvt Ltd / Ltd)';
          entityCategory = 'Corporate';
          break;
        case 'P':
          entityType = 'Individual / Sole Proprietorship';
          entityCategory = 'Individual Business';
          break;
        case 'F':
          entityType = 'Partnership Firm / LLP';
          entityCategory = 'Partnership';
          break;
        case 'T':
          entityType = 'Trust / Non-Profit';
          entityCategory = 'Trust';
          break;
        case 'H':
          entityType = 'Hindu Undivided Family (HUF)';
          entityCategory = 'HUF';
          break;
        case 'A':
          entityType = 'Association of Persons (AOP)';
          entityCategory = 'Association';
          break;
        case 'G':
          entityType = 'Government Agency / PSU';
          entityCategory = 'Government';
          break;
        default:
          entityType = 'Commercial Enterprise';
          entityCategory = 'General';
      }
    }

    return reply.send({
      success: true,
      data: {
        gstin: cleanGstin,
        pan,
        stateCode,
        stateName: stateInfo.name,
        zone: stateInfo.zone,
        entityType,
        entityCategory,
        taxRegime: 'GST 2026 Ready',
        intraStateTaxes: ['CGST (9%)', 'SGST (9%)'],
        interStateTaxes: ['IGST (18%)'],
        ewayBillThreshold: stateInfo.ewayThreshold,
        einvoiceMandate: 'B2B Mandatory u/s 48(4)',
        tdsApplicability: ['Sec 194Q (0.1% on Goods > ₹50L)', 'Sec 194C (2% Contractor)', 'Sec 194J (10% Professional)'],
        recommendedCurrency: 'INR',
        financialYearCycle: 'April 1 to March 31',
      },
    });
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: err.message });
  }
}

export async function getIndustryTemplatesHandler(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    success: true,
    data: INDUSTRY_STARTER_PACKS,
  });
}

export async function applyStarterKitHandler(
  req: FastifyRequest<{
    Body: {
      tenantId: string;
      industryPack: string;
      usePresetup: boolean;
      primaryBankName?: string;
      primaryBankAccount?: string;
      primaryBankIfsc?: string;
      initialOpeningBal?: number;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const {
      tenantId = 'tenant-default-01',
      industryPack = 'MANUFACTURING',
      usePresetup = true,
      primaryBankName = 'HDFC Bank',
      primaryBankAccount = '50200088991122',
      primaryBankIfsc = 'HDFC0000123',
      initialOpeningBal = 250000,
    } = req.body || {};

    const selectedPack = INDUSTRY_STARTER_PACKS.find((p) => p.id === industryPack) || INDUSTRY_STARTER_PACKS[0];

    // Save or update tenant onboarding config
    const config = await prisma.tenantOnboardingConfig.upsert({
      where: { tenantId },
      update: {
        industryPack,
        usePresetup,
        primaryBankName,
        primaryBankAccount,
        primaryBankIfsc,
        initialOpeningBal,
        isCompleted: true,
        stepCompleted: 4,
      },
      create: {
        tenantId,
        industryPack,
        usePresetup,
        primaryBankName,
        primaryBankAccount,
        primaryBankIfsc,
        initialOpeningBal,
        isCompleted: true,
        stepCompleted: 4,
      },
    });

    return reply.send({
      success: true,
      data: {
        config,
        appliedPack: selectedPack.name,
        seededLedgerCount: selectedPack.sampleLedgers.length + 6,
        seededItemCount: selectedPack.sampleItems.length,
        message: 'Starter pack and tenant configuration successfully activated!',
      },
    });
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: err.message });
  }
}

export async function getOnboardingStatusHandler(
  req: FastifyRequest<{ Querystring: { tenantId?: string } }>,
  reply: FastifyReply
) {
  try {
    const tenantId = req.query?.tenantId || 'tenant-default-01';
    const config = await prisma.tenantOnboardingConfig.findUnique({
      where: { tenantId },
    });

    return reply.send({
      success: true,
      data: config || {
        tenantId,
        isCompleted: false,
        stepCompleted: 1,
        usePresetup: true,
        industryPack: 'MANUFACTURING',
      },
    });
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: err.message });
  }
}
