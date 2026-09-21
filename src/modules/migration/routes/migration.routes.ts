import { FastifyInstance } from 'fastify';
import {
  uploadAndAnalyzeHandler,
  executeLiveMigrationHandler,
} from '../controllers/migration.controller';

export async function migrationRoutes(app: FastifyInstance) {
  app.post('/upload', uploadAndAnalyzeHandler);
  app.post('/execute', executeLiveMigrationHandler);
}
