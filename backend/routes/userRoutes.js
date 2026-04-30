import { Router } from 'express';
import { updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, toggleWishlist, getWishlist, getAllUsers, getUserById, deleteUser, updateUserRole } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { updateProfileValidator } from '../validators/authValidator.js';

const router = Router();
router.use(protect);


router.put('/profile', uploadSingle, updateProfileValidator, validate, updateProfile);
router.route('/addresses').get(getAddresses).post(addAddress);
router.route('/addresses/:addressId').put(updateAddress).delete(deleteAddress);
router.put('/addresses/:addressId/default', setDefaultAddress);
router.put('/wishlist/:productId', toggleWishlist);
router.get('/wishlist', getWishlist);


router.get('/', authorize('admin'), getAllUsers);
router.route('/:id').get(authorize('admin'), getUserById).delete(authorize('admin'), deleteUser);
router.put('/:id/role', authorize('admin'), updateUserRole);

export default router;
