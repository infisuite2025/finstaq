import { FastifyInstance } from 'fastify';
import { upiController } from '../controllers/upi.controller';

export async function upiRoutes(app: FastifyInstance) {
  app.post('/generate-qr', upiController.generateQr.bind(upiController));
  app.get('/validate-vpa', upiController.validateVpa.bind(upiController));
  app.post('/validate-vpa', upiController.validateVpa.bind(upiController));
  app.get('/transactions', upiController.getTransactions.bind(upiController));
  app.get('/vpa-directory', upiController.getVpaDirectory.bind(upiController));
  app.post('/vpa-directory', upiController.addVpa.bind(upiController));
  app.post('/collect', upiController.processCollection.bind(upiController));
  app.post('/payout', upiController.processPayout.bind(upiController));
}
