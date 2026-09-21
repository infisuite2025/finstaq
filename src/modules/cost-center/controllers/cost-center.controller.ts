// @ts-nocheck
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CostCenterService } from '../services/cost-center.service';

const saveCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
});

const saveCostCenterSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  managerName: z.string().optional(),
  annualBudget: z.coerce.number().optional(),
});

const recordAllocationsSchema = z.object({
  allocations: z.array(
    z.object({
      voucherId: z.string().min(1),
      voucherNumber: z.string().min(1),
      date: z.string().min(1),
      ledgerName: z.string().min(1),
      costCenterId: z.string().min(1),
      type: z.enum(['EXPENSE', 'REVENUE']),
      amount: z.coerce.number().min(0.01),
    })
  ),
});

export class CostCenterController {
  public static async listCategories(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const list = await CostCenterService.listCategories(tenantId);
    return reply.send({ success: true, data: list });
  }

  public static async createCategory(request: FastifyRequest, reply: FastifyReply) {
    const parse = saveCategorySchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ success: false, error: parse.error.format() });
    }
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const cat = await CostCenterService.createCategory(tenantId, parse.data);
    return reply.send({ success: true, data: cat });
  }

  public static async listCostCenters(request: FastifyRequest, reply: FastifyReply) {
    const { categoryId } = request.query as { categoryId?: string };
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const list = await CostCenterService.listCostCenters(tenantId, categoryId);
    return reply.send({ success: true, data: list });
  }

  public static async createCostCenter(request: FastifyRequest, reply: FastifyReply) {
    const parse = saveCostCenterSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ success: false, error: parse.error.format() });
    }
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const cc = await CostCenterService.createCostCenter({ tenantId, ...parse.data });
    return reply.send({ success: true, data: cc });
  }

  public static async recordAllocations(request: FastifyRequest, reply: FastifyReply) {
    const parse = recordAllocationsSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ success: false, error: parse.error.format() });
    }
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const result = await CostCenterService.recordAllocations(tenantId, parse.data.allocations);
    return reply.send({ success: true, data: result });
  }

  public static async getBreakupReport(request: FastifyRequest, reply: FastifyReply) {
    const { categoryId } = request.query as { categoryId?: string };
    const tenantId = request.tenantId || (request.user as any)?.tenantId || 'tenant-default-01';
    const report = await CostCenterService.getCostCenterBreakupReport(tenantId, categoryId);
    return reply.send({ success: true, data: report });
  }
}
