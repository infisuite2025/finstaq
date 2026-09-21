import { buildApp } from './app';
import { UserRole } from '@prisma/client';

interface TestResult {
  category: string;
  testCase: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

const testResults: TestResult[] = [];

function recordResult(category: string, testCase: string, passed: boolean, details: string) {
  testResults.push({
    category,
    testCase,
    status: passed ? 'PASSED' : 'FAILED',
    details,
  });
  const icon = passed ? '✅' : '❌';
  console.log(icon + ' [' + category + '] ' + testCase + ': ' + details);
}

async function runMastersQATestSuite() {
  console.log('================================================================');
  console.log('  FINSTAQ DYNAMIC MASTERS E2E QA TEST SUITE (ZERO HARDCODING)');
  console.log('  Date: ' + new Date().toISOString());
  console.log('================================================================\n');

  const app = buildApp({ logger: false });
  await app.ready();

  const tenantId = '27AABCF1234F1Z5';
  const ownerToken = app.jwt.sign({
    userId: 'usr-owner-001',
    tenantId,
    email: 'owner@apexindustries.com',
    role: UserRole.OWNER,
  });

  const headers = {
    authorization: 'Bearer ' + ownerToken,
    'x-tenant-id': tenantId,
  };

  // 1. ALL MASTERS BUNDLE
  console.log('--- 1. Testing Complete Master Bundle API ---');
  const bundleRes = await app.inject({
    method: 'GET',
    url: '/api/v1/masters/all',
    headers,
  });
  const bundle = bundleRes.json();
  recordResult(
    'Master Bundle',
    'Fetch All Masters in 1 Payload',
    bundleRes.statusCode === 200 && bundle.data.uoms?.length > 0 && bundle.data.groups?.length > 0,
    'Loaded ' + bundle.data.groups?.length + ' COA Groups, ' + bundle.data.uoms?.length + ' UoMs, ' + bundle.data.taxRates?.length + ' Tax Slabs, ' + bundle.data.warehouses?.length + ' Warehouses.'
  );

  // 2. UNITS OF MEASUREMENT
  console.log('\n--- 2. Testing Units of Measurement (UoM) ---');
  const createUomRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/uom',
    headers,
    payload: {
      symbol: 'ROLL',
      formalName: 'Rolls & Coils',
      uqc: 'ROL',
      decimalPlaces: 0,
      isDefault: false,
    },
  });
  recordResult(
    'UoM Master',
    'Create Custom Unit of Measurement',
    createUomRes.statusCode === 201,
    'Successfully registered dynamic UoM ROLL with GST UQC ROL.'
  );

  // 3. ITEM CATEGORIES
  console.log('\n--- 3. Testing Item Categories Hierarchy ---');
  const createCatRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/categories',
    headers,
    payload: {
      name: 'Polymer & Rubber Seals',
      code: 'SEAL',
      defaultHsn: '4016',
      defaultTaxRate: 18,
      description: 'O-rings, hydraulic seals and gaskets',
    },
  });
  recordResult(
    'Item Category Master',
    'Create Item Taxonomy Category',
    createCatRes.statusCode === 201,
    'Successfully created Item Category Polymer & Rubber Seals with default HSN 4016 & 18% GST.'
  );

  // 4. WAREHOUSES & LOCATIONS
  console.log('\n--- 4. Testing Warehouses & Godowns ---');
  const createWhRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/warehouses',
    headers,
    payload: {
      code: 'WH-BLR-01',
      name: 'Bangalore Regional Logistics Depot',
      address: 'Plot 88, Peenya Industrial Area',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560058',
      contactPerson: 'Karthik Rao',
      phone: '+91 98450 12345',
      isPrimary: false,
    },
  });
  recordResult(
    'Warehouse Master',
    'Create Multi-Location Warehouse',
    createWhRes.statusCode === 201,
    'Created regional depot WH-BLR-01 in Bangalore, Karnataka.'
  );

  // 5. COST CENTERS
  console.log('\n--- 5. Testing Cost Centers & Departments ---');
  const createCcRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/cost-centers',
    headers,
    payload: {
      code: 'CC-QA-LAB',
      name: 'Quality Assurance & Metallurgical Testing Lab',
      category: 'Operations',
    },
  });
  recordResult(
    'Cost Center Master',
    'Create Departmental Cost Center',
    createCcRes.statusCode === 201,
    'Registered Cost Center CC-QA-LAB for QA department.'
  );

  // 6. PAYMENT TERMS
  console.log('\n--- 6. Testing Payment & Credit Terms ---');
  const createPtRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/payment-terms',
    headers,
    payload: {
      code: 'NET90',
      name: 'Net 90 Days Enterprise Term',
      days: 90,
      description: 'Quarterly supply credit term for public sector contracts',
    },
  });
  recordResult(
    'Payment Terms Master',
    'Create Dynamic Credit Term',
    createPtRes.statusCode === 201,
    'Configured Net 90 Days credit term with automated due calculation.'
  );

  // 7. STATUTORY TAX SLABS
  console.log('\n--- 7. Testing GST Tax Slabs & Splitting ---');
  const createTaxRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/tax-rates',
    headers,
    payload: {
      name: 'GST 3% Special (Precious Metals & Ores)',
      ratePercent: 3,
      cgstPercent: 1.5,
      sgstPercent: 1.5,
      igstPercent: 3,
      cessPercent: 0,
      isDefault: false,
    },
  });
  recordResult(
    'Tax Rates Master',
    'Create Special Statutory Tax Slab',
    createTaxRes.statusCode === 201,
    'Configured 3% GST slab (1.5% CGST + 1.5% SGST / 3% IGST).'
  );

  // 8. MULTI-CURRENCY ENGINE
  console.log('\n--- 8. Testing Currencies & FX Rates ---');
  const createCurRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/currencies',
    headers,
    payload: {
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: 'S$',
      decimalPlaces: 2,
      exchangeRate: 64.25,
      isBase: false,
    },
  });
  recordResult(
    'Currency Master',
    'Create Foreign Currency & Exchange Rate',
    createCurRes.statusCode === 201,
    'Configured SGD (S$) with exchange rate 1 SGD = 64.25 INR.'
  );

  // 9. CHART OF ACCOUNTS (GROUPS & LEDGERS)
  console.log('\n--- 9. Testing Chart of Accounts (COA) Groups & Ledgers ---');
  const createGrpRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/groups',
    headers,
    payload: {
      name: 'IT & Cloud Infrastructure Expenses',
      code: 'EXP-IT',
      parentId: 'grp-09',
      nature: 'EXPENSE',
      affectsGrossProfit: false,
    },
  });
  recordResult(
    'COA Group Master',
    'Create Sub-Group in Hierarchy',
    createGrpRes.statusCode === 201,
    'Created IT & Cloud Infrastructure Expenses sub-group under Indirect Expenses.'
  );

  const createLedgerRes = await app.inject({
    method: 'POST',
    url: '/api/v1/masters/ledgers',
    headers,
    payload: {
      name: 'AWS & Cloud Hosting Server Costs',
      groupId: createGrpRes.json().data.id,
      code: 'EXP-AWS-01',
      openingBalance: 25000,
    },
  });
  recordResult(
    'COA Ledger Master',
    'Create General Ledger Under Dynamic Group',
    createLedgerRes.statusCode === 201,
    'Created general ledger AWS & Cloud Hosting Server Costs under dynamic IT group.'
  );

  // SUMMARY REPORT
  console.log('\n================================================================');
  console.log('  DYNAMIC MASTERS QA SUMMARY VERIFICATION');
  console.log('================================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  const totalCount = testResults.length;
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  console.log('Total Tests: ' + totalCount);
  console.log('Passed:      ' + passedCount + ' / ' + totalCount + ' (' + passRate + '%)');
  console.log('Failed:      ' + (totalCount - passedCount));
  console.log('================================================================\n');

  if (passedCount === totalCount) {
    console.log('🎉 ALL DYNAMIC MASTERS E2E QA TESTS PASSED WITH 100% SUCCESS!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runMastersQATestSuite().catch((err) => {
  console.error('Error running QA suite:', err);
  process.exit(1);
});