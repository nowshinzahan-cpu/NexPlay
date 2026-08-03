const { describe, it, mock } = require('node:test');
const assert = require('node:assert');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

describe('sendSuccess', () => {
  it('should send 200 with success message by default', () => {
    const res = createMockRes();
    sendSuccess(res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Success');
  });

  it('should send custom status code', () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 }, 'Created', 201);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Created');
  });

  it('should include data in response', () => {
    const res = createMockRes();
    const data = { user: { id: '123', name: 'John' } };
    sendSuccess(res, data, 'User found');
    assert.deepStrictEqual(res.body.data, data);
  });

  it('should default data to empty object', () => {
    const res = createMockRes();
    sendSuccess(res);
    assert.deepStrictEqual(res.body.data, {});
  });
});

describe('sendError', () => {
  it('should send 500 with error message by default', () => {
    const res = createMockRes();
    sendError(res);
    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Internal Server Error');
  });

  it('should send custom status code and message', () => {
    const res = createMockRes();
    sendError(res, 'Not found', 404, 'NOT_FOUND');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'Not found');
  });

  it('should not include error in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = createMockRes();
    sendError(res, 'Error', 400, 'BAD_REQUEST');
    assert.strictEqual(res.body.error, undefined);
    process.env.NODE_ENV = originalEnv;
  });

  it('should include error code in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const res = createMockRes();
    sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR');
    assert.strictEqual(res.body.error, 'VALIDATION_ERROR');
    process.env.NODE_ENV = originalEnv;
  });
});

describe('sendPaginated', () => {
  it('should send paginated response with meta', () => {
    const res = createMockRes();
    const data = [{ id: 1 }, { id: 2 }];
    sendPaginated(res, data, 20, 1, 10, 'Users found');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.deepStrictEqual(res.body.data, data);
    assert.strictEqual(res.body.meta.page, 1);
    assert.strictEqual(res.body.meta.limit, 10);
    assert.strictEqual(res.body.meta.total, 20);
    assert.strictEqual(res.body.meta.totalPages, 2);
  });

  it('should handle zero total', () => {
    const res = createMockRes();
    sendPaginated(res, [], 0, 1, 10);
    assert.strictEqual(res.body.meta.totalPages, 1);
    assert.strictEqual(res.body.meta.total, 0);
  });

  it('should default values when not provided', () => {
    const res = createMockRes();
    sendPaginated(res);
    assert.strictEqual(res.body.meta.page, 1);
    assert.strictEqual(res.body.meta.limit, 10);
    assert.strictEqual(res.body.meta.total, 0);
    assert.strictEqual(res.body.meta.totalPages, 1);
  });
});
