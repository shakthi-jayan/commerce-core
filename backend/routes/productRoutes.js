import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getTopProducts, getFeaturedProducts, deleteProductImage } from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadMultiple } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createProductValidator, updateProductValidator, reviewValidator } from '../validators/productValidator.js';

const router = Router();

router.get('/top/:count', getTopProducts);
router.get('/featured', getFeaturedProducts);
router.route('/').get(getProducts).post(protect, authorize('admin'), uploadMultiple, createProductValidator, validate, createProduct);
router.route('/:id').get(getProduct).put(protect, authorize('admin'), uploadMultiple, updateProductValidator, validate, updateProduct).delete(protect, authorize('admin'), deleteProduct);

router.delete('/:id/images/:imageId', protect, authorize('admin'), deleteProductImage);

export default router;
