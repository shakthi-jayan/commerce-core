import getRazorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

export const createOrder = async (amount, receipt, notes = {}) => {
  const razorpay = getRazorpayInstance();
  const options = { amount: Math.round(amount * 100), currency: 'INR', receipt, notes };
  const order = await razorpay.orders.create(options);
  logger.info(`Razorpay order created: ${order.id}`);
  return order;
};

export const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  return expected === signature;
};

export const fetchPayment = async (paymentId) => {
  const razorpay = getRazorpayInstance();
  return razorpay.payments.fetch(paymentId);
};

export const fetchOrder = async (orderId) => {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.fetch(orderId);
};

export const initiateRefund = async (paymentId, amount) => {
  const razorpay = getRazorpayInstance();
  return razorpay.payments.refund(paymentId, { amount: Math.round(amount * 100) });
};
