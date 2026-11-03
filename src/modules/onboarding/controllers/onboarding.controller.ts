import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../core/database/prisma';

const GSTIN_STATE_ROWS = `
01|Jammu & Kashmir|North|50000
02|Himachal Pradesh|North|50000
03|Punjab|North|50000
04|Chandigarh|North|50000
05|Uttarakhand|North|50000
06|Haryana|North|50000
07|Delhi|North|100000
08|Rajasthan|North|50000
09|Uttar Pradesh|North|50000
10|Bihar|East|50000
19|West Bengal|East|100000
24|Gujarat|West|100000
27|Maharashtra|West|100000
29|Karnataka|South|50000
32|Kerala|South|50000
33|Tamil Nadu|South|100000
36|Telangana|South|50000
37|Andhra Pradesh|South|50000
`.trim();

const GSTIN_STATE_MAP: Record<string, { name: string; zone: string; ewayThreshold: number }> = Object.fromEntries(
  GSTIN_STATE_ROWS.split('\n').map((row) => {
    const [code, name, zone, threshold] = row.split('|');
    return [code, { name, zone, ewayThreshold: Number(threshold) }];
  })
);

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

const STARTER_PACK_ROWS = `
P|MANUFACTURING|Manufacturing & Discrete Assembly|BOM management, raw material stores, WIP production journals, plant & machinery depreciation, and Job Work Form ITC-04 compliance.|Heavy & Light Industry|Factory|Auto-components, industrial fabrication, chemicals, machinery, plastic molding
F|Multi-tier Bills of Materials (BOM)
F|Raw Material & Finished Goods Godowns
F|Factory Overhead & Direct Labor Accounts
F|Job Work Inward / Outward Subcontracting
F|FIFO Batch & Lot-wise Stock Costing
L|Raw Materials Inventory|Current Assets|ASSET
L|Work-in-Progress (WIP) Account|Current Assets|ASSET
L|Finished Goods Inventory|Current Assets|ASSET
L|Factory Power & Fuel Expense|Direct Expenses|EXPENSE
L|Direct Factory Labor Wages|Direct Expenses|EXPENSE
L|Plant, Machinery & Equipment|Fixed Assets|ASSET
L|Job Work Outward Expense|Direct Expenses|EXPENSE
I|Deep Groove Ball Bearing 6205-ZZ|BRG-6205|84821010|NOS|480
I|Alloy Steel Forging Rod EN8D (50mm)|STL-EN8|72283000|MT|50000
I|High-Precision CNC Flange Assembly M24|FLG-M24|84818090|NOS|8500
P|TRADING_WHOLESALE|Trading & Wholesale Distribution|Wholesale sales registers, multi-godown stock transfers, purchase bill booking, debtor ageing, and automated bill-by-bill reconciliation.|B2B & Distribution|Boxes|FMCG distributors, hardware merchants, pharma stockists, electrical traders
F|Multi-Location Godowns (Main / Transit / Regional)
F|Open Bill-by-Bill Customer Ageing (0-30, 31-60, 60+)
F|Sales Orders to Delivery Challan Workflow
F|Vendor Rate Contracts & Price Lists
F|GST E-Way Bill 1-Click Payload Preparation
L|Stock-in-Trade (Wholesale)|Current Assets|ASSET
L|Domestic Wholesale Sales A/c|Sales Accounts|INCOME
L|Inward Goods Purchase A/c|Purchase Accounts|EXPENSE
L|Freight Inward Logistics|Direct Expenses|EXPENSE
L|Godown Rent & Maintenance|Indirect Expenses|EXPENSE
L|Trade Discounts & Rebates Allowed|Indirect Expenses|EXPENSE
I|Industrial Servo Hydraulic Oil 68 (200L)|OIL-HYD-68|27101990|LTR|220
I|Corrugated Master Packaging Boxes 7-Ply|BOX-7PLY|48191010|BOX|45
P|SOFTWARE_SAAS|Software, Tech & SaaS Enterprises|Recurring subscription MRR, deferred revenue recognition, AWS/GCP cloud expenses, developer compensation, and AS 11 Foreign Exchange management.|SaaS & Digital Tech|Laptop|SaaS platforms, IT exporters, AI startups, cloud consultancies
F|Recurring Subscription & Deferred Revenue Sched III
F|Export of Services with Zero-Rated GST / LUT
F|Multi-Currency Invoicing & Real-time FX Gain/Loss
F|Cloud Hosting & Infra Expense Sub-allocation
F|EPFO / ESIC / Professional Tax Payroll Integration
L|SaaS Subscription Revenue (Domestic)|Sales Accounts|INCOME
L|Export Software Development Services (LUT)|Sales Accounts|INCOME
L|AWS Cloud Infrastructure & Server Hosting|Indirect Expenses|EXPENSE
L|Software Developer Salaries & Incentives|Indirect Expenses|EXPENSE
L|Foreign Exchange Fluctuation Gain/Loss|Direct Incomes|INCOME
L|Deferred Subscription Revenue Liability|Current Liabilities|LIABILITY
I|Enterprise Cloud SaaS License (Annual)|SAAS-ENT-YR|998313|NOS|120000
I|AI Custom Model Fine-Tuning & Integration|SVC-AI-DEV|998314|HRS|3500
P|SERVICES_EPC|Consulting, EPC & Project Contracting|Cost center job-costing, milestone billing, contractor TDS u/s 194C, professional TDS u/s 194J, and reimbursable expense tracking.|EPC & Professional|Layers|Architects, EPC contractors, legal firms, management consultancies
F|Cost Center & Project-wise P&L Breakup
F|Milestone Progress Billing with Retention Money
F|Statutory Form 26Q TDS Deductions (194C, 194J, 194I)
F|Subcontractor Work Orders & Measurement Books
F|Client Escrow & Advance Ledger Accounts
L|Professional & Technical Services Revenue|Sales Accounts|INCOME
L|Sub-Contractor Processing Charges|Direct Expenses|EXPENSE
L|Site Mobilization & Travel Expenses|Indirect Expenses|EXPENSE
L|TDS Deducted by Clients (Asset)|Current Assets|ASSET
L|TDS Payable u/s 194J (Professional)|Duties & Taxes|LIABILITY
L|Retention Money Held by Customers|Current Assets|ASSET
I|Turnkey EPC Project Management Consultation|SVC-EPC-MGT|998331|NOS|250000
I|Civil & Structural Design Verification Service|SVC-STR-ENG|998332|NOS|75000
P|RETAIL_ECOMMERCE|Retail, D2C & Omnichannel E-Commerce|High-volume point-of-sale receipting, dynamic NPCI UPI QR settlements, inventory SKUs with barcode mapping, and consumer return credits.|Retail & D2C|ShoppingBag|Supermarkets, apparel chains, D2C brands, electronics retailers
F|Instant NPCI Dynamic UPI QR Codes
F|SKU Master with HSN Barcode Compatibility
F|Payment Gateway Settlement Reconciler
F|Point of Sale (POS) Fast Voucher Entry
F|Credit Note Reversals for Customer Returns
L|Retail Counter Cash Sales A/c|Sales Accounts|INCOME
L|E-Commerce Online Portal Sales A/c|Sales Accounts|INCOME
L|Payment Gateway Charges (Razorpay/Stripe)|Indirect Expenses|EXPENSE
L|D2C Courier Logistics & Shipping Cost|Selling & Distribution|EXPENSE
L|UPI Collections Clearing Ledger|Bank Accounts|ASSET
I|Premium Cotton Apparel Crew Neck Tee|APP-CTN-TEE|61091000|PCS|999
I|Stainless Steel Insulated Thermal Flask (1L)|HOM-FLSK-1L|73239390|NOS|1450
`.trim();

function loadStarterPacks(source: string): IndustryStarterPack[] {
  const packs: IndustryStarterPack[] = [];
  let current: IndustryStarterPack | null = null;
  for (const line of source.split('\n')) {
    const [kind, ...parts] = line.split('|');
    if (kind === 'P') {
      current = { id: parts[0], name: parts[1], description: parts[2], badge: parts[3], icon: parts[4], recommendedFor: parts[5], features: [], sampleLedgers: [], sampleItems: [] };
      packs.push(current);
    } else if (current && kind === 'F') {
      current.features.push(parts[0]);
    } else if (current && kind === 'L') {
      current.sampleLedgers.push({ name: parts[0], group: parts[1], nature: parts[2] });
    } else if (current && kind === 'I') {
      current.sampleItems.push({ name: parts[0], sku: parts[1], hsn: parts[2], uom: parts[3], rate: Number(parts[4]) });
    }
  }
  return packs;
}

export const INDUSTRY_STARTER_PACKS: IndustryStarterPack[] = loadStarterPacks(STARTER_PACK_ROWS);

function serverError(reply: FastifyReply, err: unknown) {
  const message = err instanceof Error ? err.message : 'Request failed';
  return reply.status(500).send({ success: false, error: message });
}

function runHandler(reply: FastifyReply, work: () => Promise<unknown>) {
  return work().catch((err) => serverError(reply, err));
}

export function inferGstinHandler(req: FastifyRequest<{ Body: { gstin: string } }>, reply: FastifyReply) {
  return runHandler(reply, async () => {
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
  });
}

export async function getIndustryTemplatesHandler(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    success: true,
    data: INDUSTRY_STARTER_PACKS,
  });
}

export function applyStarterKitHandler(
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
  return runHandler(reply, async () => {
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
    const savedConfig = {
      industryPack,
      usePresetup,
      primaryBankName,
      primaryBankAccount,
      primaryBankIfsc,
      initialOpeningBal,
      isCompleted: true,
      stepCompleted: 4,
    };
    const config = await prisma.tenantOnboardingConfig.upsert({
      where: { tenantId },
      update: savedConfig,
      create: { tenantId, ...savedConfig },
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
  });
}

export function getOnboardingStatusHandler(
  req: FastifyRequest<{ Querystring: { tenantId?: string } }>,
  reply: FastifyReply
) {
  return runHandler(reply, async () => {
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
  });
}
