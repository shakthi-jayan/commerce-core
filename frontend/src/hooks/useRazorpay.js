import { useState, useCallback } from 'react';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpayHelper';
import razorpayService from '../services/razorpayService';
import { getErrorMessage } from '../utils/helpers';

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = useCallback(async ({ amount, orderId, user, onSuccess, onFailure }) => {
    setLoading(true);
    setError(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load Razorpay SDK');

      const { data } = await razorpayService.createOrder(amount, orderId);
      const razorpayOrder = data.order;

      const response = await openRazorpayCheckout({
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: 'CodeCommerce',
        description: `Order #${orderId}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#6C63FF' },
      });

      // Verify payment
      await razorpayService.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId,
      });

      setLoading(false);
      onSuccess?.(response);
    } catch (err) {
      setLoading(false);
      const msg = getErrorMessage(err);
      setError(msg);
      onFailure?.(msg);
    }
  }, []);

  return { initiatePayment, loading, error };
};

export default useRazorpay;
