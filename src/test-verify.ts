import { PasswordService } from './core/security/password';
import { EncryptionService } from './core/security/encryption';
import { AuditLoggerService } from './core/audit/audit-logger';
import { TaxEngine } from './modules/tax/tax.engine';
import { AccountingService } from './modules/accounting/services/accounting.service';
import { GroupNature } from '@prisma/client';
import { buildApp } from './app';

async function runVerification() {
  console.log('--- Starting Finstaq Architecture & Accounting Verification ---');

  // 1. Password Service (Argon2id)
  console.log('\n[1/4] Testing Argon2id Password Hashing & Verification...');
  const testPassword = 'SecurePassword!2026';
  const hash = await PasswordService.hash(testPassword);
  console.log('✓ Generated Argon2id hash:', hash.substring(0, 30) + '...');
  
  const isValid = await PasswordService.verify(hash, testPassword);
  const isInvalid = await PasswordService.verify(hash, 'WrongPassword123');
  if (!isValid || isInvalid) {
    throw new Error('PasswordService verification failed!');
  }
  console.log('✓ Password verification succeeded (valid and invalid cases handled).');

  // 2. Encryption Service (AES-256-GCM)
  console.log('\n[2/4] Testing AES-256-GCM Field-Level Encryption & Decryption...');
  const sensitiveGst = '27AAAAA0000A1Z5';
  const encrypted = EncryptionService.encrypt(sensitiveGst);
  console.log('✓ Encrypted ciphertext:', encrypted);
  const decrypted = EncryptionService.decrypt(encrypted);
  if (decrypted !== sensitiveGst) {
    throw new Error(`Decrypted value mismatch! Expected: ${sensitiveGst}, Got: ${decrypted}`);
  }
  console.log('✓ AES-256-GCM encryption and decryption verified matching original secret.');

  // 3. Audit Diff Engine
  console.log('\n[3/4] Testing Immutable Audit Log Diff Generator...');
  const beforeState = {
    voucherNumber: 'VCH-001',
    narration: 'Initial payment for rent',
    amount: 50000,
    status: 'DRAFT',
  };
  const afterState = {
    voucherNumber: 'VCH-001',
    narration: 'Revised payment for office rent (March)',
    amount: 55000,
    status: 'APPROVED',
  };
  const diff = AuditLoggerService.computeDiff(beforeState, afterState);
  console.log('✓ Computed JSON Diff:', JSON.stringify(diff, null, 2));
  if (
    !diff ||
    !diff.changedFields.includes('narration') ||
    !diff.changedFields.includes('amount') ||
    !diff.changedFields.includes('status')
  ) {
    throw new Error('Audit diff computation failed to detect changed fields!');
  }
  console.log('✓ Audit diff engine accurately captured field mutations.');

  // 4. Fastify Server App & Health Routes (In-memory injection)
  console.log('\n[4/4] Testing Fastify App & Route Injection...');
  const app = buildApp({ logger: false });
  await app.ready();

  const rootRes = await app.inject({
    method: 'GET',
    url: '/',
  });
  console.log('✓ Root Route Status:', rootRes.statusCode, rootRes.json());
  if (rootRes.statusCode !== 200) {
    throw new Error(`Root route returned non-200 status: ${rootRes.statusCode}`);
  }

  const liveRes = await app.inject({
    method: 'GET',
    url: '/health/live',
  });
  console.log('✓ Liveness Route Status:', liveRes.statusCode, liveRes.json());
  if (liveRes.statusCode !== 200) {
    throw new Error(`Liveness route returned non-200 status: ${liveRes.statusCode}`);
  }

  await app.close();

  // 5. Automated Tax Engine Verification
  console.log('\n[5/6] Testing Automated Tax Engine (Intra-State vs Inter-State GST)...');
  // Intra-State: Supplier 27 (MH) to Customer 27 (MH) with 18% GST on 10,000
  const intraStateResult = TaxEngine.calculateTax({
    supplierGstIn: '27AABCF1234F1Z5',
    customerGstIn: '27DEFGH5678H2Z9',
    items: [{ ledgerId: 'dummy-ledger-1', taxableAmount: 10000, taxRatePercent: 18 }],
  });
  console.log('✓ Intra-State GST Breakdown:', intraStateResult);
  if (
    !intraStateResult.isIntraState ||
    intraStateResult.totalTaxAmount !== 1800 ||
    intraStateResult.taxBreakdown.length !== 2 ||
    intraStateResult.taxBreakdown[0].taxType !== 'CGST' ||
    intraStateResult.taxBreakdown[1].taxType !== 'SGST' ||
    intraStateResult.taxBreakdown[0].amount !== 900 ||
    intraStateResult.taxBreakdown[1].amount !== 900
  ) {
    throw new Error('Intra-state GST calculation failed!');
  }

  // Inter-State: Supplier 27 (MH) to Customer 29 (KA) with 18% GST on 10,000
  const interStateResult = TaxEngine.calculateTax({
    supplierGstIn: '27AABCF1234F1Z5',
    customerGstIn: '29XYZAB9876K1Z1',
    items: [{ ledgerId: 'dummy-ledger-1', taxableAmount: 10000, taxRatePercent: 18 }],
  });
  console.log('✓ Inter-State GST Breakdown:', interStateResult);
  if (
    interStateResult.isIntraState ||
    interStateResult.totalTaxAmount !== 1800 ||
    interStateResult.taxBreakdown.length !== 1 ||
    interStateResult.taxBreakdown[0].taxType !== 'IGST' ||
    interStateResult.taxBreakdown[0].amount !== 1800
  ) {
    throw new Error('Inter-state GST calculation failed!');
  }
  console.log('✓ GST Tax Engine accurately handles Intra-State (CGST+SGST) and Inter-State (IGST) supplies.');

  // 6. Double-Entry Accounting Rule Verification
  console.log('\n[6/6] Testing Double-Entry Balance and Ledger Nature Rules...');
  const balancedItems = [
    { ledgerId: '11111111-1111-1111-1111-111111111111', debitAmount: 5000, creditAmount: 0 },
    { ledgerId: '22222222-2222-2222-2222-222222222222', debitAmount: 0, creditAmount: 5000 },
  ];
  const balanceCheck = AccountingService.validateDoubleEntry(balancedItems);
  if (!balanceCheck.isBalanced || balanceCheck.totalDebit !== 5000 || balanceCheck.totalCredit !== 5000) {
    throw new Error('Double entry validation failed for balanced voucher!');
  }

  // Check Asset debit increases balance
  const newAssetBal = AccountingService.computeNewBalance(1000, GroupNature.ASSET, 500, 0);
  if (newAssetBal !== 1500) throw new Error('Asset balance debit calculation incorrect');

  // Check Liability credit increases balance
  const newLiabilityBal = AccountingService.computeNewBalance(2000, GroupNature.LIABILITY, 0, 800);
  if (newLiabilityBal !== 2800) throw new Error('Liability balance credit calculation incorrect');

  console.log('✓ Accounting Double-Entry and Nature rules successfully verified.');

  // 7. Fuzzy String Matching & AI Document Extraction Verification
  console.log('\n[7/7] Testing AI Document Extraction & Fuzzy Smart Matching Engine...');
  const { FuzzyMatcher } = await import('./modules/document/services/fuzzy-matcher');
  const { AiDocumentExtractorService } = await import('./modules/document/services/ai-extractor.service');

  const candidates = [
    { id: 'v1', name: 'Tata Steel Limited' },
    { id: 'v2', name: 'Stark Logistics Corp' },
    { id: 'v3', name: 'Acme Global Enterprises' },
  ];

  // Test exact/noisy matching
  const match1 = FuzzyMatcher.findBestMatch('Tata Steel Ltd', candidates, (c) => c.name);
  console.log('✓ Fuzzy matched "Tata Steel Ltd" ->', match1?.match.name, 'with confidence:', match1?.score);
  if (!match1 || match1.match.id !== 'v1' || match1.score < 0.7) {
    throw new Error('Fuzzy matching failed for Tata Steel Ltd');
  }

  const match2 = FuzzyMatcher.findBestMatch('Stark Logistics', candidates, (c) => c.name);
  console.log('✓ Fuzzy matched "Stark Logistics" ->', match2?.match.name, 'with confidence:', match2?.score);
  if (!match2 || match2.match.id !== 'v2' || match2.score < 0.7) {
    throw new Error('Fuzzy matching failed for Stark Logistics');
  }

  // Test AI Vision Parsing
  const parsedDoc = await AiDocumentExtractorService.parseDocumentVision('sample-buffer', 'invoice_tata_steel.pdf');
  console.log('✓ AI Vision Parsed Document:', {
    vendor: parsedDoc.vendorName,
    po: parsedDoc.poNumber,
    itemsCount: parsedDoc.lineItems.length,
    total: parsedDoc.totalAmount,
    confidence: parsedDoc.overallConfidence,
  });
  if (
    !parsedDoc.vendorName ||
    !parsedDoc.poNumber ||
    parsedDoc.lineItems.length !== 2 ||
    parsedDoc.totalAmount !== 41300
  ) {
    throw new Error('AI Document Vision extraction output invalid');
  }
  console.log('✓ AI Document Extraction Pipeline & Smart Matching Engine verified successfully.');

  // 5. Tally Gap Features & Advanced ERP Modules Verification
  console.log('\n[5/5] Testing 5 Tally Gap Modules (UPI, TCS 206C(1H), PDC, Overdue Interest, Job Work)...');
  
  // 5a. UPI Payments & Collections
  const { upiService } = await import('./modules/upi/services/upi.service');
  const qr = upiService.generateUpiQr({
    payeeVpa: 'apex@hdfcbank',
    payeeName: 'Apex Industries Ltd',
    amount: 15400,
    transactionRef: 'INV-2026-999',
    narration: 'Settlement for INV-2026-999'
  });
  if (!qr.upiUri.startsWith('upi://pay?pa=apex@hdfcbank')) {
    throw new Error('UPI QR generation failed');
  }
  const vpaCheck = upiService.validateVpa('supplier@okaxis');
  if (!vpaCheck.isValid) {
    throw new Error('VPA validation failed');
  }
  const collect = await upiService.processUpiCollection('test-tenant-verify', {
    payerVpa: 'client@icici',
    payerName: 'Global Client Corp',
    amount: 25000,
    invoiceNumber: 'INV-2026-100'
  });
  if (!collect.receiptVoucherNumber.startsWith('RCPT/UPI/')) {
    throw new Error('UPI auto-receipt voucher generation failed');
  }
  const payout = await upiService.processUpiPayout('test-tenant-verify', {
    payeeVpa: 'vendor@axisbank',
    payeeName: 'Logistics Partner',
    amount: 7500,
    narration: 'Freight settlement via UPI'
  });
  if (!payout.paymentVoucherNumber.startsWith('PMT/UPI/')) {
    throw new Error('UPI Payout failed');
  }
  console.log('✓ [1/5] UPI Payments & Collections Hub (Dynamic QR, VPA Validation, Auto-Receipt, Payout) PASSED.');

  // 5b. TCS u/s 206C(1H) & Form 27EQ
  const { tdsTcsService } = await import('./modules/tax/services/tds-tcs.service');
  const testBuyerId = `buyer-fresh-${Date.now()}`;
  const tcs1 = await tdsTcsService.calculateTcs('test-tenant-tcs', {
    buyerPartyId: testBuyerId,
    buyerName: 'ABC Construction',
    buyerPan: 'ABCDE1234F',
    currentInvoiceAmount: 4000000
  });
  if (tcs1.tcsAmount !== 0 || tcs1.isThresholdCrossed) {
    throw new Error('TCS below 50L threshold should be 0');
  }
  const tcs2 = await tdsTcsService.calculateTcs('test-tenant-tcs', {
    buyerPartyId: testBuyerId,
    buyerName: 'ABC Construction',
    buyerPan: 'ABCDE1234F',
    currentInvoiceAmount: 2000000
  });
  if (tcs2.tcsAmount !== 1000 || !tcs2.isThresholdCrossed) {
    throw new Error(`TCS above 50L threshold failed: expected 1000, got ${tcs2.tcsAmount}`);
  }
  const form27eq = await tdsTcsService.getForm27Eq('test-tenant-tcs', 'Q1', '2026-2027');
  if (!form27eq.collectees || form27eq.collectees.length === 0) {
    throw new Error('Form 27EQ export failed');
  }
  console.log('✓ [2/5] TCS Section 206C(1H) (> ₹50L aggregate threshold) & Form 27EQ PASSED.');

  // 5c. Post-Dated Cheques & Memoranda Registry
  const { pdcService } = await import('./modules/pdc/services/pdc.service');
  const pdc = await pdcService.createPdc('test-tenant-pdc', {
    voucherType: 'PDC_PAYMENT',
    pdcNumber: 'PDC-OUT-2026-999',
    partyName: 'Apex Raw Metals',
    partyType: 'VENDOR',
    chequeNumber: 'CHQ-778899',
    bankName: 'HDFC Bank',
    amount: 120000,
    chequeDate: '2026-09-30',
    purposeOrNarration: 'Advance cheque for inventory'
  });
  if (!pdc.id || pdc.status !== 'PENDING') {
    throw new Error('PDC creation failed');
  }
  const promoted = await pdcService.promoteToActiveVoucher('test-tenant-pdc', pdc.id);
  if (!promoted.voucherNumber.startsWith('PMT/AUTO/')) {
    throw new Error('PDC promotion to active books failed');
  }
  console.log('✓ [3/5] Post-Dated Cheques & Memoranda (Maturity Tracking & 1-Click Promotion) PASSED.');

  // 5d. Overdue Interest Engine
  const { interestService } = await import('./modules/interest/services/interest.service');
  const overdues = interestService.getOverdueBills('test-tenant-interest');
  if (!Array.isArray(overdues) || overdues.length === 0) {
    throw new Error('Overdue interest ledgers calculation failed');
  }
  const note = interestService.generateInterestDebitNote({
    billNumber: 'INV-2026-012',
    partyName: 'Bharat Electronics',
    partyType: 'CUSTOMER',
    interestAmount: 2958.90,
    rate: 18,
    overdueDays: 60
  });
  if (!note.debitNoteNumber.startsWith('DN/INT/')) {
    throw new Error('Interest Debit Note generation failed');
  }
  console.log('✓ [4/5] Automated Overdue Interest Calculation Engine (18% p.a. & Debit Note Voucher) PASSED.');

  // 5e. Job Work / Subcontracting & Form ITC-04
  const { jobWorkService } = await import('./modules/jobwork/services/jobwork.service');
  const challan = await jobWorkService.createChallan('test-tenant-jw', {
    challanNumber: 'JWC/2026/09/001',
    challanDate: '2026-09-14',
    jobWorkerName: 'Precision Engineering Works',
    jobWorkerGstin: '27AABCP1234F1Z8',
    jobWorkerAddress: 'Plot 44, MIDC Pune',
    natureOfProcessing: 'Milling & Deburring',
    expectedReturnDate: '2026-10-14',
    items: [
      {
        itemSku: 'RM-CAST-01',
        description: 'Steel Castings',
        hsnCode: '7208',
        uom: 'KG',
        dispatchQuantity: 50,
        ratePerUnit: 500,
        taxableValue: 25000,
        receivedQuantity: 0,
        scrapReturnedQuantity: 0,
      }
    ],
  });
  if (!challan.challanNumber.startsWith('JWC/2026/')) {
    throw new Error('Job Work Delivery Challan creation failed');
  }
  const itc04 = await jobWorkService.generateFormItc04('test-tenant-jw', 'Q1', '2026-27');
  if (!itc04.table4GoodsDispatched || itc04.table4GoodsDispatched.length === 0) {
    throw new Error('Form ITC-04 Quarterly Return export failed');
  }
  console.log('✓ [5/5] Job Work Management (Section 143 Delivery Challans & Form ITC-04) PASSED.');

  console.log('\n🎉 ALL ARCHITECTURAL, SECURITY, TAX, ACCOUNTING, AI PIPELINE & TALLY GAP MODULE TESTS PASSED SUCCESSFULLY!');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
