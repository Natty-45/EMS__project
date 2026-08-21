import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

// ============================================================
// REAL Auth Controller Tests
// Mocks only the model + email modules; exercises the actual
// controller code from ../controllers/auth.controller.js
// ============================================================

class MockUser {
  constructor(data = {}) {
    Object.assign(this, data);
  }
  static findOne = mock.fn(async () => null);
  static findById = mock.fn(async () => null);
  static findByIdAndDelete = mock.fn(async () => null);
}
MockUser.prototype.save = mock.fn(async function () { return this; });

const mockUser = new MockUser();
mock.module('../models/user.model.js', { defaultExport: MockUser });

const emailMocks = {
  sendVerificationEmail: mock.fn(async () => {}),
  sendWelcomeEmail: mock.fn(async () => {}),
  sendPasswordResetEmail: mock.fn(async () => {}),
  sendPasswordResetSuccessEmail: mock.fn(async () => {}),
};
mock.module('../nodeMailer/email.js', {
  namedExports: emailMocks,
});

const { signup, verifyEmail, resendVerificationCode, login, logOut, forgotPassword, resetPassword } =
  await import('../controllers/auth.controller.js');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// --- response helper ---
function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    cookies: {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    cookie(name, value, opts) { this.cookies[name] = { value, opts }; return this; },
    clearCookie(name) { delete this.cookies[name]; return this; },
  };
  return res;
}

function resetAll() {
  MockUser.findOne.mock.resetCalls();
  MockUser.findById.mock.resetCalls();
  MockUser.findByIdAndDelete.mock.resetCalls();
  MockUser.prototype.save.mock.resetCalls();
  emailMocks.sendVerificationEmail.mock.resetCalls();
  emailMocks.sendWelcomeEmail.mock.resetCalls();
  emailMocks.sendPasswordResetEmail.mock.resetCalls();
  emailMocks.sendPasswordResetSuccessEmail.mock.resetCalls();
}

beforeEach(() => resetAll());
afterEach(() => resetAll());

describe('Auth Controller — signup', () => {
  it('returns 400 when passwords do not match', async () => {
    const req = { body: { fullName: 'A', username: 'a', email: 'a@a.com', password: 'pass123', confirmPassword: 'different' } };
    const res = mockRes();
    await signup(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Password do not Match! ');
  });

  it('returns 400 when username or email already exists', async () => {
    MockUser.findOne.mock.mockImplementation(async () => ({ _id: 'existing' }));
    const req = { body: { fullName: 'A', username: 'taken', email: 'taken@a.com', password: 'pass123', confirmPassword: 'pass123' } };
    const res = mockRes();
    await signup(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Username or Email Exists!');
  });

  it('creates a user with hashed password, verification token, cookie, and sends OTP email', async () => {
    let savedUser = null;
    MockUser.findOne.mock.mockImplementation(async () => null);
    MockUser.prototype.save.mock.mockImplementation(async function () { savedUser = this; return this; });
    MockUser.prototype.constructor = MockUser;

    const req = { body: { fullName: 'Alice Doe', username: 'alice2', email: 'alice2@test.com', password: 'pass123', confirmPassword: 'pass123' } };
    const res = mockRes();
    await signup(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.ok(res.body.message.includes('OTP code successfully sent'));
    assert.equal(res.body.fullName, 'Alice Doe');

    // password stored hashed (not plaintext)
    assert.notEqual(savedUser.password, 'pass123');
    assert.ok(await bcrypt.compare('pass123', savedUser.password));

    // verification token is a 6-digit string and expires in ~15 min
    assert.match(savedUser.verificationToken, /^\d{6}$/);
    assert.equal(savedUser.verificationTokenExpiresAt - Date.now() > 14 * 60 * 1000, true);

    // cookie set with JWT
    assert.ok(res.cookies.user_token);
    assert.equal(res.cookies.user_token.opts.httpOnly, true);

    // verification email sent to user email
    assert.equal(emailMocks.sendVerificationEmail.mock.callCount(), 1);
    assert.equal(emailMocks.sendVerificationEmail.mock.calls[0].arguments[0], 'alice2@test.com');
    assert.equal(emailMocks.sendVerificationEmail.mock.calls[0].arguments[1], savedUser.verificationToken);
  });
});

describe('Auth Controller — verifyEmail', () => {
  it('returns 400 for invalid or expired code', async () => {
    MockUser.findOne.mock.mockImplementation(async () => null);
    const req = { body: { code: '123456' } };
    const res = mockRes();
    await verifyEmail(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid or expired verification code');
  });

  it('verifies the user and sends a welcome email', async () => {
    const user = new MockUser({ email: 'bob@test.com', name: 'Bob' });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { code: '654321' } };
    const res = mockRes();
    await verifyEmail(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(user.isVerified, true);
    assert.equal(user.verificationToken, undefined);
    assert.equal(user.verificationTokenExpiresAt, undefined);
    assert.equal(emailMocks.sendWelcomeEmail.mock.callCount(), 1);
    assert.equal(emailMocks.sendWelcomeEmail.mock.calls[0].arguments[0], 'bob@test.com');
  });
});

describe('Auth Controller — resendVerificationCode', () => {
  it('returns 404 when user is not found', async () => {
    MockUser.findOne.mock.mockImplementation(async () => null);
    const req = { body: { email: 'ghost@test.com' } };
    const res = mockRes();
    await resendVerificationCode(req, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'User not found');
  });

  it('returns 400 when user is already verified', async () => {
    MockUser.findOne.mock.mockImplementation(async () => new MockUser({ email: 'a@a.com', isVerified: true }));
    const req = { body: { email: 'a@a.com' } };
    const res = mockRes();
    await resendVerificationCode(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'User already verified');
  });

  it('enforces the 60 second cooldown', async () => {
    const user = new MockUser({ email: 'a@a.com', isVerified: false, verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000 });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { email: 'a@a.com' } };
    const res = mockRes();
    await resendVerificationCode(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.cooldown > 0);
  });

  it('generates a new code and resends when cooldown has passed', async () => {
    const user = new MockUser({ email: 'a@a.com', isVerified: false, verificationTokenExpiresAt: Date.now() });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { email: 'a@a.com' } };
    const res = mockRes();
    await resendVerificationCode(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Verification code resent successfully');
    assert.match(user.verificationToken, /^\d{6}$/);
    assert.equal(emailMocks.sendVerificationEmail.mock.callCount(), 1);
  });
});

describe('Auth Controller — login', () => {
  it('returns 400 when user does not exist', async () => {
    MockUser.findOne.mock.mockImplementation(async () => null);
    const req = { body: { username: 'nobody', password: 'x' } };
    const res = mockRes();
    await login(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'User does not exist!');
  });

  it('returns 400 for wrong password', async () => {
    const user = new MockUser({ password: bcrypt.hashSync('right123', 10), isVerified: true });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { username: 'alice', password: 'wrong123' } };
    const res = mockRes();
    await login(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Wrong Credentials!');
  });

  it('blocks unverified users', async () => {
    const user = new MockUser({ password: bcrypt.hashSync('right123', 10), isVerified: false });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { username: 'alice', password: 'right123' } };
    const res = mockRes();
    await login(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'The User is not Verified');
  });

  it('logs in a verified user with valid credentials', async () => {
    const user = new MockUser({ _id: 'usr123', password: bcrypt.hashSync('right123', 10), isVerified: true });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { username: 'alice', password: 'right123' } };
    const res = mockRes();
    await login(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.validUser._id, 'usr123');
    assert.ok(res.body.token);
    assert.ok(res.cookies.user_token);
    assert.equal(res.cookies.user_token.opts.maxAge, 15 * 24 * 60 * 60 * 1000);
  });
});

describe('Auth Controller — logOut', () => {
  it('clears the user_token cookie', async () => {
    const res = mockRes();
    res.cookies.user_token = { value: 'x' };
    await logOut({}, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.cookies.user_token, undefined);
  });
});

describe('Auth Controller — forgotPassword', () => {
  it('returns 400 when email is not found', async () => {
    MockUser.findOne.mock.mockImplementation(async () => null);
    const req = { body: { email: 'ghost@test.com' } };
    const res = mockRes();
    await forgotPassword(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Email not found!');
  });

  it('sets a reset token and sends the reset email', async () => {
    const user = new MockUser({ email: 'bob@test.com' });
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { body: { email: 'bob@test.com' } };
    const res = mockRes();
    await forgotPassword(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.ok(user.resetPasswordToken, 'reset token should be set');
    assert.ok(user.resetPasswordExpiresAt > Date.now());
    assert.equal(emailMocks.sendPasswordResetEmail.mock.callCount(), 1);
    const url = emailMocks.sendPasswordResetEmail.mock.calls[0].arguments[1];
    assert.ok(url.includes(user.resetPasswordToken));
  });
});

describe('Auth Controller — resetPassword', () => {
  it('returns 400 for invalid or expired token', async () => {
    MockUser.findOne.mock.mockImplementation(async () => null);
    const req = { params: { token: 'bad' }, body: { password: 'new123', confirmPassword: 'new123' } };
    const res = mockRes();
    await resetPassword(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid or expired reset token');
  });

  it('returns 400 when fields are missing', async () => {
    const user = new MockUser({});
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { params: { token: 'tok' }, body: {} };
    const res = mockRes();
    await resetPassword(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Password and confirm password are required');
  });

  it('returns 400 when passwords do not match', async () => {
    const user = new MockUser({});
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { params: { token: 'tok' }, body: { password: 'a1', confirmPassword: 'b2' } };
    const res = mockRes();
    await resetPassword(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Passwords do not match!');
  });

  it('resets the password (hashed) and clears the reset token', async () => {
    const user = new MockUser({ email: 'bob@test.com' });
    user.password = 'old-hash';
    MockUser.findOne.mock.mockImplementation(async () => user);
    const req = { params: { token: 'tok' }, body: { password: 'newpass123', confirmPassword: 'newpass123' } };
    const res = mockRes();
    await resetPassword(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.notEqual(user.password, 'newpass123');
    assert.ok(await bcrypt.compare('newpass123', user.password));
    assert.equal(user.resetPasswordToken, undefined);
    assert.equal(user.resetPasswordExpiresAt, undefined);
    assert.equal(emailMocks.sendPasswordResetSuccessEmail.mock.callCount(), 1);
  });
});