import { RAZORPAY_KEY_ID } from './constants';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      ...options,
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', (response) => reject(response.error));
    rzp.open();
  });
};
