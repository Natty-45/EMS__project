// components/MyEvents.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useGetMyEvents from '../../hooks/userHooks/useGetMyEvents';
import { useTheme } from '../../contexts/ThemeContext';
import { FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';

const MyEvents = () => {
  const { events, loading, error } = useGetMyEvents();
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen p-6 ${theme.background}`}>
      <h1 className={`text-3xl font-bold mb-6 text-center ${theme.text}`}>
        My Events
      </h1>

      {loading && <p className="text-lg text-center">Loading...</p>}
      {error && <p className="text-lg text-red-500 text-center">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div
            key={event._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl"
            onClick={() => navigate(`/my-events/update/${event._id}`)}

            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            {/* Image */}
            <div className="h-48 w-full">
              {event.image?.[0] ? (
                <img
                  src={event.image[0].startsWith('http') ? event.image[0] : `/uploads/${event.image[0]}`}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <h2 className={`text-xl font-semibold ${theme.text}`}>
                {event.title}
              </h2>
              <p className={`text-sm ${theme.textSecondary}`}>
                {event.description}
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Start Time:</strong> {event.StartTime}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p>
                  <strong>Type:</strong> {event.eventType}
                </p>
                <p>
                  <strong>Category:</strong> {event.eventCategory}
                </p>
                <p>
                  <strong>Host:</strong> {event.host}
                </p>
              </div>

              {/* Show request status only if this is a requested event */}
              {event.source === 'requested' && (
                <div className="mt-2">
                  {event.requestEventStatus === 'Pending' && (
                    <span className="inline-flex items-center text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                      <FaHourglassHalf className="mr-1" /> Pending Approval
                    </span>
                  )}
                  {event.requestEventStatus === 'Rejected' && (
                    <span className="inline-flex items-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                      <FaTimesCircle className="mr-1" /> Rejected
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyEvents;
