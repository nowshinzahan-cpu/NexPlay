const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  validatePassword,
  validateEmail,
  validateUsername
} = require('../utils/password');

describe('validatePassword', () => {
  it('should return errors for empty password', () => {
    const errors = validatePassword('');
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.includes('required')));
  });

  it('should return errors for undefined password', () => {
    const errors = validatePassword(undefined);
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.includes('required')));
  });

  it('should return errors for password shorter than 8 characters', () => {
    const errors = validatePassword('Ab1!');
    assert.ok(errors.some((e) => e.includes('8 characters')));
  });

  it('should return error for password missing uppercase letter', () => {
    const errors = validatePassword('abcdef1!@');
    assert.ok(errors.some((e) => e.includes('uppercase')));
  });

  it('should return error for password missing lowercase letter', () => {
    const errors = validatePassword('ABCDEF1!@');
    assert.ok(errors.some((e) => e.includes('lowercase')));
  });

  it('should return error for password missing number', () => {
    const errors = validatePassword('Abcdefg!@');
    assert.ok(errors.some((e) => e.includes('number')));
  });

  it('should return error for password missing special character', () => {
    const errors = validatePassword('Abcdefg1');
    assert.ok(errors.some((e) => e.includes('special')));
  });

  it('should return empty errors for valid password', () => {
    const errors = validatePassword('Test@1234');
    assert.strictEqual(errors.length, 0);
  });

  it('should return empty errors for complex valid password', () => {
    const errors = validatePassword('Str0ng!Pass#2024');
    assert.strictEqual(errors.length, 0);
  });

  it('should return multiple errors for weak password', () => {
    const errors = validatePassword('weak');
    assert.ok(errors.length >= 4); // missing uppercase, lowercase, number, special
  });
});

describe('validateEmail', () => {
  it('should return error for empty email', () => {
    const error = validateEmail('');
    assert.ok(error.includes('required'));
  });

  it('should return error for undefined email', () => {
    const error = validateEmail(undefined);
    assert.ok(error.includes('required'));
  });

  it('should return error for invalid email format', () => {
    const error = validateEmail('notanemail');
    assert.ok(error.includes('Invalid email'));
  });

  it('should return error for email without domain', () => {
    const error = validateEmail('user@');
    assert.ok(error.includes('Invalid email'));
  });

  it('should return null for valid email', () => {
    const error = validateEmail('user@example.com');
    assert.strictEqual(error, null);
  });

  it('should return null for valid email with subdomain', () => {
    const error = validateEmail('user@sub.example.com');
    assert.strictEqual(error, null);
  });
});

describe('validateUsername', () => {
  it('should return error for empty username', () => {
    const error = validateUsername('');
    assert.ok(error.includes('required'));
  });

  it('should return error for too short username', () => {
    const error = validateUsername('ab');
    assert.ok(error.includes('3 and 30'));
  });

  it('should return error for too long username', () => {
    const error = validateUsername('a'.repeat(31));
    assert.ok(error.includes('3 and 30'));
  });

  it('should return error for invalid characters', () => {
    const error = validateUsername('user name!');
    assert.ok(error.includes('letters, numbers, and underscores'));
  });

  it('should return error for special characters', () => {
    const error = validateUsername('user@name');
    assert.ok(error.includes('letters, numbers, and underscores'));
  });

  it('should return null for valid username', () => {
    const error = validateUsername('john_doe');
    assert.strictEqual(error, null);
  });

  it('should return null for valid alphanumeric username', () => {
    const error = validateUsername('user123');
    assert.strictEqual(error, null);
  });
});
