import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  static async getWarehouses(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getWarehouses(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async getStockItems(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const { search, category } = req.query as { search?: string; category?: string };
    const data = await InventoryService.getStockItems(tenantId || '27AABCF1234F1Z5', search, category);
    return reply.send({ success: true, data });
  }

  static async getBoms(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getBoms(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async createBom(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    try {
      const data = await InventoryService.createBom(tenantId || '27AABCF1234F1Z5', req.body as any);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  static async executeManufacturing(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    try {
      const data = await InventoryService.executeManufacturingJournal(tenantId || '27AABCF1234F1Z5', req.body as any);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  static async getManufacturingHistory(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getManufacturingHistory(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async getStockMatrix(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getStockMatrix(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async getStockAging(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getStockAgingReport(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async getTransfers(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getTransfers(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async createTransfer(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    try {
      const data = await InventoryService.createTransfer(tenantId || '27AABCF1234F1Z5', req.body as any);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  static async getAdjustments(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getAdjustments(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }

  static async createAdjustment(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    try {
      const data = await InventoryService.createAdjustment(tenantId || '27AABCF1234F1Z5', req.body as any);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }

  static async getSummary(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] as string;
    const data = await InventoryService.getSummary(tenantId || '27AABCF1234F1Z5');
    return reply.send({ success: true, data });
  }
}
