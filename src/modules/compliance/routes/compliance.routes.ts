import { FastifyInstance } from 'fastify';
import { complianceController } from '../controllers/compliance.controller';

export async function complianceRoutes(app: FastifyInstance) {
  app.post('/eway-bill/generate', complianceController.generateEWayBill.bind(complianceController));
  app.post('/e-invoice/generate', complianceController.generateEInvoice.bind(complianceController));
  app.get('/records', complianceController.getRecords.bind(complianceController));
}
