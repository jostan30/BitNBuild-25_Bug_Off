import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  amount: { type: Number, required: true }, // in paise
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
