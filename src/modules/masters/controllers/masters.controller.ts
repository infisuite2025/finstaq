import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { MastersService } from '../services/masters.service';
import { ValidationError } from '../../../core/errors/app-error';
import { GroupNature } from '@prisma/client';

const createCustomerSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  groupId: z.string().optional(),
  paymentTermId: z.string().optional(),
  gstIn: z.string().optional(),
  pan: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  stateCode: z.string().optional(),
  creditPeriodDays: z.coerce.number().min(0).default(30),
  creditLimit: z.coerce.number().min(0).default(0),
  openingBalance: z.coerce.number().default(0),
});

const createVendorSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  groupId: z.string().optional(),
  paymentTermId: z.string().optional(),
  gstIn: z.string().optional(),
  pan: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  stateCode: z.string().optional(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  openingBalance: z.coerce.number().default(0),
});

const createInventoryItemSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  uomId: z.string().optional(),
  warehouseId: z.string().optional(),
  hsnCode: z.string().optional(),
  taxRatePercent: z.coerce.number().min(0).default(18),
  unit: z.string().default('PCS'),
  openingStockQty: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(10),
  standardCost: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  valuationMethod: z.enum(['FIFO', 'WEIGHTED_AVERAGE']).default('FIFO'),
});

const createUomSchema = z.object({
  symbol: z.string().min(1),
  formalName: z.string().min(2),
  uqc: z.string().optional(),
  decimalPlaces: z.coerce.number().min(0).max(4).default(0),
  isDefault: z.boolean().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  parentId: z.string().optional().nullable(),
  defaultHsn: z.string().optional(),
  defaultTaxRate: z.coerce.number().optional(),
  description: z.string().optional(),
});

const createWarehouseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const createCostCenterSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  category: z.string().optional(),
});

const createPaymentTermSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  days: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const createTaxRateSchema = z.object({
  name: z.string().min(2),
  ratePercent: z.coerce.number().min(0),
  cgstPercent: z.coerce.number().optional(),
  sgstPercent: z.coerce.number().optional(),
  igstPercent: z.coerce.number().optional(),
  cessPercent: z.coerce.number().optional(),
  isDefault: z.boolean().optional(),
});

const createCurrencySchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  symbol: z.string().min(1),
  decimalPlaces: z.coerce.number().min(0).max(4).default(2),
  exchangeRate: z.coerce.number().min(0).default(1),
  isBase: z.boolean().optional(),
});

const createGroupSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  parentId: z.string().optional().nullable(),
  nature: z.nativeEnum(GroupNature),
  affectsGrossProfit: z.boolean().optional(),
});

const createLedgerSchema = z.object({
  name: z.string().min(2),
  groupId: z.string().min(1),
  code: z.string().optional(),
  openingBalance: z.coerce.number().default(0),
  gstIn: z.string().optional(),
  pan: z.string().optional(),
  stateCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

export class MastersController {
  public static async getAllMasters(request: FastifyRequest, reply: FastifyReply) {
    const bundle = await MastersService.getAllMastersBundle(request.tenantId);
    return reply.send({ success: true, data: bundle });
  }

  public static async getUoms(request: FastifyRequest, reply: FastifyReply) {
    const uoms = await MastersService.getUoms(request.tenantId);
    return reply.send({ success: true, data: uoms });
  }

  public static async createUom(request: FastifyRequest, reply: FastifyReply) {
    const result = createUomSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid UoM payload', result.error.format());
    const uom = await MastersService.createUom({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Unit of Measurement created', data: uom });
  }

  public static async getCategories(request: FastifyRequest, reply: FastifyReply) {
    const cats = await MastersService.getCategories(request.tenantId);
    return reply.send({ success: true, data: cats });
  }

  public static async createCategory(request: FastifyRequest, reply: FastifyReply) {
    const result = createCategorySchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Category payload', result.error.format());
    const cat = await MastersService.createCategory({ tenantId: request.tenantId, userId: request.user.userId, ...result.data, parentId: result.data.parentId || undefined });
    return reply.status(201).send({ success: true, message: 'Item Category created', data: cat });
  }

  public static async getWarehouses(request: FastifyRequest, reply: FastifyReply) {
    const warehouses = await MastersService.getWarehouses(request.tenantId);
    return reply.send({ success: true, data: warehouses });
  }

  public static async createWarehouse(request: FastifyRequest, reply: FastifyReply) {
    const result = createWarehouseSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Warehouse payload', result.error.format());
    const wh = await MastersService.createWarehouse({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Warehouse created', data: wh });
  }

  public static async getCostCenters(request: FastifyRequest, reply: FastifyReply) {
    const ccs = await MastersService.getCostCenters(request.tenantId);
    return reply.send({ success: true, data: ccs });
  }

  public static async createCostCenter(request: FastifyRequest, reply: FastifyReply) {
    const result = createCostCenterSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Cost Center payload', result.error.format());
    const cc = await MastersService.createCostCenter({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Cost Center created', data: cc });
  }

  public static async getPaymentTerms(request: FastifyRequest, reply: FastifyReply) {
    const pts = await MastersService.getPaymentTerms(request.tenantId);
    return reply.send({ success: true, data: pts });
  }

  public static async createPaymentTerm(request: FastifyRequest, reply: FastifyReply) {
    const result = createPaymentTermSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Payment Term payload', result.error.format());
    const pt = await MastersService.createPaymentTerm({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Payment Term created', data: pt });
  }

  public static async getTaxRates(request: FastifyRequest, reply: FastifyReply) {
    const rates = await MastersService.getTaxRates(request.tenantId);
    return reply.send({ success: true, data: rates });
  }

  public static async createTaxRate(request: FastifyRequest, reply: FastifyReply) {
    const result = createTaxRateSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Tax Rate payload', result.error.format());
    const rate = await MastersService.createTaxRate({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Tax Rate created', data: rate });
  }

  public static async getHsnDirectory(request: FastifyRequest, reply: FastifyReply) {
    const hsns = await MastersService.getHsnSacCodes(request.tenantId);
    return reply.send({ success: true, data: hsns });
  }

  public static async getCurrencies(request: FastifyRequest, reply: FastifyReply) {
    const currencies = await MastersService.getCurrencies(request.tenantId);
    return reply.send({ success: true, data: currencies });
  }

  public static async createCurrency(request: FastifyRequest, reply: FastifyReply) {
    const result = createCurrencySchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Currency payload', result.error.format());
    const cur = await MastersService.createCurrency({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Currency created', data: cur });
  }

  public static async getLedgerGroups(request: FastifyRequest, reply: FastifyReply) {
    const groups = await MastersService.getLedgerGroups(request.tenantId);
    return reply.send({ success: true, data: groups });
  }

  public static async createLedgerGroup(request: FastifyRequest, reply: FastifyReply) {
    const result = createGroupSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Group payload', result.error.format());
    const grp = await MastersService.createLedgerGroup({ tenantId: request.tenantId, userId: request.user.userId, ...result.data, parentId: result.data.parentId || undefined });
    return reply.status(201).send({ success: true, message: 'Account Group created', data: grp });
  }

  public static async getLedgers(request: FastifyRequest, reply: FastifyReply) {
    const ledgers = await MastersService.getLedgers(request.tenantId);
    return reply.send({ success: true, data: ledgers });
  }

  public static async createLedger(request: FastifyRequest, reply: FastifyReply) {
    const result = createLedgerSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Ledger payload', result.error.format());
    const ledger = await MastersService.createLedger({ tenantId: request.tenantId, userId: request.user.userId, ...result.data, email: result.data.email || undefined });
    return reply.status(201).send({ success: true, message: 'Ledger created', data: ledger });
  }

  public static async createCustomer(request: FastifyRequest, reply: FastifyReply) {
    const result = createCustomerSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Customer payload', result.error.format());
    const customer = await MastersService.createCustomer({ tenantId: request.tenantId, userId: request.user.userId, ...result.data, email: result.data.email || undefined });
    return reply.status(201).send({ success: true, message: 'Customer Master created', data: customer });
  }

  public static async getCustomers(request: FastifyRequest, reply: FastifyReply) {
    const customers = await MastersService.getCustomers(request.tenantId);
    return reply.send({ success: true, data: customers });
  }

  public static async createVendor(request: FastifyRequest, reply: FastifyReply) {
    const result = createVendorSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Vendor payload', result.error.format());
    const vendor = await MastersService.createVendor({ tenantId: request.tenantId, userId: request.user.userId, ...result.data, email: result.data.email || undefined });
    return reply.status(201).send({ success: true, message: 'Vendor Master created', data: vendor });
  }

  public static async getVendors(request: FastifyRequest, reply: FastifyReply) {
    const vendors = await MastersService.getVendors(request.tenantId);
    return reply.send({ success: true, data: vendors });
  }

  public static async createInventoryItem(request: FastifyRequest, reply: FastifyReply) {
    const result = createInventoryItemSchema.safeParse(request.body);
    if (!result.success) throw new ValidationError('Invalid Item payload', result.error.format());
    const item = await MastersService.createInventoryItem({ tenantId: request.tenantId, userId: request.user.userId, ...result.data });
    return reply.status(201).send({ success: true, message: 'Inventory Item created', data: item });
  }

  public static async getInventoryItems(request: FastifyRequest, reply: FastifyReply) {
    const items = await MastersService.getInventoryItems(request.tenantId);
    return reply.send({ success: true, data: items });
  }

  public static async getConfigurations(request: FastifyRequest, reply: FastifyReply) {
    const config = await MastersService.getTenantConfigurations(request.tenantId);
    return reply.send({ success: true, data: config });
  }
}
