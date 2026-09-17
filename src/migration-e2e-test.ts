import { MigrationParserService } from './modules/migration/services/migration-parser.service';
import { MigrationEngineService } from './modules/migration/services/migration-engine.service';
import { MultiYearScopeConfig } from './modules/migration/types/migration.types';

async function runMigrationTests() {
  console.log('🚀 Starting Finstaq Multi-Year Legacy Data Migration Verification...');

  const jobId = 'test-job-3year-tally';
  const tenantId = '27AABCF1234F1Z5';

  const scope: MultiYearScopeConfig = {
    sourceSystem: 'TALLY_PRIME',
    historicalYearsCount: 3,
    startFiscalYear: 'FY 2023-24',
    activeFiscalYear: 'FY 2026-27',
    closedYears: ['FY 2023-24', 'FY 2024-25', 'FY 2025-26'],
    preserveBillWisePending: true,
    enableAutoClosingRoll: true,
    strictDoubleEntrySanity: true,
  };

  // 1. Parse multi-year Tally dataset
  const dataset = MigrationParserService.parseDataset(jobId, tenantId, 'TALLY_PRIME', scope);
  console.log('✓ Parsed Multi-Year Dataset:');
  console.log(`  • Ledgers: ${dataset.ledgers.length}`);
  console.log(`  • Inventory Items: ${dataset.inventory.length}`);
  console.log(`  • Historical Vouchers: ${dataset.vouchers.length}`);
  console.log(`  • Open Pending Bills: ${dataset.openBills.length}`);
  console.log(`  • Fiscal Years Covered: ${dataset.summary.yearsCovered.join(', ')}`);

  if (dataset.ledgers.length < 10) {
    throw new Error('Ledger count is insufficient in parsed dataset');
  }

  await MigrationEngineService.saveJob(dataset);

  // 2. Pre-flight 12 sanity checks
  const sanityReport = MigrationEngineService.validateDataset(dataset);
  console.log(`\n✓ Pre-Flight Sanity Report (${sanityReport.passedCount}/${sanityReport.totalRulesChecked} Rules Passed):`);
  sanityReport.rules.forEach((r) => {
    console.log(`  [${r.severity}] ${r.ruleName}: ${r.description}`);
  });

  if (sanityReport.errorCount > 0) {
    throw new Error('Sanity check reported blocking errors');
  }

  // 3. Verify Zero-Difference Invariant
  if (!sanityReport.balanceSheetZeroDiff) {
    throw new Error(`Zero-Difference guarantee failed: delta = ${sanityReport.deltaAmount}`);
  }
  console.log('\n✓ Zero-Difference Balance Sheet Invariant Verified (Δ = ₹0.00)');

  // 4. Verify Bill-by-Bill Open Receivables/Payables
  const totalOpenBillAmount = dataset.openBills.reduce((sum, b) => sum + b.pendingAmount, 0);
  console.log(`✓ Preserved ${dataset.openBills.length} unpaid invoices totaling ₹${totalOpenBillAmount.toLocaleString('en-IN')}`);
  dataset.openBills.forEach((b) => {
    if (!b.billNumber || !b.billDate || b.daysOverdue === undefined) {
      throw new Error(`Bill reference missing metadata: ${JSON.stringify(b)}`);
    }
  });

  // 5. Execute Atomic Multi-Year Ingestion
  const result = await MigrationEngineService.executeMigration(jobId);
  console.log('\n✓ Migration Ingestion Executed Successfully:');
  console.log(`  • Certificate ID: ${result.certificateId}`);
  console.log(`  • Ingested Years: ${result.ingestedYears.join(', ')}`);
  console.log(`  • Closing JVs Generated: ${result.recordsCreated.closingJvsGenerated}`);
  console.log(`  • Source Total Dr/Cr: ₹${result.reconciliation.sourceTotalDr.toLocaleString('en-IN')}`);
  console.log(`  • Finstaq Total Dr/Cr: ₹${result.reconciliation.finstaqTotalDr.toLocaleString('en-IN')}`);
  console.log(`  • Discrepancy Delta: ₹${result.reconciliation.varianceDelta.toFixed(2)}`);

  if (result.reconciliation.varianceDelta !== 0) {
    throw new Error('Reconciliation delta is non-zero');
  }

  console.log('\n🎉 ALL MULTI-YEAR DATA MIGRATION TESTS PASSED (100% SUCCESS)!');
}

runMigrationTests().catch((err) => {
  console.error('❌ Migration test failed:', err);
  process.exit(1);
});
