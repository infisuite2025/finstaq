import crypto from 'crypto';
import { env } from '../../config/env';

/**
 * AES-256-GCM Field-Level & Payload Encryption Service
 * Ensures strict confidentiality, integrity, and authenticity of sensitive data at rest
 * compliant with SOC 2 Type II, Indian DPDP Act 2023, and RBI/NPCI guidelines.
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits recommended for AES-GCM
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits auth tag for cryptographic integrity

  private static getKey(): Buffer {
    return Buffer.from(env.FIELD_ENCRYPTION_KEY, 'hex');
  }

  /**
   * Encrypts plaintext string into an authenticated serialized payload:
   * Format: <iv_hex>:<authTag_hex>:<encrypted_hex>
   */
  public static encrypt(plainText: string): string {
    if (plainText === null || plainText === undefined) return '';
    const str = String(plainText);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.getKey(), iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a serialized payload back to plaintext string.
   * Throws error if payload is tampered with or corrupted.
   */
  public static decrypt(cipherPayload: string): string {
    if (!cipherPayload) return '';

    const parts = cipherPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format: Expected <iv>:<authTag>:<cipher>');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.getKey(), iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Safely decrypts a payload if it is encrypted, or returns the original string if it is plain text.
   */
  public static safeDecrypt(payload: string): string {
    if (!payload) return '';
    if (this.isEncrypted(payload)) {
      try {
        return this.decrypt(payload);
      } catch (_err) {
        return payload;
      }
    }
    return payload;
  }

  /**
   * Checks whether a string matches the AES-256-GCM serialized format.
   */
  public static isEncrypted(payload: string): boolean {
    if (!payload || typeof payload !== 'string') return false;
    const parts = payload.split(':');
    if (parts.length !== 3) return false;
    // IV (12 bytes = 24 hex chars), Auth Tag (16 bytes = 32 hex chars)
    return parts[0].length === 24 && parts[1].length === 32 && /^[0-9a-fA-F]+$/.test(parts[0]) && /^[0-9a-fA-F]+$/.test(parts[1]);
  }

  /**
   * Encrypts any structured JSON object into an authenticated AES-256-GCM payload.
   */
  public static encryptObject<T>(obj: T): string {
    if (obj === null || obj === undefined) return '';
    const jsonStr = JSON.stringify(obj);
    return this.encrypt(jsonStr);
  }

  /**
   * Decrypts an authenticated AES-256-GCM payload back into a typed JSON object.
   */
  public static decryptObject<T>(cipherPayload: string): T | null {
    if (!cipherPayload) return null;
    const jsonStr = this.decrypt(cipherPayload);
    try {
      return JSON.parse(jsonStr) as T;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Creates a deterministic HMAC-SHA256 Blind Index for fast searchable encrypted columns.
   * Allows O(1) indexed database lookups for encrypted PANs or Bank Accounts without decrypting.
   */
  public static createBlindIndex(value: string, salt = 'finstaq-blind-idx'): string {
    if (!value) return '';
    const normalized = value.trim().toUpperCase();
    const hmac = crypto.createHmac('sha256', this.getKey());
    hmac.update(`${salt}:${normalized}`);
    return hmac.digest('hex');
  }

  // =========================================================================
  // DATA MASKING & REDACTION UTILITIES (DPDP Act 2023 & SOC 2 Compliance)
  // =========================================================================

  /**
   * Masks Indian PAN: e.g. "ABCDE1234F" -> "•••••1234F"
   */
  public static maskPan(pan?: string | null): string {
    if (!pan) return '';
    const clean = pan.trim();
    if (clean.length !== 10) return '••••••••••';
    return `•••••${clean.slice(5)}`;
  }

  /**
   * Masks Bank Account Number: e.g. "50200012345678" -> "••••••••••5678"
   */
  public static maskBankAccount(account?: string | null): string {
    if (!account) return '';
    const clean = account.trim();
    if (clean.length <= 4) return '••••';
    const visibleLast = clean.slice(-4);
    const maskedPrefix = '•'.repeat(Math.max(4, clean.length - 4));
    return `${maskedPrefix}${visibleLast}`;
  }

  /**
   * Masks Aadhaar / UAN / PF: e.g. "101234567890" -> "••••••••7890"
   */
  public static maskAadhaarOrUan(id?: string | null): string {
    if (!id) return '';
    const clean = id.trim();
    if (clean.length <= 4) return '••••';
    const visibleLast = clean.slice(-4);
    const maskedPrefix = '•'.repeat(Math.max(4, clean.length - 4));
    return `${maskedPrefix}${visibleLast}`;
  }

  /**
   * Masks API Keys / Secrets: e.g. "fsq_live_9837418274912" -> "fsq_live_•••••••••12"
   */
  public static maskSecret(secret?: string | null): string {
    if (!secret) return '';
    const clean = secret.trim();
    if (clean.length <= 8) return '••••••••';
    const prefix = clean.slice(0, 8);
    const suffix = clean.slice(-2);
    return `${prefix}•••••••••${suffix}`;
  }

  /**
   * Masks Email: e.g. "vikram@apexind.com" -> "v•••••m@apexind.com"
   */
  public static maskEmail(email?: string | null): string {
    if (!email || !email.includes('@')) return '••••@••••.com';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user[0]}•@${domain}`;
    return `${user[0]}${'•'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
  }

  /**
   * Masks Phone: e.g. "+91 98765 43210" -> "+91 ••••• ••210"
   */
  public static maskPhone(phone?: string | null): string {
    if (!phone) return '';
    const clean = phone.trim();
    if (clean.length <= 4) return '••••';
    const suffix = clean.slice(-3);
    return `+91 ••••• ••${suffix}`;
  }

  /**
   * Deep recursive sanitizer that masks or redacts all sensitive keys
   * before logging, caching, or diffing.
   */
  public static sanitizeSensitivePayload(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeSensitivePayload(item));
    }

    const sensitiveKeyPatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /apiKey/i,
      /authTag/i,
      /privateKey/i,
      /cvv/i,
      /pin/i,
    ];

    const maskedKeyPatterns = [
      { regex: /pan/i, mask: (val: any) => this.maskPan(String(val)) },
      { regex: /(bankAccount|accountNo|acctNo)/i, mask: (val: any) => this.maskBankAccount(String(val)) },
      { regex: /(uan|aadhaar|pfNumber|esicNumber)/i, mask: (val: any) => this.maskAadhaarOrUan(String(val)) },
    ];

    const sanitized: Record<string, any> = {};

    for (const [key, val] of Object.entries(obj)) {
      if (val === null || val === undefined) {
        sanitized[key] = val;
        continue;
      }

      // 1. Redact credentials/passwords completely
      if (sensitiveKeyPatterns.some((pattern) => pattern.test(key))) {
        sanitized[key] = '[REDACTED_CONFIDENTIAL_SECRET]';
        continue;
      }

      // 2. Mask PII identifiers
      const matchedMask = maskedKeyPatterns.find((p) => p.regex.test(key));
      if (matchedMask && typeof val === 'string') {
        sanitized[key] = matchedMask.mask(val);
        continue;
      }

      // 3. Recurse into nested objects
      if (typeof val === 'object') {
        sanitized[key] = this.sanitizeSensitivePayload(val);
      } else {
        sanitized[key] = val;
      }
    }

    return sanitized;
  }
}

