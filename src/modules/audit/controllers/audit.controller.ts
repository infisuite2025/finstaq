import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AuditService } from '../services/audit.service';
import { ValidationError } from '../../../core/errors/app-error';

const logEventSchema = z.object({
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'REVERSE', 'POST', 'ADJUST', 'EXPORT', 'PRINT', 'LOGIN', 'LOGOUT']).default('UPDATE'),
  entityName: z.string().min(1).max(100).optional(),
  entityId: z.string().min(1).max(100).optional(),
  entityNumber: z.string().max(100).optional(),
  eventType: z.enum(['LOGIN', 'LOGOUT', 'SESSION_START', 'SESSION_TIMEOUT', 'PASSWORD_CHANGE', 'EXPORT_DATA', 'PRINT_REPORT']).optional(),
  before: z.record(z.any()).optional(),
  after: z.record(z.any()).optional(),
  narration: z.string().max(1000).optional(),
  details: z.string().max(1000).optional(),
  status: z.enum(['SUCCESS', 'FAILED', 'TERMINATED']).optional(),
});

export class AuditController {
  public static async getAuditLogs(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const tenantId = request.tenantId || request.user?.tenantId || 'tenant-default-01';
    const result = await AuditService.getAuditLogs({
      tenantId,
      entityName: query.entityName,
      action: query.action,
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    });
    return reply.send({ success: true, data: result });
  }

  public static async getEntityHistory(request: FastifyRequest, reply: FastifyReply) {
    const { entityName, entityId } = request.params as { entityName: string; entityId: string };
    const tenantId = request.tenantId || request.user?.tenantId || 'tenant-default-01';
    const history = await AuditService.getEntityHistory(tenantId, entityName, entityId);
    return reply.send({ success: true, data: history });
  }

  public static async getSessionLogs(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const tenantId = request.tenantId || request.user?.tenantId || 'tenant-default-01';
    const result = await AuditService.getSessionLogs({
      tenantId,
      eventType: query.eventType,
      userEmail: query.userEmail,
      search: query.search,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    });
    return reply.send({ success: true, data: result });
  }

  public static async getSummary(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || request.user?.tenantId || 'tenant-default-01';
    const summary = await AuditService.getAuditSummary(tenantId);
    return reply.send({ success: true, data: summary });
  }

  public static async recordEvent(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = logEventSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid audit event payload', parseResult.error.format());
    }

    const data = parseResult.data;
    const ip = request.ip || '127.0.0.1';
    const userAgent = (request.headers['user-agent'] as string) || 'FINSTAQ Client';

    if (data.eventType || ['LOGIN', 'LOGOUT'].includes(data.action)) {
      const sessionEvent = (data.eventType || data.action) as any;
      const log = await AuditService.logSessionEvent({
        tenantId: request.user?.tenantId,
        userId: request.user?.userId || 'usr_owner_001',
        userEmail: request.user?.email || 'admin@apextrading.com',
        userRole: request.user?.role || 'OWNER',
        eventType: sessionEvent === 'LOGIN' ? 'LOGIN' : sessionEvent === 'LOGOUT' ? 'LOGOUT' : sessionEvent,
        ipAddress: ip,
        userAgent,
        status: data.status || 'SUCCESS',
        details: data.details || data.narration,
      });
      return reply.status(201).send({ success: true, data: log });
    }

    const changeLog = await await AuditService.logDataChange({
      tenantId: request.user?.tenantId,
      userId: request.user?.userId || 'usr_owner_001',
      userName: request.user?.email ? request.user.email.split('@')[0] : 'Authorized User',
      userRole: request.user?.role || 'OWNER',
      action: data.action as any,
      entityName: data.entityName || 'GENERAL_DOCUMENT',
      entityId: data.entityId || 'GEN-001',
      entityNumber: data.entityNumber,
      ipAddress: ip,
      userAgent,
      before: data.before,
      after: data.after,
      narration: data.narration,
    });

    return reply.status(201).send({ success: true, data: changeLog });
  }
}
