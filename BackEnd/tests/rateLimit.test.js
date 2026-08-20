import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import rateLimit from '../middleware/rateLimit.js';

// Mock req, res, next
const createMockReqRes = (ip = '127.0.0.1', path = '/test') => {
  const req = { ip, path };
  let statusCode = 200;
  let responseBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseBody = data;
      return res;
    },
  };
  const next = () => {};
  return { req, res, next, getStatus: () => statusCode, getBody: () => responseBody };
};

describe('Rate Limiter', () => {
  it('should allow requests within the limit', () => {
    const limiter = rateLimit(5, 60000);
    const { req, res, next } = createMockReqRes();

    for (let i = 0; i < 5; i++) {
      limiter(req, res, next);
    }
    // Should not block
  });

  it('should block requests exceeding the limit', () => {
    const limiter = rateLimit(3, 60000);
    const { req, res } = createMockReqRes();
    let blocked = false;

    for (let i = 0; i < 5; i++) {
      const mock = createMockReqRes();
      limiter(mock.req, mock.res, mock.next);
      if (mock.getStatus() === 429) {
        blocked = true;
        assert.equal(mock.getBody().error, 'Too many requests. Please try again later.');
        break;
      }
    }
    assert.ok(blocked, 'Should have blocked at least one request');
  });

  it('should return 429 with retryAfter field', () => {
    const limiter = rateLimit(1, 60000);
    const mock1 = createMockReqRes();
    const mock2 = createMockReqRes();

    limiter(mock1.req, mock1.res, mock1.next); // First request OK
    limiter(mock2.req, mock2.res, mock2.next); // Second request blocked

    assert.equal(mock2.getStatus(), 429);
    assert.ok(mock2.getBody().retryAfter !== undefined);
  });
});
