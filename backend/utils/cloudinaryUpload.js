import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path or base64 string
 * @param {string} folder - Cloudinary folder
 * @returns {Object} { url, publicId }
 */
export const uploadImage = async (filePath, folder = 'codecommerce') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw new Error('Image upload failed');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary image deleted: ${publicId}`);
  } catch (error) {
    logger.error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Upload multiple images
 * @param {string[]} filePaths - Array of file paths
 * @param {string} folder - Cloudinary folder
 * @returns {Object[]} Array of { url, publicId }
 */
export const uploadMultipleImages = async (filePaths, folder = 'codecommerce/products') => {
  const uploads = filePaths.map((path) => uploadImage(path, folder));
  return Promise.all(uploads);
};
