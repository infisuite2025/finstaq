import { FastifyRequest, FastifyReply } from 'fastify';
import { SalesReportsService } from '../services/sales-reports.service';

export class SalesReportsController {
  getSalesRegister = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getSalesRegister(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Sales Register' });
    }
  };

  getSOOutstanding = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getSalesOrderOutstanding(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Sales Order Outstanding' });
    }
  };

  getDeliveryChallans = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getDeliveryChallanRegister(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Delivery Challan Register' });
    }
  };

  getBillsPending = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await SalesReportsService.getSalesBillsPending(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Sales Bills Pending' });
    }
  };

  getCustomerSalesSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getCustomerSalesSummary(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Customer Sales Summary' });
    }
  };

  getItemSalesSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getItemSalesSummary(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Item Sales Summary' });
    }
  };

  getCustomerAging = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const data = await SalesReportsService.getCustomerReceivablesAging(tenantId);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Customer Receivables Aging' });
    }
  };

  getGstr1Summary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getGstr1OutwardSummary(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch GSTR-1 Outward Summary' });
    }
  };

  getSalesReturns = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = request.tenantId || (request.user as any)?.tenantId || '27AABCF1234F1Z5';
      const query = request.query as any;
      const data = await SalesReportsService.getSalesReturnRegister(tenantId, query);
      return reply.code(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch Sales Return / Credit Notes' });
    }
  };
}
