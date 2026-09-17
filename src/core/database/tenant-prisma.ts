import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from './prisma';

/**
 * List of models that have direct tenant_id column isolation
 */
export const TENANT_SCOPED_MODELS = [
  'user',
  'ledgerGroup',
  'ledger',
  'voucher',
  'inventoryItem',
  'documentDraft',
  'auditLog',
  'purchaseOrder',
  'goodsReceiptNote',
  'threeWayMatchRecord',
  'salesOrder',
  'deliveryChallan',
  'unitOfMeasurement',
  'itemCategory',
  'warehouse',
  'costCenter',
  'paymentTerm',
  'taxRateMaster',
  'hsnSacDirectory',
  'currencyMaster',
  'voucherSeriesMaster',
] as const;

export type TenantScopedModel = (typeof TENANT_SCOPED_MODELS)[number];

/**
 * Creates a Tenant-Scoped Prisma Client using Prisma Client Extensions ($extends).
 * Automatically injects tenantId filter into every query and mutation,
 * ensuring strict Row-Level Multi-Tenancy Isolation.
 */
export function createTenantPrismaClient(tenantId: string, baseClient: PrismaClient = defaultPrisma) {
  if (!tenantId) {
    throw new Error('Tenant ID is required to instantiate a tenant-scoped Prisma client');
  }

  return baseClient.$extends({
    name: 'tenantIsolationExtension',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelName = model.charAt(0).toLowerCase() + model.slice(1);

          // Only apply row-level scoping if the model is tenant-scoped
          if (TENANT_SCOPED_MODELS.includes(modelName as TenantScopedModel)) {
            const currentArgs = (args || {}) as Record<string, any>;

            switch (operation) {
              case 'findFirst':
              case 'findFirstOrThrow':
              case 'findMany':
              case 'count':
              case 'aggregate':
              case 'groupBy': {
                currentArgs.where = {
                  ...currentArgs.where,
                  tenantId,
                };
                break;
              }

              case 'create': {
                if (currentArgs.data) {
                  currentArgs.data = {
                    ...currentArgs.data,
                    tenantId,
                  };
                }
                break;
              }

              case 'createMany': {
                if (Array.isArray(currentArgs.data)) {
                  currentArgs.data = currentArgs.data.map((item: any) => ({
                    ...item,
                    tenantId,
                  }));
                } else if (currentArgs.data) {
                  currentArgs.data = {
                    ...currentArgs.data,
                    tenantId,
                  };
                }
                break;
              }

              case 'update':
              case 'updateMany':
              case 'delete':
              case 'deleteMany': {
                currentArgs.where = {
                  ...currentArgs.where,
                  tenantId,
                };
                break;
              }

              case 'upsert': {
                currentArgs.where = {
                  ...currentArgs.where,
                  tenantId,
                };
                if (currentArgs.create) {
                  currentArgs.create = {
                    ...currentArgs.create,
                    tenantId,
                  };
                }
                if (currentArgs.update) {
                  currentArgs.update = {
                    ...currentArgs.update,
                    tenantId,
                  };
                }
                break;
              }
            }

            return query(currentArgs);
          }

          // Unscoped or global models (like Tenant itself)
          return query(args);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof createTenantPrismaClient>;
