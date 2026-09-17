import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { FastifyInstance } from 'fastify';
import { InventoryController } from '../controllers/inventory.controller';

export async function inventoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', enforceTenantIsolation);

  app.get('/warehouses', InventoryController.getWarehouses);
  app.get('/items', InventoryController.getStockItems);
  app.get('/transfers', InventoryController.getTransfers);
  app.post('/transfers', InventoryController.createTransfer);
  app.get('/adjustments', InventoryController.getAdjustments);
  app.post('/adjustments', InventoryController.createAdjustment);
  app.get('/summary', InventoryController.getSummary);
  app.get('/boms', InventoryController.getBoms);
  app.post('/boms', InventoryController.createBom);
  app.post('/manufacturing/execute', InventoryController.executeManufacturing);
  app.get('/manufacturing/history', InventoryController.getManufacturingHistory);
  app.get('/reports/stock-matrix', InventoryController.getStockMatrix);
  app.get('/reports/stock-aging', InventoryController.getStockAging);
}
