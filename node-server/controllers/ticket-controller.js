import Ticket from "../models/Ticket.js";
import TicketClass from "../models/TicketClass.js";
import Event from "../models/Event.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

await dotenv.config();
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Book ticket: assign purchase slot, set status = Minted
export const bookTicket = async (req, res) => {
  try {
    const { eventId, ticketType } = req.body;
    const buyerId = req.user._id;

    // Check if user already has a ticket for this event
    const ticketClass = await TicketClass.findOne({ eventId, type: ticketType });
    if (!ticketClass) return res.status(404).json({ message: "Ticket class not found" });

    // Check if user already has an active/pending ticket for this event
    const existingTicket = await Ticket.findOne({
      ticketClassId: ticketClass._id,
      buyerId,
      status: { $in: ["Minted", "Active"] },
      paymentStatus: { $in: ["Pending", "Completed"] }
    });

    if (existingTicket) {
      return res.status(400).json({ 
        message: "You already have a ticket for this event", 
        ticket: existingTicket 
      });
    }
    
    // Create ticket with purchase slot
    const ticket = await Ticket.create({
      ticketClassId: ticketClass._id,
      buyerId,
      purchaseSlot: new Date(),
      status: "Minted",
    });

    res.status(201).json({ message: "Ticket booked successfully", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Razorpay payment + NFT mint
export const purchaseTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.paymentStatus === "Completed") {
      return res.status(400).json({ message: "Ticket already purchased" });
    }

    // Create Razorpay order
    const amount = 100 * 100; 
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: ticket._id.toString(),
      payment_capture: 1,
    });

    ticket.razorpayOrderId = order.id;
    await ticket.save();

    res.status(200).json({ message: "Razorpay order created", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

//  Razorpay payment and mint NFT
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const ticket = await Ticket.findOne({ razorpayOrderId });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const digest = hmac.digest("hex");

    if (digest !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update ticket status
    ticket.paymentStatus = "Completed";
    ticket.status = "Active";
    ticket.razorpayPaymentId = razorpayPaymentId;
    await ticket.save();

    // TODO: Mint NFT here (call your smart contract)
    // mintNFT(ticket);

    res.status(200).json({ message: "Payment verified and NFT minted", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's tickets
export const getUserTickets = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { buyerId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch tickets with populated data
    const tickets = await Ticket.find(filter)
      .populate({
        path: 'ticketClassId',
        populate: {
          path: 'eventId',
          model: 'Event'
        }
      })
      .populate('buyerId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalTickets = await Ticket.countDocuments(filter);
    const totalPages = Math.ceil(totalTickets / parseInt(limit));

    res.status(200).json({
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTickets,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Return/resell ticket
export const returnTicket = async (req, res) => {
  try {
    const { qrHash } = req.body;

    const ticket = await Ticket.findOne({ qrHash });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status !== "Active") {
      return res.status(400).json({ message: "Ticket cannot be returned" });
    }

    // Burn NFT here
    // burnNFT(ticket);

    ticket.status = "Returned";
    await ticket.save();

    res.status(200).json({ message: "Ticket returned successfully", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get ticket info
export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("ticketClassId")
      .populate("buyerId", "name email");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({ ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};