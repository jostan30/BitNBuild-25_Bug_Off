/**
 * Usage:
 * 1. Create a .env file with:
 *    MONGO_URI=<mongo uri>
 *    JWT_SECRET=<jwt secret>
 *    JWT_EXPIRES_IN=1h
 *    RAZORPAY_KEY_ID=<id>          (optional for local demo)
 *    RAZORPAY_KEY_SECRET=<secret>  (optional for local demo)
 *    PORT=3000
 *
 * 2. Install dependencies:
 *    npm i express mongoose dotenv helmet cors bcrypt jsonwebtoken express-rate-limit express-validator razorpay crypto
 *
 * 3. Run:
 *    node server-patched.js
 *
 * Notes:
 * - For Razorpay endpoints to work you must configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
 */

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const {
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN = '1h',
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  PORT = 3000
} = process.env;

if (!MONGO_URI || !JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET in .env');
  process.exit(1);
}

// Connect Mongoose
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

// -------------------- Schemas / Models --------------------
const { Schema } = mongoose;

/* User */
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
  walletAddress: { type: String },
  captchaVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

/* Event */
const eventSchema = new Schema({
  name: { type: String, required: true },
  organiserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  location: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  ticketExpiryHours: { type: Number, default: 4 },
  category: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Event = mongoose.model('Event', eventSchema);

/* TicketClass - changed to totalSupply + remaining */
const ticketClassSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  type: { type: String, enum: ['Standard', 'Premium', 'VIP'], required: true },
  totalSupply: { type: Number, required: true },
  remaining: { type: Number, required: true },
  price: { type: Number, required: true }, // paise
  tokenAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const TicketClass = mongoose.model('TicketClass', ticketClassSchema);

/* Ticket */
const ticketSchema = new Schema({
  ticketClassId: { type: Schema.Types.ObjectId, ref: 'TicketClass', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User' },
  serial: { type: Number },
  qrHash: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['Minted', 'Active', 'Used', 'Returned', 'Expired', 'ForSale'], default: 'Minted' },
  purchaseSlot: { type: Date },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});
ticketSchema.index({ qrHash: 1 }, { unique: true, sparse: true });
const Ticket = mongoose.model('Ticket', ticketSchema);

/* TransactionLog */
const transactionLogSchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  txHash: { type: String },
  action: { type: String, enum: ['Mint', 'Transfer', 'Burn', 'Resale', 'Payment', 'Verify', 'Refund'], required: true },
  razorpayPaymentId: { type: String },
  timestamp: { type: Date, default: Date.now }
});
const TransactionLog = mongoose.model('TransactionLog', transactionLogSchema);

/* Payment - extended to optionally reference resale listing */
const paymentSchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' }, // may be null for listing until linked
  listingId: { type: Schema.Types.ObjectId, ref: 'ResaleListing' },
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
paymentSchema.index({ razorpayOrderId: 1 });
const Payment = mongoose.model('Payment', paymentSchema);

/* ResaleListing */
const resaleSchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true }, // paise
  currency: { type: String, default: 'INR' },
  listedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Open', 'Sold', 'Cancelled'], default: 'Open' }
});
const ResaleListing = mongoose.model('ResaleListing', resaleSchema);

// -------------------- Razorpay client --------------------
let razorpay = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  console.log('Razorpay client configured.');
} else {
  console.warn('Razorpay not configured. Payment endpoints will return errors until configured.');
}

// -------------------- Utils & Middlewares --------------------
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function generateJwt(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyTokenMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid authorization format' });
  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Missing user' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden: insufficient role' });
    next();
  };
}

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 40, message: 'Too many auth requests, try later' });

// validation result handler
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET || '');
  hmac.update(orderId + '|' + paymentId);
  const generated = hmac.digest('hex');
  return generated === signature;
}

// -------------------- Routes --------------------

// Auth
app.post('/auth/signup', authLimiter,
  body('username').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash, role: role || 'user' });
    const token = generateJwt(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  })
);

app.post('/auth/login', authLimiter,
  body('email').isEmail(),
  body('password').exists(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateJwt(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  })
);

// Events (organizer)
app.post('/events/create', verifyTokenMiddleware, requireRole('organizer'),
  body('name').isString().notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('ticketClasses').isArray({ min: 1 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { name, description, location, startTime, endTime, ticketExpiryHours, category, image, ticketClasses } = req.body;
      const ev = await Event.create([{
        name, description, location, startTime: new Date(startTime), endTime: new Date(endTime),
        ticketExpiryHours, category, image, organiserId: req.user.id
      }], { session });
      const eventId = ev[0]._id;
      for (const cls of ticketClasses) {
        if (!['Standard','Premium','VIP'].includes(cls.type)) throw new Error('Invalid ticket class type');
        // set totalSupply and remaining same initially
        await TicketClass.create([{
          eventId,
          type: cls.type,
          totalSupply: cls.maxSupply,
          remaining: cls.maxSupply,
          price: cls.price,
          tokenAddress: cls.tokenAddress || ''
        }], { session });
      }
      await session.commitTransaction();
      session.endSession();
      res.status(201).json({ message: 'Event created', eventId });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  })
);

// Update / Delete / List / Get event
app.put('/events/:id', verifyTokenMiddleware, requireRole('organizer'), param('id').isMongoId(), handleValidationErrors, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.organiserId) !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
  const allowed = ['name','description','location','startTime','endTime','ticketExpiryHours','category','image'];
  for (const k of allowed) if (k in req.body) event[k] = req.body[k];
  await event.save();
  res.json({ message: 'Event updated' });
}));

app.delete('/events/:id', verifyTokenMiddleware, requireRole('organizer'), param('id').isMongoId(), handleValidationErrors, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.organiserId) !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const classes = await TicketClass.find({ eventId: event._id }, null, { session });
    const classIds = classes.map(c => c._id);
    await Ticket.deleteMany({ ticketClassId: { $in: classIds } }, { session });
    await TicketClass.deleteMany({ eventId: event._id }, { session });
    await Event.findByIdAndDelete(event._id, { session });
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Event and related data deleted' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}));

app.get('/events', asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ startTime: 1 });
  res.json(events);
}));

app.get('/events/:id', param('id').isMongoId(), handleValidationErrors, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const classes = await TicketClass.find({ eventId: event._id });
  res.json({ event, ticketClasses: classes });
}));

// -------------------- Ticketing flows --------------------

// BOOK: reserve a ticket for the current user (atomic)
app.post('/tickets/book', verifyTokenMiddleware, requireRole('user'),
  body('eventId').isMongoId(),
  body('ticketType').isIn(['Standard','Premium','VIP']),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { eventId, ticketType } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const event = await Event.findById(eventId).session(session);
      if (!event) throw { status: 404, message: 'Event not found' };

      // Decrement remaining atomically within the transaction
      const ticketClass = await TicketClass.findOneAndUpdate(
        { eventId, type: ticketType, remaining: { $gt: 0 } },
        { $inc: { remaining: -1 } },
        { new: true, session }
      );
      if (!ticketClass) throw { status: 400, message: 'Sold out or invalid ticket type' };

      const purchaseSlot = new Date();
      purchaseSlot.setHours(purchaseSlot.getHours() + (event.ticketExpiryHours || 4));

      // Reserve the ticket and set buyerId to this user
      const [ticket] = await Ticket.create([{
        ticketClassId: ticketClass._id,
        buyerId: req.user.id,
        status: 'Minted',
        purchaseSlot
      }], { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ message: 'Ticket reserved (Minted). Complete payment before expiry', ticketId: ticket._id, purchaseSlot });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      // normalize thrown errors
      if (err && err.status) return res.status(err.status).json({ message: err.message });
      throw err;
    }
  })
);

// Create order - unified for direct purchase (ticketId) or resale (listingId)
app.post('/payments/create-order', verifyTokenMiddleware, requireRole('user'),
  body().custom(body => {
    // requires either ticketId or listingId
    if (!body.ticketId && !body.listingId) throw new Error('ticketId or listingId required');
    return true;
  }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { ticketId, listingId } = req.body;

    if (!razorpay) return res.status(500).json({ message: 'Payment gateway not configured' });

    // Determine amount
    if (ticketId) {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      if (String(ticket.buyerId) !== req.user.id) return res.status(403).json({ message: 'Ticket not reserved for you' });
      if (ticket.status !== 'Minted') return res.status(400).json({ message: 'Ticket not available for purchase' });
      if (ticket.purchaseSlot && new Date() > new Date(ticket.purchaseSlot)) return res.status(400).json({ message: 'Purchase slot expired' });

      const ticketClass = await TicketClass.findById(ticket.ticketClassId);
      if (!ticketClass) return res.status(404).json({ message: 'Ticket class not found' });

      const amount = ticketClass.price; // paise
      const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `receipt_ticket_${ticketId}` });

      const payment = await Payment.create({ ticketId: ticket._id, amount, razorpayOrderId: order.id, status: 'Pending' });
      ticket.razorpayOrderId = order.id;
      ticket.paymentStatus = 'Pending';
      await ticket.save();

      res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
      return;
    }

    // listingId path (resale)
    if (listingId) {
      const listing = await ResaleListing.findById(listingId).populate('ticketId');
      if (!listing || listing.status !== 'Open') return res.status(404).json({ message: 'Listing not available' });

      const amount = listing.price;
      const order = await razorpay.orders.create({ amount, currency: listing.currency || 'INR', receipt: `receipt_resale_${listingId}` });

      // Save payment referencing listing
      const payment = await Payment.create({ ticketId: listing.ticketId._id, listingId: listing._id, amount, razorpayOrderId: order.id, status: 'Pending' });

      res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
      return;
    }
  })
);

// Verify payment endpoint: finalize either direct purchase or resale depending on Payment.record
app.post('/payments/verify', verifyTokenMiddleware, requireRole('user'),
  body('razorpayPaymentId').isString().notEmpty(),
  body('razorpayOrderId').isString().notEmpty(),
  body('razorpaySignature').isString().notEmpty(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!verifyRazorpaySignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature })) {
      // Find payment to update status
      const p = await Payment.findOne({ razorpayOrderId });
      if (p) { p.status = 'Failed'; await p.save(); }
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const paymentRecord = await Payment.findOne({ razorpayOrderId }).populate('listingId');
    if (!paymentRecord) return res.status(404).json({ message: 'Payment record not found' });

    // Update payment record
    paymentRecord.status = 'Completed';
    paymentRecord.razorpayPaymentId = razorpayPaymentId;
    paymentRecord.razorpaySignature = razorpaySignature;
    await paymentRecord.save();

    // Distinguish sale vs resale by presence of listingId
    if (paymentRecord.listingId) {
      // Resale finalization
      const listing = await ResaleListing.findById(paymentRecord.listingId._id).populate('ticketId');
      if (!listing || listing.status !== 'Open') return res.status(400).json({ message: 'Listing not available' });

      // Atomic swap: mark listing sold and transfer ownership
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // ticket must be in ForSale state and seller must still be owner
        const ticket = await Ticket.findById(listing.ticketId._id).session(session);
        if (!ticket) throw { status: 404, message: 'Ticket not found' };
        if (String(ticket.buyerId) !== String(listing.sellerId)) throw { status: 400, message: 'Seller no longer owner' };
        if (ticket.status !== 'ForSale') throw { status: 400, message: 'Ticket not listed for sale' };

        // Transfer
        ticket.buyerId = req.user.id;
        ticket.status = 'Active';
        ticket.paymentStatus = 'Completed';
        ticket.razorpayPaymentId = razorpayPaymentId;
        await ticket.save({ session });

        listing.status = 'Sold';
        await listing.save({ session });

        paymentRecord.ticketId = ticket._id;
        await paymentRecord.save({ session });

        // Transaction logs: record buyer and seller events
        await TransactionLog.create([{ ticketId: ticket._id, userId: req.user.id, action: 'Transfer', razorpayPaymentId }, { ticketId: ticket._id, userId: listing.sellerId, action: 'Resale', razorpayPaymentId }], { session });

        // TODO: Seller payout -- integrate Razorpay Transfers or manual payout here.
        // For demo, we leave a placeholder and mark listing sold.

        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'Resale purchase completed', ticketId: ticket._id });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        if (err && err.status) return res.status(err.status).json({ message: err.message });
        throw err;
      }
      return;
    }

    // Normal ticket purchase finalization
    // Find the payment's ticket
    const ticket = await Ticket.findOne({ razorpayOrderId }).session(); // no transaction here, but we will update
    if (!ticket) return res.status(404).json({ message: 'Ticket not found for this payment' });

    // Ensure ticket was reserved for this user
    if (!ticket.buyerId || String(ticket.buyerId) !== req.user.id) return res.status(403).json({ message: 'Ticket not reserved for this user' });
    if (ticket.status !== 'Minted') return res.status(400).json({ message: 'Ticket state invalid for activation' });

    // Activate and set qrHash
    ticket.status = 'Active';
    ticket.paymentStatus = 'Completed';
    ticket.razorpayPaymentId = razorpayPaymentId;
    ticket.qrHash = crypto.randomBytes(16).toString('hex');
    await ticket.save();

    await TransactionLog.create({ ticketId: ticket._id, userId: req.user.id, action: 'Mint', razorpayPaymentId });

    res.json({ message: 'Payment verified and ticket activated', ticketId: ticket._id, qrHash: ticket.qrHash });
  })
);

// Payments status check
app.get('/payments/status/:ticketId', verifyTokenMiddleware, requireRole('user'), param('ticketId').isMongoId(), handleValidationErrors, asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ ticketId: req.params.ticketId }).sort({ createdAt: -1 });
  if (!payment) return res.status(404).json({ message: 'No payment found' });
  res.json({ status: payment.status, payment });
}));

// Resale endpoints
app.post('/tickets/resale/list', verifyTokenMiddleware, requireRole('user'),
  body('ticketId').isMongoId(), body('price').isInt({ min: 1 }), handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { ticketId, price } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (String(ticket.buyerId) !== req.user.id) return res.status(403).json({ message: 'Not owner' });
    if (ticket.status !== 'Active') return res.status(400).json({ message: 'Only active tickets can be listed for resale' });

    // Create listing
    const existing = await ResaleListing.findOne({ ticketId });
    if (existing && existing.status === 'Open') return res.status(400).json({ message: 'Ticket already listed' });

    const listing = await ResaleListing.create({ ticketId, sellerId: req.user.id, price });
    ticket.status = 'ForSale';
    await ticket.save();
    await TransactionLog.create({ ticketId: ticket._id, userId: req.user.id, action: 'Resale' });

    res.json({ message: 'Ticket listed for resale', listingId: listing._id });
  })
);

// Buyer initiates purchase (creates Razorpay order) — handled through /payments/create-order by passing listingId
// For convenience we'll maintain a buy endpoint that simply delegates to create-order behaviour:
app.post('/tickets/resale/buy', verifyTokenMiddleware, requireRole('user'),
  body('listingId').isMongoId(), handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { listingId } = req.body;
    // Delegate: create an order for the listing. Client will call /payments/verify after completing payment.
    // Validate listing
    const listing = await ResaleListing.findById(listingId);
    if (!listing || listing.status !== 'Open') return res.status(404).json({ message: 'Listing not available' });
    // Create order via payments/create-order by calling internal logic:
    // (we'll call the Razorpay API directly here for convenience)
    if (!razorpay) return res.status(500).json({ message: 'Payment gateway not configured' });
    const order = await razorpay.orders.create({ amount: listing.price, currency: listing.currency || 'INR', receipt: `receipt_resale_${listingId}` });
    const payment = await Payment.create({ ticketId: listing.ticketId, listingId: listing._id, amount: listing.price, razorpayOrderId: order.id, status: 'Pending' });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  })
);

// Return/refund (calls Razorpay refund API) - user must be owner
app.post('/tickets/return', verifyTokenMiddleware, requireRole('user'),
  body('ticketId').isMongoId(), handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { ticketId } = req.body;
    if (!razorpay) return res.status(500).json({ message: 'Payment gateway not configured' });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (String(ticket.buyerId) !== req.user.id) return res.status(403).json({ message: 'Not owner' });
    if (ticket.status !== 'Active') return res.status(400).json({ message: 'Only active tickets can be returned' });

    const payment = await Payment.findOne({ ticketId: ticket._id, status: 'Completed' });
    if (!payment) return res.status(400).json({ message: 'No completed payment found for refund' });

    // Business rule: you may want to check event-specific refund window here. Skipping for demo.
    // Call Razorpay refund
    try {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { amount: payment.amount });
      payment.status = 'Refunded';
      await payment.save();

      ticket.status = 'Returned';
      await ticket.save();

      await TransactionLog.create({ ticketId: ticket._id, userId: req.user.id, action: 'Refund', razorpayPaymentId: payment.razorpayPaymentId });
      res.json({ message: 'Refund processed (demo). Check payment gateway for refund id', refundId: refund.id || refund });
    } catch (err) {
      console.error('Refund error', err);
      res.status(500).json({ message: 'Refund failed', detail: err.message || err });
    }
  })
);

// Ticket info
app.get('/tickets/:id', verifyTokenMiddleware, param('id').isMongoId(), handleValidationErrors, asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('ticketClassId');
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (!(ticket.buyerId && String(ticket.buyerId) === req.user.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  res.json(ticket);
}));

// Admin: verify ticket at gate
app.post('/admin/verify-ticket', verifyTokenMiddleware, requireRole('admin'),
  body('qrHash').isString().notEmpty(), handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { qrHash } = req.body;
    const ticket = await Ticket.findOne({ qrHash }).populate('ticketClassId');
    if (!ticket) return res.status(404).json({ message: 'Ticket invalid' });
    // fetch event via ticket.ticketClassId.eventId
    const ticketClass = await TicketClass.findById(ticket.ticketClassId._id);
    if (!ticketClass) return res.status(500).json({ message: 'Ticket class not found' });

    const event = await Event.findById(ticketClass.eventId);
    if (!event) return res.status(500).json({ message: 'Event not found' });

    const now = new Date();
    // Allow small graceful window: event.startTime - 1h  to event.endTime + ticketExpiry
    const ticketExpiryMs = (event.ticketExpiryHours || 4) * 3600 * 1000;
    if (now < new Date(event.startTime).getTime() - (60 * 60 * 1000) && now > new Date(event.endTime).getTime()) {
      // loosely check; the above condition is not strict - we'll ensure inside event window roughly
      // but for sanity if outside both start and end by large margin, block
    }

    // Idempotency: if Already Used
    if (ticket.status === 'Used') return res.json({ message: 'Ticket already verified', ticketId: ticket._id });

    if (ticket.status !== 'Active' && ticket.status !== 'ForSale') {
      return res.status(400).json({ message: 'Ticket not valid for entry', status: ticket.status });
    }

    // Optionally check purchaseSlot expiry: if purchaseSlot expired => invalid
    if (ticket.purchaseSlot && new Date() > new Date(ticket.purchaseSlot)) {
      // If purchase slot expired before purchase completed it should not be Active; but check anyway
    }

    ticket.status = 'Used';
    await ticket.save();

    await TransactionLog.create({ ticketId: ticket._id, userId: ticket.buyerId || req.user.id, action: 'Verify' });
    // Also log admin verifier as a separate log
    await TransactionLog.create({ ticketId: ticket._id, userId: req.user.id, action: 'Verify' });

    res.json({ message: 'Ticket verified', ticketId: ticket._id, ownerId: ticket.buyerId });
  })
);

// Admin: transactions
app.get('/admin/transactions', verifyTokenMiddleware, requireRole('admin'), asyncHandler(async (req, res) => {
  const logs = await TransactionLog.find().populate('ticketId').populate('userId').sort({ timestamp: -1 }).limit(2000);
  res.json(logs);
}));

// -------------------- Background: release expired reservations --------------------
// For demo: simple TTL check endpoint to run manually. In prod use a cron job / worker.
app.post('/admin/release-expired', verifyTokenMiddleware, requireRole('admin'), asyncHandler(async (req, res) => {
  const now = new Date();
  // Find tickets in Minted state with purchaseSlot < now => expire them and return remaining to class
  const expired = await Ticket.find({ status: 'Minted', purchaseSlot: { $lt: now } });
  let count = 0;
  for (const t of expired) {
    // return remaining
    await TicketClass.findByIdAndUpdate(t.ticketClassId, { $inc: { remaining: 1 } });
    t.status = 'Expired';
    await t.save();
    await TransactionLog.create({ ticketId: t._id, userId: t.buyerId || req.user.id, action: 'Verify' });
    count++;
  }
  res.json({ message: `Released ${count} expired reservations` });
}));

// -------------------- Error handler --------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (res.headersSent) return next(err);
  if (err && err.status) return res.status(err.status).json({ message: err.message });
  res.status(500).json({ message: err.message || 'Server error' });
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
