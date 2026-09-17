import argon2 from 'argon2';

/**
 * Argon2id Password Hashing Engine
 * Configured according to OWASP guidelines:
 * - type: Argon2id (hybrid version resistant to side-channel and GPU cracking)
 * - memoryCost: 65536 KB (64 MB)
 * - timeCost: 3 iterations
 * - parallelism: 4 threads
 */
export class PasswordService {
  private static readonly OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
  };

  /**
   * Hashes a raw plaintext password using Argon2id
   */
  public static async hash(password: string): Promise<string> {
    return argon2.hash(password, this.OPTIONS);
  }

  /**
   * Verifies a plaintext password against a stored Argon2id hash
   */
  public static async verify(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch {
      return false;
    }
  }

  /**
   * Checks if a password hash needs to be rehashed due to updated cost parameters
   */
  public static needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, this.OPTIONS);
  }
}
