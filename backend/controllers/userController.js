import User from '../models/User.js';
import { uploadImage, deleteImage } from '../utils/cloudinaryUpload.js';
import { bufferToDataURI } from '../middlewares/uploadMiddleware.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';

/** @desc Update user profile @route PUT /api/users/profile @access Private */
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowed = ['name', 'email', 'phone'];
    allowed.forEach(f => { if (req.body[f]) fieldsToUpdate[f] = req.body[f]; });

    if (req.file) {
      if (req.user.avatarPublicId) await deleteImage(req.user.avatarPublicId);
      const result = await uploadImage(bufferToDataURI(req.file), 'codecommerce/avatars');
      fieldsToUpdate.avatar = result.url;
      fieldsToUpdate.avatarPublicId = result.publicId;
    }

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, { new: true, runValidators: true });
    await cacheDelete(`user:${req.user._id}`);
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

/** @desc Get addresses @route GET /api/users/addresses @access Private */
export const getAddresses = async (req, res, next) => {
  try {
    const cacheKey = `addresses:${req.user._id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json({ success: true, addresses: JSON.parse(cached) });

    const user = await User.findById(req.user._id).select('addresses');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await cacheSet(cacheKey, JSON.stringify(user.addresses), 300);
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
};

/** @desc Add address @route POST /api/users/addresses @access Private */
export const addAddress = async (req, res, next) => {
  try {
    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phoneNumber, isDefault } = req.body;

    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const user = await User.findById(req.user._id);
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    user.addresses.push({ fullName, addressLine1, addressLine2, city, state, postalCode, country: country || 'India', phoneNumber, isDefault: isDefault || user.addresses.length === 0 });
    await user.save();
    await cacheDelete(`addresses:${req.user._id}`);
    await cacheDelete(`user:${req.user._id}`);
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
};

/** @desc Update address @route PUT /api/users/addresses/:addressId @access Private */
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    await cacheDelete(`addresses:${req.user._id}`);
    await cacheDelete(`user:${req.user._id}`);
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
};

/** @desc Delete address @route DELETE /api/users/addresses/:addressId @access Private */
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = addr.isDefault;
    user.addresses.pull(req.params.addressId);

    // If the deleted address was default and there are remaining addresses, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    await cacheDelete(`addresses:${req.user._id}`);
    await cacheDelete(`user:${req.user._id}`);
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
};

/** @desc Set default address @route PUT /api/users/addresses/:addressId/default @access Private */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

    user.addresses.forEach(a => { a.isDefault = false; });
    addr.isDefault = true;
    await user.save();
    await cacheDelete(`addresses:${req.user._id}`);
    await cacheDelete(`user:${req.user._id}`);
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
};

/** @desc Toggle wishlist @route PUT /api/users/wishlist/:productId @access Private */
export const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(req.params.productId);
    const action = idx > -1 ? 'removed' : 'added';
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(req.params.productId);
    await user.save();
    await cacheDelete(`user:${req.user._id}`);
    await cacheDelete(`wishlist:${req.user._id}`);
    res.status(200).json({ success: true, wishlist: user.wishlist, action });
  } catch (error) { next(error); }
};

/** @desc Get wishlist @route GET /api/users/wishlist @access Private */
export const getWishlist = async (req, res, next) => {
  try {
    const cacheKey = `wishlist:${req.user._id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json({ success: true, wishlist: JSON.parse(cached) });

    const user = await User.findById(req.user._id).populate('wishlist', 'name price images ratings numReviews compareAtPrice category');
    await cacheSet(cacheKey, JSON.stringify(user.wishlist), 300);
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) { next(error); }
};

/** @desc Get all users (Admin) @route GET /api/users @access Admin */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const [users, total] = await Promise.all([
      User.find().sort('-createdAt').skip((page - 1) * limit).limit(limit),
      User.countDocuments(),
    ]);
    res.status(200).json({ success: true, users, currentPage: page, totalPages: Math.ceil(total / limit), totalUsers: total });
  } catch (error) { next(error); }
};

/** @desc Get user by ID (Admin) @route GET /api/users/:id @access Admin */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

/** @desc Delete user (Admin) @route DELETE /api/users/:id @access Admin */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

/** @desc Update user role (Admin) @route PUT /api/users/:id/role @access Admin */
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};
