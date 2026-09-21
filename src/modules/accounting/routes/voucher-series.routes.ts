import { authenticate } from '../../../core/middleware/auth.middleware';
import { FastifyInstance } from 'fastify';
import { VoucherSeriesController } from '../controllers/voucher-series.controller';

export async function voucherSeriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/accounting/voucher-series', VoucherSeriesController.listSeries);
  app.post('/accounting/voucher-series', VoucherSeriesController.saveSeries);
  app.get('/accounting/voucher-series/next', VoucherSeriesController.getNextNumber);
}
