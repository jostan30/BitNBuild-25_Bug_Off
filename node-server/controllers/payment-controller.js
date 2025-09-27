import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { mintAndTransferNFT } from "../utils/blockchain.js";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function getTicketMetadata(ticketId) {
  const result = await Ticket.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(ticketId) } },

    // Join with TicketClass
    {
      $lookup: {
        from: "ticketclasses",
        localField: "ticketClassId",
        foreignField: "_id",
        as: "ticketClass"
      }
    },
    { $unwind: "$ticketClass" },

    // Join with Event
    {
      $lookup: {
        from: "events",
        localField: "ticketClass.eventId",
        foreignField: "_id",
        as: "event"
      }
    },
    { $unwind: "$event" },

    // Join with buyer (User)
    {
      $lookup: {
        from: "users",
        localField: "buyerId",
        foreignField: "_id",
        as: "buyer"
      }
    },
    { $unwind: "$buyer" },

    // Join with organiser (User)
    {
      $lookup: {
        from: "users",
        localField: "event.organiserId",
        foreignField: "_id",
        as: "organiser"
      }
    },
    { $unwind: "$organiser" },

    // Project only the fields needed for NFT metadata
    {
      $project: {
        buyerId: "$buyer._id",
        buyerUsername: "$buyer.username",
        tokenAddress: "$ticketClass.tokenAddress",
        organiserWalletId: "$organiser.walletId",
        organiserPrivateKey: "$organiser.privateKey",
        supplyKeyStr: "$ticketClass.supplyKey",
        eventName: "$event.name",
        eventStartTime: "$event.startTime",
        eventEndTime: "$event.endTime",
        ticketType: "$ticketClass.type",
        serial: "$serial",
        qrHash: "$qrHash"
      }
    }
  ]);

  return result[0]; // single ticket metadata
}

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
    
    const details = await getTicketMetadata(ticketId);
    if (!details) {
      return res.status(404).json({ message: "Ticket details not found for NFT minting" });
    }

    const metadata = Buffer.from(JSON.stringify({
      event: details.eventName,
      startTime: details.eventStartTime,
      username: details.buyerUsername,
    })).toString("hex");

    const serialNumber = await mintAndTransferNFT(
      details.tokenAddress,
      [metadata],
      details.buyerId.toString(),
      details.organiserWalletId,
      details.supplyKeyStr,
      details.buyerPrivateKey,
      details.organiserPrivateKey
    );
    console.log(`Minted NFT with serial number: ${serialNumber}`);
    
    await Ticket.findByIdAndUpdate(ticketId, { serial: parseInt(serialNumber) });
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
