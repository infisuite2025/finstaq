import {
  AuditAction,
  GroupNature,
  HsnType,
  InventoryValuationMethod,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { prisma as defaultPrisma } from '../../../core/database/prisma';
import { AppError, NotFoundError } from '../../../core/errors/app-error';
import { AuditLoggerService } from '../../../core/audit/audit-logger';

export interface CreateCustomerDto {
  tenantId: string;
  userId?: string;
  name: string;
  code?: string;
  groupId?: string;
  paymentTermId?: string;
  gstIn?: string;
  pan?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  stateCode?: string;
  creditPeriodDays?: number;
  creditLimit?: number;
  openingBalance?: number;
}

export interface CreateVendorDto {
  tenantId: string;
  userId?: string;
  name: string;
  code?: string;
  groupId?: string;
  paymentTermId?: string;
  gstIn?: string;
  pan?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  stateCode?: string;
  bankAccount?: string;
  ifscCode?: string;
  openingBalance?: number;
}

export interface CreateInventoryItemMasterDto {
  tenantId: string;
  userId?: string;
  name: string;
  sku: string;
  category?: string;
  categoryId?: string;
  uomId?: string;
  warehouseId?: string;
  hsnCode?: string;
  taxRatePercent?: number;
  unit?: string;
  openingStockQty?: number;
  reorderLevel?: number;
  standardCost?: number;
  sellingPrice?: number;
  valuationMethod?: InventoryValuationMethod;
}

export interface CreateLedgerGroupDto {
  tenantId: string;
  userId?: string;
  name: string;
  code?: string;
  parentId?: string;
  nature: GroupNature;
  affectsGrossProfit?: boolean;
}

export interface CreateLedgerDto {
  tenantId: string;
  userId?: string;
  groupId: string;
  name: string;
  code?: string;
  openingBalance?: number;
  gstIn?: string;
  pan?: string;
  stateCode?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CreateUomDto {
  tenantId: string;
  userId?: string;
  symbol: string;
  formalName: string;
  uqc?: string;
  decimalPlaces?: number;
  isDefault?: boolean;
}

export interface CreateItemCategoryDto {
  tenantId: string;
  userId?: string;
  name: string;
  code?: string;
  parentId?: string;
  defaultHsn?: string;
  defaultTaxRate?: number;
  description?: string;
}

export interface CreateWarehouseDto {
  tenantId: string;
  userId?: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactPerson?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface CreateCostCenterDto {
  tenantId: string;
  userId?: string;
  code: string;
  name: string;
  category?: string;
}

export interface CreatePaymentTermDto {
  tenantId: string;
  userId?: string;
  code: string;
  name: string;
  days: number;
  description?: string;
  isDefault?: boolean;
}

export interface CreateTaxRateDto {
  tenantId: string;
  userId?: string;
  name: string;
  ratePercent: number;
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  cessPercent?: number;
  isDefault?: boolean;
}

export interface CreateHsnSacDto {
  tenantId: string;
  userId?: string;
  code: string;
  type?: 'GOODS' | 'SERVICES';
  description: string;
  defaultGstRate?: number;
}

export interface CreateCurrencyDto {
  tenantId: string;
  userId?: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces?: number;
  exchangeRate?: number;
  isBase?: boolean;
}

interface TenantMasterStore {
  uoms: any[];
  categories: any[];
  warehouses: any[];
  costCenters: any[];
  paymentTerms: any[];
  taxRates: any[];
  hsnSacCodes: any[];
  currencies: any[];
  groups: any[];
  ledgers: any[];
  items: any[];
}

function getDefaultMasterStore(tenantId: string): TenantMasterStore {
  return {
    uoms: [
      { id: 'uom-01', tenantId, symbol: 'NOS', formalName: 'Numbers', uqc: 'NOS', decimalPlaces: 0, isDefault: true, isActive: true },
      { id: 'uom-02', tenantId, symbol: 'KGS', formalName: 'Kilograms', uqc: 'KGS', decimalPlaces: 3, isDefault: false, isActive: true },
      { id: 'uom-03', tenantId, symbol: 'PCS', formalName: 'Pieces', uqc: 'PCS', decimalPlaces: 0, isDefault: false, isActive: true },
      { id: 'uom-04', tenantId, symbol: 'MTR', formalName: 'Metres', uqc: 'MTR', decimalPlaces: 2, isDefault: false, isActive: true },
      { id: 'uom-05', tenantId, symbol: 'BOX', formalName: 'Boxes', uqc: 'BOX', decimalPlaces: 0, isDefault: false, isActive: true },
      { id: 'uom-06', tenantId, symbol: 'LTR', formalName: 'Litres', uqc: 'LTR', decimalPlaces: 2, isDefault: false, isActive: true },
      { id: 'uom-07', tenantId, symbol: 'TON', formalName: 'Metric Tonnes', uqc: 'TON', decimalPlaces: 3, isDefault: false, isActive: true },
      { id: 'uom-08', tenantId, symbol: 'SET', formalName: 'Sets', uqc: 'SET', decimalPlaces: 0, isDefault: false, isActive: true },
    ],
    categories: [
      { id: 'cat-01', tenantId, name: 'Finished Goods', code: 'FG', parentId: null, defaultHsn: '8481', defaultTaxRate: 18, description: 'Manufactured products ready for delivery', isActive: true },
      { id: 'cat-02', tenantId, name: 'Raw Materials', code: 'RM', parentId: null, defaultHsn: '7214', defaultTaxRate: 18, description: 'Steel, copper, and base inputs', isActive: true },
      { id: 'cat-03', tenantId, name: 'Consumables & Spares', code: 'CON', parentId: null, defaultHsn: '7318', defaultTaxRate: 18, description: 'Fasteners, oils, gaskets and repair parts', isActive: true },
      { id: 'cat-04', tenantId, name: 'Packaging Materials', code: 'PKG', parentId: null, defaultHsn: '4819', defaultTaxRate: 12, description: 'Cartons, boxes, bubble wraps', isActive: true },
      { id: 'cat-05', tenantId, name: 'Services & AMC', code: 'SRV', parentId: null, defaultHsn: '9983', defaultTaxRate: 18, description: 'Technical, maintenance & consulting services', isActive: true },
    ],
    warehouses: [
      { id: 'wh-01', tenantId, code: 'WH-MAIN', name: 'Main Central Godown (Pune)', address: 'Plot 45, MIDC Bhosari Industrial Area', city: 'Pune', state: 'Maharashtra', pincode: '411026', contactPerson: 'Suresh Patil', phone: '+91 98230 11223', isPrimary: true, isActive: true },
      { id: 'wh-02', tenantId, code: 'WH-RAW', name: 'Raw Material Yard (Chakan)', address: 'Phase II, Chakan Industrial Zone', city: 'Pune', state: 'Maharashtra', pincode: '410501', contactPerson: 'Ramesh Shinde', phone: '+91 98230 44556', isPrimary: false, isActive: true },
      { id: 'wh-03', tenantId, code: 'WH-DISP', name: 'Finished Goods Dispatch Hub (Mumbai)', address: 'Sector 19, Vashi Logistics Park', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703', contactPerson: 'Anil Deshmukh', phone: '+91 98220 77889', isPrimary: false, isActive: true },
    ],
    costCenters: [
      { id: 'cc-01', tenantId, code: 'CC-OPS', name: 'Plant Operations & Manufacturing', category: 'Operations', isActive: true },
      { id: 'cc-02', tenantId, code: 'CC-SALES', name: 'Domestic Sales & Distribution', category: 'Sales', isActive: true },
      { id: 'cc-03', tenantId, code: 'CC-RD', name: 'Engineering & R&D Lab', category: 'R&D', isActive: true },
      { id: 'cc-04', tenantId, code: 'CC-ADM', name: 'Corporate HQ & Administration', category: 'Administration', isActive: true },
    ],
    paymentTerms: [
      { id: 'pt-01', tenantId, code: 'IMM', name: 'Immediate (Due on Receipt)', days: 0, description: 'Cash / Spot payment on invoice generation', isDefault: false, isActive: true },
      { id: 'pt-02', tenantId, code: 'NET15', name: 'Net 15 Days', days: 15, description: 'Payment due within 15 calendar days', isDefault: false, isActive: true },
      { id: 'pt-03', tenantId, code: 'NET30', name: 'Net 30 Days Standard', days: 30, description: 'Standard trade credit term of 30 days', isDefault: true, isActive: true },
      { id: 'pt-04', tenantId, code: 'NET45', name: 'Net 45 Days', days: 45, description: 'Extended credit for enterprise contracts', isDefault: false, isActive: true },
      { id: 'pt-05', tenantId, code: 'NET60', name: 'Net 60 Days', days: 60, description: 'Quarterly supply credit terms', isDefault: false, isActive: true },
      { id: 'pt-06', tenantId, code: 'ADV50', name: '50% Advance + 50% on Delivery', days: 0, description: 'Half advance upfront, balance upon dispatch', isDefault: false, isActive: true },
    ],
    taxRates: [
      { id: 'tax-01', tenantId, name: 'GST 0% (Nil Rated / Exempt)', ratePercent: 0, cgstPercent: 0, sgstPercent: 0, igstPercent: 0, cessPercent: 0, isDefault: false, isActive: true },
      { id: 'tax-02', tenantId, name: 'GST 5% (Essential Goods/GTA)', ratePercent: 5, cgstPercent: 2.5, sgstPercent: 2.5, igstPercent: 5, cessPercent: 0, isDefault: false, isActive: true },
      { id: 'tax-03', tenantId, name: 'GST 12% (Processed Products)', ratePercent: 12, cgstPercent: 6, sgstPercent: 6, igstPercent: 12, cessPercent: 0, isDefault: false, isActive: true },
      { id: 'tax-04', tenantId, name: 'GST 18% (Standard Rate)', ratePercent: 18, cgstPercent: 9, sgstPercent: 9, igstPercent: 18, cessPercent: 0, isDefault: true, isActive: true },
      { id: 'tax-05', tenantId, name: 'GST 28% (Luxury & Demerit)', ratePercent: 28, cgstPercent: 14, sgstPercent: 14, igstPercent: 28, cessPercent: 0, isDefault: false, isActive: true },
    ],
    hsnSacCodes: [
      { id: 'hsn-01', tenantId, code: '8481', type: 'GOODS', description: 'Taps, cocks, valves & industrial fittings', defaultGstRate: 18 },
      { id: 'hsn-02', tenantId, code: '8482', type: 'GOODS', description: 'Ball or roller bearings and assemblies', defaultGstRate: 18 },
      { id: 'hsn-03', tenantId, code: '7318', type: 'GOODS', description: 'Screws, bolts, nuts, rivets, washers', defaultGstRate: 18 },
      { id: 'hsn-04', tenantId, code: '7214', type: 'GOODS', description: 'Bars, rods & billet of alloy/non-alloy steel', defaultGstRate: 18 },
      { id: 'hsn-05', tenantId, code: '4016', type: 'GOODS', description: 'Vulcanised rubber gaskets, washers & O-rings', defaultGstRate: 18 },
      { id: 'hsn-06', tenantId, code: '4819', type: 'GOODS', description: 'Cartons, boxes & packing containers of paper', defaultGstRate: 12 },
      { id: 'hsn-07', tenantId, code: '9983', type: 'SERVICES', description: 'Professional, engineering & management consultancy', defaultGstRate: 18 },
      { id: 'hsn-08', tenantId, code: '9987', type: 'SERVICES', description: 'Maintenance, calibration, repair and installation', defaultGstRate: 18 },
      { id: 'hsn-09', tenantId, code: '9965', type: 'SERVICES', description: 'Goods transport agency (GTA) freight logistics', defaultGstRate: 5 },
    ],
    currencies: [
      { id: 'cur-01', tenantId, code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, exchangeRate: 1.0, isBase: true, isActive: true },
      { id: 'cur-02', tenantId, code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, exchangeRate: 86.50, isBase: false, isActive: true },
      { id: 'cur-03', tenantId, code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, exchangeRate: 92.30, isBase: false, isActive: true },
      { id: 'cur-04', tenantId, code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, exchangeRate: 108.40, isBase: false, isActive: true },
      { id: 'cur-05', tenantId, code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2, exchangeRate: 23.55, isBase: false, isActive: true },
    ],
    groups: [
      { id: 'grp-01', tenantId, name: 'Current Assets', parentId: null, nature: GroupNature.ASSET, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-02', tenantId, name: 'Fixed Assets', parentId: null, nature: GroupNature.ASSET, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-03', tenantId, name: 'Current Liabilities', parentId: null, nature: GroupNature.LIABILITY, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-04', tenantId, name: 'Loans & Borrowings', parentId: null, nature: GroupNature.LIABILITY, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-05', tenantId, name: 'Capital Account', parentId: null, nature: GroupNature.EQUITY, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-06', tenantId, name: 'Direct Incomes', parentId: null, nature: GroupNature.INCOME, affectsGrossProfit: true, isSystem: true },
      { id: 'grp-07', tenantId, name: 'Indirect Incomes', parentId: null, nature: GroupNature.INCOME, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-08', tenantId, name: 'Direct Expenses', parentId: null, nature: GroupNature.EXPENSE, affectsGrossProfit: true, isSystem: true },
      { id: 'grp-09', tenantId, name: 'Indirect Expenses', parentId: null, nature: GroupNature.EXPENSE, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-10', tenantId, name: 'Sundry Debtors', parentId: 'grp-01', nature: GroupNature.ASSET, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-11', tenantId, name: 'Bank Accounts', parentId: 'grp-01', nature: GroupNature.ASSET, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-12', tenantId, name: 'Cash-in-Hand', parentId: 'grp-01', nature: GroupNature.ASSET, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-13', tenantId, name: 'Sundry Creditors', parentId: 'grp-03', nature: GroupNature.LIABILITY, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-14', tenantId, name: 'Duties & Taxes', parentId: 'grp-03', nature: GroupNature.LIABILITY, affectsGrossProfit: false, isSystem: true },
      { id: 'grp-15', tenantId, name: 'Sales Accounts', parentId: 'grp-06', nature: GroupNature.INCOME, affectsGrossProfit: true, isSystem: true },
      { id: 'grp-16', tenantId, name: 'Purchase Accounts', parentId: 'grp-08', nature: GroupNature.EXPENSE, affectsGrossProfit: true, isSystem: true },
    ],
    ledgers: [
      { id: 'led-01', tenantId, groupId: 'grp-15', name: 'Sales Account (Domestic)', code: 'REV-SALES-01', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-02', tenantId, groupId: 'grp-16', name: 'Purchase Account (Raw Material)', code: 'EXP-PUR-01', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-03', tenantId, groupId: 'grp-11', name: 'HDFC Current Bank Account', code: 'BNK-HDFC-01', openingBalance: 1250000, currentBalance: 1250000, bankAccount: '50200012345678', ifscCode: 'HDFC0001234', stateCode: '27', isActive: true },
      { id: 'led-04', tenantId, groupId: 'grp-12', name: 'Main Office Petty Cash', code: 'CSH-MAIN', openingBalance: 50000, currentBalance: 50000, stateCode: '27', isActive: true },
      { id: 'led-05', tenantId, groupId: 'grp-14', name: 'Output CGST', code: 'TAX-CGST-OUT', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-06', tenantId, groupId: 'grp-14', name: 'Output SGST', code: 'TAX-SGST-OUT', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-07', tenantId, groupId: 'grp-14', name: 'Output IGST', code: 'TAX-IGST-OUT', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-08', tenantId, groupId: 'grp-14', name: 'Input CGST', code: 'TAX-CGST-IN', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-09', tenantId, groupId: 'grp-14', name: 'Input SGST', code: 'TAX-SGST-IN', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-10', tenantId, groupId: 'grp-14', name: 'Input IGST', code: 'TAX-IGST-IN', openingBalance: 0, currentBalance: 0, stateCode: '27', isActive: true },
      { id: 'led-11', tenantId, groupId: 'grp-10', name: 'Zenith Tech Systems Pvt Ltd', code: 'CUST-001', gstIn: '27AAACZ1234B1Z2', pan: 'AAACZ1234B', contactPerson: 'Mr. Rajesh Verma', email: 'rajesh@zenithtech.in', phone: '+91 98220 12345', address: 'Plot 12, Hinjewadi Phase 1, Pune', stateCode: '27', creditPeriodDays: 30, creditLimit: 500000, openingBalance: 45000, currentBalance: 45000, isActive: true },
      { id: 'led-12', tenantId, groupId: 'grp-10', name: 'Aero Dynamics & Precision Corp', code: 'CUST-002', gstIn: '27AABCA5678C1Z9', pan: 'AABCA5678C', contactPerson: 'Ms. Anita Kulkarni', email: 'anita@aerocorp.in', phone: '+91 98220 98765', address: 'Gat 104, Chakan MIDC, Pune', stateCode: '27', creditPeriodDays: 45, creditLimit: 1000000, openingBalance: 120000, currentBalance: 120000, isActive: true },
      { id: 'led-13', tenantId, groupId: 'grp-13', name: 'Steel Kraft Components Ltd', code: 'VEND-001', gstIn: '27AAACS4321A1Z5', pan: 'AAACS4321A', contactPerson: 'Vikram Joshi', email: 'orders@steelkraft.com', phone: '+91 98111 22334', address: 'Sector 7, Bhosari Industrial Area, Pune', stateCode: '27', bankAccount: '001105001234', ifscCode: 'ICIC0000011', openingBalance: 85000, currentBalance: 85000, isActive: true },
      { id: 'led-14', tenantId, groupId: 'grp-13', name: 'Global Tech Valves & Polymers', code: 'VEND-002', gstIn: '24AAACG9876K1Z3', pan: 'AAACG9876K', contactPerson: 'Hasmukh Patel', email: 'sales@globalvalves.in', phone: '+91 98980 55667', address: 'GIDC Estate, Vadodara, Gujarat', stateCode: '24', bankAccount: '334455667788', ifscCode: 'SBIN0001234', openingBalance: 140000, currentBalance: 140000, isActive: true },
    ],
    items: [
      { id: 'itm-01', tenantId, name: 'Industrial High Pressure Control Valve DN50', sku: 'VLV-DN50-HP', category: 'Finished Goods', categoryId: 'cat-01', uomId: 'uom-01', warehouseId: 'wh-01', hsnCode: '8481', taxRatePercent: 18, unit: 'NOS', closingStockQty: 48, reorderLevel: 10, standardCost: 850, sellingPrice: 1200, valuationMethod: 'FIFO' },
      { id: 'itm-02', tenantId, name: 'Precision Double Row Ball Bearings 6205-2RS', sku: 'BRG-6205-2RS', category: 'Finished Goods', categoryId: 'cat-01', uomId: 'uom-01', warehouseId: 'wh-01', hsnCode: '8482', taxRatePercent: 18, unit: 'NOS', closingStockQty: 120, reorderLevel: 25, standardCost: 320, sellingPrice: 480, valuationMethod: 'FIFO' },
      { id: 'itm-03', tenantId, name: 'Stainless Steel Fasteners & Hex Bolts M12x50', sku: 'FST-M12-SS', category: 'Consumables & Spares', categoryId: 'cat-03', uomId: 'uom-02', warehouseId: 'wh-02', hsnCode: '7318', taxRatePercent: 18, unit: 'KGS', closingStockQty: 250, reorderLevel: 50, standardCost: 160, sellingPrice: 220, valuationMethod: 'FIFO' },
      { id: 'itm-04', tenantId, name: 'High Tensile Structural Steel Rod 25mm dia', sku: 'STL-ROD-25MM', category: 'Raw Materials', categoryId: 'cat-02', uomId: 'uom-07', warehouseId: 'wh-02', hsnCode: '7214', taxRatePercent: 18, unit: 'TON', closingStockQty: 14.5, reorderLevel: 3, standardCost: 52000, sellingPrice: 62000, valuationMethod: 'FIFO' },
    ],
  };
}

async function getMasterStore(tenantId: string): Promise<TenantMasterStore> {
  const record = await defaultPrisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'TENANT_MASTER_STORE' } }
  });
  if (record && record.value && typeof record.value === 'object') {
    return record.value as unknown as TenantMasterStore;
  }
  const init = getDefaultMasterStore(tenantId);
  try {
    await defaultPrisma.keyValueStore.create({
      data: { tenantId, key: 'TENANT_MASTER_STORE', value: init as any }
    });
  } catch (e) {
    // Concurrent safe
  }
  return init;
}

async function saveMasterStore(tenantId: string, store: TenantMasterStore): Promise<void> {
  await defaultPrisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId, key: 'TENANT_MASTER_STORE' } },
    update: { value: store as any },
    create: { tenantId, key: 'TENANT_MASTER_STORE', value: store as any }
  });
}

export class MastersService {
  public static async getAllMastersBundle(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return {
      uoms: store.uoms,
      categories: store.categories,
      warehouses: store.warehouses,
      costCenters: store.costCenters,
      paymentTerms: store.paymentTerms,
      taxRates: store.taxRates,
      hsnSacCodes: store.hsnSacCodes,
      currencies: store.currencies,
      groups: store.groups,
      ledgers: store.ledgers,
      items: store.items,
      customers: store.ledgers.filter((l) => l.groupId === 'grp-10'),
      vendors: store.ledgers.filter((l) => l.groupId === 'grp-13'),
    };
  }

  public static async getUoms(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.uoms;
  }

  public static async createUom(dto: CreateUomDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.uoms.find((u) => u.symbol.toUpperCase() === dto.symbol.toUpperCase());
    if (existing) {
      throw new AppError('Unit of Measurement "' + dto.symbol + '" already exists', 409);
    }
    const newUom = {
      id: 'uom-' + Date.now(),
      tenantId: dto.tenantId,
      symbol: dto.symbol.toUpperCase(),
      formalName: dto.formalName,
      uqc: dto.uqc ? dto.uqc.toUpperCase() : dto.symbol.toUpperCase(),
      decimalPlaces: dto.decimalPlaces ?? 0,
      isDefault: dto.isDefault ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.uoms.push(newUom);
    await saveMasterStore(dto.tenantId, store);
    return newUom;
  }

  public static async getCategories(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.categories;
  }

  public static async createCategory(dto: CreateItemCategoryDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.categories.find((c) => c.name.toLowerCase() === dto.name.toLowerCase());
    if (existing) {
      throw new AppError('Item Category "' + dto.name + '" already exists', 409);
    }
    const newCat = {
      id: 'cat-' + Date.now(),
      tenantId: dto.tenantId,
      name: dto.name,
      code: dto.code || dto.name.slice(0, 4).toUpperCase(),
      parentId: dto.parentId || null,
      defaultHsn: dto.defaultHsn || '8481',
      defaultTaxRate: dto.defaultTaxRate ?? 18,
      description: dto.description || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.categories.push(newCat);
    await saveMasterStore(dto.tenantId, store);
    return newCat;
  }

  public static async getWarehouses(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.warehouses;
  }

  public static async createWarehouse(dto: CreateWarehouseDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.warehouses.find((w) => w.code.toUpperCase() === dto.code.toUpperCase());
    if (existing) {
      throw new AppError('Warehouse with Code "' + dto.code + '" already exists', 409);
    }
    const newWh = {
      id: 'wh-' + Date.now(),
      tenantId: dto.tenantId,
      code: dto.code.toUpperCase(),
      name: dto.name,
      address: dto.address || '',
      city: dto.city || '',
      state: dto.state || 'Maharashtra',
      pincode: dto.pincode || '',
      contactPerson: dto.contactPerson || '',
      phone: dto.phone || '',
      isPrimary: dto.isPrimary ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.warehouses.push(newWh);
    await saveMasterStore(dto.tenantId, store);
    return newWh;
  }

  public static async getCostCenters(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.costCenters;
  }

  public static async createCostCenter(dto: CreateCostCenterDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.costCenters.find((c) => c.code.toUpperCase() === dto.code.toUpperCase());
    if (existing) {
      throw new AppError('Cost Center code "' + dto.code + '" already exists', 409);
    }
    const newCc = {
      id: 'cc-' + Date.now(),
      tenantId: dto.tenantId,
      code: dto.code.toUpperCase(),
      name: dto.name,
      category: dto.category || 'General',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.costCenters.push(newCc);
    await saveMasterStore(dto.tenantId, store);
    return newCc;
  }

  public static async getPaymentTerms(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.paymentTerms;
  }

  public static async createPaymentTerm(dto: CreatePaymentTermDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.paymentTerms.find((p) => p.code.toUpperCase() === dto.code.toUpperCase());
    if (existing) {
      throw new AppError('Payment Term "' + dto.code + '" already exists', 409);
    }
    const newPt = {
      id: 'pt-' + Date.now(),
      tenantId: dto.tenantId,
      code: dto.code.toUpperCase(),
      name: dto.name,
      days: dto.days,
      description: dto.description || '',
      isDefault: dto.isDefault ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.paymentTerms.push(newPt);
    await saveMasterStore(dto.tenantId, store);
    return newPt;
  }

  public static async getTaxRates(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.taxRates;
  }

  public static async createTaxRate(dto: CreateTaxRateDto) {
    const store = await getMasterStore(dto.tenantId);
    const half = Number(dto.ratePercent) / 2;
    const newTax = {
      id: 'tax-' + Date.now(),
      tenantId: dto.tenantId,
      name: dto.name,
      ratePercent: Number(dto.ratePercent),
      cgstPercent: dto.cgstPercent !== undefined ? Number(dto.cgstPercent) : half,
      sgstPercent: dto.sgstPercent !== undefined ? Number(dto.sgstPercent) : half,
      igstPercent: dto.igstPercent !== undefined ? Number(dto.igstPercent) : Number(dto.ratePercent),
      cessPercent: dto.cessPercent !== undefined ? Number(dto.cessPercent) : 0,
      isDefault: dto.isDefault ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.taxRates.push(newTax);
    await saveMasterStore(dto.tenantId, store);
    return newTax;
  }

  public static async getHsnSacCodes(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.hsnSacCodes;
  }

  public static async createHsnSac(dto: CreateHsnSacDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.hsnSacCodes.find((h) => h.code === dto.code);
    if (existing) {
      throw new AppError('HSN/SAC Code "' + dto.code + '" already exists', 409);
    }
    const newHsn = {
      id: 'hsn-' + Date.now(),
      tenantId: dto.tenantId,
      code: dto.code,
      type: dto.type || 'GOODS',
      description: dto.description,
      defaultGstRate: dto.defaultGstRate ?? 18,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.hsnSacCodes.push(newHsn);
    await saveMasterStore(dto.tenantId, store);
    return newHsn;
  }

  public static async getCurrencies(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.currencies;
  }

  public static async createCurrency(dto: CreateCurrencyDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.currencies.find((c) => c.code.toUpperCase() === dto.code.toUpperCase());
    if (existing) {
      throw new AppError('Currency code "' + dto.code + '" already exists', 409);
    }
    const newCur = {
      id: 'cur-' + Date.now(),
      tenantId: dto.tenantId,
      code: dto.code.toUpperCase(),
      name: dto.name,
      symbol: dto.symbol,
      decimalPlaces: dto.decimalPlaces ?? 2,
      exchangeRate: dto.exchangeRate ?? 1.0,
      isBase: dto.isBase ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.currencies.push(newCur);
    await saveMasterStore(dto.tenantId, store);
    return newCur;
  }

  public static async getLedgerGroups(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.groups;
  }

  public static async createLedgerGroup(dto: CreateLedgerGroupDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.groups.find((g) => g.name.toLowerCase() === dto.name.toLowerCase());
    if (existing) {
      throw new AppError('Account Group "' + dto.name + '" already exists', 409);
    }
    const newGrp = {
      id: 'grp-' + Date.now(),
      tenantId: dto.tenantId,
      name: dto.name,
      code: dto.code || dto.name.slice(0, 4).toUpperCase(),
      parentId: dto.parentId || null,
      nature: dto.nature,
      affectsGrossProfit: dto.affectsGrossProfit ?? false,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.groups.push(newGrp);
    await saveMasterStore(dto.tenantId, store);
    return newGrp;
  }

  public static async getLedgers(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.ledgers;
  }

  public static async createLedger(dto: CreateLedgerDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.ledgers.find((l) => l.name.toLowerCase() === dto.name.toLowerCase());
    if (existing) {
      throw new AppError('Ledger with name "' + dto.name + '" already exists', 409);
    }
    const newLedger = {
      id: 'led-' + Date.now(),
      tenantId: dto.tenantId,
      groupId: dto.groupId,
      name: dto.name,
      code: dto.code || ('LED-' + Date.now().toString().slice(-4)),
      openingBalance: dto.openingBalance ?? 0,
      currentBalance: dto.openingBalance ?? 0,
      gstIn: dto.gstIn || null,
      pan: dto.pan || null,
      stateCode: dto.stateCode || (dto.gstIn ? dto.gstIn.slice(0, 2) : '27'),
      phone: dto.phone || null,
      email: dto.email || null,
      address: dto.address || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.ledgers.push(newLedger);
    await saveMasterStore(dto.tenantId, store);
    return newLedger;
  }

  public static async getCustomers(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.ledgers.filter((l) => l.groupId === 'grp-10');
  }

  public static async createCustomer(dto: CreateCustomerDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.ledgers.find((l) => l.name.toLowerCase() === dto.name.toLowerCase());
    if (existing) {
      throw new AppError('Customer "' + dto.name + '" already exists', 409);
    }
    const opBal = dto.openingBalance ?? 0;
    const customer = {
      id: 'led-' + Date.now(),
      tenantId: dto.tenantId,
      groupId: dto.groupId || 'grp-10',
      name: dto.name,
      code: dto.code || ('CUST-' + Date.now().toString().slice(-4)),
      gstIn: dto.gstIn || null,
      pan: dto.pan || (dto.gstIn && dto.gstIn.length >= 12 ? dto.gstIn.slice(2, 12) : null),
      contactPerson: dto.contactPerson || null,
      email: dto.email || null,
      phone: dto.phone || null,
      address: dto.address || null,
      stateCode: dto.stateCode || (dto.gstIn ? dto.gstIn.slice(0, 2) : '27'),
      creditPeriodDays: dto.creditPeriodDays ?? 30,
      creditLimit: dto.creditLimit ?? 0,
      paymentTermId: dto.paymentTermId || 'pt-03',
      openingBalance: opBal,
      currentBalance: opBal,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.ledgers.push(customer);
    await saveMasterStore(dto.tenantId, store);
    return customer;
  }

  public static async getVendors(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.ledgers.filter((l) => l.groupId === 'grp-13');
  }

  public static async createVendor(dto: CreateVendorDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.ledgers.find((l) => l.name.toLowerCase() === dto.name.toLowerCase());
    if (existing) {
      throw new AppError('Vendor "' + dto.name + '" already exists', 409);
    }
    const opBal = dto.openingBalance ?? 0;
    const vendor = {
      id: 'led-' + Date.now(),
      tenantId: dto.tenantId,
      groupId: dto.groupId || 'grp-13',
      name: dto.name,
      code: dto.code || ('VEND-' + Date.now().toString().slice(-4)),
      gstIn: dto.gstIn || null,
      pan: dto.pan || (dto.gstIn && dto.gstIn.length >= 12 ? dto.gstIn.slice(2, 12) : null),
      contactPerson: dto.contactPerson || null,
      email: dto.email || null,
      phone: dto.phone || null,
      address: dto.address || null,
      stateCode: dto.stateCode || (dto.gstIn ? dto.gstIn.slice(0, 2) : '27'),
      bankAccount: dto.bankAccount || null,
      ifscCode: dto.ifscCode || null,
      paymentTermId: dto.paymentTermId || 'pt-03',
      openingBalance: opBal,
      currentBalance: opBal,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.ledgers.push(vendor);
    await saveMasterStore(dto.tenantId, store);
    return vendor;
  }

  public static async getInventoryItems(tenantId: string) {
    const store = await getMasterStore(tenantId);
    return store.items;
  }

  public static async createInventoryItem(dto: CreateInventoryItemMasterDto) {
    const store = await getMasterStore(dto.tenantId);
    const existing = store.items.find((i) => i.sku.toUpperCase() === dto.sku.toUpperCase());
    if (existing) {
      throw new AppError('Item SKU "' + dto.sku + '" already exists', 409);
    }
    const item = {
      id: 'itm-' + Date.now(),
      tenantId: dto.tenantId,
      name: dto.name,
      sku: dto.sku.toUpperCase(),
      category: dto.category || 'General Finished Goods',
      categoryId: dto.categoryId || 'cat-01',
      uomId: dto.uomId || 'uom-01',
      warehouseId: dto.warehouseId || 'wh-01',
      hsnCode: dto.hsnCode || '8481',
      taxRatePercent: dto.taxRatePercent ?? 18,
      unit: dto.unit || 'NOS',
      closingStockQty: dto.openingStockQty ?? 0,
      reorderLevel: dto.reorderLevel ?? 10,
      standardCost: dto.standardCost ?? 0,
      sellingPrice: dto.sellingPrice ?? 0,
      valuationMethod: dto.valuationMethod || 'FIFO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.items.push(item);
    await saveMasterStore(dto.tenantId, store);
    return item;
  }

  public static async getTenantConfigurations(tenantId: string) {
    return {
      tenant: {
        id: tenantId,
        name: 'Apex Industries Ltd.',
        gstIn: '27AABCF1234F1Z5',
        taxId: 'AAACF1234F',
        currency: 'INR',
        stateCode: '27',
        stateName: 'Maharashtra',
      },
      numberingSeries: {
        salesOrderPrefix: 'SO-2026-',
        salesInvoicePrefix: 'INV-2026-',
        deliveryChallanPrefix: 'DC-OUT-',
        purchaseOrderPrefix: 'PO-2026-',
        grnPrefix: 'GRN-2026-',
        receiptPrefix: 'RCT-',
        paymentPrefix: 'PMT-',
      },
      statutorySettings: {
        compositionScheme: false,
        eWayBillThreshold: 50000,
        eInvoiceMandatory: false,
        reverseChargeMechanismApplicable: false,
      },
      users: [
        { id: 'usr-owner-001', email: 'owner@apexindustries.com', role: 'OWNER', firstName: 'Vikram', lastName: 'Singhania', isActive: true },
        { id: 'usr-acct-001', email: 'accountant@apexindustries.com', role: 'ACCOUNTANT', firstName: 'Meera', lastName: 'Nair', isActive: true },
        { id: 'usr-entry-002', email: 'clerk@apexindustries.com', role: 'DATA_ENTRY', firstName: 'Rohan', lastName: 'Sharma', isActive: true },
      ],
    };
  }

  public static async getStandardHsnDirectory() {
    const store = await getMasterStore('default');
    return store.hsnSacCodes;
  }
}
