export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_DISPATCHED' | 'COMPLETED' | 'CANCELLED';
export type DeliveryChallanStatus = 'DRAFT' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
  id?: string;
  inventoryItemId?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  dispatchedQty?: number;
  totalAmount?: number;
}

export interface SalesOrder {
  id: string;
  tenantId: string;
  soNumber: string;
  customerLedgerId: string;
  customerLedger?: {
    id: string;
    name: string;
    gstin?: string;
  };
  orderDate: string;
  deliveryDueDate?: string;
  status: SalesOrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  customerPoReference?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  items: SalesOrderItem[];
  createdAt?: string;
}

export interface DeliveryChallanItem {
  id?: string;
  inventoryItemId?: string;
  description: string;
  dispatchedQty: number;
  batchNumber?: string;
}

export interface DeliveryChallan {
  id: string;
  tenantId: string;
  challanNumber: string;
  soId?: string;
  so?: {
    id: string;
    soNumber: string;
  };
  customerLedgerId: string;
  customerLedger?: {
    id: string;
    name: string;
  };
  dispatchDate: string;
  vehicleNumber?: string;
  transporterName?: string;
  eWayBillNumber?: string;
  status: DeliveryChallanStatus;
  remarks?: string;
  items: DeliveryChallanItem[];
  createdAt?: string;
}

export interface SalesSummary {
  totalSalesOrders: number;
  totalDeliveryChallans: number;
  totalSalesRevenue: number;
  openSalesOrders: SalesOrder[];
}
