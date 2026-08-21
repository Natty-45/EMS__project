import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// REAL Mongoose Schema Validation Tests (no DB connection needed)
// ============================================================

import Event from '../models/event.model.js';
import RequestedEvent from '../models/requestedEvent.model.js';
import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js';

describe('Event model validation', () => {
  const validEvent = {
    title: 'Summer Concert',
    description: 'A great concert',
    date: new Date('2026-07-01'),
    StartTime: '18:00',
    location: 'Central Park',
    eventType: 'Public',
    eventCategory: 'Concert',
    host: 'John',
  };

  it('accepts a fully valid public event', () => {
    const doc = new Event(validEvent);
    assert.equal(doc.validateSync(), undefined);
  });

  it('accepts a fully valid private event with a booking code', () => {
    const doc = new Event({ ...validEvent, eventType: 'Private', bookingCode: 'SECRET1' });
    assert.equal(doc.validateSync(), undefined);
  });

  it('requires a booking code for private events', () => {
    const doc = new Event({ ...validEvent, eventType: 'Private' });
    const err = doc.validateSync();
    assert.ok(err, 'validation should fail');
    assert.ok(err.errors.bookingCode, 'bookingCode required error');
  });

  it('rejects missing required fields', () => {
    const doc = new Event({ title: 'Only title' });
    const err = doc.validateSync();
    assert.ok(err);
    for (const field of ['description', 'location', 'eventType', 'eventCategory', 'host']) {
      assert.ok(err.errors[field], `missing error for ${field}`);
    }
  });

  it('rejects an invalid eventType enum', () => {
    const doc = new Event({ ...validEvent, eventType: 'Secret' });
    const err = doc.validateSync();
    assert.ok(err.errors.eventType);
  });

  it('rejects an invalid eventCategory enum', () => {
    const doc = new Event({ ...validEvent, eventCategory: 'Sport' });
    const err = doc.validateSync();
    assert.ok(err.errors.eventCategory);
  });

  it('applies the default eventStatus and locked values', () => {
    const doc = new Event(validEvent);
    assert.equal(doc.eventStatus, 'Pending');
    assert.equal(doc.locked, false);
  });
});

describe('RequestedEvent model validation', () => {
  const validRequest = {
    title: 'Wedding',
    description: 'desc',
    date: new Date('2026-12-01'),
    StartTime: '15:00',
    location: 'Beach',
    eventType: 'Public',
    eventCategory: 'Wedding',
    host: 'Alice',
  };

  it('accepts a valid requested event', () => {
    const doc = new RequestedEvent(validRequest);
    assert.equal(doc.validateSync(), undefined);
  });

  it('defaults requestEventStatus to Pending and rejectionReason to empty', () => {
    const doc = new RequestedEvent(validRequest);
    assert.equal(doc.requestEventStatus, 'Pending');
    assert.equal(doc.rejectionReason, '');
  });

  it('rejects invalid requestEventStatus values', () => {
    const doc = new RequestedEvent({ ...validRequest, requestEventStatus: 'Unknown' });
    const err = doc.validateSync();
    assert.ok(err.errors.requestEventStatus);
  });

  it('requires a booking code for private requests', () => {
    const doc = new RequestedEvent({ ...validRequest, eventType: 'Private' });
    const err = doc.validateSync();
    assert.ok(err.errors.bookingCode);
  });

  it('rejects missing required fields', () => {
    const doc = new RequestedEvent({ title: 'Incomplete' });
    const err = doc.validateSync();
    for (const field of ['description', 'date', 'StartTime', 'location', 'eventType', 'eventCategory', 'host']) {
      assert.ok(err.errors[field], `missing error for ${field}`);
    }
  });
});

describe('Ticket model validation', () => {
  const OID_A = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  const OID_B = 'bbbbbbbbbbbbbbbbbbbbbbbb';

  it('accepts a valid ticket with defaults', () => {
    const doc = new Ticket({ eventId: OID_A, userId: OID_B });
    assert.equal(doc.validateSync(), undefined);
    assert.equal(doc.ticketType, 'Regular');
    assert.equal(doc.ticketPrice, 0);
    assert.equal(doc.status, 'Booked');
    assert.equal(doc.numberOfTickets, 1);
    assert.ok(doc.bookingDate instanceof Date);
  });

  it('requires eventId and userId', () => {
    const doc = new Ticket({});
    const err = doc.validateSync();
    assert.ok(err.errors.eventId);
    assert.ok(err.errors.userId);
  });

  it('rejects invalid ticketType and status enums', () => {
    const badType = new Ticket({ eventId: OID_A, userId: OID_B, ticketType: 'Gold' });
    assert.ok(badType.validateSync().errors.ticketType);

    const badStatus = new Ticket({ eventId: OID_A, userId: OID_B, status: 'Refunded' });
    assert.ok(badStatus.validateSync().errors.status);
  });
});

describe('User model validation', () => {
  const validUser = {
    fullName: 'Alice Doe',
    username: 'alice',
    email: 'alice@test.com',
    password: 'hashedpassword',
  };

  it('accepts a valid user with default role and verification state', () => {
    const doc = new User(validUser);
    assert.equal(doc.validateSync(), undefined);
    assert.equal(doc.role, 'user');
    assert.equal(doc.isVerified, false);
    assert.ok(doc.profilepic.startsWith('http'));
  });

  it('rejects missing required fields', () => {
    const doc = new User({});
    const err = doc.validateSync();
    for (const field of ['fullName', 'username', 'email', 'password']) {
      assert.ok(err.errors[field], `missing error for ${field}`);
    }
  });

  it('rejects an invalid role', () => {
    const doc = new User({ ...validUser, role: 'admin' });
    const err = doc.validateSync();
    assert.ok(err.errors.role);
  });

  it('accepts all valid roles', () => {
    for (const role of ['user', 'Admin', 'superAdmin']) {
      const doc = new User({ ...validUser, role });
      assert.equal(doc.validateSync(), undefined, `role ${role} should validate`);
    }
  });
});