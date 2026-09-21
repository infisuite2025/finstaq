import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../core/database/prisma';

export class HealthController {
  /**
   * Liveness probe: returns 200 if the process is alive
   */
  public static async checkLiveness(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Readiness probe: checks DB connection and system resource availability
   */
  public static async checkReadiness(_request: FastifyRequest, reply: FastifyReply) {
    const startTime = Date.now();
    let dbStatus = 'UNKNOWN';
    let dbLatencyMs = -1;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'CONNECTED';
      dbLatencyMs = Date.now() - startTime;
    } catch (error: any) {
      dbStatus = 'DISCONNECTED';
      return reply.status(503).send({
        status: 'DOWN',
        database: {
          status: dbStatus,
          error: error.message,
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }

    const memoryUsage = process.memoryUsage();

    return reply.status(200).send({
      status: 'UP',
      service: 'finstaq-core-api',
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        memory: {
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
}
