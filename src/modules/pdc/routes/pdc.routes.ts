import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { pdcController } from '../controllers/pdc.controller';

export async function pdcRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/', pdcController.getAll.bind(pdcController));
  app.post('/', pdcController.create.bind(pdcController));
  app.post('/:id/promote', pdcController.promote.bind(pdcController));
}
