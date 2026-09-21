import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { globalErrorHandler } from './core/errors/app-error';
import { rateLimitConfig } from './core/security/rate-limit';
import { healthRoutes } from './modules/health/health.routes';
import { accountingRoutes } from './modules/accounting/routes/accounting.routes';
import { documentRoutes } from './modules/document/routes/document.routes';
import { purchaseRoutes } from './modules/purchase/routes/purchase.routes';
import { salesRoutes } from './modules/sales/routes/sales.routes';
import { mastersRoutes } from './modules/masters/routes/masters.routes';
import { communicationRoutes } from './modules/communication/routes/communication.routes';
import { auditRoutes } from './modules/audit/routes/audit.routes';
import { inventoryRoutes } from './modules/inventory/routes/inventory.routes';
import { notesRoutes } from './modules/notes/routes/notes.routes';
import { returnsRoutes } from './modules/returns/routes/returns.routes';
import { approvalRoutes } from './modules/approvals/routes/approval.routes';
import { periodLockRoutes } from './modules/period-lock/routes/period-lock.routes';
import { periodClosingRoutes } from './modules/period-closing/routes/period-closing.routes';
import { superAdminRoutes } from './modules/super-admin/routes/super-admin.routes';
import { bankingRoutes } from './modules/banking/routes/banking.routes';
import { tdsTcsRoutes } from './modules/tax/routes/tds-tcs.routes';
import { complianceRoutes } from './modules/compliance/routes/compliance.routes';
import { forexRoutes } from './modules/forex/routes/forex.routes';
import { voucherSeriesRoutes } from './modules/accounting/routes/voucher-series.routes';
import { chequeRoutes } from './modules/banking/routes/cheque.routes';
import { costCenterRoutes } from './modules/cost-center/routes/cost-center.routes';
import { payrollRoutes } from './modules/payroll/routes/payroll.routes';
import { upiRoutes } from './modules/upi/routes/upi.routes';
import { pdcRoutes } from './modules/pdc/routes/pdc.routes';
import { interestRoutes } from './modules/interest/routes/interest.routes';
import { jobWorkRoutes } from './modules/jobwork/routes/jobwork.routes';
import { storageRoutes } from './modules/storage/routes/storage.routes';
import { onboardingRoutes } from './modules/onboarding/routes/onboarding.routes';
import { migrationRoutes } from './modules/migration/routes/migration.routes';

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        removeAdditional: true, // Strips any malicious/unexpected fields not defined in schema (Anti-Mass Assignment)
        coerceTypes: false, // Prevents unintended type coercion attacks
      },
    },
    ...options,
  });

  // Security Headers (OWASP Hardening: XSS, Clickjacking, MIME-sniffing, HSTS)
  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
    frameguard: { action: 'deny' }, // Anti-Clickjacking: X-Frame-Options: DENY
    hidePoweredBy: true, // Hides X-Powered-By: Fastify/Node
    hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    noSniff: true, // X-Content-Type-Options: nosniff
  });

  // API Rate Limiting (Tenant-Aware)
  app.register(rateLimit, rateLimitConfig);

  // Cross-Origin Resource Sharing (Explicit Whitelist & Restricted HTTP Verbs)
  app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);

      // In non-production, allow localhost and loopback on any port
      if (env.NODE_ENV !== 'production') {
        if (/^http:\/\/localhost(:[0-9]+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:[0-9]+)?$/.test(origin)) {
          return cb(null, true);
        }
      }

      // Check allowed list from CORS_ORIGIN
      const allowed = env.CORS_ORIGIN === '*' ? [origin] : env.CORS_ORIGIN.split(',').map((s) => s.trim());
      if (allowed.includes(origin) || allowed.includes('*')) {
        return cb(null, true);
      }
      return cb(new Error('Blocked by CORS policy'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-user-id', 'x-user-role', 'Accept'],
    credentials: true,
  });



  // Useful Fastify utilities (HTTP errors, assertions, multipart)
  app.register(sensible);
  app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  // JWT Authentication Plugin
  app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Centralized Error Handling
  app.setErrorHandler(globalErrorHandler);

  // Modular Route Registration
  app.register(healthRoutes, { prefix: '/health' });
  app.register(healthRoutes, { prefix: '/api/v1/health' });
  app.register(accountingRoutes, { prefix: '/api/v1/accounting' });
  app.register(documentRoutes, { prefix: '/api/v1/documents' });
  app.register(purchaseRoutes, { prefix: '/api/v1/purchase' });
  app.register(salesRoutes, { prefix: '/api/v1/sales' });
  app.register(mastersRoutes, { prefix: '/api/v1/masters' });
  app.register(communicationRoutes, { prefix: '/api/v1/communication' });
  app.register(communicationRoutes, { prefix: '/api/v1/communications' });
  app.register(auditRoutes, { prefix: '/api/v1/audit' });
  app.register(auditRoutes, { prefix: '/api/v1/audits' });
  app.register(inventoryRoutes, { prefix: '/api/v1/inventory' });
  app.register(notesRoutes, { prefix: '/api/v1/notes' });
  app.register(returnsRoutes, { prefix: '/api/v1/returns' });
  app.register(approvalRoutes, { prefix: '/api/v1/approvals' });
  app.register(periodLockRoutes, { prefix: '/api/v1/period-lock' });
  app.register(periodClosingRoutes, { prefix: '/api/v1/period-closing' });
  app.register(superAdminRoutes, { prefix: '/api/v1' });
  app.register(bankingRoutes, { prefix: '/api/v1/banking' });
  app.register(tdsTcsRoutes, { prefix: '/api/v1/tax' });
  app.register(complianceRoutes, { prefix: '/api/v1/compliance' });
  app.register(forexRoutes, { prefix: '/api/v1/forex' });
  app.register(voucherSeriesRoutes, { prefix: '/api/v1' });
  app.register(chequeRoutes, { prefix: '/api/v1' });
  app.register(costCenterRoutes, { prefix: '/api/v1' });
  app.register(payrollRoutes, { prefix: '/api/v1' });
  app.register(upiRoutes, { prefix: '/api/v1/upi' });
  app.register(pdcRoutes, { prefix: '/api/v1/pdc' });
  app.register(interestRoutes, { prefix: '/api/v1/interest' });
  app.register(jobWorkRoutes, { prefix: '/api/v1/jobwork' });
  app.register(storageRoutes, { prefix: '/api/v1' });
  app.register(onboardingRoutes, { prefix: '/api/v1/onboarding' });
  app.register(migrationRoutes, { prefix: '/api/v1/migration' });

  // Root welcome endpoint

  app.get('/', async (_req, reply) => {
    return reply.send({
      name: 'Finstaq Core API',
      version: '1.0.0',
      description: 'Modern, cloud-native financial SaaS engine',
      docs: '/api/v1/docs',
      health: '/api/v1/health',
    });
  });

  return app;
}
