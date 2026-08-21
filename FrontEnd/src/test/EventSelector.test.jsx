import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import EventSelector from '../components/ui/EventSelector';

const mockEvents = [
  { _id: 'e1', title: 'Summer Concert', host: 'John', date: '2026-07-01T18:00:00.000Z', eventCategory: 'Concert', eventStatus: 'Active' },
  { _id: 'e2', title: 'Winter Gala', host: 'Jane', date: '2026-12-01T19:00:00.000Z', eventCategory: 'Party', eventStatus: 'Active' },
];

const renderSelector = (props = {}) => {
  const onSelect = vi.fn();
  render(
    <ThemeProvider>
      {/* eslint-disable-next-line react/prop-types */}
      <EventSelector onSelect={onSelect} {...props} />
    </ThemeProvider>
  );
  return { onSelect };
};

const waitForLoaded = async () => {
  await waitFor(() => expect(screen.getByText('Search and choose an event...')).toBeInTheDocument());
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => mockEvents,
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('EventSelector', () => {
  it('loads events from the API on mount', async () => {
    renderSelector();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/event/', expect.anything()));
  });

  it('opens the dropdown and lists all events', async () => {
    renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));

    await waitFor(() => expect(screen.getByText('Summer Concert')).toBeInTheDocument());
    expect(screen.getByText('Winter Gala')).toBeInTheDocument();
  });

  it('shows the Export All Events option by default', async () => {
    renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => expect(screen.getByText('Export All Events')).toBeInTheDocument());
  });

  it('hides Export All Events when allowAll is false', async () => {
    renderSelector({ allowAll: false });
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => expect(screen.getByText('Summer Concert')).toBeInTheDocument());
    expect(screen.queryByText('Export All Events')).not.toBeInTheDocument();
  });

  it('filters events by title search', async () => {
    renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => screen.getByText('Summer Concert'));

    fireEvent.change(screen.getByPlaceholderText('Search by event name, host, or ID...'), {
      target: { value: 'gala' },
    });

    expect(screen.queryByText('Summer Concert')).not.toBeInTheDocument();
    expect(screen.getByText('Winter Gala')).toBeInTheDocument();
  });

  it('filters events by host search', async () => {
    renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => screen.getByText('Summer Concert'));

    fireEvent.change(screen.getByPlaceholderText('Search by event name, host, or ID...'), {
      target: { value: 'jane' },
    });

    expect(screen.getByText('Winter Gala')).toBeInTheDocument();
    expect(screen.queryByText('Summer Concert')).not.toBeInTheDocument();
  });

  it('shows an empty message when nothing matches', async () => {
    renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => screen.getByText('Summer Concert'));

    fireEvent.change(screen.getByPlaceholderText('Search by event name, host, or ID...'), {
      target: { value: 'zzz-no-match' },
    });

    expect(screen.getByText(/No events match/)).toBeInTheDocument();
  });

  it('calls onSelect with the picked event', async () => {
    const { onSelect } = renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => screen.getByText('Summer Concert'));
    fireEvent.click(screen.getByText('Summer Concert'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('calls onSelect with the all-events marker', async () => {
    const { onSelect } = renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => screen.getByText('Export All Events'));
    fireEvent.click(screen.getByText('Export All Events'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]._id).toBe('all');
    expect(onSelect.mock.calls[0][0].title).toBe('All Events');
  });

  it('tolerates a failed API call by showing an empty list', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    renderSelector();
    await waitForLoaded();
    fireEvent.click(screen.getByText('Search and choose an event...'));
    await waitFor(() => expect(screen.getByText(/No events match/)).toBeInTheDocument());
  });
});
