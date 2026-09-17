import { RateLimitPluginOptions } from '@fastify/rate-limit';
import { env } from '../../config/env';

/**
 * Production-grade API Rate Limiting Configuration
 * Protects endpoints against brute-force and DDoS attacks.
 */
export const rateLimitConfig: RateLimitPluginOptions = {
  max: env.NODE_ENV === 'test' ? 10000 : 100, // 100 requests
  timeWindow: '1 minute',
  allowList: ['127.0.0.1', 'localhost'],
  errorResponseBuilder: (_request, context) => ({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Limit is ${context.max} requests per ${context.after}. Please try again later.`,
    },
    timestamp: new Date().toISOString(),
  }),
};
