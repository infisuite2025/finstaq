import { FastifyReply, FastifyRequest } from 'fastify';
import { MigrationParserService } from '../services/migration-parser.service';
import { MigrationEngineService } from '../services/migration-engine.service';
import { MultiYearScopeConfig, SourceSystemType } from '../types/migration.types';

export class MigrationController {
  public static async uploadAndParse(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
    const body = (request.body || {}) as {
      sourceSystem?: SourceSystemType;
      historicalYearsCount?: 1 | 2 | 3 | 4 | 5;
    };

    const sourceSystem: SourceSystemType = body.sourceSystem || 'TALLY_PRIME';
    const yearsCount = body.historicalYearsCount || 3;
    const jobId = `job-mig-${Date.now()}`;

    const scope: MultiYearScopeConfig = {
      sourceSystem,
      historicalYearsCount: yearsCount,
      startFiscalYear: yearsCount === 3 ? 'FY 2023-24' : 'FY 2024-25',
      activeFiscalYear: 'FY 2026-27',
      closedYears: yearsCount === 3 ? ['FY 2023-24', 'FY 2024-25', 'FY 2025-26'] : ['FY 2024-25', 'FY 2025-26'],
      preserveBillWisePending: true,
      enableAutoClosingRoll: true,
      strictDoubleEntrySanity: true,
    };

    const dataset = MigrationParserService.parseDataset(jobId, tenantId, sourceSystem, scope);
    await MigrationEngineService.saveJob(dataset);

    const sanityReport = MigrationEngineService.validateDataset(dataset);

    return reply.status(200).send({
      success: true,
      data: {
        dataset,
        sanityReport,
      },
    });
  }

  public static async validate(request: FastifyRequest, reply: FastifyReply) {
    const { jobId } = (request.body || {}) as { jobId: string };
    const dataset = await MigrationEngineService.getJob(jobId);
    if (!dataset) {
      return reply.status(404).send({ success: false, message: 'Migration job not found' });
    }

    const report = MigrationEngineService.validateDataset(dataset);
    return reply.status(200).send({ success: true, data: report });
  }

  public static async execute(request: FastifyRequest, reply: FastifyReply) {
    const { jobId } = (request.body || {}) as { jobId: string };
    try {
      const result = await MigrationEngineService.executeMigration(jobId);
      return reply.status(200).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, message: err.message });
    }
  }

  public static async downloadTemplate(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      data: {
        templateUrl: '/downloads/finstaq_universal_migration_template.xlsx',
        formatVersion: 'v2026.4',
        sheets: [
          '1_Chart_of_Accounts',
          '2_Customer_Vendor_Masters',
          '3_Item_Inventory_Masters',
          '4_Opening_Balances',
          '5_Historical_Vouchers',
          '6_Open_Pending_Bills',
        ],
      },
    });
  }
}
