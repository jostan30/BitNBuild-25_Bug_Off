import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organiserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String },
  location: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  ticketExpiryHours: { type: Number, default: 4 },
  category: { type: String },      // e.g., Music, Sports, Conference
  image: { type: String },         // URL to event image
  ticketClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "TicketClass" }],
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", eventSchema);
export default Event;