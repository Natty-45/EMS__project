// hooks/userHooks/useGetMyEvents.js
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const useGetMyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!currentUser?._id) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/event/my-events`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setEvents(data);
        } else {
          setError(data.error || "Failed to fetch events.");
          toast.error(data.error || "Something went wrong.");
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [currentUser]);

  return { events, loading, error };
};

export default useGetMyEvents;
