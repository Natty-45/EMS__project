import { CalendarIcon, ClockIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function EventCard({ event }) {
  const { theme } = useTheme();
  const eventId = event._id || event.id;
  const imageUrl = event.image?.[0]
    ? (event.image[0].startsWith('http') ? event.image[0] : `/uploads/${event.image[0]}`)
    : event.image || '/placeholder.jpg';

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-3xl ${theme.card} border ${theme.border} shadow-lg shadow-black/5 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/15`}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-600 shadow backdrop-blur">
          {event.eventCategory || 'Event'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className={`font-display text-xl font-bold transition-colors ${theme.text} group-hover:text-brand-600 dark:group-hover:text-brand-400`}>
          {event.title}
        </h3>
        <p className={`mt-2 flex-1 text-sm leading-relaxed line-clamp-2 ${theme.textSecondary}`}>
          {event.description}
        </p>

        <div className={`mt-4 space-y-2 border-t pt-4 text-sm ${theme.border}`}>
          <div className={`flex items-center ${theme.textSecondary}`}>
            <CalendarIcon className="mr-2 h-4 w-4 text-brand-500" />
            <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
          </div>
          <div className={`flex items-center ${theme.textSecondary}`}>
            <ClockIcon className="mr-2 h-4 w-4 text-brand-500" />
            <span>{event.StartTime || event.time}</span>
          </div>
          <div className={`flex items-center truncate ${theme.textSecondary}`}>
            <MapPinIcon className="mr-2 h-4 w-4 shrink-0 text-brand-500" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <Link
          to={`/events/${eventId}`}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/35 hover:scale-[1.02] active:scale-95"
        >
          View Details
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}