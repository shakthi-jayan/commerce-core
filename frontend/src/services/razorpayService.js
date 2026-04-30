import api from './api';

const razorpayService = {
  getKey: () => api.get('/payment/get-key'),
  createOrder: (amount, orderId) => api.post('/payment/create-order', { amount, orderId }),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
};

export default razorpayService;
