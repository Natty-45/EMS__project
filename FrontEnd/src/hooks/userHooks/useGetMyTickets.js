import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const useGetMyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!currentUser?._id) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/user/tickets", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setTickets(data);
        } else {
          // 404 is expected when user has no tickets
          if (res.status === 404) {
            setTickets([]);
          } else {
            setError(data.error || "Failed to fetch tickets.");
            toast.error(data.error || "Something went wrong.");
          }
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [currentUser]);

  return { tickets, loading, error };
};

export default useGetMyTickets;
