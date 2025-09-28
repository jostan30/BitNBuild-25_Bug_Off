// Endpoint	Method	Body	Access	Description
// /auth/signup	POST	{ username, email, password, role, captchaToken }	Public	Signup user/organizer
// /auth/login	POST	{ email, password }	Public	Login and return JWT
import express from "express";
import { getProfile, login, register, updateProfile, verifyToken } from "../controllers/auth-controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Routes
router.post("/signup", register); // changed from /register to /signup to match your API table
router.post("/login", login);
router.get('/verify-token' ,verifyToken);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

export default router;
