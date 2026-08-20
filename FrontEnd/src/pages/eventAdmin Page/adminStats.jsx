import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminStats = () => {
  const { theme } = useTheme();
  const [eventId, setEventId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!eventId.trim()) {
      toast.error('Please enter an event ID');
      return;
    }
    setLoading(true);
    setStats(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/event/${eventId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
      setStats(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4`}>
      <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-2xl w-full mt-20 mb-10">
        <ChartBarIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h2 className={`text-3xl font-bold text-center mb-6 ${theme.text}`}>Event Statistics</h2>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter Event ID"
            className="flex-1 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Stats'}
          </button>
        </div>

        {stats && (
          <div className="bg-white bg-opacity-50 p-6 rounded-lg">
            <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>{stats.event.title}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{stats.stats.totalTicketsSold}</p>
                <p className="text-sm text-gray-600">Total Tickets Sold</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.stats.ticketTypes.Regular || 0}</p>
                <p className="text-sm text-gray-600">Regular Tickets</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{stats.stats.ticketTypes.VIP || 0}</p>
                <p className="text-sm text-gray-600">VIP Tickets</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{new Date(stats.event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Event Date</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
