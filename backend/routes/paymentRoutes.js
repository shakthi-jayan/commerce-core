import { Router } from 'express';
import { createRazorpayOrder, verifyPayment, getRazorpayKey, razorpayWebhook } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();
router.get('/get-key', getRazorpayKey);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', razorpayWebhook); 

export default router;
