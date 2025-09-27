import express from "express";
import {
  createOrder,
  verifyPayment,
  paymentStatus
} from "../controllers/payment-controller.js";
import { protect } from "../middlewares/auth.js"; // JWT auth middleware

const router = express.Router();

// Create Razorpay order
router.post("/create-order", protect, createOrder);

// Verify payment and mint NFT
router.post("/verify", protect, verifyPayment);

// Check payment status for a ticket
router.get("/status/:ticketId", protect, paymentStatus);

export default router;
