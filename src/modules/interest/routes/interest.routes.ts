import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { interestController } from '../controllers/interest.controller';

export async function interestRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/overdue', interestController.getOverdueBills.bind(interestController));
  app.post('/generate-note', interestController.generateDebitNote.bind(interestController));
}
