import 'dotenv/config'; 
import express from "express";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/db.js";

import authRoutes from  "./routers/auth-router.js";
import eventRoutes from "./routers/event-router.js";
import ticketRoutes from "./routers/ticket-router.js";
import paymentRoutes from "./routers/payment-router.js"; // <-- Add payment router

const app = express();
app.use(express.json()); // Parse JSON bodies

const PORT = process.env.PORT || 5000;

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later."
});

app.use(limiter);

// Health check / test API
app.get("/", (req, res) => {
  res.send({ message: "Server is running!" });
});

// Custom APIs
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes); // <-- Mount payment routes

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
