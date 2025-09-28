import User from "../models/User.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAccount } from "../utils/blockchain.js";
import fetch from "node-fetch"; // You'll need to install this: npm install node-fetch

// Helper function to verify reCAPTCHA
const verifyRecaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('reCAPTCHA secret key not configured');
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
};

// REGISTER
export const register = async (req, res) => {
  const { username, email, password, role, userType, recaptchaToken } = req.body;

  try {
 
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ message: `User with this ${field} already exists` });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine user role based on userType or role parameter
    const userRole = userType === 'organizer' || role === 'organizer' ? 'organizer' : 'user';

    // Create user
    const {accountId, privateKey, publicKey} = await createAccount();
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role, walletId: accountId, privateKey: userRole 
    });
    
    await newUser.save();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: "Server error during registration", error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password, userType, recaptchaToken, twoFactorCode } = req.body;

  try {
    // Verify reCAPTCHA
    // if (!recaptchaToken) {
    //   return res.status(400).json({ message: "reCAPTCHA verification is required" });
    // }

    // const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
    // if (!isValidRecaptcha) {
    //   return res.status(400).json({ message: "reCAPTCHA verification failed" });
    // }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email }, { username: email }] 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user type matches (if specified)
    if (userType) {
      const expectedRole = userType === 'organizer' ? 'organizer' : 'user';
      if (user.role !== expectedRole) {
        const loginType = expectedRole === 'organizer' ? 'organizer' : 'user';
        return res.status(400).json({ 
          message: `This account is not registered as ${loginType === 'organizer' ? 'an organizer' : 'a user'}` 
        });
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Handle 2FA for organizers (if implemented)
    if (user.role === 'organizer' && user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(400).json({ 
          message: "Two-factor authentication code is required",
          requiresTwoFactor: true 
        });
      }
      
      // TODO: Verify 2FA code here
      // This would depend on your 2FA implementation (TOTP, SMS, etc.)
      // For now, we'll skip this verification
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ 
      message: "Login successful",
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error during login", error: err.message });
  }
};

// LOGOUT (optional - mainly for token blacklisting if implemented)
export const logout = async (req, res) => {
  try {
    // If you implement token blacklisting, add the token to blacklist here
    // For now, we'll just send a success response
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error during logout", error: err.message });
  }
};

// VERIFY TOKEN (middleware helper)
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(200).json({ 
      valid: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
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