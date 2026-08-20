import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useGetMyTickets from '../../hooks/userHooks/useGetMyTickets';
import { useCancelTicket } from '../../hooks/userHooks/useCancelTicket';
import { useTheme } from '../../contexts/ThemeContext';
import { TicketIcon, CalendarIcon, MapPinIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';

const MyTickets = () => {
  const { tickets, loading, error } = useGetMyTickets();
  const { cancelTicket, loading: cancelling } = useCancelTicket();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleCancel = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
    const success = await cancelTicket(ticketId);
    if (success) {
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme.background}`}>
      <h1 className={`text-3xl font-bold mb-6 text-center ${theme.text}`}>
        My Tickets
      </h1>

      {loading && <p className="text-lg text-center">Loading tickets...</p>}
      {error && <p className="text-lg text-red-500 text-center">{error}</p>}

      {!loading && tickets.length === 0 && (
        <div className="text-center mt-12">
          <TicketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className={`text-xl ${theme.text}`}>No tickets booked yet</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 bg-blue-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-600 transition"
          >
            Browse Events
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {tickets.map((ticket) => (
          <motion.div
            key={ticket._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ticket Header */}
            <div className={`p-4 ${ticket.status === 'Booked' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold truncate">{ticket.eventId?.title || 'Event'}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  ticket.status === 'Booked' ? 'bg-green-700' : 'bg-red-700'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                <span>{ticket.eventId?.date ? new Date(ticket.eventId.date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-5 w-5 flex-shrink-0" />
                <span>{ticket.eventId?.StartTime || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                <span>{ticket.eventId?.location || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <TagIcon className="h-5 w-5 flex-shrink-0" />
                <span>{ticket.ticketType} × {ticket.numberOfTickets}</span>
              </div>
              <div className="text-xs text-gray-500">
                Booked on: {new Date(ticket.bookingDate).toLocaleDateString()}
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => navigate(`/events/${ticket.eventId?._id}`)}
                className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition text-sm"
              >
                View Event
              </button>
              {ticket.status === 'Booked' && (
                <button
                  onClick={() => handleCancel(ticket._id)}
                  disabled={cancelling}
                  className="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition text-sm disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyTickets;
