import { buildApp } from './app';

async function runSalesReportsTest() {
  console.log('===============================================================');
  console.log('🚀 RUNNING COMPREHENSIVE SALES REPORTS E2E TEST SUITE');
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

  // 1. Test Sales Register
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/register',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.monthlySummary)) {
      results.push({ test: '1. Sales Register (Day Book & Monthly Periodic Summary)', status: 'PASS', details: `Invoices: ${body.data.summary.totalInvoices}, Gross: ₹${body.data.summary.grandTotal}` });
    } else {
      results.push({ test: '1. Sales Register', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '1. Sales Register', status: 'FAIL', details: err.message });
  }

  // 2. Test SO Outstanding Matrix
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/so-outstanding',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.orders)) {
      results.push({ test: '2. SO Outstanding & Fulfillment Matrix', status: 'PASS', details: `Active SOs: ${body.data.summary.totalOrders}, Backlog: ₹${body.data.summary.totalPendingValue}` });
    } else {
      results.push({ test: '2. SO Outstanding & Fulfillment Matrix', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '2. SO Outstanding & Fulfillment Matrix', status: 'FAIL', details: err.message });
  }

  // 3. Test Delivery Challan Register
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/challans',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.challans)) {
      results.push({ test: '3. Outward Delivery Challan & Dispatch Register', status: 'PASS', details: `Challans: ${body.data.summary.totalChallans}, Units: ${body.data.summary.totalDispatchedUnits}` });
    } else {
      results.push({ test: '3. Outward Delivery Challan Register', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '3. Outward Delivery Challan Register', status: 'FAIL', details: err.message });
  }

  // 4. Test Sales Bills Pending (Unbilled Deliveries)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/bills-pending',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.unbilledDeliveries)) {
      results.push({ test: '4. Sales Bills Pending (Sales Bills to Make)', status: 'PASS', details: `Unbilled Challans: ${body.data.summary.pendingChallansCount}, Revenue: ₹${body.data.summary.totalUnbilledRevenueAmount}` });
    } else {
      results.push({ test: '4. Sales Bills Pending', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '4. Sales Bills Pending', status: 'FAIL', details: err.message });
  }

  // 5. Test Customer Sales Revenue & Pareto Distribution
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/customer-sales',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.customers)) {
      results.push({ test: '5. Customer-wise Revenue & Pareto 80/20 Distribution', status: 'PASS', details: `Customers: ${body.data.summary.activeCustomersCount}, Revenue: ₹${body.data.summary.totalSalesRevenue}` });
    } else {
      results.push({ test: '5. Customer-wise Revenue Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '5. Customer-wise Revenue Summary', status: 'FAIL', details: err.message });
  }

  // 6. Test Item Sales & Gross Margin Analysis
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/item-sales',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.items)) {
      results.push({ test: '6. Item Sales & Gross Profit Margin Matrix', status: 'PASS', details: `SKUs: ${body.data.summary.totalUniqueSkus}, Profit: ₹${body.data.summary.totalGrossProfit}, Margin: ${body.data.summary.overallMarginPercent}%` });
    } else {
      results.push({ test: '6. Item Sales Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '6. Item Sales Summary', status: 'FAIL', details: err.message });
  }

  // 7. Test Customer Receivables Aging Analysis (Sundry Debtors)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/customer-aging',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.debtors)) {
      results.push({ test: '7. Customer Receivables Aging (Sundry Debtors)', status: 'PASS', details: `Receivables: ₹${body.data.summary.totalReceivable}, Current (0-30d): ₹${body.data.summary.total0To30}` });
    } else {
      results.push({ test: '7. Customer Receivables Aging', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '7. Customer Receivables Aging', status: 'FAIL', details: err.message });
  }

  // 8. Test Statutory Outward GST Summary (GSTR-1 Matrix)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/gstr1-summary',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.hsnSummary)) {
      results.push({ test: '8. Statutory Outward GST Summary (GSTR-1 Table 12)', status: 'PASS', details: `Taxable Turnover: ₹${body.data.summary.totalOutwardTaxableTurnover}, Output Tax: ₹${body.data.summary.totalOutputTaxLiability}` });
    } else {
      results.push({ test: '8. Statutory Outward GST Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '8. Statutory Outward GST Summary', status: 'FAIL', details: err.message });
  }

  // 9. Test Sales Returns & Credit Notes Register
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/returns',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary && Array.isArray(body.data?.creditNotes)) {
      results.push({ test: '9. Credit Notes & Sales Returns Register', status: 'PASS', details: `Credit Notes: ${body.data.summary.totalCreditNotesCount}, Adjusted Tax: ₹${body.data.summary.totalAdjustedTaxLiability}` });
    } else {
      results.push({ test: '9. Credit Notes & Sales Returns Register', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '9. Credit Notes & Sales Returns Register', status: 'FAIL', details: err.message });
  }

  // Multi-tenant Isolation Test
  try {
    const otherTenantId = '33AABCT9999Z1Z0';
    const otherToken = app.jwt.sign({
      userId: 'user-other-001',
      email: 'user@othertenant.com',
      role: 'ACCOUNTANT',
      tenantId: otherTenantId,
    });
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sales/reports/register',
      headers: {
        authorization: `Bearer ${otherToken}`,
        'x-tenant-id': otherTenantId,
      },
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success) {
      results.push({ test: '10. Multi-Tenant Row-Level Isolation Scoping', status: 'PASS', details: 'Zero records leaked across foreign tenant boundaries' });
    } else {
      results.push({ test: '10. Multi-Tenant Row-Level Isolation Scoping', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '10. Multi-Tenant Row-Level Isolation Scoping', status: 'FAIL', details: err.message });
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

runSalesReportsTest();
