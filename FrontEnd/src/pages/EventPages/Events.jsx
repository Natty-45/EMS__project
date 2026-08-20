import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { CalendarIcon, ClockIcon, MapPinIcon, MagnifyingGlassIcon, TicketIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';
import toast from 'react-hot-toast';
import Reveal from '../../components/ui/Reveal';
import GradientText from '../../components/ui/GradientText';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';

const EVENTS_PER_PAGE = 6;

const statusStyles = {
  Active: 'bg-green-500/15 text-green-600 dark:text-green-400',
  Pending: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  Cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400',
  Ended: 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
};

const Events = () => {
  const { theme } = useTheme();
  const { events, loading, error } = useGetAllEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', 'Concert', 'Wedding', 'Party', 'Conference', 'Others'];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.host?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.eventCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  const getImageUrl = (img) => {
    if (!img) return '/placeholder.jpg';
    return img.startsWith('http') ? img : `/uploads/${img}`;
  };

  if (error) {
    toast.error(error);
  }

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-brand-500/20 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <TicketIcon className="h-4 w-4" />
              Discover & book
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              All <GradientText>Events</GradientText>
            </h1>
          </div>
        </Reveal>

        {/* Search and Filter Bar */}
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-4 sm:flex-row mb-10">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by title, location, or host..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="input-field pl-12"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="input-field cursor-pointer sm:w-56"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </Reveal>

        <p className={`mb-6 text-sm ${theme.textSecondary}`}>
          Showing <span className="font-semibold text-brand-500">{paginatedEvents.length}</span> of {filteredEvents.length} events
        </p>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3 rounded-full bg-brand-500/10 px-6 py-3 text-brand-600 dark:text-brand-400">
              <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
              Loading events...
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedEvents.map((event, index) => (
              <motion.div
                key={event._id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <div className={`group flex h-full flex-col overflow-hidden rounded-3xl ${theme.card} border ${theme.border} shadow-lg shadow-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/15`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(event.image?.[0])}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${
                        statusStyles[event.eventStatus] || statusStyles.Ended
                      }`}
                    >
                      {event.eventStatus}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-500">
                      {event.eventCategory}
                    </span>
                    <h3 className={`font-display text-xl font-bold ${theme.text}`}>
                      {event.title}
                    </h3>

                    <div className={`mt-4 space-y-2 text-sm ${theme.textSecondary}`}>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-brand-500" />
                        <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 shrink-0 text-brand-500" />
                        <span>{event.StartTime}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-brand-500" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <p className={`mt-4 text-sm leading-relaxed line-clamp-2 ${theme.textSecondary}`}>
                      {event.description}
                    </p>

                    <div className="mt-5 flex gap-3 border-t pt-5 dark:border-white/5">
                      <Link
                        to={`/events/${event._id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-500/40 py-2.5 text-sm font-semibold text-brand-600 transition-all duration-300 hover:bg-brand-500/10 dark:text-brand-400"
                      >
                        Details
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Link>
                      <Link
                        to={`/booking/${event._id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-[1.03] active:scale-95"
                      >
                        <TicketIcon className="h-4 w-4" />
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {!loading && filteredEvents.length === 0 && (
          <Reveal>
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-white/15">
              <p className={`text-xl font-semibold ${theme.text}`}>No events found</p>
              <p className={`mt-2 text-sm ${theme.textSecondary}`}>
                Try adjusting your search or filter
              </p>
            </div>
          </Reveal>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:border-brand-500 hover:text-brand-500 dark:border-white/15"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-10 w-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30 scale-110'
                    : `${theme.card} border ${theme.border} hover:border-brand-500 hover:text-brand-500`
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:border-brand-500 hover:text-brand-500 dark:border-white/15"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;