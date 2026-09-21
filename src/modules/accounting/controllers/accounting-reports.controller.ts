import { FastifyRequest, FastifyReply } from 'fastify';
import { AccountingReportsService } from '../services/accounting-reports.service';

export class AccountingReportsController {
  getBalanceSheet = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await AccountingReportsService.getBalanceSheet(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Balance Sheet' });
    }
  };

  getProfitAndLoss = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await AccountingReportsService.getProfitAndLoss(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Profit & Loss Statement' });
    }
  };

  getTrialBalance = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await AccountingReportsService.getTrialBalance(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Trial Balance' });
    }
  };

  getCashFlow = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await AccountingReportsService.getCashFlow(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Cash Flow Statement' });
    }
  };

  getLedgerStatement = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await AccountingReportsService.getLedgerStatement(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch General Ledger Statement' });
    }
  };

  getBankReconciliation = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await AccountingReportsService.getBankReconciliation(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Bank Reconciliation Statement' });
    }
  };

  getRatioAnalysis = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await AccountingReportsService.getRatioAnalysis(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Financial Ratio Analysis' });
    }
  };

  getGroupSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await AccountingReportsService.getGroupSummary(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Group Summary' });
    }
  };

  getGstComputation = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await AccountingReportsService.getGstComputation(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch GST Computation' });
    }
  };
}
