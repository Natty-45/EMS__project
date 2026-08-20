import { useState } from "react";
import toast from "react-hot-toast";

const useBookTicket = (eventId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bookTicket = async ({ bookingCode, numberOfTickets, ticketType }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/event/booking/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingCode, numberOfTickets, ticketType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to book ticket.");
        toast.error(data.error || "Failed to book ticket.");
        setLoading(false);
        return false;
      }

      toast.success("Ticket booked successfully!");
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
      return false;
    }
  };

  return { bookTicket, loading, error };
};

export default useBookTicket;
