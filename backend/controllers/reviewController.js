import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { uploadImage, deleteImage } from '../utils/cloudinaryUpload.js';
import { bufferToDataURI } from '../middlewares/uploadMiddleware.js';

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const filter = { product: req.params.productId, status: 'approved' };
    
    if (req.query.rating) {
      filter.rating = req.query.rating;
    }

    let sort = '-createdAt';
    if (req.query.sort === 'highest') sort = '-rating -createdAt';
    if (req.query.sort === 'lowest') sort = 'rating -createdAt';
    if (req.query.sort === 'helpful') sort = '-helpful -createdAt';

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .populate('replies.user', 'name role')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    // Calculate rating breakdown
    const stats = await Review.aggregate([
      { $match: { product: req.params.productId, status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({ 
      success: true, 
      reviews, 
      currentPage: page, 
      totalPages: Math.ceil(total / limit), 
      totalReviews: total,
      ratingBreakdown: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews by a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const [reviews, total] = await Promise.all([
      Review.find({ user: req.params.userId })
        .populate('product', 'name images price')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments({ user: req.params.userId }),
    ]);

    res.status(200).json({ 
      success: true, 
      reviews, 
      currentPage: page, 
      totalPages: Math.ceil(total / limit), 
      totalReviews: total 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single review details
 * @route   GET /api/reviews/:reviewId
 * @access  Public
 */
export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .populate('replies.user', 'name role');
      
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new review
 * @route   POST /api/reviews
 * @access  Private
 */
export const addReview = async (req, res, next) => {
  try {
    const { product, order, rating, title, comment } = req.body;

    // Validate product exists
    const productExists = await Product.findById(product);
    if (!productExists) return res.status(404).json({ success: false, message: 'Product not found' });

    // Validate order exists and belongs to user
    let orderExists;
    if (order) {
      orderExists = await Order.findOne({ _id: order, user: req.user._id, status: 'delivered' });
    } else {
      orderExists = await Order.findOne({ user: req.user._id, status: 'delivered', 'orderItems.product': product });
    }

    if (!orderExists) {
      return res.status(400).json({ success: false, message: 'You can only review products you have purchased and received' });
    }

    // Verify product is in the order
    const productInOrder = orderExists.orderItems.find(item => item.product.toString() === product.toString());
    if (!productInOrder) {
      return res.status(400).json({ success: false, message: 'This product was not in the specified order' });
    }

    const orderIdToUse = orderExists._id;

    // Check if review already exists for this order+product+user
    const existingReview = await Review.findOne({ product, user: req.user._id, order: orderIdToUse });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product for this order' });
    }

    // Handle images if uploaded
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImage(bufferToDataURI(file), 'codecommerce/reviews');
        images.push(result.url);
      }
    }

    const review = await Review.create({
      product,
      user: req.user._id,
      order: orderIdToUse,
      rating: Number(rating),
      title,
      comment,
      images,
      isVerifiedPurchase: true
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update own review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private
 */
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    // Allow updating rating, title, comment
    if (req.body.rating) review.rating = Number(req.body.rating);
    if (req.body.title !== undefined) review.title = req.body.title;
    if (req.body.comment) review.comment = req.body.comment;

    // Handle new images
    if (req.files && req.files.length > 0) {
      // If user uploads new images, we append or replace? Let's just append up to 5
      let newImages = [];
      for (const file of req.files) {
        if (review.images.length + newImages.length >= 5) break;
        const result = await uploadImage(bufferToDataURI(file), 'codecommerce/reviews');
        newImages.push(result.url);
      }
      review.images = [...review.images, ...newImages];
    }
    
    // If user explicitly removes images
    if (req.body.removeImages) {
      const imagesToRemove = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
      review.images = review.images.filter(img => !imagesToRemove.includes(img));
      // Optionally delete from cloudinary here
    }

    await review.save();
    
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete own review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    
    res.status(200).json({ success: true, message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark review as helpful
 * @route   POST /api/reviews/:reviewId/helpful
 * @access  Private
 */
export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const alreadyVoted = review.helpfulUsers.includes(req.user._id);

    if (alreadyVoted) {
      review.helpfulUsers.pull(req.user._id);
      review.helpful -= 1;
    } else {
      review.helpfulUsers.push(req.user._id);
      review.helpful += 1;
    }

    await review.save();
    
    res.status(200).json({ success: true, helpful: review.helpful, isHelpful: !alreadyVoted });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin/vendor reply to review
 * @route   POST /api/reviews/:reviewId/reply
 * @access  Private/Admin
 */
export const replyToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const reply = {
      user: req.user._id,
      comment: req.body.comment
    };

    review.replies.push(reply);
    await review.save();
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin moderate review status
 * @route   PUT /api/reviews/:reviewId/status
 * @access  Private/Admin
 */
export const updateReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.status = req.body.status;
    await review.save();
    
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
