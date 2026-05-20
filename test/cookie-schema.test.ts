import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import {
  CookieSchema,
  CookieImportSchema,
  IncomingCookieSchema,
  MAX_IMPORT_COOKIES,
  MAX_IMPORT_VALUE_BYTES,
} from '../src/shared/cookie-schema';

const validCookie = {
  name: 'sid',
  value: 'abc',
  domain: 'example.com',
  path: '/',
  secure: true,
  httpOnly: false,
  hostOnly: false,
  session: false,
  expirationDate: 1_700_000_000,
  sameSite: 'lax' as const,
  storeId: '0',
};

describe('CookieSchema', () => {
  it('accepts a well-formed cookie', () => {
    expect(v.is(CookieSchema, validCookie)).toBe(true);
  });

  it('accepts cookies without expirationDate (session cookies)', () => {
    const { expirationDate: _e, ...rest } = validCookie;
    expect(v.is(CookieSchema, rest)).toBe(true);
  });

  it('rejects unknown sameSite values', () => {
    expect(v.is(CookieSchema, { ...validCookie, sameSite: 'bogus' })).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { name: _n, ...rest } = validCookie;
    expect(v.is(CookieSchema, rest)).toBe(false);
  });
});

describe('IncomingCookieSchema', () => {
  it('preserves required fields and tolerates unknown ones', () => {
    const result = v.parse(IncomingCookieSchema, {
      ...validCookie,
      futureField: 'whatever',
    });
    expect(result.name).toBe('sid');
    expect((result as Record<string, unknown>).futureField).toBe('whatever');
  });
});

describe('CookieImportSchema', () => {
  it('accepts an array of valid cookies', () => {
    expect(v.is(CookieImportSchema, [validCookie, validCookie])).toBe(true);
  });

  it('strips the UI-only id field gracefully (it is optional)', () => {
    expect(v.is(CookieImportSchema, [{ ...validCookie, id: 'ui-id' }])).toBe(true);
  });

  it(`rejects imports exceeding ${MAX_IMPORT_COOKIES} cookies`, () => {
    const tooMany = Array.from({ length: MAX_IMPORT_COOKIES + 1 }, () => validCookie);
    expect(v.is(CookieImportSchema, tooMany)).toBe(false);
  });

  it(`rejects cookies whose value exceeds ${MAX_IMPORT_VALUE_BYTES} bytes`, () => {
    const huge = { ...validCookie, value: 'x'.repeat(MAX_IMPORT_VALUE_BYTES + 1) };
    expect(v.is(CookieImportSchema, [huge])).toBe(false);
  });

  it('counts bytes, not characters, for the value limit', () => {
    // '🍪' is 4 bytes in UTF-8. Fill up to the limit exactly.
    const cookieCount = MAX_IMPORT_VALUE_BYTES / 4;
    const justFits = { ...validCookie, value: '🍪'.repeat(cookieCount) };
    expect(v.is(CookieImportSchema, [justFits])).toBe(true);
    const overflows = { ...validCookie, value: '🍪'.repeat(cookieCount + 1) };
    expect(v.is(CookieImportSchema, [overflows])).toBe(false);
  });
});
