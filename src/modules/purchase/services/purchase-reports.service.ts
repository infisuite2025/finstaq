import {
  GrnQcStatus,
  PurchaseOrderStatus,
  ThreeWayMatchStatus,
  VoucherType,
} from '@prisma/client';

export interface DateFilterDto {
  fromDate?: string;
  toDate?: string;
  vendorId?: string;
  status?: string;
}

export class PurchaseReportsService {
  /**
   * 1. PURCHASE REGISTER (Monthly Summary & Detailed Day Book)
   */
  public static async getPurchaseRegister(tenantId: string, filter: DateFilterDto = {}) {
    const monthlySummary = [
      { month: 'Apr 2026', voucherCount: 8, taxableAmount: 380000, cgst: 34200, sgst: 34200, igst: 12000, totalAmount: 460400 },
      { month: 'May 2026', voucherCount: 12, taxableAmount: 520000, cgst: 46800, sgst: 46800, igst: 18500, totalAmount: 632100 },
      { month: 'Jun 2026', voucherCount: 15, taxableAmount: 690000, cgst: 62100, sgst: 62100, igst: 24800, totalAmount: 839000 },
      { month: 'Jul 2026', voucherCount: 14, taxableAmount: 610000, cgst: 54900, sgst: 54900, igst: 19600, totalAmount: 739400 },
      { month: 'Aug 2026', voucherCount: 18, taxableAmount: 840000, cgst: 75600, sgst: 75600, igst: 31200, totalAmount: 1022400 },
      { month: 'Sep 2026', voucherCount: 9, taxableAmount: 435000, cgst: 39150, sgst: 39150, igst: 15800, totalAmount: 529100 },
    ];

    const detailedTransactions = [
      {
        id: 'pur-vch-001',
        voucherNumber: 'PUR-2026-0081',
        date: '2026-09-02',
        supplierName: 'Steel Kraft Components Ltd',
        supplierCode: 'VEND-001',
        gstIn: '27AAACS4321A1Z5',
        stateCode: '27',
        taxableAmount: 125000,
        cgstAmount: 11250,
        sgstAmount: 11250,
        igstAmount: 0,
        roundOff: 0,
        grandTotal: 147500,
        paymentTerms: 'Net 30 Days',
        dueDays: 30,
      },
      {
        id: 'pur-vch-002',
        voucherNumber: 'PUR-2026-0082',
        date: '2026-09-05',
        supplierName: 'Global Tech Valves & Polymers',
        supplierCode: 'VEND-002',
        gstIn: '24AAACG9876K1Z3',
        stateCode: '24',
        taxableAmount: 85000,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 15300,
        roundOff: 0,
        grandTotal: 100300,
        paymentTerms: 'Net 45 Days',
        dueDays: 45,
      },
      {
        id: 'pur-vch-003',
        voucherNumber: 'PUR-2026-0083',
        date: '2026-09-08',
        supplierName: 'Precision Engineering Tools Corp',
        supplierCode: 'VEND-003',
        gstIn: '27AABCP1122D1Z8',
        stateCode: '27',
        taxableAmount: 64000,
        cgstAmount: 5760,
        sgstAmount: 5760,
        igstAmount: 0,
        roundOff: 0,
        grandTotal: 75520,
        paymentTerms: 'Net 15 Days',
        dueDays: 15,
      },
      {
        id: 'pur-vch-004',
        voucherNumber: 'PUR-2026-0084',
        date: '2026-09-10',
        supplierName: 'Apex Fasteners & Hardware Ltd',
        supplierCode: 'VEND-004',
        gstIn: '27AAACA9988M1Z4',
        stateCode: '27',
        taxableAmount: 48000,
        cgstAmount: 4320,
        sgstAmount: 4320,
        igstAmount: 0,
        roundOff: 0,
        grandTotal: 56640,
        paymentTerms: 'Net 30 Days',
        dueDays: 30,
      },
      {
        id: 'pur-vch-005',
        voucherNumber: 'PUR-2026-0085',
        date: '2026-09-12',
        supplierName: 'Tata Steel BSL Limited',
        supplierCode: 'VEND-005',
        gstIn: '27AAACT2727Q1ZW',
        stateCode: '27',
        taxableAmount: 113000,
        cgstAmount: 10170,
        sgstAmount: 10170,
        igstAmount: 0,
        roundOff: 0,
        grandTotal: 133340,
        paymentTerms: 'Immediate',
        dueDays: 0,
      },
    ];

    const totalTaxable = detailedTransactions.reduce((acc, t) => acc + t.taxableAmount, 0);
    const totalCgst = detailedTransactions.reduce((acc, t) => acc + t.cgstAmount, 0);
    const totalSgst = detailedTransactions.reduce((acc, t) => acc + t.sgstAmount, 0);
    const totalIgst = detailedTransactions.reduce((acc, t) => acc + t.igstAmount, 0);
    const grandTotal = detailedTransactions.reduce((acc, t) => acc + t.grandTotal, 0);

    return {
      summary: {
        totalVouchers: detailedTransactions.length,
        totalTaxable,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax: totalCgst + totalSgst + totalIgst,
        grandTotal,
      },
      monthlySummary,
      transactions: detailedTransactions,
    };
  }

  /**
   * 2. PURCHASE ORDER (PO) OUTSTANDING & PENDING MATRIX
   */
  public static async getPoOutstanding(tenantId: string, filter: DateFilterDto = {}) {
    const orders = [
      {
        poNumber: 'PO-2026-0045',
        orderDate: '2026-08-20',
        expectedDeliveryDate: '2026-09-10',
        supplierName: 'Tata Steel BSL Limited',
        supplierCode: 'VEND-005',
        status: 'PARTIALLY_RECEIVED',
        items: [
          { sku: 'STL-ROD-25MM', description: 'Structural Steel Rod 25mm dia', orderedQty: 20, receivedQty: 14, balanceQty: 6, unit: 'TON', unitPrice: 52000, balanceAmount: 312000 },
        ],
        totalOrderedValue: 1040000,
        totalPendingValue: 312000,
        isOverdue: true,
        daysElapsed: 24,
      },
      {
        poNumber: 'PO-2026-0048',
        orderDate: '2026-09-01',
        expectedDeliveryDate: '2026-09-18',
        supplierName: 'Global Tech Valves & Polymers',
        supplierCode: 'VEND-002',
        status: 'ISSUED',
        items: [
          { sku: 'VLV-DN50-HP', description: 'High Pressure Control Valve DN50', orderedQty: 40, receivedQty: 0, balanceQty: 40, unit: 'NOS', unitPrice: 850, balanceAmount: 34000 },
          { sku: 'GAS-SIL-DN50', description: 'Silicone High Temp Gaskets DN50', orderedQty: 100, receivedQty: 0, balanceQty: 100, unit: 'PCS', unitPrice: 95, balanceAmount: 9500 },
        ],
        totalOrderedValue: 43500,
        totalPendingValue: 43500,
        isOverdue: false,
        daysElapsed: 12,
      },
      {
        poNumber: 'PO-2026-0051',
        orderDate: '2026-09-08',
        expectedDeliveryDate: '2026-09-22',
        supplierName: 'Precision Engineering Tools Corp',
        supplierCode: 'VEND-003',
        status: 'ISSUED',
        items: [
          { sku: 'BRG-6205-2RS', description: 'Double Row Ball Bearings 6205', orderedQty: 250, receivedQty: 0, balanceQty: 250, unit: 'NOS', unitPrice: 320, balanceAmount: 80000 },
        ],
        totalOrderedValue: 80000,
        totalPendingValue: 80000,
        isOverdue: false,
        daysElapsed: 5,
      },
    ];

    const totalOrders = orders.length;
    const totalCommittedValue = orders.reduce((acc, o) => acc + o.totalOrderedValue, 0);
    const totalPendingValue = orders.reduce((acc, o) => acc + o.totalPendingValue, 0);
    const overdueOrdersCount = orders.filter((o) => o.isOverdue).length;

    return {
      summary: {
        totalOrders,
        totalCommittedValue,
        totalPendingValue,
        overdueOrdersCount,
      },
      orders,
    };
  }

  /**
   * 3. GOODS RECEIPT NOTE (GRN) INWARD & QC REJECTION REGISTER
   */
  public static async getGrnRegister(tenantId: string, filter: DateFilterDto = {}) {
    const receipts = [
      {
        grnNumber: 'GRN-2026-0062',
        receivedDate: '2026-09-03',
        poNumber: 'PO-2026-0041',
        supplierName: 'Tata Steel BSL Limited',
        vehicleNumber: 'MH-12-RN-8821',
        challanNumber: 'DC-TS-9912',
        receivedBy: 'Suresh Patil',
        qcStatus: 'ACCEPTED',
        items: [
          { description: 'Structural Steel Rod 25mm dia', receivedQty: 10, acceptedQty: 10, rejectedQty: 0, unit: 'TON', rejectionReason: null, batchNumber: 'BAT-2026-TS01' },
        ],
      },
      {
        grnNumber: 'GRN-2026-0063',
        receivedDate: '2026-09-06',
        poNumber: 'PO-2026-0043',
        supplierName: 'Steel Kraft Components Ltd',
        vehicleNumber: 'MH-14-GH-4311',
        challanNumber: 'SK-CH-441',
        receivedBy: 'Ramesh Shinde',
        qcStatus: 'PARTIALLY_REJECTED',
        items: [
          { description: 'Precision Hex Bolts M12x50', receivedQty: 500, acceptedQty: 460, rejectedQty: 40, unit: 'KGS', rejectionReason: 'Thread Pitch Dimensional Deviation (>0.2mm tolerance)', batchNumber: 'SK-BOLT-918' },
        ],
      },
      {
        grnNumber: 'GRN-2026-0064',
        receivedDate: '2026-09-09',
        poNumber: 'PO-2026-0046',
        supplierName: 'Global Tech Valves & Polymers',
        vehicleNumber: 'GJ-06-XX-1190',
        challanNumber: 'GT-INV-8120',
        receivedBy: 'Anil Deshmukh',
        qcStatus: 'ACCEPTED',
        items: [
          { description: 'Industrial High Pressure Valves DN50', receivedQty: 25, acceptedQty: 25, rejectedQty: 0, unit: 'NOS', rejectionReason: null, batchNumber: 'GT-VLV-2026' },
        ],
      },
    ];

    let totalReceived = 0;
    let totalAccepted = 0;
    let totalRejected = 0;
    receipts.forEach((r) => {
      r.items.forEach((i) => {
        totalReceived += i.receivedQty;
        totalAccepted += i.acceptedQty;
        totalRejected += i.rejectedQty;
      });
    });

    const qcPassRate = totalReceived > 0 ? Number(((totalAccepted / totalReceived) * 100).toFixed(1)) : 100;

    return {
      summary: {
        totalReceiptNotes: receipts.length,
        totalReceivedUnits: totalReceived,
        totalAcceptedUnits: totalAccepted,
        totalRejectedUnits: totalRejected,
        qcPassRatePercent: qcPassRate,
      },
      receipts,
    };
  }

  /**
   * 4. PURCHASE BILLS PENDING (Uninvoiced GRNs / GR-IR Accruals)
   */
  public static async getBillsPending(tenantId: string) {
    const pendingBills = [
      {
        grnNumber: 'GRN-2026-0064',
        receivedDate: '2026-09-09',
        poNumber: 'PO-2026-0046',
        supplierName: 'Global Tech Valves & Polymers',
        supplierCode: 'VEND-002',
        itemsDescription: '25 NOS Industrial High Pressure Valves DN50',
        acceptedQty: 25,
        unit: 'NOS',
        estimatedRate: 850,
        estimatedTaxable: 21250,
        estimatedGst: 3825,
        estimatedTotal: 25075,
        agingDays: 4,
        status: 'PENDING_VENDOR_INVOICE',
      },
      {
        grnNumber: 'GRN-2026-0062',
        receivedDate: '2026-09-03',
        poNumber: 'PO-2026-0041',
        supplierName: 'Tata Steel BSL Limited',
        supplierCode: 'VEND-005',
        itemsDescription: '10 TON Structural Steel Rod 25mm dia',
        acceptedQty: 10,
        unit: 'TON',
        estimatedRate: 52000,
        estimatedTaxable: 520000,
        estimatedGst: 93600,
        estimatedTotal: 613600,
        agingDays: 10,
        status: 'PENDING_VENDOR_INVOICE',
      },
    ];

    const totalAccruedLiability = pendingBills.reduce((acc, b) => acc + b.estimatedTotal, 0);

    return {
      summary: {
        pendingGrnCount: pendingBills.length,
        totalAccruedLiabilityAmount: totalAccruedLiability,
      },
      pendingBills,
    };
  }

  /**
   * 5. VENDOR-WISE PURCHASE SPEND DISTRIBUTION
   */
  public static async getVendorPurchaseSummary(tenantId: string, filter: DateFilterDto = {}) {
    const vendors = [
      {
        vendorId: 'v-001',
        vendorName: 'Tata Steel BSL Limited',
        vendorCode: 'VEND-005',
        gstIn: '27AAACT2727Q1ZW',
        invoiceCount: 4,
        totalTaxable: 520000,
        totalTax: 93600,
        grandTotal: 613600,
        percentShare: 43.4,
        averageOrderSize: 153400,
        lastPurchaseDate: '2026-09-12',
      },
      {
        vendorId: 'v-002',
        vendorName: 'Steel Kraft Components Ltd',
        vendorCode: 'VEND-001',
        gstIn: '27AAACS4321A1Z5',
        invoiceCount: 6,
        totalTaxable: 345000,
        totalTax: 62100,
        grandTotal: 407100,
        percentShare: 28.8,
        averageOrderSize: 67850,
        lastPurchaseDate: '2026-09-02',
      },
      {
        vendorId: 'v-003',
        vendorName: 'Global Tech Valves & Polymers',
        vendorCode: 'VEND-002',
        gstIn: '24AAACG9876K1Z3',
        invoiceCount: 3,
        totalTaxable: 195000,
        totalTax: 35100,
        grandTotal: 230100,
        percentShare: 16.3,
        averageOrderSize: 76700,
        lastPurchaseDate: '2026-09-05',
      },
      {
        vendorId: 'v-004',
        vendorName: 'Precision Engineering Tools Corp',
        vendorCode: 'VEND-003',
        gstIn: '27AABCP1122D1Z8',
        invoiceCount: 2,
        totalTaxable: 95000,
        totalTax: 17100,
        grandTotal: 112100,
        percentShare: 7.9,
        averageOrderSize: 56050,
        lastPurchaseDate: '2026-09-08',
      },
      {
        vendorId: 'v-005',
        vendorName: 'Apex Fasteners & Hardware Ltd',
        vendorCode: 'VEND-004',
        gstIn: '27AAACA9988M1Z4',
        invoiceCount: 1,
        totalTaxable: 44000,
        totalTax: 7920,
        grandTotal: 51920,
        percentShare: 3.6,
        averageOrderSize: 51920,
        lastPurchaseDate: '2026-09-10',
      },
    ];

    const totalSpend = vendors.reduce((acc, v) => acc + v.grandTotal, 0);

    return {
      summary: {
        activeVendorsCount: vendors.length,
        totalProcurementSpend: totalSpend,
        topVendorName: vendors[0].vendorName,
        topVendorSpendShare: vendors[0].percentShare,
      },
      vendors,
    };
  }

  /**
   * 6. ITEM / PRODUCT-WISE PURCHASE ANALYSIS
   */
  public static async getItemPurchaseSummary(tenantId: string, filter: DateFilterDto = {}) {
    const items = [
      {
        sku: 'STL-ROD-25MM',
        itemName: 'High Tensile Structural Steel Rod 25mm dia',
        category: 'Raw Materials',
        unit: 'TON',
        totalQtyPurchased: 10,
        weightedAverageCost: 52000,
        totalSpend: 520000,
        lastPurchasePrice: 52000,
        taxRatePercent: 18,
        lastPurchaseDate: '2026-09-12',
      },
      {
        sku: 'FST-M12-SS',
        itemName: 'Stainless Steel Fasteners & Hex Bolts M12x50',
        category: 'Consumables & Spares',
        unit: 'KGS',
        totalQtyPurchased: 460,
        weightedAverageCost: 160,
        totalSpend: 73600,
        lastPurchasePrice: 165,
        taxRatePercent: 18,
        lastPurchaseDate: '2026-09-02',
      },
      {
        sku: 'VLV-DN50-HP',
        itemName: 'Industrial High Pressure Control Valve DN50',
        category: 'Finished Goods Components',
        unit: 'NOS',
        totalQtyPurchased: 45,
        weightedAverageCost: 850,
        totalSpend: 38250,
        lastPurchasePrice: 850,
        taxRatePercent: 18,
        lastPurchaseDate: '2026-09-05',
      },
      {
        sku: 'BRG-6205-2RS',
        itemName: 'Precision Double Row Ball Bearings 6205-2RS',
        category: 'Finished Goods Components',
        unit: 'NOS',
        totalQtyPurchased: 120,
        weightedAverageCost: 320,
        totalSpend: 38400,
        lastPurchasePrice: 320,
        taxRatePercent: 18,
        lastPurchaseDate: '2026-09-08',
      },
    ];

    const totalSpend = items.reduce((acc, i) => acc + i.totalSpend, 0);

    return {
      summary: {
        totalUniqueSkus: items.length,
        totalSpend,
      },
      items,
    };
  }

  /**
   * 7. 3-WAY RECONCILIATION VARIANCE AUDIT
   */
  public static async getVarianceAudit(tenantId: string) {
    const audits = [
      {
        poNumber: 'PO-2026-0038',
        grnNumber: 'GRN-2026-0058',
        voucherNumber: 'PUR-2026-0078',
        vendorName: 'Tata Steel BSL Limited',
        matchedAt: '2026-09-02',
        poTotalAmount: 71980,
        grnAcceptedAmount: 71980,
        invoicedTotalAmount: 71980,
        varianceAmount: 0,
        status: 'PERFECT_MATCH',
        discrepancyNotes: 'Zero Variance Match. All line items, prices and quantities reconciled.',
      },
      {
        poNumber: 'PO-2026-0040',
        grnNumber: 'GRN-2026-0060',
        voucherNumber: 'PUR-2026-0080',
        vendorName: 'Steel Kraft Components Ltd',
        matchedAt: '2026-09-06',
        poTotalAmount: 48000,
        grnAcceptedAmount: 44160,
        invoicedTotalAmount: 48000,
        varianceAmount: 3840,
        status: 'QUANTITY_VARIANCE',
        discrepancyNotes: 'Quantity shortfall: 40 KGS rejected during QC inspection. Vendor invoiced for 500 KGS instead of 460 KGS accepted.',
      },
    ];

    const perfectMatches = audits.filter((a) => a.status === 'PERFECT_MATCH').length;
    const discrepancies = audits.filter((a) => a.status !== 'PERFECT_MATCH').length;
    const totalVariance = audits.reduce((acc, a) => acc + a.varianceAmount, 0);

    return {
      summary: {
        totalAudits: audits.length,
        perfectMatches,
        discrepanciesCount: discrepancies,
        totalDiscrepancyAmount: totalVariance,
      },
      audits,
    };
  }

  /**
   * 8. VENDOR PAYABLES AGING ANALYSIS (SUNDRY CREDITORS)
   */
  public static async getPayablesAging(tenantId: string) {
    const creditors = [
      {
        vendorName: 'Steel Kraft Components Ltd',
        vendorCode: 'VEND-001',
        creditPeriodDays: 30,
        totalPayable: 85000,
        bucket0To30: 65000,
        bucket31To60: 20000,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 20000,
      },
      {
        vendorName: 'Global Tech Valves & Polymers',
        vendorCode: 'VEND-002',
        creditPeriodDays: 45,
        totalPayable: 140000,
        bucket0To30: 100000,
        bucket31To60: 40000,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 0,
      },
      {
        vendorName: 'Precision Engineering Tools Corp',
        vendorCode: 'VEND-003',
        creditPeriodDays: 15,
        totalPayable: 75520,
        bucket0To30: 45520,
        bucket31To60: 30000,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 30000,
      },
      {
        vendorName: 'Tata Steel BSL Limited',
        vendorCode: 'VEND-005',
        creditPeriodDays: 0,
        totalPayable: 133340,
        bucket0To30: 133340,
        bucket31To60: 0,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 0,
      },
    ];

    const totalPayable = creditors.reduce((acc, c) => acc + c.totalPayable, 0);
    const total0To30 = creditors.reduce((acc, c) => acc + c.bucket0To30, 0);
    const total31To60 = creditors.reduce((acc, c) => acc + c.bucket31To60, 0);
    const total61To90 = creditors.reduce((acc, c) => acc + c.bucket61To90, 0);
    const totalOver90 = creditors.reduce((acc, c) => acc + c.bucketOver90, 0);
    const totalOverdue = creditors.reduce((acc, c) => acc + c.overdueAmount, 0);

    return {
      summary: {
        totalPayable,
        total0To30,
        total31To60,
        total61To90,
        totalOver90,
        totalOverdue,
        overduePercentage: Number(((totalOverdue / totalPayable) * 100).toFixed(1)),
      },
      creditors,
    };
  }

  /**
   * 9. INPUT TAX CREDIT (ITC) / INWARD GST TAX SUMMARY
   */
  public static async getItcSummary(tenantId: string, filter: DateFilterDto = {}) {
    const taxSlabs = [
      { taxRate: 'GST 0% (Exempt)', ratePercent: 0, invoiceCount: 1, taxableValue: 25000, eligibleCgst: 0, eligibleSgst: 0, eligibleIgst: 0, totalItc: 0 },
      { taxRate: 'GST 5% (GTA Freight)', ratePercent: 5, invoiceCount: 3, taxableValue: 48000, eligibleCgst: 1200, eligibleSgst: 1200, eligibleIgst: 0, totalItc: 2400 },
      { taxRate: 'GST 12% (Packaging)', ratePercent: 12, invoiceCount: 2, taxableValue: 35000, eligibleCgst: 2100, eligibleSgst: 2100, eligibleIgst: 0, totalItc: 4200 },
      { taxRate: 'GST 18% (Standard Rate)', ratePercent: 18, invoiceCount: 14, taxableValue: 712000, eligibleCgst: 54000, eligibleSgst: 54000, eligibleIgst: 20160, totalItc: 128160 },
      { taxRate: 'GST 28% (Luxury/Demerit)', ratePercent: 28, invoiceCount: 0, taxableValue: 0, eligibleCgst: 0, eligibleSgst: 0, eligibleIgst: 0, totalItc: 0 },
    ];

    const totalTaxable = taxSlabs.reduce((acc, s) => acc + s.taxableValue, 0);
    const totalCgst = taxSlabs.reduce((acc, s) => acc + s.eligibleCgst, 0);
    const totalSgst = taxSlabs.reduce((acc, s) => acc + s.eligibleSgst, 0);
    const totalIgst = taxSlabs.reduce((acc, s) => acc + s.eligibleIgst, 0);
    const totalItc = taxSlabs.reduce((acc, s) => acc + s.totalItc, 0);

    return {
      summary: {
        totalInwardTaxableValue: totalTaxable,
        totalCgstItc: totalCgst,
        totalSgstItc: totalSgst,
        totalIgstItc: totalIgst,
        totalItcAvailable: totalItc,
      },
      taxSlabs,
    };
  }
}