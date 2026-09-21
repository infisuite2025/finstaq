import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  Clock,
  AlertTriangle,
  ChevronRight,
  Layers,
  Building2,
  Package,
  ShieldCheck,
  DollarSign,
  BadgePercent,
  BarChart3,
  FileText,
  Printer,
} from 'lucide-react';
import { UniversalReportPrintModal, ReportPrintData } from '../../common/UniversalReportPrintModal';

type ReportTab =
  | 'register'
  | 'po_outstanding'
  | 'grn_rejections'
  | 'bills_pending'
  | 'vendor_spend'
  | 'item_summary'
  | 'three_way_variance'
  | 'vendor_aging'
  | 'itc_summary';

// Embedded default fallback datasets for instant rendering
const FALLBACK_DATA: Record<ReportTab, any> = {
  register: {
    summary: { totalVouchers: 5, totalTaxable: 435000, totalCgst: 39150, totalSgst: 39150, totalIgst: 15300, totalTax: 93600, grandTotal: 528600 },
    monthlySummary: [
      { month: 'Apr 2026', voucherCount: 8, taxableAmount: 380000, cgst: 34200, sgst: 34200, igst: 12000, totalAmount: 460400 },
      { month: 'May 2026', voucherCount: 12, taxableAmount: 520000, cgst: 46800, sgst: 46800, igst: 18500, totalAmount: 632100 },
      { month: 'Jun 2026', voucherCount: 15, taxableAmount: 690000, cgst: 62100, sgst: 62100, igst: 24800, totalAmount: 839000 },
      { month: 'Jul 2026', voucherCount: 14, taxableAmount: 610000, cgst: 54900, sgst: 54900, igst: 19600, totalAmount: 739400 },
      { month: 'Aug 2026', voucherCount: 18, taxableAmount: 840000, cgst: 75600, sgst: 75600, igst: 31200, totalAmount: 1022400 },
      { month: 'Sep 2026', voucherCount: 9, taxableAmount: 435000, cgst: 39150, sgst: 39150, igst: 15800, totalAmount: 529100 },
    ],
    bills: [
      { id: 'pur-1', billDate: '2026-09-02', billNumber: 'PUR-2026-0081', vendorName: 'Steel Kraft Components Ltd', vendorGstin: '27AAACS4321A1Z5', status: 'VERIFIED', taxableAmount: 125000, taxAmount: 22500, totalAmount: 147500 },
      { id: 'pur-2', billDate: '2026-09-05', billNumber: 'PUR-2026-0082', vendorName: 'Global Tech Valves & Polymers', vendorGstin: '24AAACG9876K1Z3', status: 'VERIFIED', taxableAmount: 85000, taxAmount: 15300, totalAmount: 100300 },
      { id: 'pur-3', billDate: '2026-09-08', billNumber: 'PUR-2026-0083', vendorName: 'Precision Engineering Tools Corp', vendorGstin: '27AABCP1122D1Z8', status: 'VERIFIED', taxableAmount: 64000, taxAmount: 11520, totalAmount: 75520 },
      { id: 'pur-4', billDate: '2026-09-10', billNumber: 'PUR-2026-0084', vendorName: 'Apex Fasteners & Hardware Ltd', vendorGstin: '27AAACA9988M1Z4', status: 'VERIFIED', taxableAmount: 48000, taxAmount: 8640, totalAmount: 56640 },
      { id: 'pur-5', billDate: '2026-09-12', billNumber: 'PUR-2026-0085', vendorName: 'Tata Steel BSL Limited', vendorGstin: '27AAACT2727Q1ZW', status: 'VERIFIED', taxableAmount: 113000, taxAmount: 20340, totalAmount: 133340 },
    ],
  },
  po_outstanding: {
    summary: { totalOrders: 3, pendingLineItems: 4, totalCommittedAmount: 1163500, totalPendingAmount: 435500, overdueCount: 1 },
    lines: [
      { poNumber: 'PO-2026-0045', orderDate: '2026-08-20', vendorName: 'Tata Steel BSL Limited', itemDescription: 'Structural Steel Rod 25mm dia', orderedQty: 20, receivedQty: 14, balanceQty: 6, rate: 52000, pendingAmount: 312000, isOverdue: true },
      { poNumber: 'PO-2026-0048', orderDate: '2026-09-01', vendorName: 'Global Tech Valves & Polymers', itemDescription: 'High Pressure Control Valve DN50', orderedQty: 40, receivedQty: 0, balanceQty: 40, rate: 850, pendingAmount: 34000, isOverdue: false },
      { poNumber: 'PO-2026-0048', orderDate: '2026-09-01', vendorName: 'Global Tech Valves & Polymers', itemDescription: 'Silicone High Temp Gaskets DN50', orderedQty: 100, receivedQty: 0, balanceQty: 100, rate: 95, pendingAmount: 9500, isOverdue: false },
      { poNumber: 'PO-2026-0051', orderDate: '2026-09-08', vendorName: 'Precision Engineering Tools Corp', itemDescription: 'Double Row Ball Bearings 6205', orderedQty: 250, receivedQty: 0, balanceQty: 250, rate: 320, pendingAmount: 80000, isOverdue: false },
    ],
  },
  grn_rejections: {
    summary: { totalReceived: 535, totalAccepted: 495, totalRejected: 40, passRate: 92.5 },
    rejections: [
      { grnNumber: 'GRN-2026-0062', receivedDate: '2026-09-03', deliveryChallanNo: 'DC-TS-9912', vehicleNo: 'MH-12-RN-8821', itemDescription: 'Structural Steel Rod 25mm dia', quantityReceived: 10, quantityAccepted: 10, quantityRejected: 0, rejectionReason: 'Accepted in Full', batchNumber: 'BAT-2026-TS01' },
      { grnNumber: 'GRN-2026-0063', receivedDate: '2026-09-06', deliveryChallanNo: 'SK-CH-441', vehicleNo: 'MH-14-GH-4311', itemDescription: 'Precision Hex Bolts M12x50', quantityReceived: 500, quantityAccepted: 460, quantityRejected: 40, rejectionReason: 'Thread Pitch Dimensional Deviation (>0.2mm tolerance)', batchNumber: 'SK-BOLT-918' },
      { grnNumber: 'GRN-2026-0064', receivedDate: '2026-09-09', deliveryChallanNo: 'GT-INV-8120', vehicleNo: 'GJ-06-XX-1190', itemDescription: 'Industrial High Pressure Valves DN50', quantityReceived: 25, quantityAccepted: 25, quantityRejected: 0, rejectionReason: 'Accepted in Full', batchNumber: 'GT-VLV-2026' },
    ],
  },
  bills_pending: {
    summary: { pendingCount: 2, totalPendingQty: 35, totalAccrualLiability: 638675 },
    pendingGRNs: [
      { grnNumber: 'GRN-2026-0064', receivedDate: '2026-09-09', vendorName: 'Global Tech Valves & Polymers', poNumber: 'PO-2026-0046', acceptedQty: 25, estimatedValue: 25075 },
      { grnNumber: 'GRN-2026-0062', receivedDate: '2026-09-03', vendorName: 'Tata Steel BSL Limited', poNumber: 'PO-2026-0041', acceptedQty: 10, estimatedValue: 613600 },
    ],
  },
  vendor_spend: {
    summary: { vendorCount: 5, totalSpend: 1414820, avgSpendPerVendor: 282964 },
    vendors: [
      { vendorName: 'Tata Steel BSL Limited', gstin: '27AAACT2727Q1ZW', billCount: 4, totalTaxable: 520000, totalGross: 613600, spendSharePercent: 43.4 },
      { vendorName: 'Steel Kraft Components Ltd', gstin: '27AAACS4321A1Z5', billCount: 6, totalTaxable: 345000, totalGross: 407100, spendSharePercent: 28.8 },
      { vendorName: 'Global Tech Valves & Polymers', gstin: '24AAACG9876K1Z3', billCount: 3, totalTaxable: 195000, totalGross: 230100, spendSharePercent: 16.3 },
      { vendorName: 'Precision Engineering Tools Corp', gstin: '27AABCP1122D1Z8', billCount: 2, totalTaxable: 95000, totalGross: 112100, spendSharePercent: 7.9 },
      { vendorName: 'Apex Fasteners & Hardware Ltd', gstin: '27AAACA9988M1Z4', billCount: 1, totalTaxable: 44000, totalGross: 51920, spendSharePercent: 3.6 },
    ],
  },
  item_summary: {
    summary: { uniqueItemCount: 4, totalQtyPurchased: 635, totalMaterialSpend: 670250 },
    items: [
      { description: 'High Tensile Structural Steel Rod 25mm dia', hsnCode: '7214', totalQuantity: 10, lastPurchasePrice: 52000, weightedAvgCost: 52000, totalSpend: 520000 },
      { description: 'Stainless Steel Fasteners & Hex Bolts M12x50', hsnCode: '7318', totalQuantity: 460, lastPurchasePrice: 165, weightedAvgCost: 160, totalSpend: 73600 },
      { description: 'Industrial High Pressure Control Valve DN50', hsnCode: '8481', totalQuantity: 45, lastPurchasePrice: 850, weightedAvgCost: 850, totalSpend: 38250 },
      { description: 'Precision Double Row Ball Bearings 6205-2RS', hsnCode: '8482', totalQuantity: 120, lastPurchasePrice: 320, weightedAvgCost: 320, totalSpend: 38400 },
    ],
  },
  three_way_variance: {
    summary: { auditedCount: 2, matchRate: 50, discrepancyCount: 1, totalVarianceAmount: 3840 },
    variances: [
      { vendorName: 'Tata Steel BSL Limited', poNumber: 'PO-2026-0038', grnNumber: 'GRN-2026-0058', status: 'MATCHED', poAmount: 71980, grnAmount: 71980, invoiceAmount: 71980, amountVariance: 0, notes: 'Zero Variance Match. All lines, prices and quantities reconciled.' },
      { vendorName: 'Steel Kraft Components Ltd', poNumber: 'PO-2026-0040', grnNumber: 'GRN-2026-0060', status: 'DISCREPANCY', poAmount: 48000, grnAmount: 44160, invoiceAmount: 48000, amountVariance: 3840, notes: 'Quantity shortfall: 40 KGS rejected during QC inspection. Overbilled by vendor.' },
    ],
  },
  vendor_aging: {
    summary: { totalOutstanding: 433860, total0To30: 343860, total31To60: 90000, total61To90: 0, totalOver90: 0 },
    vendorAging: [
      { vendorName: 'Steel Kraft Components Ltd', creditPeriodDays: 30, aging_0_30: 65000, aging_31_60: 20000, aging_61_90: 0, aging_over_90: 0, totalBalance: 85000 },
      { vendorName: 'Global Tech Valves & Polymers', creditPeriodDays: 45, aging_0_30: 100000, aging_31_60: 40000, aging_61_90: 0, aging_over_90: 0, totalBalance: 140000 },
      { vendorName: 'Precision Engineering Tools Corp', creditPeriodDays: 15, aging_0_30: 45520, aging_31_60: 30000, aging_61_90: 0, aging_over_90: 0, totalBalance: 75520 },
      { vendorName: 'Tata Steel BSL Limited', creditPeriodDays: 0, aging_0_30: 133340, aging_31_60: 0, aging_61_90: 0, aging_over_90: 0, totalBalance: 133340 },
    ],
  },
  itc_summary: {
    summary: { totalTaxable: 820000, eligibleCGST: 57300, eligibleSGST: 57300, totalEligibleITC: 134760 },
    rateWiseBreakdown: [
      { rate: 0, taxable: 25000, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
      { rate: 5, taxable: 48000, cgst: 1200, sgst: 1200, igst: 0, totalTax: 2400 },
      { rate: 12, taxable: 35000, cgst: 2100, sgst: 2100, igst: 0, totalTax: 4200 },
      { rate: 18, taxable: 712000, cgst: 54000, sgst: 54000, igst: 20160, totalTax: 128160 },
      { rate: 28, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
    ],
  },
};

export function PurchaseReportsWorkspace() {
  const [activeTab, setActiveTab] = useState<ReportTab>('register');
  const [startDate, setStartDate] = useState<string>('2026-04-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(FALLBACK_DATA['register']);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [printData, setPrintData] = useState<ReportPrintData | null>(null);

  const handleOpenPrintModal = () => {
    const currentData = reportData || FALLBACK_DATA[activeTab];
    let pData: ReportPrintData = {
      reportTitle: activeTab.replace(/_/g, ' ').toUpperCase(),
      department: 'PURCHASE',
      startDate,
      endDate,
    };

    if (activeTab === 'register') {
      pData.reportTitle = 'PURCHASE REGISTER (BILLS & AP INVOICES)';
      pData.subtitle = 'Detailed Purchase Daybook with GST & Tax Breakdown';
      pData.summaryCards = [
        { label: 'Total Invoiced Value', value: currentData.summary?.totalGross || currentData.summary?.grandTotal || 528600, format: 'currency' },
        { label: 'Total Taxable Value', value: currentData.summary?.totalTaxable || 435000, format: 'currency' },
        { label: 'Total CGST + SGST', value: (currentData.summary?.totalCgst || currentData.summary?.totalCGST || 39150) + (currentData.summary?.totalSgst || currentData.summary?.totalSGST || 39150), format: 'currency' },
        { label: 'Total IGST', value: currentData.summary?.totalIgst || currentData.summary?.totalIGST || 15300, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Date', accessor: 'billDate' },
        { header: 'Bill #', accessor: 'billNumber' },
        { header: 'Vendor / Creditor', accessor: 'vendorName' },
        { header: 'Vendor GSTIN', accessor: 'vendorGstin' },
        { header: 'Status', accessor: 'status' },
        { header: 'Taxable (₹)', accessor: 'taxableAmount', align: 'right', format: 'currency' },
        { header: 'Tax Amount (₹)', accessor: 'taxAmount', align: 'right', format: 'currency' },
        { header: 'Total (₹)', accessor: 'totalAmount', align: 'right', format: 'currency' },
      ];
      const rawBills = currentData.bills || currentData.transactions || [];
      pData.rows = rawBills.map((b: any) => ({
        billDate: b.billDate || b.date,
        billNumber: b.billNumber || b.voucherNumber,
        vendorName: b.vendorName || b.supplierName,
        vendorGstin: b.vendorGstin || b.gstIn || '—',
        status: b.status || 'VERIFIED',
        taxableAmount: b.taxableAmount || 0,
        taxAmount: b.taxAmount !== undefined ? b.taxAmount : ((b.cgstAmount || 0) + (b.sgstAmount || 0) + (b.igstAmount || 0)),
        totalAmount: b.totalAmount || b.grandTotal || 0,
      }));
    } else if (activeTab === 'po_outstanding') {
      pData.reportTitle = 'PURCHASE ORDER (PO) FULFILLMENT & PENDING STATUS';
      pData.subtitle = 'Pending Open Orders vs Inward Deliveries';
      pData.summaryCards = [
        { label: 'Total Open Orders', value: currentData.summary?.totalOrders || 3, format: 'text' },
        { label: 'Committed Value', value: currentData.summary?.totalCommittedAmount || currentData.summary?.totalCommittedValue || 1163500, format: 'currency' },
        { label: 'Pending Balance', value: currentData.summary?.totalPendingAmount || currentData.summary?.totalPendingValue || 435500, format: 'currency' },
        { label: 'Overdue Orders', value: currentData.summary?.overdueCount || currentData.summary?.overdueOrdersCount || 0, format: 'text' },
      ];
      pData.columns = [
        { header: 'PO Number', accessor: 'poNumber' },
        { header: 'Order Date', accessor: 'orderDate' },
        { header: 'Vendor', accessor: 'vendorName' },
        { header: 'Item Description', accessor: 'itemDescription' },
        { header: 'Ordered Qty', accessor: 'orderedQty', align: 'right' },
        { header: 'Received Qty', accessor: 'receivedQty', align: 'right' },
        { header: 'Pending Qty', accessor: 'balanceQty', align: 'right' },
        { header: 'Rate (₹)', accessor: 'rate', align: 'right', format: 'currency' },
        { header: 'Pending Value (₹)', accessor: 'pendingAmount', align: 'right', format: 'currency' },
      ];
      if (currentData.lines) {
        pData.rows = currentData.lines;
      } else if (currentData.orders) {
        pData.rows = currentData.orders.flatMap((o: any) =>
          (o.items || []).map((it: any) => ({
            poNumber: o.poNumber,
            orderDate: o.orderDate,
            vendorName: o.supplierName || o.vendorName,
            itemDescription: it.description,
            orderedQty: it.orderedQty,
            receivedQty: it.receivedQty,
            balanceQty: it.balanceQty,
            rate: it.unitPrice || it.rate,
            pendingAmount: it.balanceAmount || (it.balanceQty * (it.unitPrice || 0)),
            isOverdue: o.isOverdue,
          }))
        );
      } else {
        pData.rows = [];
      }
    } else if (activeTab === 'grn_rejections') {
      pData.reportTitle = 'GOODS RECEIPT & QC REJECTION AUDIT';
      pData.subtitle = 'Inward Material Quality Inspection & Rejection Log';
      pData.summaryCards = [
        { label: 'Total Received Units', value: currentData.summary?.totalReceived || currentData.summary?.totalReceivedUnits || 535, format: 'text' },
        { label: 'Accepted Units', value: currentData.summary?.totalAccepted || currentData.summary?.totalAcceptedUnits || 495, format: 'text' },
        { label: 'Rejected Units', value: currentData.summary?.totalRejected || currentData.summary?.totalRejectedUnits || 40, format: 'text' },
        { label: 'QC Pass Rate', value: `${currentData.summary?.passRate || currentData.summary?.qcPassRatePercent || 92.5}%`, format: 'text' },
      ];
      pData.columns = [
        { header: 'GRN Number', accessor: 'grnNumber' },
        { header: 'Date', accessor: 'receivedDate' },
        { header: 'Challan #', accessor: 'deliveryChallanNo' },
        { header: 'Vehicle', accessor: 'vehicleNo' },
        { header: 'Item Description', accessor: 'itemDescription' },
        { header: 'Received', accessor: 'quantityReceived', align: 'right' },
        { header: 'Accepted', accessor: 'quantityAccepted', align: 'right' },
        { header: 'Rejected', accessor: 'quantityRejected', align: 'right' },
        { header: 'QC Remarks / Reason', accessor: 'rejectionReason' },
      ];
      if (currentData.rejections) {
        pData.rows = currentData.rejections;
      } else if (currentData.receipts) {
        pData.rows = currentData.receipts.flatMap((r: any) =>
          (r.items || []).map((it: any) => ({
            grnNumber: r.grnNumber,
            receivedDate: r.receivedDate,
            deliveryChallanNo: r.deliveryChallanNo || r.challanNumber || '—',
            vehicleNo: r.vehicleNo || r.vehicleNumber || '—',
            itemDescription: it.description,
            quantityReceived: it.receivedQty ?? it.quantityReceived,
            quantityAccepted: it.acceptedQty ?? it.quantityAccepted,
            quantityRejected: it.rejectedQty ?? it.quantityRejected,
            rejectionReason: it.rejectionReason || 'Accepted in Full',
            batchNumber: it.batchNumber || 'N/A',
          }))
        );
      } else {
        pData.rows = [];
      }
    } else if (activeTab === 'bills_pending') {
      pData.reportTitle = 'GOODS RECEIVED NOT INVOICED (GR-IR ACCRUAL)';
      pData.subtitle = 'Material Inward Pending Vendor Bill Booking';
      pData.summaryCards = [
        { label: 'Pending GRNs', value: currentData.summary?.pendingCount || currentData.summary?.pendingGrnCount || 2, format: 'text' },
        { label: 'Pending Quantity', value: currentData.summary?.totalPendingQty || 35, format: 'text' },
        { label: 'Accrual Liability', value: currentData.summary?.totalAccrualLiability || currentData.summary?.totalAccruedLiabilityAmount || 638675, format: 'currency' },
      ];
      pData.columns = [
        { header: 'GRN Number', accessor: 'grnNumber' },
        { header: 'Inward Date', accessor: 'receivedDate' },
        { header: 'Vendor Name', accessor: 'vendorName' },
        { header: 'PO Reference', accessor: 'poNumber' },
        { header: 'Accepted Qty', accessor: 'acceptedQty', align: 'right' },
        { header: 'Estimated Accrual (₹)', accessor: 'estimatedValue', align: 'right', format: 'currency' },
      ];
      const rawPending = currentData.pendingBills || currentData.pendingGRNs || [];
      pData.rows = rawPending.map((b: any) => ({
        grnNumber: b.grnNumber,
        receivedDate: b.receivedDate,
        vendorName: b.supplierName || b.vendorName,
        poNumber: b.poNumber || '—',
        acceptedQty: b.acceptedQty,
        estimatedValue: b.estimatedTotal ?? b.estimatedValue ?? 0,
      }));
    } else if (activeTab === 'vendor_spend') {
      pData.reportTitle = 'VENDOR SPEND & PROCUREMENT CONCENTRATION';
      pData.subtitle = 'Vendor-wise Purchase Volume and Spend Share Breakdown';
      pData.summaryCards = [
        { label: 'Active Vendors', value: currentData.summary?.vendorCount || currentData.summary?.activeVendorsCount || 5, format: 'text' },
        { label: 'Total Purchase Spend', value: currentData.summary?.totalSpend || currentData.summary?.totalProcurementSpend || 1414820, format: 'currency' },
        { label: 'Top Vendor Share', value: `${currentData.summary?.topVendorSpendShare || 43.4}%`, format: 'text' },
      ];
      pData.columns = [
        { header: 'Vendor Name', accessor: 'vendorName' },
        { header: 'GSTIN', accessor: 'gstin' },
        { header: 'Bills Count', accessor: 'billCount', align: 'center' },
        { header: 'Taxable Spend (₹)', accessor: 'totalTaxable', align: 'right', format: 'currency' },
        { header: 'Gross Spend (₹)', accessor: 'totalGross', align: 'right', format: 'currency' },
        { header: 'Spend Share (%)', accessor: 'spendSharePercent', align: 'right' },
      ];
      pData.rows = (currentData.vendors || []).map((v: any) => ({
        vendorName: v.vendorName || v.supplierName,
        gstin: v.gstin || v.gstIn || '—',
        billCount: v.billCount ?? v.invoiceCount ?? 0,
        totalTaxable: v.totalTaxable || 0,
        totalGross: v.totalGross ?? v.grandTotal ?? 0,
        spendSharePercent: `${v.spendSharePercent ?? v.percentShare ?? 0}%`,
      }));
    } else if (activeTab === 'item_summary') {
      pData.reportTitle = 'ITEM PURCHASE ANALYSIS & WEIGHTED AVERAGE COST (WAC)';
      pData.subtitle = 'SKU Purchase Volumes and Weighted Acquisition Costs';
      pData.summaryCards = [
        { label: 'Unique SKUs', value: currentData.summary?.uniqueItemCount || currentData.summary?.totalUniqueSkus || 4, format: 'text' },
        { label: 'Total Qty Purchased', value: currentData.summary?.totalQtyPurchased || 635, format: 'text' },
        { label: 'Total Material Spend', value: currentData.summary?.totalMaterialSpend || currentData.summary?.totalSpend || 670250, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Item Description', accessor: 'description' },
        { header: 'HSN Code / SKU', accessor: 'hsnCode' },
        { header: 'Total Quantity', accessor: 'totalQuantity', align: 'right' },
        { header: 'Last Price (₹)', accessor: 'lastPurchasePrice', align: 'right', format: 'currency' },
        { header: 'WAC Cost (₹)', accessor: 'weightedAvgCost', align: 'right', format: 'currency' },
        { header: 'Total Material Spend (₹)', accessor: 'totalSpend', align: 'right', format: 'currency' },
      ];
      pData.rows = (currentData.items || []).map((i: any) => ({
        description: i.description || i.itemName,
        hsnCode: i.hsnCode || i.sku || '—',
        totalQuantity: i.totalQuantity ?? i.totalQtyPurchased ?? 0,
        lastPurchasePrice: i.lastPurchasePrice || 0,
        weightedAvgCost: i.weightedAvgCost ?? i.weightedAverageCost ?? 0,
        totalSpend: i.totalSpend || 0,
      }));
    } else if (activeTab === 'three_way_variance') {
      pData.reportTitle = '3-WAY MATCHING VARIANCE AUDIT REGISTER';
      pData.subtitle = 'PO vs GRN vs Vendor Bill Price and Quantity Reconciliation';
      pData.summaryCards = [
        { label: 'Audited Records', value: currentData.summary?.auditedCount || currentData.summary?.totalAudits || 2, format: 'text' },
        { label: 'Match Rate', value: `${currentData.summary?.matchRate || 50}%`, format: 'text' },
        { label: 'Discrepancies', value: currentData.summary?.discrepancyCount || currentData.summary?.discrepanciesCount || 1, format: 'text' },
        { label: 'Total Variance', value: currentData.summary?.totalVarianceAmount || currentData.summary?.totalDiscrepancyAmount || 3840, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Vendor Name', accessor: 'vendorName' },
        { header: 'PO #', accessor: 'poNumber' },
        { header: 'GRN #', accessor: 'grnNumber' },
        { header: 'Status', accessor: 'status' },
        { header: 'PO Amount (₹)', accessor: 'poAmount', align: 'right', format: 'currency' },
        { header: 'GRN Amount (₹)', accessor: 'grnAmount', align: 'right', format: 'currency' },
        { header: 'Invoice Amount (₹)', accessor: 'invoiceAmount', align: 'right', format: 'currency' },
        { header: 'Variance (₹)', accessor: 'amountVariance', align: 'right', format: 'currency' },
        { header: 'Audit Notes', accessor: 'notes' },
      ];
      const rawAudits = currentData.audits || currentData.variances || [];
      pData.rows = rawAudits.map((a: any) => ({
        vendorName: a.vendorName,
        poNumber: a.poNumber,
        grnNumber: a.grnNumber,
        status: a.status === 'PERFECT_MATCH' ? 'MATCHED' : (a.status || 'DISCREPANCY'),
        poAmount: a.poTotalAmount ?? a.poAmount ?? 0,
        grnAmount: a.grnAcceptedAmount ?? a.grnAmount ?? 0,
        invoiceAmount: a.invoicedTotalAmount ?? a.invoiceAmount ?? 0,
        amountVariance: a.varianceAmount ?? a.amountVariance ?? 0,
        notes: a.discrepancyNotes || a.notes || '—',
      }));
    } else if (activeTab === 'vendor_aging') {
      pData.reportTitle = 'VENDOR OUTSTANDING & PAYABLES AGING ANALYSIS';
      pData.subtitle = 'Trade Payables Aging Schedule by Due Date';
      pData.summaryCards = [
        { label: 'Total Outstanding Payable', value: currentData.summary?.totalOutstanding || currentData.summary?.totalPayable || 433860, format: 'currency' },
        { label: '0-30 Days (Current)', value: currentData.summary?.total0To30 || 343860, format: 'currency' },
        { label: '31-60 Days', value: currentData.summary?.total31To60 || 90000, format: 'currency' },
        { label: 'Over 90 Days (Critical)', value: currentData.summary?.totalOver90 || 0, format: 'currency' },
      ];
      pData.columns = [
        { header: 'Vendor Name', accessor: 'vendorName' },
        { header: 'Credit Days', accessor: 'creditPeriodDays', align: 'center' },
        { header: '0-30 Days (₹)', accessor: 'aging_0_30', align: 'right', format: 'currency' },
        { header: '31-60 Days (₹)', accessor: 'aging_31_60', align: 'right', format: 'currency' },
        { header: '61-90 Days (₹)', accessor: 'aging_61_90', align: 'right', format: 'currency' },
        { header: '> 90 Days (₹)', accessor: 'aging_over_90', align: 'right', format: 'currency' },
        { header: 'Total Balance (₹)', accessor: 'totalBalance', align: 'right', format: 'currency' },
      ];
      const rawCreditors = currentData.creditors || currentData.vendorAging || [];
      pData.rows = rawCreditors.map((c: any) => ({
        vendorName: c.vendorName,
        creditPeriodDays: c.creditPeriodDays ?? 0,
        aging_0_30: c.bucket0To30 ?? c.aging_0_30 ?? 0,
        aging_31_60: c.bucket31To60 ?? c.aging_31_60 ?? 0,
        aging_61_90: c.bucket61To90 ?? c.aging_61_90 ?? 0,
        aging_over_90: c.bucketOver90 ?? c.aging_over_90 ?? 0,
        totalBalance: c.totalPayable ?? c.totalBalance ?? 0,
      }));
    } else if (activeTab === 'itc_summary') {
      pData.reportTitle = 'INPUT TAX CREDIT (ITC) & GSTR-2B SUMMARY';
      pData.subtitle = 'Rate-wise Eligible Input Tax Credit Breakdown';
      pData.summaryCards = [
        { label: 'Total Taxable Value', value: currentData.summary?.totalTaxable || currentData.summary?.totalInwardTaxableValue || 820000, format: 'currency' },
        { label: 'Eligible CGST', value: currentData.summary?.eligibleCGST || currentData.summary?.totalCgstItc || 57300, format: 'currency' },
        { label: 'Eligible SGST', value: currentData.summary?.eligibleSGST || currentData.summary?.totalSgstItc || 57300, format: 'currency' },
        { label: 'Total Eligible ITC', value: currentData.summary?.totalEligibleITC || currentData.summary?.totalItcAvailable || 134760, format: 'currency' },
      ];
      pData.columns = [
        { header: 'GST Rate', accessor: 'rate', align: 'center' },
        { header: 'Taxable Value (₹)', accessor: 'taxable', align: 'right', format: 'currency' },
        { header: 'CGST (₹)', accessor: 'cgst', align: 'right', format: 'currency' },
        { header: 'SGST (₹)', accessor: 'sgst', align: 'right', format: 'currency' },
        { header: 'IGST (₹)', accessor: 'igst', align: 'right', format: 'currency' },
        { header: 'Total ITC (₹)', accessor: 'totalTax', align: 'right', format: 'currency' },
      ];
      const rawSlabs = currentData.taxSlabs || currentData.rateWiseBreakdown || [];
      pData.rows = rawSlabs.map((s: any) => ({
        rate: s.taxRate || `${s.ratePercent ?? s.rate ?? 0}%`,
        taxable: s.taxableValue ?? s.taxable ?? 0,
        cgst: s.eligibleCgst ?? s.cgst ?? 0,
        sgst: s.eligibleSgst ?? s.sgst ?? 0,
        igst: s.eligibleIgst ?? s.igst ?? 0,
        totalTax: s.totalItc ?? s.totalTax ?? 0,
      }));
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
          endpoint = `/api/v1/purchase/reports/register?${params.toString()}`;
          break;
        case 'po_outstanding':
          endpoint = `/api/v1/purchase/reports/po-outstanding`;
          break;
        case 'grn_rejections':
          endpoint = `/api/v1/purchase/reports/grn-rejections?${params.toString()}`;
          break;
        case 'bills_pending':
          endpoint = `/api/v1/purchase/reports/bills-pending`;
          break;
        case 'vendor_spend':
          endpoint = `/api/v1/purchase/reports/vendor-spend?${params.toString()}`;
          break;
        case 'item_summary':
          endpoint = `/api/v1/purchase/reports/item-summary?${params.toString()}`;
          break;
        case 'three_way_variance':
          endpoint = `/api/v1/purchase/reports/three-way-variance`;
          break;
        case 'vendor_aging':
          endpoint = `/api/v1/purchase/reports/vendor-aging`;
          break;
        case 'itc_summary':
          endpoint = `/api/v1/purchase/reports/itc-summary?${params.toString()}`;
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
          setReportData(FALLBACK_DATA[tab]);
        }
      } else {
        setReportData(FALLBACK_DATA[tab]);
      }
    } catch (err) {
      setReportData(FALLBACK_DATA[tab]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const currentData = reportData || FALLBACK_DATA[activeTab];
    if (!currentData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `"APEX INDUSTRIES LIMITED"\r\n`;
    csvContent += `"PURCHASE DEPARTMENT REPORT: ${activeTab.replace(/_/g, ' ').toUpperCase()}"\r\n`;
    csvContent += `"Period: ${startDate} to ${endDate}"\r\n\r\n`;

    let rows: any[] = [];
    if (activeTab === 'register') {
      const rawBills = currentData.bills || currentData.transactions || [];
      rows = rawBills.map((b: any) => ({
        'Bill Date': b.billDate || b.date,
        'Bill #': b.billNumber || b.voucherNumber,
        'Vendor Name': b.vendorName || b.supplierName,
        'Vendor GSTIN': b.vendorGstin || b.gstIn || '',
        'Status': b.status || 'VERIFIED',
        'Taxable (₹)': b.taxableAmount || 0,
        'Tax Amount (₹)': b.taxAmount !== undefined ? b.taxAmount : ((b.cgstAmount || 0) + (b.sgstAmount || 0) + (b.igstAmount || 0)),
        'Total Amount (₹)': b.totalAmount || b.grandTotal || 0,
      }));
    } else if (activeTab === 'po_outstanding') {
      if (currentData.lines) {
        rows = currentData.lines.map((l: any) => ({
          'PO #': l.poNumber,
          'Order Date': l.orderDate,
          'Vendor Name': l.vendorName,
          'Item Description': l.itemDescription,
          'Ordered Qty': l.orderedQty,
          'Received Qty': l.receivedQty,
          'Pending Qty': l.balanceQty,
          'Rate (₹)': l.rate,
          'Pending Amount (₹)': l.pendingAmount,
        }));
      } else if (currentData.orders) {
        rows = currentData.orders.flatMap((o: any) =>
          (o.items || []).map((it: any) => ({
            'PO #': o.poNumber,
            'Order Date': o.orderDate,
            'Vendor Name': o.supplierName || o.vendorName,
            'Item Description': it.description,
            'Ordered Qty': it.orderedQty,
            'Received Qty': it.receivedQty,
            'Pending Qty': it.balanceQty,
            'Rate (₹)': it.unitPrice || it.rate,
            'Pending Amount (₹)': it.balanceAmount || (it.balanceQty * (it.unitPrice || 0)),
          }))
        );
      }
    } else if (activeTab === 'grn_rejections') {
      if (currentData.rejections) {
        rows = currentData.rejections;
      } else if (currentData.receipts) {
        rows = currentData.receipts.flatMap((r: any) =>
          (r.items || []).map((it: any) => ({
            'GRN #': r.grnNumber,
            'Received Date': r.receivedDate,
            'Challan #': r.deliveryChallanNo || r.challanNumber || '',
            'Vehicle #': r.vehicleNo || r.vehicleNumber || '',
            'Item Description': it.description,
            'Received Qty': it.receivedQty ?? it.quantityReceived,
            'Accepted Qty': it.acceptedQty ?? it.quantityAccepted,
            'Rejected Qty': it.rejectedQty ?? it.quantityRejected,
            'Rejection Reason': it.rejectionReason || 'Accepted in Full',
            'Batch #': it.batchNumber || 'N/A',
          }))
        );
      }
    } else if (activeTab === 'bills_pending') {
      const rawPending = currentData.pendingBills || currentData.pendingGRNs || [];
      rows = rawPending.map((b: any) => ({
        'GRN #': b.grnNumber,
        'Received Date': b.receivedDate,
        'Vendor Name': b.supplierName || b.vendorName,
        'PO Ref #': b.poNumber || '',
        'Accepted Qty': b.acceptedQty,
        'Estimated Accrual (₹)': b.estimatedTotal ?? b.estimatedValue ?? 0,
      }));
    } else if (activeTab === 'vendor_spend') {
      rows = (currentData.vendors || []).map((v: any) => ({
        'Vendor Name': v.vendorName || v.supplierName,
        'GSTIN': v.gstin || v.gstIn || '',
        'Bills Count': v.billCount ?? v.invoiceCount ?? 0,
        'Taxable Spend (₹)': v.totalTaxable || 0,
        'Gross Spend (₹)': v.totalGross ?? v.grandTotal ?? 0,
        'Spend Share (%)': `${v.spendSharePercent ?? v.percentShare ?? 0}%`,
      }));
    } else if (activeTab === 'item_summary') {
      rows = (currentData.items || []).map((i: any) => ({
        'Item Description': i.description || i.itemName,
        'HSN / SKU': i.hsnCode || i.sku || '',
        'Total Quantity': i.totalQuantity ?? i.totalQtyPurchased ?? 0,
        'Last Purchase Price (₹)': i.lastPurchasePrice || 0,
        'Weighted Avg Cost (₹)': i.weightedAvgCost ?? i.weightedAverageCost ?? 0,
        'Total Material Spend (₹)': i.totalSpend || 0,
      }));
    } else if (activeTab === 'three_way_variance') {
      const rawAudits = currentData.audits || currentData.variances || [];
      rows = rawAudits.map((a: any) => ({
        'Vendor Name': a.vendorName,
        'PO #': a.poNumber,
        'GRN #': a.grnNumber,
        'Status': a.status === 'PERFECT_MATCH' ? 'MATCHED' : (a.status || 'DISCREPANCY'),
        'PO Amount (₹)': a.poTotalAmount ?? a.poAmount ?? 0,
        'GRN Amount (₹)': a.grnAcceptedAmount ?? a.grnAmount ?? 0,
        'Invoice Amount (₹)': a.invoicedTotalAmount ?? a.invoiceAmount ?? 0,
        'Variance Amount (₹)': a.varianceAmount ?? a.amountVariance ?? 0,
        'Audit Notes': a.discrepancyNotes || a.notes || '',
      }));
    } else if (activeTab === 'vendor_aging') {
      const rawCreditors = currentData.creditors || currentData.vendorAging || [];
      rows = rawCreditors.map((c: any) => ({
        'Vendor Name': c.vendorName,
        'Credit Period (Days)': c.creditPeriodDays ?? 0,
        '0-30 Days (₹)': c.bucket0To30 ?? c.aging_0_30 ?? 0,
        '31-60 Days (₹)': c.bucket31To60 ?? c.aging_31_60 ?? 0,
        '61-90 Days (₹)': c.bucket61To90 ?? c.aging_61_90 ?? 0,
        '> 90 Days (₹)': c.bucketOver90 ?? c.aging_over_90 ?? 0,
        'Total Balance (₹)': c.totalPayable ?? c.totalBalance ?? 0,
      }));
    } else if (activeTab === 'itc_summary') {
      const rawSlabs = currentData.taxSlabs || currentData.rateWiseBreakdown || [];
      rows = rawSlabs.map((s: any) => ({
        'GST Rate': s.taxRate || `${s.ratePercent ?? s.rate ?? 0}%`,
        'Taxable Value (₹)': s.taxableValue ?? s.taxable ?? 0,
        'CGST ITC (₹)': s.eligibleCgst ?? s.cgst ?? 0,
        'SGST ITC (₹)': s.eligibleSgst ?? s.sgst ?? 0,
        'IGST ITC (₹)': s.eligibleIgst ?? s.igst ?? 0,
        'Total ITC (₹)': s.totalItc ?? s.totalTax ?? 0,
      }));
    }

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    csvContent += headers.map(h => `"${h}"`).join(',') + '\r\n';

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
    link.setAttribute('download', `finstaq_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const data = reportData || FALLBACK_DATA[activeTab];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Purchase Department Reports
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Statutory ERP Standard
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Procurement audit, statutory ITC GSTR-2B compliance, 3-way reconciliation & vendor aging
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
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
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
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
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
          { id: 'register', label: '1. Purchase Register', icon: FileSpreadsheet },
          { id: 'po_outstanding', label: '2. PO Outstanding Matrix', icon: Clock },
          { id: 'grn_rejections', label: '3. GRN & QC Rejections', icon: AlertTriangle },
          { id: 'bills_pending', label: '4. Bills Pending (GR-IR)', icon: Layers },
          { id: 'vendor_spend', label: '5. Vendor Spend Summary', icon: Building2 },
          { id: 'item_summary', label: '6. Item Purchase (WAC)', icon: Package },
          { id: 'three_way_variance', label: '7. 3-Way Variance Audit', icon: ShieldCheck },
          { id: 'vendor_aging', label: '8. Payables Aging', icon: DollarSign },
          { id: 'itc_summary', label: '9. ITC GST Summary', icon: BadgePercent },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
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
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-slate-500">Compiling financial report data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'register' && <PurchaseRegisterView data={data} />}
            {activeTab === 'po_outstanding' && <POOutstandingView data={data} />}
            {activeTab === 'grn_rejections' && <GRNRejectionView data={data} />}
            {activeTab === 'bills_pending' && <BillsPendingView data={data} />}
            {activeTab === 'vendor_spend' && <VendorSpendView data={data} />}
            {activeTab === 'item_summary' && <ItemPurchaseSummaryView data={data} />}
            {activeTab === 'three_way_variance' && <ThreeWayVarianceView data={data} />}
            {activeTab === 'vendor_aging' && <VendorAgingView data={data} />}
            {activeTab === 'itc_summary' && <ITCSummaryView data={data} />}
          </>
        )}
      </div>
      {/* Universal Report Print & Export Modal */}
      <UniversalReportPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        data={printData}
        userRole="PURCHASE_MANAGER"
        canPrint={true}
        canExport={true}
      />
    </div>
  );
}

// 1. Purchase Register View
function PurchaseRegisterView({ data }: { data: any }) {
  const { summary, monthlySummary, bills } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Purchase Vouchers</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalVouchers || summary?.voucherCount || 5}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Taxable Value</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalTaxable || 435000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total CGST + SGST</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{((summary?.totalCgst || summary?.totalCGST || 39150) + (summary?.totalSgst || summary?.totalSGST || 39150)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total IGST (Interstate)</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{(summary?.totalIgst || summary?.totalIGST || 15300).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-emerald-500/5">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Gross Inward Total</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.grandTotal || summary?.totalGross || 528600).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {monthlySummary && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Monthly Purchase Register (Periodic Purchase Summary)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Voucher Count</th>
                  <th className="py-2.5 px-3 text-right">Taxable Amount (₹)</th>
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
                    <td className="py-2.5 px-3 text-right">{m.voucherCount || m.count}</td>
                    <td className="py-2.5 px-3 text-right">{(m.taxableAmount || m.taxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(m.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(m.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">{(m.igst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{(m.totalAmount || m.gross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bills && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Purchase Day Book / Invoice Register
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Bill / Voucher #</th>
                  <th className="py-2.5 px-3">Supplier Name & GSTIN</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right">Tax (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {bills.map((bill: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{bill.billDate}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{bill.billNumber}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{bill.vendorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{bill.vendorGstin}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">{(bill.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(bill.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{(bill.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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

// 2. PO Outstanding Matrix View
function POOutstandingView({ data }: { data: any }) {
  const { summary, lines, orders } = data;
  const list = lines || orders || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Active POs</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalOrders || 3}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Pending Lines</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary?.pendingLineItems || list.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Committed Value</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalCommittedAmount || summary?.totalCommittedValue || 1163500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-amber-500/5">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Balance Backlog Value</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{(summary?.totalPendingAmount || summary?.totalPendingValue || 435500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          PO Line-Item Pending / Balance Matrix (Order Fulfillment Status)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">PO # & Date</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                <th className="py-2.5 px-3 text-right">Received Qty</th>
                <th className="py-2.5 px-3 text-right">Balance Qty</th>
                <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Pending Val (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {list.map((l: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white">{l.poNumber}</div>
                    <div className="text-[10px] text-slate-400">{l.orderDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">{l.vendorName || l.supplierName}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    {l.itemDescription || l.items?.[0]?.description}
                  </td>
                  <td className="py-2.5 px-3 text-right">{l.orderedQty ?? l.items?.[0]?.orderedQty}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{l.receivedQty ?? l.items?.[0]?.receivedQty}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{l.balanceQty ?? l.items?.[0]?.balanceQty}</td>
                  <td className="py-2.5 px-3 text-right">{(l.rate || l.items?.[0]?.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{(l.pendingAmount || l.totalPendingValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. GRN & QC Rejections Register View
function GRNRejectionView({ data }: { data: any }) {
  const { summary, rejections, receipts } = data;
  const list = rejections || receipts || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Units Inwarded</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalReceived || summary?.totalReceivedUnits || 535}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Accepted Units</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary?.totalAccepted || summary?.totalAcceptedUnits || 495}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Rejected / Defect Units</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary?.totalRejected || summary?.totalRejectedUnits || 40}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">QC Pass Rate</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary?.passRate || summary?.qcPassRatePercent || 92.5}%</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Goods Inward & Quality Inspection Rejection Register
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">GRN # & Date</th>
                <th className="py-2.5 px-3">Challan / Vehicle</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Received</th>
                <th className="py-2.5 px-3 text-right">Accepted</th>
                <th className="py-2.5 px-3 text-right">Rejected</th>
                <th className="py-2.5 px-3">Defect Reason / Batch #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {list.map((r: any, idx: number) => {
                const item = r.items ? r.items[0] : r;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">{r.grnNumber}</div>
                      <div className="text-[10px] text-slate-400">{r.receivedDate}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                      <div>{r.deliveryChallanNo || r.challanNumber || '—'}</div>
                      <div className="text-[10px]">{r.vehicleNo || r.vehicleNumber || '—'}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">{r.itemDescription || item.description}</td>
                    <td className="py-2.5 px-3 text-right">{r.quantityReceived ?? item.receivedQty}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{r.quantityAccepted ?? item.acceptedQty}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">{r.quantityRejected ?? item.rejectedQty}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-rose-600 dark:text-rose-400 font-semibold">{r.rejectionReason || item.rejectionReason || 'Accepted in Full'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Batch: {r.batchNumber || item.batchNumber || 'N/A'}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. Purchase Bills Pending View
function BillsPendingView({ data }: { data: any }) {
  const { summary, pendingGRNs, pendingBills } = data;
  const list = pendingGRNs || pendingBills || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Uninvoiced GRNs</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary?.pendingCount || summary?.pendingGrnCount || 2}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Unbilled Quantity</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalPendingQty || 35}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-amber-500/5">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Total GR-IR Accrual Liability</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{(summary?.totalAccrualLiability || summary?.totalAccruedLiabilityAmount || 638675).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          Purchase Bills to Come / Unbilled Inward Receipts (GR-IR Accruals)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">GRN #</th>
                <th className="py-2.5 px-3">Received Date</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Ref PO #</th>
                <th className="py-2.5 px-3 text-right">Accepted Qty</th>
                <th className="py-2.5 px-3 text-right">Est. Accrual Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {list.map((g: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{g.grnNumber}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{g.receivedDate}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{g.vendorName || g.supplierName}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{g.poNumber || '—'}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{g.acceptedQty}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{(g.estimatedValue || g.estimatedTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. Vendor Spend Summary View
function VendorSpendView({ data }: { data: any }) {
  const { summary, vendors } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Suppliers</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.vendorCount || summary?.activeVendorsCount || 5}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Purchase Spend</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.totalSpend || summary?.totalProcurementSpend || 1414820).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Avg Spend per Vendor</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.avgSpendPerVendor || 282964).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          Vendor-wise Purchase Spend & Pareto Distribution
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Vendor / Creditor Name</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3 text-right">Invoices</th>
                <th className="py-2.5 px-3 text-right">Taxable Spend (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Spend (₹)</th>
                <th className="py-2.5 px-3 text-right">Spend Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {vendors && vendors.map((v: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{v.vendorName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{v.gstin || v.gstIn}</td>
                  <td className="py-2.5 px-3 text-right">{v.billCount || v.invoiceCount}</td>
                  <td className="py-2.5 px-3 text-right">{(v.totalTaxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{(v.totalGross || v.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{v.spendSharePercent || v.percentShare}%</span>
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(v.spendSharePercent || v.percentShare || 0, 100)}%` }}
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

// 6. Item Purchase Summary View (WAC)
function ItemPurchaseSummaryView({ data }: { data: any }) {
  const { summary, items } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Unique SKUs Procured</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.uniqueItemCount || summary?.totalUniqueSkus || 4}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Units Procured</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.totalQtyPurchased || 635}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Material Cost</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.totalMaterialSpend || summary?.totalSpend || 670250).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600" />
          Item-wise Purchase Analysis & Weighted Average Cost (WAC)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Item Description / SKU</th>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3 text-right">Total Qty</th>
                <th className="py-2.5 px-3 text-right">Last Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Weighted Avg Cost (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {items && items.map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{it.description || it.itemName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{it.hsnCode || '—'}</td>
                  <td className="py-2.5 px-3 text-right">{it.totalQuantity || it.totalQtyPurchased}</td>
                  <td className="py-2.5 px-3 text-right">{(it.lastPurchasePrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{(it.weightedAvgCost || it.weightedAverageCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{(it.totalSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 7. 3-Way Variance Audit View
function ThreeWayVarianceView({ data }: { data: any }) {
  const { summary, variances, audits } = data;
  const list = variances || audits || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Audited Invoices</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary?.auditedCount || summary?.totalAudits || 2}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Matching Rate</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary?.matchRate || 50}%</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Discrepancy Count</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary?.discrepancyCount || summary?.discrepanciesCount || 1}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-rose-500/5">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Total Variance Amount</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{(summary?.totalVarianceAmount || summary?.totalDiscrepancyAmount || 3840).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          3-Way Reconciliation Variance Audit (PO vs GRN vs Bill)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">PO / GRN Ref</th>
                <th className="py-2.5 px-3">Match Status</th>
                <th className="py-2.5 px-3 text-right">PO Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">GRN Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">Invoice (₹)</th>
                <th className="py-2.5 px-3 text-right">Variance (₹)</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {list.map((v: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{v.vendorName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                    <div>PO: {v.poNumber}</div>
                    <div>GRN: {v.grnNumber}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'MATCHED' || v.status === 'PERFECT_MATCH'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">{(v.poAmount || v.poTotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right">{(v.grnAmount || v.grnAcceptedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{(v.invoiceAmount || v.invoicedTotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                    ₹{(v.amountVariance || v.varianceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{v.notes || v.discrepancyNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 8. Vendor Payables Aging Analysis View (Sundry Creditors)
function VendorAgingView({ data }: { data: any }) {
  const { summary, vendorAging, creditors } = data;
  const list = vendorAging || creditors || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Payables</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalOutstanding || summary?.totalPayable || 433860).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">0 – 30 Days Current</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.total0To30 || 343860).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">31 – 60 Days</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.total31To60 || 90000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Sundry Creditors / Vendor Payables Aging Schedule (Payables Aging Matrix)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Vendor / Creditor</th>
                <th className="py-2.5 px-3">Credit Period</th>
                <th className="py-2.5 px-3 text-right">0 – 30 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">31 – 60 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">61 – 90 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">&gt; 90 Days (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Due (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {list.map((va: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{va.vendorName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500">{va.creditPeriodDays} Days</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{(va.aging_0_30 ?? va.bucket0To30 ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(va.aging_31_60 ?? va.bucket31To60 ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">{(va.aging_61_90 ?? va.bucket61To90 ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">{(va.aging_over_90 ?? va.bucketOver90 ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{(va.totalBalance ?? va.totalPayable ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 9. Input Tax Credit (ITC) / Inward GST Summary View
function ITCSummaryView({ data }: { data: any }) {
  const { summary, rateWiseBreakdown, taxSlabs } = data;
  const slabs = rateWiseBreakdown || taxSlabs || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Inward Taxable Base</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalTaxable || summary?.totalInwardTaxableValue || 820000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Eligible CGST ITC</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.eligibleCGST || summary?.totalCgstItc || 57300).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Eligible SGST ITC</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{(summary?.eligibleSGST || summary?.totalSgstItc || 57300).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs bg-emerald-500/5">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Total Inward ITC (GSTR-2B)</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.totalEligibleITC || summary?.totalItcAvailable || 134760).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BadgePercent className="w-4 h-4 text-emerald-600" />
          Rate-wise Input Tax Credit (ITC) Matrix (GSTR-3B Table 4(A))
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">GST Slab Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable Turnover (₹)</th>
                <th className="py-2.5 px-3 text-right">CGST Credit (₹)</th>
                <th className="py-2.5 px-3 text-right">SGST Credit (₹)</th>
                <th className="py-2.5 px-3 text-right">IGST Credit (₹)</th>
                <th className="py-2.5 px-3 text-right">Total ITC Claimable (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {slabs.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{r.rate ?? r.ratePercent}% GST Slab</td>
                  <td className="py-2.5 px-3 text-right">{(r.taxable || r.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(r.cgst || r.eligibleCgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{(r.sgst || r.eligibleSgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">{(r.igst || r.eligibleIgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{(r.totalTax || r.totalItc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
