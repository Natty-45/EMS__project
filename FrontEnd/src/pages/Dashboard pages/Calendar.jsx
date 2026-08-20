import { useTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';

export default function Calendar() {
  const { theme } = useTheme();
  const { events, loading } = useGetAllEvents();
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
  
  <div className={`${theme.background} pt-20`}>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${theme.text}`}>Event Calendar</h2>
        <p className={`mt-2 ${theme.textSecondary}`}>View all upcoming events in chronological order</p>
      </div>

      <div className={`${theme.card} rounded-lg shadow-lg p-6`}>
        {loading && <p className="text-center text-lg">Loading events...</p>}
        {sortedEvents.map(event => (
          <div key={event._id} className={`border-b last:border-b-0 border-gray-200 py-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-semibold ${theme.text}`}>{event.title}</h3>
                <p className={`${theme.textSecondary}`}>
                  {format(new Date(event.date), 'MMMM d, yyyy')} at {event.StartTime}
                </p>
                <p className={`${theme.textSecondary} mt-1`}>{event.location}</p>
              </div>
              <Link to={`/events/${event._id}`} className={`${theme.primary} ${theme.text} px-4 py-2 rounded-md`}>
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}