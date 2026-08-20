import React from 'react';
import useExportEvents from '../../hooks/eventAdminHook/useExportEvents';
import { useTheme } from '../../contexts/ThemeContext';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const AdminExport = () => {
  const { theme } = useTheme();
  const { exportEvents, loading } = useExportEvents();

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4`}>
      <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-md w-full mt-20 mb-10 text-center">
        <DocumentArrowDownIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
        <h2 className={`text-3xl font-bold mb-4 ${theme.text}`}>Export Event Data</h2>
        <p className={`mb-6 ${theme.textSecondary}`}>
          Download all event data as a CSV file for reporting and analysis.
        </p>
        <button
          onClick={exportEvents}
          disabled={loading}
          className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Exporting...' : 'Download CSV'}
        </button>
      </div>
    </div>
  );
};

export default AdminExport;
