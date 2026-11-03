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

function sendApiError(
  reply: FastifyReply,
  request: FastifyRequest,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) {
  return reply.status(statusCode).send({
    success: false,
    error: details === undefined ? { code, message } : { code, message, details },
    timestamp: new Date().toISOString(),
    path: request.url,
  });
}

const PRISMA_ERRORS: Record<string, [number, string, string]> = {
  P2002: [409, 'CONFLICT', 'A record with the specified identifier or unique field already exists.'],
  P2025: [404, 'NOT_FOUND', 'The requested record was not found or has been removed.'],
  P2003: [400, 'FOREIGN_KEY_VIOLATION', 'Invalid relational reference provided. Related entity does not exist.'],
  P2014: [400, 'RELATION_VIOLATION', 'The requested change violates a required relational dependency.'],
  P2000: [400, 'VALUE_OUT_OF_RANGE', 'Provided input value exceeds allowable system limits.'],
};

export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return sendApiError(reply, request, error.statusCode, error.code, error.message, error.details);
  }

  // Fastify Schema Validation Error
  if ('validation' in error && error.validation) {
    return sendApiError(reply, request, 400, 'BAD_REQUEST', 'Invalid request payload or query parameters', error.validation);
  }

  // Prisma Error Masking (OWASP: Prevent Database Schema & Column Leakage)
  if (error.name === 'PrismaClientKnownRequestError' || error.code?.startsWith?.('P')) {
    const mapped = PRISMA_ERRORS[error.code] || [400, 'DATABASE_OPERATION_ERROR', 'Unable to complete database operation due to data constraints.'];
    return sendApiError(reply, request, mapped[0], mapped[1], mapped[2]);
  }

  if (error.name === 'PrismaClientValidationError') {
    return sendApiError(reply, request, 400, 'VALIDATION_ERROR', 'Invalid data format provided for entity fields.');
  }

  // Fallback 500 error (completely masked in production, sanitized in dev)
  const statusCode = (error as FastifyError).statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : error.message;
  return sendApiError(reply, request, statusCode, 'INTERNAL_SERVER_ERROR', message);
}

