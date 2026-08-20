import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useGetAllRequestedEvents from '../../hooks/eventAdminHook/useGetAllRequestedEvents';
import { useTheme } from '../../contexts/ThemeContext';

const RequestedEvents = () => {
  const { requestedEvents, loading, error } = useGetAllRequestedEvents();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleEventClick = (eventId) => {
    navigate(`/requested-event/approve/${eventId}`);
  };

  return (
    <div className={`min-h-screen p-14 pt-28 pb-10 px-6 md:px-10 transition-colors duration-300 ${theme.background}`}>
      <h1 className={`text-4xl font-extrabold my-8 text-center ${theme.text}`}>Requested Events</h1>

      {loading && <p className={`text-center text-lg ${theme.textSecondary}`}>Loading...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {requestedEvents.map((event) => {
          const thumbnail = event.image?.[0] || '/placeholder.jpg';

          return (
            <motion.div
              key={event._id}
              className={`rounded-xl shadow-lg overflow-hidden cursor-pointer flex flex-col transition-colors duration-300 ${theme.card}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleEventClick(event._id)}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={thumbnail}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h2 className={`text-xl font-semibold mb-2 ${theme.text}`}>{event.title}</h2>
                <p className={`text-sm mb-3 flex-grow ${theme.textSecondary}`}>
                  {event.description.length > 100
                    ? event.description.slice(0, 100) + '...'
                    : event.description}
                </p>

                <div className={`text-sm ${theme.textSecondary} space-y-1`}>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {event.StartTime}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Type:</strong> {event.eventType}</p>
                  <p><strong>Category:</strong> {event.eventCategory}</p>
                  <p><strong>Host:</strong> {event.host}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestedEvents;
