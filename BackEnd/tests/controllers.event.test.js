import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// REAL Event Controller Tests
// Mocks models, cron (prevents real scheduling), socket emits,
// and the email transporter. Exercises the actual controller.
// ============================================================

const cronMock = { schedule: mock.fn() };
mock.module('node-cron', { defaultExport: cronMock });

let eventInstances = [];
let requestedInstances = [];
let ticketInstances = [];

class MockEvent {
  constructor(data = {}) {
    Object.assign(this, data);
    eventInstances.push(this);
  }
  static findOne = mock.fn(async () => null);
  static findById = mock.fn(async () => null);
  static find = mock.fn(async () => []);
  static findByIdAndDelete = mock.fn(async () => null);
  static findByIdAndUpdate = mock.fn(async () => null);
}
MockEvent.prototype.save = mock.fn(async function () { return this; });
MockEvent.prototype.deleteOne = mock.fn(async function () { return this; });

class MockRequestedEvent {
  constructor(data = {}) {
    Object.assign(this, data);
    requestedInstances.push(this);
  }
  static findOne = mock.fn(async () => null);
  static findById = mock.fn(async () => null);
  static find = mock.fn(async () => []);
  static findByIdAndDelete = mock.fn(async () => null);
}
MockRequestedEvent.prototype.save = mock.fn(async function () { return this; });
MockRequestedEvent.prototype.deleteOne = mock.fn(async function () { return this; });

class MockTicket {
  constructor(data = {}) {
    Object.assign(this, data);
    ticketInstances.push(this);
  }
  static find = mock.fn(async () => []);
  static findById = mock.fn(async () => null);
}
MockTicket.prototype.save = mock.fn(async function () { return this; });

class MockUser {
  constructor(data = {}) {
    Object.assign(this, data);
  }
  static findById = mock.fn(async () => null);
}

mock.module('../models/event.model.js', { defaultExport: MockEvent });
mock.module('../models/requestedEvent.model.js', { defaultExport: MockRequestedEvent });
mock.module('../models/ticket.model.js', { defaultExport: MockTicket });
mock.module('../models/user.model.js', { defaultExport: MockUser });

const socketMocks = {
  emitToAll: mock.fn(() => {}),
  emitToUser: mock.fn(() => {}),
  emitToRole: mock.fn(() => {}),
};
mock.module('../utils/socket.js', { namedExports: socketMocks });

const sendMailMock = mock.fn(async () => ({}));
mock.module('../nodeMailer/nodeMailer.config.js', { defaultExport: { sendMail: sendMailMock } });

const {
  createEvent, getAllEvents, getAllRequestedEvents, getEventsByCategory,
  approveRequestedEvent, getMyEvent, getMyEventDetails, getEventDetails,
  updateEvent, deleteEvent, ticketBooking, getEventTickets, getEventStats,
  exportEventData,
} = await import('../controllers/event.controller.js');

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    send(data) { this.body = data; return this; },
  };
  return res;
}

const validBody = {
  title: 'Summer Concert',
  description: 'A great concert',
  date: '2026-07-01',
  StartTime: '18:00',
  location: 'Central Park',
  eventType: 'Public',
  eventCategory: 'Concert',
  host: 'John',
};

function resetAll() {
  eventInstances = [];
  requestedInstances = [];
  ticketInstances = [];

  MockEvent.findOne.mock.resetCalls();
  MockEvent.findOne.mock.mockImplementation(async () => null);
  MockEvent.findById.mock.resetCalls();
  MockEvent.findById.mock.mockImplementation(async () => null);
  MockEvent.find.mock.resetCalls();
  MockEvent.find.mock.mockImplementation(async () => []);
  MockEvent.findByIdAndDelete.mock.resetCalls();
  MockEvent.findByIdAndDelete.mock.mockImplementation(async () => null);
  MockEvent.findByIdAndUpdate.mock.resetCalls();
  MockEvent.findByIdAndUpdate.mock.mockImplementation(async () => null);
  MockEvent.prototype.save.mock.resetCalls();
  MockEvent.prototype.deleteOne.mock.resetCalls();

  MockRequestedEvent.findOne.mock.resetCalls();
  MockRequestedEvent.findOne.mock.mockImplementation(async () => null);
  MockRequestedEvent.findById.mock.resetCalls();
  MockRequestedEvent.findById.mock.mockImplementation(async () => null);
  MockRequestedEvent.find.mock.resetCalls();
  MockRequestedEvent.find.mock.mockImplementation(async () => []);
  MockRequestedEvent.findByIdAndDelete.mock.resetCalls();
  MockRequestedEvent.findByIdAndDelete.mock.mockImplementation(async () => null);
  MockRequestedEvent.prototype.save.mock.resetCalls();
  MockRequestedEvent.prototype.deleteOne.mock.resetCalls();

  MockTicket.find.mock.resetCalls();
  MockTicket.find.mock.mockImplementation(async () => []);
  MockTicket.findById.mock.resetCalls();
  MockTicket.findById.mock.mockImplementation(async () => null);
  MockTicket.prototype.save.mock.resetCalls();

  MockUser.findById.mock.resetCalls();
  MockUser.findById.mock.mockImplementation(async () => null);

  socketMocks.emitToAll.mock.resetCalls();
  socketMocks.emitToUser.mock.resetCalls();
  socketMocks.emitToRole.mock.resetCalls();
  sendMailMock.mock.resetCalls();
}

beforeEach(() => resetAll());
afterEach(() => resetAll());

describe('Event Controller — createEvent', () => {
  it('registers the hourly auto-end cron job on import', () => {
    assert.equal(cronMock.schedule.mock.callCount(), 1);
    assert.equal(cronMock.schedule.mock.calls[0].arguments[0], '0 * * * *');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = mockRes();
    await createEvent({ userId: 'u1', userRole: 'Admin', body: { title: 'Only title' }, files: [] }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'All fields are required!');
  });

  it('requires a booking code for private events', async () => {
    const res = mockRes();
    await createEvent(
      { userId: 'u1', userRole: 'Admin', body: { ...validBody, eventType: 'Private' }, files: [] },
      res, () => {}
    );
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Booking code is required for private events.');
  });

  it('rejects duplicate event titles', async () => {
    MockEvent.findOne.mock.mockImplementation(async () => ({ _id: 'exists' }));
    const res = mockRes();
    await createEvent({ userId: 'u1', userRole: 'Admin', body: validBody, files: [] }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Event already exists!');
  });

  it('creates a live Event as Admin and emits event:created', async () => {
    const res = mockRes();
    await createEvent(
      { userId: 'admin1', userRole: 'Admin', body: validBody, files: [{ filename: 'a.jpg' }, { filename: 'b.jpg' }] },
      res, () => {}
    );

    assert.equal(res.statusCode, 201);
    assert.equal(eventInstances.length, 1);
    assert.equal(requestedInstances.length, 0);
    const ev = eventInstances[0];
    assert.equal(ev.createdBy, 'admin1');
    assert.deepEqual(ev.image, ['a.jpg', 'b.jpg']);
    assert.equal(MockEvent.prototype.save.mock.callCount(), 1);
    assert.equal(socketMocks.emitToAll.mock.callCount(), 1);
    assert.equal(socketMocks.emitToAll.mock.calls[0].arguments[0], 'event:created');
  });

  it('creates a live Event as superAdmin too', async () => {
    const res = mockRes();
    await createEvent({ userId: 'sa1', userRole: 'superAdmin', body: validBody, files: [] }, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(eventInstances.length, 1);
    assert.equal(eventInstances[0].createdBy, 'sa1');
  });

  it('creates a RequestedEvent for regular users and notifies Admins', async () => {
    const res = mockRes();
    await createEvent({ userId: 'user1', userRole: 'user', body: validBody, files: [] }, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(requestedInstances.length, 1);
    assert.equal(eventInstances.length, 0);
    assert.equal(requestedInstances[0].requester, 'user1');
    assert.equal(socketMocks.emitToRole.mock.callCount(), 1);
    assert.equal(socketMocks.emitToRole.mock.calls[0].arguments[0], 'Admin');
    assert.equal(socketMocks.emitToRole.mock.calls[0].arguments[1], 'event:requested');
  });
});

describe('Event Controller — getAllEvents', () => {
  it('returns an empty array when no events exist', async () => {
    MockEvent.find.mock.mockImplementation(async () => []);
    const res = mockRes();
    await getAllEvents({}, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, []);
  });

  it('returns only non-cancelled, non-ended events', async () => {
    const events = [{ title: 'A', eventStatus: 'Active' }];
    MockEvent.find.mock.mockImplementation(async () => events);
    const res = mockRes();
    await getAllEvents({}, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    const query = MockEvent.find.mock.calls[0].arguments[0];
    assert.deepEqual(query.eventStatus.$nin, ['Cancelled', 'Ended']);
  });
});

describe('Event Controller — getAllRequestedEvents', () => {
  it('denies regular users', async () => {
    const res = mockRes();
    await getAllRequestedEvents({ userRole: 'user' }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. Only Admins can view all requested events!');
  });

  it('returns all requested events for Admins and superAdmin', async () => {
    const docs = [{ title: 'Req 1' }];
    MockRequestedEvent.find.mock.mockImplementation(async () => docs);
    for (const role of ['Admin', 'superAdmin']) {
      const res = mockRes();
      await getAllRequestedEvents({ userRole: role }, res, () => {});
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.length, 1);
    }
  });
});

describe('Event Controller — getEventsByCategory', () => {
  it('returns 404 when the category query yields null', async () => {
    MockEvent.find.mock.mockImplementation(async () => null);
    const res = mockRes();
    await getEventsByCategory({ params: { category: 'Wedding' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'No events found!');
  });

  it('returns events of the requested category', async () => {
    const events = [{ title: 'Beach Wedding' }];
    MockEvent.find.mock.mockImplementation(async () => events);
    const res = mockRes();
    await getEventsByCategory({ params: { category: 'Wedding' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(MockEvent.find.mock.calls[0].arguments[0].eventCategory, 'Wedding');
  });
});

describe('Event Controller — approveRequestedEvent', () => {
  // The reject path schedules a 5-minute setTimeout for deletion; mock the
  // timer API so those timers are captured and cleared instead of keeping
  // the test process alive.
  beforeEach(() => {
    mock.timers.enable({ apis: ['setTimeout'], now: 1000 });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  const requestedDoc = {
    _id: 'req123',
    title: 'User Wedding',
    description: 'desc',
    date: '2026-12-01',
    StartTime: '15:00',
    location: 'Beach',
    image: ['w1.jpg'],
    eventType: 'Public',
    eventCategory: 'Wedding',
    host: 'Alice',
    requester: 'user789',
    bookingCode: undefined,
  };

  it('denies regular users', async () => {
    const res = mockRes();
    await approveRequestedEvent({ userRole: 'user', params: { id: 'req123' }, body: { action: 'approve' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. Only Admins can approve requested events!');
  });

  it('returns 404 when the requested event does not exist', async () => {
    MockRequestedEvent.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await approveRequestedEvent({ userRole: 'Admin', params: { id: 'nope' }, body: { action: 'approve' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Requested event not found!');
  });

  it('approves: creates an Event, deletes the request, emails and notifies the requester', async () => {
    MockRequestedEvent.findById.mock.mockImplementation(async () => ({ ...requestedDoc }));
    MockUser.findById.mock.mockImplementation(async () => ({ email: 'alice@test.com' }));
    const res = mockRes();
    await approveRequestedEvent({ userRole: 'Admin', params: { id: 'req123' }, body: { action: 'approve' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Event approved and created successfully.');

    // Event created with requester as createdBy
    assert.equal(eventInstances.length, 1);
    assert.equal(eventInstances[0].title, 'User Wedding');
    assert.equal(eventInstances[0].createdBy, 'user789');
    assert.equal(MockEvent.prototype.save.mock.callCount(), 1);

    // Request deleted
    assert.equal(MockRequestedEvent.findByIdAndDelete.mock.callCount(), 1);
    assert.equal(MockRequestedEvent.findByIdAndDelete.mock.calls[0].arguments[0], 'req123');

    // Approval email sent to requester
    assert.equal(sendMailMock.mock.callCount(), 1);
    assert.ok(sendMailMock.mock.calls[0].arguments[0].subject.includes('Event Approved'));

    // Real-time notification to requester
    assert.equal(socketMocks.emitToUser.mock.callCount(), 1);
    assert.equal(socketMocks.emitToUser.mock.calls[0].arguments[0], 'user789');
    assert.equal(socketMocks.emitToUser.mock.calls[0].arguments[1], 'event:approved');
  });

  it('rejects with the provided reason, emails it, and notifies the requester', async () => {
    const doc = new MockRequestedEvent({ ...requestedDoc });
    MockRequestedEvent.findById.mock.mockImplementation(async () => doc);
    MockUser.findById.mock.mockImplementation(async () => ({ email: 'alice@test.com' }));
    const res = mockRes();
    await approveRequestedEvent(
      { userRole: 'superAdmin', params: { id: 'req123' }, body: { action: 'reject', reason: 'Venue booked already' } },
      res, () => {}
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Event request declined.');
    assert.equal(doc.requestEventStatus, 'Rejected');
    assert.equal(doc.rejectionReason, 'Venue booked already');
    assert.equal(MockRequestedEvent.prototype.save.mock.callCount(), 1);

    assert.equal(sendMailMock.mock.callCount(), 1);
    assert.ok(sendMailMock.mock.calls[0].arguments[0].html.includes('Venue booked already'));

    assert.equal(socketMocks.emitToUser.mock.calls[0].arguments[1], 'event:rejected');
    assert.equal(socketMocks.emitToUser.mock.calls[0].arguments[2].reason, 'Venue booked already');
  });

  it('uses a default reason when none is provided', async () => {
    const doc = new MockRequestedEvent({ ...requestedDoc });
    MockRequestedEvent.findById.mock.mockImplementation(async () => doc);
    const res = mockRes();
    await approveRequestedEvent({ userRole: 'Admin', params: { id: 'req123' }, body: { action: 'reject' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(doc.rejectionReason, 'It does not meet the hosting criteria at this time.');
  });

  it('deletes the rejected request after 5 minutes', async () => {
    const doc = new MockRequestedEvent({ ...requestedDoc });
    MockRequestedEvent.findById.mock.mockImplementation(async () => doc);
    const res = mockRes();
    await approveRequestedEvent({ userRole: 'Admin', params: { id: 'req123' }, body: { action: 'reject', reason: 'Duplicate' } }, res, () => {});
    assert.equal(res.statusCode, 200);

    assert.equal(MockRequestedEvent.findByIdAndDelete.mock.callCount(), 0, 'not deleted before the timer fires');
    mock.timers.runAll();
    assert.equal(MockRequestedEvent.findByIdAndDelete.mock.callCount(), 1);
    assert.equal(MockRequestedEvent.findByIdAndDelete.mock.calls[0].arguments[0], 'req123');
  });

  it('returns 400 for an invalid action', async () => {
    MockRequestedEvent.findById.mock.mockImplementation(async () => ({ ...requestedDoc }));
    const res = mockRes();
    await approveRequestedEvent({ userRole: 'Admin', params: { id: 'req123' }, body: { action: 'publish' } }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid action!');
  });
});

describe('Event Controller — getMyEvent', () => {
  it('combines approved and requested events with a source flag', async () => {
    MockEvent.find.mock.mockImplementation(async () => [{ _doc: { _id: 'e1', title: 'Live' } }]);
    MockRequestedEvent.find.mock.mockImplementation(async () => [{ _doc: { _id: 'r1', title: 'Requested' } }]);

    const res = mockRes();
    await getMyEvent({ userId: 'user1' }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].source, 'event');
    assert.equal(res.body[1].source, 'requested');
    assert.equal(MockEvent.find.mock.calls[0].arguments[0].createdBy, 'user1');
    assert.equal(MockRequestedEvent.find.mock.calls[0].arguments[0].requester, 'user1');
  });

  it('returns an empty list when the user has no events', async () => {
    const res = mockRes();
    await getMyEvent({ userId: 'user1' }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, []);
  });
});

describe('Event Controller — getMyEventDetails', () => {
  it('returns 400 when no event id is given', async () => {
    const res = mockRes();
    await getMyEventDetails({ userId: 'u1', userRole: 'user', params: {} }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Event ID is required');
  });

  it('lets Admins fetch any event from either collection', async () => {
    const ev = { _id: 'e1', title: 'Live' };
    MockEvent.findById.mock.mockImplementation(async () => ev);
    const res = mockRes();
    await getMyEventDetails({ userId: 'admin1', userRole: 'Admin', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.title, 'Live');
  });

  it('lets users fetch only events they created or requested', async () => {
    MockEvent.findOne.mock.mockImplementation(async () => null);
    MockRequestedEvent.findOne.mock.mockImplementation(async () => ({ _id: 'r1', title: 'Mine' }));

    const res = mockRes();
    await getMyEventDetails({ userId: 'user1', userRole: 'user', params: { id: 'r1' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.title, 'Mine');
    assert.equal(MockEvent.findOne.mock.calls[0].arguments[0].createdBy, 'user1');
    assert.equal(MockRequestedEvent.findOne.mock.calls[0].arguments[0].requester, 'user1');
  });

  it('returns 404 for events the user does not own', async () => {
    MockEvent.findOne.mock.mockImplementation(async () => null);
    MockRequestedEvent.findOne.mock.mockImplementation(async () => null);
    const res = mockRes();
    await getMyEventDetails({ userId: 'user1', userRole: 'user', params: { id: 'x' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Event not found or access denied');
  });
});

describe('Event Controller — getEventDetails', () => {
  it('finds the event in the Event collection first', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', title: 'Live' }));
    const res = mockRes();
    await getEventDetails({ params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.title, 'Live');
  });

  it('falls back to the RequestedEvent collection', async () => {
    MockRequestedEvent.findById.mock.mockImplementation(async () => ({ _id: 'r1', title: 'Pending' }));
    const res = mockRes();
    await getEventDetails({ params: { id: 'r1' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.title, 'Pending');
  });

  it('returns 404 when the event does not exist anywhere', async () => {
    const res = mockRes();
    await getEventDetails({ params: { id: 'nope' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Event not found');
  });
});

describe('Event Controller — updateEvent', () => {
  const ownEvent = { _id: 'e1', createdBy: 'user1', requester: undefined };

  it('returns 404 when the event is not found', async () => {
    const res = mockRes();
    await updateEvent({ userRole: 'user', userId: 'user1', params: { id: 'nope' }, body: {} }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Event not found or access denied');
  });

  it('forbids Admins from editing requested events raised by other users', async () => {
    MockRequestedEvent.findById.mock.mockImplementation(async () => ({ _id: 'r1', requester: 'other', createdBy: undefined }));
    const res = mockRes();
    await updateEvent({ userRole: 'Admin', userId: 'admin1', params: { id: 'r1' }, body: {} }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. You can only update your own requested event!');
  });

  it('forbids users from updating other users events', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', createdBy: 'other', requester: undefined }));
    const res = mockRes();
    await updateEvent({ userRole: 'user', userId: 'user1', params: { id: 'e1' }, body: {} }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. You can only update your own event!');
  });

  it('updates the event merging existing and new images', async () => {
    const ev = new MockEvent({ ...ownEvent });
    MockEvent.findById.mock.mockImplementation(async () => ev);
    const res = mockRes();
    await updateEvent({
      userRole: 'user', userId: 'user1', params: { id: 'e1' },
      body: {
        title: 'New Title', description: 'd', date: '2026-08-01', StartTime: '10:00',
        location: 'Hall', eventType: 'Public', eventCategory: 'Conference', host: 'Bob',
        existingImages: JSON.stringify(['old1.jpg', 'old2.jpg']),
      },
      files: [{ filename: 'new1.jpg' }],
    }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Event updated successfully');
    assert.equal(ev.title, 'New Title');
    assert.deepEqual(ev.image, ['old1.jpg', 'old2.jpg', 'new1.jpg']);
    assert.equal(MockEvent.prototype.save.mock.callCount(), 1);
  });

  it('ignores malformed existingImages JSON', async () => {
    const ev = new MockEvent({ ...ownEvent });
    MockEvent.findById.mock.mockImplementation(async () => ev);
    const res = mockRes();
    await updateEvent({
      userRole: 'user', userId: 'user1', params: { id: 'e1' },
      body: { title: 'T', description: 'd', date: '2026-08-01', StartTime: '10:00', location: 'L', eventType: 'Public', eventCategory: 'Party', host: 'H', existingImages: '{bad json' },
      files: [],
    }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.deepEqual(ev.image, []);
  });
});

describe('Event Controller — deleteEvent', () => {
  it('returns 404 when the event is not found', async () => {
    const res = mockRes();
    await deleteEvent({ userRole: 'user', userId: 'user1', params: { id: 'nope' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Event not found or access denied');
  });

  it('forbids users from deleting others events', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', createdBy: 'other', requester: undefined, deleteOne: mock.fn(async () => {}) }));
    const res = mockRes();
    await deleteEvent({ userRole: 'user', userId: 'user1', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. You can only delete your own event!');
  });

  it('lets owners delete their own events', async () => {
    const ev = new MockEvent({ _id: 'e1', createdBy: 'user1', requester: undefined });
    MockEvent.findById.mock.mockImplementation(async () => ev);
    const res = mockRes();
    await deleteEvent({ userRole: 'user', userId: 'user1', params: { id: 'e1' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Event deleted successfully');
    assert.equal(MockEvent.prototype.deleteOne.mock.callCount(), 1);
  });

  it('lets Admins delete any event', async () => {
    const ev = { _id: 'e1', createdBy: 'someone', requester: undefined };
    MockEvent.findById.mock.mockImplementation(async () => ev);
    const res = mockRes();
    await deleteEvent({ userRole: 'Admin', userId: 'admin1', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 200);
  });
});

describe('Event Controller — ticketBooking', () => {
  it('blocks Admins and superAdmin from booking', async () => {
    for (const role of ['Admin', 'superAdmin']) {
      const res = mockRes();
      await ticketBooking({ userRole: role, userId: 'a1', params: { id: 'e1' }, body: {} }, res, () => {});
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'Admins cannot book tickets.');
    }
  });

  it('returns 404 when the event is not in the approved collection', async () => {
    MockEvent.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await ticketBooking({ userRole: 'user', userId: 'u1', params: { id: 'e1' }, body: {} }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Event not found or not approved yet.');
  });

  it('requires a booking code for private events', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', eventType: 'Private', bookingCode: 'SECRET' }));
    const res = mockRes();
    await ticketBooking({ userRole: 'user', userId: 'u1', params: { id: 'e1' }, body: { numberOfTickets: 1 } }, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Booking code is required for private events.');
  });

  it('rejects an incorrect booking code', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', eventType: 'Private', bookingCode: 'SECRET' }));
    const res = mockRes();
    await ticketBooking({ userRole: 'user', userId: 'u1', params: { id: 'e1' }, body: { bookingCode: 'WRONG' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Incorrect booking code for private event.');
  });

  it('books a VIP ticket with correct pricing and notifies the event creator', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', title: 'Gala', eventType: 'Public', createdBy: 'owner1' }));
    const res = mockRes();
    await ticketBooking({ userRole: 'user', userId: 'u1', params: { id: 'e1' }, body: { numberOfTickets: 3, ticketType: 'VIP' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Ticket booked successfully');
    assert.equal(ticketInstances.length, 1);
    const t = ticketInstances[0];
    assert.equal(t.eventId, 'e1');
    assert.equal(t.userId, 'u1');
    assert.equal(t.ticketType, 'VIP');
    assert.equal(t.ticketPrice, 25);
    assert.equal(t.numberOfTickets, 3);
    assert.equal(MockTicket.prototype.save.mock.callCount(), 1);
    assert.equal(socketMocks.emitToUser.mock.calls[0].arguments[0], 'owner1');
    assert.equal(socketMocks.emitToUser.mock.calls[0].arguments[1], 'ticket:booked');
  });

  it('defaults invalid ticket types to Regular (free)', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', eventType: 'Public', createdBy: null }));
    const res = mockRes();
    await ticketBooking({ userRole: 'user', userId: 'u1', params: { id: 'e1' }, body: { ticketType: 'Gold' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(ticketInstances[0].ticketType, 'Regular');
    assert.equal(ticketInstances[0].ticketPrice, 0);
    assert.equal(ticketInstances[0].numberOfTickets, 1, 'defaults to 1 ticket');
  });
});

describe('Event Controller — getEventTickets', () => {
  it('denies regular users', async () => {
    const res = mockRes();
    await getEventTickets({ userRole: 'user', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access Denied. Only Admins can view event tickets!');
  });

  it('returns 404 when the event does not exist', async () => {
    MockEvent.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await getEventTickets({ userRole: 'Admin', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 404);
  });

  it('returns the tickets for the event', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1' }));
    MockTicket.find.mock.mockImplementation(async () => [{ _id: 't1' }]);
    const res = mockRes();
    await getEventTickets({ userRole: 'superAdmin', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.tickets.length, 1);
  });
});

describe('Event Controller — getEventStats', () => {
  it('denies regular users', async () => {
    const res = mockRes();
    await getEventStats({ userRole: 'user', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 403);
  });

  it('returns 404 when the event does not exist', async () => {
    MockEvent.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await getEventStats({ userRole: 'Admin', params: { id: 'e1' } }, res, () => {});
    assert.equal(res.statusCode, 404);
  });

  it('computes tickets sold, revenue, and per-type counts', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ _id: 'e1', title: 'Gala', date: '2026-01-01', location: 'Hall' }));
    MockTicket.find.mock.mockImplementation(async () => [
      { ticketType: 'VIP', ticketPrice: 25, numberOfTickets: 2 },
      { ticketType: 'VIP', ticketPrice: 25, numberOfTickets: 1 },
      { ticketType: 'Regular', ticketPrice: 0, numberOfTickets: 3 },
    ]);
    const res = mockRes();
    await getEventStats({ userRole: 'Admin', params: { id: 'e1' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.event.title, 'Gala');
    assert.equal(res.body.stats.totalTicketsSold, 6);
    assert.equal(res.body.stats.totalRevenue, 75);
    assert.equal(res.body.stats.ticketTypes.VIP, 2);
    assert.equal(res.body.stats.ticketTypes.Regular, 1);
  });
});

describe('Event Controller — exportEventData', () => {
  it('denies regular users', async () => {
    const res = mockRes();
    await exportEventData({ userRole: 'user', params: { id: 'all' } }, res, () => {});
    assert.equal(res.statusCode, 403);
  });

  it('returns 404 for a single event that does not exist', async () => {
    MockEvent.findById.mock.mockImplementation(async () => null);
    const res = mockRes();
    await exportEventData({ userRole: 'Admin', params: { id: 'nope' } }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Event not found!');
  });

  it('exports a single event as CSV with a per-event filename', async () => {
    MockEvent.findById.mock.mockImplementation(async () => ({ title: 'Gala', description: 'd', date: '2026-01-01', StartTime: '18:00', location: 'Hall', image: ['a.jpg'], eventType: 'Public', eventCategory: 'Party', eventStatus: 'Active', host: 'Bob', createdBy: 'u1', bookingCode: undefined, locked: false }));
    const res = mockRes();
    await exportEventData({ userRole: 'Admin', params: { id: 'e1' } }, res, () => {});

    assert.equal(res.headers['Content-Type'], 'text/csv');
    assert.equal(res.headers['Content-Disposition'], 'attachment; filename="event-e1.csv"');
    assert.ok(res.body.includes('title'));
    assert.ok(res.body.includes('Gala'));
  });

  it('exports all events when id is "all"', async () => {
    MockEvent.find.mock.mockImplementation(async () => [
      { title: 'A', description: 'd', date: '2026-01-01', StartTime: '18:00', location: 'L', image: [], eventType: 'Public', eventCategory: 'Party', eventStatus: 'Active', host: 'H', createdBy: 'u1', bookingCode: undefined, locked: false },
      { title: 'B', description: 'd', date: '2026-01-02', StartTime: '19:00', location: 'L2', image: [], eventType: 'Private', eventCategory: 'Concert', eventStatus: 'Active', host: 'H2', createdBy: 'u2', bookingCode: 'SECRET', locked: false },
    ]);
    const res = mockRes();
    await exportEventData({ userRole: 'superAdmin', params: { id: 'all' } }, res, () => {});

    assert.equal(res.headers['Content-Disposition'], 'attachment; filename="events.csv"');
    assert.ok(res.body.includes('A'));
    assert.ok(res.body.includes('B'));
  });
});