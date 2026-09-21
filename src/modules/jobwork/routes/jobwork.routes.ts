import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { jobWorkController } from '../controllers/jobwork.controller';

export async function jobWorkRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/challans', jobWorkController.getChallans.bind(jobWorkController));
  app.post('/challans', jobWorkController.createChallan.bind(jobWorkController));
  app.get('/receipts', jobWorkController.getReceipts.bind(jobWorkController));
  app.post('/receipts', jobWorkController.recordReceipt.bind(jobWorkController));
  app.get('/form-itc04', jobWorkController.getFormItc04.bind(jobWorkController));
}
