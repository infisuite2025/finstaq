import { FastifyInstance } from 'fastify';
import { bankingController } from '../controllers/banking.controller';

export async function bankingRoutes(app: FastifyInstance) {
  app.get('/bank-ledgers', bankingController.getBankLedgers.bind(bankingController));
  app.post('/bank-ledgers', bankingController.createBankLedger.bind(bankingController));
  app.post('/link-bank', bankingController.linkBank.bind(bankingController));
  app.post('/sync-feed', bankingController.syncFeed.bind(bankingController));
  app.get('/transactions', bankingController.getBankTransactions.bind(bankingController));
  app.post('/statement/upload', bankingController.uploadStatement.bind(bankingController));
  app.get('/statement', bankingController.getStoredStatement.bind(bankingController));
  app.get('/statement/batches', bankingController.getStatementBatches.bind(bankingController));
  app.post('/auto-reconcile', bankingController.autoReconcile.bind(bankingController));
  app.post('/manual-reconcile', bankingController.manualReconcile.bind(bankingController));
  app.get('/brs-report', bankingController.getBrsReport.bind(bankingController));
}
