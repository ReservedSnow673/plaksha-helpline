import { describe, expect, it } from 'vitest';

import { generatePublicCode, isPublicCodeFormat } from '../public-code';

describe('public-code', () => {
  it('generates a 4-char code with prefix', () => {
    const code = generatePublicCode();
    expect(code).toMatch(/^PLK-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(isPublicCodeFormat(code)).toBe(true);
  });

  it('produces unique codes across many calls', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) codes.add(generatePublicCode());
    expect(codes.size).toBeGreaterThan(990);
  });

  it('rejects malformed codes', () => {
    expect(isPublicCodeFormat('PLK-ABC')).toBe(false);
    expect(isPublicCodeFormat('plk-abcd')).toBe(false);
    expect(isPublicCodeFormat('PLK-OOOO')).toBe(false);
  });
});
