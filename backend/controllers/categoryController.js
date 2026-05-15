import Category from '../models/Category.js';
import { cacheGet, cacheSet, cacheDeletePattern } from '../config/redis.js';
import { uploadImage, deleteImage } from '../utils/cloudinaryUpload.js';
import { bufferToDataURI } from '../middlewares/uploadMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Parse FormData string values to proper types for Category.
 */
const parseCategoryBody = (body) => {
  const parsed = { ...body };
  // Boolean fields
  if ('isActive' in parsed) {
    parsed.isActive = parsed.isActive === 'true' || parsed.isActive === true;
  }
  // Numeric fields
  if ('sortOrder' in parsed && parsed.sortOrder !== '') {
    parsed.sortOrder = Number(parsed.sortOrder);
  }
  // Clear empty parentCategory (FormData sends empty string)
  if (parsed.parentCategory === '' || parsed.parentCategory === 'null') {
    parsed.parentCategory = null;
  }
  return parsed;
};

/** @desc Get all categories @route GET /api/categories @access Public */
export const getCategories = async (req, res, next) => {
  try {
    const cacheKey = 'categories:all';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const categories = await Category.find({ isActive: true }).populate('subcategories', 'name slug image').sort('sortOrder');
    const response = { success: true, categories };
    await cacheSet(cacheKey, response, 3600);
    res.status(200).json(response);
  } catch (error) { next(error); }
};

/** @desc Get all categories (including inactive) for admin @route GET /api/admin/categories @access Admin */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('subcategories', 'name slug image')
      .sort('sortOrder');
    res.status(200).json({ success: true, categories });
  } catch (error) { next(error); }
};

/** @desc Create category (Admin) @route POST /api/categories @access Admin */
export const createCategory = async (req, res, next) => {
  try {
    const body = parseCategoryBody(req.body);
    if (req.file) {
      const result = await uploadImage(bufferToDataURI(req.file), 'codecommerce/categories');
      body.image = result.url;
      body.imagePublicId = result.publicId;
    }
    const category = await Category.create(body);
    await cacheDeletePattern('categories:*');
    logger.info(`Category created: ${category.name}`);
    res.status(201).json({ success: true, category });
  } catch (error) { next(error); }
};

/** @desc Update category (Admin) @route PUT /api/categories/:id @access Admin */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const body = parseCategoryBody(req.body);

    if (req.file) {
      if (category.imagePublicId) await deleteImage(category.imagePublicId);
      const result = await uploadImage(bufferToDataURI(req.file), 'codecommerce/categories');
      body.image = result.url;
      body.imagePublicId = result.publicId;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    await cacheDeletePattern('categories:*');
    logger.info(`Category updated: ${updated.name}`);
    res.status(200).json({ success: true, category: updated });
  } catch (error) { next(error); }
};

/** @desc Delete category (Admin) @route DELETE /api/categories/:id @access Admin */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check if category has products referencing it
    const Product = (await import('../models/Product.js')).default;
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} product(s) are using this category. Reassign them first.`,
      });
    }

    if (category.imagePublicId) await deleteImage(category.imagePublicId);
    await Category.findByIdAndDelete(req.params.id);
    await cacheDeletePattern('categories:*');
    logger.info(`Category deleted: ${category.name}`);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
};
