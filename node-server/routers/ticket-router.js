import express from "express";
import {
  bookTicket,
  purchaseTicket,
  verifyPayment,
  getUserTickets,
  getTicket,
  returnTicket
} from "../controllers/ticket-controller.js";
import { protect} from "../middlewares/auth.js";

const router = express.Router();

router.post("/book", protect, bookTicket);
router.post("/purchase", protect, purchaseTicket);
router.post("/verify", protect, verifyPayment);
router.get("/my-tickets", protect, getUserTickets);
router.get("/:id", protect, getTicket);
router.post("/return", protect, returnTicket);

export default router;