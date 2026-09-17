import { buildApp } from './app';

async function runPurchaseInvoiceTest() {
  console.log('===============================================================');
  console.log('🚀 RUNNING COMPREHENSIVE PURCHASE INVOICE BOOKING E2E TEST SUITE');
  console.log('===============================================================\n');

  const app = buildApp();
  await app.ready();

  const tenantId = '27AABCF1234F1Z5';
  const token = app.jwt.sign({
    userId: 'user-apex-001',
    email: 'accountant@apexindustries.com',
    role: 'ACCOUNTANT',
    tenantId,
  });

  const authHeader = {
    authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId,
  };

  const results: { test: string; status: 'PASS' | 'FAIL'; details?: string }[] = [];

  let createdInvoiceId = '';

  // 1. List Initial Invoices
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/invoices',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && Array.isArray(body.data)) {
      results.push({
        test: '1. List Booked Purchase Invoices',
        status: 'PASS',
        details: `Found ${body.data.length} booked invoices. Total Value: ₹${body.data.reduce((acc: number, i: any) => acc + i.totalAmount, 0).toLocaleString('en-IN')}`
      });
    } else {
      results.push({ test: '1. List Booked Purchase Invoices', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '1. List Booked Purchase Invoices', status: 'FAIL', details: err.message });
  }

  // 2. Book Intra-State Purchase Invoice with CGST + SGST & TDS 194Q
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/purchase/invoices',
      headers: authHeader,
      payload: {
        vendorInvoiceNumber: `STARK-INV-${Date.now().toString().slice(-4)}`,
        vendorLedgerId: 'v-101',
        invoiceDate: '2026-09-13',
        dueDate: '2026-10-13',
        poId: 'po-001',
        grnId: 'grn-001',
        paymentTerms: 'Net 30 Days',
        tdsSection: '194Q',
        tdsRatePercent: 0.1,
        remarks: 'Direct raw material purchase with automated 3-Way Match validation.',
        items: [
          {
            description: 'Industrial Fasteners Grade 10.9 Heavy Duty',
            hsnCode: '7318',
            uom: 'PCS',
            quantity: 50,
            unitPrice: 1200,
            discountPercent: 5,
            taxRatePercent: 18,
          },
        ],
      },
    });

    const body = JSON.parse(res.body);
    if (res.statusCode === 201 && body.success && body.data?.invoiceNumber) {
      createdInvoiceId = body.data.id;
      const inv = body.data;
      const hasGlEntries = inv.accountingVoucher?.entries?.length >= 4;
      results.push({
        test: '2. Book Intra-State Invoice (CGST+SGST, TDS 194Q & Double-Entry GL Posting)',
        status: hasGlEntries ? 'PASS' : 'FAIL',
        details: `Voucher: ${inv.invoiceNumber}, Subtotal: ₹${inv.subtotal}, CGST: ₹${inv.cgstAmount}, SGST: ₹${inv.sgstAmount}, TDS: ₹${inv.tdsAmount}, Net Payable: ₹${inv.totalAmount}, GL Entries: ${inv.accountingVoucher?.entries?.length}`
      });
    } else {
      results.push({ test: '2. Book Intra-State Invoice', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '2. Book Intra-State Invoice', status: 'FAIL', details: err.message });
  }

  // 3. Book Inter-State Purchase Invoice with IGST & TDS 194C
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/purchase/invoices',
      headers: authHeader,
      payload: {
        vendorInvoiceNumber: `ACME-INTER-${Date.now().toString().slice(-4)}`,
        vendorLedgerId: 'v-102', // Gujarat inter-state vendor
        invoiceDate: '2026-09-13',
        dueDate: '2026-09-28',
        paymentTerms: 'Immediate / Net 15 Days',
        tdsSection: '194C',
        tdsRatePercent: 2.0,
        remarks: 'Machinery tooling and fabrication contract jobwork bill.',
        items: [
          {
            description: 'Custom CNC Precision Milling Spindle 12000 RPM',
            hsnCode: '8482',
            uom: 'SETS',
            quantity: 2,
            unitPrice: 75000,
            discountPercent: 0,
            taxRatePercent: 18,
          },
        ],
      },
    });

    const body = JSON.parse(res.body);
    if (res.statusCode === 201 && body.success && body.data?.igstAmount > 0 && body.data?.cgstAmount === 0) {
      results.push({
        test: '3. Book Inter-State Invoice (IGST Auto-Detection & TDS 194C)',
        status: 'PASS',
        details: `Voucher: ${body.data.invoiceNumber}, Subtotal: ₹${body.data.subtotal}, IGST: ₹${body.data.igstAmount}, TDS u/s 194C: ₹${body.data.tdsAmount}, Total Payable: ₹${body.data.totalAmount}`
      });
    } else {
      results.push({ test: '3. Book Inter-State Invoice', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '3. Book Inter-State Invoice', status: 'FAIL', details: err.message });
  }

  // 4. Fetch Single Invoice Details & GL Accounting Matrix
  try {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/purchase/invoices/${createdInvoiceId || 'pinv-001'}`,
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.accountingVoucher?.entries) {
      results.push({
        test: '4. Get Invoice by ID with GL Voucher Breakdown',
        status: 'PASS',
        details: `Invoice: ${body.data.vendorInvoiceNumber}, Voucher Ref: ${body.data.invoiceNumber}, GL Accounts: ${body.data.accountingVoucher.entries.map((e: any) => e.accountName).join(' | ')}`
      });
    } else {
      results.push({ test: '4. Get Invoice by ID', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '4. Get Invoice by ID', status: 'FAIL', details: err.message });
  }

  // 5. Record Vendor Bill Payment
  try {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/purchase/invoices/${createdInvoiceId || 'pinv-001'}/pay`,
      headers: authHeader,
      payload: {
        amount: 25000,
        paymentMode: 'HDFC_NETBANKING',
        referenceNo: 'UTR-991204812',
        paymentDate: '2026-09-13',
      },
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.paidAmount >= 25000) {
      results.push({
        test: '5. Record Partial / Full Vendor Bill Payment',
        status: 'PASS',
        details: `Invoice: ${body.data.vendorInvoiceNumber}, Paid: ₹${body.data.paidAmount}, Remaining Balance: ₹${body.data.balanceAmount}, Status: ${body.data.status}`
      });
    } else {
      results.push({ test: '5. Record Vendor Bill Payment', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '5. Record Vendor Bill Payment', status: 'FAIL', details: err.message });
  }

  // 6. Create Debit Note (Purchase Return / Adjustment)
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/purchase/debit-notes',
      headers: authHeader,
      payload: {
        invoiceId: createdInvoiceId || 'pinv-001',
        reason: 'Rate variance and damaged packing returned to vendor',
        amount: 5000,
        taxAmount: 900,
      },
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 201 && body.success && body.data?.debitNoteNumber) {
      results.push({
        test: '6. Issue Debit Note (Purchase Return & Vendor Credit)',
        status: 'PASS',
        details: `Debit Note #: ${body.data.debitNoteNumber}, Adjusted Taxable: ₹${body.data.taxableAmount}, Total Credit: ₹${body.data.grandTotal}`
      });
    } else {
      results.push({ test: '6. Issue Debit Note', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '6. Issue Debit Note', status: 'FAIL', details: err.message });
  }

  // 7. Procurement Summary & Spend Metrics
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/summary',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.totalInvoiceCount !== undefined) {
      results.push({
        test: '7. Procurement Summary & AP Spend Metrics',
        status: 'PASS',
        details: `Total Invoices: ${body.data.totalInvoiceCount}, Total Invoiced Spend: ₹${body.data.totalInvoiceValue.toLocaleString('en-IN')}, Pending Payables: ₹${body.data.pendingPaymentValue.toLocaleString('en-IN')}`
      });
    } else {
      results.push({ test: '7. Procurement Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '7. Procurement Summary', status: 'FAIL', details: err.message });
  }

  // 8. Multi-Tenant Row-Level Isolation
  try {
    const foreignTenantId = '29ZZZ99999Z1Z0';
    const foreignToken = app.jwt.sign({
      userId: 'user-foreign-999',
      email: 'intruder@foreigntenant.com',
      role: 'ACCOUNTANT',
      tenantId: foreignTenantId,
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/invoices',
      headers: {
        authorization: `Bearer ${foreignToken}`,
        'x-tenant-id': foreignTenantId,
      },
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && Array.isArray(body.data) && body.data.length === 0) {
      results.push({
        test: '8. Multi-Tenant Row-Level Isolation Scoping',
        status: 'PASS',
        details: 'Foreign tenant receives 0 records, perfectly isolated from Apex Industries data.'
      });
    } else {
      results.push({ test: '8. Multi-Tenant Row-Level Isolation', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '8. Multi-Tenant Row-Level Isolation', status: 'FAIL', details: err.message });
  }

  console.log('\n---------------------------------------------------------------');
  console.log('📊 PURCHASE INVOICE BOOKING TEST RESULTS SUMMARY');
  console.log('---------------------------------------------------------------');
  let passed = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${r.status}] ${r.test}`);
    if (r.details) {
      console.log(`   ↳ ${r.details}`);
    }
    if (r.status === 'PASS') passed++;
  }
  console.log('---------------------------------------------------------------');
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${results.length - passed}`);
  console.log('===============================================================\n');

  if (passed === results.length) {
    console.log('🎉 ALL PURCHASE INVOICE BOOKING ENDPOINTS & BUSINESS LOGIC PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED!');
    process.exit(1);
  }
}

runPurchaseInvoiceTest().catch((err) => {
  console.error('Fatal Error running test:', err);
  process.exit(1);
});
