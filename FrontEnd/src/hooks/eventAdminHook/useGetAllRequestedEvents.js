import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useGetAllRequestedEvents = () => {
  const [requestedEvents, setRequestedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestedEvents = async () => {
      try {
        const response = await fetch('/api/event/requested_events', {
        credentials: 'include',
      });

        // if (!response.ok) {
        //   throw new Error('Failed to fetch requested events');
        // }

        const data = await response.json();
        setRequestedEvents(data);
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestedEvents();
  }, []);

  return { requestedEvents, loading, error };
};

export default useGetAllRequestedEvents;