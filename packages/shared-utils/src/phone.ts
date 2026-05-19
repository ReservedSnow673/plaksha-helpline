import { createHash } from 'node:crypto';

const E164_RE = /^\+[1-9]\d{6,14}$/;

export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (input.startsWith('+') && E164_RE.test(input)) return input;
  return null;
}

export function isE164(input: string): boolean {
  return E164_RE.test(input);
}

/**
 * Deterministic hash for phone-lookup sidecar column (encrypted main column).
 * Use a per-deployment pepper to prevent rainbow-table reversal.
 */
export function hashPhone(phoneE164: string, pepper: string): string {
  return createHash('sha256').update(`${pepper}:${phoneE164}`).digest('hex');
}
