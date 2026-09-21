import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  DollarSign,
  FileCheck,
  Truck,
  CheckCircle2,
  Clock,
  Percent,
  Layers,
  FileSpreadsheet,
  Building2,
  Package,
  BadgePercent,
  RotateCcw,
  BarChart3,
  FileText,
  Printer,
} from 'lucide-react';
import { UniversalReportPrintModal, ReportPrintData } from '../../common/UniversalReportPrintModal';

type ReportTab =
  | 'register'
  | 'so_outstanding'
  | 'challans'
  | 'bills_pending'
  | 'customer_sales'
  | 'item_sales'
  | 'customer_aging'
  | 'gstr1_summary'
  | 'returns';

const FALLBACK_SALES: Record<ReportTab, any> = {
  register: {
    summary: { totalInvoices: 4, totalTaxable: 980000, totalCgst: 49050, totalSgst: 49050, totalIgst: 78300, grandTotal: 1156400 },
    monthlySummary: [
      { month: 'Apr 2026', invoiceCount: 14, taxableAmount: 1120000, cgst: 100800, sgst: 100800, igst: 42000, totalAmount: 1363600 },
      { month: 'May 2026', invoiceCount: 18, taxableAmount: 1450000, cgst: 130500, sgst: 130500, igst: 58000, totalAmount: 1769000 },
      { month: 'Jun 2026', invoiceCount: 22, taxableAmount: 1890000, cgst: 170100, sgst: 170100, igst: 76000, totalAmount: 2306200 },
      { month: 'Jul 2026', invoiceCount: 19, taxableAmount: 1620000, cgst: 145800, sgst: 145800, igst: 64000, totalAmount: 1975600 },
      { month: 'Aug 2026', invoiceCount: 25, taxableAmount: 2150000, cgst: 193500, sgst: 193500, igst: 92000, totalAmount: 2629000 },
      { month: 'Sep 2026', invoiceCount: 12, taxableAmount: 980000, cgst: 88200, sgst: 88200, igst: 39000, totalAmount: 1195400 },
    ],
    invoices: [
      { id: 'inv-001', invoiceNumber: 'INV-2026-0101', invoiceDate: '2026-09-02', customerName: 'Reliance Industries Limited', gstIn: '27AAAAR1234F1Z9', placeOfSupply: '27-Maharashtra', taxableAmount: 350000, cgstAmount: 31500, sgstAmount: 31500, igstAmount: 0, grandTotal: 413000, status: 'PAID' },
      { id: 'inv-002', invoiceNumber: 'INV-2026-0102', invoiceDate: '2026-09-05', customerName: 'Larsen & Toubro Ltd', gstIn: '24AAACL5566M1Z2', placeOfSupply: '24-Gujarat', taxableAmount: 280000, cgstAmount: 0, sgstAmount: 0, igstAmount: 50400, grandTotal: 330400, status: 'UNPAID' },
      { id: 'inv-003', invoiceNumber: 'INV-2026-0103', invoiceDate: '2026-09-08', customerName: 'Mahindra & Mahindra Automotive', gstIn: '27AAACM8877K1Z4', placeOfSupply: '27-Maharashtra', taxableAmount: 195000, cgstAmount: 17550, sgstAmount: 17550, igstAmount: 0, grandTotal: 230100, status: 'PAID' },
      { id: 'inv-004', invoiceNumber: 'INV-2026-0104', invoiceDate: '2026-09-10', customerName: 'Bharat Heavy Electricals Limited (BHEL)', gstIn: '07AAACB0011C1Z8', placeOfSupply: '07-Delhi', taxableAmount: 155000, cgstAmount: 0, sgstAmount: 0, igstAmount: 27900, grandTotal: 182900, status: 'PAID' },
    ],
  },
  so_outstanding: {
    summary: { totalOrders: 3, totalCommittedValue: 1146500, totalPendingValue: 1103000, overdueOrdersCount: 1 },
    orders: [
      { soNumber: 'SO-2026-0081', orderDate: '2026-08-25', expectedDeliveryDate: '2026-09-15', customerName: 'Reliance Industries Limited', items: [{ description: 'High Pressure Control Valve DN50', orderedQty: 50, dispatchedQty: 30, balanceQty: 20, unitPrice: 1450 }], totalPendingValue: 29000, isOverdue: false },
      { soNumber: 'SO-2026-0084', orderDate: '2026-09-02', expectedDeliveryDate: '2026-09-12', customerName: 'Larsen & Toubro Ltd', items: [{ description: 'Structural Steel Rod 25mm dia', orderedQty: 15, dispatchedQty: 0, balanceQty: 15, unitPrice: 62000 }], totalPendingValue: 930000, isOverdue: true },
      { soNumber: 'SO-2026-0087', orderDate: '2026-09-07', expectedDeliveryDate: '2026-09-25', customerName: 'Mahindra & Mahindra Automotive', items: [{ description: 'Double Row Ball Bearings 6205', orderedQty: 300, dispatchedQty: 0, balanceQty: 300, unitPrice: 480 }], totalPendingValue: 144000, isOverdue: false },
    ],
  },
  challans: {
    summary: { totalChallans: 3, totalDispatchedUnits: 288, inTransitCount: 1, deliveredCount: 2 },
    challans: [
      { challanNumber: 'DC-2026-0041', dispatchDate: '2026-09-03', customerName: 'Reliance Industries Limited', transporterName: 'VRL Logistics Limited', vehicleNumber: 'MH-04-DK-8910', lrNumber: 'VRL-MUM-89218', items: [{ description: 'High Pressure Control Valve DN50', dispatchedQty: 30 }], status: 'DELIVERED' },
      { challanNumber: 'DC-2026-0042', dispatchDate: '2026-09-06', customerName: 'Mahindra & Mahindra Automotive', transporterName: 'TCI Freight Express', vehicleNumber: 'MH-14-AB-4455', lrNumber: 'TCI-PUN-77210', items: [{ description: 'Stainless Steel Fasteners Grade 8.8', dispatchedQty: 250 }], status: 'DELIVERED' },
      { challanNumber: 'DC-2026-0043', dispatchDate: '2026-09-10', customerName: 'Larsen & Toubro Ltd', transporterName: 'GATI KWE', vehicleNumber: 'GJ-01-AX-9912', lrNumber: 'GATI-AHM-10928', items: [{ description: 'Structural Steel Rod 25mm dia', dispatchedQty: 8 }], status: 'IN_TRANSIT' },
    ],
  },
  bills_pending: {
    summary: { pendingChallansCount: 2, totalUnbilledRevenueAmount: 670240 },
    unbilledDeliveries: [
      { challanNumber: 'DC-2026-0043', dispatchDate: '2026-09-10', customerName: 'Larsen & Toubro Ltd', itemsDescription: '8 TON Structural Steel Rod 25mm dia', dispatchedQty: 8, estimatedTotal: 585280 },
      { challanNumber: 'DC-2026-0040', dispatchDate: '2026-09-01', customerName: 'Bharat Heavy Electricals Limited (BHEL)', itemsDescription: '150 NOS Precision Ball Bearings 6205', dispatchedQty: 150, estimatedTotal: 84960 },
    ],
  },
  customer_sales: {
    summary: { activeCustomersCount: 4, totalSalesRevenue: 4725900, topCustomerRevenueShare: 46.2 },
    customers: [
      { customerName: 'Reliance Industries Limited', gstIn: '27AAAAR1234F1Z9', invoiceCount: 8, totalTaxable: 1850000, grandTotal: 2183000, percentShare: 46.2 },
      { customerName: 'Larsen & Toubro Ltd', gstIn: '24AAACL5566M1Z2', invoiceCount: 5, totalTaxable: 1120000, grandTotal: 1321600, percentShare: 28.0 },
      { customerName: 'Mahindra & Mahindra Automotive', gstIn: '27AAACM8877K1Z4', invoiceCount: 4, totalTaxable: 680000, grandTotal: 802400, percentShare: 17.0 },
      { customerName: 'Bharat Heavy Electricals Limited (BHEL)', gstIn: '07AAACB0011C1Z8', invoiceCount: 2, totalTaxable: 355000, grandTotal: 418900, percentShare: 8.8 },
    ],
  },
  item_sales: {
    summary: { totalUniqueSkus: 4, totalSalesRevenue: 2084000, totalGrossProfit: 442000, overallMarginPercent: 21.21 },
    items: [
      { itemName: 'High Tensile Structural Steel Rod 25mm dia', totalQtySold: 25, avgSellingPrice: 62000, avgCostPrice: 52000, totalSalesValue: 1550000, grossProfit: 250000, grossMarginPercent: 16.13 },
      { itemName: 'Industrial High Pressure Control Valve DN50', totalQtySold: 120, avgSellingPrice: 1450, avgCostPrice: 850, totalSalesValue: 174000, grossProfit: 72000, grossMarginPercent: 41.38 },
      { itemName: 'Precision Double Row Ball Bearings 6205-2RS', totalQtySold: 450, avgSellingPrice: 480, avgCostPrice: 320, totalSalesValue: 216000, grossProfit: 72000, grossMarginPercent: 33.33 },
      { itemName: 'Stainless Steel Fasteners & Hex Bolts M12x50', totalQtySold: 600, avgSellingPrice: 240, avgCostPrice: 160, totalSalesValue: 144000, grossProfit: 48000, grossMarginPercent: 33.33 },
    ],
  },
  customer_aging: {
    summary: { totalReceivable: 1156400, total0To30: 923100, total31To60: 233300, total61To90: 0, totalOver90: 0 },
    debtors: [
      { customerName: 'Reliance Industries Limited', creditPeriodDays: 30, bucket0To30: 413000, bucket31To60: 0, bucket61To90: 0, bucketOver90: 0, totalReceivable: 413000 },
      { customerName: 'Larsen & Toubro Ltd', creditPeriodDays: 45, bucket0To30: 180000, bucket31To60: 150400, bucket61To90: 0, bucketOver90: 0, totalReceivable: 330400 },
      { customerName: 'Mahindra & Mahindra Automotive', creditPeriodDays: 30, bucket0To30: 230100, bucket31To60: 0, bucket61To90: 0, bucketOver90: 0, totalReceivable: 230100 },
      { customerName: 'Bharat Heavy Electricals Limited (BHEL)', creditPeriodDays: 60, bucket0To30: 100000, bucket31To60: 82900, bucket61To90: 0, bucketOver90: 0, totalReceivable: 182900 },
    ],
  },
  gstr1_summary: {
    summary: { totalOutwardTaxableTurnover: 2750000, totalOutputCgst: 184800, totalOutputSgst: 184800, totalOutputTaxLiability: 466800 },
    hsnSummary: [
      { hsnCode: '7214', description: 'High Tensile Structural Steel Bars & Rods', uqc: 'TON', totalQuantity: 25, totalTaxableValue: 1550000, rate: 18, totalGst: 279000 },
      { hsnCode: '8481', description: 'Industrial High Pressure Flow Valves & Taps', uqc: 'NOS', totalQuantity: 120, totalTaxableValue: 174000, rate: 18, totalGst: 31320 },
      { hsnCode: '8482', description: 'Double Row Precision Ball Bearings', uqc: 'NOS', totalQuantity: 450, totalTaxableValue: 216000, rate: 18, totalGst: 38880 },
      { hsnCode: '7318', description: 'Stainless Steel Fasteners & Hex Bolts', uqc: 'KGS', totalQuantity: 600, totalTaxableValue: 144000, rate: 18, totalGst: 25920 },
    ],
  },
  returns: {
    summary: { totalCreditNotesCount: 2, totalAdjustedTaxLiability: 3114, totalCreditValue: 20414 },
    creditNotes: [
      { creditNoteNumber: 'CRN-2026-0012', creditNoteDate: '2026-09-04', originalInvoiceNumber: 'INV-2026-0095', originalInvoiceDate: '2026-08-28', customerName: 'Mahindra & Mahindra Automotive', reasonDescription: 'Customer QA rejected 20 KGS hex bolts due to minor plating scratches.', taxableAmount: 4800, totalCreditAmount: 5664 },
      { creditNoteNumber: 'CRN-2026-0013', creditNoteDate: '2026-09-09', originalInvoiceNumber: 'INV-2026-0099', originalInvoiceDate: '2026-09-01', customerName: 'Larsen & Toubro Ltd', reasonDescription: 'Post-sales annual volume rebate tier adjustment (2% discount).', taxableAmount: 12500, totalCreditAmount: 14750 },
    ],
  },
};

export function SalesReportsWorkspace() {
  const [activeTab, setActiveTab] = useState<ReportTab>('register');
  const [startDate, setStartDate] = useState<string>('2026-04-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(FALLBACK_SALES['register']);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [printData, setPrintData] = useState<ReportPrintData | null>(null);

  const handleOpenPrintModal = () => {
    const currentData = reportData || FALLBACK_SALES[activeTab];
    let pData: ReportPrintData = {
      reportTitle: activeTab.replace(/_/g, ' ').toUpperCase(),
      department: 'SALES',
      startDate,
      endDate,
    };

    if (activeTab === 'register') {
      pData.reportTitle = 'SALES REGISTER (TAX INVOICES & DAYBOOK)';
      pData.subtitle = 'Detailed Outward Sales Daybook with Output GST Breakdown';
      pData.summaryCards = [
        { label: 'Total Invoices', value: currentData.summary?.totalInvoices || (currentData.invoices?.length || 0), format: 'text' },
        { label: 'Total Taxable Value', value: currentData.summary?.totalTaxable || 0, format: 'currency' },
        { label: 'Output CGST + SGST', value: (currentData.summary?.totalCgst || 0) + (currentData.summary?.totalSgst || 0), format: 'currency' },
        { label: 'Output IGST', value: currentData.summary?.totalIgst || 0, format: 'currency' },
        { label: 'Grand Total Revenue', value: currentData.summary?.grandTotal || 0, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Date', accessor: 'invoiceDate' },
        { header: 'Invoice #', accessor: 'invoiceNumber' },
        { header: 'Customer / Debtor', accessor: 'customerName' },
        { header: 'Customer GSTIN', accessor: 'gstIn' },
        { header: 'Place of Supply', accessor: 'placeOfSupply' },
        { header: 'Taxable (₹)', accessor: 'taxableAmount', align: 'right', format: 'currency' },
        { header: 'CGST (₹)', accessor: 'cgstAmount', align: 'right', format: 'currency' },
        { header: 'SGST (₹)', accessor: 'sgstAmount', align: 'right', format: 'currency' },
        { header: 'IGST (₹)', accessor: 'igstAmount', align: 'right', format: 'currency' },
        { header: 'Grand Total (₹)', accessor: 'grandTotal', align: 'right', format: 'currency' },
        { header: 'Status', accessor: 'status' },
      ];
      pData.rows = currentData.invoices || [];
    } else if (activeTab === 'so_outstanding') {
      pData.reportTitle = 'SALES ORDER (SO) FULFILLMENT & PENDING DISPATCH REGISTER';
      pData.subtitle = 'Pending Customer Commitments & Fulfillment Backlog';
      pData.summaryCards = [
        { label: 'Total Active Orders', value: currentData.summary?.totalOrders || (currentData.orders?.length || 0), format: 'text' },
        { label: 'Total Committed Value', value: currentData.summary?.totalCommittedValue || 0, format: 'currency' },
        { label: 'Pending Dispatch Value', value: currentData.summary?.totalPendingValue || 0, format: 'currency' },
        { label: 'Overdue Delivery Orders', value: currentData.summary?.overdueOrdersCount || 0, format: 'text' },
      ];
      pData.columns = [
        { header: 'SO Number', accessor: 'soNumber' },
        { header: 'Order Date', accessor: 'orderDate' },
        { header: 'Delivery Due', accessor: 'expectedDeliveryDate' },
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Items / Particulars', accessor: 'itemSummary' },
        { header: 'Pending Value (₹)', accessor: 'totalPendingValue', align: 'right', format: 'currency' },
        { header: 'Status', accessor: 'status' },
      ];
      pData.rows = (currentData.orders || []).map((o: any) => ({
        ...o,
        itemSummary: Array.isArray(o.items) ? o.items.map((it: any) => `${it.description || it.name || 'Item'} (Bal: ${it.balanceQty ?? it.pendingQty ?? it.orderedQty})`).join('; ') : (o.itemDescription || '-'),
        status: o.isOverdue ? 'OVERDUE' : 'ON TRACK',
      }));
    } else if (activeTab === 'challans') {
      pData.reportTitle = 'DELIVERY CHALLAN & GOODS DISPATCH REGISTER';
      pData.subtitle = 'Outward Material Movements and Transport Consignments';
      pData.summaryCards = [
        { label: 'Total Challans', value: currentData.summary?.totalChallans || (currentData.challans?.length || 0), format: 'text' },
        { label: 'Total Dispatched Units', value: currentData.summary?.totalDispatchedUnits || 0, format: 'text' },
        { label: 'Delivered', value: currentData.summary?.deliveredCount || 0, format: 'text' },
        { label: 'In-Transit', value: currentData.summary?.inTransitCount || 0, format: 'text' },
      ];
      pData.columns = [
        { header: 'Challan #', accessor: 'challanNumber' },
        { header: 'Dispatch Date', accessor: 'dispatchDate' },
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Transporter', accessor: 'transporterName' },
        { header: 'Vehicle #', accessor: 'vehicleNumber' },
        { header: 'LR / Docket #', accessor: 'lrNumber' },
        { header: 'Items Dispatched', accessor: 'itemSummary' },
        { header: 'Status', accessor: 'status' },
      ];
      pData.rows = (currentData.challans || []).map((c: any) => ({
        ...c,
        itemSummary: Array.isArray(c.items) ? c.items.map((it: any) => `${it.description || it.name || 'Item'} (${it.dispatchedQty} Qty)`).join('; ') : (c.itemsDescription || '-'),
      }));
    } else if (activeTab === 'bills_pending') {
      pData.reportTitle = 'BILLS PENDING REGISTER (DELIVERIES AWAITING INVOICING)';
      pData.subtitle = 'Unbilled Outward Deliveries for Working Capital Reconciliation';
      pData.summaryCards = [
        { label: 'Pending Challans', value: currentData.summary?.pendingChallansCount || (currentData.unbilledDeliveries?.length || 0), format: 'text' },
        { label: 'Unbilled Revenue Value', value: currentData.summary?.totalUnbilledRevenueAmount || 0, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Challan #', accessor: 'challanNumber' },
        { header: 'Dispatch Date', accessor: 'dispatchDate' },
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Dispatched Goods Description', accessor: 'itemsDescription' },
        { header: 'Qty', accessor: 'dispatchedQty', align: 'right' },
        { header: 'Estimated Value (₹)', accessor: 'estimatedTotal', align: 'right', format: 'currency' },
      ];
      pData.rows = currentData.unbilledDeliveries || [];
    } else if (activeTab === 'customer_sales') {
      pData.reportTitle = 'CUSTOMER REVENUE & PARETO ANALYSIS REPORT';
      pData.subtitle = 'Customer Revenue Concentration and Sales Distribution';
      pData.summaryCards = [
        { label: 'Active Customers', value: currentData.summary?.activeCustomersCount || (currentData.customers?.length || 0), format: 'text' },
        { label: 'Total Invoiced Revenue', value: currentData.summary?.totalSalesRevenue || 0, format: 'currency' },
        { label: 'Top Customer Share', value: `${currentData.summary?.topCustomerRevenueShare || 0}%`, format: 'text' },
      ];
      pData.columns = [
        { header: 'Customer Name', accessor: 'customerName' },
        { header: 'Customer GSTIN', accessor: 'gstIn' },
        { header: 'Invoice Count', accessor: 'invoiceCount', align: 'right' },
        { header: 'Taxable Revenue (₹)', accessor: 'totalTaxable', align: 'right', format: 'currency' },
        { header: 'Gross Revenue (₹)', accessor: 'grandTotal', align: 'right', format: 'currency' },
        { header: 'Share (%)', accessor: 'percentShare', align: 'right', format: 'percent' },
      ];
      pData.rows = currentData.customers || [];
    } else if (activeTab === 'item_sales') {
      pData.reportTitle = 'ITEM SALES VOLUME & GROSS MARGIN ANALYSIS';
      pData.subtitle = 'Product SKU Performance, Realized Prices & Margin Contributions';
      pData.summaryCards = [
        { label: 'Total SKUs', value: currentData.summary?.totalUniqueSkus || (currentData.items?.length || 0), format: 'text' },
        { label: 'Total Sales Turnover', value: currentData.summary?.totalSalesRevenue || 0, format: 'currency' },
        { label: 'Total Gross Profit', value: currentData.summary?.totalGrossProfit || 0, format: 'currency' },
        { label: 'Overall Gross Margin', value: `${currentData.summary?.overallMarginPercent || 0}%`, format: 'text' },
      ];
      pData.columns = [
        { header: 'Item / SKU Description', accessor: 'itemName' },
        { header: 'Units Sold', accessor: 'totalQtySold', align: 'right' },
        { header: 'Avg Selling Price (₹)', accessor: 'avgSellingPrice', align: 'right', format: 'currency' },
        { header: 'Avg Cost Price (₹)', accessor: 'avgCostPrice', align: 'right', format: 'currency' },
        { header: 'Total Sales (₹)', accessor: 'totalSalesValue', align: 'right', format: 'currency' },
        { header: 'Gross Profit (₹)', accessor: 'grossProfit', align: 'right', format: 'currency' },
        { header: 'Margin (%)', accessor: 'grossMarginPercent', align: 'right', format: 'percent' },
      ];
      pData.rows = currentData.items || [];
    } else if (activeTab === 'customer_aging') {
      pData.reportTitle = 'CUSTOMER OUTSTANDING & RECEIVABLES AGING SCHEDULE';
      pData.subtitle = 'Accounts Receivable Aging Analysis by Credit Due Interval';
      pData.summaryCards = [
        { label: 'Total Receivables', value: currentData.summary?.totalReceivable || 0, format: 'currency' },
        { label: '0-30 Days', value: currentData.summary?.total0To30 || 0, format: 'currency' },
        { label: '31-60 Days', value: currentData.summary?.total31To60 || 0, format: 'currency' },
        { label: '61-90 Days', value: currentData.summary?.total61To90 || 0, format: 'currency' },
        { label: 'Over 90 Days', value: currentData.summary?.totalOver90 || 0, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Customer Name', accessor: 'customerName' },
        { header: 'Credit Days', accessor: 'creditPeriodDays', align: 'center' },
        { header: '0-30 Days (₹)', accessor: 'bucket0To30', align: 'right', format: 'currency' },
        { header: '31-60 Days (₹)', accessor: 'bucket31To60', align: 'right', format: 'currency' },
        { header: '61-90 Days (₹)', accessor: 'bucket61To90', align: 'right', format: 'currency' },
        { header: '> 90 Days (₹)', accessor: 'bucketOver90', align: 'right', format: 'currency' },
        { header: 'Total Outstanding (₹)', accessor: 'totalReceivable', align: 'right', format: 'currency' },
      ];
      pData.rows = currentData.debtors || [];
    } else if (activeTab === 'gstr1_summary') {
      pData.reportTitle = 'GSTR-1 OUTWARD SUPPLIES & HSN SUMMARY';
      pData.subtitle = 'Statutory GST Outward Turnover & Tax Liability by HSN Code';
      pData.summaryCards = [
        { label: 'Total Outward Turnover', value: currentData.summary?.totalOutwardTaxableTurnover || 0, format: 'currency' },
        { label: 'Output CGST', value: currentData.summary?.totalOutputCgst || 0, format: 'currency' },
        { label: 'Output SGST', value: currentData.summary?.totalOutputSgst || 0, format: 'currency' },
        { label: 'Total Output GST Liability', value: currentData.summary?.totalOutputTaxLiability || 0, format: 'currency' },
      ];
      pData.columns = [
        { header: 'HSN Code', accessor: 'hsnCode' },
        { header: 'Description', accessor: 'description' },
        { header: 'UQC', accessor: 'uqc', align: 'center' },
        { header: 'Total Quantity', accessor: 'totalQuantity', align: 'right' },
        { header: 'Taxable Value (₹)', accessor: 'totalTaxableValue', align: 'right', format: 'currency' },
        { header: 'GST Rate (%)', accessor: 'rate', align: 'center', format: 'percent' },
        { header: 'Total Tax (₹)', accessor: 'totalGst', align: 'right', format: 'currency' },
      ];
      pData.rows = currentData.hsnSummary || [];
    } else if (activeTab === 'returns') {
      pData.reportTitle = 'SALES RETURNS & CREDIT NOTE REGISTER';
      pData.subtitle = 'Summary of Goods Returned, Volume Rebates & Outward Tax Adjustments';
      pData.summaryCards = [
        { label: 'Total Credit Notes', value: currentData.summary?.totalCreditNotesCount || (currentData.creditNotes?.length || 0), format: 'text' },
        { label: 'Adjusted Tax Liability', value: currentData.summary?.totalAdjustedTaxLiability || 0, format: 'currency' },
        { label: 'Total Credit Value', value: currentData.summary?.totalCreditValue || 0, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Credit Note #', accessor: 'creditNoteNumber' },
        { header: 'Date', accessor: 'creditNoteDate' },
        { header: 'Original Invoice #', accessor: 'originalInvoiceNumber' },
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Reason / Remarks', accessor: 'reasonDescription' },
        { header: 'Taxable (₹)', accessor: 'taxableAmount', align: 'right', format: 'currency' },
        { header: 'Total Credit (₹)', accessor: 'totalCreditAmount', align: 'right', format: 'currency' },
      ];
      pData.rows = currentData.creditNotes || [];
    }

    setPrintData(pData);
    setPrintModalOpen(true);
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab, startDate, endDate]);

  const fetchReport = async (tab: ReportTab) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      let endpoint = '';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      switch (tab) {
        case 'register':
          endpoint = `/api/v1/sales/reports/register?${params.toString()}`;
          break;
        case 'so_outstanding':
          endpoint = `/api/v1/sales/reports/so-outstanding`;
          break;
        case 'challans':
          endpoint = `/api/v1/sales/reports/challans?${params.toString()}`;
          break;
        case 'bills_pending':
          endpoint = `/api/v1/sales/reports/bills-pending`;
          break;
        case 'customer_sales':
          endpoint = `/api/v1/sales/reports/customer-sales?${params.toString()}`;
          break;
        case 'item_sales':
          endpoint = `/api/v1/sales/reports/item-sales?${params.toString()}`;
          break;
        case 'customer_aging':
          endpoint = `/api/v1/sales/reports/customer-aging`;
          break;
        case 'gstr1_summary':
          endpoint = `/api/v1/sales/reports/gstr1-summary?${params.toString()}`;
          break;
        case 'returns':
          endpoint = `/api/v1/sales/reports/returns?${params.toString()}`;
          break;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setReportData(json.data);
        } else {
          setReportData(FALLBACK_SALES[tab]);
        }
      } else {
        setReportData(FALLBACK_SALES[tab]);
      }
    } catch (err) {
      setReportData(FALLBACK_SALES[tab]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    let rows: any[] = [];
    if (Array.isArray(reportData)) {
      rows = reportData;
    } else if (reportData.invoices) {
      rows = reportData.invoices;
    } else if (reportData.orders) {
      rows = reportData.orders;
    } else if (reportData.challans) {
      rows = reportData.challans;
    } else if (reportData.unbilledDeliveries) {
      rows = reportData.unbilledDeliveries;
    } else if (reportData.customers) {
      rows = reportData.customers;
    } else if (reportData.items) {
      rows = reportData.items;
    } else if (reportData.debtors) {
      rows = reportData.debtors;
    } else if (reportData.hsnSummary) {
      rows = reportData.hsnSummary;
    } else if (reportData.creditNotes) {
      rows = reportData.creditNotes;
    }

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
    csvContent += headers.join(',') + '\r\n';

    rows.forEach((row) => {
      const line = headers.map(h => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]).replace(/"/g, '""') : '';
        return `"${val}"`;
      }).join(',');
      csvContent += line + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finstaq_${activeTab}_sales_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const data = reportData || FALLBACK_SALES[activeTab];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Sales Department Reports
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Statutory ERP Standard
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Turnover analytics, GSTR-1 outward GST compliance, order fulfillment & Sundry Debtors aging
            </p>
          </div>
        </div>

        {/* Global Controls: Date Filters & Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-0 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-hidden"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-0 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchReport(activeTab)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenPrintModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Print / Save PDF Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Download formatted CSV / Excel file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2 overflow-x-auto flex space-x-1 shrink-0 no-scrollbar">
        {[
          { id: 'register', label: '1. Sales Register', icon: FileSpreadsheet },
          { id: 'so_outstanding', label: '2. SO Outstanding Matrix', icon: Clock },
          { id: 'challans', label: '3. Delivery Challan Register', icon: Truck },
          { id: 'bills_pending', label: '4. Bills Pending (Unbilled)', icon: Layers },
          { id: 'customer_sales', label: '5. Customer Revenue & Pareto', icon: Building2 },
          { id: 'item_sales', label: '6. Item Sales & Gross Margin', icon: Package },
          { id: 'customer_aging', label: '7. Receivables Aging', icon: DollarSign },
          { id: 'gstr1_summary', label: '8. GSTR-1 Outward Summary', icon: BadgePercent },
          { id: 'returns', label: '9. Sales Returns & Credit Notes', icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm text-slate-500">Compiling sales report analytics...</p>
          </div>
        ) : (
          <>
            {activeTab === 'register' && <SalesRegisterView data={data} />}
            {activeTab === 'so_outstanding' && <SOOutstandingView data={data} />}
            {activeTab === 'challans' && <DeliveryChallanView data={data} />}
            {activeTab === 'bills_pending' && <SalesBillsPendingView data={data} />}
            {activeTab === 'customer_sales' && <CustomerSalesView data={data} />}
            {activeTab === 'item_sales' && <ItemSalesMarginView data={data} />}
            {activeTab === 'customer_aging' && <CustomerAgingView data={data} />}
            {activeTab === 'gstr1_summary' && <GSTR1SummaryView data={data} />}
            {activeTab === 'returns' && <SalesReturnsView data={data} />}
          </>
        )}
      </div>
      {/* Universal Report Print & Export Modal */}
      <UniversalReportPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        data={printData}
        userRole="SALES_MANAGER"
        canPrint={true}
        canExport={true}
      />
    </div>
  );
}

// 1. Sales Register View
function SalesRegisterView({ data }: { data: any }) {
  const { summary, monthlySummary, invoices } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Tax Invoices</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalInvoices || 4}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Taxable Turnover</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalTaxable || 980000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">CGST + SGST (Intrastate)</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{((summary?.totalCgst || 49050) + (summary?.totalSgst || 49050)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">IGST (Interstate)</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{(summary?.totalIgst || 78300).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-indigo-500/5">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Gross Sales Revenue</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{(summary?.grandTotal || 1156400).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {monthlySummary && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Monthly Sales Register (Periodic Turnover Summary)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Invoices</th>
                  <th className="py-2.5 px-3 text-right">Taxable Turnover (₹)</th>
                  <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">Gross Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {monthlySummary.map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{m.month}</td>
                    <td className="py-2.5 px-3 text-right">{m.invoiceCount}</td>
                    <td className="py-2.5 px-3 text-right">{m.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{m.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{m.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">{m.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{m.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoices && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Sales Day Book / Tax Invoice Journal
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer Name & GSTIN</th>
                  <th className="py-2.5 px-3">Place of Supply</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right">Tax (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{inv.invoiceDate}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{inv.gstIn || 'Unregistered'}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{inv.placeOfSupply}</td>
                    <td className="py-2.5 px-3 text-right">{(inv.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{((inv.cgstAmount || 0) + (inv.sgstAmount || 0) + (inv.igstAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{(inv.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
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
    </div>
  );
}

// 2. Sales Order Outstanding Matrix View
function SOOutstandingView({ data }: { data: any }) {
  const { summary, orders } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Active SOs</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalOrders || 3}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Committed Order Value</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalCommittedValue || 1146500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-amber-500/5">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Undelivered Order Backlog</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{(summary?.totalPendingValue || 1103000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Overdue Deliveries</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary?.overdueOrdersCount || 1}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Sales Order Fulfillment & Outstanding Delivery Matrix (Order Fulfillment Status)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">SO # & Order Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                <th className="py-2.5 px-3 text-right">Balance Qty</th>
                <th className="py-2.5 px-3 text-right">Selling Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Backlog Val (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {orders && orders.map((o: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white">{o.soNumber}</div>
                    <div className="text-[10px] text-slate-400">Due: {o.expectedDeliveryDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{o.customerName}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    {o.items?.[0]?.description || 'Multiple Items'}
                  </td>
                  <td className="py-2.5 px-3 text-right">{o.items?.[0]?.orderedQty || 0}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{o.items?.[0]?.dispatchedQty || 0}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{o.items?.[0]?.balanceQty || 0}</td>
                  <td className="py-2.5 px-3 text-right">{(o.items?.[0]?.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{(o.totalPendingValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. Delivery Challan Register View
function DeliveryChallanView({ data }: { data: any }) {
  const { summary, challans } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Delivery Challans</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalChallans || 3}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Dispatched Units</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalDispatchedUnits || 288}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">In-Transit Shipments</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary?.inTransitCount || 1}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Delivered Shipments</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary?.deliveredCount || 2}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-600" />
          Outward Delivery Challan & Dispatch Note Register (Dispatch Notes Register)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Challan # & Date</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Transporter & LR #</th>
                <th className="py-2.5 px-3">Vehicle #</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {challans && challans.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white">{c.challanNumber}</div>
                    <div className="text-[10px] text-slate-400">{c.dispatchDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{c.customerName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                    <div>{c.transporterName}</div>
                    <div className="text-[10px] text-slate-400">LR: {c.lrNumber || '—'}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.vehicleNumber}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 dark:text-slate-200">{c.items?.[0]?.description || '—'}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{c.items?.[0]?.dispatchedQty || 0}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. Sales Bills Pending View (Unbilled Deliveries)
function SalesBillsPendingView({ data }: { data: any }) {
  const { summary, unbilledDeliveries } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Unbilled Delivery Challans</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary?.pendingChallansCount || 2}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-amber-500/5">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Total Unbilled Revenue (Sales Bills to Make)</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{(summary?.totalUnbilledRevenueAmount || 670240).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          Sales Bills to Make / Delivered Stock Pending Invoice Generation
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Challan #</th>
                <th className="py-2.5 px-3">Dispatch Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                <th className="py-2.5 px-3 text-right">Estimated Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {unbilledDeliveries && unbilledDeliveries.map((u: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{u.challanNumber}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{u.dispatchDate}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{u.customerName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">{u.itemsDescription}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{u.dispatchedQty}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{(u.estimatedTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. Customer Sales Revenue & Pareto View
function CustomerSalesView({ data }: { data: any }) {
  const { summary, customers } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Customers</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.activeCustomersCount || 4}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Sales Revenue</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{(summary?.totalSalesRevenue || 4725900).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Top Customer Contribution</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary?.topCustomerRevenueShare || 46.2}%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Customer-wise Sales Turnover & Pareto 80/20 Distribution
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Customer / Debtor</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3 text-right">Invoices</th>
                <th className="py-2.5 px-3 text-right">Taxable Sales (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Revenue (₹)</th>
                <th className="py-2.5 px-3 text-right">Revenue Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {customers && customers.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{c.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{c.gstIn}</td>
                  <td className="py-2.5 px-3 text-right">{c.invoiceCount}</td>
                  <td className="py-2.5 px-3 text-right">{(c.totalTaxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{(c.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.percentShare}%</span>
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(c.percentShare, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 6. Item Sales & Gross Margin View
function ItemSalesMarginView({ data }: { data: any }) {
  const { summary, items } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Products Sold</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalUniqueSkus || 4}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Sales Value</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalSalesRevenue || 2084000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Gross Profit</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.totalGrossProfit || 442000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-emerald-500/5">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Blended Gross Margin</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary?.overallMarginPercent || 21.21}%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600" />
          Product-wise Sales Volume, COGS & Gross Profit Margin Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Product Description / SKU</th>
                <th className="py-2.5 px-3 text-right">Qty Sold</th>
                <th className="py-2.5 px-3 text-right">Avg Selling Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Cost Price (₹)</th>
                <th className="py-2.5 px-3 text-right">Sales Turnover (₹)</th>
                <th className="py-2.5 px-3 text-right">Gross Profit (₹)</th>
                <th className="py-2.5 px-3 text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {items && items.map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{it.itemName}</td>
                  <td className="py-2.5 px-3 text-right">{it.totalQtySold}</td>
                  <td className="py-2.5 px-3 text-right">{(it.avgSellingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{(it.avgCostPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{(it.totalSalesValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{(it.grossProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{it.grossMarginPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 7. Customer Receivables Aging View
function CustomerAgingView({ data }: { data: any }) {
  const { summary, debtors } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Receivables</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalReceivable || 1156400).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">0 – 30 Days Current</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.total0To30 || 923100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">31 – 60 Days</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.total31To60 || 233300).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">61 – 90 Days</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{(summary?.total61To90 || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-rose-500/5">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">&gt; 90 Days Overdue</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{(summary?.totalOver90 || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-600" />
          Sundry Debtors / Customer Receivables Aging Schedule (Receivables Aging Matrix)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Customer / Debtor</th>
                <th className="py-2.5 px-3">Credit Term</th>
                <th className="py-2.5 px-3 text-right">0 – 30 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">31 – 60 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">61 – 90 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">&gt; 90 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Outstanding (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {debtors && debtors.map((d: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{d.customerName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500">{d.creditPeriodDays} Days</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{(d.bucket0To30 || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(d.bucket31To60 || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">{(d.bucket61To90 || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">{(d.bucketOver90 || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{(d.totalReceivable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 8. GSTR-1 Outward Summary View
function GSTR1SummaryView({ data }: { data: any }) {
  const { summary, hsnSummary } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Outward Taxable Base</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalOutwardTaxableTurnover || 2750000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Output CGST</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.totalOutputCgst || 184800).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Output SGST</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.totalOutputSgst || 184800).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-indigo-500/5">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Total Output Tax Liability</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{(summary?.totalOutputTaxLiability || 466800).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {hsnSummary && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-indigo-600" />
            HSN/SAC Summary of Outward Supplies (GSTR-1 Table 12)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3">HSN / SAC</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">UQC / Total Qty</th>
                  <th className="py-2.5 px-3 text-right">Taxable Turnover (₹)</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Total GST (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {hsnSummary.map((h: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{h.hsnCode}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 dark:text-slate-200">{h.description}</td>
                    <td className="py-2.5 px-3 text-right font-sans">{h.totalQuantity} {h.uqc}</td>
                    <td className="py-2.5 px-3 text-right">{(h.totalTaxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{h.rate}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{(h.totalGst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 9. Sales Returns & Credit Notes View
function SalesReturnsView({ data }: { data: any }) {
  const { summary, creditNotes } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Credit Notes Issued</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalCreditNotesCount || 2}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Adjusted Tax Liability</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{(summary?.totalAdjustedTaxLiability || 3114).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-rose-500/5">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Total Credit Value</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{(summary?.totalCreditValue || 20414).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-500" />
          Sales Return & Credit Note Register (GST Credit Notes Register)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Credit Note # & Date</th>
                <th className="py-2.5 px-3">Original Invoice Ref</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Return Reason / Notes</th>
                <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-3 text-right">Adjusted GST (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {creditNotes && creditNotes.map((cn: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white">{cn.creditNoteNumber}</div>
                    <div className="text-[10px] text-slate-400">{cn.creditNoteDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                    <div>{cn.originalInvoiceNumber}</div>
                    <div className="text-[10px]">{cn.originalInvoiceDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{cn.customerName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{cn.reasonDescription}</td>
                  <td className="py-2.5 px-3 text-right">{(cn.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">{((cn.cgstAmount || 0) + (cn.sgstAmount || 0) + (cn.igstAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">{(cn.totalCreditAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
