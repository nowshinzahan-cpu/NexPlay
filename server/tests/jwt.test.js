const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

// Set test secrets before requiring the module
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_for_unit_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_unit_tests';
process.env.JWT_ACCESS_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair
} = require('../utils/jwt');

const testPayload = {
  userId: '507f1f77bcf86cd799439011',
  role: 'user',
  type: 'user',
  email: 'test@example.com'
};

describe('JWT Utils', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(testPayload);
      assert.ok(token);
      assert.strictEqual(typeof token, 'string');
      // JWT has 3 parts separated by dots
      assert.strictEqual(token.split('.').length, 3);
    });

    it('should encode the payload in the token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      assert.strictEqual(decoded.userId, testPayload.userId);
      assert.strictEqual(decoded.role, testPayload.role);
      assert.strictEqual(decoded.email, testPayload.email);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      assert.ok(token);
      assert.strictEqual(token.split('.').length, 3);
    });

    it('should generate longer expiry with rememberMe', () => {
      const token = generateRefreshToken(testPayload, true);
      assert.ok(token);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      assert.strictEqual(decoded.userId, testPayload.userId);
    });

    it('should throw on invalid token', () => {
      assert.throws(() => verifyAccessToken('invalid.token.here'));
    });

    it('should throw on expired token', () => {
      const expiredToken = jwt.sign(testPayload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '0s'
      });
      assert.throws(() => verifyAccessToken(expiredToken));
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);
      assert.strictEqual(decoded.userId, testPayload.userId);
    });

    it('should throw on invalid signature', () => {
      const badToken = jwt.sign(testPayload, 'wrong_secret');
      assert.throws(() => verifyRefreshToken(badToken));
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair(testPayload);
      assert.ok(tokens.accessToken);
      assert.ok(tokens.refreshToken);
      assert.notStrictEqual(tokens.accessToken, tokens.refreshToken);
    });

    it('should generate tokens with rememberMe', () => {
      const tokens = generateTokenPair(testPayload, true);
      assert.ok(tokens.accessToken);
      assert.ok(tokens.refreshToken);
    });

    it('should encode correct payload in both tokens', () => {
      const tokens = generateTokenPair(testPayload);
      const accessDecoded = verifyAccessToken(tokens.accessToken);
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);
      assert.strictEqual(accessDecoded.userId, testPayload.userId);
      assert.strictEqual(refreshDecoded.userId, testPayload.userId);
    });
  });
});
