// src/pages/ApproveEventPage.jsx
import React from "react";
import { useParams } from "react-router-dom";

import { useApproveEvent } from "../../hooks/eventAdminHook/useApproveEvent";
import useEventDetails from "../../hooks/eventHooks/useEventDetails";
import { useTheme } from "../../contexts/ThemeContext";

const ApproveEventPage = () => {
  const { id } = useParams();
  const { theme } = useTheme();

  const { event, loading, error } = useEventDetails(id);
  const { approveEvent, loading: approving } = useApproveEvent();

  if (loading) return <p className="text-center">Loading event...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!event) return <p className="text-center">Event not found.</p>;

  return (
    <div className={`min-h-screen p-6 ${theme.background} ${theme.text}`}>
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

        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={() => approveEvent(id, "approve")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow disabled:opacity-50"
            disabled={approving}
          >
            {approving ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => approveEvent(id, "reject")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md shadow disabled:opacity-50"
            disabled={approving}
          >
            {approving ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveEventPage;
