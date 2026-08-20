import express from "express";
import VerifiedUser from "../middleware/VerifiedUser.Middleware.js";
import {
  approveRequestedEvent,
  createEvent,
  deleteEvent,
  exportEventData,
  getAllEvents,
  getAllRequestedEvents,
  getEventDetails,
  getEventsByCategory,
  getEventStats,
  getEventTickets,
  getMyEvent,
  getMyEventDetails,
  ticketBooking,
  updateEvent,
} from "../controllers/event.controller.js";
import { uploadMultiple } from "../middleware/multer.js";

const router = express.Router();

router.get("/requested_events", VerifiedUser, getAllRequestedEvents);
router.get("/my-events", VerifiedUser, getMyEvent);
router.get("/my-event/:id", VerifiedUser, getMyEventDetails);
router.get("/", getAllEvents);
router.get("/:id", getEventDetails);
router.post("/create", VerifiedUser, uploadMultiple, createEvent);
router.get("/category/:category", getEventsByCategory);
router.post("/approve-event/:id", VerifiedUser, approveRequestedEvent);
router.put("/update-event/:id", VerifiedUser,uploadMultiple, updateEvent);
router.post("/booking/:id", VerifiedUser, ticketBooking);
router.delete("/delete-event/:id", VerifiedUser, deleteEvent);
/*----------------- for status reporting ----------------- */
router.get("/:id/tickets", VerifiedUser, getEventTickets); // Get all tickets for an event
router.get("/:id/stats", VerifiedUser, getEventStats); // Get event statistics (tickets sold, revenue, etc.)
router.get("/:id/export", VerifiedUser, exportEventData); // Export event data to CSV

export default router;
