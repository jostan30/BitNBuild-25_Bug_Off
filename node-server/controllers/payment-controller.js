import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Ticket from "../models/Ticket.js";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
export const createOrder = async (req, res) => {
  try {
    const { ticketId, amount } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: ticketId,
      payment_capture: 1,
    });

    await Payment.create({
      ticketId,
      amount,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    res.status(200).json({ message: "Razorpay order created", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { ticketId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    await Payment.findOneAndUpdate(
      { ticketId, razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: "Completed" }
    );

    await Ticket.findByIdAndUpdate(ticketId, { status: "Active", paymentStatus: "Completed" });

    // TODO: Mint NFT
    // mintNFT(ticketId);

    res.status(200).json({ message: "Payment verified and NFT minted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Payment status
export const paymentStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const payment = await Payment.findOne({ ticketId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ ticketId, status: payment.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
