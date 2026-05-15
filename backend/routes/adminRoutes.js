import { Router } from 'express';
import {
  adminLogin,
  getDashboardStats,
  adminGetProducts,
  updateProductStock,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetUsers,
  adminUpdateUserRole,
  adminDeleteUser,
  getAdminOrderById,
  addOrderNote,
  bulkUpdateOrderStatus,
  bulkDeleteProducts,
  bulkUpdateStock,
  cancelOrder,
  adminUpdateUserStatus,
  adminGetReviews,
  adminDeleteReview,
} from '../controllers/adminController.js';
import {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadMultiple } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';

import {
  exportProducts,
  exportOrders,
  exportUsers,
  generateInvoice
} from '../controllers/adminExportController.js';

const router = Router();

// Public admin login
router.post('/login', adminLogin);

// All routes below require admin auth
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Products — bulk routes MUST come before /:id params to avoid conflict
router.get('/products', adminGetProducts);
router.post('/products', uploadMultiple, createProductValidator, validate, createProduct);
router.post('/products/bulk-delete', bulkDeleteProducts);
router.post('/products/bulk-stock', bulkUpdateStock);
router.get('/products/:id', getProduct);                       // single product for edit form
router.put('/products/:id', uploadMultiple, updateProductValidator, validate, updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id/stock', updateProductStock);
router.delete('/products/:id/images/:imageId', deleteProductImage); // delete a single image

// Orders
router.get('/orders', adminGetOrders);
router.post('/orders/bulk-status', bulkUpdateOrderStatus);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', adminUpdateOrderStatus);
router.post('/orders/:id/notes', addOrderNote);
router.put('/orders/:id/cancel', cancelOrder);
router.get('/orders/:id/invoice', generateInvoice);

// Users
router.get('/users', adminGetUsers);
router.put('/users/:id/role', adminUpdateUserRole);
router.put('/users/:id/status', adminUpdateUserStatus);
router.delete('/users/:id', adminDeleteUser);

// Reviews
router.get('/reviews', adminGetReviews);
router.delete('/reviews/:id', adminDeleteReview);

// Exports
router.get('/export/products', exportProducts);
router.get('/export/orders', exportOrders);
router.get('/export/users', exportUsers);

export default router;
