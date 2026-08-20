import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { CalendarIcon, ClockIcon, MapPinIcon, ExclamationCircleIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';
import toast from 'react-hot-toast';

const EVENTS_PER_PAGE = 6;

const Events = () => {
  const { theme } = useTheme();
  const { events, loading, error } = useGetAllEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', 'Concert', 'Wedding', 'Party', 'Conference', 'Others'];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.host?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.eventCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'Active': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Cancelled': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'Ended': return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-lg animate-pulse">Loading events...</div>;
  }

  if (error) {
    return toast.error(error);
  }

  return (
    <div className={`min-h-screen ${theme.background} pt-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className={`text-4xl font-bold text-center mb-8 ${theme.text}`}>All Events</h2>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, location, or host..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <p className={`text-sm mb-4 ${theme.textSecondary}`}>
          Showing {paginatedEvents.length} of {filteredEvents.length} events
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedEvents.map((event) => (
            <div key={event._id} className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg hover:shadow-xl transition">
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
              <p className={`text-sm ${theme.textSecondary} mb-4 line-clamp-2`}>{event.description}</p>
              <div className="flex gap-2">
                <Link to={`/events/${event._id}`} className="flex-1 text-center bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition text-sm">View Details</Link>
                <Link to={`/booking/${event._id}`} className="flex-1 text-center bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition text-sm">Book Now</Link>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center mt-12">
            <p className={`text-xl ${theme.text}`}>No events found</p>
            <p className={`text-sm ${theme.textSecondary}`}>Try adjusting your search or filter</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-md bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 rounded-md transition ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-md bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;