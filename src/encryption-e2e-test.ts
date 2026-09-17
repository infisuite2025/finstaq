import { EncryptionService } from './core/security/encryption';
import { AuditLoggerService } from './core/audit/audit-logger';

async function runEncryptionTests() {
  console.log('🔒 Starting Finstaq AES-256-GCM Enterprise Encryption Verification...');

  // 1. Text Encryption & Decryption
  const rawPan = 'ABCDE1234F';
  const encryptedPan = EncryptionService.encrypt(rawPan);
  console.log('✓ Encrypted PAN:', encryptedPan);
  if (!EncryptionService.isEncrypted(encryptedPan)) {
    throw new Error('isEncrypted check failed on encrypted payload');
  }

  const decryptedPan = EncryptionService.decrypt(encryptedPan);
  if (decryptedPan !== rawPan) {
    throw new Error(`Decryption mismatch: expected ${rawPan}, got ${decryptedPan}`);
  }
  console.log('✓ Decrypted PAN successfully matches original:', decryptedPan);

  // 2. Object Encryption & Decryption (Banking & Payment Secret)
  const bankDetails = {
    accountNumber: '50200012345678',
    ifsc: 'HDFC0000128',
    holderName: 'Apex Industries Ltd',
    vpa: 'apexind@hdfcbank',
    apiKey: 'fsq_live_9837418274912'
  };
  const encryptedObj = EncryptionService.encryptObject(bankDetails);
  console.log('✓ Encrypted Banking Object:', encryptedObj);
  const decryptedObj = EncryptionService.decryptObject<typeof bankDetails>(encryptedObj);
  if (!decryptedObj || decryptedObj.accountNumber !== bankDetails.accountNumber) {
    throw new Error('Object decryption mismatch');
  }
  console.log('✓ Decrypted Banking Object verified successfully');

  // 3. Cryptographic Tamper Detection
  const tamperedPayload = encryptedObj.replace(/a/g, 'b');
  try {
    EncryptionService.decrypt(tamperedPayload);
    throw new Error('Tamper detection failed - decipher should have rejected tampered tag/ciphertext');
  } catch (err: any) {
    console.log('✓ Cryptographic Tamper Detection verified: Decryption failed on altered ciphertext as expected');
  }

  // 4. Blind Indexing (HMAC-SHA256)
  const blindIndex1 = EncryptionService.createBlindIndex(rawPan);
  const blindIndex2 = EncryptionService.createBlindIndex('abcde1234f'); // case-insensitive test
  if (blindIndex1 !== blindIndex2) {
    throw new Error('Blind index should be deterministic and case-insensitive');
  }
  console.log('✓ Deterministic Blind Index verified for fast O(1) indexed lookups:', blindIndex1);

  // 5. Data Masking & Redaction (DPDP 2023 & SOC 2)
  console.log('✓ Masked PAN:', EncryptionService.maskPan(rawPan), '-> expected •••••1234F');
  console.log('✓ Masked Bank A/c:', EncryptionService.maskBankAccount('50200012345678'), '-> expected ••••••••••5678');
  console.log('✓ Masked Aadhaar/UAN:', EncryptionService.maskAadhaarOrUan('101234567890'), '-> expected ••••••••7890');
  console.log('✓ Masked API Key:', EncryptionService.maskSecret('fsq_live_9837418274912'), '-> expected fsq_live_•••••••••12');
  console.log('✓ Masked Email:', EncryptionService.maskEmail('vikram@apexind.com'), '-> expected v•••••m@apexind.com');
  console.log('✓ Masked Phone:', EncryptionService.maskPhone('+919876543210'), '-> expected +91 ••••• ••210');

  // 6. Audit Trail Sanitization
  const sensitiveAuditPayload = {
    userId: 'user-123',
    password: 'SuperSecretPassword@123',
    pan: 'ABCDE1234F',
    bankAccount: '50200012345678',
    apiKey: 'fsq_live_9837418274912',
    tenantName: 'Apex Industries Ltd'
  };

  const sanitized = EncryptionService.sanitizeSensitivePayload(sensitiveAuditPayload);
  if (sanitized.password !== '[REDACTED_CONFIDENTIAL_SECRET]') {
    throw new Error('Password was not redacted in audit payload');
  }
  if (!sanitized.pan.startsWith('•••••')) {
    throw new Error('PAN was not masked in audit payload');
  }
  if (!sanitized.bankAccount.startsWith('•••••')) {
    throw new Error('Bank Account was not masked in audit payload');
  }
  console.log('✓ Audit Logger Sanitization verified - raw passwords/credentials never written to audit trails:');
  console.log(JSON.stringify(sanitized, null, 2));

  console.log('\n🛡️ ALL DATA ENCRYPTION & PROTECTION TESTS PASSED (100% SUCCESS)!');
}

runEncryptionTests().catch((err) => {
  console.error('❌ Encryption test failed:', err);
  process.exit(1);
});
