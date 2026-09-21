import { buildApp } from './app';

async function runPurchaseReportsTest() {
  console.log('===============================================================');
  console.log('🚀 RUNNING COMPREHENSIVE PURCHASE REPORTS E2E TEST SUITE');
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

  // 1. Test Purchase Register
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/register',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.monthlySummary)) {
      results.push({ test: '1. Purchase Register (Day Book & Monthly Summary)', status: 'PASS', details: `Vouchers: ${body.data.summary.totalVouchers}, Gross: ₹${body.data.summary.grandTotal}` });
    } else {
      results.push({ test: '1. Purchase Register', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '1. Purchase Register', status: 'FAIL', details: err.message });
  }

  // 2. Test PO Outstanding Matrix
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/po-outstanding',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.orders)) {
      results.push({ test: '2. PO Outstanding & Line-Item Matrix', status: 'PASS', details: `POs: ${body.data.summary.totalOrders}, Pending Val: ₹${body.data.summary.totalPendingValue}` });
    } else {
      results.push({ test: '2. PO Outstanding & Line-Item Matrix', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '2. PO Outstanding & Line-Item Matrix', status: 'FAIL', details: err.message });
  }

  // 3. Test GRN QC Rejection Register
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/grn-rejections',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.receipts)) {
      results.push({ test: '3. GRN Inward & QC Rejection Register', status: 'PASS', details: `Inwarded: ${body.data.summary.totalReceivedUnits}, Pass Rate: ${body.data.summary.qcPassRatePercent}%` });
    } else {
      results.push({ test: '3. GRN Inward & QC Rejection Register', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '3. GRN Inward & QC Rejection Register', status: 'FAIL', details: err.message });
  }

  // 4. Test Purchase Bills Pending (GR-IR Accruals)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/bills-pending',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.pendingBills)) {
      results.push({ test: '4. Purchase Bills Pending (GR-IR Accruals)', status: 'PASS', details: `Pending GRNs: ${body.data.summary.pendingGrnCount}, Accrual Liability: ₹${body.data.summary.totalAccruedLiabilityAmount}` });
    } else {
      results.push({ test: '4. Purchase Bills Pending', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '4. Purchase Bills Pending', status: 'FAIL', details: err.message });
  }

  // 5. Test Vendor Spend Summary
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/vendor-spend',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.vendors)) {
      results.push({ test: '5. Vendor-wise Spend & Pareto Summary', status: 'PASS', details: `Vendors: ${body.data.summary.activeVendorsCount}, Spend: ₹${body.data.summary.totalProcurementSpend}` });
    } else {
      results.push({ test: '5. Vendor-wise Spend Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '5. Vendor-wise Spend Summary', status: 'FAIL', details: err.message });
  }

  // 6. Test Item Purchase Summary (WAC)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/item-summary',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.items)) {
      results.push({ test: '6. Item Purchase Summary (Weighted Avg Cost)', status: 'PASS', details: `SKUs: ${body.data.summary.totalUniqueSkus}, Spend: ₹${body.data.summary.totalSpend}` });
    } else {
      results.push({ test: '6. Item Purchase Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '6. Item Purchase Summary', status: 'FAIL', details: err.message });
  }

  // 7. Test 3-Way Reconciliation Variance Audit
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/three-way-variance',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.audits)) {
      results.push({ test: '7. 3-Way Reconciliation Variance Audit', status: 'PASS', details: `Audited: ${body.data.summary.totalAudits}, Discrepancies: ${body.data.summary.discrepanciesCount}` });
    } else {
      results.push({ test: '7. 3-Way Reconciliation Variance Audit', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '7. 3-Way Reconciliation Variance Audit', status: 'FAIL', details: err.message });
  }

  // 8. Test Vendor Payables Aging Analysis
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/vendor-aging',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.creditors)) {
      results.push({ test: '8. Vendor Payables Aging (Sundry Creditors)', status: 'PASS', details: `Total Payables: ₹${body.data.summary.totalPayable}, Current (0-30d): ₹${body.data.summary.total0To30}` });
    } else {
      results.push({ test: '8. Vendor Payables Aging', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '8. Vendor Payables Aging', status: 'FAIL', details: err.message });
  }

  // 9. Test Inward ITC GST Summary (GSTR-2B)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/purchase/reports/itc-summary',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.taxSlabs)) {
      results.push({ test: '9. Input Tax Credit (ITC) / Inward GST Summary', status: 'PASS', details: `Eligible ITC: ₹${body.data.summary.totalItcAvailable}, CGST: ₹${body.data.summary.totalCgstItc}` });
    } else {
      results.push({ test: '9. Input Tax Credit (ITC) Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '9. Input Tax Credit (ITC) Summary', status: 'FAIL', details: err.message });
  }

  console.log('---------------------------------------------------------------');
  console.log('📊 TEST EXECUTION SUMMARY:');
  console.log('---------------------------------------------------------------');
  let passCount = 0;
  results.forEach((r) => {
    if (r.status === 'PASS') {
      passCount++;
      console.log(`✅ [PASS] ${r.test} - ${r.details || ''}`);
    } else {
      console.log(`❌ [FAIL] ${r.test} - ${r.details || ''}`);
    }
  });
  console.log('---------------------------------------------------------------');
  console.log(`🎯 SCORE: ${passCount}/${results.length} Tests Passed (${Math.round((passCount / results.length) * 100)}%)\n`);

  await app.close();
  if (passCount === results.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPurchaseReportsTest();
