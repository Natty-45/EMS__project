import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { CalendarIcon, ClockIcon, MapPinIcon, ExclamationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';
import toast from 'react-hot-toast';

const Events = () => {
  const { theme } = useTheme();
  const { events, loading, error } = useGetAllEvents();

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (error) {
    return toast.error(error); 
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'Active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'Ended':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme.background} pt-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className={`text-4xl font-bold text-center mb-8 ${theme.text}`}>All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event._id} className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg">
              <img src={event.image?.[0] ? (event.image[0].startsWith('http') ? event.image[0] : `/uploads/${event.image[0]}`) : '/placeholder.jpg'} alt={event.title} className="w-full h-40 object-cover rounded-md mb-4" />
              <h3 className={`text-2xl font-bold mb-2 ${theme.text}`}>{event.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className={`text-sm ${theme.text}`}>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span className={`text-sm ${theme.text}`}>{event.StartTime}</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <span className={`text-sm ${theme.text}`}>{event.location}</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(event.eventStatus)}
                <span className={`text-sm ${theme.text}`}>{event.eventStatus}</span>
              </div>
              <p className={`text-sm ${theme.textSecondary} mb-4`}>{event.description}</p>
              <Link to={`/events/${event._id}`} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;