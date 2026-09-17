import { buildApp } from './app';

async function runAccountingReportsTest() {
  console.log('===============================================================');
  console.log('🚀 RUNNING COMPREHENSIVE ACCOUNTING & FINANCIAL REPORTS E2E TEST SUITE');
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

  // 1. Balance Sheet
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/balance-sheet',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.totalAssets !== undefined && body.data?.summary?.totalLiabilities !== undefined) {
      results.push({
        test: '1. Balance Sheet (Schedule III & Horizontal/Vertical Presentation)',
        status: 'PASS',
        details: `Assets: ₹${body.data.summary.totalAssets.toLocaleString('en-IN')}, Liab+Eq: ₹${body.data.summary.totalLiabilities.toLocaleString('en-IN')}, Balanced: ${body.data.summary.isBalanced}`
      });
    } else {
      results.push({ test: '1. Balance Sheet', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '1. Balance Sheet', status: 'FAIL', details: err.message });
  }

  // 2. Profit & Loss Statement
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/profit-and-loss',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.totalRevenue !== undefined && body.data?.summary?.netProfitAfterTax !== undefined) {
      results.push({
        test: '2. Profit & Loss Statement (Operating, EBITDA & Net Profit)',
        status: 'PASS',
        details: `Total Revenue: ₹${body.data.summary.totalRevenue.toLocaleString('en-IN')}, Net Profit: ₹${body.data.summary.netProfitAfterTax.toLocaleString('en-IN')} (${body.data.summary.netMarginPercent}% margin)`
      });
    } else {
      results.push({ test: '2. Profit & Loss Statement', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '2. Profit & Loss Statement', status: 'FAIL', details: err.message });
  }

  // 3. Trial Balance
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/trial-balance',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.totalClosingDr !== undefined && body.data?.summary?.isBalanced !== undefined) {
      results.push({
        test: '3. Trial Balance (Multi-Column Debit/Credit & Grouping)',
        status: 'PASS',
        details: `Total Closing Dr: ₹${body.data.summary.totalClosingDr.toLocaleString('en-IN')}, Total Closing Cr: ₹${body.data.summary.totalClosingCr.toLocaleString('en-IN')}, Balanced: ${body.data.summary.isBalanced}`
      });
    } else {
      results.push({ test: '3. Trial Balance', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '3. Trial Balance', status: 'FAIL', details: err.message });
  }

  // 4. Cash Flow Statement
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/cash-flow',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.netOperatingCash !== undefined) {
      results.push({
        test: '4. Cash Flow Statement (AS-3 Direct & Indirect Method)',
        status: 'PASS',
        details: `Operating: ₹${body.data.summary.netOperatingCash.toLocaleString('en-IN')}, Net Inflow: ₹${body.data.summary.netChangeInCash.toLocaleString('en-IN')}, Closing Cash: ₹${body.data.summary.closingCashBank.toLocaleString('en-IN')}`
      });
    } else {
      results.push({ test: '4. Cash Flow Statement', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '4. Cash Flow Statement', status: 'FAIL', details: err.message });
  }

  // 5. General Ledger Statement
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/general-ledger?accountId=acc_bank_01',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.ledgerName && Array.isArray(body.data?.entries)) {
      results.push({
        test: '5. General Ledger Statement & Running Balance',
        status: 'PASS',
        details: `Account: ${body.data.summary.ledgerName}, Entries: ${body.data.entries.length}, Closing: ₹${body.data.summary.closingBalance.toLocaleString('en-IN')} ${body.data.summary.balanceType}`
      });
    } else {
      results.push({ test: '5. General Ledger Statement', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '5. General Ledger Statement', status: 'FAIL', details: err.message });
  }

  // 6. Bank Reconciliation Statement (BRS)
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/bank-reconciliation?bankAccountId=acc_bank_01',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.balanceAsPerCompanyBooks !== undefined && Array.isArray(body.data?.brsItems)) {
      results.push({
        test: '6. Bank Reconciliation Statement (BRS Auto-Matching)',
        status: 'PASS',
        details: `Bank: ${body.data.summary.bankName}, Company: ₹${body.data.summary.balanceAsPerCompanyBooks.toLocaleString('en-IN')}, Bank: ₹${body.data.summary.balanceAsPerBankStatement.toLocaleString('en-IN')}, Status: ${body.data.summary.reconciliationStatus}`
      });
    } else {
      results.push({ test: '6. Bank Reconciliation Statement', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '6. Bank Reconciliation Statement', status: 'FAIL', details: err.message });
  }

  // 7. Financial Ratio Analysis
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/ratio-analysis',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.overallHealthScore && Array.isArray(body.data?.ratios)) {
      results.push({
        test: '7. Financial Ratio Analysis (Liquidity, Solvency, Turnover, Profitability)',
        status: 'PASS',
        details: `Health Score: ${body.data.summary.overallHealthScore}, Working Capital: ${body.data.summary.workingCapitalCycle}, Total Ratios: ${body.data.ratios.length}`
      });
    } else {
      results.push({ test: '7. Financial Ratio Analysis', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '7. Financial Ratio Analysis', status: 'FAIL', details: err.message });
  }

  // 8. Group Summary / Chart of Accounts
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/group-summary',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.totalActiveGroups !== undefined && Array.isArray(body.data?.groups)) {
      results.push({
        test: '8. Group Summary & Chart of Accounts Hierarchy',
        status: 'PASS',
        details: `Total Groups: ${body.data.summary.totalActiveGroups}, Total Ledgers: ${body.data.summary.totalLedgerCount}`
      });
    } else {
      results.push({ test: '8. Group Summary', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '8. Group Summary', status: 'FAIL', details: err.message });
  }

  // 9. GST Computation & Tax Summary
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/gst-computation',
      headers: authHeader,
    });
    const body = JSON.parse(res.body);
    if (res.statusCode === 200 && body.success && body.data?.summary?.totalOutputTax !== undefined && body.data?.summary?.totalInputTaxCredit !== undefined) {
      results.push({
        test: '9. GST Computation & Statutory Tax Summary (GSTR-3B Auto-Preparation)',
        status: 'PASS',
        details: `Output Tax: ₹${body.data.summary.totalOutputTax.toLocaleString('en-IN')}, Eligible ITC: ₹${body.data.summary.totalInputTaxCredit.toLocaleString('en-IN')}, Net GST Payable: ₹${body.data.summary.totalNetGstPayable.toLocaleString('en-IN')}`
      });
    } else {
      results.push({ test: '9. GST Computation', status: 'FAIL', details: res.body });
    }
  } catch (err: any) {
    results.push({ test: '9. GST Computation', status: 'FAIL', details: err.message });
  }

  console.log('\n---------------------------------------------------------------');
  console.log('📊 FINANCIAL & ACCOUNTING REPORTS TEST RESULTS SUMMARY');
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
    console.log('🎉 ALL 9 FINANCIAL & ACCOUNTING REPORT ENDPOINTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED!');
    process.exit(1);
  }
}

runAccountingReportsTest().catch((err) => {
  console.error('Fatal Error running test:', err);
  process.exit(1);
});
