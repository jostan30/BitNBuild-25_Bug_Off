// Endpoint	Method	Body	Access	Description
// /auth/signup	POST	{ username, email, password, role, captchaToken }	Public	Signup user/organizer
// /auth/login	POST	{ email, password }	Public	Login and return JWT
import express from "express";
import { login, register, verifyToken } from "../controllers/auth-controller.js";

const router = express.Router();

// Routes
router.post("/signup", register); // changed from /register to /signup to match your API table
router.post("/login", login);
router.get('/verify-token' ,verifyToken);

export default router;
