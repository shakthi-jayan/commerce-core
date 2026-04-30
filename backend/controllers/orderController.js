import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../config/redis.js';
import logger from '../utils/logger.js';
import sendEmail from '../utils/sendEmail.js';

/** @desc Create order @route POST /api/orders @access Private */
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    
    let itemsPrice = 0;
    const verifiedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

      const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
      verifiedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: mainImage?.url || '',
      });
      itemsPrice += product.price * item.quantity;
    }

    const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100; 
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode,
      isPaid: paymentMethod === 'cod' ? false : false,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    });

    
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });
    await cacheDelete(`cart:${req.user._id}`);
    await cacheDeletePattern('products:*');

    
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed — ${order.orderNumber}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#6C63FF">Order Confirmed!</h2><p>Hi ${req.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p><p><strong>Total:</strong> ₹${order.totalPrice}</p><p><strong>Items:</strong> ${order.orderItems.length}</p><a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:white;text-decoration:none;border-radius:8px">View Order</a></div>`,
    }).catch(err => logger.error(`Order email failed: ${err.message}`));

    logger.info(`Order created: ${order.orderNumber} by ${req.user.email}`);
    res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
};

/** @desc Get logged in user orders @route GET /api/orders/my-orders @access Private */
export const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);
    res.status(200).json({ success: true, orders, currentPage: page, totalPages: Math.ceil(total / limit), totalOrders: total });
  } catch (error) { next(error); }
};

/** @desc Get order by ID @route GET /api/orders/:id @access Private */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) { next(error); }
};

/** @desc Update order to paid @route PUT /api/orders/:id/pay @access Private */
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'confirmed';
    order.paymentResult = {
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
      status: 'completed',
    };

    const updatedOrder = await order.save();
    logger.info(`Order paid: ${order.orderNumber}`);
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) { next(error); }
};

/** @desc Get all orders (Admin) @route GET /api/orders @access Admin */
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);

    res.status(200).json({
      success: true, orders, currentPage: page,
      totalPages: Math.ceil(total / limit), totalOrders: total,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) { next(error); }
};

/** @desc Update order to delivered @route PUT /api/orders/:id/deliver @access Admin */
export const updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    const updatedOrder = await order.save();
    logger.info(`Order delivered: ${order.orderNumber}`);
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) { next(error); }
};

/** @desc Update order status @route PUT /api/orders/:id/status @access Admin */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = req.body.status;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.status === 'cancelled') {
      order.cancelReason = req.body.cancelReason;
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      await cacheDeletePattern('products:*');
    }
    const updatedOrder = await order.save();
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) { next(error); }
};
