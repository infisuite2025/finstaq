import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NotesController } from '../controllers/notes.controller';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { enforceTenantIsolation } from '../../../core/middleware/tenant.middleware';
import { requireAnyRole } from '../../../core/middleware/rbac.middleware';

export async function notesRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', enforceTenantIsolation);

  fastify.get('/', { preHandler: [requireAnyRole] }, NotesController.getNotes);
  fastify.get('/:id', { preHandler: [requireAnyRole] }, NotesController.getNoteById);
  fastify.post('/', { preHandler: [requireAnyRole] }, NotesController.createNote);
}
