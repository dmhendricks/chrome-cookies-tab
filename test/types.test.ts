import { describe, expect, it } from 'vitest';
import { cookieKey } from '../src/panel/types';

describe('cookieKey', () => {
  it('combines storeId, domain, path, name into a stable key', () => {
    const key = cookieKey({ storeId: '0', domain: 'example.com', path: '/', name: 'sid' });
    expect(key).toContain('example.com');
    expect(key).toContain('sid');
    expect(key).toContain('/');
    expect(key.startsWith('0')).toBe(true);
  });

  it('distinguishes cookies that differ only by storeId', () => {
    const base = { domain: 'example.com', path: '/', name: 'sid' };
    expect(cookieKey({ ...base, storeId: '0' })).not.toBe(
      cookieKey({ ...base, storeId: '1' }),
    );
  });

  it('distinguishes cookies that differ only by path', () => {
    const base = { storeId: '0', domain: 'example.com', name: 'sid' };
    expect(cookieKey({ ...base, path: '/' })).not.toBe(
      cookieKey({ ...base, path: '/admin' }),
    );
  });
});
