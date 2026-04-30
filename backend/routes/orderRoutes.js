import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderToPaid, getAllOrders, updateOrderToDelivered, updateOrderStatus } from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createOrderValidator, updateOrderStatusValidator } from '../validators/orderValidator.js';

const router = Router();
router.use(protect);
router.route('/').get(authorize('admin'), getAllOrders).post(createOrderValidator, validate, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', authorize('admin'), updateOrderToDelivered);
router.put('/:id/status', authorize('admin'), updateOrderStatusValidator, validate, updateOrderStatus);

export default router;
