import { FastifyInstance } from 'fastify';
import { StorageController } from '../controllers/storage.controller';

export async function storageRoutes(fastify: FastifyInstance) {
  // Tenant Storage Analytics & Add-on Purchases
  fastify.get('/storage/usage', StorageController.getStorageUsage);
  fastify.post('/storage/add-on-purchase', StorageController.purchaseStorageAddon);
  
  // Encrypted File Upload & Secure Decrypted Streaming
  fastify.post('/storage/upload', StorageController.uploadFile);
  fastify.get('/storage/download/:id', StorageController.downloadFile);

  // Super Admin Tenant Storage Quota Customization
  fastify.patch('/super-admin/tenants/:id/storage', StorageController.updateTenantQuota);
}
