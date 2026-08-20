import React, { useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';

const NotificationBell = () => {
  const { theme, isLightMode } = useTheme();
  const { notifications, unreadCount, markAsRead, clearNotifications } = useSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleBlur = (e) => {
    if (ref.current && !ref.current.contains(e.relatedTarget)) {
      setTimeout(() => setOpen(false), 100);
    }
  };

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      markAsRead();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref} onBlur={handleBlur}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <BellIcon className={`h-6 w-6 ${theme.text}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto ${theme.background} border border-gray-200 rounded-lg shadow-xl z-50`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className={`font-semibold ${theme.text}`}>Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={`p-6 text-center ${theme.textSecondary}`}>
              <BellIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <p className={`text-sm ${theme.text}`}>{notification.message}</p>
                  <p className={`text-xs mt-1 ${theme.textSecondary}`}>
                    {formatTime(notification.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
