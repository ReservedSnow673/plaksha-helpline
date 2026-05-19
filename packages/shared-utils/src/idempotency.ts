import { randomBytes } from 'node:crypto';

export function generateIdempotencyKey(prefix = 'idem'): string {
  return `${prefix}_${randomBytes(16).toString('hex')}`;
}

export function isIdempotencyKey(value: string): boolean {
  return /^[a-zA-Z0-9_\-:.]{8,128}$/.test(value);
}
