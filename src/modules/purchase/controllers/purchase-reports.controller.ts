import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseReportsService } from '../services/purchase-reports.service';

export class PurchaseReportsController {
  getPurchaseRegister = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await PurchaseReportsService.getPurchaseRegister(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Purchase Register' });
    }
  };

  getPOOutstanding = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await PurchaseReportsService.getPoOutstanding(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch PO Outstanding report' });
    }
  };

  getGRNRejection = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await PurchaseReportsService.getGrnRegister(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch GRN Rejection register' });
    }
  };

  getBillsPending = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await PurchaseReportsService.getBillsPending(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Purchase Bills Pending' });
    }
  };

  getVendorSpendSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await PurchaseReportsService.getVendorPurchaseSummary(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Vendor Spend Summary' });
    }
  };

  getItemPurchaseSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await PurchaseReportsService.getItemPurchaseSummary(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Item Purchase Summary' });
    }
  };

  getThreeWayVariance = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await PurchaseReportsService.getVarianceAudit(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch 3-Way Variance Audit' });
    }
  };

  getVendorAging = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await PurchaseReportsService.getPayablesAging(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Vendor Aging report' });
    }
  };

  getITCSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await PurchaseReportsService.getItcSummary(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Inward ITC GST Summary' });
    }
  };
}
