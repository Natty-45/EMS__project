import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

// ============================================================
// REAL VerifiedUser Middleware Tests
// ============================================================

class MockUser {
  constructor(data = {}) {
    Object.assign(this, data);
  }
  static findById = mock.fn(async () => null);
}

mock.module('../models/user.model.js', { defaultExport: MockUser });

const { default: VerifiedUser } = await import('../middleware/VerifiedUser.Middleware.js');

process.env.JWT_SECRET = 'middleware-test-secret';

function mockReqRes() {
  let statusCode = 200;
  let body = null;
  let nextArg = undefined;
  let nextCalled = false;
  const res = {
    status(code) { statusCode = code; return this; },
    json(data) { body = data; return this; },
  };
  const next = (err) => { nextCalled = true; nextArg = err; };
  return { req: { cookies: {}, headers: {} }, res, next, getStatus: () => statusCode, getBody: () => body, nextCalled: () => nextCalled, getNextArg: () => nextArg };
}

function resetAll() {
  MockUser.findById.mock.resetCalls();
  MockUser.findById.mock.mockImplementation(async () => null);
}

beforeEach(() => resetAll());
afterEach(() => resetAll());

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });

describe('VerifiedUser middleware', () => {
  it('rejects requests with no token (401)', async () => {
    const { req, res, next, nextCalled, getStatus, getBody } = mockReqRes();
    await VerifiedUser(req, res, next);

    assert.equal(nextCalled(), true);
    assert.equal(getStatus(), 200, 'error is passed to next, not sent directly');
    assert.equal(req.userId, undefined);
  });

  it('rejects an invalid token with 401', async () => {
    const { req, res, next, nextCalled, getStatus, getBody } = mockReqRes();
    req.headers = { authorization: 'Bearer not-a-valid-token' };
    await VerifiedUser(req, res, next);

    assert.equal(getStatus(), 401);
    assert.ok(getBody(), 'jwt error is sent as json');
  });

  it('forbids when the user no longer exists (403)', async () => {
    MockUser.findById.mock.mockImplementation(async () => null);
    const { req, res, next, nextCalled, getStatus, getBody } = mockReqRes();
    req.cookies = { user_token: signToken('ghost123') };
    await VerifiedUser(req, res, next);

    assert.equal(nextCalled(), true);
    assert.equal(req.userId, undefined);
  });

  it('accepts a valid cookie token and attaches the user', async () => {
    const user = new MockUser({ _id: 'user123', role: 'Admin' });
    MockUser.findById.mock.mockImplementation(async () => user);
    const { req, res, next, nextCalled, getStatus, getBody } = mockReqRes();
    req.cookies = { user_token: signToken('user123') };
    await VerifiedUser(req, res, next);

    assert.equal(nextCalled(), true);
    assert.equal(nextCalled(), true);
    assert.equal(req.userId, 'user123');
    assert.equal(req.userRole, 'Admin');
  });

  it('accepts a valid Bearer token from the Authorization header', async () => {
    const user = new MockUser({ _id: 'user456', role: 'user' });
    MockUser.findById.mock.mockImplementation(async () => user);
    const { req, res, next, nextCalled, getStatus, getBody } = mockReqRes();
    req.headers = { authorization: `Bearer ${signToken('user456')}` };
    await VerifiedUser(req, res, next);

    assert.equal(nextCalled(), true);
    assert.equal(req.userId, 'user456');
    assert.equal(req.userRole, 'user');
  });

  it('prefers the cookie token over the Authorization header', async () => {
    const user = new MockUser({ _id: 'cookieuser', role: 'superAdmin' });
    MockUser.findById.mock.mockImplementation(async () => user);
    const { req, res, next, nextCalled, getStatus, getBody } = mockReqRes();
    req.cookies = { user_token: signToken('cookieuser') };
    req.headers = { authorization: `Bearer ${signToken('otheruser')}` };
    await VerifiedUser(req, res, next);

    assert.equal(req.userId, 'cookieuser');
    assert.equal(MockUser.findById.mock.calls[0].arguments[0], 'cookieuser');
  });
});