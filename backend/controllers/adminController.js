import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';

/**
 * @desc    Admin login — validates against .env credentials
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Verify against .env credentials
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      logger.warn(`Failed admin login attempt: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Find or create the admin user in DB
    let adminUser = await User.findOne({ email, role: 'admin' });

    if (!adminUser) {
      // Auto-seed admin user on first login
      adminUser = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      logger.info('Admin user auto-seeded on first login');
    }

    const accessToken = generateAccessToken(adminUser._id);
    const refreshToken = generateRefreshToken(adminUser._id);

    const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;
    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    };

    logger.info(`Admin logged in: ${email}`);

    res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
      .json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      revenueAgg,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      monthlyRevenueAgg,
      categoryStatsAgg,
      orderStatusAgg,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([{ $match: { $or: [{ isPaid: true }, { status: 'delivered' }] } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      Order.find().populate('user', 'name email').sort('-createdAt').limit(5).lean(),
      // Monthly revenue for the last 6 months
      Order.aggregate([
        { $match: { $or: [{ isPaid: true }, { status: 'delivered' }], createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Category-wise sales
      Order.aggregate([
        { $match: { $or: [{ isPaid: true }, { status: 'delivered' }] } },
        { $unwind: '$orderItems' },
        { $group: { _id: '$orderItems.name', totalSold: { $sum: '$orderItems.quantity' }, revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      // Order status distribution
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: revenueAgg[0]?.total || 0,
        pendingOrders,
        lowStockProducts,
      },
      recentOrders,
      monthlyRevenue: monthlyRevenueAgg,
      topProducts: categoryStatsAgg,
      orderStatusDistribution: orderStatusAgg,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin get all products (with extra info)
 * @route   GET /api/admin/products
 * @access  Admin
 */
export const adminGetProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sortBy = req.query.sort || '-createdAt';

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortBy).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin update product stock
 * @route   PUT /api/admin/products/:id/stock
 * @access  Admin
 */
export const updateProductStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock value required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin get all orders with filtering
 * @route   GET /api/admin/orders
 * @access  Admin
 */
export const adminGetOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || '';

    const filter = {};
    if (status) filter.status = status;

    const [orders, total, revenueAgg] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter),
      Order.aggregate([{ $match: { $or: [{ isPaid: true }, { status: 'delivered' }] } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);

    res.status(200).json({
      success: true,
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin get order by ID
 * @route   GET /api/admin/orders/:id
 * @access  Admin
 */
export const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images sku');
      
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Admin update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Admin
 */
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if (status === 'cancelled') {
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    const updated = await order.save();
    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin add order note
 * @route   POST /api/admin/orders/:id/notes
 * @access  Admin
 */
export const addOrderNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.notes = order.notes ? `${order.notes}\n${new Date().toLocaleDateString()}: ${note}` : `${new Date().toLocaleDateString()}: ${note}`;
    const updated = await order.save();
    
    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin bulk update order status
 * @route   POST /api/admin/orders/bulk-status
 * @access  Admin
 */
export const bulkUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderIds, status } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No order IDs provided' });
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status, ...(status === 'delivered' ? { isDelivered: true, deliveredAt: Date.now() } : {}) } }
    );

    res.status(200).json({ success: true, message: `Orders updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const adminGetUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const [users, total] = await Promise.all([
      User.find().sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
export const adminUpdateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin bulk delete products
 * @route   POST /api/admin/products/bulk-delete
 * @access  Admin
 */
export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No product IDs provided' });
    }
    
    await Product.deleteMany({ _id: { $in: productIds } });
    res.status(200).json({ success: true, message: 'Products deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin bulk update stock
 * @route   POST /api/admin/products/bulk-stock
 * @access  Admin
 */
export const bulkUpdateStock = async (req, res, next) => {
  try {
    const { updates } = req.body; // [{ id: '...', stock: 10 }, ...]
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No stock updates provided' });
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { stock: update.stock },
      },
    }));

    await Product.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin cancel order
 * @route   PUT /api/admin/orders/:id/cancel
 * @access  Admin
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status === 'cancelled') return res.status(400).json({ success: false, message: 'Order already cancelled' });

    order.status = 'cancelled';
    
    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    const updated = await order.save();
    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin update user status (activate/deactivate)
 * @route   PUT /api/admin/users/:id/status
 * @access  Admin
 */
export const adminUpdateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = isActive;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get all reviews
 * @route   GET /api/admin/reviews
 * @access  Admin
 */
export const adminGetReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalReviews = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ success: true, reviews, totalReviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Admin
 */
export const adminDeleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
