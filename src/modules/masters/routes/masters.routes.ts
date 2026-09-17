import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MastersController } from '../controllers/masters.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAccountantOrOwner, requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function mastersRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  // Dynamic Masters Bundle
  fastify.get('/all', { preHandler: [requireAnyRole] }, MastersController.getAllMasters);

  // Units of Measurement (UoM)
  fastify.get('/uom', { preHandler: [requireAnyRole] }, MastersController.getUoms);
  fastify.post('/uom', { preHandler: [requireAnyRole] }, MastersController.createUom);

  // Item Categories
  fastify.get('/categories', { preHandler: [requireAnyRole] }, MastersController.getCategories);
  fastify.post('/categories', { preHandler: [requireAnyRole] }, MastersController.createCategory);

  // Warehouses
  fastify.get('/warehouses', { preHandler: [requireAnyRole] }, MastersController.getWarehouses);
  fastify.post('/warehouses', { preHandler: [requireAnyRole] }, MastersController.createWarehouse);

  // Cost Centers
  fastify.get('/cost-centers', { preHandler: [requireAnyRole] }, MastersController.getCostCenters);
  fastify.post('/cost-centers', { preHandler: [requireAnyRole] }, MastersController.createCostCenter);

  // Payment Terms
  fastify.get('/payment-terms', { preHandler: [requireAnyRole] }, MastersController.getPaymentTerms);
  fastify.post('/payment-terms', { preHandler: [requireAnyRole] }, MastersController.createPaymentTerm);

  // Tax Rates & HSN Directory
  fastify.get('/tax-rates', { preHandler: [requireAnyRole] }, MastersController.getTaxRates);
  fastify.post('/tax-rates', { preHandler: [requireAnyRole] }, MastersController.createTaxRate);
  fastify.get('/hsn-sac', { preHandler: [requireAnyRole] }, MastersController.getHsnDirectory);
  fastify.get('/hsn-directory', { preHandler: [requireAnyRole] }, MastersController.getHsnDirectory);

  // Currencies
  fastify.get('/currencies', { preHandler: [requireAnyRole] }, MastersController.getCurrencies);
  fastify.post('/currencies', { preHandler: [requireAnyRole] }, MastersController.createCurrency);

  // Chart of Accounts (Groups & Ledgers)
  fastify.get('/groups', { preHandler: [requireAnyRole] }, MastersController.getLedgerGroups);
  fastify.post('/groups', { preHandler: [requireAnyRole] }, MastersController.createLedgerGroup);
  fastify.get('/ledgers', { preHandler: [requireAnyRole] }, MastersController.getLedgers);
  fastify.post('/ledgers', { preHandler: [requireAnyRole] }, MastersController.createLedger);

  // Customers & Vendors
  fastify.get('/customers', { preHandler: [requireAnyRole] }, MastersController.getCustomers);
  fastify.post('/customers', { preHandler: [requireAnyRole] }, MastersController.createCustomer);
  fastify.get('/vendors', { preHandler: [requireAnyRole] }, MastersController.getVendors);
  fastify.post('/vendors', { preHandler: [requireAnyRole] }, MastersController.createVendor);

  // Inventory Items
  fastify.get('/items', { preHandler: [requireAnyRole] }, MastersController.getInventoryItems);
  fastify.post('/items', { preHandler: [requireAnyRole] }, MastersController.createInventoryItem);

  // Tenant Settings & Configurations
  fastify.get('/configurations', { preHandler: [requireAnyRole] }, MastersController.getConfigurations);
}
