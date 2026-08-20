import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import EventSelector from '../../components/ui/EventSelector';

const AdminStats = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async (event) => {
    setLoading(true);
    setStats(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/event/${event._id}/stats`, {
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

        <EventSelector
          onSelect={fetchStats}
          allowAll={false}
          label="Which event would you like to see statistics for?"
        />

        {loading && <p className={`text-center mt-6 ${theme.textSecondary}`}>Loading statistics...</p>}

        {stats && (
          <div className="bg-white bg-opacity-50 p-6 rounded-lg mt-6">
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
              <div className="text-center p-4 bg-brand-50 rounded-lg">
                <p className="text-3xl font-bold text-brand-600">{stats.stats.ticketTypes.VIP || 0}</p>
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