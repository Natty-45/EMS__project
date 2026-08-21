import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// REAL User Controller Tests
// ============================================================

class MockUser {
  constructor(data = {}) {
    Object.assign(this, data);
  }
  static findOne = mock.fn(async () => null);
  static findById = mock.fn(async () => null);
  static findByIdAndDelete = mock.fn(async () => null);
  static findByIdAndUpdate = mock.fn(async () => null);
  static find = mock.fn();
}
MockUser.prototype.save = mock.fn(async function () { return this; });

class MockTicket {
  constructor(data = {}) {
    Object.assign(this, data);
  }
  static find = mock.fn();
  static findById = mock.fn(async () => null);
}
MockTicket.prototype.save = mock.fn(async function () { return this; });

mock.module('../models/user.model.js', { defaultExport: MockUser });
mock.module('../models/ticket.model.js', { defaultExport: MockTicket });
mock.module('../models/event.model.js', { defaultExport: class {} });

const sendMailMock = mock.fn(async () => ({}));
mock.module('../nodeMailer/nodeMailer.config.js', { defaultExport: { sendMail: sendMailMock } });

const { updateProfile, deleteUser, getTickets, getTicketDetails, getAllUsers, updateUserRole, adminDeleteUser, cancelTicket, contactForm } =
  await import('../controllers/user.controller.js');

// mongoose-query-like chainable: supports .populate/.select, awaitable
function queryChain(result) {
  const q = {
    populate: mock.fn(() => q),
    select: mock.fn(() => q),
    sort: mock.fn(() => q),
    then: (resolve) => resolve(result),
  };
  return q;
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return res;
}

function resetAll() {
  MockUser.findOne.mock.resetCalls();
  MockUser.findById.mock.resetCalls();
  MockUser.findByIdAndDelete.mock.resetCalls();
  MockUser.findByIdAndUpdate.mock.resetCalls();
  MockUser.find.mock.resetCalls();
  MockUser.prototype.save.mock.resetCalls();
  MockTicket.find.mock.resetCalls();
  MockTicket.findById.mock.resetCalls();
  MockTicket.prototype.save.mock.resetCalls();
  sendMailMock.mock.resetCalls();
}

beforeEach(() => resetAll());
afterEach(() => resetAll());

describe('User Controller — updateProfile', () => {
  it('returns 403 when updating someone elses profile', async () => {
    const req = { params: { id: 'other123' }, userId: 'me123', body: { fullName: 'X' } };
    const res = mockRes();
    await updateProfile(req, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'You are not authorized to update this profile.');
  });

  it('returns 404 when user is not found', async () => {
    MockUser.findById.mock.mockImplementation(async () => null);
    const req = { params: { id: 'me123' }, userId: 'me123', body: { fullName: 'X' } };
    const res = mockRes();
    await updateProfile(req, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'User not found');
  });

  it('rejects an invalid email format', async () => {
    MockUser.findById.mock.mockImplementation(async () => new MockUser({}));
    const req = { params: { id: 'me123' }, userId: 'me123', body: { email: 'not-an-email' } };
    const res = mockRes();
    await updateProfile(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid email format');
  });

  it('updates only the provided fields', async () => {
    const user = new MockUser({ fullName: 'Old', username: 'oldname', email: 'old@test.com' });
    MockUser.findById.mock.mockImplementation(async () => user);
    const req = { params: { id: 'me123' }, userId: 'me123', body: { fullName: 'New Name' } };
    const res = mockRes();
    await updateProfile(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(user.fullName, 'New Name');
    assert.equal(user.username, 'oldname');
    assert.equal(user.email, 'old@test.com');
    assert.equal(res.body.user.fullName, 'New Name');
  });

  it('hashes a new password before saving', async () => {
    const user = new MockUser({ fullName: 'A', username: 'a', email: 'a@a.com' });
    MockUser.findById.mock.mockImplementation(async () => user);
    const req = { params: { id: 'me123' }, userId: 'me123', body: { password: 'newpass123' } };
    const res = mockRes();
    await updateProfile(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.notEqual(user.password, 'newpass123');
    assert.ok(user.password.includes('$2')); // bcrypt hash signature
  });

  it('saves a base64 profile picture to disk', async () => {
    const user = new MockUser({ fullName: 'A', username: 'a', email: 'a@a.com' });
    MockUser.findById.mock.mockImplementation(async () => user);
    const pngBase64 = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString('base64');
    const before = fs.existsSync('uploads') ? fs.readdirSync('uploads') : [];

    const req = { params: { id: 'me123' }, userId: 'me123', body: { profilepic: `data:image/png;base64,${pngBase64}` } };
    const res = mockRes();
    await updateProfile(req, res, () => {});

    assert.equal(res.statusCode, 200);
    const after = fs.readdirSync('uploads');
    const newFiles = after.filter((f) => !before.includes(f));
    assert.equal(newFiles.length, 1, 'exactly one profile picture file should be written');
    assert.ok(user.profilePic.endsWith('.png'));
    newFiles.forEach((f) => fs.unlinkSync(path.join('uploads', f)));
  });
});

describe('User Controller — deleteUser', () => {
  it('returns 403 when deleting another account', async () => {
    const req = { params: { id: 'other123' }, userId: 'me123' };
    const res = mockRes();
    await deleteUser(req, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'You are not authorized to delete this account.');
  });

  it('returns 404 when user is not found', async () => {
    MockUser.findByIdAndDelete.mock.mockImplementation(async () => null);
    const req = { params: { id: 'me123' }, userId: 'me123' };
    const res = mockRes();
    await deleteUser(req, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'User not found');
  });

  it('deletes the user successfully', async () => {
    MockUser.findByIdAndDelete.mock.mockImplementation(async () => ({ _id: 'me123' }));
    const req = { params: { id: 'me123' }, userId: 'me123' };
    const res = mockRes();
    await deleteUser(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'User deleted successfully');
    assert.equal(MockUser.findByIdAndDelete.mock.calls[0].arguments[0], 'me123');
  });
});

describe('User Controller — getTickets', () => {
  it('returns 404 when the user does not exist', async () => {
    MockUser.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await getTickets({ userId: 'ghost' }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'User not found');
  });

  it('returns an empty array when the user has no tickets', async () => {
    MockUser.findById.mock.mockImplementation(async () => new MockUser({ _id: 'me123' }));
    MockTicket.find.mock.mockImplementation(() => queryChain([]));
    const res = mockRes();
    await getTickets({ userId: 'me123' }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, []);
  });

  it('returns the users tickets with populated event data', async () => {
    MockUser.findById.mock.mockImplementation(async () => new MockUser({ _id: 'me123' }));
    const tickets = [{ _id: 't1', eventId: 'e1', ticketType: 'VIP' }];
    MockTicket.find.mock.mockImplementation(() => queryChain(tickets));
    const res = mockRes();
    await getTickets({ userId: 'me123' }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(MockTicket.find.mock.calls[0].arguments[0].userId, 'me123');
  });
});

describe('User Controller — getTicketDetails', () => {
  const ticketDoc = {
    _id: 't1',
    eventId: { _id: 'e1', title: 'Gala', date: '2026-01-01', location: 'Hall', eventType: 'Public' },
    userId: { _id: 'me123', fullName: 'Alice', email: 'alice@test.com' },
    ticketType: 'VIP',
    status: 'Booked',
    numberOfTickets: 2,
    bookingCode: 'GALA2026',
    bookingDate: new Date('2026-01-01'),
  };

  it('returns 404 when the ticket is not found', async () => {
    MockTicket.findById.mock.mockImplementation(() => queryChain(null));
    const res = mockRes();
    await getTicketDetails({ params: { id: 'nope' }, userId: 'me123' }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Ticket not found');
  });

  it('returns 403 when the ticket belongs to another user', async () => {
    MockTicket.findById.mock.mockImplementation(() => queryChain({ ...ticketDoc, userId: { _id: 'other' } }));
    const res = mockRes();
    await getTicketDetails({ params: { id: 't1' }, userId: 'me123' }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'You are not authorized to view this ticket');
  });

  it('returns a shaped ticket detail object', async () => {
    MockTicket.findById.mock.mockImplementation(() => queryChain({ ...ticketDoc }));
    const res = mockRes();
    await getTicketDetails({ params: { id: 't1' }, userId: 'me123' }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ticketId, 't1');
    assert.equal(res.body.Event.title, 'Gala');
    assert.equal(res.body.User.fullName, 'Alice');
    assert.equal(res.body.ticketType, 'VIP');
    assert.equal(res.body.status, 'Booked');
    assert.equal(res.body.numberOfTickets, 2);
    assert.equal(res.body.bookingCode, 'GALA2026');
  });
});

describe('User Controller — getAllUsers', () => {
  it('denies regular users', async () => {
    const res = mockRes();
    await getAllUsers({ userRole: 'user' }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. Admins only.');
  });

  it('allows superAdmin and strips sensitive fields', async () => {
    const users = [{ _id: '1', password: 'hash' }];
    MockUser.find.mock.mockImplementation(() => queryChain(users));
    const res = mockRes();
    await getAllUsers({ userRole: 'superAdmin' }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(MockUser.find.mock.calls[0].arguments[0] === undefined, true);
  });
});

describe('User Controller — updateUserRole', () => {
  it('denies non-superAdmin role changes', async () => {
    const res = mockRes();
    await updateUserRole({ userRole: 'Admin', params: { id: 'x' }, body: { role: 'user' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. Only superAdmin can change roles.');
  });

  it('rejects an invalid role', async () => {
    const res = mockRes();
    await updateUserRole({ userRole: 'superAdmin', params: { id: 'x' }, body: { role: 'moderator' } }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid role');
  });

  it('returns 404 when the user is not found', async () => {
    MockUser.findByIdAndUpdate.mock.mockImplementation(() => queryChain(null));
    const res = mockRes();
    await updateUserRole({ userRole: 'superAdmin', params: { id: 'x' }, body: { role: 'Admin' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'User not found');
  });

  it('updates the role successfully', async () => {
    const updated = { _id: 'x', role: 'Admin' };
    MockUser.findByIdAndUpdate.mock.mockImplementation(() => queryChain(updated));
    const res = mockRes();
    await updateUserRole({ userRole: 'superAdmin', params: { id: 'x' }, body: { role: 'Admin' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.role, 'Admin');
    assert.equal(MockUser.findByIdAndUpdate.mock.calls[0].arguments[1].role, 'Admin');
  });
});

describe('User Controller — adminDeleteUser', () => {
  it('denies non-superAdmin', async () => {
    const res = mockRes();
    await adminDeleteUser({ userRole: 'Admin', params: { id: 'x' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. Only superAdmin can delete users.');
  });

  it('returns 404 when the user is not found', async () => {
    MockUser.findByIdAndDelete.mock.mockImplementation(async () => null);
    const res = mockRes();
    await adminDeleteUser({ userRole: 'superAdmin', params: { id: 'x' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'User not found');
  });

  it('deletes any user as superAdmin', async () => {
    MockUser.findByIdAndDelete.mock.mockImplementation(async () => ({ _id: 'x' }));
    const res = mockRes();
    await adminDeleteUser({ userRole: 'superAdmin', params: { id: 'x' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'User deleted successfully');
  });
});

describe('User Controller — cancelTicket', () => {
  it('returns 404 for a missing ticket', async () => {
    MockTicket.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await cancelTicket({ userId: 'me123', params: { id: 't1' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Ticket not found');
  });

  it('returns 403 when cancelling another users ticket', async () => {
    MockTicket.findById.mock.mockImplementation(async () => ({ userId: 'other', status: 'Booked' }));
    const res = mockRes();
    await cancelTicket({ userId: 'me123', params: { id: 't1' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Not authorized to cancel this ticket');
  });

  it('returns 400 when the ticket is already cancelled', async () => {
    MockTicket.findById.mock.mockImplementation(async () => ({ userId: 'me123', status: 'Cancelled' }));
    const res = mockRes();
    await cancelTicket({ userId: 'me123', params: { id: 't1' } }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Ticket already cancelled');
  });

  it('cancels a booked ticket and persists the status', async () => {
    const ticket = new MockTicket({ userId: 'me123', status: 'Booked' });
    MockTicket.findById.mock.mockImplementation(async () => ticket);
    const res = mockRes();
    await cancelTicket({ userId: 'me123', params: { id: 't1' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(ticket.status, 'Cancelled');
    assert.equal(MockTicket.prototype.save.mock.callCount(), 1);
  });
});

describe('User Controller — contactForm', () => {
  it('requires all fields', async () => {
    const res = mockRes();
    await contactForm({ body: { name: 'A', email: 'a@a.com' } }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'All fields are required');
  });

  it('rejects an invalid email', async () => {
    const res = mockRes();
    await contactForm({ body: { name: 'A', email: 'bad', message: 'hi' } }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid email format');
  });

  it('sends the message to the admin email', async () => {
    const res = mockRes();
    await contactForm({ body: { name: 'Alice', email: 'alice@test.com', message: 'Hello there' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Message sent successfully!');
    assert.equal(sendMailMock.mock.callCount(), 1);
    const mail = sendMailMock.mock.calls[0].arguments[0];
    assert.ok(mail.subject.includes('Alice'));
    assert.ok(mail.text.includes('Hello there'));
  });
});