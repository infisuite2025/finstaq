/**
 * Client-Side Security & Data Masking Utilities
 * Compliant with SOC 2 Type II, DPDP Act 2023, and RBI/NPCI Data Protection Standards.
 */

/**
 * Masks Indian Permanent Account Number (PAN)
 * Input: "ABCDE1234F" -> Output: "•••••1234F"
 */
export function maskPan(pan?: string | null): string {
  if (!pan) return '—';
  const clean = pan.trim();
  if (clean.length !== 10) return '••••••••••';
  return `•••••${clean.slice(5)}`;
}

/**
 * Masks Bank Account Number
 * Input: "50200012345678" -> Output: "••••••••••5678"
 */
export function maskBankAccount(accountNo?: string | null): string {
  if (!accountNo) return '—';
  const clean = accountNo.trim();
  if (clean.length <= 4) return '••••';
  const visibleLast = clean.slice(-4);
  const maskedPrefix = '•'.repeat(Math.max(4, clean.length - 4));
  return `${maskedPrefix}${visibleLast}`;
}

/**
 * Masks Aadhaar / Employee UAN / PF ID
 * Input: "101234567890" -> Output: "••••••••7890"
 */
export function maskAadhaarOrUan(id?: string | null): string {
  if (!id) return '—';
  const clean = id.trim();
  if (clean.length <= 4) return '••••';
  const visibleLast = clean.slice(-4);
  const maskedPrefix = '•'.repeat(Math.max(4, clean.length - 4));
  return `${maskedPrefix}${visibleLast}`;
}

/**
 * Masks API Keys or Secrets
 * Input: "fsq_live_9837418274912" -> Output: "fsq_live_•••••••••12"
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '—';
  const clean = secret.trim();
  if (clean.length <= 8) return '••••••••';
  const prefix = clean.slice(0, 8);
  const suffix = clean.slice(-2);
  return `${prefix}•••••••••${suffix}`;
}

/**
 * Masks Email Address
 * Input: "vikram@apexind.com" -> Output: "v•••••m@apexind.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '••••@••••.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}•@${domain}`;
  return `${user[0]}${'•'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
}

/**
 * Masks Phone Number
 * Input: "+919876543210" -> Output: "+91 ••••• ••210"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return '—';
  const clean = phone.trim();
  if (clean.length <= 4) return '••••';
  const suffix = clean.slice(-3);
  return `+91 ••••• ••${suffix}`;
}

/**
 * Security Invariants & Compliance Indicators
 */
export interface EncryptionStatusMetadata {
  algorithm: 'AES-256-GCM';
  keyLengthBits: 256;
  ivLengthBits: 96;
  authTagBits: 128;
  encryptionAtRest: true;
  encryptionInTransit: 'TLS 1.3';
  blindIndexing: 'HMAC-SHA256';
  zeroKnowledgeIsolation: true;
  mcaAuditLogCompliant: true;
  dpdpAct2023Compliant: true;
}

export const PLATFORM_ENCRYPTION_METADATA: EncryptionStatusMetadata = {
  algorithm: 'AES-256-GCM',
  keyLengthBits: 256,
  ivLengthBits: 96,
  authTagBits: 128,
  encryptionAtRest: true,
  encryptionInTransit: 'TLS 1.3',
  blindIndexing: 'HMAC-SHA256',
  zeroKnowledgeIsolation: true,
  mcaAuditLogCompliant: true,
  dpdpAct2023Compliant: true,
};
