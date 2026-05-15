import { Router } from 'express';
import { 
  getProductReviews, 
  getUserReviews, 
  getReviewById, 
  addReview, 
  updateReview, 
  deleteReview, 
  markHelpful, 
  replyToReview, 
  updateReviewStatus 
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadMultiple } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/user/:userId', getUserReviews);
router.get('/:reviewId', getReviewById);

// Protected routes
router.post('/', protect, uploadMultiple, addReview);
router.put('/:reviewId', protect, uploadMultiple, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.post('/:reviewId/helpful', protect, markHelpful);

// Admin/Vendor routes
router.post('/:reviewId/reply', protect, authorize('admin', 'seller'), replyToReview);
router.put('/:reviewId/status', protect, authorize('admin'), updateReviewStatus);

export default router;
