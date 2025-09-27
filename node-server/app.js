import 'dotenv/config'; 
import express from "express";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/db.js";

const app = express();
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to start server:", err);
});
