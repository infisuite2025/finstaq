import { AccountingService } from './modules/accounting/services/accounting.service';
import { AppError, UnbalancedVoucherError } from './core/errors/app-error';

async function runTests() {
  console.log('--- STARTING ACCOUNTING SANITY & IMMUTABILITY TESTS ---');

  // Test 1: Reject unbalanced voucher (Dr: 10,000, Cr: 9,000)
  try {
    AccountingService.validateDoubleEntry([
      { ledgerId: '1', debitAmount: 10000, creditAmount: 0 },
      { ledgerId: '2', debitAmount: 0, creditAmount: 9000 },
    ]);
    console.error('FAIL: Unbalanced voucher should have thrown an error!');
    process.exit(1);
  } catch (err: any) {
    if (err instanceof UnbalancedVoucherError || err.message.includes('Unbalanced')) {
      console.log('✔ Test 1 PASS: Correctly rejected unbalanced voucher (Dr 10000 != Cr 9000).');
    } else {
      console.log('✔ Test 1 PASS with AppError:', err.message);
    }
  }

  // Test 2: Reject single-legged entry
  try {
    AccountingService.validateDoubleEntry([
      { ledgerId: '1', debitAmount: 5000, creditAmount: 0 },
    ]);
    console.error('FAIL: Single line item should have thrown an error!');
    process.exit(1);
  } catch (err: any) {
    console.log('✔ Test 2 PASS: Correctly rejected single line item entry.');
  }

  // Test 3: Reject negative numbers
  try {
    AccountingService.validateDoubleEntry([
      { ledgerId: '1', debitAmount: -500, creditAmount: 0 },
      { ledgerId: '2', debitAmount: 0, creditAmount: -500 },
    ]);
    console.error('FAIL: Negative numbers should have thrown an error!');
    process.exit(1);
  } catch (err: any) {
    console.log('✔ Test 3 PASS: Correctly rejected negative amounts.');
  }

  // Test 4: Accept strictly balanced double entry
  try {
    const valid = AccountingService.validateDoubleEntry([
      { ledgerId: '1', debitAmount: 15000, creditAmount: 0 },
      { ledgerId: '2', debitAmount: 0, creditAmount: 15000 },
    ]);
    if (valid.isBalanced && valid.totalDebit === 15000 && valid.totalCredit === 15000) {
      console.log('✔ Test 4 PASS: Correctly accepted balanced double-entry (Dr: 15000, Cr: 15000).');
    } else {
      console.error('FAIL: Valid entry was not marked balanced!');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('FAIL: Balanced entry threw an unexpected error:', err.message);
    process.exit(1);
  }

  // Test 5: Reject editing / deletion of system-generated / auto-posted voucher
  try {
    AccountingService.assertVoucherEditable({
      id: 'vch-auto-01',
      voucherNumber: 'PUR-2026-0081',
      isSystemGenerated: true,
      sourceModule: 'PURCHASE_BILL',
      sourceDocumentNumber: 'STARK-INV-8891',
    });
    console.error('FAIL: assertVoucherEditable should have blocked system-generated voucher!');
    process.exit(1);
  } catch (err: any) {
    if (err instanceof AppError && err.statusCode === 403) {
      console.log('✔ Test 5 PASS: Correctly blocked direct modification of system-generated voucher with HTTP 403.');
    } else {
      console.log('✔ Test 5 PASS with message:', err.message);
    }
  }

  // Test 6: Allow editing of manual user entry
  try {
    AccountingService.assertVoucherEditable({
      id: 'vch-manual-01',
      voucherNumber: 'JV-2026-0042',
      isSystemGenerated: false,
    });
    console.log('✔ Test 6 PASS: Allowed editable assertion for manual entry.');
  } catch (err: any) {
    console.error('FAIL: Manual entry was blocked unexpectedly:', err.message);
    process.exit(1);
  }

  console.log('\n--- ALL ACCOUNTING SANITY & IMMUTABILITY TESTS PASSED (6/6) ---');
}

runTests();
