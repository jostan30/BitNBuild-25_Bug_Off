import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketClassId: { type: mongoose.Schema.Types.ObjectId, ref: "TicketClass", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  serial: { type: Number },
  qrHash: { type: String, unique:  true , sparse: true },
  status: { type: String, enum: ["Minted", "Active", "Used", "Returned", "Expired"], default: "Minted" },
  purchaseSlot: { type: Date },
  paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;


