import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';

/**
 * Higher-order middleware factory to enforce Role-Based Access Control (RBAC)
 * Supported Roles:
 * - OWNER: Full administrative and organizational rights
 * - ACCOUNTANT: Full financial operations, ledger setup, reporting, and voucher entry
 * - DATA_ENTRY: Standard transactional voucher entry and document draft uploads
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userRole = request.user.role;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `Access denied. Role '${userRole}' is not permitted to perform this action. Required: [${allowedRoles.join(
          ', '
        )}]`
      );
    }
  };
}

// Convenience Pre-Handlers
export const requireOwner = requireRoles(UserRole.OWNER);
export const requireAccountantOrOwner = requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT);
export const requireAnyRole = requireRoles(
  UserRole.OWNER,
  UserRole.ACCOUNTANT,
  UserRole.DATA_ENTRY
);
