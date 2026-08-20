import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const useCancelTicket = () => {
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);

  const cancelTicket = async (ticketId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/tickets/${ticketId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel ticket");
      toast.success("Ticket cancelled successfully");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cancelTicket, loading };
};

export { useCancelTicket };
export default useCancelTicket;
