import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { MagnifyingGlassIcon, CalendarDaysIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const EventSelector = ({ onSelect, allowAll = true, label = 'Select Event' }) => {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    fetch('/api/event/', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e._id?.toLowerCase().includes(q) ||
        e.host?.toLowerCase().includes(q)
    );
  }, [events, search]);

  const pick = (event) => {
    setSelected(event);
    setOpen(false);
    setSearch('');
    onSelect(event);
  };

  const inputClasses = `w-full p-3 rounded-md border ${
    theme.mode === 'dark'
      ? 'bg-gray-800 text-white border-gray-600'
      : 'bg-white text-gray-800 border-gray-300'
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="relative" ref={ref}>
      <label className={`block text-sm font-semibold mb-2 ${theme.textSecondary}`}>{label}</label>

      {selected ? (
        <div className={`flex items-center justify-between gap-2 ${inputClasses} cursor-pointer`} onClick={() => setOpen(true)}>
          <div className="flex items-center gap-2 truncate">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500 shrink-0" />
            <div className="truncate">
              <p className="font-medium text-sm truncate">{selected.title}</p>
              <p className={`text-xs ${theme.textSecondary}`}>
                {format(new Date(selected.date), 'MMMM d, yyyy')} · {selected.eventCategory} · {selected.eventStatus}
              </p>
            </div>
          </div>
          <ChevronDownIcon className="h-5 w-5 text-gray-400 shrink-0" />
        </div>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className={`w-full ${inputClasses} text-left`}
        >
          {loading ? 'Loading events...' : 'Search and choose an event...'}
        </button>
      )}

      {open && (
        <div className={`absolute z-20 mt-2 w-full max-h-80 overflow-y-auto rounded-md shadow-xl border ${theme.card} ${theme.border}`}>
          <div className={`p-2 border-b ${theme.border}`}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event name, host, or ID..."
                className={`w-full pl-9 pr-3 py-2 rounded-md border text-sm ${inputClasses}`}
              />
            </div>
          </div>

          <div className="py-1">
            {allowAll && (
              <button
                onClick={() => pick({ _id: 'all', title: 'All Events', date: new Date(), eventCategory: '—', eventStatus: '—' })}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-500/10"
              >
                Export All Events
              </button>
            )}
            {filtered.length === 0 && (
              <p className={`px-4 py-4 text-sm text-center ${theme.textSecondary}`}>No events match "{search}"</p>
            )}
            {filtered.map((event) => (
              <button
                key={event._id}
                onClick={() => pick(event)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-blue-500/10 transition-colors ${theme.text}`}
              >
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    {format(new Date(event.date), 'MMM d, yyyy')} · {event.host}
                  </p>
                </div>
                {selected?._id === event._id && <CheckIcon className="h-4 w-4 text-blue-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSelector;