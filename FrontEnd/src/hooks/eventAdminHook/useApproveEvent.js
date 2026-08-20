// hooks/useApproveEvent.js
import { useState } from "react";

export const useApproveEvent = () => {
  const [loading, setLoading] = useState(false);

  const approveEvent = async (eventId, action, reason = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/event/approve-event/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, reason }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update event");

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { approveEvent, loading };
};
