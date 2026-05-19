import { describe, expect, it } from 'vitest';

import { hashPhone, isE164, normalizeIndianPhone } from '../phone';

describe('phone', () => {
  it('normalizes a 10-digit Indian number to E.164', () => {
    expect(normalizeIndianPhone('9876543210')).toBe('+919876543210');
    expect(normalizeIndianPhone('98765-43210')).toBe('+919876543210');
  });

  it('accepts already E.164 numbers', () => {
    expect(normalizeIndianPhone('+919876543210')).toBe('+919876543210');
  });

  it('rejects invalid numbers', () => {
    expect(normalizeIndianPhone('12345')).toBe(null);
    expect(normalizeIndianPhone('+9119999999999999')).toBe(null);
  });

  it('validates E.164', () => {
    expect(isE164('+919876543210')).toBe(true);
    expect(isE164('9876543210')).toBe(false);
  });

  it('hashes phone deterministically per pepper', () => {
    const a = hashPhone('+919876543210', 'pepper1');
    const b = hashPhone('+919876543210', 'pepper1');
    const c = hashPhone('+919876543210', 'pepper2');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
