import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/app-error';
import { AuditService } from '../../audit/services/audit.service';

export class CostCenterService {
  public static async listCategories(tenantId: string) {
    let list = await prisma.costCategory.findMany({ where: { tenantId } });
    if (list.length === 0) {
      await prisma.costCategory.createMany({
        data: [
          { tenantId, code: 'DEPT', name: 'Department' },
          { tenantId, code: 'PROJ', name: 'Project & Client Contracts' },
          { tenantId, code: 'GEO', name: 'Geographical Branches' },
        ],
        skipDuplicates: true,
      });
      list = await prisma.costCategory.findMany({ where: { tenantId } });
    }
    return list;
  }

  public static async createCategory(tenantId: string, payload: any) {
    return await prisma.costCategory.create({
      data: {
        tenantId,
        code: payload.code,
        name: payload.name,
      }
    });
  }

  public static async listCostCenters(tenantId: string, categoryId?: string) {
    await this.listCategories(tenantId);
    let centers = await prisma.costCenter.findMany({ where: { tenantId } });
    if (centers.length === 0) {
      await prisma.costCenter.createMany({
        data: [
          { tenantId, code: 'DEPT-MKTG', name: 'Marketing & Growth', category: 'Department', isActive: true },
          { tenantId, code: 'DEPT-ENG', name: 'Engineering & Product', category: 'Department', isActive: true },
          { tenantId, code: 'DEPT-ADMIN', name: 'Administration & HR', category: 'Department', isActive: true },
          { tenantId, code: 'PROJ-RADAR-01', name: 'Defence Radar Flange Assembly', category: 'Project & Client Contracts', isActive: true },
          { tenantId, code: 'PROJ-TURB-09', name: 'Heavy Alloy Turbine Components', category: 'Project & Client Contracts', isActive: true },
          { tenantId, code: 'GEO-PUNE', name: 'Pune Central Plant', category: 'Geographical Branches', isActive: true },
          { tenantId, code: 'GEO-CHAKAN', name: 'Chakan Export Facility', category: 'Geographical Branches', isActive: true },
        ],
        skipDuplicates: true,
      });
      centers = await prisma.costCenter.findMany({ where: { tenantId } });
    }
    let mapped = centers.map(c => ({
      ...c,
      categoryId: c.category,
      categoryName: c.category,
      annualBudget: 2500000
    }));
    if (categoryId) {
      mapped = mapped.filter(c => c.categoryId === categoryId || c.category === categoryId);
    }
    return mapped;
  }

  public static async getCostCenter(tenantId: string, costCenterId: string) {
    const cc = await prisma.costCenter.findUnique({
      where: { id: costCenterId }
    });
    if (!cc || cc.tenantId !== tenantId) throw new AppError('Cost Center not found', 404);
    return {
      ...cc,
      categoryName: cc.category,
      annualBudget: 2500000
    };
  }

  public static async createCostCenter(payload: any) {
    // Try to get category name if categoryId was provided
    let categoryName = payload.categoryId; 
    if (payload.categoryId) {
        const cat = await prisma.costCategory.findUnique({ where: { id: payload.categoryId } });
        if (cat) categoryName = cat.name;
    }

    const created = await prisma.costCenter.create({
      data: {
        tenantId: payload.tenantId,
        code: payload.code,
        name: payload.name,
        category: categoryName,
        isActive: true,
      }
    });
    return { ...created, categoryName: created.category, annualBudget: payload.annualBudget || 0 };
  }

  public static async recordAllocations(
    tenantId: string,
    lines: Array<{
      voucherId: string;
      voucherNumber: string;
      date: string;
      ledgerName: string;
      costCenterId: string;
      type: 'EXPENSE' | 'REVENUE';
      amount: number;
    }>
  ) {
    const created = [];
    for (const line of lines) {
      // Find ledger by name to get its id
      let ledger = await prisma.ledger.findFirst({
        where: { tenantId, name: line.ledgerName }
      });
      if (!ledger) {
         ledger = await prisma.ledger.findFirst({ where: { tenantId }});
      }
      if (!ledger) continue;

      const cc = await prisma.costCenter.findUnique({
        where: { id: line.costCenterId }
      });
      if (!cc) continue;

      const alloc = await prisma.costAllocationRecord.create({
        data: {
          tenantId,
          voucherId: line.voucherId,
          ledgerId: ledger.id,
          costCenterId: cc.id,
          percentage: 100,
          amount: line.amount,
        }
      });

      created.push({
        id: alloc.id,
        tenantId,
        voucherId: line.voucherId,
        voucherNumber: line.voucherNumber,
        date: line.date,
        ledgerName: line.ledgerName,
        costCenterId: cc.id,
        costCenterName: cc.name,
        categoryName: cc.category,
        type: line.type,
        amount: Number(alloc.amount)
      });
    }
    return created;
  }

  public static async getCostCenterBreakupReport(tenantId: string, categoryId?: string) {
    await this.listCostCenters(tenantId);
    let catWhere: any = { tenantId };
    if (categoryId) catWhere.id = categoryId;
    
    const categories = await prisma.costCategory.findMany({ where: catWhere });
    const centers = await prisma.costCenter.findMany({ where: { tenantId } });
    const allocations = await prisma.costAllocationRecord.findMany({
      where: { tenantId }
    });
    
    // Manual mapping to avoid relations that aren't defined
    const ledgers = await prisma.ledger.findMany({ where: { tenantId } });
    const ledgerMap = new Map(ledgers.map(l => [l.id, l]));

    const report = categories.map((cat: any) => {
      const catCenters = centers.filter((cc: any) => cc.category === cat.name);

      const centerSummaries = catCenters.map((cc: any) => {
        const ccAllocations = allocations.filter((a: any) => a.costCenterId === cc.id);
        
        let totalRevenue = 0;
        let totalExpense = 0;
        
        const mappedTransactions = ccAllocations.map((a: any) => {
           const ledger = ledgerMap.get(a.ledgerId);
           const type = ledger?.name.toLowerCase().includes('revenue') || ledger?.name.toLowerCase().includes('sales') ? 'REVENUE' : 'EXPENSE';
           if (type === 'REVENUE') totalRevenue += Number(a.amount);
           else totalExpense += Number(a.amount);
           
           return {
              id: a.id,
              tenantId: a.tenantId,
              voucherId: a.voucherId,
              voucherNumber: 'VCH-XX',
              date: a.createdAt.toISOString(),
              ledgerName: ledger?.name || 'Unknown Ledger',
              costCenterId: cc.id,
              type,
              amount: Number(a.amount)
           };
        });

        return {
          costCenterId: cc.id,
          costCenterCode: cc.code,
          costCenterName: cc.name,
          annualBudget: 0,
          totalRevenue,
          totalExpense,
          netContribution: totalRevenue - totalExpense,
          transactions: mappedTransactions
        };
      });

      const catRev = centerSummaries.reduce((sum, c) => sum + c.totalRevenue, 0);
      const catExp = centerSummaries.reduce((sum, c) => sum + c.totalExpense, 0);

      return {
        categoryId: cat.id,
        categoryCode: cat.code,
        categoryName: cat.name,
        categoryDescription: cat.description,
        totalRevenue: catRev,
        totalExpense: catExp,
        netContribution: catRev - catExp,
        costCenters: centerSummaries
      };
    });

    return report;
  }
}
