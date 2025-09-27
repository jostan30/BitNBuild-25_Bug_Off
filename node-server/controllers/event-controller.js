import  Event  from "../models/Event.js";
import  TicketClass  from "../models/TicketClass.js";

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

    if (event.organiserId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
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
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organiserId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await TicketClass.deleteMany({ eventId: event._id }); // Delete related ticket classes
    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// List All Events (Public)
export const listEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("ticketClasses");
    res.json({ events });
  } catch (err) {
    console.error(err);
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



// curl -X POST http://localhost:5000/api/events/create \
// -H "Content-Type: application/json" \
// -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDg0YTlmODQxNmY3ODU4ODQ3NTEyMCIsInJvbGUiOiJvcmdhbml6ZXIiLCJpYXQiOjE3NTkwMDUzNTEsImV4cCI6MTc1OTA5MTc1MX0.wJjUNHubjUky6OHLfF91XDMKB5wC9uAoeSnk7aeco9M" \
// -d '{
//   "name": "Music Fest 2025",
//   "description": "Annual music festival with live bands",
//   "location": "City Park",
//   "startTime": "2025-12-15T10:00:00Z",
//   "endTime": "2025-12-15T22:00:00Z",
//   "ticketExpiryHours": 4,
//   "category": "Music",
//   "image": "https://example.com/event-image.jpg",
//   "ticketClasses": [
//     { "type": "Standard", "maxSupply": 500, "price": 50 },
//     { "type": "VIP", "maxSupply": 100, "price": 150 }
//   ]
// }'


// Update Event
// curl -X PUT http://localhost:5000/api/events/68d84c53ea2ed0fb1eb25899 \
// -H "Content-Type: application/json" \
// -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDg0YTlmODQxNmY3ODU4ODQ3NTEyMCIsInJvbGUiOiJvcmdhbml6ZXIiLCJpYXQiOjE3NTkwMDUzNTEsImV4cCI6MTc1OTA5MTc1MX0.wJjUNHubjUky6OHLfF91XDMKB5wC9uAoeSnk7aeco9M" \
// -d '{
//   "description": "Updated description: added keynote speakers",
//   "location": "Main Hall, Convention Center"
// }'


// 2️⃣ Get Event Details (Public)
// curl -X GET http://localhost:5000/api/events/68d84c53ea2ed0fb1eb25899


// 3️⃣ List All Events (Public)
// curl -X GET http://localhost:5000/api/events


// 4️⃣ Delete Event (Organizer Only)
// curl -X DELETE http://localhost:5000/api/events/68d84c53ea2ed0fb1eb25899 \
// -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDg0YTlmODQxNmY3ODU4ODQ3