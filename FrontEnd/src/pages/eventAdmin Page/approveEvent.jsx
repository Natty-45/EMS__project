// src/pages/ApproveEventPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useApproveEvent } from "../../hooks/eventAdminHook/useApproveEvent";
import useEventDetails from "../../hooks/eventHooks/useEventDetails";
import { useTheme } from "../../contexts/ThemeContext";

const ApproveEventPage = () => {
  const { eventId: id } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const { event, loading, error } = useEventDetails(id);
  const { approveEvent, loading: approving } = useApproveEvent();

  if (loading) return <p className="text-center pt-28">Loading event...</p>;
  if (error) return <p className="text-center pt-28 text-red-500">{error}</p>;
  if (!event) return <p className="text-center pt-28">Event not found.</p>;

  const handleApprove = async () => {
    const result = await approveEvent(id, "approve");
    if (result.success) {
      toast.success(result.message);
      navigate("/requested_events");
    } else {
      toast.error(result.error);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason so the user understands why.");
      return;
    }
    setRejecting(true);
    const result = await approveEvent(id, "reject", reason.trim());
    setRejecting(false);
    if (result.success) {
      toast.success(result.message);
      navigate("/requested_events");
    } else {
      toast.error(result.error);
    }
  };

  const inputClasses = `w-full p-3 rounded-md border ${
    theme.mode === "dark"
      ? "bg-gray-800 text-white border-gray-600"
      : "bg-white text-gray-800 border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className={`min-h-screen p-6 pt-28 ${theme.background} ${theme.text}`}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-semibold mb-4">{event.title}</h1>

        <img
          src={event.image?.[0] ? (event.image[0].startsWith('http') ? event.image[0] : `/uploads/${event.image[0]}`) : '/placeholder.jpg'}
          alt="Event"
          className="rounded-lg mb-4 w-full max-h-[400px] object-cover"
        />

        <div className="space-y-2">
          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {event.StartTime}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Category:</strong> {event.eventCategory}</p>
          <p><strong>Type:</strong> {event.eventType}</p>
          <p><strong>Host:</strong> {event.host}</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold mb-2">
            Rejection reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this event request is being rejected (sent to the requester by email and notification)."
            rows={3}
            className={inputClasses}
          />
        </div>

        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow disabled:opacity-50"
            disabled={approving || rejecting}
          >
            {approving ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md shadow disabled:opacity-50"
            disabled={approving || rejecting}
          >
            {rejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveEventPage;