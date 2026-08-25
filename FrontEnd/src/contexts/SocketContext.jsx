import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

// Backend URL for websockets. In dev it defaults to localhost;
// in production set VITE_SOCKET_URL to your Render backend URL.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Listen for event notifications
    newSocket.on('event:approved', (data) => {
      toast.success(data.message);
      addNotification(data);
    });

    newSocket.on('event:rejected', (data) => {
      toast.error(data.reason ? `${data.message} Reason: ${data.reason}` : data.message);
      addNotification(data);
    });

    newSocket.on('event:created', (data) => {
      toast(data.message, { icon: '🎉' });
      addNotification(data);
    });

    newSocket.on('event:requested', (data) => {
      toast(data.message, { icon: '📋' });
      addNotification(data);
    });

    newSocket.on('ticket:booked', (data) => {
      toast(data.message, { icon: '🎟' });
      addNotification(data);
    });

    const addNotification = (data) => {
      const notification = {
        id: Date.now(),
        ...data,
        read: false,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    };

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  const markAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
