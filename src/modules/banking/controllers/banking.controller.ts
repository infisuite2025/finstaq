import { FastifyRequest, FastifyReply } from 'fastify';
import { bankingService, BankStatementItem, ReconcileTransactionInput } from '../services/banking.service';

export class BankingController {
  async getBankLedgers(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const ledgers = await bankingService.getBankLedgers(tenantId);
    return reply.send({ success: true, data: ledgers });
  }

  async createBankLedger(req: FastifyRequest<{
    Body: {
      name: string;
      bankName: string;
      bankAccount: string;
      ifscCode: string;
      branch?: string;
      accountType?: string;
      openingBalance?: number;
    }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const result = await bankingService.createBankLedger(tenantId, req.body);
    return reply.send(result);
  }

  async linkBank(req: FastifyRequest<{
    Body: {
      ledgerId: string;
      provider: string;
      credentials?: any;
      syncFrequency?: string;
    }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const result = await bankingService.linkBankFeed(tenantId, req.body);
    return reply.send(result);
  }

  async syncFeed(req: FastifyRequest<{
    Body: { ledgerId: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId } = req.body;
    if (!ledgerId) return reply.status(400).send({ error: 'ledgerId is required' });
    const result = await bankingService.syncBankFeed(tenantId, ledgerId);
    return reply.send(result);
  }

  async getBankTransactions(req: FastifyRequest<{
    Querystring: { ledgerId?: string; startDate?: string; endDate?: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId, startDate, endDate } = req.query;

    let targetLedgerId: string = ledgerId || '';
    if (!targetLedgerId) {
      const ledgers = await bankingService.getBankLedgers(tenantId);
      targetLedgerId = ledgers[0]?.id || 'ldg_hdfc_01';
    }

    const transactions = await bankingService.getBankTransactions(tenantId, targetLedgerId, startDate, endDate);
    return reply.send({ success: true, data: transactions });
  }

  async uploadStatement(req: FastifyRequest<{
    Body: { ledgerId: string; statement: BankStatementItem[]; fileName?: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId, statement, fileName } = req.body;

    if (!ledgerId || !Array.isArray(statement)) {
      return reply.status(400).send({ error: 'ledgerId and statement array are required' });
    }

    const result = await bankingService.uploadBankStatement(tenantId, ledgerId, statement, fileName);
    return reply.send(result);
  }

  async getStoredStatement(req: FastifyRequest<{
    Querystring: { ledgerId?: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId } = req.query;

    let targetLedgerId: string = ledgerId || '';
    if (!targetLedgerId) {
      const ledgers = await bankingService.getBankLedgers(tenantId);
      targetLedgerId = ledgers[0]?.id || 'ldg_hdfc_01';
    }

    const data = await bankingService.getStoredStatement(tenantId, targetLedgerId);
    return reply.send({ success: true, data });
  }

  async getStatementBatches(req: FastifyRequest<{
    Querystring: { ledgerId?: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId } = req.query;
    let targetLedgerId: string = ledgerId || 'ldg_hdfc_01';
    const data = await bankingService.getStatementBatches(tenantId, targetLedgerId);
    return reply.send({ success: true, data });
  }

  async autoReconcile(req: FastifyRequest<{
    Body: { ledgerId: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId } = req.body;

    if (!ledgerId) {
      return reply.status(400).send({ error: 'ledgerId is required' });
    }

    const result = await bankingService.autoReconcile(tenantId, ledgerId);
    return reply.send(result);
  }

  async manualReconcile(req: FastifyRequest<{
    Body: ReconcileTransactionInput
  }>, reply: FastifyReply) {
    const result = await bankingService.manualReconcile(req.body);
    return reply.send(result);
  }

  async getBrsReport(req: FastifyRequest<{
    Querystring: { ledgerId?: string; asOfDate?: string; statementBalance?: string }
  }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string || 'tenant-default-01';
    const { ledgerId, asOfDate, statementBalance } = req.query;

    let targetLedgerId: string = ledgerId || '';
    if (!targetLedgerId) {
      const ledgers = await bankingService.getBankLedgers(tenantId);
      targetLedgerId = ledgers[0]?.id || 'ldg_hdfc_01';
    }
    const targetAsOfDate = asOfDate || new Date().toISOString().split('T')[0];

    const stmtBal = statementBalance ? parseFloat(statementBalance) : undefined;
    const report = await bankingService.generateBrsReport(tenantId, targetLedgerId, targetAsOfDate, stmtBal);
    return reply.send({ success: true, data: report });
  }
}

export const bankingController = new BankingController();
