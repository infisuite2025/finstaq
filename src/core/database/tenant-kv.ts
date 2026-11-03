import { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from './prisma';

export async function readTenantValue(
  tenantId: string,
  key: string,
  prismaClient: PrismaClient = defaultPrisma
) {
  const row = await prismaClient.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key } },
  });
  return row?.value ?? null;
}

export async function writeTenantValue(
  tenantId: string,
  key: string,
  value: unknown,
  prismaClient: PrismaClient = defaultPrisma
) {
  const stored = value as Prisma.InputJsonValue;
  await prismaClient.keyValueStore.upsert({
    where: { tenantId_key: { tenantId, key } },
    create: { tenantId, key, value: stored },
    update: { value: stored },
  });
  return { saved: true };
}
