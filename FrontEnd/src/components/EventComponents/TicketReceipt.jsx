import React from 'react';
import { TicketIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const TicketReceipt = ({ ticket, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-400 p-6 text-white text-center">
          <TicketIcon className="h-12 w-12 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">Event Ticket</h2>
        </div>

        {/* Receipt Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{ticket.eventTitle || 'Event'}</h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
              ticket.status === 'Booked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {ticket.status}
            </span>
          </div>

          {/* Dashed border separator */}
          <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {ticket.date ? new Date(ticket.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-semibold text-gray-900">{ticket.time || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900">{ticket.location || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Dashed border separator */}
          <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Ticket Type</p>
              <p className="font-semibold">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Quantity</p>
              <p className="font-semibold">{ticket.numberOfTickets}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Booking Date</p>
              <p className="font-semibold">{new Date(ticket.bookingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Ticket ID</p>
              <p className="font-semibold text-xs">{ticket._id?.slice(-8) || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="bg-gray-50 p-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition text-sm"
          >
            Print Ticket
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketReceipt;
