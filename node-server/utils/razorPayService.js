// utils/razorpayService.js
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

await dotenv.config();

// Single Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export class RazorpayService {
  /**
   * Create a Razorpay order
   * @param {string} ticketId - Ticket ID to use as receipt
   * @param {number} amount - Amount in paise (INR * 100)
   * @returns {Promise<Object>} Razorpay order object
   */
  static async createOrder(ticketId, amount) {
    try {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: ticketId,
        payment_capture: 1,
      });
      return { success: true, data: order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   * @returns {boolean} True if signature is valid
   */
  static verifySignature(orderId, paymentId, signature) {
    try {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      return generatedSignature === signature;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  /**
   * Get Razorpay instance (if needed for advanced operations)
   * @returns {Razorpay} Razorpay instance
   */
  static getInstance() {
    return razorpay;
  }
}
