import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import useEventDetails from '../../hooks/eventHooks/useEventDetails';
import { motion } from 'framer-motion';

const EventDetails = () => {
  const { theme } = useTheme();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { event, loading, error } = useEventDetails(eventId);

  if (loading) {
    return <div className="text-center mt-20 text-lg font-semibold animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>;
  }

  if (!event) {
    return <div className="text-center mt-20 text-lg font-semibold">Event not found</div>;
  }

  const isRequestedEvent =
    event.isRequestedEvent || event.requestEventStatus !== undefined || event.requester !== undefined;

  const canBook =
    !isRequestedEvent && (event.eventStatus === 'Active' || event.eventStatus === 'Pending');

  const firstImage = event.image && event.image.length > 0 ? (event.image[0].startsWith('http') ? event.image[0] : `/uploads/${event.image[0]}`) : '/placeholder.jpg';

  const handleNavigateToBooking = () => {
    navigate(`/booking/${eventId}`);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4 sm:px-8`}
    >
      <motion.div
        className="relative bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-xl max-w-3xl w-full mt-20 mb-10 border border-transparent dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-xl" />

        <h2
          className={`relative text-3xl sm:text-4xl font-bold text-center mb-6 ${theme.text} tracking-wide`}
        >
          {event.title || 'Untitled Event'}
        </h2>

        <motion.img
          src={firstImage}
          alt={event.title || 'Event image'}
          className="relative w-full h-56 sm:h-64 object-cover rounded-lg shadow-md mb-6 border border-transparent hover:border-blue-500 transition"
          whileHover={{ scale: 1.05 }}
        />

        <div className="relative flex flex-col space-y-4 mb-6 p-4 bg-opacity-30 backdrop-blur-lg rounded-lg">
          {[
            { icon: CalendarIcon, text: new Date(event.date).toLocaleDateString() },
            { icon: ClockIcon, text: event.StartTime },
            { icon: MapPinIcon, text: event.location },
            { icon: UserIcon, text: event.host },
            { icon: TagIcon, text: event.eventCategory },
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <item.icon className={`h-6 w-6 ${theme.text}`} />
              <span className={`text-lg ${theme.text}`}>{item.text}</span>
            </div>
          ))}
        </div>

        <p
          className={`relative text-base sm:text-lg ${theme.textSecondary} mb-6 leading-relaxed`}
        >
          {event.description}
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {canBook ? (
            <button
              onClick={handleNavigateToBooking}
              className="w-full sm:w-auto bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
            >
              Book Now
            </button>
          ) : (
            <button
              disabled
              className="relative bg-gray-400 cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg border-2 border-transparent"
              title="Booking unavailable for requested or inactive events"
            >
              Booking Unavailable
            </button>
          )}

          <div className="text-right">
            <p className={`text-sm ${theme.textSecondary}`}>Hosted by:</p>
            <p className={`text-lg font-semibold ${theme.text}`}>{event.host}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetails;
