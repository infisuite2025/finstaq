import { AuditAction, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import { EncryptionService } from '../security/encryption';

export interface AuditLogPayload {
  tenantId: string;
  userId?: string | null;
  action: AuditAction;
  entityName: string;
  entityId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
}

export interface AuditDiff {
  changedFields: string[];
  before: Record<string, any>;
  after: Record<string, any>;
}

export class AuditLoggerService {
  /**
   * Generates a precise, sanitized JSON diff between before and after states of an entity
   */
  public static computeDiff(
    before: Record<string, any> | null | undefined,
    after: Record<string, any> | null | undefined
  ): AuditDiff | null {
    if (!before && !after) return null;

    // Cryptographically sanitize sensitive keys (passwords, tokens, raw keys, PII)
    const sanitizedBefore = before ? EncryptionService.sanitizeSensitivePayload(before) : null;
    const sanitizedAfter = after ? EncryptionService.sanitizeSensitivePayload(after) : null;

    const b = sanitizedBefore || {};
    const a = sanitizedAfter || {};

    const allKeys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));
    const changedFields: string[] = [];
    const diffBefore: Record<string, any> = {};
    const diffAfter: Record<string, any> = {};

    for (const key of allKeys) {
      // Exclude volatile timestamps or internal fields from diff calculation if identical
      const valBefore = b[key];
      const valAfter = a[key];

      const beforeStr = JSON.stringify(valBefore);
      const afterStr = JSON.stringify(valAfter);

      if (beforeStr !== afterStr) {
        changedFields.push(key);
        if (valBefore !== undefined) diffBefore[key] = valBefore;
        if (valAfter !== undefined) diffAfter[key] = valAfter;
      }
    }

    return {
      changedFields,
      before: diffBefore,
      after: diffAfter,
    };
  }

  /**
   * Persists an immutable audit log entry in the database with sanitized diff.
   */
  public static async log(
    payload: AuditLogPayload,
    client: PrismaClient = defaultPrisma
  ): Promise<void> {
    const diff = this.computeDiff(payload.before, payload.after);

    await client.auditLog.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.userId || null,
        action: payload.action,
        entityName: payload.entityName,
        entityId: payload.entityId,
        ipAddress: payload.ipAddress || null,
        userAgent: payload.userAgent || null,
        diffJson: diff ? (diff as any) : undefined,
      },
    });
  }
}

