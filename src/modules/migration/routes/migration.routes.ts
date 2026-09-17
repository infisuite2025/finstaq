import { FastifyInstance } from 'fastify';
import { MigrationController } from '../controllers/migration.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';

export async function migrationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/upload', MigrationController.uploadAndParse);
  fastify.post('/validate', MigrationController.validate);
  fastify.post('/execute', MigrationController.execute);
  fastify.get('/template', MigrationController.downloadTemplate);
}
