import { Router } from 'express';
import { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Public — only active categories
router.get('/', getCategories);

// Admin — all categories including inactive
router.get('/all', protect, authorize('admin'), getAllCategories);

// Admin CRUD
router.post('/', protect, authorize('admin'), uploadSingle, createCategory);
router.route('/:id')
  .put(protect, authorize('admin'), uploadSingle, updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
