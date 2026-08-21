import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';

vi.mock('../hooks/userHooks/useGetMyEvents', () => ({
  default: vi.fn(),
}));

import useGetMyEvents from '../hooks/userHooks/useGetMyEvents';
import MyEvents from '../pages/userPages/myEvents';

const liveEvent = {
  _id: 'e1',
  title: 'Summer Concert',
  description: 'Live and approved',
  date: '2026-07-01T18:00:00.000Z',
  StartTime: '18:00',
  location: 'Central Park',
  eventType: 'Public',
  eventCategory: 'Concert',
  host: 'John',
  image: ['a.jpg'],
  source: 'event',
};

const pendingRequest = {
  _id: 'r1',
  title: 'Wedding Plan',
  description: 'Waiting for approval',
  date: '2026-12-01T15:00:00.000Z',
  StartTime: '15:00',
  location: 'Beach',
  eventType: 'Public',
  eventCategory: 'Wedding',
  host: 'Alice',
  image: ['w.jpg'],
  source: 'requested',
  requestEventStatus: 'Pending',
  rejectionReason: '',
};

const rejectedRequest = {
  _id: 'r2',
  title: 'Club Night',
  description: 'Was rejected',
  date: '2026-11-01T22:00:00.000Z',
  StartTime: '22:00',
  location: 'Downtown',
  eventType: 'Public',
  eventCategory: 'Party',
  host: 'Bob',
  image: [],
  source: 'requested',
  requestEventStatus: 'Rejected',
  rejectionReason: 'Venue already booked',
};

const renderMyEvents = (events = [], { loading = false, error = null } = {}) => {
  useGetMyEvents.mockReturnValue({ events, loading, error });
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <MyEvents />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('MyEvents page', () => {
  beforeEach(() => {
    useGetMyEvents.mockReset();
  });

  it('renders the page title', () => {
    renderMyEvents([]);
    expect(screen.getByText('My Events')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    renderMyEvents([], { loading: true });
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('shows the error message on failure', () => {
    renderMyEvents([], { error: 'Failed to fetch events.' });
    expect(screen.getByText('Failed to fetch events.')).toBeInTheDocument();
  });

  it('categorizes events into Live Events and Event Requests', () => {
    renderMyEvents([liveEvent, pendingRequest, rejectedRequest]);

    expect(screen.getByText('Live Events')).toBeInTheDocument();
    expect(screen.getByText('Event Requests')).toBeInTheDocument();
  });

  it('shows the correct counts per section', () => {
    renderMyEvents([liveEvent, pendingRequest, rejectedRequest]);
    expect(screen.getByText('Live Events').textContent).toContain('1');
    expect(screen.getByText('Event Requests').textContent).toContain('2');
  });

  it('renders live event details in the Live section', () => {
    renderMyEvents([liveEvent, pendingRequest]);
    expect(screen.getByText('Summer Concert')).toBeInTheDocument();
    expect(screen.getByText('Live and approved')).toBeInTheDocument();
  });

  it('shows a Pending badge for pending requests', () => {
    renderMyEvents([pendingRequest]);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('shows a Rejected badge with the rejection reason', () => {
    renderMyEvents([rejectedRequest]);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Venue already booked')).toBeInTheDocument();
  });

  it('shows an empty state when there are no live events', () => {
    renderMyEvents([pendingRequest]);
    expect(screen.getByText(/You have no live events yet/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no requests', () => {
    renderMyEvents([liveEvent]);
    expect(screen.getByText(/You have no event requests/)).toBeInTheDocument();
  });
});