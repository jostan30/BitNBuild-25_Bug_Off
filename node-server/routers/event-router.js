// /events/create	POST	{ name, description, location, startTime, endTime, ticketExpiryHours, category, image, ticketClasses }	Organizer	Create event + NFT contracts
// /events/:id	PUT	{ name?, description?, ... }	Organizer	Update event
// /events/:id	DELETE	-	Organizer	Delete event
// /events	GET	-	Public	List all events
// /events/:id	GET	-	Public	Get event details
import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  getEventDetails
} from "../controllers/event-controller.js";
import { authenticateOrganizer } from "../middlewares/auth.js";

const router = express.Router();

// Organizer-only routes
router.post("/create", authenticateOrganizer, createEvent);
router.put("/:id", authenticateOrganizer, updateEvent);
router.delete("/:id", authenticateOrganizer, deleteEvent);

// Public routes
router.get("/", listEvents);
router.get("/:id", getEventDetails);

export default router;
