import sendEmail from '../utils/sendEmail.js';

export const sendOrderConfirmation = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#6C63FF">Order Confirmed!</h2><p>Hi ${user.name},</p><p>Your order <strong>${order.orderNumber}</strong> has been placed.</p><p><strong>Total:</strong> ₹${order.totalPrice}</p></div>`,
  });
};

export const sendOrderStatusUpdate = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} — Status: ${order.status}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#6C63FF">Order Update</h2><p>Hi ${user.name},</p><p>Your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${order.status}</strong>.</p></div>`,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  await sendEmail({
    to: user.email,
    subject: 'CodeCommerce — Password Reset',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#6C63FF">Password Reset</h2><p>Hi ${user.name},</p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:white;text-decoration:none;border-radius:8px">Reset Password</a><p style="font-size:14px;color:#666">Expires in 30 minutes.</p></div>`,
  });
};
