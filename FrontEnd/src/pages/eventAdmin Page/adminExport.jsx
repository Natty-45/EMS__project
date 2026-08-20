import React, { useState } from 'react';
import useExportEvents from '../../hooks/eventAdminHook/useExportEvents';
import { useTheme } from '../../contexts/ThemeContext';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import EventSelector from '../../components/ui/EventSelector';

const AdminExport = () => {
  const { theme } = useTheme();
  const { exportEvents, loading } = useExportEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleExport = () => {
    if (!selectedEvent) return;
    exportEvents(selectedEvent._id);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4`}>
      <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-xl w-full mt-20 mb-10">
        <DocumentArrowDownIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
        <h2 className={`text-3xl font-bold mb-2 text-center ${theme.text}`}>Export Event Data</h2>
        <p className={`mb-6 text-center ${theme.textSecondary}`}>
          Choose an event (or export all) and download its data as a CSV file.
        </p>

        <EventSelector
          onSelect={setSelectedEvent}
          allowAll
          label="Which event would you like to export?"
        />

        <button
          onClick={handleExport}
          disabled={loading || !selectedEvent}
          className="w-full mt-6 bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Exporting...' : selectedEvent ? `Download "${selectedEvent.title}" CSV` : 'Choose an event to export'}
        </button>
      </div>
    </div>
  );
};

export default AdminExport;