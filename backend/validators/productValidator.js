import { body } from 'express-validator';

/**
 * Validators for product creation.
 * NOTE: When using multipart/form-data (via multer), all body fields arrive
 * as strings. The validators below use .toFloat() / .toInt() sanitisers so
 * that express-validator coerces before validating.
 */
export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('compareAtPrice')
    .optional({ values: 'falsy' })
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .toInt()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required'),
  body('tags')
    .optional()
    .customSanitizer((value) => {
      
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return []; }
      }
      return value;
    })
    .isArray()
    .withMessage('Tags must be an array'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand cannot exceed 100 characters'),
];

/**
 * Validators for product updates. All fields are optional.
 */
export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('price')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('compareAtPrice')
    .optional({ values: 'falsy' })
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  body('stock')
    .optional()
    .toInt()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand cannot exceed 100 characters'),
];

export const reviewValidator = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
];
