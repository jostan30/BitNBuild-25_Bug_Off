import express from "express";
import {
  bookTicket,
  purchaseTicket,
  verifyPayment,
  returnTicket,
  getTicket
} from "../controllers/ticket-controller.js";
import { protect } from "../middlewares/auth.js"; // Example: auth middleware

const router = express.Router();

router.post("/book", protect, bookTicket);
router.post("/purchase", protect, purchaseTicket);
router.post("/verify", protect, verifyPayment);
router.post("/return", protect, returnTicket);
router.get("/:id", protect, getTicket);

export default router;
