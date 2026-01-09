import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { env } from '~/env';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = env.ENCRYPTION_SECRET as string; // 32-byte key (base64 or hex)

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'base64'),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all base64)
  return [iv, authTag, encrypted].map((b) => b.toString('base64')).join(':');
}

export function decrypt(ciphertext: string): string {
  const [iv, authTag, encrypted] = ciphertext
    .split(':')
    .map((s) => Buffer.from(s, 'base64'));

  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'base64'),
    iv!
  );
  decipher.setAuthTag(authTag!);

  return decipher.update(encrypted!).toString('utf-8') + decipher.final('utf8');
}
