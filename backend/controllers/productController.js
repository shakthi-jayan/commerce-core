import Product from '../models/Product.js';
import Review from '../models/Review.js';
import APIFeatures from '../utils/apiFeatures.js';
import { uploadImage, deleteImage } from '../utils/cloudinaryUpload.js';
import { bufferToDataURI } from '../middlewares/uploadMiddleware.js';
import { cacheGet, cacheSet, cacheDeletePattern, cacheDelete } from '../config/redis.js';
import logger from '../utils/logger.js';

/** @desc Get all products @route GET /api/products @access Public */
export const getProducts = async (req, res, next) => {
  try {
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const features = new APIFeatures(
      Product.find({ isActive: true }).populate('category', 'name slug'), req.query
    ).search().filter().sort().limitFields().paginate();
    await features.countTotal();
    const products = await features.query;
    const response = { success: true, ...features.getPaginationInfo(), products };
    await cacheSet(cacheKey, response, 300);
    res.status(200).json(response);
  } catch (error) { next(error); }
};

/** @desc Get single product @route GET /api/products/:id @access Public */
export const getProduct = async (req, res, next) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' }, options: { sort: { createdAt: -1 }, limit: 10 } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const response = { success: true, product };
    await cacheSet(cacheKey, response, 600);
    res.status(200).json(response);
  } catch (error) { next(error); }
};

/**
 * Parse multipart/form-data string values into their proper JS types.
 * Multer + FormData always sends strings; this converts booleans and numbers.
 */
const parseFormDataBody = (body) => {
  const parsed = { ...body };
  // Boolean fields
  ['isActive', 'isFeatured'].forEach((key) => {
    if (key in parsed) {
      parsed[key] = parsed[key] === 'true' || parsed[key] === true;
    }
  });
  // Numeric fields
  ['price', 'compareAtPrice', 'stock', 'weight'].forEach((key) => {
    if (key in parsed && parsed[key] !== '' && parsed[key] !== undefined) {
      parsed[key] = Number(parsed[key]);
    } else if (key in parsed && parsed[key] === '') {
      delete parsed[key]; // remove empty optional numerics
    }
  });
  // Tags — parse JSON array string if needed
  if (typeof parsed.tags === 'string') {
    try { parsed.tags = JSON.parse(parsed.tags); } catch { parsed.tags = []; }
  }
  return parsed;
};

/** @desc Create product @route POST /api/products @access Admin */
export const createProduct = async (req, res, next) => {
  try {
    const body = parseFormDataBody(req.body);
    body.seller = req.user._id;
    if (req.files && req.files.length > 0) {
      const uploads = [];
      for (const file of req.files) {
        const result = await uploadImage(bufferToDataURI(file), 'codecommerce/products');
        uploads.push({ url: result.url, publicId: result.publicId, isMain: uploads.length === 0 });
      }
      body.images = uploads;
    }
    const product = await Product.create(body);
    const populated = await Product.findById(product._id).populate('category', 'name slug');
    await cacheDeletePattern('products:*');
    logger.info(`Product created: ${product.name}`);
    res.status(201).json({ success: true, product: populated });
  } catch (error) { next(error); }
};

/** @desc Update product @route PUT /api/products/:id @access Admin */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const body = parseFormDataBody(req.body);

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadImage(bufferToDataURI(file), 'codecommerce/products');
        newImages.push({ url: result.url, publicId: result.publicId, isMain: false });
      }
      body.images = [...(product.images || []), ...newImages];
    }
    product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).populate('category', 'name slug');
    await cacheDeletePattern('products:*');
    await cacheDelete(`product:${req.params.id}`);
    res.status(200).json({ success: true, product });
  } catch (error) { next(error); }
};

/** @desc Delete product @route DELETE /api/products/:id @access Admin */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.images?.length > 0) {
      for (const img of product.images) { if (img.publicId) await deleteImage(img.publicId); }
    }
    await Review.deleteMany({ product: product._id });
    await Product.findByIdAndDelete(req.params.id);
    await cacheDeletePattern('products:*');
    await cacheDelete(`product:${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) { next(error); }
};


/** @desc Get top rated @route GET /api/products/top/:count @access Public */
export const getTopProducts = async (req, res, next) => {
  try {
    const count = parseInt(req.params.count, 10) || 5;
    const cacheKey = `products:top:${count}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);
    const products = await Product.find({ isActive: true }).sort({ ratings: -1, numReviews: -1 }).limit(count).populate('category', 'name slug');
    const response = { success: true, products };
    await cacheSet(cacheKey, response, 600);
    res.status(200).json(response);
  } catch (error) { next(error); }
};

/** @desc Get featured @route GET /api/products/featured @access Public */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const cacheKey = 'products:featured';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);
    const products = await Product.find({ isActive: true, isFeatured: true }).sort('-createdAt').limit(12).populate('category', 'name slug');
    const response = { success: true, products };
    await cacheSet(cacheKey, response, 600);
    res.status(200).json(response);
  } catch (error) { next(error); }
};

/** @desc Delete product image @route DELETE /api/products/:id/images/:imageId @access Admin */
export const deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const image = product.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    if (image.publicId) await deleteImage(image.publicId);
    product.images.pull(req.params.imageId);
    await product.save();
    await cacheDeletePattern('products:*');
    await cacheDelete(`product:${req.params.id}`);
    res.status(200).json({ success: true, product });
  } catch (error) { next(error); }
};
