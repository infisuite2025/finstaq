import { FastifyReply, FastifyRequest } from 'fastify';
import { ApprovalService } from '../services/approval.service';
import { ValidationError } from '../../../core/errors/app-error';

export class ApprovalController {
  public static async getRules(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const rules = ApprovalService.getRules(tenantId);
    return reply.send({ success: true, data: rules });
  }

  public static async resetRules(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const rules = ApprovalService.resetToDefaults(tenantId, request.user?.userId);
    return reply.send({
      success: true,
      message: 'Maker-Checker policies reset to 90% Best Practice Defaults',
      data: rules,
    });
  }

  public static async updateRulesBulk(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const rules = body?.rules;
    if (!Array.isArray(rules)) {
      throw new ValidationError('Expected rules array', {});
    }
    const updated = await ApprovalService.updateRulesBulk(tenantId, rules, request.user?.userId);
    return reply.send({
      success: true,
      message: 'Maker-Checker policies saved successfully',
      data: updated,
    });
  }

  public static async updateRule(request: FastifyRequest, reply: FastifyReply) {
    const { documentType } = request.params as { documentType: any };
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const body = request.body as any;
    const updated = await ApprovalService.updateRule(
      tenantId,
      documentType,
      body,
      request.user?.userId
    );
    return reply.send({
      success: true,
      message: `Maker-Checker policy for ${documentType} updated successfully`,
      data: updated,
    });
  }

  public static async evaluate(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const tenantId = body?.tenantId || request.user?.tenantId ;
    const result = ApprovalService.evaluateTransaction({
      tenantId,
      docType: body.docType,
      docNumber: body.docNumber,
      docId: body.docId,
      amount: Number(body.amount),
      currency: body.currency,
      makerId: body.makerId || 'usr-003',
      makerName: body.makerName || 'Ramesh Patel',
      makerRole: body.makerRole || 'DATA_ENTRY',
      makerEmail: body.makerEmail,
      remarks: body.remarks,
      metadata: body.metadata,
    });
    return reply.send({ success: true, data: result });
  }

  public static async getPending(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const pending = ApprovalService.getPendingApprovals(tenantId);
    return reply.send({ success: true, data: pending });
  }

  public static async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const history = ApprovalService.getApprovalHistory(tenantId);
    return reply.send({ success: true, data: history });
  }

  public static async getStats(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.query as any)?.tenantId || request.user?.tenantId ;
    const stats = ApprovalService.getStats(tenantId);
    return reply.send({ success: true, data: stats });
  }

  public static async approve(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = (request.body as any) || {};
    const tenantId = body.tenantId || request.user?.tenantId ;
    const approved = await ApprovalService.approveRequest({
      tenantId,
      requestId: id,
      checkerId: body.checkerId ,
      checkerName: body.checkerName || 'Priya Deshmukh',
      checkerRole: body.checkerRole || 'ACCOUNTANT',
      checkerEmail: body.checkerEmail,
      remarks: body.remarks,
    });
    return reply.send({
      success: true,
      message: `Transaction ${approved.docNumber} successfully approved`,
      data: approved,
    });
  }

  public static async reject(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = (request.body as any) || {};
    const tenantId = body.tenantId || request.user?.tenantId ;
    const rejected = await ApprovalService.rejectRequest({
      tenantId,
      requestId: id,
      checkerId: body.checkerId ,
      checkerName: body.checkerName || 'Priya Deshmukh',
      checkerRole: body.checkerRole || 'ACCOUNTANT',
      checkerEmail: body.checkerEmail,
      rejectionReason: body.rejectionReason || body.remarks,
    });
    return reply.send({
      success: true,
      message: `Transaction ${rejected.docNumber} rejected`,
      data: rejected,
    });
  }
}
