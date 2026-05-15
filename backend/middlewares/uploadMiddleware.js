import multer from 'multer';
import path from 'path';
import { AppError } from './errorMiddleware.js';

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter — only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpeg, jpg, png, gif, webp, svg) are allowed', 400), false);
  }
};

// Single image upload
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

// Multiple images upload (max 5)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);

// Convert buffer to base64 data URI for Cloudinary
export const bufferToDataURI = (file) => {
  const b64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${b64}`;
};
