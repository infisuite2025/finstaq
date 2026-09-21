import { RateLimitPluginOptions } from '@fastify/rate-limit';
import { env } from '../../config/env';

/**
 * Production-grade Tenant-Aware API Rate Limiting Configuration
 * Protects endpoints against brute-force, DDoS attacks, and noisy-neighbor tenant resource starvation.
 */
export const rateLimitConfig: RateLimitPluginOptions = {
  max: env.NODE_ENV === 'test' ? 10000 : 200, // 200 requests per minute
  timeWindow: '1 minute',
  allowList: ['127.0.0.1', 'localhost'],
  keyGenerator: (request) => {
    // Priority: Authenticated Tenant ID -> Authenticated User ID -> Header Tenant -> Remote IP
    const userTenantId = (request as any).user?.tenantId;
    const headerTenantId = request.headers['x-tenant-id'] as string;
    const userId = (request as any).user?.userId;
    
    if (userTenantId) return `tenant:${userTenantId}`;
    if (headerTenantId) return `tenant:${headerTenantId}`;
    if (userId) return `user:${userId}`;
    return request.ip;
  },
  errorResponseBuilder: (_request, context) => ({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Tenant request throughput limit exceeded (${context.max} req/${context.after}). Please throttle requests.`,
    },
    timestamp: new Date().toISOString(),
  }),
};

