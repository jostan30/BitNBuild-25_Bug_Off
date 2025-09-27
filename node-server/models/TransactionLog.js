import mongoose from "mongoose";

const transactionLogSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  txHash: { type: String },               // Blockchain transaction hash
  action: { type: String, enum: ["Mint", "Transfer", "Burn", "Resale", "Payment"], required: true },
  razorpayPaymentId: { type: String },    // Optional
  timestamp: { type: Date, default: Date.now }
});

export const TransactionLog = mongoose.model("TransactionLog", transactionLogSchema);
