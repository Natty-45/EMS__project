// components/MyEvents.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useGetMyEvents from '../../hooks/userHooks/useGetMyEvents';
import { useTheme } from '../../contexts/ThemeContext';
import { FaHourglassHalf, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const MyEvents = () => {
  const { events, loading, error } = useGetMyEvents();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const liveEvents = events.filter((e) => e.source === 'event');
  const requestedEvents = events.filter((e) => e.source === 'requested');

  const renderCard = (event) => (
    <motion.div
      key={event._id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl"
      onClick={() => navigate(`/my-events/update/${event._id}`)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
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

      <div className="p-4 space-y-2">
        <h2 className={`text-xl font-semibold ${theme.text}`}>
          {event.title}
        </h2>
        <p className={`text-sm ${theme.textSecondary}`}>
          {event.description?.length > 120
            ? event.description.slice(0, 120) + '...'
            : event.description}
        </p>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
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

        {event.source === 'requested' && (
          <div className="mt-2 space-y-2">
            {event.requestEventStatus === 'Pending' && (
              <span className="inline-flex items-center text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                <FaHourglassHalf className="mr-1" /> Pending Approval
              </span>
            )}
            {event.requestEventStatus === 'Approved' && (
              <span className="inline-flex items-center text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                <FaCheckCircle className="mr-1" /> Approved
              </span>
            )}
            {event.requestEventStatus === 'Rejected' && (
              <>
                <span className="inline-flex items-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                  <FaTimesCircle className="mr-1" /> Rejected
                </span>
                {event.rejectionReason && (
                  <p className="text-xs text-red-500 dark:text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                    <strong>Reason:</strong> {event.rejectionReason}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  const EmptyState = ({ message }) => (
    <div className={`col-span-full text-center py-12 ${theme.textSecondary}`}>
      {message}
    </div>
  );

  return (
    <div className={`min-h-screen p-6 pt-28 ${theme.background}`}>
      <h1 className={`text-4xl font-extrabold mb-2 text-center ${theme.text}`}>
        My Events
      </h1>
      <p className={`text-center mb-8 ${theme.textSecondary}`}>
        Manage your live events and track your event requests
      </p>

      {loading && <p className="text-lg text-center">Loading events...</p>}
      {error && <p className="text-lg text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>
              Live Events <span className={`text-sm font-normal ${theme.textSecondary}`}>({liveEvents.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.length === 0 ? (
                <EmptyState message="You have no live events yet. Create one from the Create Event page." />
              ) : (
                liveEvents.map(renderCard)
              )}
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>
              Event Requests <span className={`text-sm font-normal ${theme.textSecondary}`}>({requestedEvents.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requestedEvents.length === 0 ? (
                <EmptyState message="You have no event requests. Submit one from the Create Event page." />
              ) : (
                requestedEvents.map(renderCard)
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default MyEvents;