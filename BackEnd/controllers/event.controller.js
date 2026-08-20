import cron from "node-cron";
import { Parser } from "json2csv";

import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import RequestedEvent from "../models/requestedEvent.model.js";
import transporter from "../nodeMailer/nodeMailer.config.js";
import { emitToAll, emitToUser, emitToRole } from "../utils/socket.js";

// Auto-end past events (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    await Event.updateMany(
      { date: { $lt: now }, eventStatus: { $nin: ['Ended', 'Cancelled'] } },
      { $set: { eventStatus: 'Ended' } }
    );
    console.log('Auto-ended past events');
  } catch (error) {
    console.error('Error auto-ending events:', error.message);
  }
});

// controllers/eventController.js

export const createEvent = async (req, res, next) => {
  const userId = req.userId;
  const userRole = req.userRole;

  const {
    title,
    description,
    date,
    StartTime,
    location,
    eventType,
    eventCategory,
    host,
    bookingCode,  // Changed from eventPassword to bookingCode for clarity
  } = req.body;

  const imageFilenames = req.files?.map(file => file.filename);

  if (!title || !description || !date || !StartTime || !location || !eventType || !eventCategory || !host) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  if (eventType === "Private" && !bookingCode) {
    return res.status(400).json({ error: "Booking code is required for private events." });
  }

  try {
    const existingEvent = await Event.findOne({ title });
    const existingRequestedEvent = await RequestedEvent.findOne({ title });

    if (existingEvent || existingRequestedEvent) {
      return res.status(400).json({ error: "Event already exists!" });
    }

    const commonData = {
      title,
      description,
      date,
      StartTime,
      location,
      image: imageFilenames,
      eventType,
      eventCategory,
      host,
      bookingCode: eventType === "Private" ? bookingCode : undefined,
    };

    let eventDoc;
    if (userRole === "Admin") {
      eventDoc = new Event({ ...commonData, createdBy: userId });
    } else {
      eventDoc = new RequestedEvent({ ...commonData, requester: userId });
    }

    await eventDoc.save();

    // Emit real-time notification
    if (userRole === 'Admin') {
      emitToAll('event:created', { event: eventDoc, message: `New event: ${eventDoc.title}` });
    } else {
      emitToRole('Admin', 'event:requested', { event: eventDoc, message: `New event request: ${eventDoc.title}` });
    }

    res.status(201).json(eventDoc);
  } catch (error) {
    next(error);
  }
};



export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ eventStatus: { $nin: ["Cancelled", "Ended"] } });
    if (!events || events.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getAllRequestedEvents = async (req, res, next) => {
  const userRole = req.userRole;

  if (userRole !== "Admin") {
    return res.status(403).json({
      error: "Access Denied. Only Admins can view all requested events!",
    });
  }
  try {
    const requestedEvents = await RequestedEvent.find();
    console.log(requestedEvents);

    if (!requestedEvents) {
      return res.status(200).json([]); // Return empty array instead of null
    }

    res.status(200).json(requestedEvents);
  } catch (error) {
    next(error);
  }
};


export const getEventsByCategory = async (req, res, next) => {
  const category = req.params.category;
  try {
    const events = await Event.find({ eventCategory: category });
    if (!events) {
      return res.status(404).json({ error: "No events found!" });
    }
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const approveRequestedEvent = async (req, res, next) => {
  const userRole = req.userRole;
  if (userRole !== "Admin") {
    return res.status(403).json({
      error: "Access Denied. Only Admins can approve requested events!",
    });
  }
  const eventId = req.params.id;
  const { action } = req.body;
  try {
    const requestedEvent = await RequestedEvent.findById(eventId);
    if (!requestedEvent) {
      return res.status(404).json({ error: "Requested event not found!" });
    }

    if (action === "approve") {
      const event = new Event({
        title: requestedEvent.title,
        description: requestedEvent.description,
        date: requestedEvent.date,
        StartTime: requestedEvent.StartTime,
        location: requestedEvent.location,
        image: requestedEvent.image,
        eventType: requestedEvent.eventType,
        eventCategory: requestedEvent.eventCategory,
        host: requestedEvent.host,
        createdBy: requestedEvent.requester,
        bookingCode: requestedEvent.bookingCode,
      });
      await event.save();
      await RequestedEvent.findByIdAndDelete(eventId);

      // Send approval email to the requester
      const user = await User.findById(requestedEvent.requester);
      if (user) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: `Event Approved: ${event.title}`,
            html: `<h2>Your event has been approved!</h2><p>Your event <strong>${event.title}</strong> has been approved and is now live.</p><p>Best regards,<br>EMS Team</p>`,
          });
        } catch (emailError) {
          console.error('Error sending approval email:', emailError.message);
        }
      }
      // Emit real-time notification to the requester
      emitToUser(requestedEvent.requester.toString(), 'event:approved', {
        event,
        message: `Your event "${event.title}" has been approved!`,
      });

      res
        .status(200)
        .json({ message: "Event approved and created successfully.", event });
    } else if (action === "reject") {
      requestedEvent.requestEventStatus = "Rejected";
      await requestedEvent.save();

      // Send rejection email to the requester
      const user = await User.findById(requestedEvent.requester);
      if (user) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: `Event Rejected: ${requestedEvent.title}`,
            html: `<h2>Your event request was not approved</h2><p>Your event <strong>${requestedEvent.title}</strong> was not approved at this time.</p><p>You can create a new event request with modifications.</p><p>Best regards,<br>EMS Team</p>`,
          });
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError.message);
        }
      }
      // Delete after 3 minutes using setTimeout instead of cron
      setTimeout(async () => {
        try {
          await RequestedEvent.findByIdAndDelete(eventId);
          console.log(`Rejected event ${eventId} deleted after 3 minutes.`);
        } catch (err) {
          console.error('Error deleting rejected event:', err.message);
        }
      }, 3 * 60 * 1000);

      // Emit real-time notification to the requester
      emitToUser(requestedEvent.requester.toString(), 'event:rejected', {
        event: requestedEvent,
        message: `Your event "${requestedEvent.title}" was not approved.`,
      });

      res
        .status(200)
        .json({ message: "Event request declined.", requestedEvent });
    } else {
      return res.status(400).json({ error: "Invalid action!" });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyEvent = async (req, res, next) => {
  const userId = req.userId;

  try {
    const approvedEvents = await Event.find({ createdBy: userId });
    const requestedEvents = await RequestedEvent.find({ requester: userId });

    // Combine both with a source flag to identify
    const allEvents = [
      ...approvedEvents.map((e) => ({ ...e._doc, source: "event" })),
      ...requestedEvents.map((e) => ({ ...e._doc, source: "requested" })),
    ];

    res.status(200).json(allEvents);
  } catch (error) {
    next(error);
  }
};


export const getMyEventDetails = async (req, res, next) => {
  const userId = req.userId;
  const userRole = req.userRole;
  const eventId = req.params.id;

  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  try {
    let event = null;

    if (userRole === "Admin") {
      // Admin can get any event by ID from either collection
      event = await Event.findById(eventId) || await RequestedEvent.findById(eventId);
    } else {
      // Regular user can only get events they created/requested
      event = await Event.findOne({ _id: eventId, createdBy: userId });

      if (!event) {
        event = await RequestedEvent.findOne({ _id: eventId, requester: userId });
      }
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found or access denied" });
    }

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};


export const getEventDetails = async (req, res, next) => {
  const eventId = req.params.id;

  try {
    // Fetch the event from either the Event or RequestedEvent schema
    let event =
      (await Event.findById(eventId)) ||
      (await RequestedEvent.findById(eventId));

    // If no event found, return a 404 error
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  const userRole = req.userRole; // User's role (admin or user)
  const userId = req.userId; // User's ID (assumed to be passed as a parameter or from authentication)
  const eventId = req.params.id; // Event ID to update
  const {
    title,
    description,
    date,
    StartTime,
    location,
    image,
    eventType,
    eventCategory,
    host,
  } = req.body;

const imageFilenames = req.files?.map(file => file.filename) || [];
// Handle existing images (sent as JSON string from frontend)
let existingImages = [];
if (req.body.existingImages) {
  try {
    existingImages = JSON.parse(req.body.existingImages);
  } catch (e) {
    existingImages = [];
  }
}
const allImages = [...existingImages, ...imageFilenames];

  try {
    let event;

    // Admin can only update events from the Event schema
    if (userRole === "Admin") {
      // Admin can only update events from the Event schema (approved)
      event = await Event.findById(eventId);

      // If not found in Event schema, return 404
      if (!event) {
        return res
          .status(404)
          .json({ error: "Event not found or access denied" });
      }

      // Admin can only update their own event, not others'
      if (event.createdBy?.toString() !== userId?.toString() && 
          event.requester?.toString() !== userId?.toString()) {
        return res.status(403).json({
          error: "Access Denied. You can only update your own event!",
        });
      }
    } else {
      // User can update events in both the Event or RequestedEvent schema
      event =
        (await Event.findById(eventId)) ||
        (await RequestedEvent.findById(eventId));

      // If not found in either schema, return 404
      if (!event) {
        return res
          .status(404)
          .json({ error: "Event not found or access denied" });
      }

      // User can only update their own event, regardless of whether it's approved or pending
      if (event.createdBy?.toString() !== userId?.toString() && 
          event.requester?.toString() !== userId?.toString()) {
        return res.status(403).json({
          error: "Access Denied. You can only update your own event!",
        });
      }
    }

    // Update the event details
    event.title = title;
    event.description = description;
    event.date = date;
    event.StartTime = StartTime;
    event.location = location;
    event.image = allImages;
    event.eventType = eventType;
    event.eventCategory = eventCategory;
    event.host = host;

    // Save the updated event
    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  const userRole = req.userRole; // User's role (admin or user)
  const userId = req.userId; // User's ID (assumed to be passed as a parameter or from authentication)
  const eventId = req.params.id; // Event ID to delete

  try {
    let event;

    // both admin and user can delete events
    if (userRole === "Admin") {
      event = await Event.findById(eventId);
    } else {
      event =
        (await Event.findById(eventId)) ||
        (await RequestedEvent.findById(eventId));
    }

    // If not found in either schema, return 404
    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or access denied" });
    }

    // User can only delete their own event, regardless of whether it's approved or pending
    const isOwner = event.createdBy?.toString() === userId?.toString() || event.requester?.toString() === userId?.toString();
    if (!isOwner && userRole !== "Admin") {
      return res
        .status(403)
        .json({ error: "Access Denied. You can only delete your own event!" });
    }

    // Delete the event
    await event.deleteOne();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const ticketBooking = async (req, res, next) => {
  const userRole = req.userRole;
  const userId = req.userId;
  const eventId = req.params.id;
  let { bookingCode, numberOfTickets } = req.body;

  try {
    if (userRole === "Admin") {
      return res.status(403).json({ error: "Admins cannot book tickets." });
    }

    // Only find event in approved events collection
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found or not approved yet." });
    }

    if (event.eventType === "Private") {
      if (!bookingCode) {
        return res.status(400).json({ error: "Booking code is required for private events." });
      }
      if (event.bookingCode !== bookingCode) {
        return res.status(403).json({ error: "Incorrect booking code for private event." });
      }
    } else {
      bookingCode = undefined;
    }

    const { ticketType } = req.body;
    const validTicketType = ['Regular', 'VIP'].includes(ticketType) ? ticketType : 'Regular';
    const ticketPrices = { Regular: 0, VIP: 25 };

    const newTicket = new Ticket({
      eventId: event._id,
      userId,
      ticketType: validTicketType,
      ticketPrice: ticketPrices[validTicketType],
      numberOfTickets: numberOfTickets || 1,
    });

    await newTicket.save();

    // Emit real-time notification to event creator
    if (event.createdBy) {
      emitToUser(event.createdBy.toString(), 'ticket:booked', {
        ticket: newTicket,
        event,
        message: `A ticket was booked for "${event.title}"`,
      });
    }

    res.status(200).json({ message: "Ticket booked successfully", ticket: newTicket });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  // Get all tickets for an event
  const eventId = req.params.id; // Event ID to retrieve tickets for
  const userRole = req.userRole; // only Admins can view event tickets

  if (userRole !== "superAdmin" && userRole !== "Admin") {
    return res
      .status(403)
      .json({ error: "Access Denied. Only Admins can view event tickets!" });
  }

  try {
    const event = await Event.findById(eventId);

    // If event is not found, return 404
    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or access denied" });
    }

    const tickets = await Ticket.find({ eventId: event._id }); // Find tickets for the event

    res.status(200).json({ tickets });
  } catch (error) {
    next(error);
  }
};

export const getEventStats = async (req, res, next) => {
  const eventId = req.params.id; // Event ID to retrieve statistics for
  const userRole = req.userRole; // User's role (admin or user)

  if (userRole !== "superAdmin" && userRole !== "Admin") {
    return res
      .status(403)
      .json({ error: "Access Denied. Only Admins can view event statistics!" });
  }

  try {
    const event = await Event.findById(eventId);

    // If event is not found, return 404
    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or access denied" });
    }

    // Fetch all tickets for the event
    const tickets = await Ticket.find({ eventId: eventId });

    // Calculate statistics
    const totalTicketsSold = tickets.reduce(
      (sum, ticket) => sum + ticket.numberOfTickets,
      0
    );
    const totalRevenue = tickets.reduce(
      (sum, ticket) => sum + (ticket.ticketPrice || 0) * ticket.numberOfTickets,
      0
    );

    // Calculate the number of tickets sold per ticket type (e.g., Regular, VIP)
    const ticketTypes = {
      Regular: tickets.filter((ticket) => ticket.ticketType === "Regular")
        .length,
      VIP: tickets.filter((ticket) => ticket.ticketType === "VIP").length,
    };

    // Return the statistics
    res.status(200).json({
      event: {
        title: event.title,
        date: event.date,
        location: event.location,
      },
      stats: {
        totalTicketsSold,
        totalRevenue,
        ticketTypes,
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    next(error); // Pass error to next middleware for centralized error handling
  }
};

export const exportEventData = async (req, res, next) => {
  const userRole = req.userRole; // User's role (admin or user)

  if (userRole !== "superAdmin" && userRole !== "Admin") {
    return res
      .status(403)
      .json({ error: "Access Denied. Only Admins can export event data!" });
  }
  try {
    const events = await Event.find(); // Fetch all events

    // Create CSV data
    const csvData = events.map((event) => ({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.StartTime,
      location: event.location,
      image: event.image,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      eventStatus: event.eventStatus,
      host: event.host,
      createdBy: event.createdBy, // This can be populated with user info if needed
      bookingCode: event.bookingCode, // Only for private events
      locked: event.locked, // Event lock status
    }));

    // Convert to CSV using json2csv
    const parser = new Parser();
    const csv = parser.parse(csvData);

    // Set headers and send the CSV as a response
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="events.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    next(error); // Pass error to the next middleware
  }
};
