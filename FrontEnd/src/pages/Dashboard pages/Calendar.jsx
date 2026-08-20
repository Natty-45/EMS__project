import { useTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';
import Reveal from '../../components/ui/Reveal';
import GradientText from '../../components/ui/GradientText';
import { ArrowRightIcon, CalendarDaysIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Calendar() {
  const { theme } = useTheme();
  const { events, loading } = useGetAllEvents();
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-brand-500/20 blur-[120px] animate-float-slow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <CalendarDaysIcon className="h-4 w-4" />
              Upcoming schedule
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Event <GradientText>Calendar</GradientText>
            </h1>
            <p className={`mx-auto mt-4 max-w-xl text-lg ${theme.textSecondary}`}>
              View all upcoming events in chronological order.
            </p>
          </div>
        </Reveal>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 rounded-full bg-brand-500/10 px-6 py-3 text-brand-600 dark:text-brand-400">
              <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
              Loading events...
            </div>
          </div>
        )}

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gradient-to-b from-brand-500 via-brand-400 to-brand-600 opacity-30 sm:left-1/2" />

          {sortedEvents.map((event, index) => {
            const isLeft = index % 2 === 0;
            return (
              <Reveal key={event._id} direction={isLeft ? 'left' : 'right'} delay={0.05 * (index % 3)}>
                <div className={`relative mb-10 flex pl-12 sm:w-1/2 ${isLeft ? 'sm:pl-0 sm:pr-12' : 'sm:ml-auto sm:pl-12'}`}>
                  <span className={`absolute left-4 top-7 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-lg shadow-brand-500/50 sm:left-auto ${isLeft ? 'sm:right-0 sm:translate-x-1/2' : 'sm:left-0 sm:-translate-x-1/2'}`} />
                  <motion.div
                    className={`group w-full rounded-2xl ${theme.card} border ${theme.border} p-6 card-hover`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1 text-xs font-bold text-white">
                        {format(new Date(event.date), 'MMM d')}
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs ${theme.textSecondary}`}>
                        <ClockIcon className="h-3.5 w-3.5 text-brand-500" />
                        {event.StartTime}
                      </span>
                    </div>
                    <h3 className={`mt-4 font-display text-xl font-bold transition-colors ${theme.text} group-hover:text-brand-600 dark:group-hover:text-brand-400`}>
                      {event.title}
                    </h3>
                    <p className={`mt-2 flex items-center gap-2 text-sm ${theme.textSecondary}`}>
                      <MapPinIcon className="h-4 w-4 shrink-0 text-brand-500" />
                      {event.location}
                    </p>
                    <Link
                      to={`/events/${event._id}`}
                      className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${theme.text} transition-colors group-hover:text-brand-500`}
                    >
                      View details
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}

          {!loading && sortedEvents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-white/15">
              <p className={`text-xl font-semibold ${theme.text}`}>No upcoming events</p>
              <p className={`mt-2 text-sm ${theme.textSecondary}`}>Check back soon — new events are being added.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}