import { randomBytes } from 'node:crypto';

// Crockford Base32 alphabet — excludes I, L, O, U for readability and phone-pronounceability.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_LEN = 4;

/**
 * Generates a short human-pronounceable incident code such as `PLK-A4F2`.
 * 32^4 = ~1M slots per prefix. Collisions checked at DB unique constraint.
 */
export function generatePublicCode(prefix = 'PLK'): string {
  let code = '';
  const bytes = randomBytes(CODE_LEN);  for (let i = 0; i < CODE_LEN; i++) {
    code += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return `${prefix}-${code}`;
}

export function isPublicCodeFormat(code: string): boolean {
  return /^[A-Z]{2,4}-[0-9A-HJKMNP-TV-Z]{4,6}$/.test(code);
}
