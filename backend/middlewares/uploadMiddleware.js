import multer from 'multer';
import path from 'path';
import { AppError } from './errorMiddleware.js';


const storage = multer.memoryStorage();


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


export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('image');


export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);


export const bufferToDataURI = (file) => {
  const b64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${b64}`;
};
