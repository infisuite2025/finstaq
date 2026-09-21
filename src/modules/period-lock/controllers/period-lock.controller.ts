import { FastifyReply, FastifyRequest } from 'fastify';
import { PeriodLockService } from '../services/period-lock.service';

export class PeriodLockController {
  public static async getMatrix(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const matrix = await PeriodLockService.getMatrix(tenantId);
    return reply.send({ success: true, data: matrix });
  }

  public static async validateDate(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const result = await PeriodLockService.validateTransactionDate({
      tenantId,
      transactionDate: body.transactionDate || new Date().toISOString().split('T')[0],
      userRole: body.userRole || 'DATA_ENTRY',
      userId: body.userId,
    });
    return reply.send({ success: true, data: result });
  }

  public static async closeMonth(request: FastifyRequest, reply: FastifyReply) {
    const { periodKey } = request.params as { periodKey: string };
    const body = (request.body as any) || {};
    const tenantId = body.tenantId || request.user?.tenantId ;
    const month = await PeriodLockService.closeMonth({
      tenantId,
      periodKey,
      userId: body.userId ,
      userName: body.userName || 'Priya Deshmukh',
      userRole: body.userRole || 'ACCOUNTANT',
      remarks: body.remarks,
    });
    return reply.send({
      success: true,
      message: `Period ${month.monthName} closed and locked successfully`,
      data: month,
    });
  }

  public static async reopenMonth(request: FastifyRequest, reply: FastifyReply) {
    const { periodKey } = request.params as { periodKey: string };
    const body = (request.body as any) || {};
    const tenantId = body.tenantId || request.user?.tenantId ;
    const month = await PeriodLockService.reopenMonth({
      tenantId,
      periodKey,
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
      userRole: body.userRole || 'OWNER',
      reason: body.reason,
    });
    return reply.send({
      success: true,
      message: `Period ${month.monthName} reopened by Owner`,
      data: month,
    });
  }

  public static async closeFiscalYear(request: FastifyRequest, reply: FastifyReply) {
    const { fiscalYear } = request.params as { fiscalYear: string };
    const body = (request.body as any) || {};
    const tenantId = body.tenantId || request.user?.tenantId ;
    const yr = await PeriodLockService.closeFiscalYear({
      tenantId,
      fiscalYear,
      userId: body.userId ,
      userName: body.userName || 'Vikram Singhania',
      userRole: body.userRole || 'OWNER',
      remarks: body.remarks,
    });
    return reply.send({
      success: true,
      message: `Fiscal Year ${yr.fiscalYear} finalized and locked`,
      data: yr,
    });
  }

  public static async getBackdatePolicy(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId || 'tenant-default-01';
    const matrix = await PeriodLockService.getMatrix(tenantId);
    return reply.send({
      success: true,
      data: matrix.backdatingPolicy,
    });
  }

  public static async updateBackdatingPolicy(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId || 'tenant-default-01';
    const policy = await PeriodLockService.updateBackdatingPolicy(tenantId, body, body?.userId);
    return reply.send({
      success: true,
      message: 'Backdating grace window policy updated',
      data: policy,
    });
  }

  public static async getHardFreeze(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId || 'tenant-default-01';
    const matrix = await PeriodLockService.getMatrix(tenantId);
    return reply.send({
      success: true,
      data: matrix.hardFreeze,
    });
  }

  public static async updateHardFreeze(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId || 'tenant-default-01';
    const freeze = await PeriodLockService.updateHardFreeze(tenantId, body, body?.userId);
    return reply.send({
      success: true,
      message: 'Statutory books hard freeze date updated',
      data: freeze,
    });
  }
}
