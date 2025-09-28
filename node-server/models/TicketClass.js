import mongoose from "mongoose";

const ticketClassSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  type: { type: String, enum: ["Standard", "Premium", "VIP"], required: true },
  maxSupply: { type: Number, required: true },
  price: { type: Number, required: true },
  tokenAddress: { type: String },
  supplyKey: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const TicketClass = mongoose.model("TicketClass", ticketClassSchema);
export default TicketClass;

