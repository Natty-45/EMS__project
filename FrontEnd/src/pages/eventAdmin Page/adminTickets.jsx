import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { TicketIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminTickets = () => {
  const { theme } = useTheme();
  const [eventId, setEventId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    if (!eventId.trim()) {
      toast.error('Please enter an event ID');
      return;
    }
    setLoading(true);
    setTickets([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/event/${eventId}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tickets');
      setTickets(data.tickets || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4`}>
      <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-4xl w-full mt-20 mb-10">
        <TicketIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h2 className={`text-3xl font-bold text-center mb-6 ${theme.text}`}>Event Tickets</h2>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter Event ID"
            className="flex-1 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Tickets'}
          </button>
        </div>

        {tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-3 text-left text-sm font-semibold">Ticket ID</th>
                  <th className="p-3 text-left text-sm font-semibold">User</th>
                  <th className="p-3 text-left text-sm font-semibold">Type</th>
                  <th className="p-3 text-left text-sm font-semibold">Qty</th>
                  <th className="p-3 text-left text-sm font-semibold">Status</th>
                  <th className="p-3 text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b dark:border-gray-600">
                    <td className="p-3 text-sm">{ticket._id.slice(-8)}</td>
                    <td className="p-3 text-sm">{ticket.userId?.fullName || ticket.userId}</td>
                    <td className="p-3 text-sm">{ticket.ticketType}</td>
                    <td className="p-3 text-sm">{ticket.numberOfTickets}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'Booked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{new Date(ticket.bookingDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tickets.length === 0 && eventId && (
          <p className="text-center text-gray-500 mt-4">No tickets found for this event.</p>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
