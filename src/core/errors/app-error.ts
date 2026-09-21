import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden: Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class TenantMismatchError extends AppError {
  constructor(message = 'Tenant isolation violation: Access across tenants is prohibited') {
    super(message, 403, 'TENANT_MISMATCH');
  }
}

export class UnbalancedVoucherError extends AppError {
  constructor(totalDebit: number | string, totalCredit: number | string) {
    super(
      `Double-entry balance constraint violated: Total Debits (${totalDebit}) must equal Total Credits (${totalCredit})`,
      400,
      'UNBALANCED_VOUCHER',
      { totalDebit, totalCredit }
    );
  }
}

export function globalErrorHandler(
  error: FastifyError | AppError | Error | any,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  // Fastify Schema Validation Error
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid request payload or query parameters',
        details: error.validation,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  // Prisma Error Masking (OWASP: Prevent Database Schema & Column Leakage)
  if (error.name === 'PrismaClientKnownRequestError' || error.code?.startsWith?.('P')) {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation
        return reply.status(409).send({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'A record with the specified identifier or unique field already exists.',
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
      case 'P2025': {
        // Record not found
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'The requested record was not found or has been removed.',
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
      case 'P2003': {
        // Foreign key constraint failed
        return reply.status(400).send({
          success: false,
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Invalid relational reference provided. Related entity does not exist.',
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
      case 'P2014': {
        // Required relation violation
        return reply.status(400).send({
          success: false,
          error: {
            code: 'RELATION_VIOLATION',
            message: 'The requested change violates a required relational dependency.',
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
      case 'P2000': {
        // Value out of range
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALUE_OUT_OF_RANGE',
            message: 'Provided input value exceeds allowable system limits.',
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
      default: {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'DATABASE_OPERATION_ERROR',
            message: 'Unable to complete database operation due to data constraints.',
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }
  }

  // Prisma Client Validation Error (e.g. invalid type passed into Prisma)
  if (error.name === 'PrismaClientValidationError') {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data format provided for entity fields.',
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  // Fallback 500 error (completely masked in production, sanitized in dev)
  const statusCode = (error as FastifyError).statusCode || 500;
  return reply.status(statusCode).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : error.message,
    },
    timestamp: new Date().toISOString(),
    path: request.url,
  });
}

