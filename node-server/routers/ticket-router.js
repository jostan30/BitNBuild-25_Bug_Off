import express from "express";
import {
  bookTicket,
  purchaseTicket,
  verifyPayment,
} from "../controllers/ticket-controller.js";
import { protect} from "../middlewares/auth.js"; // Example: auth middleware

const router = express.Router();

router.post("/book", protect, bookTicket);
router.post("/purchase", protect, purchaseTicket);
router.post("/verify", protect, verifyPayment);

export default router;
