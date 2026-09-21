import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { HealthController } from './health.controller';

export async function healthRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Liveness check (Kubernetes / load balancer health check)
  fastify.get('/live', HealthController.checkLiveness);

  // Readiness check (Database connectivity & system stats)
  fastify.get('/ready', HealthController.checkReadiness);

  // Default health route
  fastify.get('/', HealthController.checkReadiness);
}
