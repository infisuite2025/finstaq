import { FastifyReply, FastifyRequest } from 'fastify';
import { storageVaultService } from '../../../core/storage/storage-vault.service';
import { ValidationError } from '../../../core/errors/app-error';

export class StorageController {
  /**
   * GET /api/v1/storage/usage
   * Returns live storage statistics, quota limit, used percentage, and category breakdown for the authenticated tenant.
   */
  public static async getStorageUsage(req: FastifyRequest, rep: FastifyReply) {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
    const stats = await storageVaultService.getTenantStorageStats(tenantId);
    return rep.send({
      success: true,
      data: stats,
    });
  }

  /**
   * POST /api/v1/storage/add-on-purchase
   * Self-service storage pack purchase (+10GB, +50GB, +100GB, +500GB)
   */
  public static async purchaseStorageAddon(
    req: FastifyRequest<{ Body: { addonGB: number; packName?: string } }>,
    rep: FastifyReply
  ) {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
    const { addonGB } = req.body || {};

    if (!addonGB || addonGB <= 0 || addonGB > 1000) {
      throw new ValidationError('Please select a valid storage add-on pack (10GB, 50GB, 100GB, or 500GB).');
    }

    const result = await storageVaultService.purchaseStorageAddon(tenantId, addonGB);
    const updatedStats = await storageVaultService.getTenantStorageStats(tenantId);

    return rep.send({
      success: true,
      message: result.message,
      data: {
        newTotalGB: result.newTotalGB,
        stats: updatedStats,
      },
    });
  }

  /**
   * POST /api/v1/storage/upload
   * Encrypted file upload endpoint
   */
  public static async uploadFile(req: FastifyRequest, rep: FastifyReply) {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';

    if (!req.isMultipart || !req.isMultipart()) {
      throw new ValidationError('Multipart form upload expected.');
    }

    const data = await (req as any).file();
    if (!data) {
      throw new ValidationError('No file was attached in the request.');
    }

    const fileBuffer = await data.toBuffer();
    const originalName = data.filename || 'uploaded_document.pdf';
    const mimeType = data.mimetype || 'application/octet-stream';
    const category = (data.fields?.category?.value as any) || 'invoices';

    const record = await storageVaultService.storeFile(tenantId, fileBuffer, {
      originalName,
      mimeType,
      category,
      uploadedBy: (req as any).user?.email || 'User',
    });

    return rep.status(201).send({
      success: true,
      message: 'Document encrypted and stored securely in Vault.',
      data: record,
    });
  }

  /**
   * GET /api/v1/storage/files
   * Returns list of encrypted documents for the tenant
   */
  public static async listFiles(req: FastifyRequest, rep: FastifyReply) {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
    const files = await storageVaultService.listTenantFiles(tenantId);
    return rep.send({
      success: true,
      data: files,
    });
  }

  /**
   * DELETE /api/v1/storage/files/:id
   * Deletes a document from the encrypted vault
   */
  public static async deleteFile(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply
  ) {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
    const fileId = req.params.id;
    const deleted = await storageVaultService.deleteFile(tenantId, fileId);
    const updatedStats = await storageVaultService.getTenantStorageStats(tenantId);
    return rep.send({
      success: true,
      message: deleted ? 'Document securely removed from vault.' : 'File not found.',
      data: { stats: updatedStats },
    });
  }

  /**
   * GET /api/v1/storage/download/:id
   * Authenticated file download streaming decrypted buffer
   */
  public static async downloadFile(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply
  ) {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || '27AABCF1234F1Z5';
    const fileId = req.params.id;

    const { buffer, metadata } = await storageVaultService.retrieveFile(tenantId, fileId);

    rep.header('Content-Type', metadata.mimeType);
    rep.header('Content-Disposition', `inline; filename="${encodeURIComponent(metadata.originalName)}"`);
    rep.header('X-Content-Type-Options', 'nosniff');
    rep.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return rep.send(buffer);
  }

  /**
   * PATCH /api/v1/super-admin/tenants/:id/storage
   * Super Admin quota management endpoint
   */
  public static async updateTenantQuota(
    req: FastifyRequest<{ Params: { id: string }; Body: { allocatedGB: number; maxFileSizeMB?: number } }>,
    rep: FastifyReply
  ) {
    const targetTenantId = req.params.id;
    const { allocatedGB, maxFileSizeMB } = req.body || {};

    if (!allocatedGB || allocatedGB <= 0) {
      throw new ValidationError('Allocated storage must be greater than 0 GB.');
    }

    const updated = await storageVaultService.setTenantCustomQuota(targetTenantId, allocatedGB, maxFileSizeMB);
    const stats = await storageVaultService.getTenantStorageStats(targetTenantId);

    return rep.send({
      success: true,
      message: `Tenant ${targetTenantId} storage quota updated to ${allocatedGB} GB.`,
      data: { config: updated, stats },
    });
  }
}
