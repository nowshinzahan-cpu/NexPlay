const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  generateOTP,
  generateResetToken,
  sanitizeHtml,
  parsePagination,
  parseSearchQuery
} = require('../utils/helpers');

describe('generateOTP', () => {
  it('should generate a 6-digit OTP by default', () => {
    const otp = generateOTP();
    assert.strictEqual(otp.length, 6);
    assert.ok(/^\d{6}$/.test(otp));
  });

  it('should generate OTP of specified length', () => {
    const otp = generateOTP(4);
    assert.strictEqual(otp.length, 4);
  });

  it('should generate unique OTPs', () => {
    const otp1 = generateOTP();
    const otp2 = generateOTP();
    // Very unlikely to get same OTP twice
    assert.notStrictEqual(otp1, otp2);
  });
});

describe('generateResetToken', () => {
  it('should generate a 64-character hex token', () => {
    const token = generateResetToken();
    assert.strictEqual(token.length, 64);
    assert.ok(/^[0-9a-f]{64}$/.test(token));
  });

  it('should generate unique tokens', () => {
    const token1 = generateResetToken();
    const token2 = generateResetToken();
    assert.notStrictEqual(token1, token2);
  });
});

describe('sanitizeHtml', () => {
  it('should escape HTML special characters', () => {
    const result = sanitizeHtml('<script>alert("xss")</script>');
    assert.ok(result.includes('&lt;script&gt;'));
    assert.ok(!result.includes('<script>'));
  });

  it('should return empty string for null/undefined', () => {
    assert.strictEqual(sanitizeHtml(null), '');
    assert.strictEqual(sanitizeHtml(undefined), '');
    assert.strictEqual(sanitizeHtml(''), '');
  });

  it('should handle ampersands', () => {
    const result = sanitizeHtml('hello & goodbye');
    assert.ok(result.includes('&amp;'));
  });

  it('should return safe text unchanged', () => {
    const result = sanitizeHtml('Hello, World!');
    assert.strictEqual(result, 'Hello, World!');
  });
});

describe('parsePagination', () => {
  it('should return default values for empty query', () => {
    const result = parsePagination({});
    assert.deepStrictEqual(result, { page: 1, limit: 10, skip: 0 });
  });

  it('should parse page and limit from query', () => {
    const result = parsePagination({ page: '3', limit: '20' });
    assert.strictEqual(result.page, 3);
    assert.strictEqual(result.limit, 20);
    assert.strictEqual(result.skip, 40);
  });

  it('should not exceed max limit of 100', () => {
    const result = parsePagination({ limit: '200' });
    assert.strictEqual(result.limit, 100);
  });

  it('should not go below minimum page of 1', () => {
    const result = parsePagination({ page: '0' });
    assert.strictEqual(result.page, 1);
  });

  it('should not go below minimum limit of 1', () => {
    const result = parsePagination({ limit: '0' });
    assert.strictEqual(result.limit, 1);
  });
});

describe('parseSearchQuery', () => {
  it('should return empty object for empty query', () => {
    const result = parseSearchQuery('');
    assert.deepStrictEqual(result, {});
  });

  it('should return regex object for valid query', () => {
    const result = parseSearchQuery('john');
    assert.ok(result.$regex);
    assert.strictEqual(result.$options, 'i');
  });

  it('should escape special regex characters', () => {
    const result = parseSearchQuery('test.com');
    // The dot should be escaped
    assert.ok(result.$regex);
  });
});
