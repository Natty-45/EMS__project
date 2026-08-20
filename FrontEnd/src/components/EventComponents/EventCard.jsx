import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
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
    <div className={`${theme.card} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col`}>
      <img 
        src={imageUrl} 
        alt={event.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6 flex-grow flex flex-col">
        <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>{event.title}</h3>
        <p className={`${theme.textSecondary} mb-4 flex-grow`}>{event.description}</p>
        
        <div className="space-y-2">
          <div className={`flex items-center ${theme.textSecondary}`}>
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
          </div>
          
          <div className={`flex items-center ${theme.textSecondary}`}>
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{event.StartTime || event.time}</span>
          </div>
          
          <div className={`flex items-center ${theme.textSecondary}`}>
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <Link to={`/events/${eventId}`} className={`mt-4 w-full text-center ${theme.text} bg-blue-500 py-2 px-4 rounded-md transition-colors inline-block`}>
          Let's Go!
        </Link>
      </div>
    </div>
  );
}