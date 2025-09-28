import Event from "../models/Event.js";
import TicketClass from "../models/TicketClass.js";

// Create Event + Ticket Classes (Organizer Only)
export const createEvent = async (req, res) => {
  try {
    const { name, description, location, startTime, endTime, ticketExpiryHours, category, image, ticketClasses } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: "Name, startTime and endTime are required" });
    }

    // Create Event
    const event = new Event({
      name,
      organiserId: req.user.id,
      description,
      location,
      startTime,
      endTime,
      ticketExpiryHours,
      category,
      image,
    });

    await event.save();

    // Optional: Create Ticket Classes
    if (ticketClasses && ticketClasses.length > 0) {
      const createdClasses = [];
      for (const cls of ticketClasses) {
        const ticketClass = new TicketClass({
          eventId: event._id,
          type: cls.type,
          maxSupply: cls.maxSupply,
          price: cls.price,
          tokenAddress: cls.tokenAddress || null,
        });
        await ticketClass.save();
        createdClasses.push(ticketClass._id);
      }
      event.ticketClasses = createdClasses;
      await event.save();
    }

    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Event (Organizer Only)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Debug logging
    console.log("Update - Event organiserId:", event.organiserId.toString());
    console.log("Update - Request user id:", req.user.id);

    if (event.organiserId.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Unauthorized - You can only update your own events",
        debug: process.env.NODE_ENV === 'development' ? {
          eventOrganizerId: event.organiserId.toString(),
          requestUserId: req.user.id
        } : undefined
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      event[key] = req.body[key];
    });

    await event.save();
    res.json({ message: "Event updated successfully", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Event (Organizer Only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Debug logging
    console.log("Delete - Event organiserId:", event.organiserId);
    console.log("Delete - Event organiserId type:", typeof event.organiserId);
    console.log("Delete - Event organiserId toString:", event.organiserId.toString());
    console.log("Delete - Request user:", req.user);
    console.log("Delete - Request user id:", req.user.id);
    console.log("Delete - Request user id type:", typeof req.user.id);
    console.log("Delete - Are they equal?", event.organiserId.toString() === req.user.id);

    if (event.organiserId.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Unauthorized - You can only delete your own events",
        debug: process.env.NODE_ENV === 'development' ? {
          eventOrganizerId: event.organiserId.toString(),
          requestUserId: req.user.id,
          equal: event.organiserId.toString() === req.user.id
        } : undefined
      });
    }

    await TicketClass.deleteMany({ eventId: event._id });
    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// List All Events (Public) - but organizer gets only their events
export const listEvents = async (req, res) => {
  try {
    let query = {};
    
    // If user is authenticated and is an organizer, only show their events
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role === 'organizer') {
          query = { organiserId: decoded.id };
          console.log("Filtering events for organizer:", decoded.id);
        }
      } catch (authError) {
        // If token is invalid, just return public events (empty query)
        console.log("Token invalid or missing, showing all events");
      }
    }
    
    const events = await Event.find(query).populate("ticketClasses");
    console.log(`Found ${events.length} events with query:`, query);
    res.json({ events });
  } catch (err) {
    console.error("List events error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Event Details (Public)
export const getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate("ticketClasses");
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    console.log("Getting events for organizer:", req.user.id);
    
    const events = await Event.find({ organiserId: req.user.id }).populate("ticketClasses");
    
    console.log(`Found ${events.length} events for organizer ${req.user.id}`);
    
    res.json({ 
      events,
      message: `Found ${events.length} events`,
      organizerId: req.user.id 
    });
  } catch (err) {
    console.error("Get my events error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};