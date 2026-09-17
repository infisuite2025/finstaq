import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { tdsTcsController } from '../controllers/tds-tcs.controller';

export async function tdsTcsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/tds-sections', tdsTcsController.getSections.bind(tdsTcsController));
  app.post('/calculate-tds', tdsTcsController.calculateDeduction.bind(tdsTcsController));
  app.post('/calculate-tcs', tdsTcsController.calculateTcs.bind(tdsTcsController));
  app.get('/form-26q', tdsTcsController.getForm26q.bind(tdsTcsController));
  app.get('/form-27eq', tdsTcsController.getForm27eq.bind(tdsTcsController));
}
