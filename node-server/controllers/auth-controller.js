import User from "../models/User.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAccount } from "../utils/blockchain.js";

// REGISTER
export const register = async (req, res) => {
  const { username, email, password, role, captchaToken } = req.body;

  // TODO: verify captchaToken with Google reCAPTCHA

  try {
    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const {accountId, privateKey, publicKey} = await createAccount();
    const newUser = new User({ username, email, password: hashedPassword, role, walletId: accountId, privateKey });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Signup (/auth/signup)
// curl -X POST http://localhost:5000/auth/signup \
// -H "Content-Type: application/json" \
// -d '{
//   "username": "jostan",
//   "email": "jostan@example.com",
//   "password": "Test1234",
//   "role": "user",
//   "captchaToken": "dummyCaptchaToken"
// }'

// . Login (/auth/login)
// curl -X POST http://localhost:5000/auth/login \
// -H "Content-Type: application/json" \
// -d '{
//   "email": "jostan@example.com",
//   "password": "Test1234"
// }'