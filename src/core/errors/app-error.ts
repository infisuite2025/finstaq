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
  error: FastifyError | AppError | Error,
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

  // Fallback 500 error
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
