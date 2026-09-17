import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { ForexController } from '../controllers/forex.controller';

export async function forexRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/currencies', ForexController.getCurrencies);
  app.post('/rates/update', ForexController.updateRate);
  app.post('/calculate-gain-loss', ForexController.calculateGainLoss);
  app.get('/revaluation-report', ForexController.getRevaluationReport);
}
