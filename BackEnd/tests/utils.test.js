import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

// ============================================================
// REAL Utils Tests — Token generation, socket helpers, email templates
// ============================================================

process.env.JWT_SECRET = 'utils-test-secret';

describe('generateToken util', () => {
  it('returns a JWT containing the userId', async () => {
    const { default: generateToken } = await import('../utils/Token.js');
    const cookies = {};
    const res = {
      cookie(name, value, opts) { cookies[name] = { value, opts }; },
    };

    const token = generateToken('user123', res);
    assert.ok(typeof token === 'string');
    assert.ok(token.length > 20);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(decoded.userId, 'user123');
  });

  it('sets a httpOnly, sameSite strict cookie with 15 day expiry', async () => {
    const { default: generateToken } = await import('../utils/Token.js');
    const cookies = {};
    const res = { cookie(name, value, opts) { cookies[name] = { value, opts }; } };

    generateToken('user123', res);

    const cookie = cookies.user_token;
    assert.ok(cookie, 'user_token cookie should be set');
    assert.equal(cookie.opts.httpOnly, true);
    assert.equal(cookie.opts.sameSite, 'strict');
    assert.equal(cookie.opts.maxAge, 15 * 24 * 60 * 60 * 1000);
    assert.equal(jwt.verify(cookie.value, process.env.JWT_SECRET).userId, 'user123');
  });
});

describe('socket utils', () => {
  const roomEmit = mock.fn(() => {});
  const ioMock = {
    emit: mock.fn(() => {}),
    to: mock.fn(() => ({ emit: roomEmit })),
  };

  beforeEach(() => {
    ioMock.emit.mock.resetCalls();
    ioMock.to.mock.resetCalls();
    roomEmit.mock.resetCalls();
  });
  afterEach(() => {
    ioMock.emit.mock.resetCalls();
    ioMock.to.mock.resetCalls();
    roomEmit.mock.resetCalls();
  });

  it('returns null from getIO before initialization (with a warning)', async () => {
    const { getIO } = await import('../utils/socket.js');
    assert.equal(getIO(), null);
  });

  it('is safe to emit before initialization (no crash)', async () => {
    const { emitToAll, emitToUser, emitToRole, setIO } = await import('../utils/socket.js');
    setIO(null);
    assert.doesNotThrow(() => emitToAll('event:x', {}));
    assert.doesNotThrow(() => emitToUser('u1', 'event:x', {}));
    assert.doesNotThrow(() => emitToRole('Admin', 'event:x', {}));
  });

  it('emits to all clients after initialization', async () => {
    const { setIO, emitToAll } = await import('../utils/socket.js');
    setIO(ioMock);
    emitToAll('event:created', { id: 1 });
    assert.equal(ioMock.emit.mock.callCount(), 1);
    assert.equal(ioMock.emit.mock.calls[0].arguments[0], 'event:created');
  });

  it('emits to a specific user room', async () => {
    const { setIO, emitToUser } = await import('../utils/socket.js');
    setIO(ioMock);
    emitToUser('user123', 'event:approved', { msg: 'hi' });

    assert.equal(ioMock.to.mock.callCount(), 1);
    assert.equal(ioMock.to.mock.calls[0].arguments[0], 'user123');
    assert.equal(roomEmit.mock.callCount(), 1);
    assert.equal(roomEmit.mock.calls[0].arguments[0], 'event:approved');
    assert.equal(roomEmit.mock.calls[0].arguments[1].msg, 'hi');
  });

  it('emits to a role-based room', async () => {
    const { setIO, emitToRole } = await import('../utils/socket.js');
    setIO(ioMock);
    emitToRole('Admin', 'event:requested', {});

    assert.equal(ioMock.to.mock.calls[0].arguments[0], 'role:Admin');
  });
});

describe('email templates', () => {
  it('contains the verification code placeholder', async () => {
    const { VERIFICATION_EMAIL_TEMPLATE } = await import('../nodeMailer/emailTemplates.js');
    assert.ok(VERIFICATION_EMAIL_TEMPLATE.includes('{verificationCode}'));
  });

  it('contains the reset URL placeholder', async () => {
    const { PASSWORD_RESET_REQUEST_TEMPLATE } = await import('../nodeMailer/emailTemplates.js');
    assert.ok(PASSWORD_RESET_REQUEST_TEMPLATE.includes('{resetURL}'));
  });

  it('contains the name placeholder in the welcome template', async () => {
    const { WELCOME_EMAIL_TEMPLATE } = await import('../nodeMailer/emailTemplates.js');
    assert.ok(WELCOME_EMAIL_TEMPLATE.includes('{name}'));
  });
});