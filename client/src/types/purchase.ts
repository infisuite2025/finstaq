export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
export type GrnQcStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'CONDITIONALLY_ACCEPTED';
export type ThreeWayMatchStatus = 'MATCHED' | 'PRICE_MISMATCH' | 'QTY_MISMATCH' | 'REJECTED';

export interface PurchaseOrderItem {
  id?: string;
  inventoryItemId?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  receivedQty?: number;
  totalAmount?: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  vendorLedgerId: string;
  vendorLedger?: {
    id: string;
    name: string;
    gstin?: string;
  };
  orderDate: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  termsAndConditions?: string;
  items: PurchaseOrderItem[];
  createdAt?: string;
}

export interface GoodsReceiptNoteItem {
  id?: string;
  inventoryItemId?: string;
  description: string;
  receivedQty: number;
  rejectedQty: number;
  rejectionReason?: string;
  batchNumber?: string;
}

export interface GoodsReceiptNote {
  id: string;
  tenantId: string;
  grnNumber: string;
  poId?: string;
  po?: {
    id: string;
    poNumber: string;
  };
  vendorLedgerId: string;
  vendorLedger?: {
    id: string;
    name: string;
  };
  receivedDate: string;
  vehicleNumber?: string;
  challanNumber?: string;
  qcStatus: GrnQcStatus;
  remarks?: string;
  items: GoodsReceiptNoteItem[];
  createdAt?: string;
}

export interface ThreeWayMatchRecord {
  id: string;
  poId: string;
  grnId: string;
  voucherId?: string;
  status: ThreeWayMatchStatus;
  discrepancies: {
    priceVariance: number;
    qtyVariance: number;
    notes: string;
  };
  poTotal: number;
  grnTotalQty: number;
  invoicedTotal: number;
  createdAt: string;
}

export type PurchaseInvoiceStatus = 'DRAFT' | 'BOOKED' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';

export interface PurchaseInvoiceItem {
  id?: string;
  inventoryItemId?: string;
  description: string;
  hsnCode?: string;
  uom?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface PurchaseInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string; // System Voucher Ref (e.g. PUR-2026-0041)
  vendorInvoiceNumber: string; // Vendor's Tax Invoice No (e.g. STARK/2026/8812)
  vendorLedgerId: string;
  vendorLedger?: {
    id: string;
    name: string;
    gstin?: string;
    state?: string;
  };
  invoiceDate: string;
  dueDate: string;
  poId?: string;
  poNumber?: string;
  grnId?: string;
  grnNumber?: string;
  status: PurchaseInvoiceStatus;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  tdsSection?: string;
  tdsRatePercent?: number;
  tdsAmount?: number;
  roundOff?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount?: number;
  paymentTerms?: string;
  remarks?: string;
  voucherId?: string; // Link to General Ledger Voucher
  voucherNumber?: string;
  isThreeWayMatched?: boolean;
  items: PurchaseInvoiceItem[];
  createdAt?: string;
}

export interface ProcurementSummary {
  kpis: {
    totalPoCount: number;
    totalPoValue: number;
    totalGrnCount: number;
    totalInvoiceCount?: number;
    totalInvoiceValue?: number;
    pendingPaymentValue?: number;
    pendingReconciliationCount: number;
  };
  recentPos: PurchaseOrder[];
  recentGrns: GoodsReceiptNote[];
  recentInvoices?: PurchaseInvoice[];
}

