export type VoucherType =
  | 'RECEIPT'
  | 'PAYMENT'
  | 'JOURNAL'
  | 'CONTRA'
  | 'SALES'
  | 'PURCHASE';

export type EntryType = 'Dr' | 'Cr';

export type SupplyType = 'INTRASTATE' | 'INTERSTATE' | 'EXPORT';

export interface LedgerOption {
  id: string;
  name: string;
  code?: string;
  currentBalance: number;
  groupName: string;
  nature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  gstin?: string;
  stateCode?: string;
  address?: string;
  paymentTermsDays?: number;
}

export interface LedgerGroupOption {
  id: string;
  name: string;
  nature: string;
}

export interface VoucherLineItem {
  id: string;
  type: EntryType; // 'Dr' or 'Cr'
  ledgerId: string;
  ledgerName?: string;
  amount: number | string;
  hsnCode?: string;
  taxRatePercent?: number;
  billReferenceType?: 'NEW_REF' | 'AGST_REF' | 'ADVANCE';
  referenceNumber?: string;
  notes?: string;
}

export interface TaxBreakdown {
  taxType: 'CGST' | 'SGST' | 'IGST';
  ratePercent: number;
  amount: number;
}

export interface CalculatedTax {
  isIntraState: boolean;
  taxableAmount: number;
  totalTaxAmount: number;
  totalInvoiceAmount: number;
  taxBreakdown: TaxBreakdown[];
}

export type VoucherSourceModule =
  | 'PURCHASE_BILL'
  | 'GRN_INWARD'
  | 'SALES_INVOICE'
  | 'DELIVERY_DISPATCH'
  | 'TDS_AUTOPOST'
  | 'ADJUSTMENT_JV'
  | 'MANUAL_ENTRY';

export interface VoucherRecord {
  id: string;
  voucherNumber: string;
  type: VoucherType;
  date: string;
  narration?: string;
  isSystemGenerated: boolean;
  sourceModule?: VoucherSourceModule | string;
  sourceDocumentId?: string;
  sourceDocumentNumber?: string;
  adjustmentReferenceVoucherId?: string;
  isReversed?: boolean;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  itemCount: number;
  items: VoucherLineItem[];
  createdAt: string;
}

export interface ItemInvoiceLine {
  id: string;
  itemId: string;
  itemName: string;
  description: string;
  sku: string;
  hsnCode: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number | string;
  uom: string;
  rate: number | string;
  discountPercent: number | string;
  discountAmount: number;
  taxableAmount: number;
  taxRatePercent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface AdditionalCharge {
  id: string;
  label: string;
  amount: number | string;
  gstPercent: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  ledgerId?: string;
}

export interface InvoiceTaxSummaryRow {
  ratePercent: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}
