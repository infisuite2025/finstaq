import { FastifyReply, FastifyRequest } from 'fastify';
import { FinancialYearService } from '../services/financial-year.service';
import { PostingControlService } from '../services/posting-control.service';
import { MonthEndClosingService } from '../services/month-end-closing.service';
import { YearEndClosingService } from '../services/year-end-closing.service';

export class PeriodClosingController {
  // Financial Years
  public static async getFinancialYears(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const list = await FinancialYearService.getFinancialYears(tenantId);
    return reply.send({ success: true, data: list });
  }

  public static async createFinancialYear(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const fy = await FinancialYearService.createFinancialYear({
      tenantId,
      code: body.code,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      retainedEarningsLedgerId: body.retainedEarningsLedgerId,
      retainedEarningsLedgerName: body.retainedEarningsLedgerName,
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
    });
    return reply.send({ success: true, message: `Financial Year ${fy.code} created`, data: fy });
  }

  public static async updateFinancialYearStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const updated = await FinancialYearService.updateFinancialYearStatus({
      tenantId,
      financialYearId: id,
      status: body.status,
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
      userRole: body.userRole || 'OWNER',
      remarks: body.remarks,
    });
    return reply.send({ success: true, message: `FY ${updated.code} status updated to ${updated.status}`, data: updated });
  }

  // Accounting Periods
  public static async getPeriods(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const fyId = (request.query as any)?.financialYearId;
    const periods = await FinancialYearService.getPeriods(tenantId, fyId);
    return reply.send({ success: true, data: periods });
  }

  // Centralized Posting Control Gatekeeper API
  public static async validatePosting(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const result = PostingControlService.validatePosting({
      tenantId,
      transactionDate: body.transactionDate || new Date().toISOString().split('T')[0],
      userRole: body.userRole || 'DATA_ENTRY',
      userId: body.userId,
      documentType: body.documentType,
      isAdjustmentJournal: body.isAdjustmentJournal,
    });
    return reply.send({ success: true, data: result });
  }

  // Month-End Checklist & Closing
  public static async getMonthChecklist(request: FastifyRequest, reply: FastifyReply) {
    const { periodId } = request.params as { periodId: string };
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const list = await await MonthEndClosingService.getChecklist(tenantId, periodId);
    return reply.send({ success: true, data: list });
  }

  public static async updateChecklistItem(request: FastifyRequest, reply: FastifyReply) {
    const { periodId, itemId } = request.params as { periodId: string; itemId: string };
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const updated = await await MonthEndClosingService.updateChecklistItem({
      tenantId,
      periodId,
      itemId,
      status: body.status,
      comments: body.comments,
      supportingRef: body.supportingRef,
      userId: body.userId ,
      userName: body.userName || 'Priya Deshmukh',
    });
    return reply.send({ success: true, data: updated });
  }

  public static async closePeriod(request: FastifyRequest, reply: FastifyReply) {
    const { periodId } = request.params as { periodId: string };
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const closed = await MonthEndClosingService.closePeriod({
      tenantId,
      periodId,
      closeType: body.closeType || 'FINAL_CLOSED',
      userId: body.userId ,
      userName: body.userName || 'Priya Deshmukh',
      userRole: body.userRole || 'ACCOUNTANT',
      remarks: body.remarks,
    });
    return reply.send({ success: true, message: `Period ${closed.monthName} closed as ${closed.status}`, data: closed });
  }

  public static async reopenPeriod(request: FastifyRequest, reply: FastifyReply) {
    const { periodId } = request.params as { periodId: string };
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const reopened = await MonthEndClosingService.reopenPeriod({
      tenantId,
      periodId,
      scope: body.scope || 'ENTIRE_PERIOD',
      reason: body.reason,
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
      userRole: body.userRole || 'OWNER',
    });
    return reply.send({ success: true, message: `Period ${reopened.monthName} reopened by Owner`, data: reopened });
  }

  // Year-End Readiness & Carry-Forward
  public static async getReadinessAudit(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const fyCode = (request.query as any)?.fiscalYear || '2025-26';
    const audit = await YearEndClosingService.runReadinessAudit(tenantId, fyCode);
    return reply.send({ success: true, data: audit });
  }

  public static async getCarryForwardPreview(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const sourceFY = (request.query as any)?.sourceFY || '2025-26';
    const preview = await YearEndClosingService.getCarryForwardPreview(tenantId, sourceFY);
    return reply.send({ success: true, data: preview });
  }

  public static async executeCarryForward(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const run = await await YearEndClosingService.executeCarryForward({
      tenantId,
      sourceFYCode: body.sourceFYCode || '2025-26',
      targetFYCode: body.targetFYCode || '2026-27',
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
      userRole: body.userRole || 'OWNER',
      remarks: body.remarks,
    });
    return reply.send({
      success: true,
      message: `Year-End Close & Carry-Forward executed successfully! P&L reset to ₹0, Net Profit ₹${run.netProfitLossTransferred.toLocaleString('en-IN')} rolled to Retained Earnings.`,
      data: run,
    });
  }

  public static async getClosingHistory(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const history = await YearEndClosingService.getClosingHistory(tenantId);
    return reply.send({ success: true, data: history });
  }

  // --- NEW AUDIT ADJUSTMENTS & LIVE OPENING BALANCE SYNC HANDLERS ---
  public static async getOpeningBalanceSyncDiff(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const sourceFY = (request.query as any)?.sourceFY || '2025-26';
    const targetFY = (request.query as any)?.targetFY || '2026-27';
    const diff = await YearEndClosingService.getOpeningBalanceSyncDiff(tenantId, sourceFY, targetFY);
    return reply.send({ success: true, data: diff });
  }

  public static async postAuditAdjustment(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const adj = await await YearEndClosingService.postAuditAdjustment({
      tenantId,
      financialYearCode: body.financialYearCode || '2025-26',
      ledgerId: body.ledgerId,
      type: body.type || 'DEBIT',
      amount: Number(body.amount) || 0,
      description: body.description,
      auditorReference: body.auditorReference,
      userId: body.userId ,
      userName: body.userName || 'Priya Deshmukh',
      userRole: body.userRole || 'ACCOUNTANT',
    });
    return reply.send({
      success: true,
      message: `Statutory audit adjustment posted successfully to FY ${adj.financialYearCode}. Opening balances flagged for sync.`,
      data: adj,
    });
  }

  public static async getAuditAdjustments(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const fyCode = (request.query as any)?.financialYear || '2025-26';
    const list = await YearEndClosingService.getAuditAdjustments(tenantId, fyCode);
    return reply.send({ success: true, data: list });
  }

  public static async syncOpeningBalances(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const result = await await YearEndClosingService.syncOpeningBalances({
      tenantId,
      sourceFY: body.sourceFY || '2025-26',
      targetFY: body.targetFY || '2026-27',
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
      userRole: body.userRole || 'OWNER',
      remarks: body.remarks,
    });
    return reply.send({
      success: true,
      message: `Opening balances for FY ${result.targetFY} successfully synchronized with FY ${result.sourceFY} audited adjustments!`,
      data: result,
    });
  }
}
