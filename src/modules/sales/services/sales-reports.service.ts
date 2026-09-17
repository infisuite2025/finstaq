export interface DateFilterDto {
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  status?: string;
}

export class SalesReportsService {
  /**
   * 1. SALES REGISTER (Monthly Summary & Detailed Day Book)
   */
  public static async getSalesRegister(tenantId: string, filter: DateFilterDto = {}) {
    const monthlySummary = [
      { month: 'Apr 2026', invoiceCount: 14, taxableAmount: 1120000, cgst: 100800, sgst: 100800, igst: 42000, totalAmount: 1363600 },
      { month: 'May 2026', invoiceCount: 18, taxableAmount: 1450000, cgst: 130500, sgst: 130500, igst: 58000, totalAmount: 1769000 },
      { month: 'Jun 2026', invoiceCount: 22, taxableAmount: 1890000, cgst: 170100, sgst: 170100, igst: 76000, totalAmount: 2306200 },
      { month: 'Jul 2026', invoiceCount: 19, taxableAmount: 1620000, cgst: 145800, sgst: 145800, igst: 64000, totalAmount: 1975600 },
      { month: 'Aug 2026', invoiceCount: 25, taxableAmount: 2150000, cgst: 193500, sgst: 193500, igst: 92000, totalAmount: 2629000 },
      { month: 'Sep 2026', invoiceCount: 12, taxableAmount: 980000, cgst: 88200, sgst: 88200, igst: 39000, totalAmount: 1195400 },
    ];

    const invoices = [
      {
        id: 'inv-001',
        invoiceNumber: 'INV-2026-0101',
        invoiceDate: '2026-09-02',
        customerName: 'Reliance Industries Limited',
        customerCode: 'CUST-001',
        gstIn: '27AAAAR1234F1Z9',
        placeOfSupply: '27-Maharashtra',
        taxableAmount: 350000,
        cgstAmount: 31500,
        sgstAmount: 31500,
        igstAmount: 0,
        roundOff: 0,
        grandTotal: 413000,
        paymentTerms: 'Net 30 Days',
        status: 'PAID',
      },
      {
        id: 'inv-002',
        invoiceNumber: 'INV-2026-0102',
        invoiceDate: '2026-09-05',
        customerName: 'Larsen & Toubro Ltd',
        customerCode: 'CUST-002',
        gstIn: '24AAACL5566M1Z2',
        placeOfSupply: '24-Gujarat',
        taxableAmount: 280000,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 50400,
        roundOff: 0,
        grandTotal: 330400,
        paymentTerms: 'Net 45 Days',
        status: 'UNPAID',
      },
      {
        id: 'inv-003',
        invoiceNumber: 'INV-2026-0103',
        invoiceDate: '2026-09-08',
        customerName: 'Mahindra & Mahindra Automotive',
        customerCode: 'CUST-003',
        gstIn: '27AAACM8877K1Z4',
        placeOfSupply: '27-Maharashtra',
        taxableAmount: 195000,
        cgstAmount: 17550,
        sgstAmount: 17550,
        igstAmount: 0,
        roundOff: 0,
        grandTotal: 230100,
        paymentTerms: 'Net 30 Days',
        status: 'PAID',
      },
      {
        id: 'inv-004',
        invoiceNumber: 'INV-2026-0104',
        invoiceDate: '2026-09-10',
        customerName: 'Bharat Heavy Electricals Limited (BHEL)',
        customerCode: 'CUST-004',
        gstIn: '07AAACB0011C1Z8',
        placeOfSupply: '07-Delhi',
        taxableAmount: 155000,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 27900,
        roundOff: 0,
        grandTotal: 182900,
        paymentTerms: 'Immediate',
        status: 'PAID',
      },
    ];

    const totalTaxable = invoices.reduce((acc, i) => acc + i.taxableAmount, 0);
    const totalCgst = invoices.reduce((acc, i) => acc + i.cgstAmount, 0);
    const totalSgst = invoices.reduce((acc, i) => acc + i.sgstAmount, 0);
    const totalIgst = invoices.reduce((acc, i) => acc + i.igstAmount, 0);
    const grandTotal = invoices.reduce((acc, i) => acc + i.grandTotal, 0);

    return {
      summary: {
        totalInvoices: invoices.length,
        totalTaxable,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax: totalCgst + totalSgst + totalIgst,
        grandTotal,
      },
      monthlySummary,
      invoices,
    };
  }

  /**
   * 2. SALES ORDER (SO) OUTSTANDING & PENDING FULFILLMENT MATRIX
   */
  public static async getSalesOrderOutstanding(tenantId: string, filter: DateFilterDto = {}) {
    const orders = [
      {
        soNumber: 'SO-2026-0081',
        orderDate: '2026-08-25',
        expectedDeliveryDate: '2026-09-15',
        customerName: 'Reliance Industries Limited',
        customerCode: 'CUST-001',
        status: 'PARTIALLY_DISPATCHED',
        items: [
          { sku: 'VLV-DN50-HP', description: 'High Pressure Control Valve DN50', orderedQty: 50, dispatchedQty: 30, balanceQty: 20, unit: 'NOS', unitPrice: 1450, pendingValue: 29000 },
        ],
        totalOrderValue: 72500,
        totalPendingValue: 29000,
        isOverdue: false,
        daysElapsed: 19,
      },
      {
        soNumber: 'SO-2026-0084',
        orderDate: '2026-09-02',
        expectedDeliveryDate: '2026-09-12',
        customerName: 'Larsen & Toubro Ltd',
        customerCode: 'CUST-002',
        status: 'ISSUED',
        items: [
          { sku: 'STL-ROD-25MM', description: 'Structural Steel Rod 25mm dia', orderedQty: 15, dispatchedQty: 0, balanceQty: 15, unit: 'TON', unitPrice: 62000, pendingValue: 930000 },
        ],
        totalOrderValue: 930000,
        totalPendingValue: 930000,
        isOverdue: true,
        daysElapsed: 11,
      },
      {
        soNumber: 'SO-2026-0087',
        orderDate: '2026-09-07',
        expectedDeliveryDate: '2026-09-25',
        customerName: 'Mahindra & Mahindra Automotive',
        customerCode: 'CUST-003',
        status: 'ISSUED',
        items: [
          { sku: 'BRG-6205-2RS', description: 'Double Row Ball Bearings 6205', orderedQty: 300, dispatchedQty: 0, balanceQty: 300, unit: 'NOS', unitPrice: 480, pendingValue: 144000 },
        ],
        totalOrderValue: 144000,
        totalPendingValue: 144000,
        isOverdue: false,
        daysElapsed: 6,
      },
    ];

    const totalOrders = orders.length;
    const totalCommittedValue = orders.reduce((acc, o) => acc + o.totalOrderValue, 0);
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
   * 3. DELIVERY CHALLAN & OUTWARD DISPATCH REGISTER
   */
  public static async getDeliveryChallanRegister(tenantId: string, filter: DateFilterDto = {}) {
    const challans = [
      {
        challanNumber: 'DC-2026-0041',
        dispatchDate: '2026-09-03',
        soNumber: 'SO-2026-0078',
        customerName: 'Reliance Industries Limited',
        transporterName: 'VRL Logistics Limited',
        vehicleNumber: 'MH-04-DK-8910',
        lrNumber: 'VRL-MUM-89218',
        driverContact: '+91 98201 12345',
        status: 'DELIVERED',
        items: [
          { description: 'High Pressure Control Valve DN50', dispatchedQty: 30, unit: 'NOS' },
        ],
      },
      {
        challanNumber: 'DC-2026-0042',
        dispatchDate: '2026-09-06',
        soNumber: 'SO-2026-0079',
        customerName: 'Mahindra & Mahindra Automotive',
        transporterName: 'TCI Freight Express',
        vehicleNumber: 'MH-14-AB-4455',
        lrNumber: 'TCI-PUN-77210',
        driverContact: '+91 98902 44321',
        status: 'DELIVERED',
        items: [
          { description: 'Stainless Steel Fasteners Grade 8.8', dispatchedQty: 250, unit: 'KGS' },
        ],
      },
      {
        challanNumber: 'DC-2026-0043',
        dispatchDate: '2026-09-10',
        soNumber: 'SO-2026-0082',
        customerName: 'Larsen & Toubro Ltd',
        transporterName: 'GATI KWE',
        vehicleNumber: 'GJ-01-AX-9912',
        lrNumber: 'GATI-AHM-10928',
        driverContact: '+91 97240 55678',
        status: 'IN_TRANSIT',
        items: [
          { description: 'Structural Steel Rod 25mm dia', dispatchedQty: 8, unit: 'TON' },
        ],
      },
    ];

    let totalDispatchedUnits = 0;
    challans.forEach((c) => {
      c.items.forEach((i) => {
        totalDispatchedUnits += i.dispatchedQty;
      });
    });

    return {
      summary: {
        totalChallans: challans.length,
        totalDispatchedUnits,
        inTransitCount: challans.filter((c) => c.status === 'IN_TRANSIT').length,
        deliveredCount: challans.filter((c) => c.status === 'DELIVERED').length,
      },
      challans,
    };
  }

  /**
   * 4. SALES BILLS PENDING (Goods Delivered but Uninvoiced / Sales Bills to Make)
   */
  public static async getSalesBillsPending(tenantId: string) {
    const unbilledDeliveries = [
      {
        challanNumber: 'DC-2026-0043',
        dispatchDate: '2026-09-10',
        soNumber: 'SO-2026-0082',
        customerName: 'Larsen & Toubro Ltd',
        customerCode: 'CUST-002',
        itemsDescription: '8 TON Structural Steel Rod 25mm dia',
        dispatchedQty: 8,
        unit: 'TON',
        unitRate: 62000,
        estimatedTaxable: 496000,
        estimatedGst: 89280,
        estimatedTotal: 585280,
        agingDays: 3,
        status: 'UNBILLED_DELIVERY',
      },
      {
        challanNumber: 'DC-2026-0040',
        dispatchDate: '2026-09-01',
        soNumber: 'SO-2026-0075',
        customerName: 'Bharat Heavy Electricals Limited (BHEL)',
        customerCode: 'CUST-004',
        itemsDescription: '150 NOS Precision Ball Bearings 6205',
        dispatchedQty: 150,
        unit: 'NOS',
        unitRate: 480,
        estimatedTaxable: 72000,
        estimatedGst: 12960,
        estimatedTotal: 84960,
        agingDays: 12,
        status: 'UNBILLED_DELIVERY',
      },
    ];

    const totalUnbilledRevenue = unbilledDeliveries.reduce((acc, d) => acc + d.estimatedTotal, 0);

    return {
      summary: {
        pendingChallansCount: unbilledDeliveries.length,
        totalUnbilledRevenueAmount: totalUnbilledRevenue,
      },
      unbilledDeliveries,
    };
  }

  /**
   * 5. CUSTOMER-WISE SALES REVENUE & PARETO DISTRIBUTION
   */
  public static async getCustomerSalesSummary(tenantId: string, filter: DateFilterDto = {}) {
    const customers = [
      {
        customerId: 'c-001',
        customerName: 'Reliance Industries Limited',
        customerCode: 'CUST-001',
        gstIn: '27AAAAR1234F1Z9',
        invoiceCount: 8,
        totalTaxable: 1850000,
        totalTax: 333000,
        grandTotal: 2183000,
        percentShare: 46.2,
        averageOrderSize: 272875,
        lastSaleDate: '2026-09-02',
      },
      {
        customerId: 'c-002',
        customerName: 'Larsen & Toubro Ltd',
        customerCode: 'CUST-002',
        gstIn: '24AAACL5566M1Z2',
        invoiceCount: 5,
        totalTaxable: 1120000,
        totalTax: 201600,
        grandTotal: 1321600,
        percentShare: 28.0,
        averageOrderSize: 264320,
        lastSaleDate: '2026-09-05',
      },
      {
        customerId: 'c-003',
        customerName: 'Mahindra & Mahindra Automotive',
        customerCode: 'CUST-003',
        gstIn: '27AAACM8877K1Z4',
        invoiceCount: 4,
        totalTaxable: 680000,
        totalTax: 122400,
        grandTotal: 802400,
        percentShare: 17.0,
        averageOrderSize: 200600,
        lastSaleDate: '2026-09-08',
      },
      {
        customerId: 'c-004',
        customerName: 'Bharat Heavy Electricals Limited (BHEL)',
        customerCode: 'CUST-004',
        gstIn: '07AAACB0011C1Z8',
        invoiceCount: 2,
        totalTaxable: 355000,
        totalTax: 63900,
        grandTotal: 418900,
        percentShare: 8.8,
        averageOrderSize: 209450,
        lastSaleDate: '2026-09-10',
      },
    ];

    const totalRevenue = customers.reduce((acc, c) => acc + c.grandTotal, 0);

    return {
      summary: {
        activeCustomersCount: customers.length,
        totalSalesRevenue: totalRevenue,
        topCustomerName: customers[0].customerName,
        topCustomerRevenueShare: customers[0].percentShare,
      },
      customers,
    };
  }

  /**
   * 6. ITEM / PRODUCT-WISE SALES ANALYSIS & GROSS MARGIN
   */
  public static async getItemSalesSummary(tenantId: string, filter: DateFilterDto = {}) {
    const items = [
      {
        sku: 'STL-ROD-25MM',
        itemName: 'High Tensile Structural Steel Rod 25mm dia',
        category: 'Raw Materials',
        unit: 'TON',
        totalQtySold: 25,
        avgSellingPrice: 62000,
        avgCostPrice: 52000,
        totalSalesValue: 1550000,
        totalCostValue: 1300000,
        grossProfit: 250000,
        grossMarginPercent: 16.13,
        taxRatePercent: 18,
      },
      {
        sku: 'VLV-DN50-HP',
        itemName: 'Industrial High Pressure Control Valve DN50',
        category: 'Finished Goods Components',
        unit: 'NOS',
        totalQtySold: 120,
        avgSellingPrice: 1450,
        avgCostPrice: 850,
        totalSalesValue: 174000,
        totalCostValue: 102000,
        grossProfit: 72000,
        grossMarginPercent: 41.38,
        taxRatePercent: 18,
      },
      {
        sku: 'BRG-6205-2RS',
        itemName: 'Precision Double Row Ball Bearings 6205-2RS',
        category: 'Finished Goods Components',
        unit: 'NOS',
        totalQtySold: 450,
        avgSellingPrice: 480,
        avgCostPrice: 320,
        totalSalesValue: 216000,
        totalCostValue: 144000,
        grossProfit: 72000,
        grossMarginPercent: 33.33,
        taxRatePercent: 18,
      },
      {
        sku: 'FST-M12-SS',
        itemName: 'Stainless Steel Fasteners & Hex Bolts M12x50',
        category: 'Consumables & Spares',
        unit: 'KGS',
        totalQtySold: 600,
        avgSellingPrice: 240,
        avgCostPrice: 160,
        totalSalesValue: 144000,
        totalCostValue: 96000,
        grossProfit: 48000,
        grossMarginPercent: 33.33,
        taxRatePercent: 18,
      },
    ];

    const totalSalesRevenue = items.reduce((acc, i) => acc + i.totalSalesValue, 0);
    const totalCostOfGoods = items.reduce((acc, i) => acc + i.totalCostValue, 0);
    const totalGrossProfit = items.reduce((acc, i) => acc + i.grossProfit, 0);
    const overallMargin = totalSalesRevenue > 0 ? Number(((totalGrossProfit / totalSalesRevenue) * 100).toFixed(2)) : 0;

    return {
      summary: {
        totalUniqueSkus: items.length,
        totalSalesRevenue,
        totalCostOfGoods,
        totalGrossProfit,
        overallMarginPercent: overallMargin,
      },
      items,
    };
  }

  /**
   * 7. CUSTOMER RECEIVABLES AGING ANALYSIS (SUNDRY DEBTORS)
   */
  public static async getCustomerReceivablesAging(tenantId: string) {
    const debtors = [
      {
        customerName: 'Reliance Industries Limited',
        customerCode: 'CUST-001',
        creditPeriodDays: 30,
        creditLimit: 5000000,
        totalReceivable: 413000,
        bucket0To30: 413000,
        bucket31To60: 0,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 0,
      },
      {
        customerName: 'Larsen & Toubro Ltd',
        customerCode: 'CUST-002',
        creditPeriodDays: 45,
        creditLimit: 3000000,
        totalReceivable: 330400,
        bucket0To30: 180000,
        bucket31To60: 150400,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 150400,
      },
      {
        customerName: 'Mahindra & Mahindra Automotive',
        customerCode: 'CUST-003',
        creditPeriodDays: 30,
        creditLimit: 2000000,
        totalReceivable: 230100,
        bucket0To30: 230100,
        bucket31To60: 0,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 0,
      },
      {
        customerName: 'Bharat Heavy Electricals Limited (BHEL)',
        customerCode: 'CUST-004',
        creditPeriodDays: 60,
        creditLimit: 1500000,
        totalReceivable: 182900,
        bucket0To30: 100000,
        bucket31To60: 82900,
        bucket61To90: 0,
        bucketOver90: 0,
        overdueAmount: 0,
      },
    ];

    const totalReceivable = debtors.reduce((acc, d) => acc + d.totalReceivable, 0);
    const total0To30 = debtors.reduce((acc, d) => acc + d.bucket0To30, 0);
    const total31To60 = debtors.reduce((acc, d) => acc + d.bucket31To60, 0);
    const total61To90 = debtors.reduce((acc, d) => acc + d.bucket61To90, 0);
    const totalOver90 = debtors.reduce((acc, d) => acc + d.bucketOver90, 0);
    const totalOverdue = debtors.reduce((acc, d) => acc + d.overdueAmount, 0);

    return {
      summary: {
        totalReceivable,
        total0To30,
        total31To60,
        total61To90,
        totalOver90,
        totalOverdue,
        overduePercentage: Number(((totalOverdue / totalReceivable) * 100).toFixed(1)),
      },
      debtors,
    };
  }

  /**
   * 8. STATUTORY OUTWARD GST SUMMARY (GSTR-1 COMPLIANCE MATRIX)
   */
  public static async getGstr1OutwardSummary(tenantId: string, filter: DateFilterDto = {}) {
    const taxSlabs = [
      { taxRate: 'GST 0% (Exempt Sales)', ratePercent: 0, invoiceCount: 0, taxableValue: 0, outputCgst: 0, outputSgst: 0, outputIgst: 0, totalTax: 0 },
      { taxRate: 'GST 5% (Essential Goods)', ratePercent: 5, invoiceCount: 2, taxableValue: 120000, outputCgst: 3000, outputSgst: 3000, outputIgst: 0, totalTax: 6000 },
      { taxRate: 'GST 12% (Processed Goods)', ratePercent: 12, invoiceCount: 3, taxableValue: 180000, outputCgst: 10800, outputSgst: 10800, outputIgst: 0, totalTax: 21600 },
      { taxRate: 'GST 18% (Standard Engineering)', ratePercent: 18, invoiceCount: 28, taxableValue: 2450000, outputCgst: 171000, outputSgst: 171000, outputIgst: 97200, totalTax: 439200 },
      { taxRate: 'GST 28% (Special Industrial)', ratePercent: 28, invoiceCount: 0, taxableValue: 0, outputCgst: 0, outputSgst: 0, outputIgst: 0, totalTax: 0 },
    ];

    const hsnSummary = [
      { hsnCode: '7214', description: 'High Tensile Structural Steel Bars & Rods', uqc: 'TON', totalQuantity: 25, totalTaxableValue: 1550000, rate: 18, cgst: 108500, sgst: 108500, igst: 62000, totalGst: 279000 },
      { hsnCode: '8481', description: 'Industrial High Pressure Flow Valves & Taps', uqc: 'NOS', totalQuantity: 120, totalTaxableValue: 174000, rate: 18, cgst: 15660, sgst: 15660, igst: 0, totalGst: 31320 },
      { hsnCode: '8482', description: 'Double Row Precision Ball Bearings', uqc: 'NOS', totalQuantity: 450, totalTaxableValue: 216000, rate: 18, cgst: 0, sgst: 0, igst: 38880, totalGst: 38880 },
      { hsnCode: '7318', description: 'Stainless Steel Fasteners & Hex Bolts', uqc: 'KGS', totalQuantity: 600, totalTaxableValue: 144000, rate: 18, cgst: 12960, sgst: 12960, igst: 0, totalGst: 25920 },
    ];

    const totalTaxable = taxSlabs.reduce((acc, s) => acc + s.taxableValue, 0);
    const totalCgst = taxSlabs.reduce((acc, s) => acc + s.outputCgst, 0);
    const totalSgst = taxSlabs.reduce((acc, s) => acc + s.outputSgst, 0);
    const totalIgst = taxSlabs.reduce((acc, s) => acc + s.outputIgst, 0);
    const totalOutputTax = taxSlabs.reduce((acc, s) => acc + s.totalTax, 0);

    return {
      summary: {
        totalOutwardTaxableTurnover: totalTaxable,
        totalOutputCgst: totalCgst,
        totalOutputSgst: totalSgst,
        totalOutputIgst: totalIgst,
        totalOutputTaxLiability: totalOutputTax,
      },
      taxSlabs,
      hsnSummary,
    };
  }

  /**
   * 9. CREDIT NOTES & SALES RETURNS REGISTER
   */
  public static async getSalesReturnRegister(tenantId: string, filter: DateFilterDto = {}) {
    const creditNotes = [
      {
        creditNoteNumber: 'CRN-2026-0012',
        creditNoteDate: '2026-09-04',
        originalInvoiceNumber: 'INV-2026-0095',
        originalInvoiceDate: '2026-08-28',
        customerName: 'Mahindra & Mahindra Automotive',
        customerCode: 'CUST-003',
        gstIn: '27AAACM8877K1Z4',
        reasonCode: 'QUALITY_DEFECT_REJECTION',
        reasonDescription: 'Customer QA rejected 20 KGS hex bolts due to minor plating scratches. Replacement credit issued.',
        taxableAmount: 4800,
        cgstAmount: 432,
        sgstAmount: 432,
        igstAmount: 0,
        totalCreditAmount: 5664,
        status: 'ADJUSTED_AGAINST_RECEIVABLE',
      },
      {
        creditNoteNumber: 'CRN-2026-0013',
        creditNoteDate: '2026-09-09',
        originalInvoiceNumber: 'INV-2026-0099',
        originalInvoiceDate: '2026-09-01',
        customerName: 'Larsen & Toubro Ltd',
        customerCode: 'CUST-002',
        gstIn: '24AAACL5566M1Z2',
        reasonCode: 'SPECIAL_COMMERCIAL_DISCOUNT',
        reasonDescription: 'Post-sales annual volume rebate tier adjustment (2% discount).',
        taxableAmount: 12500,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 2250,
        totalCreditAmount: 14750,
        status: 'ADJUSTED_AGAINST_RECEIVABLE',
      },
    ];

    const totalAdjustedTaxable = creditNotes.reduce((acc, c) => acc + c.taxableAmount, 0);
    const totalAdjustedTax = creditNotes.reduce((acc, c) => acc + (c.cgstAmount + c.sgstAmount + c.igstAmount), 0);
    const totalCreditAmount = creditNotes.reduce((acc, c) => acc + c.totalCreditAmount, 0);

    return {
      summary: {
        totalCreditNotesCount: creditNotes.length,
        totalAdjustedTaxableAmount: totalAdjustedTaxable,
        totalAdjustedTaxLiability: totalAdjustedTax,
        totalCreditValue: totalCreditAmount,
      },
      creditNotes,
    };
  }
}
