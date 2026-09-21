import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function seed() {
  console.log('🚀 Starting Enterprise MySQL Database Seeding...');
  const tenantId = 'tenant-default-01';

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: 'Acme Heavy Engineering Corp',
      gstIn: '27AABCF1234F1Z5',
      taxId: 'AAACF1234F',
      currency: 'INR',
    },
  });
  console.log('✓ Tenant created:', tenant.name);

  // 2. Users
  const passwordHash = await argon2.hash('Admin@12345');
  const users = [
    { id: 'usr-owner-01', email: 'owner@finstaq.io', role: 'OWNER' as const, firstName: 'Vikram', lastName: 'Singhania' },
    { id: 'usr-acc-01', email: 'accountant@finstaq.io', role: 'ACCOUNTANT' as const, firstName: 'Priya', lastName: 'Patel' },
    { id: 'usr-data-01', email: 'dataentry@finstaq.io', role: 'DATA_ENTRY' as const, firstName: 'Rohan', lastName: 'Joshi' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { tenant_user_email_unique: { tenantId, email: u.email } },
      update: { passwordHash, role: u.role, firstName: u.firstName, lastName: u.lastName },
      create: {
        id: u.id,
        tenantId,
        email: u.email,
        passwordHash,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    });
  }
  console.log('✓ 3 Users seeded');

  // 3. Ledger Groups (28 Schedule III groups)
  const groups = [
    { id: 'grp-ca', name: 'Current Assets', nature: 'ASSET' as const },
    { id: 'grp-bank', name: 'Bank Accounts', nature: 'ASSET' as const, parentId: 'grp-ca' },
    { id: 'grp-cash', name: 'Cash-in-hand', nature: 'ASSET' as const, parentId: 'grp-ca' },
    { id: 'grp-debtors', name: 'Sundry Debtors', nature: 'ASSET' as const, parentId: 'grp-ca' },
    { id: 'grp-stock', name: 'Stock-in-hand', nature: 'ASSET' as const, parentId: 'grp-ca' },
    { id: 'grp-loans-adv', name: 'Loans & Advances (Asset)', nature: 'ASSET' as const, parentId: 'grp-ca' },
    { id: 'grp-fa', name: 'Fixed Assets', nature: 'ASSET' as const },
    { id: 'grp-cl', name: 'Current Liabilities', nature: 'LIABILITY' as const },
    { id: 'grp-creditors', name: 'Sundry Creditors', nature: 'LIABILITY' as const, parentId: 'grp-cl' },
    { id: 'grp-duties', name: 'Duties & Taxes', nature: 'LIABILITY' as const, parentId: 'grp-cl' },
    { id: 'grp-provisions', name: 'Provisions', nature: 'LIABILITY' as const, parentId: 'grp-cl' },
    { id: 'grp-capital', name: 'Capital Account', nature: 'EQUITY' as const },
    { id: 'grp-reserves', name: 'Reserves & Surplus', nature: 'EQUITY' as const },
    { id: 'grp-sales', name: 'Sales Accounts', nature: 'INCOME' as const, affectsGrossProfit: true },
    { id: 'grp-direct-inc', name: 'Direct Incomes', nature: 'INCOME' as const, affectsGrossProfit: true },
    { id: 'grp-indirect-inc', name: 'Indirect Incomes', nature: 'INCOME' as const },
    { id: 'grp-purchase', name: 'Purchase Accounts', nature: 'EXPENSE' as const, affectsGrossProfit: true },
    { id: 'grp-direct-exp', name: 'Direct Expenses', nature: 'EXPENSE' as const, affectsGrossProfit: true },
    { id: 'grp-indirect-exp', name: 'Indirect Expenses', nature: 'EXPENSE' as const },
  ];

  for (const g of groups) {
    await prisma.ledgerGroup.upsert({
      where: { tenant_ledger_group_name_unique: { tenantId, name: g.name } },
      update: { nature: g.nature, parentId: g.parentId || null, affectsGrossProfit: g.affectsGrossProfit || false },
      create: {
        id: g.id,
        tenantId,
        name: g.name,
        nature: g.nature,
        parentId: g.parentId || null,
        affectsGrossProfit: g.affectsGrossProfit || false,
        isSystem: true,
      },
    });
  }
  console.log('✓ 19 Ledger Groups seeded');

  // 4. Standard Ledgers
  const ledgers = [
    { id: 'led-hdfc', name: 'HDFC Bank - Current A/c 50200012345678', groupId: 'grp-bank', openingBalance: 4850000, currentBalance: 5230000, code: 'BANK-HDFC-01' },
    { id: 'led-sbi', name: 'SBI Cash Credit A/c 30987654321', groupId: 'grp-bank', openingBalance: 1200000, currentBalance: 1450000, code: 'BANK-SBI-01' },
    { id: 'led-cash', name: 'Cash in Hand (Main Vault)', groupId: 'grp-cash', openingBalance: 250000, currentBalance: 285000, code: 'CASH-01' },
    { id: 'led-petty', name: 'Petty Cash - Factory Office', groupId: 'grp-cash', openingBalance: 50000, currentBalance: 42000, code: 'CASH-PETTY' },
    { id: 'led-tata', name: 'Tata Motors Precision Division (Debtor)', groupId: 'grp-debtors', openingBalance: 2450000, currentBalance: 3250000, gstIn: '27AAACT2727Q1ZW', stateCode: '27', creditPeriodDays: 30, creditLimit: 5000000, code: 'CUST-TATA' },
    { id: 'led-reliance', name: 'Reliance Infrastructure Ltd (Debtor)', groupId: 'grp-debtors', openingBalance: 1850000, currentBalance: 2100000, gstIn: '27AAACR1234Q1Z1', stateCode: '27', creditPeriodDays: 45, creditLimit: 7500000, code: 'CUST-RIL' },
    { id: 'led-mahindra', name: 'Mahindra Defense Systems (Debtor)', groupId: 'grp-debtors', openingBalance: 980000, currentBalance: 1420000, gstIn: '27AAACM4321P1Z9', stateCode: '27', creditPeriodDays: 30, creditLimit: 3000000, code: 'CUST-MDS' },
    { id: 'led-bharat', name: 'Bharat Forgings & Alloys (Creditor)', groupId: 'grp-creditors', openingBalance: 1250000, currentBalance: 1680000, gstIn: '27AAACB5678R1Z2', stateCode: '27', creditPeriodDays: 30, code: 'VEND-BFA' },
    { id: 'led-jsw', name: 'JSW Steel Processing Unit (Creditor)', groupId: 'grp-creditors', openingBalance: 3200000, currentBalance: 2850000, gstIn: '27AAACJ8901S1Z4', stateCode: '27', creditPeriodDays: 45, code: 'VEND-JSW' },
    { id: 'led-skf', name: 'SKF India Precision Bearings (Creditor)', groupId: 'grp-creditors', openingBalance: 840000, currentBalance: 920000, gstIn: '27AAACS2345T1Z6', stateCode: '27', creditPeriodDays: 30, code: 'VEND-SKF' },
    { id: 'led-cgst-in', name: 'Input CGST @ 9%', groupId: 'grp-duties', openingBalance: 385000, currentBalance: 420000, code: 'TAX-CGST-IN' },
    { id: 'led-sgst-in', name: 'Input SGST @ 9%', groupId: 'grp-duties', openingBalance: 385000, currentBalance: 420000, code: 'TAX-SGST-IN' },
    { id: 'led-igst-in', name: 'Input IGST @ 18%', groupId: 'grp-duties', openingBalance: 540000, currentBalance: 610000, code: 'TAX-IGST-IN' },
    { id: 'led-cgst-out', name: 'Output CGST @ 9%', groupId: 'grp-duties', openingBalance: 520000, currentBalance: 590000, code: 'TAX-CGST-OUT' },
    { id: 'led-sgst-out', name: 'Output SGST @ 9%', groupId: 'grp-duties', openingBalance: 520000, currentBalance: 590000, code: 'TAX-SGST-OUT' },
    { id: 'led-igst-out', name: 'Output IGST @ 18%', groupId: 'grp-duties', openingBalance: 880000, currentBalance: 960000, code: 'TAX-IGST-OUT' },
    { id: 'led-tds-194c', name: 'TDS Payable u/s 194C (Contractors)', groupId: 'grp-duties', openingBalance: 45000, currentBalance: 52000, code: 'TAX-TDS-194C' },
    { id: 'led-tds-194j', name: 'TDS Payable u/s 194J (Professional)', groupId: 'grp-duties', openingBalance: 82000, currentBalance: 95000, code: 'TAX-TDS-194J' },
    { id: 'led-tds-194q', name: 'TDS Payable u/s 194Q (Goods)', groupId: 'grp-duties', openingBalance: 28000, currentBalance: 34000, code: 'TAX-TDS-194Q' },
    { id: 'led-sales-dom', name: 'Domestic Industrial Sales A/c', groupId: 'grp-sales', openingBalance: 0, currentBalance: 64500000, code: 'REV-SALES-DOM' },
    { id: 'led-sales-exp', name: 'Export Engineering Services A/c', groupId: 'grp-sales', openingBalance: 0, currentBalance: 20020000, code: 'REV-SALES-EXP' },
    { id: 'led-pur-raw', name: 'Raw Material Purchases A/c', groupId: 'grp-purchase', openingBalance: 0, currentBalance: 41200000, code: 'EXP-PUR-RAW' },
    { id: 'led-pur-spares', name: 'Machinery Spares & Consumables A/c', groupId: 'grp-purchase', openingBalance: 0, currentBalance: 6800000, code: 'EXP-PUR-SPARES' },
    { id: 'led-power', name: 'Factory Power & High Tension Electricity', groupId: 'grp-direct-exp', openingBalance: 0, currentBalance: 2450000, code: 'EXP-POWER' },
    { id: 'led-wages', name: 'Factory Direct Wages & Labour Charges', groupId: 'grp-direct-exp', openingBalance: 0, currentBalance: 3800000, code: 'EXP-WAGES' },
    { id: 'led-salaries', name: 'Office Staff Salaries & Allowances', groupId: 'grp-indirect-exp', openingBalance: 0, currentBalance: 7200000, code: 'EXP-SALARIES' },
    { id: 'led-rent', name: 'Office & Facility Rent Expense', groupId: 'grp-indirect-exp', openingBalance: 0, currentBalance: 2160000, code: 'EXP-RENT' },
    { id: 'led-deprec', name: 'Depreciation on Plant & Equipment', groupId: 'grp-indirect-exp', openingBalance: 0, currentBalance: 1850000, code: 'EXP-DEPREC' },
    { id: 'led-audit', name: 'Statutory Audit & Legal Fees', groupId: 'grp-indirect-exp', openingBalance: 0, currentBalance: 450000, code: 'EXP-AUDIT' },
    { id: 'led-equity', name: 'Equity Share Capital', groupId: 'grp-capital', openingBalance: 20000000, currentBalance: 20000000, code: 'CAP-EQUITY' },
    { id: 'led-reserves', name: 'General Reserves & Retained Earnings', groupId: 'grp-reserves', openingBalance: 14500000, currentBalance: 21250000, code: 'CAP-RESERVES' },
  ];

  for (const l of ledgers) {
    await prisma.ledger.upsert({
      where: { tenant_ledger_name_unique: { tenantId, name: l.name } },
      update: {
        groupId: l.groupId,
        openingBalance: l.openingBalance,
        currentBalance: l.currentBalance,
        code: l.code,
        gstIn: l.gstIn || null,
        stateCode: l.stateCode || null,
        creditPeriodDays: l.creditPeriodDays || 30,
        creditLimit: l.creditLimit || null,
      },
      create: {
        id: l.id,
        tenantId,
        groupId: l.groupId,
        name: l.name,
        code: l.code,
        openingBalance: l.openingBalance,
        currentBalance: l.currentBalance,
        gstIn: l.gstIn || null,
        stateCode: l.stateCode || null,
        creditPeriodDays: l.creditPeriodDays || 30,
        creditLimit: l.creditLimit || null,
        isActive: true,
      },
    });
  }
  console.log('✓ 31 Core Ledgers seeded');

  // 5. Dynamic Masters (Warehouses, UOMs, Categories, Tax Rates, Currencies, Payment Terms)
  const warehouses = [
    { id: 'wh-01', code: 'WH-PUNE-MAIN', name: 'Pune Central Godown (Main)', city: 'Pune', state: 'Maharashtra', isPrimary: true },
    { id: 'wh-02', code: 'WH-CHAKAN-RM', name: 'Chakan Raw Material Store', city: 'Chakan', state: 'Maharashtra', isPrimary: false },
    { id: 'wh-03', code: 'WH-BHOSARI-FG', name: 'Bhosari Finished Goods Store', city: 'Bhosari', state: 'Maharashtra', isPrimary: false },
  ];
  for (const w of warehouses) {
    await prisma.warehouse.upsert({
      where: { tenant_warehouse_code_unique: { tenantId, code: w.code } },
      update: { name: w.name, city: w.city, state: w.state, isPrimary: w.isPrimary },
      create: { id: w.id, tenantId, code: w.code, name: w.name, city: w.city, state: w.state, isPrimary: w.isPrimary },
    });
  }

  const uoms = [
    { id: 'uom-01', symbol: 'NOS', formalName: 'Numbers / Units', uqc: 'NOS', decimalPlaces: 0, isDefault: true },
    { id: 'uom-02', symbol: 'KGS', formalName: 'Kilograms', uqc: 'KGS', decimalPlaces: 2 },
    { id: 'uom-03', symbol: 'MT', formalName: 'Metric Tonnes', uqc: 'MTR', decimalPlaces: 3 },
    { id: 'uom-04', symbol: 'LTR', formalName: 'Litres', uqc: 'LTR', decimalPlaces: 2 },
    { id: 'uom-05', symbol: 'SET', formalName: 'Sets', uqc: 'SET', decimalPlaces: 0 },
  ];
  for (const u of uoms) {
    await prisma.unitOfMeasurement.upsert({
      where: { tenant_uom_symbol_unique: { tenantId, symbol: u.symbol } },
      update: { formalName: u.formalName, uqc: u.uqc, decimalPlaces: u.decimalPlaces, isDefault: u.isDefault || false },
      create: { id: u.id, tenantId, symbol: u.symbol, formalName: u.formalName, uqc: u.uqc, decimalPlaces: u.decimalPlaces, isDefault: u.isDefault || false },
    });
  }

  const categories = [
    { id: 'cat-01', code: 'CAT-RM', name: 'Raw Materials & Castings', defaultHsn: '7228', defaultTaxRate: 18.0 },
    { id: 'cat-02', code: 'CAT-FG', name: 'Finished Precision Components', defaultHsn: '8482', defaultTaxRate: 18.0 },
    { id: 'cat-03', code: 'CAT-SPARES', name: 'Machinery Spares & Consumables', defaultHsn: '8207', defaultTaxRate: 18.0 },
    { id: 'cat-04', code: 'CAT-LUBE', name: 'Industrial Oils & Lubricants', defaultHsn: '2710', defaultTaxRate: 18.0 },
  ];
  for (const c of categories) {
    await prisma.itemCategory.upsert({
      where: { tenant_item_category_name_unique: { tenantId, name: c.name } },
      update: { code: c.code, defaultHsn: c.defaultHsn, defaultTaxRate: c.defaultTaxRate },
      create: { id: c.id, tenantId, code: c.code, name: c.name, defaultHsn: c.defaultHsn, defaultTaxRate: c.defaultTaxRate },
    });
  }

  const inventoryItems = [
    { id: 'inv-01', sku: 'BRG-6205-ZZ', name: 'Deep Groove Ball Bearing 6205-ZZ', categoryId: 'cat-02', uomId: 'uom-01', warehouseId: 'wh-01', hsnCode: '84821011', taxRatePercent: 18.0, standardCost: 480, sellingPrice: 650, closingStockQty: 2500 },
    { id: 'inv-02', sku: 'STL-EN8-ROD', name: 'Alloy Steel Forging Rod Grade EN8D', categoryId: 'cat-01', uomId: 'uom-03', warehouseId: 'wh-02', hsnCode: '72283029', taxRatePercent: 18.0, standardCost: 50000, sellingPrice: 62000, closingStockQty: 40 },
    { id: 'inv-03', sku: 'CNC-TOOL-M12', name: 'Solid Carbide 4-Flute Endmill M12', categoryId: 'cat-03', uomId: 'uom-01', warehouseId: 'wh-01', hsnCode: '82075000', taxRatePercent: 18.0, standardCost: 1250, sellingPrice: 1600, closingStockQty: 150 },
    { id: 'inv-04', sku: 'OIL-HYD-68', name: 'Industrial Servo Hydraulic Oil 68', categoryId: 'cat-04', uomId: 'uom-04', warehouseId: 'wh-01', hsnCode: '27101981', taxRatePercent: 18.0, standardCost: 220, sellingPrice: 285, closingStockQty: 800 },
    { id: 'inv-05', sku: 'ALU-6061-T6', name: 'Aerospace Aluminium Billet 6061-T6', categoryId: 'cat-01', uomId: 'uom-02', warehouseId: 'wh-02', hsnCode: '76012010', taxRatePercent: 18.0, standardCost: 340, sellingPrice: 420, closingStockQty: 1200 },
  ];
  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { tenant_inventory_sku_unique: { tenantId, sku: item.sku } },
      update: { ...item },
      create: { ...item, tenantId },
    });
  }
  console.log('✓ Dynamic Masters & Inventory Items seeded');

  // 6. Cost Categories & Cost Centers
  const costCategories = [
    { id: 'ccat-01', code: 'DIV', name: 'Business Divisions' },
    { id: 'ccat-02', code: 'PLANT', name: 'Manufacturing Plants' },
    { id: 'ccat-03', code: 'PROJ', name: 'Client Engineering Projects' },
  ];
  for (const cc of costCategories) {
    await prisma.costCategory.upsert({
      where: { tenantId_code: { tenantId, code: cc.code } },
      update: { name: cc.name },
      create: { id: cc.id, tenantId, code: cc.code, name: cc.name },
    });
  }

  const costCenters = [
    { id: 'cc-01', code: 'CC-PUNE-PLANT', name: 'Pune Heavy Machinery Plant', category: 'Manufacturing Plants' },
    { id: 'cc-02', code: 'CC-CHAKAN-UNIT', name: 'Chakan Precision Auto Hub', category: 'Manufacturing Plants' },
    { id: 'cc-03', code: 'CC-RND-LAB', name: 'Advanced Metallurgy R&D Center', category: 'Business Divisions' },
    { id: 'cc-04', code: 'CC-PROJ-TATA-EV', name: 'Project Tata EV Drivetrain Frame', category: 'Client Engineering Projects' },
  ];
  for (const c of costCenters) {
    await prisma.costCenter.upsert({
      where: { tenant_cost_center_code_unique: { tenantId, code: c.code } },
      update: { name: c.name, category: c.category },
      create: { id: c.id, tenantId, code: c.code, name: c.name, category: c.category },
    });
  }
  console.log('✓ Cost Centers seeded');

  // 7. Employees & Payroll
  const employees = [
    { id: 'emp-001', empCode: 'EMP-001', firstName: 'Rajesh', lastName: 'Sharma', department: 'Finance & Accounts', designation: 'Chief Financial Officer', annualCtc: 3600000, monthlyCtc: 300000, basicSalary: 120000, hra: 60000, specialAllowance: 120000, dateOfJoining: new Date('2021-04-01'), bankName: 'HDFC Bank', bankAccount: '50100456789123', bankIfsc: 'HDFC0000123' },
    { id: 'emp-002', empCode: 'EMP-002', firstName: 'Priya', lastName: 'Patel', department: 'Finance & Accounts', designation: 'Lead Accounting Manager', annualCtc: 1800000, monthlyCtc: 150000, basicSalary: 60000, hra: 30000, specialAllowance: 60000, dateOfJoining: new Date('2022-06-15'), bankName: 'ICICI Bank', bankAccount: '001201567890', bankIfsc: 'ICIC0000012' },
    { id: 'emp-003', empCode: 'EMP-003', firstName: 'Amit', lastName: 'Verma', department: 'Procurement & Stores', designation: 'Senior Purchase Officer', annualCtc: 1200000, monthlyCtc: 100000, basicSalary: 40000, hra: 20000, specialAllowance: 40000, dateOfJoining: new Date('2023-01-10'), bankName: 'SBI', bankAccount: '309876543210', bankIfsc: 'SBIN0001234' },
    { id: 'emp-004', empCode: 'EMP-004', firstName: 'Sneha', lastName: 'Kulkarni', department: 'Quality Assurance', designation: 'Lead QC Specialist', annualCtc: 960000, monthlyCtc: 80000, basicSalary: 32000, hra: 16000, specialAllowance: 32000, dateOfJoining: new Date('2023-08-01'), bankName: 'Kotak Bank', bankAccount: '4567891234', bankIfsc: 'KKBK0000567' },
    { id: 'emp-005', empCode: 'EMP-005', firstName: 'Vikram', lastName: 'Deshmukh', department: 'Plant Operations', designation: 'Production Supervisor', annualCtc: 720000, monthlyCtc: 60000, basicSalary: 24000, hra: 12000, specialAllowance: 24000, dateOfJoining: new Date('2024-02-15'), bankName: 'Axis Bank', bankAccount: '912345678901', bankIfsc: 'UTIB0000234' },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { tenantId_empCode: { tenantId, empCode: emp.empCode } },
      update: { ...emp },
      create: { ...emp, tenantId },
    });
  }

  // Monthly Payroll Run (August 2026)
  await prisma.payrollRun.upsert({
    where: { tenantId_month_year: { tenantId, month: 8, year: 2026 } },
    update: {},
    create: {
      id: 'prun-2026-08',
      tenantId,
      payrollMonth: 'August 2026',
      month: 8,
      year: 2026,
      status: 'PROCESSED',
      totalEmployees: 5,
      totalGrossPay: 690000,
      totalDeductions: 86500,
      totalNetPay: 603500,
      totalPfLiability: 45000,
      totalEsicLiability: 0,
      totalPtLiability: 1000,
      totalTdsLiability: 40500,
      voucherNumber: 'PAYROLL-JV-2026-08',
    },
  });
  console.log('✓ Employees & Payroll Runs seeded');

  // 8. Cheque Books & Leaves
  const chequeBook = await prisma.chequeBook.upsert({
    where: { tenantId_bankLedgerId_bookNumber: { tenantId, bankLedgerId: 'led-hdfc', bookNumber: 'HDFC-CHQ-2026-01' } },
    update: {},
    create: {
      id: 'chqbk-01',
      tenantId,
      bankLedgerId: 'led-hdfc',
      bookNumber: 'HDFC-CHQ-2026-01',
      startLeafNo: 100001,
      endLeafNo: 100050,
      totalLeaves: 50,
      leavesIssued: 5,
      leavesCleared: 3,
      status: 'ACTIVE',
    },
  });

  const leaves = [
    { leafNumber: '100001', status: 'CLEARED', payeeName: 'Bharat Forgings & Alloys', amount: 350000, issueDate: new Date('2026-09-01'), clearingDate: new Date('2026-09-03') },
    { leafNumber: '100002', status: 'CLEARED', payeeName: 'JSW Steel Processing Unit', amount: 620000, issueDate: new Date('2026-09-02'), clearingDate: new Date('2026-09-05') },
    { leafNumber: '100003', status: 'CLEARED', payeeName: 'SKF India Precision Bearings', amount: 180000, issueDate: new Date('2026-09-05'), clearingDate: new Date('2026-09-08') },
    { leafNumber: '100004', status: 'ISSUED', payeeName: 'Industrial Servo Lubricants', amount: 85000, issueDate: new Date('2026-09-12') },
    { leafNumber: '100005', status: 'ISSUED', payeeName: 'Maharashtra State Electricity Dist.', amount: 245000, issueDate: new Date('2026-09-14') },
  ];

  for (const lf of leaves) {
    await prisma.chequeLeaf.upsert({
      where: { tenantId_chequeBookId_leafNumber: { tenantId, chequeBookId: chequeBook.id, leafNumber: lf.leafNumber } },
      update: { ...lf },
      create: {
        id: 'leaf-' + lf.leafNumber,
        tenantId,
        chequeBookId: chequeBook.id,
        leafNumber: lf.leafNumber,
        status: lf.status,
        payeeName: lf.payeeName,
        amount: lf.amount,
        issueDate: lf.issueDate,
        clearingDate: lf.clearingDate || null,
      },
    });
  }
  console.log('✓ Cheque Books & Leaves seeded');

  // 9. UPI Transactions & VPA Directory
  const vpas = [
    { id: 'vpa-01', partyName: 'Tata Motors Precision Division', vpaAddress: 'tatamotors.precision@hdfcbank', partyType: 'CUSTOMER' },
    { id: 'vpa-02', partyName: 'Reliance Infrastructure Ltd', vpaAddress: 'reliance.infra@icici', partyType: 'CUSTOMER' },
    { id: 'vpa-03', partyName: 'Bharat Forgings & Alloys', vpaAddress: 'bharatforgings@sbi', partyType: 'VENDOR' },
    { id: 'vpa-04', partyName: 'Acme Heavy Engineering Corp', vpaAddress: 'acmeheavy@okhdfcbank', partyType: 'SELF' },
  ];
  for (const v of vpas) {
    await prisma.vpaDirectoryItem.upsert({
      where: { tenantId_vpaAddress: { tenantId, vpaAddress: v.vpaAddress } },
      update: { partyName: v.partyName, partyType: v.partyType },
      create: { id: v.id, tenantId, partyName: v.partyName, vpaAddress: v.vpaAddress, partyType: v.partyType, isVerified: true },
    });
  }

  const upiTxns = [
    { id: 'upi-01', txnRefNumber: 'UPI-20260914-0891', direction: 'COLLECT', payerVpa: 'tatamotors.precision@hdfcbank', payeeVpa: 'acmeheavy@okhdfcbank', amount: 150000, status: 'SUCCESS', npciRrn: '425819003891', settledAt: new Date('2026-09-14T10:15:00Z') },
    { id: 'upi-02', txnRefNumber: 'UPI-20260914-0892', direction: 'COLLECT', payerVpa: 'reliance.infra@icici', payeeVpa: 'acmeheavy@okhdfcbank', amount: 285000, status: 'SUCCESS', npciRrn: '425819004122', settledAt: new Date('2026-09-14T11:30:00Z') },
    { id: 'upi-03', txnRefNumber: 'UPI-20260915-0901', direction: 'PAYOUT', payerVpa: 'acmeheavy@okhdfcbank', payeeVpa: 'bharatforgings@sbi', amount: 75000, status: 'SUCCESS', npciRrn: '425910001289', settledAt: new Date('2026-09-15T09:45:00Z') },
  ];
  for (const ut of upiTxns) {
    await prisma.upiTransaction.upsert({
      where: { tenantId_txnRefNumber: { tenantId, txnRefNumber: ut.txnRefNumber } },
      update: { ...ut },
      create: { ...ut, tenantId },
    });
  }
  console.log('✓ UPI Directory & Transactions seeded');

  // 10. Post-Dated Cheques (PDC)
  const pdcs = [
    { id: 'pdc-01', pdcType: 'RECEIVED', partyLedgerId: 'led-tata', bankLedgerId: 'led-hdfc', chequeNumber: '458901', chequeDate: new Date('2026-09-30'), amount: 750000, draweeBank: 'State Bank of India', status: 'HELD', remarks: 'Q2 Milestone Payment Security Cheque' },
    { id: 'pdc-02', pdcType: 'RECEIVED', partyLedgerId: 'led-reliance', bankLedgerId: 'led-hdfc', chequeNumber: '891234', chequeDate: new Date('2026-10-15'), amount: 1200000, draweeBank: 'HDFC Bank Ltd', status: 'HELD', remarks: 'Supply contract advance post-dated leaf' },
    { id: 'pdc-03', pdcType: 'ISSUED', partyLedgerId: 'led-bharat', bankLedgerId: 'led-hdfc', chequeNumber: '100006', chequeDate: new Date('2026-09-28'), amount: 450000, draweeBank: 'HDFC Bank - Current A/c', status: 'HELD', remarks: 'Bulk alloy forging dispatch settlement PDC' },
  ];
  for (const p of pdcs) {
    await prisma.postDatedCheque.upsert({
      where: { tenantId_chequeNumber_draweeBank: { tenantId, chequeNumber: p.chequeNumber, draweeBank: p.draweeBank } },
      update: { ...p },
      create: { ...p, tenantId },
    });
  }
  console.log('✓ Post-Dated Cheques (PDC) seeded');

  // 11. Financial Year Master & Accounting Periods
  await prisma.financialYearMaster.upsert({
    where: { tenantId_yearCode: { tenantId, yearCode: '2026-27' } },
    update: { isCurrent: true, status: 'OPEN' },
    create: {
      id: 'fy-2026-27',
      tenantId,
      yearCode: '2026-27',
      yearName: 'Financial Year 2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
      isClosed: false,
      status: 'OPEN',
    },
  });

  await prisma.periodLockMatrix.upsert({
    where: { tenantId },
    update: { hardFreezeDate: new Date('2026-03-31'), isLockEnabled: true, backdatingGraceDays: 7 },
    create: {
      id: 'plock-01',
      tenantId,
      isLockEnabled: true,
      hardFreezeDate: new Date('2026-03-31'),
      backdatingGraceDays: 7,
      allowFuturePostingDays: 0,
    },
  });
  console.log('✓ Financial Year & Period Lock Matrix seeded');

  // 12. Double-Entry Vouchers
  const vouchers = [
    {
      id: 'vch-pur-01',
      type: 'PURCHASE' as const,
      voucherNumber: 'PUR-2026-0081',
      date: new Date('2026-09-12'),
      narration: 'Purchase of Alloy Steel Forging Rods from Bharat Forgings against PO-2026-0891 and GRN-2026-0411',
      isSystemGenerated: true,
      sourceModule: 'PURCHASE_BILL',
      createdBy: 'usr-acc-01',
      items: [
        { ledgerId: 'led-pur-raw', debitAmount: 150000, creditAmount: 0 },
        { ledgerId: 'led-cgst-in', debitAmount: 13500, creditAmount: 0 },
        { ledgerId: 'led-sgst-in', debitAmount: 13500, creditAmount: 0 },
        { ledgerId: 'led-bharat', debitAmount: 0, creditAmount: 177000, billReferenceType: 'NEW_REF' as const, referenceNumber: 'BFA-INV-9981' },
      ],
    },
    {
      id: 'vch-sal-01',
      type: 'SALES' as const,
      voucherNumber: 'INV-2026-0081',
      date: new Date('2026-09-13'),
      narration: 'Tax Invoice for Deep Groove Bearings dispatch to Tata Motors against SO-2026-1045 and DC-2026-0312',
      isSystemGenerated: true,
      sourceModule: 'SALES_INVOICE',
      createdBy: 'usr-acc-01',
      items: [
        { ledgerId: 'led-tata', debitAmount: 100300, creditAmount: 0, billReferenceType: 'NEW_REF' as const, referenceNumber: 'INV-2026-0081' },
        { ledgerId: 'led-sales-dom', debitAmount: 0, creditAmount: 85000 },
        { ledgerId: 'led-cgst-out', debitAmount: 0, creditAmount: 7650 },
        { ledgerId: 'led-sgst-out', debitAmount: 0, creditAmount: 7650 },
      ],
    },
    {
      id: 'vch-rct-01',
      type: 'RECEIPT' as const,
      voucherNumber: 'RCT-2026-0042',
      date: new Date('2026-09-14'),
      narration: 'NEFT customer settlement received from Reliance Infrastructure against outstanding Bill REL-INV-4412',
      isSystemGenerated: false,
      createdBy: 'usr-acc-01',
      items: [
        { ledgerId: 'led-hdfc', debitAmount: 285000, creditAmount: 0 },
        { ledgerId: 'led-reliance', debitAmount: 0, creditAmount: 285000, billReferenceType: 'AGST_REF' as const, referenceNumber: 'REL-INV-4412' },
      ],
    },
    {
      id: 'vch-pmt-01',
      type: 'PAYMENT' as const,
      voucherNumber: 'PMT-2026-0038',
      date: new Date('2026-09-14'),
      narration: 'RTGS Supplier payment to JSW Steel Processing Unit with TDS u/s 194Q deduction',
      isSystemGenerated: false,
      createdBy: 'usr-acc-01',
      items: [
        { ledgerId: 'led-jsw', debitAmount: 350000, creditAmount: 0, billReferenceType: 'AGST_REF' as const, referenceNumber: 'JSW-BILL-8821' },
        { ledgerId: 'led-tds-194q', debitAmount: 0, creditAmount: 350 },
        { ledgerId: 'led-hdfc', debitAmount: 0, creditAmount: 349650 },
      ],
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { tenant_voucher_number_unique: { tenantId, type: v.type, voucherNumber: v.voucherNumber } },
      update: { narration: v.narration, date: v.date },
      create: {
        id: v.id,
        tenantId,
        type: v.type,
        voucherNumber: v.voucherNumber,
        date: v.date,
        narration: v.narration,
        isSystemGenerated: v.isSystemGenerated,
        sourceModule: v.sourceModule || null,
        createdBy: v.createdBy,
        items: {
          create: v.items.map((item, idx) => ({
            id: v.id + '-item-' + (idx + 1),
            ledgerId: item.ledgerId,
            debitAmount: item.debitAmount,
            creditAmount: item.creditAmount,
            billReferenceType: item.billReferenceType || null,
            referenceNumber: item.referenceNumber || null,
          })),
        },
      },
    });
  }
  console.log('✓ Double-Entry Vouchers & Balanced Items seeded');

  // 13. Maker-Checker Rules & Approvals
  await prisma.makerCheckerRule.upsert({
    where: { tenantId_ruleName: { tenantId, ruleName: 'High Value Payments > 50K' } },
    update: {},
    create: {
      id: 'rule-01',
      tenantId,
      ruleName: 'High Value Payments > 50K',
      voucherType: 'PAYMENT',
      minThresholdAmount: 50000,
      approverRole: 'OWNER',
      isActive: true,
    },
  });

  // 14. Super Admin Accounts & Help Genie CMS
  await prisma.tenantAccount.upsert({
    where: { subdomain: 'acme' },
    update: {},
    create: {
      id: tenantId,
      tenantName: 'Acme Heavy Engineering Corp',
      subdomain: 'acme',
      contactEmail: 'admin@acmeheavy.com',
      contactPhone: '+91 98230 12345',
      tierPlan: 'ENTERPRISE',
      status: 'ACTIVE',
      mrrAmount: 25000,
      usersCount: 15,
      dbSizeMb: 42.8,
    },
  });

  console.log('\n🎉 ALL ENTERPRISE TABLES & SEED DATA STORED IN MYSQL DATABASE (localhost:3306/finstaq_db)!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
