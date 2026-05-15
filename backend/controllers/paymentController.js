import crypto from 'crypto';
import getRazorpayInstance from '../config/razorpay.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import logger from '../utils/logger.js';

/** @desc Create Razorpay order @route POST /api/payment/create-order @access Private */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: orderId || `receipt_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    };

    const razorpayOrder = await razorpay.orders.create(options);
    logger.info(`Razorpay order created: ${razorpayOrder.id}`);
    res.status(200).json({ success: true, order: razorpayOrder });
  } catch (error) { 
    logger.error('Razorpay API Error:', error);
    if (error.statusCode === 401) {
      error.statusCode = 502;
      error.message = 'Payment gateway authentication failed. Please check Razorpay keys.';
    }
    next(error); 
  }
};

/** @desc Verify Razorpay payment @route POST /api/payment/verify-payment @access Private */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update order
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'confirmed';
        order.paymentResult = {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'completed',
        };
        await order.save();
      }
    }

    logger.info(`Payment verified: ${razorpay_payment_id}`);
    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) { next(error); }
};

/** @desc Get Razorpay key @route GET /api/payment/get-key @access Public */
export const getRazorpayKey = (req, res) => {
  res.status(200).json({ success: true, key: process.env.RAZORPAY_KEY_ID });
};

/** @desc Razorpay webhook @route POST /api/payment/webhook @access Public */
export const razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const razorpayOrderId = payload.payment.entity.order_id;
      const order = await Order.findOne({ 'paymentResult.razorpayOrderId': razorpayOrderId });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'confirmed';
        order.paymentResult.status = 'completed';
        order.paymentResult.razorpayPaymentId = payload.payment.entity.id;
        await order.save();
        logger.info(`Webhook: Payment captured for order ${order.orderNumber}`);
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      const order = await Order.findOne({ 'paymentResult.razorpayOrderId': razorpayOrderId });
      if (order) {
        order.status = 'cancelled';
        order.paymentResult.status = 'failed';
        await order.save();
        // Restore stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        logger.warn(`Webhook: Payment failed for order ${order.orderNumber}`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};
