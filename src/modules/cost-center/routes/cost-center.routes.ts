import { authenticate } from '../../../core/middleware/auth.middleware';
import { FastifyInstance } from 'fastify';
import { CostCenterController } from '../controllers/cost-center.controller';

export async function costCenterRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/cost-centers/categories', CostCenterController.listCategories);
  app.post('/cost-centers/categories', CostCenterController.createCategory);
  app.get('/cost-centers', CostCenterController.listCostCenters);
  app.post('/cost-centers', CostCenterController.createCostCenter);
  app.post('/cost-centers/allocate', CostCenterController.recordAllocations);
  app.get('/cost-centers/reports/breakup', CostCenterController.getBreakupReport);
}
