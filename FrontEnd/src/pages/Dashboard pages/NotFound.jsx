import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
      <div className="text-center px-4">
        <h1 className={`text-9xl font-extrabold ${theme.text} mb-4`}>404</h1>
        <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Page Not Found</h2>
        <p className={`text-lg ${theme.textSecondary} mb-8`}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-600 transition inline-block"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
