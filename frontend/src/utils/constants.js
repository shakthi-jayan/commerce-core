export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const ORDER_STATUS = {
  PENDING: 'pending', CONFIRMED: 'confirmed', PROCESSING: 'processing',
  SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled', REFUNDED: 'refunded',
};

export const ORDER_STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', processing: 'primary',
  shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'secondary',
};

export const PAYMENT_METHODS = [
  { value: 'razorpay', label: 'Pay Online (Cards, UPI, NetBanking)' },
  { value: 'cod', label: 'Cash on Delivery' },
];

export const ITEMS_PER_PAGE = 12;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; 
