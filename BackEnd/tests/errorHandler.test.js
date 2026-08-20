import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '../utils/ErrorHandler.js';

describe('ErrorHandler', () => {
  it('should create an error with statusCode and message', () => {
    const error = errorHandler(404, 'Not Found');
    assert.equal(error.statusCode, 404);
    assert.equal(error.message, 'Not Found');
  });

  it('should return an Error instance', () => {
    const error = errorHandler(500, 'Server Error');
    assert.ok(error instanceof Error);
  });

  it('should handle different status codes', () => {
    const error400 = errorHandler(400, 'Bad Request');
    const error401 = errorHandler(401, 'Unauthorized');
    const error403 = errorHandler(403, 'Forbidden');
    const error500 = errorHandler(500, 'Internal Server Error');

    assert.equal(error400.statusCode, 400);
    assert.equal(error401.statusCode, 401);
    assert.equal(error403.statusCode, 403);
    assert.equal(error500.statusCode, 500);
  });
});
