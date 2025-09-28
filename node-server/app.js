import dotenv from 'dotenv';
import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors"; // <-- import cors
import connectDB from "./utils/db.js";

import authRoutes from  "./routers/auth-router.js";
import eventRoutes from "./routers/event-router.js";
import ticketRoutes from "./routers/ticket-router.js";
import paymentRoutes from "./routers/payment-router.js"; 

await dotenv.config();
const app = express();
app.use(express.json()); // Parse JSON bodies

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g., "http://localhost:3000"
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

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

// Health check
app.get("/", (req, res) => {
  res.send({ message: "Server is running!" });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes); 

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
