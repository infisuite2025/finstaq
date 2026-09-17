import { authenticate } from '../../../core/middleware/auth.middleware';
import { FastifyInstance } from 'fastify';
import { ChequeController } from '../controllers/cheque.controller';

export async function chequeRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/banking/cheque-books', ChequeController.listBooks);
  app.post('/banking/cheque-books', ChequeController.createBook);
  app.get('/banking/cheques', ChequeController.listCheques);
  app.post('/banking/cheques/issue', ChequeController.issueCheque);
  app.post('/banking/cheques/cancel', ChequeController.cancelCheque);
  app.get('/banking/cheque-templates', ChequeController.getTemplates);
  app.post('/banking/cheque-templates', ChequeController.saveTemplate);
  app.post('/banking/cheques/prepare-print', ChequeController.preparePrint);
}
