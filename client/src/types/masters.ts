export type GroupNature = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface LedgerGroup {
  id: string;
  name: string;
  code?: string;
  parentId?: string | null;
  nature: GroupNature;
  affectsGrossProfit?: boolean;
  isSystem?: boolean;
}

export interface LedgerMaster {
  id: string;
  groupId: string;
  name: string;
  code?: string;
  gstIn?: string | null;
  pan?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  stateCode?: string | null;
  creditPeriodDays?: number;
  creditLimit?: number;
  bankAccount?: string | null;
  ifscCode?: string | null;
  paymentTermId?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CustomerMaster extends LedgerMaster {}
export interface VendorMaster extends LedgerMaster {}

export interface UnitOfMeasurement {
  id: string;
  symbol: string;
  formalName: string;
  uqc?: string;
  decimalPlaces: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ItemCategory {
  id: string;
  name: string;
  code?: string;
  parentId?: string | null;
  defaultHsn?: string;
  defaultTaxRate?: number;
  description?: string;
  isActive?: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactPerson?: string;
  phone?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  category?: string;
  isActive?: boolean;
}

export interface PaymentTerm {
  id: string;
  code: string;
  name: string;
  days: number;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface TaxRateMaster {
  id: string;
  name: string;
  ratePercent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cessPercent?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface HsnDirectoryItem {
  id?: string;
  code: string;
  description: string;
  defaultGstRate: number;
  type: 'GOODS' | 'SERVICES';
}

export interface CurrencyMaster {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  exchangeRate: number;
  isBase?: boolean;
  isActive?: boolean;
}

export interface InventoryItemMaster {
  id: string;
  name: string;
  sku: string;
  category?: string;
  categoryId?: string;
  uomId?: string;
  warehouseId?: string;
  hsnCode?: string;
  taxRatePercent?: number;
  unit: string;
  closingStockQty: number;
  reorderLevel?: number;
  standardCost?: number;
  sellingPrice?: number;
  valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE';
  createdAt?: string;
}

export interface AllMastersBundle {
  uoms: UnitOfMeasurement[];
  categories: ItemCategory[];
  warehouses: Warehouse[];
  costCenters: CostCenter[];
  paymentTerms: PaymentTerm[];
  taxRates: TaxRateMaster[];
  hsnSacCodes: HsnDirectoryItem[];
  currencies: CurrencyMaster[];
  groups: LedgerGroup[];
  ledgers: LedgerMaster[];
  items: InventoryItemMaster[];
  customers: CustomerMaster[];
  vendors: VendorMaster[];
}

export interface TenantConfiguration {
  tenant: {
    id: string;
    name: string;
    gstIn: string;
    taxId: string;
    currency: string;
    stateCode: string;
    stateName: string;
  };
  numberingSeries: {
    salesOrderPrefix: string;
    salesInvoicePrefix: string;
    deliveryChallanPrefix: string;
    purchaseOrderPrefix: string;
    grnPrefix: string;
    receiptPrefix: string;
    paymentPrefix: string;
  };
  statutorySettings: {
    compositionScheme: boolean;
    eWayBillThreshold: number;
    eInvoiceMandatory: boolean;
    reverseChargeMechanismApplicable: boolean;
  };
  users: Array<{
    id: string;
    email: string;
    role: 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    createdAt: string;
  }>;
}
