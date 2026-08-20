import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import useEventDetails from "../../hooks/eventHooks/useEventDetails";
import useBookTicket from "../../hooks/eventHooks/useBookTicket";
import { TicketIcon } from "@heroicons/react/24/outline";

const TICKET_PRICES = { Regular: 0, VIP: 25 };

const BookingPage = () => {
  const { theme } = useTheme();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { event, loading: loadingEvent, error: eventError } = useEventDetails(eventId);
  const { bookTicket, loading: bookingLoading } = useBookTicket(eventId);

  const [bookingCode, setBookingCode] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [ticketType, setTicketType] = useState("Regular");

  const textColor = theme.mode === "dark" ? "text-white" : "text-gray-800";
  const inputBg = theme.mode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300";
  const formBg = theme.mode === "dark" ? "bg-white/10 backdrop-blur-md border border-white/10" : "bg-white/70 backdrop-blur-md border border-gray-200";

  if (loadingEvent) return <div className={`text-center mt-20 ${textColor}`}>Loading...</div>;
  if (eventError) return <div className="text-center mt-20 text-red-500">{eventError}</div>;
  if (!event) return <div className={`text-center mt-20 ${textColor}`}>Event not found</div>;

  const price = TICKET_PRICES[ticketType] * numberOfTickets;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await bookTicket({
      bookingCode: event.eventType === "Private" ? bookingCode : undefined,
      numberOfTickets,
      ticketType,
    });

    if (response) {
      navigate(`/events/${eventId}`);
    }
  };

  return (
    <div className={`min-h-screen p-6 pt-28 flex justify-center items-center ${theme.background}`}>
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md p-8 rounded-xl shadow-2xl transition-all duration-300 ${formBg}`}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <TicketIcon className="h-8 w-8 text-blue-500" />
          <h2 className={`text-3xl font-extrabold ${textColor}`}>Book Tickets</h2>
        </div>

        <p className={`mb-6 text-center ${textColor}`}>
          You're booking for: <strong>{event.title}</strong>
        </p>

        {event.eventType === "Private" && (
          <div className="mb-4">
            <label className={`block mb-2 text-sm font-semibold ${textColor}`} htmlFor="bookingCode">
              Booking Code <span className="text-red-500">*</span>
            </label>
            <input
              id="bookingCode"
              type="text"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              required
              className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
              placeholder="Enter booking code"
            />
          </div>
        )}

        {/* Ticket Type Selection */}
        <div className="mb-4">
          <label className={`block mb-2 text-sm font-semibold ${textColor}`}>Ticket Type</label>
          <div className="flex gap-3">
            {Object.entries(TICKET_PRICES).map(([type, price]) => (
              <button
                key={type}
                type="button"
                onClick={() => setTicketType(type)}
                className={`flex-1 p-3 rounded-lg border-2 transition font-semibold text-sm ${
                  ticketType === type
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                {type}
                <span className="block text-xs mt-1">
                  {price === 0 ? "Free" : `$${price}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Tickets */}
        <div className="mb-4">
          <label className={`block mb-2 text-sm font-semibold ${textColor}`} htmlFor="numberOfTickets">
            Number of Tickets
          </label>
          <input
            id="numberOfTickets"
            type="number"
            min={1}
            max={10}
            value={numberOfTickets}
            onChange={(e) => setNumberOfTickets(parseInt(e.target.value, 10) || 1)}
            className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          />
        </div>

        {/* Price Summary */}
        <div className={`mb-6 p-4 rounded-lg ${theme.mode === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
          <div className="flex justify-between text-sm mb-1">
            <span className={textColor}>Ticket Type</span>
            <span className={`font-semibold ${textColor}`}>{ticketType}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className={textColor}>Quantity</span>
            <span className={`font-semibold ${textColor}`}>{numberOfTickets}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className={textColor}>Price per ticket</span>
            <span className={`font-semibold ${textColor}`}>
              {TICKET_PRICES[ticketType] === 0 ? "Free" : `$${TICKET_PRICES[ticketType]}`}
            </span>
          </div>
          <div className="border-t mt-2 pt-2 flex justify-between">
            <span className={`font-bold ${textColor}`}>Total</span>
            <span className={`font-bold text-lg ${textColor}`}>
              {price === 0 ? "Free" : `$${price}`}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={bookingLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
