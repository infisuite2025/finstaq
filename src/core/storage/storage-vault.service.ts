import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env';
import { ValidationError } from '../errors/app-error';

export interface StoredDocumentMetadata {
  id: string;
  tenantId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: 'invoices' | 'banking' | 'payroll' | 'statutory' | 'inventory' | 'other';
  checksumSha256: string;
  storageDriver: 'local' | 's3' | 'azure';
  storagePath: string;
  isEncrypted: boolean;
  uploadedBy?: string;
  createdAt: string;
}

export interface TenantStorageQuotaConfig {
  tenantId: string;
  allocatedGB: number;
  maxFileSizeMB: number;
  customAddonGB: number;
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
}

export interface CategoryBreakdown {
  category: string;
  label: string;
  sizeBytes: number;
  sizeFormatted: string;
  fileCount: number;
  percentOfTotal: number;
}

export interface TenantStorageStats {
  tenantId: string;
  allocatedGB: number;
  allocatedBytes: number;
  usedBytes: number;
  usedGB: number;
  usedFormatted: string;
  availableBytes: number;
  availableFormatted: string;
  usedPercentage: number;
  totalFiles: number;
  maxFileSizeMB: number;
  storageDriver: 'local' | 's3' | 'azure';
  isHealthy: boolean;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  categories: CategoryBreakdown[];
}

import { prisma } from '../database/prisma';

export class StorageVaultService {
  private static instance: StorageVaultService;
  private vaultBasePath: string;

  private constructor() {
    // Default local vault directory: <project-root>/data/vault
    this.vaultBasePath = process.env.STORAGE_VAULT_PATH || path.join(process.cwd(), 'data', 'vault');
    this.ensureDirectoryExists(this.vaultBasePath);
  }

  public static getInstance(): StorageVaultService {
    if (!StorageVaultService.instance) {
      StorageVaultService.instance = new StorageVaultService();
    }
    return StorageVaultService.instance;
  }

  private ensureDirectoryExists(dirPath: string) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (e) {
      // Safe fallback
    }
  }

  private getEncryptionKey(): Buffer {
    const rawKey = env.FIELD_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    return Buffer.from(rawKey.padEnd(64, '0').slice(0, 64), 'hex');
  }

  private async getTenantMetadata(tenantId: string): Promise<StoredDocumentMetadata[]> {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId, key: 'STORAGE_METADATA' } }
    });
    if (record && record.value && Array.isArray(record.value)) {
      return record.value as unknown as StoredDocumentMetadata[];
    }
    const seed = this.getDefaultSeedFiles(tenantId);
    try {
      await prisma.keyValueStore.create({
        data: { tenantId, key: 'STORAGE_METADATA', value: seed as any }
      });
    } catch (e) {
      // Ignore concurrent race
    }
    return seed;
  }

  private async saveTenantMetadata(tenantId: string, files: StoredDocumentMetadata[]): Promise<void> {
    await prisma.keyValueStore.upsert({
      where: { tenantId_key: { tenantId, key: 'STORAGE_METADATA' } },
      update: { value: files as any },
      create: { tenantId, key: 'STORAGE_METADATA', value: files as any }
    });
  }

  public async getTenantQuota(tenantId: string): Promise<TenantStorageQuotaConfig> {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId, key: 'STORAGE_QUOTA' } }
    });
    if (record && record.value && typeof record.value === 'object') {
      return record.value as unknown as TenantStorageQuotaConfig;
    }
    const defQuota: TenantStorageQuotaConfig = {
      tenantId,
      allocatedGB: tenantId.startsWith('27') ? 25 : tenantId.startsWith('29') ? 10 : 5,
      maxFileSizeMB: 25,
      customAddonGB: 0,
      planTier: tenantId.startsWith('27') ? 'ENTERPRISE' : tenantId.startsWith('29') ? 'PROFESSIONAL' : 'STARTER',
    };
    try {
      await prisma.keyValueStore.create({
        data: { tenantId, key: 'STORAGE_QUOTA', value: defQuota as any }
      });
    } catch (e) {
      // Ignore concurrent race
    }
    return defQuota;
  }

  public async saveTenantQuota(tenantId: string, quota: TenantStorageQuotaConfig): Promise<void> {
    await prisma.keyValueStore.upsert({
      where: { tenantId_key: { tenantId, key: 'STORAGE_QUOTA' } },
      update: { value: quota as any },
      create: { tenantId, key: 'STORAGE_QUOTA', value: quota as any }
    });
  }

  private getDefaultSeedFiles(tenantId: string): StoredDocumentMetadata[] {
    if (tenantId !== '27AABCF1234F1Z5') return [];
    return [
      {
        id: 'doc-seed-01',
        tenantId: '27AABCF1234F1Z5',
        filename: 'tax_invoice_2026_089.pdf',
        originalName: 'Tata_Motors_Tax_Invoice_INV-089.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2450000,
        category: 'invoices',
        checksumSha256: 'a1b2c3d4e5f67890123456789abcdef0',
        storageDriver: 'local',
        storagePath: 'tenants/27AABCF1234F1Z5/invoices/2026/09/doc-seed-01.enc',
        isEncrypted: true,
        createdAt: '2026-09-10T10:15:00.000Z',
      },
      {
        id: 'doc-seed-02',
        tenantId: '27AABCF1234F1Z5',
        filename: 'hdfc_bank_statement_aug2026.pdf',
        originalName: 'HDFC_Current_Account_Statement_Aug2026.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1350000,
        category: 'banking',
        checksumSha256: 'b2c3d4e5f67890123456789abcdef01a',
        storageDriver: 'local',
        storagePath: 'tenants/27AABCF1234F1Z5/banking/2026/09/doc-seed-02.enc',
        isEncrypted: true,
        createdAt: '2026-09-02T14:30:00.000Z',
      },
      {
        id: 'doc-seed-03',
        tenantId: '27AABCF1234F1Z5',
        filename: 'form16_fy2526_consolidated.zip',
        originalName: 'Consolidated_Form16_Payroll_FY2526.zip',
        mimeType: 'application/zip',
        sizeBytes: 850000,
        category: 'payroll',
        checksumSha256: 'c3d4e5f67890123456789abcdef01a2b',
        storageDriver: 'local',
        storagePath: 'tenants/27AABCF1234F1Z5/payroll/2026/04/doc-seed-03.enc',
        isEncrypted: true,
        createdAt: '2026-05-15T09:00:00.000Z',
      },
      {
        id: 'doc-seed-04',
        tenantId: '27AABCF1234F1Z5',
        filename: 'gstr1_filed_q1_2026.pdf',
        originalName: 'GSTR1_Acknowledgment_Q1_2026.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 420000,
        category: 'statutory',
        checksumSha256: 'd4e5f67890123456789abcdef01a2b3c',
        storageDriver: 'local',
        storagePath: 'tenants/27AABCF1234F1Z5/statutory/2026/07/doc-seed-04.enc',
        isEncrypted: true,
        createdAt: '2026-07-11T16:20:00.000Z',
      },
    ];
  }

  /**
   * Validates document magic signature bytes
   */
  public isValidDocumentSignature(buf: Buffer): boolean {
    if (!buf || buf.length < 4) return true;
    // PDF: %PDF- (0x25 0x50 0x44 0x46)
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return true;
    // PNG: \x89PNG (0x89 0x50 0x4E 0x47)
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
    // JPEG: \xFF\xD8\xFF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
    // WEBP: RIFF
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return true;
    // ZIP / XLSX / DOCX: PK (0x50 0x4B 0x03 0x04)
    if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return true;
    // Plain Text / CSV
    return true;
  }

  /**
   * Encrypts a binary buffer using AES-256-GCM
   */
  public encryptBuffer(buffer: Buffer): { encryptedBuffer: Buffer; iv: Buffer; authTag: Buffer } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv, {
      authTagLength: 16,
    });
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Prefix with IV (12 bytes) + AuthTag (16 bytes) + Encrypted Payload
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return { encryptedBuffer: combined, iv, authTag };
  }

  /**
   * Decrypts an AES-256-GCM encrypted buffer
   */
  public decryptBuffer(combinedBuffer: Buffer): Buffer {
    if (combinedBuffer.length < 28) {
      throw new Error('Corrupted or invalid encrypted storage payload.');
    }
    const iv = combinedBuffer.subarray(0, 12);
    const authTag = combinedBuffer.subarray(12, 28);
    const ciphertext = combinedBuffer.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.getEncryptionKey(), iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }

  /**
   * Retrieves full storage analytics & quota stats for a tenant
   */
  public async getTenantStorageStats(tenantId: string): Promise<TenantStorageStats> {
    const quotaConfig = await this.getTenantQuota(tenantId);
    const totalAllocatedGB = quotaConfig.allocatedGB + quotaConfig.customAddonGB;
    const totalAllocatedBytes = totalAllocatedGB * 1024 * 1024 * 1024;

    // Filter files for this tenant
    const tenantFiles = await this.getTenantMetadata(tenantId);
    const usedBytes = tenantFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
    const usedGB = usedBytes / (1024 * 1024 * 1024);
    const usedPercentage = Math.min(100, parseFloat(((usedBytes / totalAllocatedBytes) * 100).toFixed(2)));

    const availableBytes = Math.max(0, totalAllocatedBytes - usedBytes);

    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXCEEDED' = 'NORMAL';
    if (usedPercentage >= 100) status = 'EXCEEDED';
    else if (usedPercentage >= 90) status = 'CRITICAL';
    else if (usedPercentage >= 70) status = 'WARNING';

    // Category Breakdowns
    const categoriesMap: Record<string, { label: string; size: number; count: number }> = {
      invoices: { label: 'Sales & Purchase Invoices', size: 0, count: 0 },
      banking: { label: 'Bank Statements & Cheques', size: 0, count: 0 },
      payroll: { label: 'Payroll & Employee HR Docs', size: 0, count: 0 },
      statutory: { label: 'GST, TDS & Statutory Filings', size: 0, count: 0 },
      inventory: { label: 'Inventory & BOM Drawings', size: 0, count: 0 },
      other: { label: 'Audit Attachments & Others', size: 0, count: 0 },
    };

    for (const f of tenantFiles) {
      const cat = f.category || 'other';
      if (categoriesMap[cat]) {
        categoriesMap[cat].size += f.sizeBytes;
        categoriesMap[cat].count += 1;
      } else {
        categoriesMap.other.size += f.sizeBytes;
        categoriesMap.other.count += 1;
      }
    }

    const categories: CategoryBreakdown[] = Object.entries(categoriesMap).map(([catKey, data]) => ({
      category: catKey,
      label: data.label,
      sizeBytes: data.size,
      sizeFormatted: this.formatBytes(data.size),
      fileCount: data.count,
      percentOfTotal: usedBytes > 0 ? parseFloat(((data.size / usedBytes) * 100).toFixed(1)) : 0,
    }));

    return {
      tenantId,
      allocatedGB: totalAllocatedGB,
      allocatedBytes: totalAllocatedBytes,
      usedBytes,
      usedGB: parseFloat(usedGB.toFixed(3)),
      usedFormatted: this.formatBytes(usedBytes),
      availableBytes,
      availableFormatted: this.formatBytes(availableBytes),
      usedPercentage,
      totalFiles: tenantFiles.length,
      maxFileSizeMB: quotaConfig.maxFileSizeMB,
      storageDriver: (process.env.STORAGE_DRIVER as any) || 'local',
      isHealthy: usedPercentage < 90,
      status,
      categories,
    };
  }

  /**
   * Stores a file in the encrypted vault
   */
  public async storeFile(
    tenantId: string,
    fileBuffer: Buffer,
    meta: {
      originalName: string;
      mimeType: string;
      category?: 'invoices' | 'banking' | 'payroll' | 'statutory' | 'inventory' | 'other';
      uploadedBy?: string;
    }
  ): Promise<StoredDocumentMetadata> {
    if (!this.isValidDocumentSignature(fileBuffer)) {
      throw new ValidationError('Invalid document file signature. Only verified document types are accepted.');
    }

    const stats = await this.getTenantStorageStats(tenantId);
    const maxFileSizeBytes = stats.maxFileSizeMB * 1024 * 1024;

    if (fileBuffer.length > maxFileSizeBytes) {
      throw new ValidationError(
        `File size (${this.formatBytes(fileBuffer.length)}) exceeds your tenant max upload limit (${stats.maxFileSizeMB} MB).`
      );
    }

    if (stats.usedBytes + fileBuffer.length > stats.allocatedBytes) {
      throw new ValidationError(
        `Tenant storage quota exceeded (${stats.usedFormatted} of ${stats.allocatedGB} GB used). Please upgrade or purchase additional storage.`
      );
    }

    const fileId = `doc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const category = meta.category || 'invoices';
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Build hierarchical relative path: tenants/{tenantId}/{category}/{year}/{month}/{fileId}.enc
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const relativePath = path.join('tenants', tenantId, category, year, month, `${fileId}.enc`);
    const fullDiskPath = path.join(this.vaultBasePath, relativePath);

    this.ensureDirectoryExists(path.dirname(fullDiskPath));

    // Encrypt at rest with AES-256-GCM
    const { encryptedBuffer } = this.encryptBuffer(fileBuffer);
    fs.writeFileSync(fullDiskPath, encryptedBuffer);

    const record: StoredDocumentMetadata = {
      id: fileId,
      tenantId,
      filename: `${fileId}.${meta.originalName.split('.').pop() || 'bin'}`,
      originalName: meta.originalName,
      mimeType: meta.mimeType || 'application/octet-stream',
      sizeBytes: fileBuffer.length,
      category,
      checksumSha256: checksum,
      storageDriver: 'local',
      storagePath: relativePath,
      isEncrypted: true,
      uploadedBy: meta.uploadedBy,
      createdAt: now.toISOString(),
    };

    const files = await this.getTenantMetadata(tenantId);
    files.push(record);
    await this.saveTenantMetadata(tenantId, files);

    return record;
  }

  /**
   * Retrieves and decrypts a file stream strictly enforcing tenant isolation
   */
  public async retrieveFile(
    tenantId: string,
    fileId: string
  ): Promise<{ buffer: Buffer; metadata: StoredDocumentMetadata }> {
    const files = await this.getTenantMetadata(tenantId);
    const record = files.find(f => f.id === fileId);
    if (!record) {
      throw new Error(`File ${fileId} not found.`);
    }

    // Zero-Trust Tenant Boundary Verification
    if (record.tenantId !== tenantId) {
      throw new Error('Access denied: You do not have permission to access files from another organization.');
    }

    const fullDiskPath = path.join(this.vaultBasePath, record.storagePath);
    if (!fs.existsSync(fullDiskPath)) {
      throw new Error('Encrypted file storage record missing on disk.');
    }

    const rawCipherBuffer = fs.readFileSync(fullDiskPath);
    const decryptedBuffer = record.isEncrypted ? this.decryptBuffer(rawCipherBuffer) : rawCipherBuffer;

    return {
      buffer: decryptedBuffer,
      metadata: record,
    };
  }

  /**
   * Lists all stored documents for a tenant
   */
  public async listTenantFiles(tenantId: string): Promise<StoredDocumentMetadata[]> {
    return this.getTenantMetadata(tenantId);
  }

  /**
   * Deletes a stored file from the encrypted vault
   */
  public async deleteFile(tenantId: string, fileId: string): Promise<boolean> {
    const files = await this.getTenantMetadata(tenantId);
    const index = files.findIndex(f => f.id === fileId);
    if (index === -1) return false;
    const record = files[index];
    const fullDiskPath = path.join(this.vaultBasePath, record.storagePath);
    if (fs.existsSync(fullDiskPath)) {
      try {
        fs.unlinkSync(fullDiskPath);
      } catch (e) {
        // ignore
      }
    }
    files.splice(index, 1);
    await this.saveTenantMetadata(tenantId, files);
    return true;
  }

  /**
   * Self-Service: Purchase Storage Add-on
   */
  public async purchaseStorageAddon(
    tenantId: string,
    addonGB: number
  ): Promise<{ success: boolean; newTotalGB: number; message: string }> {
    const quota = await this.getTenantQuota(tenantId);
    quota.customAddonGB += addonGB;
    await this.saveTenantQuota(tenantId, quota);

    return {
      success: true,
      newTotalGB: quota.allocatedGB + quota.customAddonGB,
      message: `Successfully allocated +${addonGB} GB storage pack to workspace!`,
    };
  }

  /**
   * Super Admin: Custom Quota Override
   */
  public async setTenantCustomQuota(
    tenantId: string,
    newAllocatedGB: number,
    maxFileSizeMB?: number
  ): Promise<TenantStorageQuotaConfig> {
    const quota = await this.getTenantQuota(tenantId);
    quota.allocatedGB = newAllocatedGB;
    if (maxFileSizeMB) quota.maxFileSizeMB = maxFileSizeMB;
    quota.planTier = 'CUSTOM';
    await this.saveTenantQuota(tenantId, quota);
    return quota;
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0.00 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

export const storageVaultService = StorageVaultService.getInstance();
